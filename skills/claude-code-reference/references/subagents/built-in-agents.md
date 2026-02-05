# Built-in Agents

Specialized agents available in Claude Code.

## Agent Reference

| Agent | Purpose | Available Tools |
| --- | --- | --- |
| `Bash` | Command execution | Bash only |
| `Explore` | Codebase exploration | Read, Glob, Grep |
| `Plan` | Implementation planning | Read, Glob, Grep |
| `general-purpose` | General tasks | All tools |

## Using Built-in Agents

Via Task tool:

```json
{
  "subagent_type": "Explore",
  "prompt": "Find all API endpoints"
}
```

## Agent Capabilities

### Explore Agent

- Fast codebase search
- File pattern matching
- Content searching

### Plan Agent

- Implementation planning
- Architecture analysis
- Step-by-step breakdowns