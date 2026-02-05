#!/usr/bin/env bun
/**
 * Plugin-wide CLI wrapper for validating reference files.
 * Validates progressive disclosure reference files against our rules.
 */

import { ReferenceValidator } from "../src/services/reference-validator.ts";
import { dirname, join } from "node:path";
import { readdir, stat } from "node:fs/promises";

// Determine plugin root directory
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(import.meta.path));

// Parse arguments
const args = process.argv.slice(2);
const validateAll = args.includes("--all");
const skillName = args.find((a) => !a.startsWith("-"));

function printUsage() {
  console.log("Usage: bun run scripts/validate-references.ts <skill-name>");
  console.log("       bun run scripts/validate-references.ts --all");
  console.log("");
  console.log("Options:");
  console.log("  <skill-name>  Name of the skill to validate (e.g., 'claude-code-reference')");
  console.log("  --all         Validate all skills with references/ directories");
  console.log("");
  console.log("Examples:");
  console.log("  bun run scripts/validate-references.ts claude-code-reference");
  console.log("  bun run scripts/validate-references.ts --all");
}

async function findSkillsWithReferences(): Promise<string[]> {
  const skillsDir = join(pluginRoot, "skills");
  const skills: string[] = [];

  try {
    const entries = await readdir(skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const referencesPath = join(skillsDir, entry.name, "references");
        try {
          const refStat = await stat(referencesPath);
          if (refStat.isDirectory()) {
            skills.push(entry.name);
          }
        } catch {
          // No references directory
        }
      }
    }
  } catch {
    // Skills directory doesn't exist
  }

  return skills;
}

async function validateSkill(skillName: string): Promise<boolean> {
  const referencesDir = join(pluginRoot, "skills", skillName, "references");

  try {
    await stat(referencesDir);
  } catch {
    console.error(`Error: Skill '${skillName}' has no references/ directory`);
    return false;
  }

  const validator = new ReferenceValidator(referencesDir);
  const results = await validator.validateAll();

  if (results.length === 0) {
    console.log(`  No reference files found in ${skillName}/references/`);
    return true;
  }

  let hasErrors = false;

  for (const result of results) {
    const status = result.valid ? "✓" : "✗";
    const issues = [...result.errors, ...result.warnings];

    if (issues.length > 0) {
      console.log(`  ${status} ${result.path}`);
      for (const error of result.errors) {
        console.log(`      [ERROR] ${error.rule}: ${error.message}`);
        hasErrors = true;
      }
      for (const warning of result.warnings) {
        console.log(`      [WARN]  ${warning.rule}: ${warning.message}`);
      }
    } else {
      console.log(`  ${status} ${result.path}`);
    }
  }

  const validCount = results.filter((r) => r.valid).length;
  const totalCount = results.length;

  console.log("");
  console.log(`  Summary: ${validCount}/${totalCount} files valid`);

  return !hasErrors;
}

async function main() {
  if (!validateAll && !skillName) {
    printUsage();
    process.exit(1);
  }

  let skills: string[];

  if (validateAll) {
    skills = await findSkillsWithReferences();
    if (skills.length === 0) {
      console.log("No skills with references/ directories found.");
      return;
    }
    console.log(`Found ${skills.length} skill(s) with references\n`);
  } else {
    skills = [skillName!];
  }

  let allValid = true;

  for (const skill of skills) {
    console.log(`Validating ${skill}/references/...\n`);
    const valid = await validateSkill(skill);
    if (!valid) {
      allValid = false;
    }
    console.log("");
  }

  if (!allValid) {
    console.log("Some reference files have errors.");
    process.exit(1);
  }

  console.log("All reference files are valid.");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
