---
description: Fetch and cache the latest Claude Code documentation and release notes
---

# Update Claude Code Documentation

This command fetches the latest Claude Code documentation from the official sources and caches it locally for the `claude-code-updates` skill.

## Usage

Run the update script:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run scripts/update-docs.ts
```

## Options

- `--force` or `-f`: Force update even if cache is still valid
- `--skip-releases`: Skip fetching GitHub releases
- `--skip-docs`: Skip fetching official documentation

## Examples

Force a full update:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run scripts/update-docs.ts --force
```

Only update releases:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run scripts/update-docs.ts --skip-docs
```

## Sources

- **Official Documentation**: https://docs.anthropic.com/en/docs/claude-code
- **GitHub Releases**: https://api.github.com/repos/anthropics/claude-code/releases

## Output

After running, the following files are updated:
- `skills/claude-code-updates/cache/docs.json` - Cached documentation
- `skills/claude-code-updates/cache/releases.json` - Cached releases
- `skills/claude-code-updates/references/official-docs.md` - Generated markdown reference
- `skills/claude-code-updates/references/releases.md` - Generated releases reference
