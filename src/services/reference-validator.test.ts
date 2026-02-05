import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { ReferenceValidator, type ValidationResult } from "./reference-validator.ts";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("ReferenceValidator", () => {
  let tempDir: string;
  let validator: ReferenceValidator;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "ref-validator-test-"));
    validator = new ReferenceValidator(tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("validateFile", () => {
    it("passes validation for a well-formed reference file", async () => {
      const content = `# Single Topic

This is a well-formed reference file.

| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |
`;
      await writeFile(join(tempDir, "good.md"), content);

      const result = await validator.validateFile("good.md");

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    describe("size validation", () => {
      it("warns when file exceeds 2KB", async () => {
        // Create content > 2KB but < 3KB
        const content = `# Topic\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n${"x".repeat(2100)}`;
        await writeFile(join(tempDir, "large.md"), content);

        const result = await validator.validateFile("large.md");

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.rule === "size" && w.message.includes("2KB"))).toBe(true);
      });

      it("errors when file exceeds 3KB", async () => {
        // Create content > 3KB
        const content = `# Topic\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n${"x".repeat(3100)}`;
        await writeFile(join(tempDir, "huge.md"), content);

        const result = await validator.validateFile("huge.md");

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.rule === "size" && e.message.includes("3KB"))).toBe(true);
      });
    });

    describe("table-first rule", () => {
      it("errors when file contains no markdown tables", async () => {
        const content = `# Topic

Just some prose without any tables.
`;
        await writeFile(join(tempDir, "no-table.md"), content);

        const result = await validator.validateFile("no-table.md");

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.rule === "table-first")).toBe(true);
      });

      it("passes when file contains at least one markdown table", async () => {
        const content = `# Topic

| Header |
|--------|
| Value  |
`;
        await writeFile(join(tempDir, "has-table.md"), content);

        const result = await validator.validateFile("has-table.md");

        expect(result.errors.some((e) => e.rule === "table-first")).toBe(false);
      });
    });

    describe("single h1 heading rule", () => {
      it("errors when file has no h1 heading", async () => {
        const content = `## Not a main heading

| A | B |
|---|---|
| 1 | 2 |
`;
        await writeFile(join(tempDir, "no-h1.md"), content);

        const result = await validator.validateFile("no-h1.md");

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.rule === "single-h1" && e.message.includes("no h1"))).toBe(true);
      });

      it("errors when file has multiple h1 headings", async () => {
        const content = `# First Topic

| A | B |
|---|---|
| 1 | 2 |

# Second Topic
`;
        await writeFile(join(tempDir, "multi-h1.md"), content);

        const result = await validator.validateFile("multi-h1.md");

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.rule === "single-h1" && e.message.includes("multiple"))).toBe(true);
      });

      it("passes with exactly one h1 heading", async () => {
        const content = `# Single Topic

| A | B |
|---|---|
| 1 | 2 |
`;
        await writeFile(join(tempDir, "single-h1.md"), content);

        const result = await validator.validateFile("single-h1.md");

        expect(result.errors.some((e) => e.rule === "single-h1")).toBe(false);
      });

      it("ignores # inside code blocks when counting h1 headings", async () => {
        const content = `# Real Heading

| A | B |
|---|---|
| 1 | 2 |

\`\`\`bash
# This is a bash comment, not a heading
echo "hello"
# Another comment
\`\`\`

\`\`\`markdown
# Example heading in code
\`\`\`
`;
        await writeFile(join(tempDir, "code-blocks.md"), content);

        const result = await validator.validateFile("code-blocks.md");

        expect(result.errors.some((e) => e.rule === "single-h1")).toBe(false);
      });
    });

    describe("internal link validation", () => {
      it("errors when internal link points to non-existent file", async () => {
        const content = `# Topic

| A | B |
|---|---|
| 1 | 2 |

Check out [Missing File](./missing.md).
`;
        await writeFile(join(tempDir, "bad-link.md"), content);

        const result = await validator.validateFile("bad-link.md");

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.rule === "valid-links" && e.message.includes("missing.md"))).toBe(true);
      });

      it("passes when internal links point to existing files", async () => {
        const content = `# Topic

| A | B |
|---|---|
| 1 | 2 |

Check out [Exists](./exists.md).
`;
        await writeFile(join(tempDir, "valid-link.md"), content);
        await writeFile(join(tempDir, "exists.md"), "# Exists\n\n| A |\n|---|\n| 1 |");

        const result = await validator.validateFile("valid-link.md");

        expect(result.errors.some((e) => e.rule === "valid-links")).toBe(false);
      });

      it("ignores external links", async () => {
        const content = `# Topic

| A | B |
|---|---|
| 1 | 2 |

Check out [External](https://example.com).
`;
        await writeFile(join(tempDir, "external-link.md"), content);

        const result = await validator.validateFile("external-link.md");

        expect(result.errors.some((e) => e.rule === "valid-links")).toBe(false);
      });

      it("validates links in subdirectories", async () => {
        await mkdir(join(tempDir, "subdir"));
        const content = `# Topic

| A | B |
|---|---|
| 1 | 2 |

Check out [In subdir](./subdir/other.md).
`;
        await writeFile(join(tempDir, "with-subdir-link.md"), content);
        await writeFile(join(tempDir, "subdir", "other.md"), "# Other\n\n| A |\n|---|\n| 1 |");

        const result = await validator.validateFile("with-subdir-link.md");

        expect(result.errors.some((e) => e.rule === "valid-links")).toBe(false);
      });
    });
  });

  describe("validateAll", () => {
    it("validates all markdown files in the directory", async () => {
      const goodContent = `# Good File

| A | B |
|---|---|
| 1 | 2 |
`;
      const badContent = `## No H1

No tables here either.
`;

      await writeFile(join(tempDir, "good.md"), goodContent);
      await writeFile(join(tempDir, "other.md"), goodContent.replace("Good File", "Other File"));
      await writeFile(join(tempDir, "bad.md"), badContent);

      const results = await validator.validateAll();

      expect(results).toHaveLength(3);
      expect(results.filter((r) => r.valid)).toHaveLength(2);
      expect(results.filter((r) => !r.valid)).toHaveLength(1);
    });

    it("includes files in subdirectories", async () => {
      await mkdir(join(tempDir, "category"));
      const content = `# File

| A |
|---|
| 1 |
`;
      await writeFile(join(tempDir, "root.md"), content);
      await writeFile(join(tempDir, "category", "nested.md"), content);

      const results = await validator.validateAll();

      expect(results).toHaveLength(2);
      expect(results.some((r) => r.path.includes("category"))).toBe(true);
    });

    it("excludes special files like README.md and index.md", async () => {
      const content = `# File\n\n| A |\n|---|\n| 1 |`;
      await writeFile(join(tempDir, "normal.md"), content);
      await writeFile(join(tempDir, "README.md"), "# README\n\nNo tables needed.");
      await writeFile(join(tempDir, "index.md"), "# Index\n\nNo tables needed.");

      const results = await validator.validateAll();

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe("normal.md");
    });
  });

  describe("validateCategory", () => {
    it("validates only files in the specified category subdirectory", async () => {
      await mkdir(join(tempDir, "hooks"));
      await mkdir(join(tempDir, "plugins"));

      const content = `# File\n\n| A |\n|---|\n| 1 |`;
      await writeFile(join(tempDir, "hooks", "events.md"), content);
      await writeFile(join(tempDir, "plugins", "manifest.md"), content);

      const results = await validator.validateCategory("hooks");

      expect(results).toHaveLength(1);
      expect(results[0].path).toContain("hooks");
    });

    it("returns empty array for non-existent category", async () => {
      const results = await validator.validateCategory("nonexistent");

      expect(results).toHaveLength(0);
    });
  });
});
