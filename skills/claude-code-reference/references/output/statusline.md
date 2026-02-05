# Status Line

Configure the Claude Code status line display.

## Status Line Components

| Component | Description |
| --- | --- |
| Model | Current model being used |
| Token count | Context usage |
| Cost | Session cost estimate |
| Permission mode | Current mode |

## Configuration

In settings.json:

```json
{
  "statusline": {
    "show": true,
    "components": ["model", "tokens", "cost"]
  }
}
```

## Custom Status Line

Create a custom status line with a script:

```json
{
  "statusline": {
    "command": "./scripts/statusline.sh"
  }
}
```

Script output becomes status line content.