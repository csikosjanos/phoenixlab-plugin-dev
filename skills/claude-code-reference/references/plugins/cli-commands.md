# Plugin CLI Commands

Commands for managing Claude Code plugins.

## Command Reference

| Command | Description |
| --- | --- |
| `claude plugin install <source>` | Install a plugin |
| `claude plugin uninstall <name>` | Remove a plugin |
| `claude plugin list` | List installed plugins |
| `claude plugin enable <name>` | Enable a disabled plugin |
| `claude plugin disable <name>` | Disable without removing |

## Install Sources

```bash
# From npm
claude plugin install @org/plugin-name

# From GitHub
claude plugin install github:user/repo

# From local path
claude plugin install --local ./my-plugin
```

## Flags

| Flag | Description |
| --- | --- |
| `--scope <user\|project>` | Installation scope |
| `--local` | Install from local path |
| `--force` | Force reinstall |