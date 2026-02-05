# Invocation Control

Control how skills are invoked.

## Invocation Methods

| Method | Trigger | Control Field |
| --- | --- | --- |
| User | `/skillname` command | `user-invocable: true` |
| Model | Claude auto-invokes | `disable-model-invocation: false` |

## user-invocable

When `true`, users can invoke with `/skillname`:

```yaml
---
name: commit
user-invocable: true
---
```

User types `/commit` to invoke.

## disable-model-invocation

When `true`, Claude cannot auto-invoke the skill:

```yaml
---
name: dangerous-op
disable-model-invocation: true
user-invocable: true
---
```

Only user can invoke, Claude cannot trigger automatically.