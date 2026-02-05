import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CacheManager, type CacheMetadata } from "./cache-manager.ts";
import type { ParsedContent, ParsedRelease } from "./docs-parser.ts";
import { mkdir, rm, readFile, exists } from "node:fs/promises";
import { join } from "node:path";

describe("CacheManager", () => {
  const testCacheDir = "/tmp/phoenixlab-plugin-dev-test-cache";
  const testReferencesDir = "/tmp/phoenixlab-plugin-dev-test-refs";
  let cacheManager: CacheManager;

  beforeEach(async () => {
    await mkdir(testCacheDir, { recursive: true });
    await mkdir(testReferencesDir, { recursive: true });
    cacheManager = new CacheManager(testCacheDir, testReferencesDir);
  });

  afterEach(async () => {
    await rm(testCacheDir, { recursive: true, force: true });
    await rm(testReferencesDir, { recursive: true, force: true });
  });

  describe("writeDocsCache", () => {
    it("should write parsed content to cache file", async () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "official",
        fetchedAt: new Date("2024-01-15T12:00:00Z"),
        sections: [{ title: "Features", content: "Feature list", level: 2 }],
        rawText: "Full text",
      };

      await cacheManager.writeDocsCache(content);

      const cachedFile = join(testCacheDir, "docs.json");
      expect(await exists(cachedFile)).toBe(true);

      const cached = JSON.parse(await readFile(cachedFile, "utf-8"));
      expect(cached.title).toBe("Claude Code");
      expect(cached.sections).toHaveLength(1);
    });

    it("should include cache metadata", async () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "official",
        fetchedAt: new Date("2024-01-15T12:00:00Z"),
        sections: [],
        rawText: "",
      };

      await cacheManager.writeDocsCache(content);

      const cachedFile = join(testCacheDir, "docs.json");
      const cached = JSON.parse(await readFile(cachedFile, "utf-8"));
      expect(cached._metadata).toBeDefined();
      expect(cached._metadata.cachedAt).toBeDefined();
    });
  });

  describe("writeReleasesCache", () => {
    it("should write releases to cache file", async () => {
      const releases: ParsedRelease[] = [
        {
          version: "v1.0.0",
          name: "Release 1.0.0",
          publishedAt: new Date("2024-01-15"),
          url: "https://example.com",
          features: [{ name: "Feature A", description: "Desc A" }],
          rawBody: "Release notes",
        },
      ];

      await cacheManager.writeReleasesCache(releases);

      const cachedFile = join(testCacheDir, "releases.json");
      expect(await exists(cachedFile)).toBe(true);

      const cached = JSON.parse(await readFile(cachedFile, "utf-8"));
      expect(cached.releases).toHaveLength(1);
      expect(cached.releases[0].version).toBe("v1.0.0");
    });
  });

  describe("readDocsCache", () => {
    it("should read cached docs", async () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "official",
        fetchedAt: new Date("2024-01-15T12:00:00Z"),
        sections: [],
        rawText: "",
      };
      await cacheManager.writeDocsCache(content);

      const cached = await cacheManager.readDocsCache();

      expect(cached).not.toBeNull();
      expect(cached!.title).toBe("Claude Code");
    });

    it("should return null if no cache exists", async () => {
      const cached = await cacheManager.readDocsCache();

      expect(cached).toBeNull();
    });
  });

  describe("readReleasesCache", () => {
    it("should read cached releases", async () => {
      const releases: ParsedRelease[] = [
        {
          version: "v1.0.0",
          name: "Release",
          publishedAt: new Date(),
          url: "https://example.com",
          features: [],
          rawBody: "",
        },
      ];
      await cacheManager.writeReleasesCache(releases);

      const cached = await cacheManager.readReleasesCache();

      expect(cached).not.toBeNull();
      expect(cached).toHaveLength(1);
    });

    it("should return null if no cache exists", async () => {
      const cached = await cacheManager.readReleasesCache();

      expect(cached).toBeNull();
    });
  });

  describe("generateReferences", () => {
    it("should generate markdown reference files", async () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "official",
        fetchedAt: new Date("2024-01-15T12:00:00Z"),
        sections: [
          { title: "Getting Started", content: "Start here", level: 2 },
          { title: "Features", content: "Feature list", level: 2 },
        ],
        rawText: "",
      };
      const releases: ParsedRelease[] = [
        {
          version: "v1.0.0",
          name: "Release 1.0.0",
          publishedAt: new Date("2024-01-15"),
          url: "https://example.com",
          features: [{ name: "Feature A", description: "Desc A" }],
          rawBody: "Notes",
        },
      ];

      await cacheManager.generateReferences(content, releases);

      const docsRefFile = join(testReferencesDir, "official-docs.md");
      const releasesRefFile = join(testReferencesDir, "releases.md");

      expect(await exists(docsRefFile)).toBe(true);
      expect(await exists(releasesRefFile)).toBe(true);

      const docsContent = await readFile(docsRefFile, "utf-8");
      expect(docsContent).toContain("Claude Code");
      expect(docsContent).toContain("Getting Started");

      const releasesContent = await readFile(releasesRefFile, "utf-8");
      expect(releasesContent).toContain("v1.0.0");
      expect(releasesContent).toContain("Feature A");
    });
  });

  describe("isCacheValid", () => {
    it("should return false if no cache exists", async () => {
      const isValid = await cacheManager.isCacheValid();

      expect(isValid).toBe(false);
    });

    it("should return true if cache is recent", async () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "official",
        fetchedAt: new Date(),
        sections: [],
        rawText: "",
      };
      await cacheManager.writeDocsCache(content);

      const isValid = await cacheManager.isCacheValid();

      expect(isValid).toBe(true);
    });

    it("should return false if cache is stale", async () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "official",
        fetchedAt: new Date(),
        sections: [],
        rawText: "",
      };
      await cacheManager.writeDocsCache(content);

      // Check with a very short max age (0 hours = always stale)
      const isValid = await cacheManager.isCacheValid(0);

      expect(isValid).toBe(false);
    });
  });

  describe("getCacheMetadata", () => {
    it("should return null if no cache exists", async () => {
      const metadata = await cacheManager.getCacheMetadata();

      expect(metadata).toBeNull();
    });

    it("should return metadata from cache", async () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "official",
        fetchedAt: new Date("2024-01-15T12:00:00Z"),
        sections: [],
        rawText: "",
      };
      await cacheManager.writeDocsCache(content);

      const metadata = await cacheManager.getCacheMetadata();

      expect(metadata).not.toBeNull();
      expect(metadata!.cachedAt).toBeDefined();
    });
  });
});
