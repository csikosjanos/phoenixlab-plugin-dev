#!/usr/bin/env bun
/**
 * CLI wrapper for updating Claude Code documentation.
 * This is a thin wrapper that orchestrates the services.
 */

import { DocsFetcher } from "../src/services/docs-fetcher.ts";
import { DocsParser } from "../src/services/docs-parser.ts";
import { CacheManager } from "../src/services/cache-manager.ts";
import { dirname, join } from "node:path";

// Determine plugin root directory
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(import.meta.path));
const cacheDir = join(pluginRoot, "skills", "claude-code-updates", "cache");
const referencesDir = join(pluginRoot, "skills", "claude-code-updates", "references");

// Parse arguments
const args = process.argv.slice(2);
const forceUpdate = args.includes("--force") || args.includes("-f");
const skipReleases = args.includes("--skip-releases");
const skipDocs = args.includes("--skip-docs");

async function main() {
  const fetcher = new DocsFetcher();
  const parser = new DocsParser();
  const cacheManager = new CacheManager(cacheDir, referencesDir);

  // Check if cache is still valid (unless forced)
  if (!forceUpdate && (await cacheManager.isCacheValid())) {
    const metadata = await cacheManager.getCacheMetadata();
    console.log(`Cache is still valid (cached at ${metadata?.cachedAt})`);
    console.log("Use --force to update anyway");
    return;
  }

  console.log("Updating Claude Code documentation...\n");

  let parsedDocs = null;
  let parsedReleases: Awaited<ReturnType<DocsParser["parseReleases"]>> = [];

  // Fetch and parse official docs
  if (!skipDocs) {
    try {
      console.log("Fetching official docs from docs.anthropic.com...");
      const rawDocs = await fetcher.fetchOfficialDocs();
      parsedDocs = parser.parseHtml(rawDocs);
      await cacheManager.writeDocsCache(parsedDocs);
      console.log(`  ✓ Fetched: ${parsedDocs.title}`);
      console.log(`  ✓ Found ${parsedDocs.sections.length} sections`);
    } catch (error) {
      console.error(`  ✗ Failed to fetch official docs: ${error}`);
    }
  }

  // Fetch and parse GitHub releases
  if (!skipReleases) {
    try {
      console.log("\nFetching releases from GitHub...");
      const releases = await fetcher.fetchGitHubReleases(10);
      parsedReleases = parser.parseReleases(releases);
      await cacheManager.writeReleasesCache(parsedReleases);
      console.log(`  ✓ Fetched ${parsedReleases.length} releases`);

      if (parsedReleases.length > 0) {
        console.log(`  ✓ Latest: ${parsedReleases[0].version} (${parsedReleases[0].publishedAt.toISOString().split("T")[0]})`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to fetch releases: ${error}`);
    }
  }

  // Generate reference files
  if (parsedDocs || parsedReleases.length > 0) {
    console.log("\nGenerating reference files...");

    // If we skipped docs, try to read from cache
    if (!parsedDocs) {
      parsedDocs = await cacheManager.readDocsCache();
    }

    // If we skipped releases, try to read from cache
    if (parsedReleases.length === 0) {
      parsedReleases = (await cacheManager.readReleasesCache()) || [];
    }

    if (parsedDocs) {
      await cacheManager.generateReferences(parsedDocs, parsedReleases);
      console.log(`  ✓ Generated: references/official-docs.md`);
      console.log(`  ✓ Generated: references/releases.md`);
    }
  }

  console.log("\n✓ Documentation update complete!");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
