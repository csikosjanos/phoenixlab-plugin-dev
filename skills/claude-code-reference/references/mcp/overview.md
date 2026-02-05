# MCP Overview

Model Context Protocol integration with Claude Code.

## What is MCP?

MCP (Model Context Protocol) lets Claude Code connect to external
services and tools through a standardized protocol.

## When to Use MCP

| Use Case | Example |
| --- | --- |
| External APIs | GitHub, Slack, databases |
| Persistent state | Memory, knowledge bases |
| Specialized tools | Custom integrations |

## Configuration Location

| Location | Scope |
| --- | --- |
| `~/.claude/.mcp.json` | All projects |
| `.mcp.json` | Current project |
| Plugin `.mcp/mcp.json` | Plugin scope |

## See Also

- [Server Configuration](./server-configuration.md)
- [Tool Naming](./tool-naming.md)