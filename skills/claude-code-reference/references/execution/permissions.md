# Permissions

Control what Claude Code can access and do.

## Permission Modes

| Mode | Description |
| --- | --- |
| `default` | Ask for permission each time |
| `plan` | Approve high-level plans |
| `acceptEdits` | Auto-approve file edits |
| `dontAsk` | Auto-approve all |
| `bypassPermissions` | Skip all checks |

## Permission Rules

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Edit(src/**)",
      "Read(*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Edit(.env)"
    ]
  }
}
```

## Pattern Syntax

| Pattern | Description |
| --- | --- |
| `Tool(*)` | Any argument |
| `Tool(path/**)` | Recursive glob |
| `Tool(cmd:*)` | Command prefix |