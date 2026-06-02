#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const METHODS = ["get", "post", "put", "patch", "delete"];
const SENSITIVE_WORDS = [
  "admin",
  "api-key",
  "apikey",
  "billing",
  "document",
  "export",
  "file",
  "invoice",
  "payment",
  "report",
  "user",
];
const IGNORE_DIRS = new Set([".git", "node_modules", "dist", "build", "coverage", ".next"]);

function walk(root, limit = 1000) {
  const files = [];
  const stack = [root];
  while (stack.length && files.length < limit) {
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
      } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
        files.push(full);
      }
    }
  }
  return files;
}

function inspectFile(root, file) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  const hits = [];
  const routePattern = new RegExp(`\\b(?:app|router|route)\\.(${METHODS.join("|")})\\s*\\(\\s*["'\`]([^"'\`]+)`, "i");
  lines.forEach((line, index) => {
    const match = routePattern.exec(line);
    if (!match) return;
    const route = match[2];
    const lowered = route.toLowerCase();
    hits.push({
      file: path.relative(root, file),
      line: index + 1,
      method: match[1].toUpperCase(),
      route,
      sensitive: /\/:id\b/.test(route) || SENSITIVE_WORDS.some((word) => lowered.includes(word)),
    });
  });
  return hits;
}

function main() {
  const args = process.argv.slice(2);
  const root = path.resolve(args.find((arg) => !arg.startsWith("-")) || process.cwd());
  const pretty = args.includes("--pretty");
  const routes = [];
  for (const file of walk(root)) {
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }
    if (stat.size > 512 * 1024) continue;
    routes.push(...inspectFile(root, file));
  }
  process.stdout.write(JSON.stringify({ routes }, null, pretty ? 2 : 0));
  process.stdout.write("\n");
}

main();
