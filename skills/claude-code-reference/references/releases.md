# Claude Code Releases

> Last updated: 2026-02-05

## v2.1.31 - v2.1.31

**Released:** 2026-02-04
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.31

### Release Notes

## What's changed

- Added session resume hint on exit, showing how to continue your conversation later
- Added support for full-width (zenkaku) space input from Japanese IME in checkbox selection
- Fixed PDF too large errors permanently locking up sessions, requiring users to start a new conversation
- Fixed bash commands incorrectly reporting failure with "Read-only file system" errors when sandbox mode was enabled
- Fixed a crash that made sessions unusable after entering plan mode when project config in `~/.claude.json` was missing default fields
- Fixed `temperatureOverride` being silently ignored in the streaming API path, causing all streaming requests to use the default temperature (1) regardless of the configured override
- Fixed LSP shutdown/exit compatibility with strict language servers that reject null params
- Improved system prompts to more clearly guide the model toward using dedicated tools (Read, Edit, Glob, Grep) instead of bash equivalents (`cat`, `sed`, `grep`, `find`), reducing unnecessary bash command usage
- Improved PDF and request size error messages to show actual limits (100 pages, 20MB)
- Reduced layout jitter in the terminal when the spinner appears and disappears during streaming
- Removed misleading Anthropic API pricing from model selector for third-party provider (Bedrock, Vertex, Foundry) users


---

## v2.1.30 - v2.1.30

**Released:** 2026-02-03
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.30

### Release Notes

## What's changed

- Added `pages` parameter to the Read tool for PDFs, allowing specific page ranges to be read (e.g., `pages: "1-5"`). Large PDFs (>10 pages) now return a lightweight reference when `@` mentioned instead of being inlined into context.
- Added pre-configured OAuth client credentials for MCP servers that don't support Dynamic Client Registration (e.g., Slack). Use `--client-id` and `--client-secret` with `claude mcp add`.
- Added `/debug` for Claude to help troubleshoot the current session
- Added support for additional `git log` and `git show` flags in read-only mode (e.g., `--topo-order`, `--cherry-pick`, `--format`, `--raw`)
- Added token count, tool uses, and duration metrics to Task tool results
- Added reduced motion mode to the config
- Fixed phantom "(no content)" text blocks appearing in API conversation history, reducing token waste and potential model confusion
- Fixed prompt cache not correctly invalidating when tool descriptions or input schemas changed, only when tool names changed
- Fixed 400 errors that could occur after running `/login` when the conversation contained thinking blocks
- Fixed a hang when resuming sessions with corrupted transcript files containing `parentUuid` cycles
- Fixed rate limit message showing incorrect "/upgrade" suggestion for Max 20x users when extra-usage is unavailable
- Fixed permission dialogs stealing focus while actively typing
- Fixed subagents not being able to access SDK-provided MCP tools because they were not synced to the shared application state
- Fixed a regression where Windows users with a `.bashrc` file could not run bash commands
- Improved memory usage for `--resume` (68% reduction for users with many sessions) by replacing the session index with lightweight stat-based loading and progressive enrichment
- Improved `TaskStop` tool to display the stopped command/task description in the result line instead of a generic "Task stopped" message
- Changed `/model` to execute immediately instead of being queued
- [VSCode] Added multiline input support to the "Other" text input in question dialogs (use Shift+Enter for new lines)
- [VSCode] Fixed duplicate sessions appearing in the session list when starting a new conversation


---

## v2.1.29 - v2.1.29

**Released:** 2026-01-31
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.29

### Release Notes

## What's changed

- Fixed startup performance issues when resuming sessions that have `saved_hook_context`


---

## v2.1.27 - v2.1.27

**Released:** 2026-01-30
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.27

### Release Notes

## What's changed

- Added tool call failures and denials to debug logs
- Fixed context management validation error for gateway users, ensuring `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` avoids the error
- Added `--from-pr` flag to resume sessions linked to a specific GitHub PR number or URL
- Sessions are now automatically linked to PRs when created via `gh pr create`
- Fixed /context command not displaying colored output
- Fixed status bar duplicating background task indicator when PR status was shown
- VSCode: Enabled Claude in Chrome integration
- Permissions now respect content-level `ask` over tool-level `allow`. Previously `allow: ["Bash"], ask: ["Bash(rm *)"]` allowed all bash commands, but will now permission prompt for `rm`.
- Windows: Fixed bash command execution failing for users with `.bashrc` files
- Windows: Fixed console windows flashing when spawning child processes
- VSCode: Fixed OAuth token expiration causing 401 errors after extended sessions


---

## v2.1.25 - v2.1.25

**Released:** 2026-01-29
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.25

### Release Notes

## What's changed

- Fixed beta header validation error for gateway users on Bedrock and Vertex, ensuring `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` avoids the error


---

## v2.1.23 - v2.1.23

**Released:** 2026-01-29
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.23

### Release Notes

## What's changed

- Added customizable spinner verbs setting (`spinnerVerbs`)
- Fixed mTLS and proxy connectivity for users behind corporate proxies or using client certificates
- Fixed per-user temp directory isolation to prevent permission conflicts on shared systems
- Fixed a race condition that could cause 400 errors when prompt caching scope was enabled
- Fixed pending async hooks not being cancelled when headless streaming sessions ended
- Fixed tab completion not updating the input field when accepting a suggestion
- Fixed ripgrep search timeouts silently returning empty results instead of reporting errors
- Improved terminal rendering performance with optimized screen data layout
- Changed Bash commands to show timeout duration alongside elapsed time
- Changed merged pull requests to show a purple status indicator in the prompt footer
- [IDE] Fixed model options displaying incorrect region strings for Bedrock users in headless mode


---

## v2.1.22 - v2.1.22

**Released:** 2026-01-28
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.22

### Release Notes

## What's changed

- Fixed structured outputs for non-interactive (-p) mode


---

## v2.1.21 - v2.1.21

**Released:** 2026-01-28
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.21

### Release Notes

## What's changed

- Added support for full-width (zenkaku) number input from Japanese IME in option selection prompts
- Fixed shell completion cache files being truncated on exit
- Fixed API errors when resuming sessions that were interrupted during tool execution
- Fixed auto-compact triggering too early on models with large output token limits
- Fixed task IDs potentially being reused after deletion
- Fixed file search not working in VS Code extension on Windows
- Improved read/search progress indicators to show "Reading…" while in progress and "Read" when complete
- Improved Claude to prefer file operation tools (Read, Edit, Write) over bash equivalents (cat, sed, awk)
- [VSCode] Added automatic Python virtual environment activation, ensuring `python` and `pip` commands use the correct interpreter (configurable via `claudeCode.usePythonEnvironment` setting)
- [VSCode] Fixed message action buttons having incorrect background colors


---

## v2.1.20 - v2.1.20

**Released:** 2026-01-27
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.20

### Release Notes

## What's changed

- Added arrow key history navigation in vim normal mode when cursor cannot move further
- Added external editor shortcut (Ctrl+G) to the help menu for better discoverability
- Added PR review status indicator to the prompt footer, showing the current branch's PR state (approved, changes requested, pending, or draft) as a colored dot with a clickable link
- Added support for loading `CLAUDE.md` files from additional directories specified via `--add-dir` flag (requires setting `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`)
- Added ability to delete tasks via the `TaskUpdate` tool
- Fixed session compaction issues that could cause resume to load full history instead of the compact summary
- Fixed agents sometimes ignoring user messages sent while actively working on a task
- Fixed wide character (emoji, CJK) rendering artifacts where trailing columns were not cleared when replaced by narrower characters
- Fixed JSON parsing errors when MCP tool responses contain special Unicode characters
- Fixed up/down arrow keys in multi-line and wrapped text input to prioritize cursor movement over history navigation
- Fixed draft prompt being lost when pressing UP arrow to navigate command history
- Fixed ghost text flickering when typing slash commands mid-input
- Fixed marketplace source removal not properly deleting settings
- Fixed duplicate output in some commands like `/context`
- Fixed task list sometimes showing outside the main conversation view
- Fixed syntax highlighting for diffs occurring within multiline constructs like Python docstrings
- Fixed crashes when cancelling tool use
- Improved `/sandbox` command UI to show dependency status with installation instructions when dependencies are missing
- Improved thinking status text with a subtle shimmer animation
- Improved task list to dynamically adjust visible items based on terminal height
- Improved fork conversation hint to show how to resume the original session
- Changed collapsed read/search groups to show present tense ("Reading", "Searching for") while in progress, and past tense ("Read", "Searched for") when complete
- Changed teammate messages to render with rich Markdown formatting (bold, code blocks, lists, etc.) instead of plain text
- Changed `ToolSearch` results to appear as a brief notification instead of inline in the conversation
- Changed the `/commit-push-pr` skill to automatically post PR URLs to Slack channels when configured via MCP tools
- Changed the `/copy` command to be available to all users
- Changed background agents to prompt for tool permissions before launching
- Changed permission rules like `Bash(*)` to be accepted and treated as equivalent to `Bash`
- Changed config backups to be timestamped and rotated (keeping 5 most recent) to prevent data loss


---

## v2.1.19 - v2.1.19

**Released:** 2026-01-23
**URL:** https://github.com/anthropics/claude-code/releases/tag/v2.1.19

### Release Notes

## What's changed

- Added env var `CLAUDE_CODE_ENABLE_TASKS`, set to `false` to keep the old system temporarily
- Added shorthand `$0`, `$1`, etc. for accessing individual arguments in custom commands
- Fixed crashes on processors without AVX instruction support
- Fixed dangling Claude Code processes when terminal is closed by catching EIO errors from `process.exit()` and using SIGKILL as fallback
- Fixed `/rename` and `/tag` not updating the correct session when resuming from a different directory (e.g., git worktrees)
- Fixed resuming sessions by custom title not working when run from a different directory
- Fixed pasted text content being lost when using prompt stash (Ctrl+S) and restore
- Fixed agent list displaying "Sonnet (default)" instead of "Inherit (default)" for agents without an explicit model setting
- Fixed backgrounded hook commands not returning early, potentially causing the session to wait on a process that was intentionally backgrounded
- Fixed file write preview omitting empty lines
- Changed skills without additional permissions or hooks to be allowed without requiring approval
- Changed indexed argument syntax from `$ARGUMENTS.0` to `$ARGUMENTS[0]` (bracket syntax)
- [SDK] Added replay of `queued_command` attachment messages as `SDKUserMessageReplay` events when `replayUserMessages` is enabled
- [VSCode] Enabled session forking and rewind functionality for all users


---
