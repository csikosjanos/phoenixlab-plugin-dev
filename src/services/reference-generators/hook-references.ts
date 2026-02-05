import { ReferenceManager, type ReferenceFile } from "../reference-manager.ts";
import { ContentExtractor } from "../content-extractor.ts";

const HOOKS_DOC_URL = "https://code.claude.com/docs/en/hooks.md";

export class HookReferenceGenerator {
  private extractor: ContentExtractor;

  constructor(private refManager: ReferenceManager) {
    this.extractor = new ContentExtractor();
  }

  async fetchHooksDocumentation(): Promise<string> {
    const response = await fetch(HOOKS_DOC_URL, {
      headers: {
        "User-Agent": "phoenixlab-plugin-dev/0.1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hooks documentation: ${response.status}`);
    }

    return response.text();
  }

  async generate(): Promise<void> {
    const content = await this.fetchHooksDocumentation();
    await this.generateFromContent(content);
  }

  async generateFromContent(content: string): Promise<void> {
    const refs: ReferenceFile[] = [
      {
        path: "hooks/events-overview.md",
        topic: "Hook Events",
        content: this.generateEventsOverview(content),
        lastUpdated: new Date(),
      },
      {
        path: "hooks/matcher-patterns.md",
        topic: "Matcher Patterns",
        content: this.generateMatcherPatterns(content),
        lastUpdated: new Date(),
      },
      {
        path: "hooks/handler-types.md",
        topic: "Handler Types",
        content: this.generateHandlerTypes(content),
        lastUpdated: new Date(),
      },
      {
        path: "hooks/exit-codes.md",
        topic: "Exit Codes",
        content: this.generateExitCodes(content),
        lastUpdated: new Date(),
      },
      {
        path: "hooks/input-output-schemas.md",
        topic: "Input/Output Schemas",
        content: this.generateInputOutputSchemas(content),
        lastUpdated: new Date(),
      },
      {
        path: "hooks/troubleshooting.md",
        topic: "Troubleshooting",
        content: this.generateTroubleshooting(content),
        lastUpdated: new Date(),
      },
    ];

    for (const ref of refs) {
      await this.refManager.writeReference(ref);
    }
  }

  generateEventsOverview(content: string): string {
    const lines: string[] = [];
    lines.push("# Hook Events");
    lines.push("");
    lines.push("When hooks fire during Claude Code execution.");
    lines.push("");

    // Extract the events table
    const tables = this.extractor.extractTables(content);
    const eventsTable = tables.find(
      (t) => t.headers.includes("Event") && t.headers.includes("When it fires")
    );

    if (eventsTable) {
      lines.push("## Event Reference");
      lines.push("");
      lines.push(`| ${eventsTable.headers.join(" | ")} |`);
      lines.push(`| ${eventsTable.headers.map(() => "---").join(" | ")} |`);
      for (const row of eventsTable.rows) {
        lines.push(`| ${row.join(" | ")} |`);
      }
      lines.push("");
    }

    // Add blocking behavior summary
    lines.push("## Blocking Events");
    lines.push("");
    lines.push("Events that can block actions:");
    lines.push("");
    lines.push("- **PreToolUse**: Exit 2 blocks the tool call");
    lines.push("- **PermissionRequest**: Exit 2 denies the permission");
    lines.push("- **UserPromptSubmit**: Exit 2 rejects the prompt");
    lines.push("- **Stop**: Exit 2 prevents Claude from stopping");

    return lines.join("\n");
  }

  generateMatcherPatterns(content: string): string {
    const lines: string[] = [];
    lines.push("# Matcher Patterns");
    lines.push("");
    lines.push("Filter when hooks fire using regex patterns.");
    lines.push("");

    // Extract matcher table
    const tables = this.extractor.extractTables(content);
    const matcherTable = tables.find(
      (t) =>
        t.headers.some((h) => h.includes("matcher")) ||
        t.headers.includes("What the matcher filters")
    );

    if (matcherTable) {
      lines.push("## Pattern Reference");
      lines.push("");
      lines.push(`| ${matcherTable.headers.join(" | ")} |`);
      lines.push(`| ${matcherTable.headers.map(() => "---").join(" | ")} |`);
      for (const row of matcherTable.rows) {
        lines.push(`| ${row.join(" | ")} |`);
      }
      lines.push("");
    }

    lines.push("## Pattern Syntax");
    lines.push("");
    lines.push("- Use `*` or omit matcher to match all occurrences");
    lines.push("- Patterns are regex: `Edit|Write` matches either tool");
    lines.push("- MCP tools: `mcp__<server>__<tool>` naming pattern");
    lines.push("");
    lines.push("## Examples");
    lines.push("");
    lines.push("```json");
    lines.push('{');
    lines.push('  "matcher": "Bash",           // Exact match');
    lines.push('  "matcher": "Edit|Write",     // Either tool');
    lines.push('  "matcher": "mcp__.*",        // All MCP tools');
    lines.push('  "matcher": ""                // Match all');
    lines.push('}');
    lines.push("```");

    return lines.join("\n");
  }

  generateHandlerTypes(content: string): string {
    const lines: string[] = [];
    lines.push("# Handler Types");
    lines.push("");
    lines.push("Three types of hook handlers to run when events fire.");
    lines.push("");

    lines.push("## Handler Types");
    lines.push("");
    lines.push("| Type | Description | Use Case |");
    lines.push("| --- | --- | --- |");
    lines.push("| `command` | Shell command | Scripts, formatters, validators |");
    lines.push("| `prompt` | Single LLM call | Judgment-based decisions |");
    lines.push("| `agent` | Multi-turn subagent | File inspection, test verification |");
    lines.push("");

    // Extract handler fields table
    const tables = this.extractor.extractTables(content);
    const handlerTable = tables.find(
      (t) => t.headers.includes("Field") && t.headers.includes("Required")
    );

    if (handlerTable) {
      lines.push("## Common Fields");
      lines.push("");
      lines.push(`| ${handlerTable.headers.join(" | ")} |`);
      lines.push(`| ${handlerTable.headers.map(() => "---").join(" | ")} |`);
      for (const row of handlerTable.rows.slice(0, 6)) {
        lines.push(`| ${row.join(" | ")} |`);
      }
      lines.push("");
    }

    lines.push("## Example: Command Hook");
    lines.push("");
    lines.push("```json");
    lines.push('{');
    lines.push('  "type": "command",');
    lines.push('  "command": "./scripts/validate.sh",');
    lines.push('  "timeout": 30');
    lines.push('}');
    lines.push("```");
    lines.push("");
    lines.push("## Example: Prompt Hook");
    lines.push("");
    lines.push("```json");
    lines.push('{');
    lines.push('  "type": "prompt",');
    lines.push('  "prompt": "Check if tasks complete: $ARGUMENTS"');
    lines.push('}');
    lines.push("```");

    return lines.join("\n");
  }

  generateExitCodes(content: string): string {
    const lines: string[] = [];
    lines.push("# Exit Codes");
    lines.push("");
    lines.push("How hook exit codes control Claude Code behavior.");
    lines.push("");

    lines.push("## Exit Code Meanings");
    lines.push("");
    lines.push("| Exit Code | Meaning | Effect |");
    lines.push("| --- | --- | --- |");
    lines.push("| `0` | Success | Action proceeds, stdout parsed for JSON |");
    lines.push("| `2` | Blocking error | Action blocked, stderr shown to Claude |");
    lines.push("| Other | Non-blocking error | Action proceeds, stderr logged |");
    lines.push("");

    // Extract exit code behavior table
    const tables = this.extractor.extractTables(content);
    const exitTable = tables.find(
      (t) => t.headers.includes("Can block?") || t.headers.some((h) => h.includes("exit 2"))
    );

    if (exitTable) {
      lines.push("## Behavior by Event");
      lines.push("");
      lines.push(`| ${exitTable.headers.join(" | ")} |`);
      lines.push(`| ${exitTable.headers.map(() => "---").join(" | ")} |`);
      for (const row of exitTable.rows) {
        lines.push(`| ${row.join(" | ")} |`);
      }
      lines.push("");
    }

    lines.push("## Example: Blocking Script");
    lines.push("");
    lines.push("```bash");
    lines.push("#!/bin/bash");
    lines.push('if [[ "$COMMAND" == *"rm -rf"* ]]; then');
    lines.push('  echo "Blocked: destructive command" >&2');
    lines.push("  exit 2  # Block the action");
    lines.push("fi");
    lines.push("exit 0    # Allow the action");
    lines.push("```");

    return lines.join("\n");
  }

  generateInputOutputSchemas(content: string): string {
    const lines: string[] = [];
    lines.push("# Input/Output Schemas");
    lines.push("");
    lines.push("JSON data hooks receive and return.");
    lines.push("");

    lines.push("## Common Input Fields");
    lines.push("");
    lines.push("All hooks receive these fields on stdin:");
    lines.push("");
    lines.push("| Field | Description |");
    lines.push("| --- | --- |");
    lines.push("| `session_id` | Current session identifier |");
    lines.push("| `transcript_path` | Path to conversation JSON |");
    lines.push("| `cwd` | Current working directory |");
    lines.push("| `permission_mode` | Current permission mode |");
    lines.push("| `hook_event_name` | Name of the event that fired |");
    lines.push("");

    lines.push("## PreToolUse Input");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "session_id": "abc123",');
    lines.push('  "tool_name": "Bash",');
    lines.push('  "tool_input": { "command": "npm test" }');
    lines.push("}");
    lines.push("```");
    lines.push("");

    lines.push("## JSON Output Fields");
    lines.push("");
    lines.push("| Field | Default | Description |");
    lines.push("| --- | --- | --- |");
    lines.push("| `continue` | `true` | If false, stops Claude entirely |");
    lines.push("| `stopReason` | - | Message shown when continue=false |");
    lines.push("| `suppressOutput` | `false` | Hide stdout from verbose mode |");
    lines.push("| `systemMessage` | - | Warning shown to user |");
    lines.push("");

    lines.push("## Decision Control (PreToolUse)");
    lines.push("");
    lines.push("```json");
    lines.push("{");
    lines.push('  "hookSpecificOutput": {');
    lines.push('    "hookEventName": "PreToolUse",');
    lines.push('    "permissionDecision": "deny",');
    lines.push('    "permissionDecisionReason": "Not allowed"');
    lines.push("  }");
    lines.push("}");
    lines.push("```");

    return lines.join("\n");
  }

  generateTroubleshooting(content: string): string {
    const lines: string[] = [];
    lines.push("# Troubleshooting");
    lines.push("");
    lines.push("Common hook issues and solutions.");
    lines.push("");

    lines.push("## Hook Not Firing");
    lines.push("");
    lines.push("- Run `/hooks` to confirm the hook is registered");
    lines.push("- Check matcher pattern matches exactly (case-sensitive)");
    lines.push("- Verify correct event type (PreToolUse vs PostToolUse)");
    lines.push("- PermissionRequest hooks don't fire in non-interactive mode");
    lines.push("");

    lines.push("## Hook Error in Output");
    lines.push("");
    lines.push("- Test script manually: `echo '{}' | ./my-hook.sh`");
    lines.push("- Use absolute paths or `$CLAUDE_PROJECT_DIR`");
    lines.push("- Make script executable: `chmod +x ./my-hook.sh`");
    lines.push("- Install `jq` for JSON parsing");
    lines.push("");

    lines.push("## JSON Validation Failed");
    lines.push("");
    lines.push("Shell profile may print text before JSON output.");
    lines.push("Wrap echo statements in interactive check:");
    lines.push("");
    lines.push("```bash");
    lines.push("# In ~/.zshrc or ~/.bashrc");
    lines.push('if [[ $- == *i* ]]; then');
    lines.push('  echo "Shell ready"');
    lines.push("fi");
    lines.push("```");
    lines.push("");

    lines.push("## Stop Hook Runs Forever");
    lines.push("");
    lines.push("Check `stop_hook_active` to prevent infinite loops:");
    lines.push("");
    lines.push("```bash");
    lines.push('if [ "$(echo "$INPUT" | jq -r \'.stop_hook_active\')" = "true" ]; then');
    lines.push("  exit 0  # Allow Claude to stop");
    lines.push("fi");
    lines.push("```");
    lines.push("");

    lines.push("## Debug Tips");
    lines.push("");
    lines.push("- Run `claude --debug` for execution details");
    lines.push("- Toggle verbose mode with `Ctrl+O`");
    lines.push("- Check exit codes and stderr output");

    return lines.join("\n");
  }
}
