# Installation Scopes

Where plugins can be installed and their visibility.

## Scope Reference

| Scope | Location | Availability |
| --- | --- | --- |
| user | `~/.claude/plugins/` | All projects |
| project | `.claude/plugins/` | Current project only |
| local | Direct path | Development mode |
| managed | Admin-controlled | Organization-wide |

## User Scope

Plugins in `~/.claude/plugins/` are available globally.

```bash
claude plugin install --scope user <source>
```

## Project Scope

Plugins in `.claude/plugins/` only affect the project.

```bash
claude plugin install --scope project <source>
```

## Local Development

Reference a local directory for development:

```bash
claude plugin install --local ./my-plugin
```