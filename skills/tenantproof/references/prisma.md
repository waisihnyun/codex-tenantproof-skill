# Prisma TenantProof Notes

## High-Risk Query Shapes

```ts
prisma.invoice.findUnique({ where: { id } });
prisma.invoice.findFirst({ where: { id } });
prisma.invoice.update({ where: { id }, data });
prisma.invoice.delete({ where: { id } });
```

These are suspicious for tenant-owned models unless tenant scope is enforced by a caller or schema constraint.

## Safer Reads

```ts
await prisma.invoice.findFirst({
  where: {
    id,
    tenantId: user.tenantId,
  },
});
```

## Safer Mutations

Use tenant-scoped `updateMany`/`deleteMany`, a composite unique key, or a tenant-scoped pre-read followed by mutation inside a transaction.

```ts
await prisma.invoice.updateMany({
  where: { id, tenantId: user.tenantId },
  data,
});
```

## Schema Review

Tenant-owned Prisma models should generally include a tenant marker and relation. Watch for models with sensitive names and no tenant ownership. Unique constraints on slugs/names/external IDs may need tenant scope:

```prisma
@@unique([tenantId, slug])
```
