#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const SKILL_SOURCE = path.join(PACKAGE_ROOT, "skills", "tenantproof");
const CONFIG_SOURCE = path.join(SKILL_SOURCE, "assets", "templates", "tenantproof.config.json");

function usage() {
  return `TenantProof Skill installer

Usage:
  codex-tenantproof-skill install [--target repo|global] [--dry-run] [--force]
  codex-tenantproof-skill uninstall [--target repo|global] [--dry-run] [--remove-config]

Options:
  --target repo     Install to .agents/skills/tenantproof in the current repository.
  --target global   Install to $HOME/.agents/skills/tenantproof.
  --dry-run         Print planned file operations without writing.
  --force           Replace existing install targets after creating backups.
  --remove-config   During uninstall, also remove tenantproof.config.example.json.
`;
}

function parseArgs(argv) {
  const args = {
    command: argv[0],
    target: "repo",
    dryRun: false,
    force: false,
    removeConfig: false,
  };
  if (args.command === "--help" || args.command === "-h") {
    args.command = "help";
    return args;
  }
  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--target") {
      args.target = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--target=")) {
      args.target = arg.slice("--target=".length);
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--remove-config") {
      args.removeConfig = true;
    } else if (arg === "--help" || arg === "-h") {
      args.command = "help";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!["repo", "global"].includes(args.target)) {
    throw new Error("--target must be repo or global");
  }
  return args;
}

function targetPaths(target) {
  if (target === "global") {
    const home = os.homedir();
    return {
      skillDir: path.join(home, ".agents", "skills", "tenantproof"),
      configPath: path.join(home, "tenantproof.config.example.json"),
    };
  }
  return {
    skillDir: path.join(process.cwd(), ".agents", "skills", "tenantproof"),
    configPath: path.join(process.cwd(), "tenantproof.config.example.json"),
  };
}

function walkFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  return files.sort();
}

function backupPath(target) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${target}.backup-${stamp}`;
}

function ensureReplaceable(target, options) {
  if (!fs.existsSync(target)) return null;
  const backup = backupPath(target);
  if (options.dryRun) return backup;
  if (!options.force) {
    fs.renameSync(target, backup);
    return backup;
  }
  fs.renameSync(target, backup);
  return backup;
}

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function relativeList(sourceRoot, targetRoot) {
  return walkFiles(sourceRoot).map((file) => path.join(targetRoot, path.relative(sourceRoot, file)));
}

function install(args) {
  if (!fs.existsSync(SKILL_SOURCE)) {
    throw new Error(`Skill source not found: ${SKILL_SOURCE}`);
  }
  const targets = targetPaths(args.target);
  const planned = relativeList(SKILL_SOURCE, targets.skillDir);
  if (args.target === "repo") planned.push(targets.configPath);

  if (args.dryRun) {
    console.log("Dry run: would write the following files:");
    for (const file of planned) console.log(`- ${file}`);
    if (fs.existsSync(targets.skillDir)) console.log(`Would back up existing skill to ${backupPath(targets.skillDir)}`);
    if (args.target === "repo" && fs.existsSync(targets.configPath)) {
      console.log(`Would back up existing config to ${backupPath(targets.configPath)}`);
    }
    return;
  }

  const skillBackup = ensureReplaceable(targets.skillDir, args);
  copyRecursive(SKILL_SOURCE, targets.skillDir);
  if (args.target === "repo") {
    const configBackup = ensureReplaceable(targets.configPath, args);
    copyRecursive(CONFIG_SOURCE, targets.configPath);
    if (configBackup) console.log(`Backed up existing config to ${configBackup}`);
  }
  if (skillBackup) console.log(`Backed up existing skill to ${skillBackup}`);
  console.log(`Installed TenantProof skill to ${targets.skillDir}`);
  if (args.target === "repo") {
    console.log("Created tenantproof.config.example.json");
    console.log('Next step: ask Codex, "Use $tenantproof to review this repository for tenant-isolation risks."');
  }
}

function uninstall(args) {
  const targets = targetPaths(args.target);
  const planned = [];
  if (fs.existsSync(targets.skillDir)) planned.push(targets.skillDir);
  if (args.removeConfig && fs.existsSync(targets.configPath)) planned.push(targets.configPath);

  if (args.dryRun) {
    if (planned.length === 0) {
      console.log("Dry run: no installed TenantProof files found.");
      return;
    }
    console.log("Dry run: would remove the following paths:");
    for (const item of planned) console.log(`- ${item}`);
    return;
  }

  for (const item of planned) fs.rmSync(item, { recursive: true, force: false });
  if (planned.length === 0) console.log("No installed TenantProof files found.");
  else console.log("Removed TenantProof install files.");
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (!args.command || args.command === "help") {
      console.log(usage());
      return;
    }
    if (args.command === "install") install(args);
    else if (args.command === "uninstall") uninstall(args);
    else throw new Error(`Unknown command: ${args.command}`);
  } catch (error) {
    console.error(error.message);
    console.error("");
    console.error(usage());
    process.exit(1);
  }
}

main();
