# Settings Locations

Where settings files are stored and their precedence.

## Location Reference

| Location | Scope | Shareable |
| --- | --- | --- |
| `~/.claude/settings.json` | Global | No |
| `.claude/settings.json` | Project | Yes (commit) |
| `.claude/settings.local.json` | Project | No (gitignored) |
| Managed policy | Organization | Admin-controlled |

## Precedence Order

Later settings override earlier:

1. Default settings
2. Global settings (`~/.claude/settings.json`)
3. Project settings (`.claude/settings.json`)
4. Local settings (`.claude/settings.local.json`)
5. Managed policy settings

## Creating Settings

```bash
# Create project settings directory
mkdir -p .claude

# Create settings file
echo '{}' > .claude/settings.json
```