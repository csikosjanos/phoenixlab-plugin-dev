---
name: Claude Code Reference
description: This skill should be used when the user asks about "Claude Code features", "plugin development reference", "hooks API", "skill frontmatter", "MCP configuration", "CLI commands", "Claude Code settings", or needs accurate, up-to-date reference documentation for Claude Code capabilities.
triggers:
  - "claude code features"
  - "plugin development"
  - "hooks API"
  - "skill frontmatter"
  - "MCP configuration"
  - "CLI commands"
  - "Claude Code settings"
  - "what's new in claude code"
  - "latest claude code features"
  - "recent changes"
  - "changelog"
  - "release notes"
---

# Claude Code Reference

This skill provides up-to-date reference documentation for Claude Code features and plugin development.

## Reference Categories

| Category | Topics Covered |
|----------|----------------|
| `plugins/` | Manifest schema, components, installation |
| `skills/` | Frontmatter, invocation, arguments |
| `hooks/` | Events, matchers, handlers, schemas |
| `mcp/` | Server configuration, tool naming |
| `cli/` | Commands, input modes, environment |
| `memory/` | Memory locations, CLAUDE.md format |
| `settings/` | Settings reference, locations, model config |
| `execution/` | Sandboxing, permissions |
| `subagents/` | Built-in agents, custom agents |
| `output/` | Output styles, status line |
| `integrations/` | Chrome, VS Code, GitHub Actions |

## How to Use

### Finding Information
To answer questions about Claude Code capabilities, read the relevant reference files from `references/`.

### Updating References
To update cached documentation and regenerate references:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run skills/claude-code-reference/scripts/update-docs.ts --force
```

### Validation
For standard plugin validation, use the plugin-dev plugin:
- `/plugin-dev:plugin-validator` - Validate manifest, structure, components
- `/plugin-dev:skill-reviewer` - Review skill quality

For progressive disclosure reference validation:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run scripts/validate-references.ts claude-code-reference
```

For TDD validation (ensures all services have tests):
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run scripts/validate-tdd.ts
```

## Reference Files

- `references/index.md` - Index of all reference files
- `references/releases.md` - Recent Claude Code releases
- `references/<category>/*.md` - Category-specific references

## Responding to Users

When a user asks about Claude Code features or updates:

1. **Check the references** - Read relevant files from `references/`
2. **Summarize key information** - Highlight the most relevant details
3. **Provide version info** - Include version numbers and dates where applicable
4. **Link to sources** - Reference the official documentation or GitHub releases page

## Cache Freshness

The cache is considered valid for 24 hours by default. If the cache is stale or missing, suggest running the update script with `--force` to fetch the latest information.
