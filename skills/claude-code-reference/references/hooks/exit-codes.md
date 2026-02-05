# Exit Codes

How hook exit codes control Claude Code behavior.

## Exit Code Meanings

| Exit Code | Meaning | Effect |
| --- | --- | --- |
| `0` | Success | Action proceeds, stdout parsed for JSON |
| `2` | Blocking error | Action blocked, stderr shown to Claude |
| Other | Non-blocking error | Action proceeds, stderr logged |

## Behavior by Event

| Hook event | Can block? | What happens on exit 2 |
| --- | --- | --- |
| `PreToolUse` | Yes | Blocks the tool call |
| `PermissionRequest` | Yes | Denies the permission |
| `UserPromptSubmit` | Yes | Blocks prompt processing and erases the prompt |
| `Stop` | Yes | Prevents Claude from stopping, continues the conversation |
| `SubagentStop` | Yes | Prevents the subagent from stopping |
| `PostToolUse` | No | Shows stderr to Claude (tool already ran) |
| `PostToolUseFailure` | No | Shows stderr to Claude (tool already failed) |
| `Notification` | No | Shows stderr to user only |
| `SubagentStart` | No | Shows stderr to user only |
| `SessionStart` | No | Shows stderr to user only |
| `SessionEnd` | No | Shows stderr to user only |
| `PreCompact` | No | Shows stderr to user only |

## Example: Blocking Script

```bash
#!/bin/bash
if [[ "$COMMAND" == *"rm -rf"* ]]; then
  echo "Blocked: destructive command" >&2
  exit 2  # Block the action
fi
exit 0    # Allow the action
```