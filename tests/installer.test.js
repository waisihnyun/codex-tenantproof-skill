const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const cli = path.join(repoRoot, "bin", "tenantproof.js");

function tempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "tenantproof-install-"));
}

test("installer help exits successfully", () => {
  const output = execFileSync("node", [cli, "--help"], { encoding: "utf8" });
  assert.match(output, /TenantProof Skill installer/);
  assert.match(output, /install \[--target repo\|global\]/);
});

test("installer dry-run prints repo-local target files without writing", () => {
  const root = tempRepo();
  const output = execFileSync("node", [cli, "install", "--target", "repo", "--dry-run"], {
    cwd: root,
    encoding: "utf8",
  });

  assert.match(output, /Dry run: would write/);
  assert.match(output, /\.agents\/skills\/tenantproof\/SKILL\.md/);
  assert.match(output, /tenantproof\.config\.example\.json/);
  assert.equal(fs.existsSync(path.join(root, ".agents")), false);
});

test("installer copies skill and config to repo target", () => {
  const root = tempRepo();
  execFileSync("node", [cli, "install", "--target", "repo"], { cwd: root, encoding: "utf8" });

  assert.equal(fs.existsSync(path.join(root, ".agents", "skills", "tenantproof", "SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(root, ".agents", "skills", "tenantproof", "references", "tenant-isolation.md")), true);
  assert.equal(fs.existsSync(path.join(root, "tenantproof.config.example.json")), true);
});

test("installer copies skill to global target", () => {
  const home = tempRepo();
  execFileSync("node", [cli, "install", "--target", "global"], {
    cwd: tempRepo(),
    env: { ...process.env, HOME: home },
    encoding: "utf8",
  });

  assert.equal(fs.existsSync(path.join(home, ".agents", "skills", "tenantproof", "SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(home, "tenantproof.config.example.json")), false);
});

test("global uninstall removes installed skill", () => {
  const home = tempRepo();
  const env = { ...process.env, HOME: home };
  execFileSync("node", [cli, "install", "--target", "global"], { cwd: tempRepo(), env, encoding: "utf8" });
  execFileSync("node", [cli, "uninstall", "--target", "global"], { cwd: tempRepo(), env, encoding: "utf8" });

  assert.equal(fs.existsSync(path.join(home, ".agents", "skills", "tenantproof")), false);
});

test("installer backs up existing files before overwrite", () => {
  const root = tempRepo();
  fs.mkdirSync(path.join(root, ".agents", "skills", "tenantproof"), { recursive: true });
  fs.writeFileSync(path.join(root, ".agents", "skills", "tenantproof", "SKILL.md"), "old");
  fs.writeFileSync(path.join(root, "tenantproof.config.example.json"), "{}");

  const output = execFileSync("node", [cli, "install", "--target", "repo"], {
    cwd: root,
    encoding: "utf8",
  });

  assert.match(output, /Backed up existing skill/);
  assert.match(output, /Backed up existing config/);
  const backups = fs.readdirSync(path.join(root, ".agents", "skills")).filter((name) => name.startsWith("tenantproof.backup-"));
  assert.equal(backups.length, 1);
});

test("uninstall removes installed skill and leaves config unless requested", () => {
  const root = tempRepo();
  execFileSync("node", [cli, "install", "--target", "repo"], { cwd: root, encoding: "utf8" });
  execFileSync("node", [cli, "uninstall", "--target", "repo"], { cwd: root, encoding: "utf8" });

  assert.equal(fs.existsSync(path.join(root, ".agents", "skills", "tenantproof")), false);
  assert.equal(fs.existsSync(path.join(root, "tenantproof.config.example.json")), true);

  execFileSync("node", [cli, "uninstall", "--target", "repo", "--remove-config"], { cwd: root, encoding: "utf8" });
  assert.equal(fs.existsSync(path.join(root, "tenantproof.config.example.json")), false);
});
