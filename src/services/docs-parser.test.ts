import { describe, it, expect, beforeEach } from "bun:test";
import {
  DocsParser,
  type ParsedContent,
  type Feature,
  type Section,
} from "./docs-parser.ts";
import type { RawDocs, Release } from "./docs-fetcher.ts";

describe("DocsParser", () => {
  let parser: DocsParser;

  beforeEach(() => {
    parser = new DocsParser();
  });

  describe("parseDocs", () => {
    it("should extract title from markdown", () => {
      const content = `# Claude Code

Some content here.
`;
      const rawDocs: RawDocs = {
        content,
        source: "llms.txt",
        url: "https://code.claude.com/docs/llms.txt",
        fetchedAt: new Date("2024-01-15"),
      };

      const result = parser.parseDocs(rawDocs);

      expect(result.title).toBe("Claude Code");
      expect(result.source).toBe("llms.txt");
      expect(result.url).toBe("https://code.claude.com/docs/llms.txt");
      expect(result.fetchedAt).toEqual(new Date("2024-01-15"));
    });

    it("should extract sections from headings", () => {
      const content = `# Claude Code

## Getting Started

Start content here.

## Features

Features content here.

### Sub Feature

Sub feature content.
`;
      const rawDocs: RawDocs = {
        content,
        source: "llms.txt",
        url: "https://code.claude.com/docs/llms.txt",
        fetchedAt: new Date(),
      };

      const result = parser.parseDocs(rawDocs);

      expect(result.sections.length).toBeGreaterThanOrEqual(2);
      expect(result.sections.some((s) => s.title === "Getting Started")).toBe(true);
      expect(result.sections.some((s) => s.title === "Features")).toBe(true);
    });

    it("should preserve raw text content", () => {
      const content = `# Claude Code

This is **bold** and *italic* text.

- Item 1
- Item 2
`;
      const rawDocs: RawDocs = {
        content,
        source: "llms.txt",
        url: "https://code.claude.com/docs/llms.txt",
        fetchedAt: new Date(),
      };

      const result = parser.parseDocs(rawDocs);

      expect(result.rawText).toContain("This is **bold** and *italic* text");
      expect(result.rawText).toContain("Item 1");
      expect(result.rawText).toContain("Item 2");
    });

    it("should handle empty content gracefully", () => {
      const content = "";
      const rawDocs: RawDocs = {
        content,
        source: "llms.txt",
        url: "https://code.claude.com/docs/llms.txt",
        fetchedAt: new Date(),
      };

      const result = parser.parseDocs(rawDocs);

      expect(result.title).toBe("");
      expect(result.sections).toEqual([]);
      expect(result.rawText).toBe("");
    });

    it("should extract section content between headings", () => {
      const content = `# Claude Code

## Installation

Run npm install to get started.

## Usage

Import and use the module.
`;
      const rawDocs: RawDocs = {
        content,
        source: "llms.txt",
        url: "https://code.claude.com/docs/llms.txt",
        fetchedAt: new Date(),
      };

      const result = parser.parseDocs(rawDocs);

      const installSection = result.sections.find((s) => s.title === "Installation");
      expect(installSection).toBeDefined();
      expect(installSection!.content).toContain("Run npm install");
      expect(installSection!.level).toBe(2);
    });
  });

  describe("parseReleases", () => {
    it("should parse releases into structured format", () => {
      const releases: Release[] = [
        {
          tagName: "v1.0.0",
          name: "Claude Code 1.0.0",
          body: "## What's New\n- Feature A\n- Feature B\n\n## Bug Fixes\n- Fix 1",
          publishedAt: new Date("2024-01-15"),
          url: "https://github.com/anthropics/claude-code/releases/tag/v1.0.0",
        },
      ];

      const result = parser.parseReleases(releases);

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe("v1.0.0");
      expect(result[0].name).toBe("Claude Code 1.0.0");
      expect(result[0].publishedAt).toEqual(new Date("2024-01-15"));
      expect(result[0].url).toBe("https://github.com/anthropics/claude-code/releases/tag/v1.0.0");
    });

    it("should extract features from release body", () => {
      const releases: Release[] = [
        {
          tagName: "v1.0.0",
          name: "Release",
          body: "## What's New\n- **Feature A**: Description A\n- **Feature B**: Description B",
          publishedAt: new Date(),
          url: "https://example.com",
        },
      ];

      const result = parser.parseReleases(releases);

      expect(result[0].features.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle empty releases array", () => {
      const result = parser.parseReleases([]);

      expect(result).toEqual([]);
    });

    it("should handle release with empty body", () => {
      const releases: Release[] = [
        {
          tagName: "v1.0.0",
          name: "Release",
          body: "",
          publishedAt: new Date(),
          url: "https://example.com",
        },
      ];

      const result = parser.parseReleases(releases);

      expect(result).toHaveLength(1);
      expect(result[0].features).toEqual([]);
      expect(result[0].rawBody).toBe("");
    });
  });

  describe("extractFeatures", () => {
    it("should extract features from markdown list", () => {
      const markdown = `
## Features
- **Code Editing**: Edit code with natural language
- **File Search**: Find files quickly
- **Terminal**: Run shell commands
      `;

      const features = parser.extractFeatures(markdown);

      expect(features.length).toBeGreaterThanOrEqual(1);
      expect(features.some((f) => f.name.includes("Code Editing") || f.description?.includes("Edit code"))).toBe(true);
    });

    it("should handle markdown without features", () => {
      const markdown = "Just some text without features.";

      const features = parser.extractFeatures(markdown);

      expect(features).toEqual([]);
    });

    it("should extract features from bullet points with bold text", () => {
      const markdown = "- **New Feature**: This is a new feature description";

      const features = parser.extractFeatures(markdown);

      expect(features).toHaveLength(1);
      expect(features[0].name).toBe("New Feature");
      expect(features[0].description).toBe("This is a new feature description");
    });
  });

  describe("generateMarkdown", () => {
    it("should generate markdown from parsed content", () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "llms.txt",
        url: "https://code.claude.com/docs/llms.txt",
        fetchedAt: new Date("2024-01-15T12:00:00Z"),
        sections: [
          { title: "Getting Started", content: "Start here", level: 2 },
          { title: "Features", content: "Feature list", level: 2 },
        ],
        rawText: "Full text content",
      };

      const markdown = parser.generateMarkdown(content);

      expect(markdown).toContain("# Claude Code");
      expect(markdown).toContain("## Getting Started");
      expect(markdown).toContain("Start here");
      expect(markdown).toContain("## Features");
      expect(markdown).toContain("Feature list");
    });

    it("should include metadata header with URL", () => {
      const content: ParsedContent = {
        title: "Claude Code",
        source: "llms.txt",
        url: "https://code.claude.com/docs/llms.txt",
        fetchedAt: new Date("2024-01-15T12:00:00Z"),
        sections: [],
        rawText: "",
      };

      const markdown = parser.generateMarkdown(content);

      expect(markdown).toContain("Source: llms.txt");
      expect(markdown).toContain("https://code.claude.com/docs/llms.txt");
      expect(markdown).toContain("2024-01-15");
    });
  });
});
