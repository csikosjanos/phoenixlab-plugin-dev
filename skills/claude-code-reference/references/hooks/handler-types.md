# Handler Types

Three types of hook handlers to run when events fire.

## Handler Types

| Type | Description | Use Case |
| --- | --- | --- |
| `command` | Shell command | Scripts, formatters, validators |
| `prompt` | Single LLM call | Judgment-based decisions |
| `agent` | Multi-turn subagent | File inspection, test verification |

## Common Fields

| Field | Required | Description |
| --- | --- | --- |
| `type` | yes | `"command"`, `"prompt"`, or `"agent"` |
| `timeout` | no | Seconds before canceling. Defaults: 600 for command, 30 for prompt, 60 for agent |
| `statusMessage` | no | Custom spinner message displayed while the hook runs |
| `once` | no | If `true`, runs only once per session then is removed. Skills only, not agents. See [Hooks in skills and agents](#hooks-in-skills-and-agents) |

## Example: Command Hook

```json
{
  "type": "command",
  "command": "./scripts/validate.sh",
  "timeout": 30
}
```

## Example: Prompt Hook

```json
{
  "type": "prompt",
  "prompt": "Check if tasks complete: $ARGUMENTS"
}
```