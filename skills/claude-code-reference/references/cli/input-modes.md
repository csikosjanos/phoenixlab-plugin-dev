# Input Modes

Different ways to provide input to Claude Code.

## Mode Reference

| Mode | Description | Use Case |
| --- | --- | --- |
| Interactive | Terminal UI | Development, exploration |
| Pipe | Read from stdin | Scripting |
| Headless (`-p`) | Non-interactive | CI/CD, automation |

## Interactive Mode

```bash
claude              # Start interactive session
claude "prompt"     # Start with initial prompt
```

## Pipe Mode

```bash
echo "What is this?" | claude
cat file.txt | claude "Summarize this"
```

## Headless Mode

Non-interactive mode for automation:

```bash
claude -p "Generate a README"
claude -p "Fix the bug" --output-format json
```

## Output Formats

| Format | Description |
| --- | --- |
| `text` | Plain text (default) |
| `json` | Structured JSON output |
| `stream-json` | Streaming JSON events |