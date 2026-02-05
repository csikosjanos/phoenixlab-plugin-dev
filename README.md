# phoenixlab-plugin-dev

Companion plugin for Anthropic's `plugin-dev` that adds auto-updating documentation and custom rules enforcement.

## Features

- **Auto-updating documentation** - Fetches latest Claude Code docs and release notes
- **Custom rules enforcement** - Structure, documentation, and quality rules with blocking hooks (Phase 2)

## Installation

```bash
/plugin install /path/to/PhoenixLabPluginDev
```

## Commands

### /update-docs

Fetches the latest Claude Code documentation and release notes, caching them locally for the `claude-code-updates` skill.

```bash
/phoenixlab-plugin-dev:update-docs
```

## Skills

### claude-code-updates

Provides information about the latest Claude Code features and changes.

**Trigger phrases:**
- "what's new in claude code"
- "latest claude code features"
- "recent changes"
- "changelog"

## Development

This plugin uses Bun as its runtime and follows TDD principles.

```bash
# Run tests
bun test

# Update docs manually
bun run update-docs
```

## Architecture

- **Services** (`src/services/`) - Business logic, fully tested
- **CLI Wrappers** (`scripts/`) - Thin scripts that call services
- **Skills** (`skills/`) - Claude Code skill definitions
- **Commands** (`commands/`) - User-invocable commands

## License

MIT
