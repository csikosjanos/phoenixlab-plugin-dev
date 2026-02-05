# Development Rules & Conventions

This document captures the architectural decisions, patterns, and conventions used in the phoenixlab-plugin-dev plugin.

---

## Core Principles

### 1. Script Over Prompt

**Rule:** Whatever can be coded in script MUST be coded in script.

- Commands and hooks invoke TypeScript scripts rather than relying on LLM prompts
- Business logic lives in testable code, not in markdown instructions
- Prompts are for guidance and documentation, not for implementation

**Runtime:** Bun
**Language:** TypeScript

### 2. Clean Separation: Services + CLI Wrappers

**Rule:** Maintain strict separation between business logic and CLI concerns.

```
src/services/     → Business logic (tested, framework-agnostic)
scripts/          → CLI wrappers (thin, orchestration only)
```

#### Services (`src/services/`)
- Contain all business logic
- Fully unit tested with TDD
- Framework-agnostic and testable in isolation
- Export typed interfaces for all data structures
- No CLI concerns (no `console.log`, no `process.argv`)

#### CLI Wrappers (`scripts/`)
- Thin scripts that orchestrate services
- Handle argument parsing
- Handle output formatting (console.log, colors, etc.)
- Handle errors gracefully with user-friendly messages
- No business logic

**Example Structure:**
```typescript
// src/services/docs-fetcher.ts - Pure business logic
export class DocsFetcher {
  async fetchOfficialDocs(): Promise<RawDocs> {
    // Returns typed data, no side effects
  }
}

// scripts/update-docs.ts - Thin wrapper
import { DocsFetcher } from "../src/services/docs-fetcher.ts";

const fetcher = new DocsFetcher();
const result = await fetcher.fetchOfficialDocs();
console.log(`Fetched: ${result.title}`);  // CLI concern here only
```

### 3. Test-Driven Development (TDD)

**Rule:** Write tests first for all services.

- Services have unit tests
- CLI wrappers have integration tests (Phase 2)
- Use Bun's built-in test runner (`bun test`)

---

## File Organization

### Directory Structure

```
project-root/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest (required)
├── src/
│   └── services/             # Business logic
│       ├── feature.ts        # Service implementation
│       └── feature.test.ts   # Co-located test
├── scripts/                  # CLI wrappers
│   └── command-name.ts       # Thin CLI script
├── skills/
│   └── skill-name/
│       ├── SKILL.md          # Skill definition
│       ├── references/       # Generated/static reference files
│       └── cache/            # Runtime cache (gitignored)
├── commands/
│   └── command-name.md       # Command definitions
├── package.json
├── tsconfig.json
└── .gitignore
```

### Co-located Tests

**Rule:** Tests live next to their source files, not in separate `__tests__` folders.

```
src/services/
├── docs-fetcher.ts
├── docs-fetcher.test.ts      ← Test next to source
├── docs-parser.ts
├── docs-parser.test.ts       ← Test next to source
├── cache-manager.ts
└── cache-manager.test.ts     ← Test next to source
```

**Rationale:**
- Easier to find related files
- Clear 1:1 relationship between source and test
- Simpler imports in test files

---

## Testing Conventions

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { ServiceClass } from "./service.ts";

describe("ServiceClass", () => {
  let service: ServiceClass;

  beforeEach(() => {
    service = new ServiceClass();
  });

  afterEach(() => {
    // Cleanup
  });

  describe("methodName", () => {
    it("should do expected behavior", () => {
      // Arrange
      // Act
      // Assert
    });

    it("should handle edge case", () => {
      // ...
    });
  });
});
```

### Mocking External Dependencies

**Rule:** Mock at the boundary (e.g., `fetch`), not internal methods.

```typescript
// Mock global fetch
const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(mockData, { status: 200 }))
  );
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});
```

### Test Categories

1. **Happy path** - Expected successful behavior
2. **Error cases** - Non-200 responses, network errors
3. **Edge cases** - Empty input, missing data, limits
4. **Integration** - Multiple components working together

---

## Service Design Patterns

### Type-First Design

**Rule:** Define interfaces before implementation.

```typescript
// Define the contract first
export interface RawDocs {
  html: string;
  source: "official";
  fetchedAt: Date;
}

export interface Release {
  tagName: string;
  name: string;
  body: string;
  publishedAt: Date;
  url: string;
}

// Then implement
export class DocsFetcher {
  async fetchOfficialDocs(): Promise<RawDocs> { ... }
  async fetchGitHubReleases(): Promise<Release[]> { ... }
}
```

### Constructor Injection

**Rule:** Use constructor parameters for configuration and dependencies.

```typescript
export class CacheManager {
  constructor(
    private cacheDir: string,
    private referencesDir: string
  ) {}
}
```

**Benefits:**
- Testable with custom paths
- No hardcoded paths in business logic
- Easy to configure for different environments

### Error Handling

**Rule:** Throw meaningful errors, let CLI handle user messaging.

```typescript
// Service: throw with context
if (!response.ok) {
  throw new Error(`Failed to fetch official docs: ${response.status}`);
}

// CLI wrapper: catch and format
try {
  await fetcher.fetchOfficialDocs();
} catch (error) {
  console.error(`✗ Failed to fetch: ${error.message}`);
}
```

### Graceful Degradation

**Rule:** Return empty/null for non-critical failures, throw for critical ones.

```typescript
// Non-critical: repository might not have releases
if (response.status === 404) {
  return [];  // Empty array, not an error
}

// Critical: unexpected server error
if (!response.ok) {
  throw new Error(`Failed to fetch: ${response.status}`);
}
```

---

## CLI Wrapper Patterns

### Shebang and Module Imports

```typescript
#!/usr/bin/env bun
/**
 * Brief description of what this CLI does.
 */

import { Service } from "../src/services/service.ts";
```

### Environment Variables

**Rule:** Support `CLAUDE_PLUGIN_ROOT` for path resolution.

```typescript
import { dirname, join } from "node:path";

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(import.meta.path));
const cacheDir = join(pluginRoot, "skills", "skill-name", "cache");
```

### Argument Parsing

**Rule:** Keep argument parsing simple; use flags for options.

```typescript
const args = process.argv.slice(2);
const forceUpdate = args.includes("--force") || args.includes("-f");
const skipReleases = args.includes("--skip-releases");
```

### Output Formatting

**Rule:** Use consistent formatting with status indicators.

```typescript
console.log("Updating documentation...\n");
console.log("  ✓ Fetched: 10 releases");
console.log("  ✗ Failed: network error");
console.log("\n✓ Update complete!");
```

### Main Function Pattern

```typescript
async function main() {
  // Orchestration logic
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
```

---

## Command Conventions

### Frontmatter

```markdown
---
description: Brief description of what the command does
---
```

### Content Structure

1. **Title** - What the command does
2. **Usage** - How to run it
3. **Options** - Available flags
4. **Examples** - Common use cases
5. **Output** - What files are affected

### Path References

**Rule:** Use `${CLAUDE_PLUGIN_ROOT}` for portable paths.

```markdown
Run the script:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run scripts/update-docs.ts
```
```

---

## Skill Conventions

### SKILL.md Frontmatter

```yaml
---
description: Brief description of the skill
triggers:
  - "trigger phrase one"
  - "trigger phrase two"
  - "alternate phrasing"
---
```

### Trigger Phrase Guidelines

- Use lowercase
- Include common variations
- Include both full phrases and keywords
- Example: "what's new", "latest features", "changelog", "updates"

### Reference Files

**Rule:** Separate generated files from static content.

```
skills/skill-name/
├── SKILL.md          # Static: skill definition
├── references/       # Generated: markdown for Claude to read
│   ├── README.md     # Static: explains the directory
│   └── data.md       # Generated: parsed/formatted data
└── cache/            # Generated: raw cached data (gitignored)
```

---

## Cache Management

### Cache Structure

```typescript
interface CacheData {
  // Actual data fields
  title: string;
  content: string;

  // Metadata for cache management
  _metadata: {
    cachedAt: string;    // ISO timestamp
    version: string;     // Cache format version
  };
}
```

### Cache Validity

**Rule:** Implement time-based cache invalidation.

```typescript
async isCacheValid(maxAgeHours: number = 24): Promise<boolean> {
  const metadata = await this.getCacheMetadata();
  if (!metadata) return false;

  const ageMs = Date.now() - new Date(metadata.cachedAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  return ageHours < maxAgeHours;
}
```

### Gitignore Cached Data

```gitignore
# Cache directories
skills/*/cache/
```

---

## TypeScript Conventions

### Imports

**Rule:** Use `.ts` extension in imports for Bun compatibility.

```typescript
import { Service } from "./service.ts";  // ✓ Include .ts
import { Service } from "./service";     // ✗ Avoid
```

### Type Exports

**Rule:** Export types alongside implementations.

```typescript
// Export types for consumers
export interface RawDocs { ... }
export interface Release { ... }

// Export implementation
export class DocsFetcher { ... }
```

### Private Methods

**Rule:** Use TypeScript `private` keyword for internal methods.

```typescript
export class DocsParser {
  // Public API
  parseHtml(rawDocs: RawDocs): ParsedContent { ... }

  // Internal helpers
  private extractTitle(html: string): string { ... }
  private stripHtml(html: string): string { ... }
}
```

---

## Plugin Manifest

### Required Fields

```json
{
  "name": "plugin-name",
  "description": "What the plugin does",
  "version": "0.1.0",
  "author": {
    "name": "Author Name"
  }
}
```

### Versioning

**Rule:** Use semantic versioning (semver).

- `0.x.x` - Initial development, API may change
- `1.0.0` - First stable release
- Increment patch for bug fixes
- Increment minor for new features
- Increment major for breaking changes

---

## Knowledge Base / Reference Documentation

When creating skills that provide reference documentation (knowledge bases), follow the **Progressive Disclosure** pattern for context-efficient, granular documentation.

### Design Principles

| Principle | Rule | Rationale |
|-----------|------|-----------|
| Single Responsibility | One topic per file | Easier to load only what's needed |
| Table-First | Use markdown tables, not prose | Structured data is scannable and precise |
| Under 3KB | Keep files between 1-2KB | Fits easily in context window |
| Self-Contained | Each file understandable alone | No dependency chains to follow |
| Include Examples | 1-2 practical examples per file | Shows usage, not just specification |

### Directory Structure

```
skills/<skill-name>/references/
├── index.md                    # Overview + links to all categories
├── <category>/                 # One directory per topic category
│   ├── <topic-a>.md           # Focused reference file
│   ├── <topic-b>.md           # Focused reference file
│   └── troubleshooting.md     # Common issues for this category
└── releases.md                 # Changelog (if applicable)
```

### Reference File Format

```markdown
# Topic Title

Brief one-line description of what this covers.

## Section with Table

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | Field description |
| `value` | number | no | Field description |

## Example

\`\`\`json
{
  "name": "example",
  "value": 42
}
\`\`\`
```

### Generator Architecture

```
src/services/reference-generators/
├── base-generator.ts           # Abstract base with common functionality
├── <category>-references.ts    # Category-specific generator
├── <category>-references.test.ts
└── index.ts                    # Orchestrator + exports
```

**Base Generator Pattern:**
```typescript
export abstract class BaseReferenceGenerator {
  constructor(
    protected refManager: ReferenceManager,
    protected config: { category: string; sourceUrls: string[] }
  ) {}

  abstract generate(): Promise<void>;
  abstract generateFromContent(contents: Map<string, string>): Promise<void>;

  // Shared utilities
  protected async fetchDocumentation(url: string): Promise<string>;
  protected async writeReference(path: string, topic: string, content: string): Promise<void>;
  protected formatTable(headers: string[], rows: string[][]): string;
}
```

**Generator Implementation Pattern:**
```typescript
export class CategoryReferenceGenerator extends BaseReferenceGenerator {
  constructor(refManager: ReferenceManager) {
    super(refManager, {
      category: "category-name",
      sourceUrls: ["source-doc.md"],
    });
  }

  async generate(): Promise<void> {
    const contents = await this.fetchAllSources();
    await this.generateFromContent(contents);
  }

  async generateFromContent(contents: Map<string, string>): Promise<void> {
    const sourceMd = contents.get("source-doc.md") || "";

    await this.writeReference(
      "topic-a.md",
      "Topic A Title",
      this.generateTopicA(sourceMd)
    );
  }

  generateTopicA(content: string): string {
    const lines: string[] = [];
    lines.push("# Topic A Title");
    lines.push("");
    // ... build content with tables, examples
    return lines.join("\n");
  }
}
```

### Supporting Services

**ReferenceManager** - File I/O for nested reference paths:
- `writeReference(ref)` - Write to nested path (creates directories)
- `readReference(path)` - Read and extract topic from heading
- `listReferences()` - List all .md files recursively
- `generateIndex()` - Create index.md with links by category
- `clearCategory(category)` - Remove all files in a category
- `deleteReference(path)` - Remove single file

**ContentExtractor** - Parse markdown for structured content:
- `extractTables(markdown)` - Extract markdown tables as arrays
- `extractSection(markdown, heading)` - Extract section by heading
- `extractCodeBlocks(markdown)` - Extract fenced code blocks
- `extractHeadings(markdown)` - Get all headings with levels
- `extractBulletList(markdown)` - Get bullet list items

### CLI Integration

Add `--regenerate-refs` flag to update scripts:

```typescript
// Parse --regenerate-refs argument
const regenerateRefsArg = args.find((a) => a.startsWith("--regenerate-refs"));
const regenerateRefs = regenerateRefsArg !== undefined;
const regenerateCategory = regenerateRefsArg?.includes("=")
  ? regenerateRefsArg.split("=")[1]
  : null;

// Usage:
// --regenerate-refs           Regenerate all categories
// --regenerate-refs=hooks     Regenerate specific category
```

### Orchestrator Pattern

```typescript
export class ReferenceGeneratorOrchestrator {
  constructor(private refManager: ReferenceManager) {}

  getGenerator(category: GeneratorCategory) { /* factory method */ }

  async generateCategory(category: GeneratorCategory): Promise<GeneratorResult>;
  async generateAll(): Promise<GeneratorResult[]>;
  async generateMultiple(categories: GeneratorCategory[]): Promise<GeneratorResult[]>;
}
```

### Quality Checklist

When creating reference documentation:

- [ ] Each file covers exactly one topic
- [ ] All structured data uses markdown tables
- [ ] File size is under 3KB (ideally 1-2KB)
- [ ] File is understandable without reading other files
- [ ] Includes 1-2 practical examples
- [ ] Generator has tests (TDD)
- [ ] `generateFromContent()` allows testing without fetching

---

## Summary Checklist

When adding new functionality:

- [ ] Define types/interfaces first
- [ ] Write tests before implementation
- [ ] Place business logic in `src/services/`
- [ ] Create thin CLI wrapper in `scripts/`
- [ ] Co-locate tests with source (`.test.ts`)
- [ ] Use constructor injection for dependencies
- [ ] Support `CLAUDE_PLUGIN_ROOT` environment variable
- [ ] Add command in `commands/` if user-invocable
- [ ] Update skill if it affects skill behavior
- [ ] Run `bun test` before committing
