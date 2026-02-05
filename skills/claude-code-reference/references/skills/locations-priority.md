# Skill Locations

Where skills are loaded from and precedence order.

## Location Reference

| Location | Scope | Shareable |
| --- | --- | --- |
| `~/.claude/skills/` | All projects | No |
| `.claude/skills/` | Current project | Yes (commit) |
| Plugin `skills/` | When enabled | Yes (plugin) |

## Directory Structure

```
skills/
└── my-skill/
    └── SKILL.md
```

## Precedence

When skills have the same name:

1. Project skills (`.claude/skills/`)
2. Plugin skills
3. User skills (`~/.claude/skills/`)

## File Naming

- Skill file must be named `SKILL.md`
- Directory name becomes skill name if not specified