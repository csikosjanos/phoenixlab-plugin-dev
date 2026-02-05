# Settings Reference

Claude Code configuration options.

## Core Settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `model` | string | sonnet | Default model to use |
| `customApiKeyResponsibility` | boolean | false | Use custom API key |
| `disableAllHooks` | boolean | false | Disable all hooks |
| `allowManagedHooksOnly` | boolean | false | Enterprise only |

## Permission Settings

| Setting | Type | Description |
| --- | --- | --- |
| `permissions.allow` | array | Allowed permission patterns |
| `permissions.deny` | array | Denied permission patterns |

## Example Configuration

```json
{
  "model": "opus",
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Edit(src/**)"
    ]
  }
}
```