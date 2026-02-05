import { mkdir, readFile, writeFile, exists } from "node:fs/promises";
import { join } from "node:path";
import type { ParsedContent, ParsedRelease } from "./docs-parser.ts";

export interface CacheMetadata {
  cachedAt: string;
  version: string;
}

interface DocsCacheData extends ParsedContent {
  _metadata: CacheMetadata;
}

interface ReleasesCacheData {
  releases: ParsedRelease[];
  _metadata: CacheMetadata;
}

const DEFAULT_MAX_AGE_HOURS = 24;
const CACHE_VERSION = "1.0.0";

export class CacheManager {
  constructor(
    private cacheDir: string,
    private referencesDir: string
  ) {}

  async writeDocsCache(content: ParsedContent): Promise<void> {
    await mkdir(this.cacheDir, { recursive: true });

    const cacheData: DocsCacheData = {
      ...content,
      fetchedAt: content.fetchedAt,
      _metadata: {
        cachedAt: new Date().toISOString(),
        version: CACHE_VERSION,
      },
    };

    const cachePath = join(this.cacheDir, "docs.json");
    await writeFile(cachePath, JSON.stringify(cacheData, null, 2));
  }

  async writeReleasesCache(releases: ParsedRelease[]): Promise<void> {
    await mkdir(this.cacheDir, { recursive: true });

    const cacheData: ReleasesCacheData = {
      releases,
      _metadata: {
        cachedAt: new Date().toISOString(),
        version: CACHE_VERSION,
      },
    };

    const cachePath = join(this.cacheDir, "releases.json");
    await writeFile(cachePath, JSON.stringify(cacheData, null, 2));
  }

  async readDocsCache(): Promise<ParsedContent | null> {
    const cachePath = join(this.cacheDir, "docs.json");

    if (!(await exists(cachePath))) {
      return null;
    }

    const data = JSON.parse(await readFile(cachePath, "utf-8")) as DocsCacheData;
    const { _metadata, ...content } = data;

    return {
      ...content,
      fetchedAt: new Date(content.fetchedAt),
    };
  }

  async readReleasesCache(): Promise<ParsedRelease[] | null> {
    const cachePath = join(this.cacheDir, "releases.json");

    if (!(await exists(cachePath))) {
      return null;
    }

    const data = JSON.parse(await readFile(cachePath, "utf-8")) as ReleasesCacheData;

    return data.releases.map((release) => ({
      ...release,
      publishedAt: new Date(release.publishedAt),
    }));
  }

  async generateReferences(
    content: ParsedContent,
    releases: ParsedRelease[]
  ): Promise<void> {
    await mkdir(this.referencesDir, { recursive: true });

    // Generate official docs reference
    const docsMarkdown = this.generateDocsMarkdown(content);
    await writeFile(join(this.referencesDir, "official-docs.md"), docsMarkdown);

    // Generate releases reference
    const releasesMarkdown = this.generateReleasesMarkdown(releases);
    await writeFile(join(this.referencesDir, "releases.md"), releasesMarkdown);
  }

  async isCacheValid(maxAgeHours: number = DEFAULT_MAX_AGE_HOURS): Promise<boolean> {
    const metadata = await this.getCacheMetadata();

    if (!metadata) {
      return false;
    }

    const cachedAt = new Date(metadata.cachedAt);
    const now = new Date();
    const ageMs = now.getTime() - cachedAt.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);

    return ageHours < maxAgeHours;
  }

  async getCacheMetadata(): Promise<CacheMetadata | null> {
    const cachePath = join(this.cacheDir, "docs.json");

    if (!(await exists(cachePath))) {
      return null;
    }

    const data = JSON.parse(await readFile(cachePath, "utf-8")) as DocsCacheData;
    return data._metadata;
  }

  private generateDocsMarkdown(content: ParsedContent): string {
    const lines: string[] = [];

    lines.push(`# ${content.title}`);
    lines.push("");
    lines.push(`> Source: ${content.source}`);
    lines.push(`> URL: ${content.url}`);
    lines.push(`> Last fetched: ${content.fetchedAt.toISOString().split("T")[0]}`);
    lines.push("");

    for (const section of content.sections) {
      const heading = "#".repeat(section.level) + " " + section.title;
      lines.push(heading);
      lines.push("");
      if (section.content) {
        lines.push(section.content);
        lines.push("");
      }
    }

    return lines.join("\n");
  }

  private generateReleasesMarkdown(releases: ParsedRelease[]): string {
    const lines: string[] = [];

    lines.push("# Claude Code Releases");
    lines.push("");
    lines.push(`> Last updated: ${new Date().toISOString().split("T")[0]}`);
    lines.push("");

    for (const release of releases) {
      lines.push(`## ${release.version} - ${release.name}`);
      lines.push("");
      lines.push(`**Released:** ${release.publishedAt.toISOString().split("T")[0]}`);
      lines.push(`**URL:** ${release.url}`);
      lines.push("");

      if (release.features.length > 0) {
        lines.push("### Features");
        lines.push("");
        for (const feature of release.features) {
          lines.push(`- **${feature.name}**: ${feature.description || ""}`);
        }
        lines.push("");
      }

      if (release.rawBody) {
        lines.push("### Release Notes");
        lines.push("");
        lines.push(release.rawBody);
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    }

    return lines.join("\n");
  }
}
