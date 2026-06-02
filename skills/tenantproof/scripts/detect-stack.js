#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TENANT_MARKERS = [
  "tenantId",
  "tenant_id",
  "orgId",
  "org_id",
  "organizationId",
  "organization_id",
  "workspaceId",
  "workspace_id",
  "accountId",
  "account_id",
  "teamId",
  "team_id",
  "companyId",
  "company_id",
  "customerId",
  "customer_id",
  "projectId",
  "project_id",
];

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".cache",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".sql",
  ".prisma",
  ".md",
]);

function parseArgs(argv) {
  const args = { root: process.cwd(), pretty: false };
  for (const arg of argv) {
    if (arg === "--pretty") args.pretty = true;
    else if (!arg.startsWith("-")) args.root = path.resolve(arg);
  }
  return args;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function exists(root, relative) {
  return fs.existsSync(path.join(root, relative));
}

function listFiles(root, limit = 1000) {
  const out = [];
  const stack = [root];
  while (stack.length && out.length < limit) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) stack.push(full);
      } else if (entry.isFile()) {
        out.push(full);
        if (out.length >= limit) break;
      }
    }
  }
  return out;
}

function dependencyNames(pkg) {
  const sections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
  const names = new Set();
  for (const section of sections) {
    for (const name of Object.keys(pkg?.[section] || {})) names.add(name);
  }
  return names;
}

function detectPackageManager(root, pkg) {
  if (exists(root, "pnpm-lock.yaml")) return "pnpm";
  if (exists(root, "yarn.lock")) return "yarn";
  if (exists(root, "package-lock.json")) return "npm";
  if (pkg?.packageManager) return String(pkg.packageManager).split("@")[0];
  return "unknown";
}

function detectFromDeps(deps, files) {
  const frameworks = [];
  if (deps.has("hono")) frameworks.push("hono");
  if (deps.has("express")) frameworks.push("express");
  if (deps.has("@nestjs/core") || deps.has("@nestjs/common")) frameworks.push("nestjs");

  let orm = "unknown";
  if (deps.has("prisma") || deps.has("@prisma/client")) orm = "prisma";
  else if (deps.has("drizzle-orm")) orm = "drizzle";
  else if (deps.has("knex")) orm = "knex";

  let database = "unknown";
  if (deps.has("pg") || deps.has("postgres")) database = "postgresql";
  else if (deps.has("mysql") || deps.has("mysql2")) database = "mysql";

  let testRunner = "unknown";
  if (deps.has("vitest") || files.some((f) => /vitest\.config\.[cm]?[jt]s$/.test(f))) testRunner = "vitest";
  else if (deps.has("jest") || files.some((f) => /jest\.config\.[cm]?[jt]s$/.test(f))) testRunner = "jest";

  let httpTestClient = "unknown";
  if (deps.has("supertest")) httpTestClient = "supertest";
  else if (frameworks.includes("hono")) httpTestClient = "hono";

  return { frameworks, orm, database, testRunner, httpTestClient };
}

function detectDatabaseFromFiles(root, files) {
  for (const file of files) {
    if (!file.endsWith(".prisma")) continue;
    const full = path.join(root, file);
    let content = "";
    try {
      content = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const provider = /provider\s*=\s*"([^"]+)"/.exec(content)?.[1];
    if (provider === "postgresql") return "postgresql";
    if (provider === "mysql") return "mysql";
    if (provider) return provider;
  }
  return "unknown";
}

function detectLanguage(root, files) {
  if (exists(root, "tsconfig.json") || files.some((f) => [".ts", ".tsx"].includes(path.extname(f)))) {
    return "typescript";
  }
  if (exists(root, "package.json") || files.some((f) => [".js", ".jsx", ".mjs", ".cjs"].includes(path.extname(f)))) {
    return "javascript";
  }
  return "unknown";
}

function loadConfigMarkers(root) {
  for (const name of ["tenantproof.config.json", ".tenantproof.json"]) {
    const config = readJson(path.join(root, name));
    if (Array.isArray(config?.tenantMarkers)) return config.tenantMarkers.filter((v) => typeof v === "string");
  }
  for (const name of ["tenantproof.config.yaml", ".tenantproof.yaml"]) {
    const markers = readYamlTenantMarkers(path.join(root, name));
    if (markers.length) return markers;
  }
  return [];
}

function readYamlTenantMarkers(file) {
  if (!fs.existsSync(file)) return [];
  let content = "";
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const inline = /^\s*tenantMarkers\s*:\s*\[(.*?)\]\s*$/m.exec(content);
  if (inline) {
    return inline[1]
      .split(",")
      .map((value) => value.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  const block = /^\s*tenantMarkers\s*:\s*$/m.exec(content);
  if (!block) return [];
  const after = content.slice(block.index + block[0].length).split(/\r?\n/);
  const markers = [];
  for (const line of after) {
    const item = /^\s*-\s*([^#\s].*?)\s*$/.exec(line);
    if (item) {
      markers.push(item[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    if (/^\S/.test(line)) break;
  }
  return markers.filter(Boolean);
}

function detectTenantMarkers(files, root) {
  const markers = new Set(loadConfigMarkers(root));
  const pattern = new RegExp(`\\b(${TENANT_MARKERS.join("|")})\\b`, "g");
  for (const file of files) {
    if (markers.size >= TENANT_MARKERS.length) break;
    const ext = path.extname(file);
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (stat.size > 512 * 1024 || path.basename(file).startsWith(".env")) continue;
    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const match of content.matchAll(pattern)) markers.add(match[1]);
  }
  return Array.from(markers).sort();
}

function confidence(result) {
  let score = 0;
  if (result.language !== "unknown") score++;
  if (result.frameworks.length) score++;
  if (result.orm !== "unknown") score++;
  if (result.testRunner !== "unknown") score++;
  if (result.tenantMarkers.length) score++;
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = args.root;
  const pkg = readJson(path.join(root, "package.json")) || {};
  const files = listFiles(root);
  const deps = dependencyNames(pkg);
  const relativeFiles = files.map((f) => path.relative(root, f));
  const stack = detectFromDeps(deps, relativeFiles);
  const detectedDatabase = detectDatabaseFromFiles(root, relativeFiles);
  if (stack.database === "unknown" && detectedDatabase !== "unknown") stack.database = detectedDatabase;
  const result = {
    language: detectLanguage(root, files),
    runtime: exists(root, "package.json") ? "node" : "unknown",
    frameworks: stack.frameworks,
    orm: stack.orm,
    database: stack.database,
    testRunner: stack.testRunner,
    httpTestClient: stack.httpTestClient,
    packageManager: detectPackageManager(root, pkg),
    tenantMarkers: detectTenantMarkers(files, root),
    confidence: "low",
  };
  result.confidence = confidence(result);
  process.stdout.write(JSON.stringify(result, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main();
