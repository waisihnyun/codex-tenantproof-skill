# TenantProof

TenantProof is an open-source Codex Skill for SaaS backend maintainers. It helps Codex review code for tenant-isolation bugs, missing authorization checks, unsafe migrations, and PII logging, then generate cross-tenant regression tests so maintainers can prove fixes before merge.

## Quickstart

Install into the current repository:

```bash
npx --yes codex-tenantproof-skill@latest install --target repo
```

This writes:

```text
.agents/skills/tenantproof/
tenantproof.config.example.json
```

Then ask Codex:

```text
Use $tenantproof to review this repository for tenant-isolation risks. Focus on serious findings with concrete evidence and regression-test plans.
```

Install globally:

```bash
npx --yes codex-tenantproof-skill@latest install --target global
```

Preview writes without changing files:

```bash
npx --yes codex-tenantproof-skill@latest install --target repo --dry-run
```

Uninstall:

```bash
npx --yes codex-tenantproof-skill@latest uninstall --target repo
```

## Local Development

From this repository:

```bash
npm test
node skills/tenantproof/scripts/detect-stack.js --pretty examples/vulnerable-hono-prisma-api
node bin/tenantproof.js install --target repo --dry-run
```

Validate the skill metadata with the Codex skill validator when available:

```bash
python3 /home/piccolo/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/tenantproof
```

## Supported Stacks

| Layer | v0.1 support |
| --- | --- |
| Language | TypeScript, JavaScript |
| Runtime | Node.js |
| Frameworks | Hono, Express, NestJS |
| ORM/query builders | Prisma, Drizzle, Knex, raw SQL patterns |
| Databases | PostgreSQL, MySQL |
| Test runners | Vitest, Jest |
| API test helpers | Supertest, Hono app request helpers |
| Package managers | npm, pnpm, yarn |

## Example Prompts

```text
Use $tenantproof in review mode. Review only the changed files in this PR for missing tenant scoping, missing authorization checks, unsafe update/delete operations, unsafe migrations, and PII logging.
```

```text
Use $tenantproof to generate a cross-tenant regression test for GET /api/invoices/:id. A user from tenant A must not read tenant B's invoice.
```

```text
Use $tenantproof to create AGENTS.md review guidelines for this multi-tenant API repository.
```

## Expected Review Shape

TenantProof findings include severity, confidence, evidence, risk, suggested fix, regression test plan, and false-positive considerations. High and Critical findings should include a cross-tenant test plan.

```md
# TenantProof Review

**Verdict:** High Risk
**Scope reviewed:** `src/routes/invoices.ts`
**Detected stack:** Hono, Prisma, PostgreSQL, Vitest
**Tenant markers:** `tenantId`

## Findings

### TP-001: Invoice lookup is not scoped to tenant

**Severity:** High
**Confidence:** High
**File:** `src/routes/invoices.ts`
**Area:** Route / Prisma query

**Evidence:**
The route fetches `invoice.findUnique({ where: { id } })` using only the URL ID.

**Risk:**
A user from tenant A may access tenant B's invoice if the ID is known or guessed.

**Suggested fix:**
Query by both invoice ID and `ctx.user.tenantId`, or use a tenant-scoped service method.

**Regression test plan:**
Create tenant A, tenant B, user A, and invoice B. Authenticate as user A, request `/api/invoices/${invoiceB.id}`, and assert 403 or 404.
```

## Repository Contents

```text
skills/tenantproof/SKILL.md
skills/tenantproof/references/
skills/tenantproof/scripts/detect-stack.js
skills/tenantproof/assets/templates/
bin/tenantproof.js
examples/vulnerable-hono-prisma-api/
examples/fixed-hono-prisma-api/
tests/
```

## Examples

The `examples/` directory contains:

- `vulnerable-hono-prisma-api`: demonstrates an ID-only Prisma lookup that leaks invoices across tenants.
- `fixed-hono-prisma-api`: demonstrates the same route with tenant-scoped lookup and regression test.

See `examples/README.md` for expected TenantProof output and test-generation guidance.

## Limitations

TenantProof is not a full SAST replacement and does not formally prove security. It is a focused Codex Skill for tenant-isolation review and regression-test generation. It runs locally, performs no telemetry by default, and should only be used on repositories you own, maintain, or are authorized to review.

Generated tests may need project-specific factory/auth helper adjustments. TenantProof should mark those as TODOs instead of inventing unavailable helper APIs.

## Contributing

See `CONTRIBUTING.md` for how to add framework references, test templates, and example vulnerabilities.
