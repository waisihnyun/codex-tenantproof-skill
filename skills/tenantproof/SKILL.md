---
name: tenantproof
description: Use when reviewing multi-tenant SaaS backend/API code, routes, controllers, services, ORM queries, SQL migrations, authorization checks, tests, or PR diffs for tenant isolation, cross-tenant access, IDOR, missing authorization, unsafe migrations, PII logging, or when generating cross-tenant regression tests and AGENTS.md review guidance.
---

# TenantProof

Review backend/API code for one invariant: tenant A must not read, mutate, delete, export, infer, or administer tenant B's data.

Stay focused on tenant isolation and adjacent authorization risk. Avoid unrelated style, formatting, or general security comments unless they directly affect tenant boundaries.

## Operating Modes

Infer the mode from the request:

- **Review mode:** inspect a PR, diff, files, or repository area for tenant-boundary risks.
- **Test generation mode:** create a cross-tenant regression test for a route, controller, service, repository method, or migration concern.
- **AGENTS.md mode:** generate repository-specific Codex review guidance for tenant isolation.
- **Migration review mode:** review schema/migration changes for tenant ownership, unsafe indexes, risky backfills, and cross-tenant aggregates.

Do not use this skill for unauthorized testing of third-party systems, frontend-only style changes, complete SAST replacement, production exploitation, or secret scanning as the main task.

## First Steps

1. Inspect the user's requested scope first: current diff, PR, file, route, migration, or repository.
2. Run `node skills/tenantproof/scripts/detect-stack.js --pretty` when this skill is available repo-locally and stack detection would help.
3. Read config hints from `tenantproof.config.json`, `tenantproof.config.yaml`, `.tenantproof.json`, or `.tenantproof.yaml` when present.
4. Identify tenant markers such as `tenantId`, `tenant_id`, `orgId`, `organizationId`, `workspaceId`, `accountId`, `teamId`, `companyId`, `customerId`, and `projectId`.
5. Identify auth context paths such as `ctx.user.*`, `req.user.*`, `session.user.*`, `c.get("user")`, decorators/guards, or repository-specific helpers.

## References

Load references only when needed:

- `references/tenant-isolation.md` for the core review model and suspicious patterns.
- `references/authorization.md` for auth middleware, roles, and untrusted tenant sources.
- `references/database-migrations.md` for migration and schema review.
- `references/pii-logging.md` for logging and data leakage checks.
- `references/node-hono.md`, `references/node-express.md`, or `references/node-nestjs.md` when that framework is detected.
- `references/prisma.md`, `references/drizzle.md`, or `references/knex.md` when that ORM/query builder is detected.
- `references/postgres.md` or `references/mysql.md` when database-specific migration guidance is needed.
- `references/testing-node.md` when generating tests.

## Review Workflow

1. Determine the reviewed scope and nearby reachable code. For PRs, inspect changed files plus callers/callees needed to understand tenant context.
2. Prioritize sensitive operations: read/list, create with tenant ownership, update, delete, export, report, upload/download, billing, user/admin, API key, integration, and file/document access.
3. Trace tenant context from authentication/session/middleware to route/controller/service/repository/database query.
4. Treat tenant identifiers from body/query/header/path params as suspicious unless validated against authenticated context.
5. Flag ID-only lookup/update/delete patterns on tenant-owned models when no tenant scope is visible.
6. Inspect raw SQL for missing tenant filters, string interpolation, cross-tenant joins, aggregate reports, and bypassed ORM scopes.
7. Inspect migrations for tenant-owned tables without boundary columns, unsafe unique indexes, missing tenant indexes, risky nullable tenant fields, and cross-tenant reporting tables.
8. Inspect logs for PII or tenant-sensitive metadata only when adjacent to tenant-sensitive code.
9. Report only concrete evidence or strong suspicious patterns. State confidence and false-positive considerations.

## Test Generation Workflow

1. Detect test runner and request helper from `package.json`, config files, and existing tests.
2. Search existing tests for factories, fixtures, seed helpers, auth/login helpers, app exports, and denied-status conventions.
3. Generate a minimal local test with tenant A, tenant B, user A, and a resource owned by tenant B.
4. Authenticate as user A using an existing helper when possible.
5. Exercise the suspicious route or method against tenant B's resource.
6. Assert 403 or 404 unless the repository has a stricter convention.
7. Include explicit TODOs when helpers are unknown; do not invent opaque helper APIs without marking them.
8. Never call production services, real third-party endpoints, or destructive non-test operations.

Use `assets/templates/vitest-supertest.test.ts` or `assets/templates/jest-supertest.test.ts` as a starting point when Supertest is detected.

## AGENTS.md Workflow

Use `assets/templates/AGENTS.md` as the baseline, then customize it with detected tenant markers, auth middleware, ORM, migration paths, test runner, and denied-status conventions.

## Severity

- **Critical:** confirmed or highly likely cross-tenant read/write/delete/export of sensitive data.
- **High:** strong suspicious pattern that can expose or mutate tenant data.
- **Medium:** risky pattern requiring maintainer confirmation.
- **Low:** defense-in-depth issue, such as missing tenant index.
- **Info:** non-blocking observation, such as missing cross-tenant tests.

Confidence:

- **High:** evidence is in reviewed code or reachable context.
- **Medium:** suspicious pattern may be protected elsewhere.
- **Low:** heuristic match only; manual confirmation required.

## Output Contract

Use this structure for reviews:

```md
# TenantProof Review

**Verdict:** Safe / Needs Review / High Risk / Critical Risk
**Scope reviewed:** Files, diff, or module names
**Detected stack:** Framework, ORM, DB, test runner
**Tenant markers:** tenantId, orgId, workspaceId, etc.

## Findings

### TP-001: Finding title

**Severity:** Critical / High / Medium / Low / Info
**Confidence:** High / Medium / Low
**File:** path/to/file.ts
**Area:** Route / Controller / Service / Repository / Migration / Test

**Evidence:**
Explain the exact code pattern that triggered the concern.

**Risk:**
Explain the possible tenant-boundary failure.

**Suggested fix:**
Provide concrete remediation guidance.

**Regression test plan:**
Describe the cross-tenant test scenario.

## Generated test or patch

Include test code only when requested or clearly useful.

## False-positive considerations

List assumptions that may reduce or invalidate the finding.
```

When no issues are found, say that clearly and include the scope and residual test gaps. Do not claim tenant isolation is proven unless the reviewed evidence and tests actually prove it.

## Safety And Privacy

- Read local repository files only.
- Do not read `.env` values or print environment variables unless the user explicitly asks.
- Do not upload code, secrets, telemetry, repository metadata, or scan results.
- Generate tests for code the user owns, maintains, or is authorized to review.
- Keep generated tests synthetic and local to the repository's test environment.
