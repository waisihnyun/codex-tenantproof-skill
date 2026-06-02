const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");

test("example fixtures expose vulnerable and fixed tenant lookup patterns", () => {
  const vulnerable = fs.readFileSync(
    path.join(repoRoot, "examples", "vulnerable-hono-prisma-api", "src", "app.ts"),
    "utf8",
  );
  const fixed = fs.readFileSync(path.join(repoRoot, "examples", "fixed-hono-prisma-api", "src", "app.ts"), "utf8");
  const fixedTest = fs.readFileSync(
    path.join(repoRoot, "examples", "fixed-hono-prisma-api", "tests", "invoice-tenant-isolation.test.ts"),
    "utf8",
  );

  assert.match(vulnerable, /findUnique\(\{\s*where:\s*\{\s*id\s*\}/s);
  assert.doesNotMatch(vulnerable, /findUnique\(\{\s*where:\s*\{[^}]*tenantId/s);
  assert.match(fixed, /findFirst\(\{\s*where:\s*\{[^}]*id,[^}]*tenantId:\s*user\.tenantId/s);
  assert.match(fixedTest, /expect\(res\.status\)\.toBe\(404\)/);
  assert.match(fixedTest, /tenantId:\s*userA\.tenantId/);
});
