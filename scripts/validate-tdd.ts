#!/usr/bin/env bun
/**
 * Plugin-wide CLI wrapper for validating TDD compliance.
 * Ensures all service files have co-located test files.
 */

import { TDDValidator } from "../src/services/tdd-validator.ts";
import { dirname, join } from "node:path";

// Determine plugin root directory
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || dirname(dirname(import.meta.path));
const servicesDir = join(pluginRoot, "src", "services");

async function main() {
  console.log("Validating TDD compliance...\n");

  const validator = new TDDValidator(servicesDir);
  const results = await validator.validateAll();

  if (results.length === 0) {
    console.log("No service files found in src/services/");
    return;
  }

  let hasIssues = false;

  for (const result of results) {
    const status = result.hasTest && result.issues.length === 0 ? "✓" : "✗";

    if (result.issues.length > 0) {
      console.log(`${status} ${result.path}`);
      for (const issue of result.issues) {
        console.log(`    ${issue}`);
      }
      hasIssues = true;
    } else {
      console.log(`${status} ${result.path}`);
    }
  }

  const validCount = results.filter((r) => r.hasTest && r.issues.length === 0).length;
  const totalCount = results.length;

  console.log("");
  console.log(`Summary: ${validCount}/${totalCount} services have valid tests`);

  if (hasIssues) {
    console.log("");
    console.log("TDD validation failed: Some services are missing tests or have empty test files.");
    process.exit(1);
  }

  console.log("");
  console.log("All services have co-located tests.");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
