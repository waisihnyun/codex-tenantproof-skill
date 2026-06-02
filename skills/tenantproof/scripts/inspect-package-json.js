#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  const root = path.resolve(args.find((arg) => !arg.startsWith("-")) || process.cwd());
  const pretty = args.includes("--pretty");
  const pkg = readJson(path.join(root, "package.json"));
  if (!pkg) {
    process.stdout.write(JSON.stringify({ found: false }, null, pretty ? 2 : 0));
    process.stdout.write("\n");
    return;
  }
  const sections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
  const dependencies = {};
  for (const section of sections) {
    dependencies[section] = Object.keys(pkg[section] || {}).sort();
  }
  process.stdout.write(
    JSON.stringify(
      {
        found: true,
        name: pkg.name || null,
        type: pkg.type || null,
        packageManager: pkg.packageManager || null,
        scripts: Object.keys(pkg.scripts || {}).sort(),
        dependencies,
      },
      null,
      pretty ? 2 : 0,
    ),
  );
  process.stdout.write("\n");
}

main();
