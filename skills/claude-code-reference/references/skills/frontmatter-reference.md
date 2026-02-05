# Frontmatter Reference

YAML frontmatter fields for SKILL.md files.

## Required Fields

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Unique skill identifier |
| `description` | string | What the skill does |

## Optional Fields

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `user-invocable` | boolean | false | User can invoke with /name |
| `disable-model-invocation` | boolean | false | Prevent auto-invocation |
| `arguments` | string | - | Expected arguments format |
| `context` | string | - | Context handling (fork, inherit) |
| `agent` | object | - | Subagent configuration |
| `hooks` | object | - | Skill-scoped hooks |

## Example

```yaml
---
name: deploy
description: Deploy the application
user-invocable: true
arguments: "[environment]"
---

Instructions for deploying...
```