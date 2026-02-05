# Component Types

Plugin components that extend Claude Code.

## Available Components

| Component | Directory | Description |
| --- | --- | --- |
| Skills | `skills/` | Extended instructions and slash commands |
| Agents | `agents/` | Custom subagent configurations |
| Hooks | `hooks/hooks.json` | Lifecycle event handlers |
| MCP Servers | `.mcp/mcp.json` | Model Context Protocol servers |

## Skills

Markdown files with frontmatter providing instructions.
See [Skills Reference](../skills/frontmatter-reference.md).

## Agents

Custom subagent configurations for specialized tasks.
See [Subagents Reference](../subagents/custom-agents.md).

## Hooks

Event handlers that run at lifecycle points.
See [Hooks Reference](../hooks/events-overview.md).

## MCP Servers

Model Context Protocol server configurations.
See [MCP Reference](../mcp/server-configuration.md).