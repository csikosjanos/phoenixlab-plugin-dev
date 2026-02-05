# Matcher Patterns

Filter when hooks fire using regex patterns.

## Pattern Reference

| Event | What the matcher filters | Example matcher values |
| --- | --- | --- |
| `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest` | tool name | `Bash`, `Edit\ | Write`, `mcp__.*` |
| `SessionStart` | how the session started | `startup`, `resume`, `clear`, `compact` |
| `SessionEnd` | why the session ended | `clear`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other` |
| `Notification` | notification type | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` |
| `SubagentStart` | agent type | `Bash`, `Explore`, `Plan`, or custom agent names |
| `PreCompact` | what triggered compaction | `manual`, `auto` |
| `SubagentStop` | agent type | same values as `SubagentStart` |
| `UserPromptSubmit`, `Stop` | no matcher support | always fires on every occurrence |

## Pattern Syntax

- Use `*` or omit matcher to match all occurrences
- Patterns are regex: `Edit|Write` matches either tool
- MCP tools: `mcp__<server>__<tool>` naming pattern

## Examples

```json
{
  "matcher": "Bash",           // Exact match
  "matcher": "Edit|Write",     // Either tool
  "matcher": "mcp__.*",        // All MCP tools
  "matcher": ""                // Match all
}
```