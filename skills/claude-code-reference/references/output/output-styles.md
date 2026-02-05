# Output Styles

Configure Claude Code output formatting.

## Output Formats

| Format | Use Case |
| --- | --- |
| `text` | Default terminal output |
| `json` | Machine-readable output |
| `stream-json` | Streaming events |

## CLI Output Flags

```bash
# JSON output
claude -p "query" --output-format json

# Streaming JSON
claude -p "query" --output-format stream-json
```

## Markdown Rendering

Claude Code renders markdown in terminal:

- Code blocks with syntax highlighting
- Tables formatted for terminal width
- Lists and headers styled

## Verbose Mode

Toggle verbose output with `Ctrl+O`:

- Shows hook execution details
- Displays tool input/output
- Logs debug information