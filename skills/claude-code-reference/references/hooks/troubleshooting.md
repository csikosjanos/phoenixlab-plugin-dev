# Troubleshooting

Common hook issues and solutions.

| Issue | Common Causes |
|-------|---------------|
| Hook not firing | Incorrect matcher, wrong event type, non-interactive mode |
| Error in output | Script not executable, path issues, missing dependencies |
| JSON validation failed | Shell profile printing text before JSON |
| Stop hook runs forever | Missing `stop_hook_active` check |

## Hook Not Firing

- Run `/hooks` to confirm the hook is registered
- Check matcher pattern matches exactly (case-sensitive)
- Verify correct event type (PreToolUse vs PostToolUse)
- PermissionRequest hooks don't fire in non-interactive mode

## Hook Error in Output

- Test script manually: `echo '{}' | ./my-hook.sh`
- Use absolute paths or `$CLAUDE_PROJECT_DIR`
- Make script executable: `chmod +x ./my-hook.sh`
- Install `jq` for JSON parsing

## JSON Validation Failed

Shell profile may print text before JSON output.
Wrap echo statements in interactive check:

```bash
# In ~/.zshrc or ~/.bashrc
if [[ $- == *i* ]]; then
  echo "Shell ready"
fi
```

## Stop Hook Runs Forever

Check `stop_hook_active` to prevent infinite loops:

```bash
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Allow Claude to stop
fi
```

## Debug Tips

- Run `claude --debug` for execution details
- Toggle verbose mode with `Ctrl+O`
- Check exit codes and stderr output