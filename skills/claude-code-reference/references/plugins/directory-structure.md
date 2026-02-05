# Directory Structure

Standard plugin directory layout.

## Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # Plugin manifest (required)
├── skills/                 # Skill definitions
│   └── my-skill/
│       └── SKILL.md
├── agents/                 # Custom subagents
│   └── my-agent.md
├── hooks/                  # Hook configurations
│   └── hooks.json
└── .mcp/                   # MCP server configs
    └── mcp.json
```

## Required Files

| File | Purpose |
| --- | --- |
| `.claude-plugin/plugin.json` | Plugin manifest |

## Optional Directories

| Directory | Purpose |
| --- | --- |
| `skills/` | Skill definitions |
| `agents/` | Custom subagent configs |
| `hooks/` | Hook configurations |
| `.mcp/` | MCP server configurations |