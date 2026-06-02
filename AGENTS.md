# Repository Guidelines

## Project Structure & Module Organization

This repository packages the `tenantproof` Codex Skill and its npm installer.

- `skills/tenantproof/SKILL.md`: main skill instructions and trigger metadata.
- `skills/tenantproof/references/`: focused tenant-isolation, framework, ORM, database, and testing guidance.
- `skills/tenantproof/scripts/`: dependency-free Node.js helper scripts.
- `skills/tenantproof/assets/templates/`: copyable AGENTS, config, CI, and test templates.
- `bin/tenantproof.js`: npm CLI installer and uninstaller.
- `examples/`: vulnerable and fixed Hono/Prisma fixtures.
- `tests/`: Node test suite for detection, installer behavior, and examples.

## Build, Test, and Development Commands

- `npm test`: runs all tests with Node's built-in test runner.
- `node skills/tenantproof/scripts/detect-stack.js --pretty examples/vulnerable-hono-prisma-api`: checks stack detection on the vulnerable fixture.
- `node bin/tenantproof.js install --target repo --dry-run`: previews repo-local install output.
- `npm_config_cache=/tmp/tenantproof-npm-cache npm pack --dry-run`: verifies npm package contents without writing to the default home cache.

## Coding Style & Naming Conventions

Use plain JavaScript for CLI and helper scripts; avoid adding dependencies unless they clearly reduce complexity. Prefer two-space indentation, CommonJS in `bin/` and `scripts/`, and descriptive hyphen-case filenames for references and templates. Keep `SKILL.md` concise; move detailed guidance into `references/`.

## Testing Guidelines

Tests use `node --test` with `node:assert/strict`. Add tests under `tests/*.test.js`. For installer changes, cover dry-run behavior, overwrite protection, and repo/global targets. For skill changes, add fixture assertions or script tests that prove the expected behavior.

## Commit & Pull Request Guidelines

The initial commit uses a concise imperative message: `Implement TenantProof skill MVP`. Follow that style, for example `Add Drizzle migration guidance`. PRs should include a short summary, test results, and links to relevant issues or release notes. Avoid bundling unrelated documentation, installer, and skill behavior changes unless they are part of one feature.

## Security & Configuration Tips

TenantProof is local-first. Scripts must not upload code, read `.env` values, print secrets, or add telemetry. Keep generated tests synthetic and limited to local test environments. Installer changes must never overwrite existing files silently; preserve dry-run and backup behavior.
