# Input/Output Schemas

JSON data hooks receive and return.

## Common Input Fields

All hooks receive these fields on stdin:

| Field | Description |
| --- | --- |
| `session_id` | Current session identifier |
| `transcript_path` | Path to conversation JSON |
| `cwd` | Current working directory |
| `permission_mode` | Current permission mode |
| `hook_event_name` | Name of the event that fired |

## PreToolUse Input

```json
{
  "session_id": "abc123",
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" }
}
```

## JSON Output Fields

| Field | Default | Description |
| --- | --- | --- |
| `continue` | `true` | If false, stops Claude entirely |
| `stopReason` | - | Message shown when continue=false |
| `suppressOutput` | `false` | Hide stdout from verbose mode |
| `systemMessage` | - | Warning shown to user |

## Decision Control (PreToolUse)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Not allowed"
  }
}
```