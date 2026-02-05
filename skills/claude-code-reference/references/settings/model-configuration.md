# Model Configuration

Configure which Claude models to use.

## Model Aliases

| Alias | Description |
| --- | --- |
| `haiku` | Fast, efficient model |
| `sonnet` | Balanced model (default) |
| `opus` | Most capable model |
| `opusplan` | Opus for planning, Sonnet for execution |

## Setting the Model

Via CLI flag:

```bash
claude --model opus
```

Via settings:

```json
{
  "model": "opus"
}
```

## Provider Configuration

| Provider | Environment Variable |
| --- | --- |
| Anthropic | `ANTHROPIC_API_KEY` |
| AWS Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` |
| Google Vertex | `CLAUDE_CODE_USE_VERTEX=1` |