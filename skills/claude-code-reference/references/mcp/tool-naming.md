# Tool Naming

MCP tool naming conventions and patterns.

## Naming Pattern

MCP tools follow: `mcp__<server>__<tool>`

| Pattern | Example |
| --- | --- |
| `mcp__<server>__<tool>` | `mcp__memory__create_entities` |

## Common Tool Names

| Tool | Description |
| --- | --- |
| `mcp__memory__create_entities` | Create memory entries |
| `mcp__memory__search_entities` | Search memory |
| `mcp__filesystem__read_file` | Read file contents |
| `mcp__filesystem__write_file` | Write to file |
| `mcp__github__search_repositories` | Search GitHub repos |

## Using in Hooks

Match MCP tools in hook matchers:

```json
{
  "matcher": "mcp__memory__.*"
}
```

## Patterns

| Pattern | Matches |
| --- | --- |
| `mcp__memory__.*` | All memory server tools |
| `mcp__.*__read.*` | Any read tool from any server |
| `mcp__github__.*` | All GitHub server tools |