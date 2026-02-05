import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

export interface TDDValidationResult {
  path: string;
  hasTest: boolean;
  testPath: string | null;
  issues: string[];
}

const EXCLUDED_FILES = ["index.ts"];

/**
 * Validates that all service files have co-located test files.
 */
export class TDDValidator {
  constructor(private servicesDir: string) {}

  /**
   * Validates all service files in the directory.
   */
  async validateAll(): Promise<TDDValidationResult[]> {
    const serviceFiles = await this.findServiceFiles(this.servicesDir);
    const results: TDDValidationResult[] = [];

    for (const serviceFile of serviceFiles) {
      const relativePath = relative(this.servicesDir, serviceFile);
      const result = await this.validateServiceFile(relativePath);
      results.push(result);
    }

    return results;
  }

  /**
   * Returns a list of service files that are missing tests.
   */
  async findMissingTests(): Promise<string[]> {
    const results = await this.validateAll();
    return results.filter((r) => !r.hasTest).map((r) => r.path);
  }

  /**
   * Validates a single service file.
   */
  private async validateServiceFile(relativePath: string): Promise<TDDValidationResult> {
    const issues: string[] = [];

    // Determine expected test file path
    const testPath = relativePath.replace(/\.ts$/, ".test.ts");
    const fullTestPath = join(this.servicesDir, testPath);

    // Check if test file exists
    let hasTest = false;
    try {
      await stat(fullTestPath);
      hasTest = true;
    } catch {
      issues.push(`Test file missing: ${testPath}`);
    }

    // If test exists, check if it has actual tests
    if (hasTest) {
      const testContent = await readFile(fullTestPath, "utf-8");
      const hasTestBlocks = /\b(describe|it|test)\s*\(/.test(testContent);

      if (!hasTestBlocks) {
        issues.push(`Test file appears to have no tests (no describe/it/test blocks)`);
      }
    }

    return {
      path: relativePath,
      hasTest,
      testPath: hasTest ? testPath : null,
      issues,
    };
  }

  /**
   * Recursively finds all TypeScript service files (excluding test files and index files).
   */
  private async findServiceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this.findServiceFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        // Skip test files
        if (entry.name.endsWith(".test.ts")) {
          continue;
        }

        // Skip excluded files
        if (EXCLUDED_FILES.includes(entry.name)) {
          continue;
        }

        files.push(fullPath);
      }
    }

    return files;
  }
}
