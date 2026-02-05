---
description: Fetch and cache the latest Claude Code documentation and release notes
---

# Update Claude Code Documentation

This command fetches the latest Claude Code documentation from the official sources and caches it locally for the `claude-code-reference` skill.

## Usage

Run the update script:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run skills/claude-code-reference/scripts/update-docs.ts
```

## Options

- `--force` or `-f`: Force update even if cache is still valid
- `--skip-releases`: Skip fetching GitHub releases
- `--skip-docs`: Skip fetching official documentation
- `--regenerate-refs`: Regenerate all reference files from cached docs
- `--regenerate-refs=<category>`: Regenerate references for a specific category

## Examples

Force a full update:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run skills/claude-code-reference/scripts/update-docs.ts --force
```

Only update releases:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run skills/claude-code-reference/scripts/update-docs.ts --skip-docs
```

Regenerate all reference files:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run skills/claude-code-reference/scripts/update-docs.ts --regenerate-refs
```

Regenerate only hooks references:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run skills/claude-code-reference/scripts/update-docs.ts --regenerate-refs=hooks
```

## Sources

- **Official Documentation**: https://docs.anthropic.com/en/docs/claude-code
- **GitHub Releases**: https://api.github.com/repos/anthropics/claude-code/releases

## Output

After running, the following files are updated:
- `skills/claude-code-reference/cache/docs.json` - Cached documentation
- `skills/claude-code-reference/cache/releases.json` - Cached releases
- `skills/claude-code-reference/references/releases.md` - Generated releases reference
- `skills/claude-code-reference/references/<category>/*.md` - Category-specific references (when using `--regenerate-refs`)
