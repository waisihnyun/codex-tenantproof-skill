# Knex TenantProof Notes

## Query Review

Suspicious:

```ts
await knex("invoices").where({ id }).first();
await knex("invoices").where({ id }).update(data);
await knex("invoices").where({ id }).delete();
```

Safer:

```ts
await knex("invoices")
  .where({ id, tenant_id: user.tenantId })
  .first();
```

## Migration Review

Knex migrations usually export `up` and `down`. Inspect `createTable`, `table.uuid`, `table.unique`, `table.index`, and raw SQL calls.

Tenant-owned tables should include tenant ownership and useful indexes:

```ts
table.uuid("tenant_id").notNullable().references("id").inTable("tenants");
table.index(["tenant_id", "id"]);
```

Unique slugs/names/emails may need composite uniqueness with `tenant_id`.
