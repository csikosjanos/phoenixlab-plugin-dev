import type { RawDocs, Release } from "./docs-fetcher.ts";

export interface Section {
  title: string;
  content: string;
  level: number;
}

export interface Feature {
  name: string;
  description?: string;
}

export interface ParsedContent {
  title: string;
  source: "llms.txt";
  url: string;
  fetchedAt: Date;
  sections: Section[];
  rawText: string;
}

export interface ParsedRelease {
  version: string;
  name: string;
  publishedAt: Date;
  url: string;
  features: Feature[];
  rawBody: string;
}

export class DocsParser {
  parseDocs(rawDocs: RawDocs): ParsedContent {
    const { content, source, url, fetchedAt } = rawDocs;

    if (!content.trim()) {
      return {
        title: "",
        source,
        url,
        fetchedAt,
        sections: [],
        rawText: "",
      };
    }

    const title = this.extractTitle(content);
    const sections = this.extractSections(content);
    const rawText = content;

    return {
      title,
      source,
      url,
      fetchedAt,
      sections,
      rawText,
    };
  }

  parseReleases(releases: Release[]): ParsedRelease[] {
    return releases.map((release) => ({
      version: release.tagName,
      name: release.name,
      publishedAt: release.publishedAt,
      url: release.url,
      features: this.extractFeatures(release.body),
      rawBody: release.body,
    }));
  }

  extractFeatures(markdown: string): Feature[] {
    if (!markdown.trim()) {
      return [];
    }

    const features: Feature[] = [];

    // Match bullet points with bold text: - **Feature Name**: Description
    const bulletPattern = /^[-*]\s+\*\*([^*]+)\*\*:\s*(.+)$/gm;
    let match;

    while ((match = bulletPattern.exec(markdown)) !== null) {
      features.push({
        name: match[1].trim(),
        description: match[2].trim(),
      });
    }

    return features;
  }

  generateMarkdown(content: ParsedContent): string {
    const lines: string[] = [];

    // Header with metadata
    lines.push(`# ${content.title}`);
    lines.push("");
    lines.push(`> Source: ${content.source}`);
    lines.push(`> URL: ${content.url}`);
    lines.push(`> Fetched: ${content.fetchedAt.toISOString().split("T")[0]}`);
    lines.push("");

    // Sections
    for (const section of content.sections) {
      const heading = "#".repeat(section.level) + " " + section.title;
      lines.push(heading);
      lines.push("");
      lines.push(section.content);
      lines.push("");
    }

    return lines.join("\n");
  }

  private extractTitle(content: string): string {
    // Match # Title at the start of a line
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    return "";
  }

  private extractSections(content: string): Section[] {
    const sections: Section[] = [];
    const lines = content.split("\n");

    // Find all h2 and h3 headings with their positions
    const headings: Array<{ level: number; title: string; lineIndex: number }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        headings.push({ level: 2, title: h2Match[1].trim(), lineIndex: i });
      } else if (h3Match) {
        headings.push({ level: 3, title: h3Match[1].trim(), lineIndex: i });
      }
    }

    // Extract content between headings
    for (let i = 0; i < headings.length; i++) {
      const current = headings[i];
      const next = headings[i + 1];

      const startLine = current.lineIndex + 1;
      const endLine = next ? next.lineIndex : lines.length;

      const contentLines = lines.slice(startLine, endLine);
      const sectionContent = contentLines.join("\n").trim();

      sections.push({
        title: current.title,
        content: sectionContent,
        level: current.level,
      });
    }

    return sections;
  }
}
