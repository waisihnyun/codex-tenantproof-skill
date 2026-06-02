# MySQL TenantProof Notes

## Tenant-Safe Schema Patterns

- Add tenant boundary columns to tenant-owned tables.
- Use composite indexes for tenant-scoped reads and mutations.
- Use composite unique indexes for per-tenant slugs, names, and external IDs.
- Review backfills and report tables for cross-tenant aggregation.

## Migration Risks

Flag tenant-owned tables or report tables that omit tenant scope:

```sql
create table invoices (
  id varchar(36) primary key,
  amount decimal(10,2) not null
);
```

Safer:

```sql
create index invoices_tenant_id_id_idx on invoices (tenant_id, id);
```

## Query Review

MySQL projects may use `mysql2`, Knex, Prisma, Drizzle, or raw SQL. For raw SQL, verify placeholders are used and tenant filters are present.
