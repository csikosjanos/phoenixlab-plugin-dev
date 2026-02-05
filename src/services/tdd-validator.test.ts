import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { TDDValidator, type TDDValidationResult } from "./tdd-validator.ts";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("TDDValidator", () => {
  let tempDir: string;
  let validator: TDDValidator;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "tdd-validator-test-"));
    validator = new TDDValidator(tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("validateAll", () => {
    it("returns success for service with co-located test", async () => {
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");
      await writeFile(join(tempDir, "my-service.test.ts"), `describe("MyService", () => { it("works", () => {}); });`);

      const results = await validator.validateAll();

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe("my-service.ts");
      expect(results[0].hasTest).toBe(true);
      expect(results[0].testPath).toBe("my-service.test.ts");
      expect(results[0].issues).toHaveLength(0);
    });

    it("returns failure for service without test file", async () => {
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");

      const results = await validator.validateAll();

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe("my-service.ts");
      expect(results[0].hasTest).toBe(false);
      expect(results[0].testPath).toBeNull();
      expect(results[0].issues.some((i) => i.includes("missing"))).toBe(true);
    });

    it("excludes test files from service file list", async () => {
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");
      await writeFile(join(tempDir, "my-service.test.ts"), `describe("test", () => {});`);

      const results = await validator.validateAll();

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe("my-service.ts");
    });

    it("excludes index.ts files", async () => {
      await writeFile(join(tempDir, "index.ts"), "export * from './my-service.ts';");
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");
      await writeFile(join(tempDir, "my-service.test.ts"), `describe("test", () => {});`);

      const results = await validator.validateAll();

      expect(results).toHaveLength(1);
      expect(results.every((r) => !r.path.includes("index.ts"))).toBe(true);
    });

    it("validates multiple services", async () => {
      await writeFile(join(tempDir, "service-a.ts"), "export class ServiceA {}");
      await writeFile(join(tempDir, "service-a.test.ts"), `describe("A", () => { it("works", () => {}); });`);
      await writeFile(join(tempDir, "service-b.ts"), "export class ServiceB {}");
      // No test for service-b

      const results = await validator.validateAll();

      expect(results).toHaveLength(2);
      expect(results.find((r) => r.path === "service-a.ts")?.hasTest).toBe(true);
      expect(results.find((r) => r.path === "service-b.ts")?.hasTest).toBe(false);
    });
  });

  describe("empty test file detection", () => {
    it("warns when test file is empty", async () => {
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");
      await writeFile(join(tempDir, "my-service.test.ts"), "// Just a comment\n");

      const results = await validator.validateAll();

      expect(results[0].hasTest).toBe(true);
      expect(results[0].issues.some((i) => i.includes("empty") || i.includes("no tests"))).toBe(true);
    });

    it("warns when test file has no describe or it blocks", async () => {
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");
      await writeFile(join(tempDir, "my-service.test.ts"), "import { MyService } from './my-service.ts';\n\nconst x = 1;\n");

      const results = await validator.validateAll();

      expect(results[0].hasTest).toBe(true);
      expect(results[0].issues.some((i) => i.includes("no tests"))).toBe(true);
    });

    it("passes when test file has describe block", async () => {
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");
      await writeFile(join(tempDir, "my-service.test.ts"), `describe("MyService", () => {});`);

      const results = await validator.validateAll();

      expect(results[0].issues).toHaveLength(0);
    });

    it("passes when test file has it block", async () => {
      await writeFile(join(tempDir, "my-service.ts"), "export class MyService {}");
      await writeFile(join(tempDir, "my-service.test.ts"), `it("should work", () => {});`);

      const results = await validator.validateAll();

      expect(results[0].issues).toHaveLength(0);
    });
  });

  describe("findMissingTests", () => {
    it("returns list of services without tests", async () => {
      await writeFile(join(tempDir, "has-test.ts"), "export class HasTest {}");
      await writeFile(join(tempDir, "has-test.test.ts"), `describe("test", () => {});`);
      await writeFile(join(tempDir, "missing-test.ts"), "export class MissingTest {}");
      await writeFile(join(tempDir, "also-missing.ts"), "export class AlsoMissing {}");

      const missing = await validator.findMissingTests();

      expect(missing).toHaveLength(2);
      expect(missing).toContain("missing-test.ts");
      expect(missing).toContain("also-missing.ts");
      expect(missing).not.toContain("has-test.ts");
    });

    it("returns empty array when all services have tests", async () => {
      await writeFile(join(tempDir, "service.ts"), "export class Service {}");
      await writeFile(join(tempDir, "service.test.ts"), `describe("test", () => {});`);

      const missing = await validator.findMissingTests();

      expect(missing).toHaveLength(0);
    });
  });

  describe("subdirectory handling", () => {
    it("validates services in subdirectories", async () => {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(join(tempDir, "generators"));
      await writeFile(join(tempDir, "generators", "base-generator.ts"), "export class BaseGenerator {}");
      await writeFile(join(tempDir, "generators", "base-generator.test.ts"), `describe("base", () => {});`);

      const results = await validator.validateAll();

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe("generators/base-generator.ts");
      expect(results[0].hasTest).toBe(true);
    });

    it("excludes subdirectory index files", async () => {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(join(tempDir, "generators"));
      await writeFile(join(tempDir, "generators", "index.ts"), "export * from './base-generator.ts';");
      await writeFile(join(tempDir, "generators", "base-generator.ts"), "export class BaseGenerator {}");
      await writeFile(join(tempDir, "generators", "base-generator.test.ts"), `describe("base", () => {});`);

      const results = await validator.validateAll();

      expect(results).toHaveLength(1);
      expect(results[0].path).toBe("generators/base-generator.ts");
    });
  });
});
