# Product Requirements Document: Codex TenantProof Skill

**Product name:** `codex-tenantproof-skill`  
**Skill name:** `tenantproof`  
**Document type:** Product Requirements Document (PRD)  
**Version:** 1.0  
**Status:** Draft for MVP planning  
**Last updated:** 2026-06-02  
**Primary owner:** Piccolo / Maintainer TBD  
**License target:** Apache-2.0 or MIT  
**Repository target:** Public open-source GitHub repository  

---

## 1. Executive Summary

`codex-tenantproof-skill` is an open-source Codex Skill that helps developers and open-source maintainers review SaaS backend code for tenant-isolation regressions, missing authorization checks, unsafe database changes, and sensitive-data leakage.

The skill is designed for Codex users working in repositories that serve multiple tenants, organizations, workspaces, accounts, teams, or projects. Its core job is to help Codex move beyond generic security review and produce actionable, tenant-boundary-focused output:

```text
Finding → evidence → suggested fix → generated regression test → verification guidance
```

The MVP will ship as a reusable Codex Skill with supporting references, templates, and lightweight scripts. It will focus first on Node.js/TypeScript backend projects using Hono, Express, NestJS, Prisma, Drizzle, Knex, PostgreSQL, MySQL, Vitest, Jest, and Supertest.

The larger product vision is to become the default Codex Skill for proving that tenant A cannot access tenant B's data in modern SaaS applications.

---

## 2. Background and Context

Multi-tenant applications are common in SaaS systems. A single application may serve many customers, teams, organizations, or workspaces. In these systems, authorization bugs are especially dangerous because a small missing filter or policy check can expose another tenant's private data.

Common tenant-isolation failures include:

- Querying by resource ID without tenant scope.
- Updating or deleting records without `tenantId`, `orgId`, `workspaceId`, or equivalent boundary filters.
- Accepting tenant identifiers from request input instead of deriving them from authenticated context.
- Adding new tables without tenant ownership fields.
- Adding admin or export routes without explicit authorization checks.
- Logging personally identifiable information or tenant-sensitive metadata.
- Introducing raw SQL or report queries that bypass ORM-level scopes.

Generic AI code review tools may detect some of these risks, but their findings are often broad. TenantProof focuses on one specific security invariant: **a user from one tenant must not be able to read, mutate, export, infer, or administer data belonging to another tenant.**

Codex Skills provide a compact way to package repeatable instructions, references, scripts, and templates so Codex can apply a workflow consistently across CLI, IDE, and repository contexts. TenantProof will use that format to make tenant-isolation review repeatable for maintainers.

---

## 3. Product Vision

TenantProof should become a practical, installable skill that developers can add to a repository or personal Codex environment whenever they work on multi-tenant backend systems.

The long-term vision is:

> TenantProof helps maintainers prove tenant isolation in every pull request by combining specialized review guidance, framework-specific heuristics, and generated cross-tenant regression tests.

The product should feel like a senior backend/security reviewer who asks:

- Is every sensitive route protected?
- Is every tenant-owned query scoped to the authenticated tenant?
- Can tenant A guess tenant B's ID and access data?
- Did this migration create a new isolation gap?
- Is there a runnable test that proves the boundary?

---

## 4. Problem Statement

Open-source maintainers and SaaS backend teams often lack a repeatable process for reviewing tenant-isolation risks. They may rely on manual review, scattered conventions, or generic static analysis. This creates gaps:

1. **Tenant-boundary issues are easy to miss.** A single missing `tenantId` filter in a route, service, repository, or raw SQL query can create a severe data leak.
2. **Generic review comments are not enough.** Developers need precise file-level evidence, suggested fixes, and ideally a failing regression test.
3. **Test generation is tedious.** Writing cross-tenant tests requires fixtures for two tenants, two users, authentication, and one protected resource.
4. **Repository conventions differ.** Each project may use different tenant names, ORM conventions, auth middleware, test frameworks, and route patterns.
5. **Maintainers need reviewable artifacts.** A useful tool should produce code, comments, templates, and checklists that fit into existing GitHub and CI workflows.

---

## 5. Goals and Non-Goals

### 5.1 Goals

| ID | Goal | Description |
|---|---|---|
| G-001 | Provide focused tenant-isolation review | Help Codex inspect backend/API changes for tenant-boundary risks. |
| G-002 | Generate runnable regression tests | Produce cross-tenant tests that demonstrate whether a resource is properly isolated. |
| G-003 | Support practical Node.js SaaS stacks first | Prioritize Hono, Express, NestJS, Prisma, Drizzle, Knex, PostgreSQL, MySQL, Jest, Vitest, and Supertest. |
| G-004 | Work as a Codex Skill | Package the workflow as a skill folder with `SKILL.md`, references, optional scripts, and templates. |
| G-005 | Be local-first and open-source | Avoid external services in the MVP. Keep scripts inspectable and safe. |
| G-006 | Produce maintainer-friendly output | Findings should include severity, evidence, risk, suggested fix, and test plan. |
| G-007 | Fit PR-review workflows | Make output easy to paste into GitHub PR comments or run through Codex GitHub review workflows. |

### 5.2 Non-Goals

| ID | Non-Goal | Rationale |
|---|---|---|
| NG-001 | Full SAST replacement | TenantProof is specialized tenant-isolation guidance, not a complete static analysis suite. |
| NG-002 | Runtime firewall or RASP | The MVP does not block production requests. It reviews code and generates tests. |
| NG-003 | Automated exploitation of third-party systems | TenantProof must only generate local test cases for code the user owns or is authorized to review. |
| NG-004 | Full support for every framework in v0.1 | The MVP must be narrow enough to ship quickly and be useful. |
| NG-005 | Hosted SaaS dashboard | Initial distribution is a Codex Skill and optional installer package. |
| NG-006 | Perfect vulnerability detection | The product provides high-signal review assistance, not a formal proof of security. |
| NG-007 | Secret scanning as the main feature | PII/secret logging checks are secondary to tenant-boundary proof. |

---

## 6. Target Users and Personas

### 6.1 Primary Personas

#### Persona A: Open-source SaaS maintainer

- Maintains a public backend/API framework, starter kit, or multi-tenant SaaS app.
- Reviews community pull requests.
- Needs consistent security review guidance without slowing contribution velocity.
- Wants Codex to identify serious risks and produce useful comments.

**Primary need:** Catch cross-tenant data access regressions before merge.

#### Persona B: Full-stack/backend developer

- Builds Node.js, Laravel, or Spring Boot SaaS products.
- Works with REST APIs, database models, auth middleware, and ORM queries.
- Needs help writing edge-case tests around tenant isolation.

**Primary need:** Generate a test that proves a route does not expose another tenant's data.

#### Persona C: Security-conscious reviewer

- Reviews PRs for authorization and data-exposure risks.
- Wants precise findings, not generic security checklists.
- Needs a repeatable format for evidence, severity, and remediation guidance.

**Primary need:** Convert suspicious code patterns into reproducible test cases.

#### Persona D: Project lead adopting Codex

- Wants to add specialized repository guidance for Codex.
- Needs an `AGENTS.md` baseline and skill installation instructions.
- Wants a low-friction open-source tool instead of building internal prompts.

**Primary need:** Install a ready-made tenant-isolation workflow quickly.

---

## 7. User Stories

| ID | User Story | Priority |
|---|---|---|
| US-001 | As a maintainer, I want Codex to review a PR for missing tenant filters so that cross-tenant bugs are caught before merge. | P0 |
| US-002 | As a backend developer, I want Codex to generate a failing cross-tenant test so that I can prove the vulnerability and verify the fix. | P0 |
| US-003 | As a reviewer, I want findings to include file references, affected route/query, risk, and suggested fix so that comments are actionable. | P0 |
| US-004 | As a developer, I want the skill to detect my stack so that generated tests match my framework and test runner. | P0 |
| US-005 | As a maintainer, I want an `AGENTS.md` template so that Codex review follows project-specific tenant-isolation rules. | P1 |
| US-006 | As a developer, I want migration review so that new tenant-owned tables include tenant boundaries and safe indexes. | P1 |
| US-007 | As a maintainer, I want GitHub Action examples so that I can run TenantProof in PR workflows. | P1 |
| US-008 | As a contributor, I want clear false-positive notes so that I know when a finding requires manual confirmation. | P1 |
| US-009 | As a project lead, I want no telemetry by default so that repository code remains private. | P0 |
| US-010 | As an advanced user, I want configurable tenant marker names like `tenantId`, `orgId`, and `workspaceId`. | P1 |
| US-011 | As a Laravel maintainer, I want Eloquent policy/scope support. | P2 |
| US-012 | As a Spring Boot maintainer, I want JPA and Spring Security support. | P2 |

---

## 8. Product Principles

1. **Proof over opinion.** Prefer generated regression tests and concrete evidence over generic warnings.
2. **Tenant context comes from auth.** Treat tenant identifiers from request body, query params, or headers as suspicious unless validated against authenticated context.
3. **Small, focused, reusable.** The skill should solve tenant-boundary review, not every security task.
4. **Local-first.** Scripts should operate on the local repository and avoid network calls unless the user explicitly opts in.
5. **Explain uncertainty.** Findings must clearly distinguish confirmed issues from suspicious patterns requiring maintainer verification.
6. **Fit existing projects.** Generated tests should reuse existing test frameworks, factories, auth helpers, and naming conventions where possible.
7. **Minimize noisy comments.** Default output should prioritize high-impact issues, not style suggestions.

---

## 9. Scope

### 9.1 MVP Scope: v0.1

The first release will provide one Codex Skill named `tenantproof` with four operating modes:

1. **Review mode**  
   Reviews repository code, changed files, or PR diffs for tenant-isolation and authorization risks.

2. **Test generation mode**  
   Generates cross-tenant regression tests for a suspicious route, controller, service, or repository method.

3. **AGENTS.md generation mode**  
   Generates repository-specific Codex review guidance for tenant-isolation, authorization, migration safety, and PII logging.

4. **Migration review mode**  
   Reviews database migrations for missing tenant ownership, risky indexes, unsafe defaults, and possible data exposure.

### 9.2 MVP Supported Stack

| Layer | Supported in v0.1 |
|---|---|
| Language | TypeScript, JavaScript |
| Runtime | Node.js |
| Frameworks | Hono, Express, NestJS |
| ORM/query builders | Prisma, Drizzle, Knex, raw SQL patterns |
| Databases | PostgreSQL, MySQL |
| Test runners | Vitest, Jest |
| API test helpers | Supertest, Hono testing utilities where available |
| Package managers | npm, pnpm, yarn |
| Repository formats | Monorepo and single-package Node repositories |

### 9.3 Post-MVP Scope

| Version | Planned Expansion |
|---|---|
| v0.2 | Laravel, Eloquent, Policies/Gates, Pest/PHPUnit templates |
| v0.3 | Spring Boot, JPA/Hibernate, Spring Security, JUnit templates |
| v0.4 | GitHub Action workflow generator and PR comment templates |
| v0.5 | SARIF output and integration with code-scanning dashboards |
| v1.0 | Cross-framework stable release with benchmark examples and documentation site |

---

## 10. Core Use Cases

### 10.1 Use Case 1: Review a PR for tenant-isolation risk

**User prompt:**

```text
Use $tenantproof to review this PR for tenant isolation, missing authorization, unsafe migrations, and PII logging.
```

**Expected behavior:**

Codex should:

1. Identify changed route, controller, service, repository, ORM, migration, and test files.
2. Determine tenant markers used by the repository.
3. Inspect sensitive operations: read, list, update, delete, export, upload, report, admin action.
4. Check whether tenant scoping is derived from authenticated context.
5. Produce findings only when there is concrete evidence or a strong suspicious pattern.
6. Propose a fix and test plan for each high-risk finding.

**Expected output:**

```text
TenantProof Review

Verdict: High Risk
Scope: PR diff and affected route/service files

Finding TP-001: Possible cross-tenant read
Severity: High
File: src/routes/invoices.ts
Route: GET /api/invoices/:id
Evidence: Invoice lookup filters by id only and does not include tenantId/orgId/workspaceId.
Risk: A user from tenant A may access tenant B's invoice if the ID is known or guessed.
Suggested fix: Add tenantId from authenticated context to the query filter.
Regression test: Generate a test that creates tenant A, tenant B, user A, invoice B, then asserts user A receives 403 or 404.
```

---

### 10.2 Use Case 2: Generate a cross-tenant regression test

**User prompt:**

```text
Use $tenantproof to generate a failing regression test for GET /api/invoices/:id. Tenant A must not read tenant B's invoice.
```

**Expected behavior:**

Codex should:

1. Detect the test runner and test file conventions.
2. Locate existing test setup, auth helpers, factories, fixtures, and seed utilities.
3. Reuse existing helpers when possible.
4. Generate a minimal test that creates two tenants, two users, and a resource owned by tenant B.
5. Authenticate as tenant A.
6. Attempt to access tenant B's resource.
7. Assert `403` or `404`, depending on repository conventions.
8. Avoid inventing unavailable helpers unless adding clear TODOs or scaffolding.

**Example generated test:**

```ts
it("prevents tenant A from reading tenant B invoice", async () => {
  const tenantA = await createTenant();
  const tenantB = await createTenant();

  const userA = await createUser({ tenantId: tenantA.id });
  const invoiceB = await createInvoice({ tenantId: tenantB.id });

  const tokenA = await loginAndGetToken(userA);

  const res = await request(app)
    .get(`/api/invoices/${invoiceB.id}`)
    .set("Authorization", `Bearer ${tokenA}`);

  expect([403, 404]).toContain(res.status);
});
```

---

### 10.3 Use Case 3: Generate repository-specific `AGENTS.md` guidance

**User prompt:**

```text
Use $tenantproof to create AGENTS.md review guidelines for this multi-tenant API repository.
```

**Expected behavior:**

Codex should:

1. Detect common tenant marker names.
2. Detect frameworks and test runners.
3. Generate review guidance focused on tenant isolation.
4. Include examples of high-risk patterns.
5. Include project-specific route, ORM, and migration conventions where discoverable.

**Example output snippet:**

```md
## Review guidelines

- Verify every tenant-owned read, update, delete, export, and report query is scoped by tenant context.
- Tenant context must come from authenticated user/session context, not from request body or untrusted query parameters.
- Treat queries that filter by `id` only on tenant-owned models as high risk.
- Verify admin routes use explicit role/permission middleware.
- For database migrations, verify tenant-owned tables include `tenant_id` or the repository's equivalent boundary field.
- Generated tests should include two tenants and assert cross-tenant access returns 403 or 404.
```

---

### 10.4 Use Case 4: Review database migrations

**User prompt:**

```text
Use $tenantproof to review the new migrations for tenant-safety risks.
```

**Expected behavior:**

Codex should inspect migration files for:

- New tables without tenant ownership fields.
- Tenant-owned tables without indexes on tenant boundary fields.
- Backfills that mix tenant data.
- New unique indexes that should include tenant scope.
- Foreign keys that reference tenant-owned records without tenant consistency checks.
- New nullable tenant boundary fields without a migration/backfill plan.
- New export/report/materialized-view tables that aggregate across tenants.

---

## 11. Functional Requirements

### 11.1 Skill Packaging Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-001 | Provide a valid `tenantproof/SKILL.md` file | P0 | Skill folder contains `SKILL.md` with required metadata and instructions. |
| FR-002 | Include references for tenant isolation, authorization, migrations, and stack-specific patterns | P0 | `references/` contains at least four focused Markdown documents. |
| FR-003 | Include optional scripts for stack detection | P0 | `scripts/detect-stack.js` outputs detected language, framework, ORM, DB, and test runner as JSON. |
| FR-004 | Include test templates | P0 | `assets/templates/` includes Jest/Supertest and Vitest/Supertest templates. |
| FR-005 | Support repo-local installation | P0 | Installer can copy the skill to `.agents/skills/tenantproof`. |
| FR-006 | Support global installation | P1 | Installer can copy the skill to `$HOME/.agents/skills/tenantproof`. |
| FR-007 | Provide README quickstart | P0 | README includes install, usage, examples, and supported stacks. |

### 11.2 Review Mode Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-101 | Identify tenant marker names | P0 | Detects common names such as `tenantId`, `tenant_id`, `orgId`, `organizationId`, `workspaceId`, `accountId`, `teamId`, `companyId`, and custom config. |
| FR-102 | Detect sensitive operations | P0 | Flags read/list/update/delete/export/report/admin operations for review. |
| FR-103 | Check query scoping | P0 | Identifies ORM/query patterns that filter by `id` only on tenant-owned resources. |
| FR-104 | Check tenant context source | P0 | Flags tenant IDs accepted from body/query/header when not validated against auth context. |
| FR-105 | Check authorization middleware | P0 | Detects route handlers lacking obvious auth or role middleware when accessing tenant-owned resources. |
| FR-106 | Check raw SQL risk | P1 | Flags raw SQL that appears tenant-owned but lacks tenant filters or uses string interpolation. |
| FR-107 | Check PII logging | P1 | Flags logs containing emails, tokens, payment identifiers, addresses, session data, or tenant-sensitive metadata. |
| FR-108 | Produce severity-ranked findings | P0 | Output groups findings as Critical, High, Medium, Low, or Informational. |
| FR-109 | Include evidence for each finding | P0 | Each finding includes file path, function/route/query where possible, and reasoning. |
| FR-110 | Include suggested fix | P0 | Each High/Critical finding includes a concrete remediation pattern. |
| FR-111 | Include regression test plan | P0 | Each High/Critical finding includes a test scenario. |
| FR-112 | Minimize noisy style comments | P0 | Skill instructions explicitly avoid unrelated style or formatting comments. |

### 11.3 Test Generation Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-201 | Detect test runner | P0 | Identifies Jest or Vitest from package.json, config files, or existing tests. |
| FR-202 | Detect API test helper | P0 | Identifies Supertest, Hono test client, or existing request helper. |
| FR-203 | Reuse existing factories | P0 | Searches for factory/fixture/seed helpers before generating new scaffolding. |
| FR-204 | Generate two-tenant setup | P0 | Test includes tenant A, tenant B, user A, and resource B. |
| FR-205 | Authenticate as tenant A | P0 | Test uses detected auth helper or includes TODO fallback. |
| FR-206 | Assert denied access | P0 | Test expects 403 or 404 based on project convention, or permits both if unclear. |
| FR-207 | Place test in appropriate path | P1 | Suggests or creates test under existing convention, e.g. `tests/security/tenant-isolation/`. |
| FR-208 | Explain required TODOs | P0 | If helpers are unknown, generated code includes explicit TODOs and instructions. |
| FR-209 | Avoid destructive operations | P0 | Generated tests must not call production services or external endpoints. |
| FR-210 | Generate update/delete tests | P1 | Supports cross-tenant mutation tests for PATCH/PUT/DELETE routes. |

### 11.4 AGENTS.md Generation Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-301 | Generate review guidelines | P0 | Produces an `AGENTS.md` section focused on tenant isolation and authorization. |
| FR-302 | Include project conventions | P1 | Uses detected auth middleware, tenant markers, ORM, and test runner names. |
| FR-303 | Include severity guidance | P1 | Defines what should be treated as P0/P1 or High/Critical. |
| FR-304 | Include migration guidance | P1 | Adds rules for tenant-owned schema changes. |
| FR-305 | Include test expectations | P0 | Requires cross-tenant regression tests for sensitive routes. |

### 11.5 Migration Review Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-401 | Detect new tenant-owned tables | P0 | Flags likely tenant-owned tables without tenant boundary columns. |
| FR-402 | Detect unsafe unique constraints | P1 | Suggests tenant-scoped unique indexes where appropriate. |
| FR-403 | Detect missing tenant indexes | P1 | Flags tenant boundary columns without useful indexes for common access patterns. |
| FR-404 | Detect risky backfills | P1 | Flags backfills that may mix data across tenants. |
| FR-405 | Detect cross-tenant aggregates | P1 | Flags reporting/materialized-view changes that aggregate tenant data without controls. |
| FR-406 | Support Prisma migrations | P0 | Reads common Prisma migration SQL files. |
| FR-407 | Support Drizzle migrations | P1 | Reads common Drizzle migration SQL/TS files. |
| FR-408 | Support Knex migrations | P1 | Reads common Knex migration files. |

### 11.6 Installer and Developer Experience Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-501 | Provide npm package | P0 | Users can install using `npx --yes codex-tenantproof-skill@latest install`. |
| FR-502 | Provide dry-run mode | P0 | Installer can show files that would be written without writing them. |
| FR-503 | Avoid overwriting files silently | P0 | Installer prompts or creates backups when target files exist. |
| FR-504 | Provide uninstall command | P1 | Users can remove installed skill files cleanly. |
| FR-505 | Provide examples | P0 | Repository includes at least one vulnerable and one fixed Node.js example. |
| FR-506 | Provide contribution guide | P1 | Includes `CONTRIBUTING.md` for new stack templates and heuristics. |

---

## 12. Non-Functional Requirements

| ID | Category | Requirement | Priority |
|---|---|---|---|
| NFR-001 | Security | Scripts must not exfiltrate code, secrets, environment variables, or repository metadata. | P0 |
| NFR-002 | Privacy | Telemetry must be disabled by default. | P0 |
| NFR-003 | Performance | Stack detection should finish within 5 seconds for typical repositories. | P1 |
| NFR-004 | Reliability | Generated test templates should be syntactically valid TypeScript for supported stacks. | P0 |
| NFR-005 | Maintainability | References should be modular and stack-specific to reduce SKILL.md bloat. | P0 |
| NFR-006 | Compatibility | Installer should support Linux, macOS, and Windows where Node.js is available. | P1 |
| NFR-007 | Transparency | Generated findings must state confidence and assumptions. | P0 |
| NFR-008 | Safety | Skill must not provide guidance for unauthorized exploitation of third-party systems. | P0 |
| NFR-009 | Documentation | README must include clear examples and limitations. | P0 |
| NFR-010 | Versioning | Releases should use semantic versioning. | P1 |

---

## 13. Product UX and Interaction Design

### 13.1 Installation Flow

#### Repo-local install

```bash
npx --yes codex-tenantproof-skill@latest install --target repo
```

Expected result:

```text
Installed TenantProof skill to .agents/skills/tenantproof
Created tenantproof.config.example.json
Next step: ask Codex, "Use $tenantproof to review this repository for tenant-isolation risks."
```

#### Global install

```bash
npx --yes codex-tenantproof-skill@latest install --target global
```

Expected result:

```text
Installed TenantProof skill to $HOME/.agents/skills/tenantproof
```

#### Dry run

```bash
npx --yes codex-tenantproof-skill@latest install --target repo --dry-run
```

Expected result:

```text
Dry run: would write the following files:
- .agents/skills/tenantproof/SKILL.md
- .agents/skills/tenantproof/references/tenant-isolation.md
- .agents/skills/tenantproof/references/node-prisma.md
- .agents/skills/tenantproof/assets/templates/vitest-supertest.test.ts
```

---

### 13.2 Codex Usage Flow: Review

Prompt:

```text
Use $tenantproof in review mode. Review the current changes for tenant isolation, missing authorization, unsafe migrations, and PII logging. Focus only on serious issues.
```

Codex should:

1. Load `tenantproof/SKILL.md`.
2. Run or inspect stack detection if useful.
3. Read relevant references only as needed.
4. Inspect changed files and nearby context.
5. Return a structured review.

---

### 13.3 Codex Usage Flow: Generate Test

Prompt:

```text
Use $tenantproof in test generation mode. Generate a regression test proving tenant A cannot access tenant B's invoice through GET /api/invoices/:id.
```

Codex should:

1. Identify route handler.
2. Identify model/table.
3. Identify existing test setup.
4. Generate a test file or patch.
5. Explain how to run the test.

---

### 13.4 Codex Usage Flow: Generate `AGENTS.md`

Prompt:

```text
Use $tenantproof to create AGENTS.md guidance for this repository. The app is a multi-tenant SaaS API.
```

Codex should produce:

- Review guidelines.
- Tenant marker conventions.
- Auth middleware expectations.
- Query/migration/test expectations.
- Examples of risky patterns.

---

## 14. Output Contract

### 14.1 Review Output Format

TenantProof review output must follow this structure:

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

Include test code if requested or clearly useful.

## False-positive considerations

List any assumptions that may reduce or invalidate the finding.
```

### 14.2 Severity Definitions

| Severity | Definition | Example |
|---|---|---|
| Critical | Confirmed or highly likely cross-tenant read/write/delete/export of sensitive data. | `GET /invoices/:id` fetches by ID only and returns invoice details. |
| High | Strong suspicious pattern that can expose or mutate tenant data. | Update/delete query lacks tenant scope. |
| Medium | Risky pattern requiring maintainer confirmation. | Tenant ID from query param is used but may be validated elsewhere. |
| Low | Defense-in-depth issue. | Missing tenant index that could cause performance or query-plan risk. |
| Info | Non-blocking observation. | No cross-tenant tests found for a sensitive route. |

### 14.3 Confidence Definitions

| Confidence | Meaning |
|---|---|
| High | Evidence is present in the changed code or reachable context. |
| Medium | Pattern is suspicious but may be protected by code outside reviewed context. |
| Low | Heuristic match only; manual confirmation required. |

---

## 15. Detection Model and Heuristics

TenantProof is not expected to implement a full static analyzer in v0.1. Instead, the skill provides Codex with a structured review method and optional scripts/templates.

### 15.1 Tenant Marker Detection

Search for common tenant boundary names:

```text
tenantId
tenant_id
orgId
org_id
organizationId
organization_id
workspaceId
workspace_id
accountId
account_id
teamId
team_id
companyId
company_id
customerId
customer_id
projectId
project_id
```

Also inspect:

- Auth/session types.
- Database schemas.
- ORM models.
- Middleware names.
- Existing tests.
- Config file overrides.

### 15.2 High-Risk Query Patterns

Flag patterns such as:

```ts
prisma.invoice.findUnique({ where: { id } })
prisma.invoice.findFirst({ where: { id } })
prisma.invoice.update({ where: { id }, data })
prisma.invoice.delete({ where: { id } })
```

unless tenant scope is clearly enforced elsewhere.

Safer pattern:

```ts
prisma.invoice.findFirst({
  where: {
    id,
    tenantId: ctx.user.tenantId,
  },
});
```

### 15.3 Suspicious Tenant Source Patterns

Flag when tenant identifiers are derived from untrusted input:

```ts
const tenantId = req.body.tenantId;
const tenantId = req.query.tenantId;
const tenantId = req.headers["x-tenant-id"];
```

Safer pattern:

```ts
const tenantId = ctx.user.tenantId;
```

or:

```ts
const tenantId = session.user.organizationId;
```

### 15.4 Sensitive Route Patterns

Prioritize review for routes involving:

- `GET /:id`
- `PATCH /:id`
- `PUT /:id`
- `DELETE /:id`
- `/admin/*`
- `/export/*`
- `/reports/*`
- `/billing/*`
- `/users/*`
- `/invoices/*`
- `/files/*`
- `/documents/*`
- `/api-keys/*`
- `/integrations/*`

### 15.5 Migration Risk Patterns

Flag migrations that:

- Create tenant-owned tables without tenant boundary columns.
- Create unique indexes on names/slugs/emails that should likely be tenant-scoped.
- Backfill data across tenants without a deterministic mapping.
- Add nullable tenant boundary fields without a backfill or constraint plan.
- Create materialized views or reports that aggregate across tenants.
- Add foreign keys to tenant-owned tables without tenant consistency checks.

### 15.6 PII and Sensitive Logging Patterns

Flag logs involving:

- Emails.
- Passwords.
- Tokens.
- API keys.
- Session IDs.
- Payment identifiers.
- Addresses.
- Full request bodies.
- Authorization headers.
- Tenant-private metadata.

---

## 16. Configuration

TenantProof should support an optional repository config file.

### 16.1 Config File Name

Preferred names:

```text
tenantproof.config.json
tenantproof.config.yaml
.tenantproof.json
.tenantproof.yaml
```

### 16.2 Example Config

```json
{
  "tenantMarkers": ["tenantId", "orgId", "workspaceId"],
  "authContextPaths": ["ctx.user.tenantId", "req.user.orgId", "session.user.workspaceId"],
  "adminMiddleware": ["requireAdmin", "requireRole", "canManageTenant"],
  "authMiddleware": ["requireAuth", "authenticate", "withAuth"],
  "safeGlobalTables": ["countries", "currencies", "feature_flags"],
  "sensitiveModels": ["Invoice", "User", "Document", "ApiKey", "PaymentMethod"],
  "test": {
    "runner": "vitest",
    "httpClient": "supertest",
    "defaultDeniedStatuses": [403, 404]
  }
}
```

### 16.3 Config Requirements

| ID | Requirement | Priority |
|---|---|---|
| CFG-001 | Support tenant marker overrides | P1 |
| CFG-002 | Support auth context path hints | P1 |
| CFG-003 | Support safe global table allowlist | P1 |
| CFG-004 | Support denied status expectations | P1 |
| CFG-005 | Support stack hints when detection fails | P2 |

---

## 17. Proposed Repository Structure

```text
codex-tenantproof-skill/
  README.md
  LICENSE
  package.json
  CHANGELOG.md
  CONTRIBUTING.md
  SECURITY.md

  skills/
    tenantproof/
      SKILL.md
      references/
        tenant-isolation.md
        authorization.md
        database-migrations.md
        pii-logging.md
        node-hono.md
        node-express.md
        node-nestjs.md
        prisma.md
        drizzle.md
        knex.md
        postgres.md
        mysql.md
        testing-node.md
      scripts/
        detect-stack.js
        inspect-routes.js
        inspect-package-json.js
      assets/
        templates/
          AGENTS.md
          tenantproof.config.json
          vitest-supertest.test.ts
          jest-supertest.test.ts
          github-action-review.yml

  examples/
    vulnerable-hono-prisma-api/
    fixed-hono-prisma-api/
    vulnerable-express-knex-api/

  tests/
    installer.test.ts
    detect-stack.test.ts
```

---

## 18. Skill File Requirements

### 18.1 `SKILL.md` Metadata

The skill must have a clear name and trigger description.

```md
---
name: tenantproof
description: Use when reviewing multi-tenant SaaS backend/API code, routes, controllers, services, ORM queries, SQL migrations, authorization checks, or tests for tenant isolation, cross-tenant access, IDOR, missing authorization, PII logging, unsafe migrations, or when generating cross-tenant regression tests.
---
```

### 18.2 `SKILL.md` Instruction Requirements

The instruction body should include:

1. Mission and scope.
2. When to use the skill.
3. When not to use the skill.
4. Review workflow.
5. Test generation workflow.
6. Severity definitions.
7. Output contract.
8. Safety and privacy constraints.
9. References to load for specific frameworks.

### 18.3 Reference Loading Strategy

The `SKILL.md` should remain concise and instruct Codex to load references only when needed:

- Use `references/prisma.md` only when Prisma is detected.
- Use `references/node-hono.md` only when Hono is detected.
- Use `references/database-migrations.md` when migration files are changed.
- Use `references/testing-node.md` when generating tests.

---

## 19. GitHub and CI Integration

### 19.1 MVP

The MVP will include a documented prompt-based workflow for Codex GitHub review and a sample GitHub Action template, but the skill itself will not require GitHub integration.

### 19.2 Example GitHub Action Template

```yaml
name: TenantProof Codex Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  tenantproof-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Codex TenantProof review
        uses: openai/codex-action@v1
        with:
          prompt: |
            Use $tenantproof in review mode.
            Review this pull request for tenant isolation, missing authorization,
            unsafe migrations, and PII logging. Focus only on serious issues.
```

### 19.3 AGENTS.md Integration

TenantProof should provide a template that maintainers can merge into root-level `AGENTS.md`.

The template should guide Codex to:

- Treat cross-tenant data access as high priority.
- Verify auth middleware wraps sensitive routes.
- Verify tenant-owned queries include tenant scope.
- Require regression tests for sensitive route changes.
- Avoid noisy comments unrelated to security or tenant isolation.

---

## 20. Success Metrics

### 20.1 Adoption Metrics

| Metric | Target for first 90 days |
|---|---:|
| GitHub stars | 100+ |
| npm weekly downloads | 250+ |
| Public example repos using the skill | 5+ |
| External issues/feature requests | 10+ |
| Community PRs | 3+ |

### 20.2 Quality Metrics

| Metric | Target |
|---|---:|
| Valid test template generation for supported demo repos | 90%+ |
| Stack detection accuracy on curated examples | 85%+ |
| False-positive rate for High/Critical findings in examples | Under 30% |
| High/Critical findings include test plan | 100% |
| Installer does not overwrite existing files without confirmation | 100% |

### 20.3 Maintainer Value Metrics

| Metric | Target |
|---|---:|
| Time to install and run first review | Under 10 minutes |
| Time to generate first test from a route | Under 5 minutes |
| Documentation quickstart completion rate in user testing | 80%+ |
| Example vulnerability reproduced by generated test | 80%+ in supported demo repos |

---

## 21. MVP Acceptance Criteria

The v0.1 MVP is complete when all of the following are true:

1. A user can install the skill locally into `.agents/skills/tenantproof` using an npm package.
2. The skill contains a valid `SKILL.md` file and modular references.
3. The repository includes at least two working example apps: one vulnerable and one fixed.
4. Codex can use the skill to identify a missing tenant filter in the vulnerable example.
5. Codex can generate a Jest or Vitest cross-tenant regression test for the vulnerable route.
6. The generated test pattern is documented and reviewable.
7. README includes quickstart, supported stacks, example prompts, limitations, and contribution instructions.
8. No telemetry or network calls are performed by default.
9. Installer supports dry-run mode and avoids silent overwrites.
10. The project has a license, security policy, and contribution guide.

---

## 22. Example Prompts

### 22.1 General Review

```text
Use $tenantproof to review the current branch for tenant-isolation bugs. Focus on route handlers, service methods, ORM queries, raw SQL, migrations, and tests. Only report serious issues with concrete evidence.
```

### 22.2 PR Diff Review

```text
Use $tenantproof in review mode. Review only the changed files in this PR. Look for missing tenant scoping, missing authorization checks, unsafe update/delete operations, and PII logging.
```

### 22.3 Test Generation

```text
Use $tenantproof to generate a cross-tenant regression test for PATCH /api/projects/:id. A user from tenant A must not update tenant B's project.
```

### 22.4 Migration Review

```text
Use $tenantproof to review the new database migrations. Check for tenant-owned tables without tenant_id, unsafe unique indexes, risky backfills, and cross-tenant reporting tables.
```

### 22.5 AGENTS.md Generation

```text
Use $tenantproof to generate AGENTS.md review guidelines for this repository. It is a multi-tenant SaaS backend using Hono, Prisma, PostgreSQL, and Vitest.
```

---

## 23. Example Review Finding

```md
# TenantProof Review

**Verdict:** High Risk  
**Scope reviewed:** `src/routes/invoices.ts`, `src/services/invoice-service.ts`  
**Detected stack:** Hono, Prisma, PostgreSQL, Vitest  
**Tenant markers:** `tenantId`  

## Findings

### TP-001: Invoice lookup is not scoped to tenant

**Severity:** High  
**Confidence:** High  
**File:** `src/services/invoice-service.ts`  
**Area:** Service / Prisma query  

**Evidence:**
The invoice lookup uses `findUnique({ where: { id } })`. The query does not include `tenantId`, and the route accepts `id` from the URL.

**Risk:**
A user from tenant A may access tenant B's invoice if they know or guess the invoice ID.

**Suggested fix:**
Use `findFirst` or a compound unique constraint with tenant scope:

```ts
await prisma.invoice.findFirst({
  where: {
    id: invoiceId,
    tenantId: ctx.user.tenantId,
  },
});
```

**Regression test plan:**
Create tenant A, tenant B, user A, and invoice B. Authenticate as user A and request `/api/invoices/${invoiceB.id}`. Assert 403 or 404.

**False-positive considerations:**
If `getInvoiceById` is always called behind a service-level tenant guard, point TenantProof to that guard or add repository guidance in `AGENTS.md`.
```

---

## 24. Example Generated Test Template

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app";
import {
  createTenant,
  createUser,
  createInvoice,
  loginAndGetToken,
} from "../helpers/factories";

describe("tenant isolation: invoices", () => {
  it("prevents tenant A from reading tenant B invoice", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();

    const userA = await createUser({ tenantId: tenantA.id });
    const invoiceB = await createInvoice({ tenantId: tenantB.id });

    const tokenA = await loginAndGetToken(userA);

    const res = await request(app)
      .get(`/api/invoices/${invoiceB.id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect([403, 404]).toContain(res.status);
  });
});
```

---

## 25. Technical Architecture

### 25.1 Components

| Component | Responsibility |
|---|---|
| `SKILL.md` | Defines the TenantProof workflow, triggers, output format, severity rules, and safety constraints. |
| `references/` | Provides deeper framework, ORM, migration, and testing guidance. |
| `scripts/detect-stack.js` | Detects package manager, framework, ORM, database, and test runner. |
| `scripts/inspect-routes.js` | Optional helper for finding route files and sensitive route patterns. |
| `assets/templates/` | Provides reusable AGENTS.md, config, test, and GitHub Action templates. |
| npm installer | Copies skill files to repo-local or global skill directory. |
| examples | Demonstrates vulnerable and fixed patterns. |

### 25.2 Stack Detection Inputs

The stack detection script should inspect:

- `package.json`
- Lockfiles: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- Framework config files
- ORM config files
- Test config files
- Common directories: `src/routes`, `src/controllers`, `src/services`, `prisma`, `drizzle`, `migrations`, `tests`, `__tests__`

### 25.3 Stack Detection Output

```json
{
  "language": "typescript",
  "runtime": "node",
  "frameworks": ["hono"],
  "orm": "prisma",
  "database": "postgresql",
  "testRunner": "vitest",
  "httpTestClient": "supertest",
  "packageManager": "pnpm",
  "tenantMarkers": ["tenantId"],
  "confidence": "high"
}
```

---

## 26. Security and Privacy Requirements

### 26.1 Local Repository Safety

- Scripts must read local project files only.
- Scripts must not upload repository contents.
- Scripts must not read `.env` values unless explicitly requested by the user.
- Scripts must not print secrets or environment variables.
- Scripts must not mutate source files unless the user asks Codex to apply a patch.

### 26.2 Generated Test Safety

Generated tests must:

- Target local test environments only.
- Avoid external production endpoints.
- Avoid credential stuffing or unauthorized access attempts.
- Use synthetic test data.
- Avoid destructive operations outside test databases.

### 26.3 Responsible Usage

TenantProof must include documentation that it is intended for repositories the user owns, maintains, or has permission to review. It should not be used to attack third-party systems.

---

## 27. Documentation Requirements

The repository must include:

1. **README.md**
   - Project summary.
   - Quickstart.
   - Installation options.
   - Example prompts.
   - Supported stacks.
   - Example outputs.
   - Limitations.

2. **CONTRIBUTING.md**
   - How to add framework references.
   - How to add test templates.
   - How to add example vulnerabilities.
   - Coding standards.

3. **SECURITY.md**
   - Responsible disclosure process.
   - Supported versions.
   - Safety scope.

4. **CHANGELOG.md**
   - Semantic version history.

5. **Examples documentation**
   - How to run vulnerable examples.
   - How to use TenantProof to detect and test the vulnerability.

---

## 28. Release Plan

### 28.1 v0.1: Node.js MVP

**Theme:** Prove the core workflow.

Deliverables:

- Skill folder with `SKILL.md`.
- References for tenant isolation, authorization, Node.js, Prisma, Drizzle, Knex, PostgreSQL, and testing.
- Installer script.
- Stack detection script.
- Jest/Vitest test templates.
- Vulnerable Hono + Prisma example.
- Fixed Hono + Prisma example.
- README and documentation.

### 28.2 v0.2: Laravel Expansion

**Theme:** Add PHP SaaS support.

Deliverables:

- Laravel reference.
- Eloquent global scope guidance.
- Policy/Gate guidance.
- Pest/PHPUnit test templates.
- Laravel example app.

### 28.3 v0.3: Spring Boot Expansion

**Theme:** Add Java enterprise SaaS support.

Deliverables:

- Spring Boot reference.
- JPA/Hibernate tenant query guidance.
- Spring Security method guard guidance.
- JUnit test template.
- Spring Boot example app.

### 28.4 v0.4: GitHub Workflow Support

**Theme:** Make it easy for maintainers to run in PR workflows.

Deliverables:

- GitHub Action template.
- PR comment template.
- CI examples.
- Optional SARIF or JSON output exploration.

### 28.5 v1.0: Stable Cross-Stack Skill

**Theme:** Stable public release.

Deliverables:

- Stable skill API and output format.
- Broader examples.
- Documentation site.
- Benchmark corpus of tenant-isolation vulnerabilities.
- Contribution program for new frameworks.

---

## 29. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| False positives reduce trust | Users ignore findings | Require evidence, confidence labels, and false-positive notes. |
| Generated tests do not compile | Poor developer experience | Reuse existing test helpers and include TODO fallback only when necessary. |
| Scope becomes too broad | MVP delays | Start with Node.js only and focus on tenant isolation, not all security. |
| Skill instructions become too large | Codex performance suffers | Use modular references and progressive loading. |
| Existing tools overlap | Harder positioning | Emphasize proof generation, cross-tenant tests, and Codex Skill packaging. |
| Users expect formal security guarantees | Misuse or overtrust | Clearly document limitations and encourage human review. |
| Installer overwrites user files | Data loss | Use dry-run mode, backups, and explicit confirmation. |
| Generated tests require project-specific setup | Friction | Inspect existing factories and generate minimal TODOs when helpers are unavailable. |

---

## 30. Competitive Positioning

TenantProof should not position itself as another generic AI security reviewer or static analyzer.

### 30.1 Positioning Statement

> TenantProof is a Codex Skill that helps SaaS maintainers prove tenant isolation by reviewing backend changes and generating cross-tenant regression tests.

### 30.2 Differentiators

| Differentiator | Description |
|---|---|
| Tenant-isolation-specific | Focuses deeply on one high-impact SaaS security invariant. |
| Proof-oriented | Converts findings into runnable regression tests. |
| Codex-native | Packaged as a Codex Skill with references, templates, and install flow. |
| Maintainer-friendly | Produces PR-ready findings with evidence and remediation guidance. |
| Stack-extensible | Starts with Node.js but can add Laravel and Spring Boot references. |
| Local-first | No hosted service required for MVP. |

---

## 31. Open Questions

| ID | Question | Owner | Resolution Target |
|---|---|---|---|
| OQ-001 | Should the package install one skill `tenantproof` or multiple skills like `tenantproof-review` and `tenantproof-test`? | Maintainer | Before v0.1 |
| OQ-002 | Should config use JSON, YAML, or both? | Maintainer | Before v0.1 |
| OQ-003 | Should generated tests default to 403, 404, or allow both? | Maintainer | Before v0.1 |
| OQ-004 | Should the installer be written in Node.js only or support shell scripts too? | Maintainer | Before v0.1 |
| OQ-005 | Should GitHub Action support be included in v0.1 or deferred to v0.4? | Maintainer | Before v0.1 |
| OQ-006 | Should the project use MIT or Apache-2.0 license? | Maintainer | Before public release |
| OQ-007 | How should benchmark vulnerable examples be curated? | Maintainer/community | Before v1.0 |

---

## 32. Implementation Checklist

### 32.1 Repository Setup

- [ ] Create public GitHub repository.
- [ ] Add `README.md`.
- [ ] Add `LICENSE`.
- [ ] Add `CONTRIBUTING.md`.
- [ ] Add `SECURITY.md`.
- [ ] Add `CHANGELOG.md`.
- [ ] Configure npm package.
- [ ] Add CI for installer and script tests.

### 32.2 Skill Setup

- [ ] Create `skills/tenantproof/SKILL.md`.
- [ ] Add tenant-isolation reference.
- [ ] Add authorization reference.
- [ ] Add database migration reference.
- [ ] Add PII logging reference.
- [ ] Add Node/Hono reference.
- [ ] Add Express reference.
- [ ] Add NestJS reference.
- [ ] Add Prisma reference.
- [ ] Add Drizzle reference.
- [ ] Add Knex reference.
- [ ] Add testing reference.

### 32.3 Installer

- [ ] Implement `install --target repo`.
- [ ] Implement `install --target global`.
- [ ] Implement `--dry-run`.
- [ ] Implement overwrite protection.
- [ ] Implement `uninstall`.
- [ ] Add tests.

### 32.4 Examples

- [ ] Build vulnerable Hono + Prisma example.
- [ ] Build fixed Hono + Prisma example.
- [ ] Add instructions to reproduce vulnerability.
- [ ] Add expected TenantProof review output.
- [ ] Add expected generated test.

### 32.5 Documentation

- [ ] Add quickstart.
- [ ] Add example prompts.
- [ ] Add generated output examples.
- [ ] Add supported stacks table.
- [ ] Add limitations.
- [ ] Add roadmap.

---

## 33. Appendix A: Draft `SKILL.md` Skeleton

```md
---
name: tenantproof
description: Use when reviewing multi-tenant SaaS backend/API code, routes, controllers, services, ORM queries, SQL migrations, authorization checks, or tests for tenant isolation, cross-tenant access, IDOR, missing authorization, PII logging, unsafe migrations, or when generating cross-tenant regression tests.
---

# TenantProof

You are reviewing backend/API code for tenant-isolation and authorization regressions.

## Mission

Help the user prove that tenant A cannot read, mutate, delete, export, infer, or administer tenant B's data.

## Use this skill when

- Reviewing a PR or diff for multi-tenant SaaS risks.
- Reviewing route, controller, service, repository, ORM, SQL, or migration changes.
- Generating cross-tenant regression tests.
- Creating AGENTS.md guidance for tenant-isolation review.

## Do not use this skill for

- General style review.
- Unrelated frontend-only changes.
- Unauthorized testing of third-party systems.
- Full security audits outside tenant isolation and adjacent authorization risks.

## Review workflow

1. Detect stack, tenant markers, auth context, and test runner.
2. Inspect changed routes, services, repositories, ORM queries, raw SQL, migrations, and tests.
3. Prioritize sensitive operations: read, list, update, delete, export, report, admin, file, billing, API key, and user management.
4. Flag missing tenant scope, missing authorization, untrusted tenant sources, unsafe migrations, and PII logging.
5. For each serious finding, provide evidence, risk, suggested fix, and regression test plan.

## Output format

Return:

1. Verdict.
2. Scope reviewed.
3. Detected stack.
4. Tenant markers.
5. Findings.
6. Suggested fixes.
7. Regression test plan or generated test.
8. False-positive considerations.
```

---

## 34. Appendix B: Draft README Tagline

```md
# TenantProof

TenantProof is an open-source Codex Skill for SaaS backend maintainers. It helps Codex review pull requests for tenant-isolation bugs, missing authorization checks, unsafe migrations, and PII leaks, then generates cross-tenant regression tests so maintainers can prove fixes before merge.
```

---

## 35. References

The PRD assumes the current Codex Skill model where a skill is a folder containing a required `SKILL.md` file with metadata and instructions, plus optional supporting files such as `references/`, `scripts/`, `assets/`, and `agents/`. It also assumes Codex can use repository guidance such as `AGENTS.md` and can be integrated into GitHub review or GitHub Action workflows.

Useful references:

- OpenAI Codex Skills documentation: <https://developers.openai.com/codex/skills>
- OpenAI Codex reusable skills use case: <https://developers.openai.com/codex/use-cases/reusable-codex-skills>
- OpenAI Codex best practices: <https://developers.openai.com/codex/learn/best-practices>
- OpenAI Codex GitHub integration: <https://developers.openai.com/codex/integrations/github>
- OpenAI Codex GitHub Action: <https://developers.openai.com/codex/github-action>
- OpenAI Codex AGENTS.md guide: <https://developers.openai.com/codex/guides/agents-md>

---

## 36. Final MVP Recommendation

Ship `codex-tenantproof-skill` as a small, focused, open-source Codex Skill before building a larger CLI, dashboard, or hosted product.

The first public release should prove one thing extremely well:

> Given a Node.js SaaS API route that may expose cross-tenant data, TenantProof helps Codex identify the risk and generate a regression test proving tenant A cannot access tenant B's resource.

That is the strongest differentiator and the clearest path to useful adoption.
