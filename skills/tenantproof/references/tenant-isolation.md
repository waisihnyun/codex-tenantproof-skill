# Tenant Isolation Review

TenantProof reviews one invariant: a user from tenant A must not read, mutate, delete, export, infer, or administer data owned by tenant B.

## Core Checklist

- Identify tenant-owned resources from model names, table columns, route names, and existing tests.
- Verify tenant context comes from authenticated context, not untrusted request input.
- Verify reads, lists, updates, deletes, exports, reports, uploads, downloads, admin actions, API keys, billing, and user management are tenant scoped.
- Treat ID-only lookups on tenant-owned resources as high risk unless a caller-enforced guard is visible.
- Prefer findings with a route, function, query, and exact file evidence.
- Include a cross-tenant regression test plan for every High or Critical finding.

## Tenant Markers

Search for these markers and repository-specific variants:

```text
tenantId tenant_id orgId org_id organizationId organization_id
workspaceId workspace_id accountId account_id teamId team_id
companyId company_id customerId customer_id projectId project_id
```

Also inspect auth/session types, middleware, database schema, ORM models, factories, and config hints.

## High-Risk Patterns

Prisma:

```ts
prisma.invoice.findUnique({ where: { id } });
prisma.invoice.update({ where: { id }, data });
prisma.invoice.delete({ where: { id } });
```

Query builders:

```ts
db.select().from(invoices).where(eq(invoices.id, id));
knex("invoices").where({ id }).first();
```

Raw SQL:

```ts
sql`select * from invoices where id = ${id}`;
db.query(`select * from invoices where id = '${id}'`);
```

These are suspicious when the resource is tenant-owned and no tenant filter or trusted guard is visible.

## Safer Patterns

Scope by authenticated tenant:

```ts
await prisma.invoice.findFirst({
  where: {
    id: invoiceId,
    tenantId: ctx.user.tenantId,
  },
});
```

For updates and deletes, include tenant scope in the mutation predicate or first load the record through a tenant-scoped query and reject on no match.

## Review Judgment

- Critical: confirmed route returns or mutates another tenant's data.
- High: route/service/query strongly appears tenant-owned and lacks tenant scope.
- Medium: tenant identifier comes from untrusted input but may be validated elsewhere.
- Low: missing tenant index or defense-in-depth improvement.
- Info: useful test gap or convention note.

Never report unrelated style comments. If the evidence is incomplete, label confidence accurately and describe what would prove or disprove the issue.
