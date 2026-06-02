# Database Migration Review

Review migrations for schema changes that weaken tenant boundaries or make safe queries hard to write.

## New Tables

Flag likely tenant-owned tables without tenant ownership columns. Likely tenant-owned names include:

```text
users projects invoices payments documents files api_keys integrations
members memberships orders subscriptions messages conversations reports
```

Safe global tables may include countries, currencies, feature flags, public catalog data, or static lookup tables. Check config allowlists before filing.

## Tenant Columns

Common boundary columns:

```text
tenant_id org_id organization_id workspace_id account_id team_id company_id customer_id project_id
```

Flag nullable tenant boundary fields when there is no backfill, constraint, or rollout plan.

## Indexes And Constraints

- Tenant-owned lookups usually need indexes beginning with or including the tenant boundary plus the lookup key.
- Unique constraints on names, slugs, emails, or external IDs may need tenant scope, e.g. `unique(tenant_id, slug)`.
- Foreign keys between tenant-owned tables should preserve tenant consistency, either through composite keys, constraints, or application-enforced validation with tests.

## Risky Backfills

Flag migrations that copy, aggregate, or update tenant-owned data without deterministic tenant joins. Watch for `update ... from`, `insert into ... select`, report/materialized-view creation, and cross-tenant aggregates.

## Stack Notes

- Prisma migrations usually live under `prisma/migrations/*/migration.sql`.
- Drizzle migrations often live under `drizzle/` as SQL or generated TypeScript.
- Knex migrations often export `up` and `down` functions under `migrations/`.

For every migration finding, include the affected table/index/constraint and explain the tenant-boundary impact.
