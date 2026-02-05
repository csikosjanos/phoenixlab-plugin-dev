#!/usr/bin/env bun
/**
 * CLI wrapper for updating Claude Code documentation.
 * This is a thin wrapper that orchestrates the services.
 */

import { DocsFetcher } from "../../../src/services/docs-fetcher.ts";
import { DocsParser } from "../../../src/services/docs-parser.ts";
import { CacheManager } from "../../../src/services/cache-manager.ts";
import { ReferenceManager } from "../../../src/services/reference-manager.ts";
import {
  ReferenceGeneratorOrchestrator,
  ALL_CATEGORIES,
  type GeneratorCategory,
} from "../../../src/services/reference-generators/index.ts";
import { dirname, join } from "node:path";

// Determine plugin root directory (3 levels up: scripts -> claude-code-reference -> skills -> root)
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(dirname(dirname(import.meta.path))));
const skillDir = dirname(dirname(import.meta.path));
const cacheDir = join(skillDir, "cache");
const referencesDir = join(skillDir, "references");

// Parse arguments
const args = process.argv.slice(2);
const forceUpdate = args.includes("--force") || args.includes("-f");
const skipReleases = args.includes("--skip-releases");
const skipDocs = args.includes("--skip-docs");

// Parse --regenerate-refs argument
const regenerateRefsArg = args.find((a) => a.startsWith("--regenerate-refs"));
const regenerateRefs = regenerateRefsArg !== undefined;
const regenerateCategory = regenerateRefsArg?.includes("=")
  ? (regenerateRefsArg.split("=")[1] as GeneratorCategory)
  : null;

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
      console.log("Fetching official docs from code.claude.com/docs/llms.txt...");
      const rawDocs = await fetcher.fetchOfficialDocs();
      parsedDocs = parser.parseDocs(rawDocs);
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
      console.log(`  ✓ Generated: references/releases.md`);
    }
  }

  console.log("\n✓ Documentation update complete!");
}

async function regenerateReferences() {
  const refManager = new ReferenceManager(referencesDir);
  const orchestrator = new ReferenceGeneratorOrchestrator(refManager);

  if (regenerateCategory) {
    // Validate category
    if (!ALL_CATEGORIES.includes(regenerateCategory)) {
      console.error(`Invalid category: ${regenerateCategory}`);
      console.error(`Valid categories: ${ALL_CATEGORIES.join(", ")}`);
      process.exit(1);
    }

    console.log(`Regenerating references for category: ${regenerateCategory}...\n`);
    const result = await orchestrator.generateCategory(regenerateCategory);

    if (result.success) {
      console.log(`  ✓ Generated ${result.filesGenerated} files in ${result.category}/`);
    } else {
      console.error(`  ✗ Failed: ${result.error}`);
      process.exit(1);
    }
  } else {
    console.log("Regenerating all reference files...\n");
    const results = await orchestrator.generateAll();

    let totalFiles = 0;
    let failed = 0;

    for (const result of results) {
      if (result.success) {
        console.log(`  ✓ ${result.category}/: ${result.filesGenerated} files`);
        totalFiles += result.filesGenerated || 0;
      } else {
        console.error(`  ✗ ${result.category}: ${result.error}`);
        failed++;
      }
    }

    console.log(`\nTotal: ${totalFiles} files generated`);
    if (failed > 0) {
      console.error(`${failed} categories failed`);
      process.exit(1);
    }
  }

  console.log("\n✓ Reference regeneration complete!");
}

// Main entry point
if (regenerateRefs) {
  regenerateReferences().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
} else {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
