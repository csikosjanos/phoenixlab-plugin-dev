# Memory Locations

Where Claude Code stores and loads memory.

## Location Reference

| Location | Scope | Purpose |
| --- | --- | --- |
| `~/.claude/CLAUDE.md` | Global | Personal preferences |
| `./CLAUDE.md` | Project | Project instructions |
| `.claude/settings.json` | Project | Project settings |
| `~/.claude/memory/` | Global | Auto-memory directory |

## Load Order

1. Global CLAUDE.md (`~/.claude/CLAUDE.md`)
2. Project CLAUDE.md (`./CLAUDE.md`)
3. Project settings (`.claude/settings.json`)

## Auto-Memory

Claude can write to auto-memory directory:

```
~/.claude/projects/<project-hash>/memory/
├── MEMORY.md           # Auto-loaded (first 200 lines)
└── <topic>.md          # Referenced from MEMORY.md
```

## Memory Priority

More specific locations override general ones:
Project > User > Default