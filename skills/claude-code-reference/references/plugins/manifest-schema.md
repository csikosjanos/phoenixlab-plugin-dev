# Plugin Manifest Schema

The `plugin.json` file defines plugin metadata.

## Required Fields

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Unique plugin identifier |
| `version` | string | Semantic version (e.g., 1.0.0) |

## Optional Fields

| Field | Type | Description |
| --- | --- | --- |
| `description` | string | What the plugin does |
| `author` | string | Plugin author name |
| `repository` | string | Source repository URL |
| `homepage` | string | Plugin homepage URL |
| `license` | string | License identifier |

## Example

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "author": "Developer Name"
}
```

## Location

Must be at `.claude-plugin/plugin.json` in the plugin root.