import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname, relative } from "node:path";

export interface ValidationError {
  rule: string;
  message: string;
}

export interface ValidationWarning {
  rule: string;
  message: string;
}

export interface ValidationResult {
  path: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

const SIZE_WARN_THRESHOLD = 2 * 1024; // 2KB
const SIZE_ERROR_THRESHOLD = 3 * 1024; // 3KB
const EXCLUDED_FILES = ["README.md", "index.md", "releases.md"];

/**
 * Validates progressive disclosure reference files against our rules.
 */
export class ReferenceValidator {
  constructor(private referencesDir: string) {}

  /**
   * Validates a single reference file.
   * @param relativePath Path relative to referencesDir
   */
  async validateFile(relativePath: string): Promise<ValidationResult> {
    const fullPath = join(this.referencesDir, relativePath);
    const content = await readFile(fullPath, "utf-8");
    const fileStats = await stat(fullPath);

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Size validation
    if (fileStats.size > SIZE_ERROR_THRESHOLD) {
      errors.push({
        rule: "size",
        message: `File exceeds 3KB (${(fileStats.size / 1024).toFixed(1)}KB)`,
      });
    } else if (fileStats.size > SIZE_WARN_THRESHOLD) {
      warnings.push({
        rule: "size",
        message: `File exceeds 2KB (${(fileStats.size / 1024).toFixed(1)}KB), consider splitting`,
      });
    }

    // Table-first rule: must contain at least one markdown table
    const hasTable = /\|[^\n]+\|[\s\n]+\|[-:|\s]+\|/m.test(content);
    if (!hasTable) {
      errors.push({
        rule: "table-first",
        message: "File must contain at least one markdown table",
      });
    }

    // Single h1 heading rule (strip code blocks first to avoid matching # comments)
    const contentWithoutCodeBlocks = this.stripCodeBlocks(content);
    const h1Matches = contentWithoutCodeBlocks.match(/^# .+$/gm);
    if (!h1Matches || h1Matches.length === 0) {
      errors.push({
        rule: "single-h1",
        message: "File has no h1 heading (must have exactly one)",
      });
    } else if (h1Matches.length > 1) {
      errors.push({
        rule: "single-h1",
        message: `File has multiple h1 headings (${h1Matches.length}), must have exactly one`,
      });
    }

    // Internal link validation
    const linkErrors = await this.validateInternalLinks(content, relativePath);
    errors.push(...linkErrors);

    return {
      path: relativePath,
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates all markdown files in the references directory.
   */
  async validateAll(): Promise<ValidationResult[]> {
    const files = await this.findMarkdownFiles(this.referencesDir);
    const results: ValidationResult[] = [];

    for (const file of files) {
      const relativePath = relative(this.referencesDir, file);

      // Skip excluded files
      const filename = relativePath.split("/").pop() || "";
      if (EXCLUDED_FILES.includes(filename)) {
        continue;
      }

      results.push(await this.validateFile(relativePath));
    }

    return results;
  }

  /**
   * Validates only files in a specific category subdirectory.
   */
  async validateCategory(category: string): Promise<ValidationResult[]> {
    const categoryPath = join(this.referencesDir, category);

    try {
      await stat(categoryPath);
    } catch {
      return [];
    }

    const files = await this.findMarkdownFiles(categoryPath);
    const results: ValidationResult[] = [];

    for (const file of files) {
      const relativePath = relative(this.referencesDir, file);

      const filename = relativePath.split("/").pop() || "";
      if (EXCLUDED_FILES.includes(filename)) {
        continue;
      }

      results.push(await this.validateFile(relativePath));
    }

    return results;
  }

  /**
   * Recursively finds all .md files in a directory.
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this.findMarkdownFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Strips fenced code blocks from content to avoid matching patterns inside code.
   */
  private stripCodeBlocks(content: string): string {
    // Remove fenced code blocks (```...```)
    return content.replace(/```[\s\S]*?```/g, "");
  }

  /**
   * Validates internal markdown links point to existing files.
   */
  private async validateInternalLinks(content: string, relativePath: string): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Match markdown links: [text](path)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkPath = match[2];

      // Skip external links
      if (linkPath.startsWith("http://") || linkPath.startsWith("https://")) {
        continue;
      }

      // Skip anchor links
      if (linkPath.startsWith("#")) {
        continue;
      }

      // Resolve the link path relative to the current file
      const fileDir = join(this.referencesDir, dirname(relativePath));
      const targetPath = join(fileDir, linkPath);

      try {
        await stat(targetPath);
      } catch {
        errors.push({
          rule: "valid-links",
          message: `Broken internal link: ${linkPath}`,
        });
      }
    }

    return errors;
  }
}
