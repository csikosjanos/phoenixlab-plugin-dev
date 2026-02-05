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
  source: "official";
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
  parseHtml(rawDocs: RawDocs): ParsedContent {
    const { html, source, fetchedAt } = rawDocs;

    if (!html.trim()) {
      return {
        title: "",
        source,
        fetchedAt,
        sections: [],
        rawText: "",
      };
    }

    const title = this.extractTitle(html);
    const sections = this.extractSections(html);
    const rawText = this.stripHtml(html);

    return {
      title,
      source,
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

  private extractTitle(html: string): string {
    // Try h1 first
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Fall back to title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      // Clean up title (often has " - Site Name" suffix)
      return titleMatch[1].split(" - ")[0].trim();
    }

    return "";
  }

  private extractSections(html: string): Section[] {
    const sections: Section[] = [];

    // Match h2 and h3 headings with their content
    const headingPattern = /<h([23])[^>]*>([^<]+)<\/h\1>/gi;
    let match;
    const headings: Array<{ level: number; title: string; index: number; endIndex: number }> = [];

    while ((match = headingPattern.exec(html)) !== null) {
      headings.push({
        level: parseInt(match[1], 10),
        title: match[2].trim(),
        index: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Extract content between headings
    for (let i = 0; i < headings.length; i++) {
      const current = headings[i];
      const next = headings[i + 1];

      const rawContent = html.slice(
        current.endIndex,
        next ? next.index : html.length
      );
      const content = this.stripHtml(rawContent).trim();

      sections.push({
        title: current.title,
        content,
        level: current.level,
      });
    }

    return sections;
  }

  private stripHtml(html: string): string {
    // Remove script and style tags with content
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, " ");

    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // Normalize whitespace
    text = text.replace(/\s+/g, " ").trim();

    return text;
  }
}
