# Sandboxing

Filesystem and network isolation for Bash commands.

## Sandbox Modes

| Mode | Description |
| --- | --- |
| `off` | No sandboxing (default) |
| `permissive` | Warnings only |
| `strict` | Block violations |

## Configuration

```json
{
  "sandbox": {
    "mode": "strict",
    "allowedPaths": ["/tmp", "$HOME/projects"],
    "allowNetwork": false
  }
}
```

## Capabilities

| Capability | Default | Description |
| --- | --- | --- |
| Filesystem read | Allowed | Read files in allowed paths |
| Filesystem write | Allowed | Write to allowed paths |
| Network | Blocked | Network access |
| Process spawn | Allowed | Spawn child processes |