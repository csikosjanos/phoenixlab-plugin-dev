# CLI Commands Reference

Claude Code command-line interface commands and flags.

## Basic Usage

```bash
claude [options] [prompt]
```

## Common Commands

| Command | Description |
| --- | --- |
| `claude` | Start interactive session |
| `claude "prompt"` | Start with initial prompt |
| `claude --resume` | Resume last session |
| `claude --continue` | Continue last conversation |
| `claude plugin <cmd>` | Manage plugins |

## Global Flags

| Flag | Description |
| --- | --- |
| `-p, --print` | Print response and exit (non-interactive) |
| `--resume` | Resume the most recent session |
| `--continue` | Continue the most recent conversation |
| `--model <alias>` | Use specific model |
| `--agent <name>` | Start with specific agent |
| `--debug` | Enable debug output |
| `--no-color` | Disable colored output |