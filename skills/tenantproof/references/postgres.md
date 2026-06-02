# PostgreSQL TenantProof Notes

## Tenant-Safe Schema Patterns

- Prefer tenant boundary columns on tenant-owned tables.
- Add indexes for common tenant-scoped lookups, such as `(tenant_id, id)` or `(tenant_id, slug)`.
- Scope unique constraints to tenant when values can repeat across tenants.
- Consider row-level security only when the repository clearly enables and tests it.

## Migration Risks

Flag:

```sql
create table invoices (id uuid primary key, amount numeric not null);
create unique index invoices_slug_key on invoices (slug);
create materialized view invoice_reports as select customer_id, sum(amount) from invoices group by customer_id;
```

These may need tenant ownership, tenant-scoped uniqueness, or tenant-scoped aggregation.

## Raw SQL Review

Postgres raw SQL in application code should use parameters or tagged templates and include tenant filters for tenant-owned resources.
