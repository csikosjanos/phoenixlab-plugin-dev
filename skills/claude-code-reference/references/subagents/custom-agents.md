# Custom Agents

Create custom subagent configurations.

## Agent Definition

Create `.claude/agents/<name>.md`:

```yaml
---
name: code-reviewer
description: Reviews code for issues
model: sonnet
maxTurns: 20
allowedTools:
  - Read
  - Grep
  - Glob
---

Review the code for...
```

## Agent Fields

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Agent identifier |
| `description` | string | What the agent does |
| `model` | string | Model alias |
| `maxTurns` | number | Maximum conversation turns |
| `allowedTools` | array | Restricted tool list |

## Using Custom Agents

```bash
claude --agent code-reviewer
```

Or via Task tool:

```json
{
  "subagent_type": "code-reviewer",
  "prompt": "Review the auth module"
}
```