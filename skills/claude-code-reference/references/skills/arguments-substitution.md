# Arguments & Substitution

Pass arguments to skills with substitution variables.

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | Full argument string passed to skill |
| `<required>` | Convention for required argument in `arguments` field |
| `[optional]` | Convention for optional argument in `arguments` field |

## Arguments Field

Document expected arguments:

```yaml
---
name: greet
arguments: "<name> [greeting]"
user-invocable: true
---
```

## $ARGUMENTS Substitution

Use `$ARGUMENTS` in skill body:

```yaml
---
name: search
arguments: "<query>"
---

Search the codebase for: $ARGUMENTS
```

User invokes: `/search TODO comments`

Result: "Search the codebase for: TODO comments"

## Convention

- `<required>` - Required argument
- `[optional]` - Optional argument