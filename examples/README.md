# TenantProof Examples

These examples are review fixtures for the TenantProof skill.

## Vulnerable Hono + Prisma API

Path: `examples/vulnerable-hono-prisma-api`

The vulnerable route fetches an invoice by ID only:

```ts
await prisma.invoice.findUnique({ where: { id } });
```

Expected TenantProof finding:

```md
### TP-001: Invoice lookup is not scoped to tenant

**Severity:** High
**Confidence:** High
**File:** `src/app.ts`
**Area:** Route / Prisma query

**Evidence:**
`GET /api/invoices/:id` authenticates the user but queries `invoice.findUnique({ where: { id } })` without `tenantId`.

**Risk:**
A user from tenant A can request tenant B's invoice by known or guessed ID.

**Suggested fix:**
Use a tenant-scoped lookup such as `findFirst({ where: { id, tenantId: user.tenantId } })`.

**Regression test plan:**
Create tenant A, tenant B, user A, and invoice B. Authenticate as user A, request `/api/invoices/${invoiceB.id}`, and assert 403 or 404.
```

## Fixed Hono + Prisma API

Path: `examples/fixed-hono-prisma-api`

The fixed route scopes the invoice lookup by authenticated tenant:

```ts
await prisma.invoice.findFirst({
  where: {
    id,
    tenantId: user.tenantId,
  },
});
```

The fixed example includes `tests/invoice-tenant-isolation.test.ts`, which documents the expected cross-tenant regression test shape.

## Suggested Exercise

Ask Codex:

```text
Use $tenantproof to review examples/vulnerable-hono-prisma-api for tenant-isolation risks and generate a regression test for GET /api/invoices/:id.
```

Then compare with:

```text
Use $tenantproof to review examples/fixed-hono-prisma-api for tenant-isolation risks.
```
