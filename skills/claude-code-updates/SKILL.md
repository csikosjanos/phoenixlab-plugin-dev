---
description: Get the latest Claude Code features, changes, and release notes
triggers:
  - "what's new in claude code"
  - "latest claude code features"
  - "recent changes"
  - "changelog"
  - "claude code updates"
  - "new features"
  - "release notes"
---

# Claude Code Updates

This skill provides information about the latest Claude Code features, changes, and release notes.

## How to Use

When users ask about recent Claude Code updates, new features, or the changelog, use the cached documentation in the `references/` directory to provide accurate, up-to-date information.

## Reference Files

- `references/official-docs.md` - Latest official documentation summary
- `references/releases.md` - Recent release notes and features

## Updating the Cache

To update the cached documentation, run the `/update-docs` command:
```
/phoenixlab-plugin-dev:update-docs
```

Or run directly:
```bash
cd ${CLAUDE_PLUGIN_ROOT} && bun run scripts/update-docs.ts
```

## Responding to Users

When a user asks about Claude Code updates:

1. **Check the references** - Read `references/releases.md` for the latest release information
2. **Summarize key changes** - Highlight the most important features and changes
3. **Provide version info** - Include the version number and release date
4. **Link to sources** - Reference the official documentation or GitHub releases page

## Example Response Format

When responding about what's new:

> **Claude Code vX.X.X** (released YYYY-MM-DD)
>
> Key updates in this release:
> - **Feature A**: Description of the feature
> - **Feature B**: Description of another feature
>
> For full details, see the [official release notes](https://github.com/anthropics/claude-code/releases).

## Cache Freshness

The cache is considered valid for 24 hours by default. If the cache is stale or missing, suggest running `/update-docs` to fetch the latest information.
