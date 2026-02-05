# Claude Code References

Progressive disclosure documentation for Claude Code plugin development.

## Validation

### Standard Plugin Validation
Use the plugin-dev plugin for standard validation:
```bash
# Validate plugin structure, manifest, components
/plugin-dev:plugin-validator

# Review skill quality
/plugin-dev:skill-reviewer
```

### Progressive Disclosure Validation (Plugin-wide)
```bash
# Validate this skill's reference files
bun run scripts/validate-references.ts claude-code-reference

# Validate all skills' reference files
bun run scripts/validate-references.ts --all
```

### TDD Validation (Plugin-wide)
```bash
# Validate all services have co-located tests
bun run scripts/validate-tdd.ts
```

## Structure

This directory contains granular, focused reference files organized by topic:

| Category | Content |
|----------|---------|
| `cli/` | CLI commands, input modes, environment variables |
| `execution/` | Sandboxing, permissions |
| `hooks/` | Events, matchers, handlers, schemas |
| `integrations/` | Chrome, VS Code, GitHub Actions |
| `mcp/` | MCP overview, server configuration, tool naming |
| `memory/` | Memory locations, CLAUDE.md format |
| `output/` | Output styles, status line |
| `plugins/` | Manifest schema, components, installation |
| `settings/` | Settings reference, locations, model config |
| `skills/` | Frontmatter, invocation, arguments, subagents |
| `subagents/` | Built-in agents, custom agents |

## Files

- `index.md` - Index of all reference files with links
- `releases.md` - Recent Claude Code releases and changelog

## Regenerating

```bash
# Regenerate all reference files
bun run skills/claude-code-reference/scripts/update-docs.ts --regenerate-refs

# Regenerate specific category
bun run skills/claude-code-reference/scripts/update-docs.ts --regenerate-refs=hooks

# Update releases only
bun run skills/claude-code-reference/scripts/update-docs.ts --force
```

## Design Principles

- **Single Responsibility**: One topic per file
- **Table-First**: Structured data in markdown tables
- **Under 3KB**: Each file fits easily in context
- **Self-Contained**: Understandable without other files
