# Subagent Execution

Run skills in isolated subagent contexts.

## Context Modes

| Mode | Behavior |
| --- | --- |
| (default) | Skill runs in main context |
| `fork` | Skill runs in isolated subagent |

## Fork Context

```yaml
---
name: analyze
context: fork
---

Analysis instructions...
```

## Agent Configuration

Configure the subagent behavior:

```yaml
---
name: research
context: fork
agent:
  model: haiku       # Model to use
  maxTurns: 10       # Max conversation turns
  allowedTools:      # Restrict available tools
    - Read
    - Grep
    - Glob
---
```

## Agent Fields

| Field | Type | Description |
| --- | --- | --- |
| `model` | string | Model alias (haiku, sonnet, opus) |
| `maxTurns` | number | Maximum agent turns |
| `allowedTools` | array | Restrict to specific tools |