const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const detectStack = path.join(repoRoot, "skills", "tenantproof", "scripts", "detect-stack.js");

function tempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tenantproof-detect-"));
}

test("detect-stack identifies supported Node SaaS stack", () => {
  const root = tempRepo();
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      dependencies: {
        hono: "^4.0.0",
        "@prisma/client": "^5.0.0",
        pg: "^8.0.0",
      },
      devDependencies: {
        vitest: "^1.0.0",
        supertest: "^6.0.0",
      },
    }),
  );
  fs.writeFileSync(path.join(root, "tsconfig.json"), "{}");
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "routes.ts"), "const tenantId = ctx.user.tenantId;");

  const output = execFileSync("node", [detectStack, root], { encoding: "utf8" });
  const result = JSON.parse(output);

  assert.equal(result.language, "typescript");
  assert.equal(result.runtime, "node");
  assert.deepEqual(result.frameworks, ["hono"]);
  assert.equal(result.orm, "prisma");
  assert.equal(result.database, "postgresql");
  assert.equal(result.testRunner, "vitest");
  assert.equal(result.httpTestClient, "supertest");
  assert.equal(result.packageManager, "unknown");
  assert.ok(result.tenantMarkers.includes("tenantId"));
  assert.equal(result.confidence, "high");
});

test("detect-stack reads YAML tenant markers and Prisma MySQL provider", () => {
  const root = tempRepo();
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({
      dependencies: {
        "@prisma/client": "^5.0.0",
      },
      devDependencies: {
        jest: "^29.0.0",
      },
    }),
  );
  fs.writeFileSync(path.join(root, "tenantproof.config.yaml"), "tenantMarkers:\n  - schoolId\n  - district_id\n");
  fs.mkdirSync(path.join(root, "prisma"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "prisma", "schema.prisma"),
    'datasource db {\n  provider = "mysql"\n  url = env("DATABASE_URL")\n}\n',
  );

  const output = execFileSync("node", [detectStack, root], { encoding: "utf8" });
  const result = JSON.parse(output);

  assert.equal(result.orm, "prisma");
  assert.equal(result.database, "mysql");
  assert.equal(result.testRunner, "jest");
  assert.deepEqual(result.tenantMarkers, ["district_id", "schoolId"]);
});
