# GitHub Actions

Run Claude Code in CI/CD pipelines.

## Use Cases

| Use Case | Description |
| --- | --- |
| Code review | Automated PR reviews |
| Issue triage | Auto-label issues |
| Documentation | Generate docs |
| Test generation | Create tests |

## Basic Workflow

```yaml
name: Claude Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: 'Review this PR for issues'
```

## Configuration

| Input | Required | Description |
| --- | --- | --- |
| `anthropic-api-key` | yes | API key |
| `prompt` | yes | Task prompt |
| `model` | no | Model to use |