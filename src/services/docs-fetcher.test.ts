import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { DocsFetcher, type RawDocs, type Release } from "./docs-fetcher.ts";

describe("DocsFetcher", () => {
  let fetcher: DocsFetcher;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetcher = new DocsFetcher();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("fetchOfficialDocs", () => {
    it("should fetch docs from the llms.txt URL", async () => {
      const mockContent = "# Claude Code\n\nDocumentation content";
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(mockContent, { status: 200 }))
      );

      const result = await fetcher.fetchOfficialDocs();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://code.claude.com/docs/llms.txt",
        expect.any(Object)
      );
      expect(result.content).toBe(mockContent);
      expect(result.source).toBe("llms.txt");
      expect(result.url).toBe("https://code.claude.com/docs/llms.txt");
      expect(result.fetchedAt).toBeInstanceOf(Date);
    });

    it("should throw on non-200 response", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response("Not Found", { status: 404 }))
      );

      expect(fetcher.fetchOfficialDocs()).rejects.toThrow("Failed to fetch official docs: 404");
    });

    it("should throw on network error", async () => {
      globalThis.fetch = mock(() =>
        Promise.reject(new Error("Network error"))
      );

      expect(fetcher.fetchOfficialDocs()).rejects.toThrow("Network error");
    });
  });

  describe("fetchGitHubReleases", () => {
    it("should fetch releases from GitHub API", async () => {
      const mockReleases = [
        {
          tag_name: "v1.0.0",
          name: "Release 1.0.0",
          body: "Release notes for 1.0.0",
          published_at: "2024-01-15T00:00:00Z",
          html_url: "https://github.com/anthropics/claude-code/releases/tag/v1.0.0",
        },
        {
          tag_name: "v0.9.0",
          name: "Release 0.9.0",
          body: "Release notes for 0.9.0",
          published_at: "2024-01-01T00:00:00Z",
          html_url: "https://github.com/anthropics/claude-code/releases/tag/v0.9.0",
        },
      ];
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(mockReleases), { status: 200 }))
      );

      const result = await fetcher.fetchGitHubReleases();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/anthropics/claude-code/releases",
        expect.any(Object)
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        tagName: "v1.0.0",
        name: "Release 1.0.0",
        body: "Release notes for 1.0.0",
        publishedAt: new Date("2024-01-15T00:00:00Z"),
        url: "https://github.com/anthropics/claude-code/releases/tag/v1.0.0",
      });
    });

    it("should return empty array on 404", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response("Not Found", { status: 404 }))
      );

      const result = await fetcher.fetchGitHubReleases();

      expect(result).toEqual([]);
    });

    it("should throw on other non-200 responses", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response("Server Error", { status: 500 }))
      );

      expect(fetcher.fetchGitHubReleases()).rejects.toThrow("Failed to fetch GitHub releases: 500");
    });

    it("should limit to most recent releases", async () => {
      const manyReleases = Array.from({ length: 50 }, (_, i) => ({
        tag_name: `v1.${i}.0`,
        name: `Release 1.${i}.0`,
        body: `Notes ${i}`,
        published_at: new Date(2024, 0, i + 1).toISOString(),
        html_url: `https://github.com/anthropics/claude-code/releases/tag/v1.${i}.0`,
      }));
      globalThis.fetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify(manyReleases), { status: 200 }))
      );

      const result = await fetcher.fetchGitHubReleases(10);

      expect(result).toHaveLength(10);
    });
  });

  describe("fetchAll", () => {
    it("should fetch both docs and releases", async () => {
      const mockContent = "# Claude Code\n\nDocs content";
      const mockReleases = [
        {
          tag_name: "v1.0.0",
          name: "Release 1.0.0",
          body: "Notes",
          published_at: "2024-01-15T00:00:00Z",
          html_url: "https://github.com/anthropics/claude-code/releases/tag/v1.0.0",
        },
      ];

      let callCount = 0;
      globalThis.fetch = mock((url: string) => {
        callCount++;
        if (url.includes("code.claude.com")) {
          return Promise.resolve(new Response(mockContent, { status: 200 }));
        }
        return Promise.resolve(new Response(JSON.stringify(mockReleases), { status: 200 }));
      });

      const result = await fetcher.fetchAll();

      expect(result.docs.content).toBe(mockContent);
      expect(result.releases).toHaveLength(1);
      expect(callCount).toBe(2);
    });
  });
});
