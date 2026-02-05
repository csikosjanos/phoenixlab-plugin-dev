# Hook Events

When hooks fire during Claude Code execution.

## Event Reference

| Event | When it fires |
| --- | --- |
| `SessionStart` | When a session begins or resumes |
| `UserPromptSubmit` | When you submit a prompt, before Claude processes it |
| `PreToolUse` | Before a tool call executes. Can block it |
| `PermissionRequest` | When a permission dialog appears |
| `PostToolUse` | After a tool call succeeds |
| `PostToolUseFailure` | After a tool call fails |
| `Notification` | When Claude Code sends a notification |
| `SubagentStart` | When a subagent is spawned |
| `SubagentStop` | When a subagent finishes |
| `Stop` | When Claude finishes responding |
| `PreCompact` | Before context compaction |
| `SessionEnd` | When a session terminates |

## Blocking Events

Events that can block actions:

- **PreToolUse**: Exit 2 blocks the tool call
- **PermissionRequest**: Exit 2 denies the permission
- **UserPromptSubmit**: Exit 2 rejects the prompt
- **Stop**: Exit 2 prevents Claude from stopping

## See Also

- [Matcher Patterns](./matcher-patterns.md)
- [Input/Output Schemas](./input-output-schemas.md)