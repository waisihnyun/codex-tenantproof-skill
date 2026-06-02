# Drizzle TenantProof Notes

## Query Review

Flag tenant-owned queries that only filter by resource ID:

```ts
await db.select().from(invoices).where(eq(invoices.id, id));
await db.update(invoices).set(data).where(eq(invoices.id, id));
await db.delete(invoices).where(eq(invoices.id, id));
```

Safer:

```ts
await db
  .select()
  .from(invoices)
  .where(and(eq(invoices.id, id), eq(invoices.tenantId, user.tenantId)));
```

## Schema Review

Look for table definitions without tenant columns, tenant columns without indexes, and unique indexes that should include tenant scope.

## Raw SQL

Drizzle projects may use `sql` templates. Verify tenant-owned raw SQL includes tenant filters and does not use unsafe string concatenation.
