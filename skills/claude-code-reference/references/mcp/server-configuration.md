# Server Configuration

Configure MCP servers in `.mcp.json`.

## Configuration Schema

```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "npx",
      "args": ["<package>", "<args>"],
      "env": { "KEY": "value" }
    }
  }
}
```

## Server Fields

| Field | Required | Description |
| --- | --- | --- |
| `command` | yes | Command to start the server |
| `args` | no | Command arguments array |
| `env` | no | Environment variables |

## Example: Memory Server

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## Example: Filesystem Server

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/allowed/path"
      ]
    }
  }
}
```