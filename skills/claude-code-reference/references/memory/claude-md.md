# CLAUDE.md Format

Project instructions and context for Claude Code.

## Purpose

CLAUDE.md provides static context to Claude:

- Project-specific instructions
- Coding conventions
- Architecture overview
- Common commands

## Format

Plain markdown with headers for organization:

```markdown
# Project Name

Brief description of the project.

## Architecture

Key architectural decisions...

## Commands

```bash
npm test    # Run tests
npm build   # Build project
```
```

## Best Practices

- Keep it concise (auto-loaded into context)
- Focus on what Claude needs to know
- Include common commands and patterns
- Update when project conventions change

## Locations

| Location | Scope |
| --- | --- |
| `./CLAUDE.md` | Project root (most common) |
| `~/.claude/CLAUDE.md` | Global preferences |