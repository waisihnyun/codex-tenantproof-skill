# Express TenantProof Notes

## What To Inspect

- Route files using `express.Router()`, `app.get`, `router.patch`, etc.
- Router mounting order in `app.ts`, `server.ts`, or module index files.
- Middleware arrays and route-level guards.
- `req.user`, `res.locals.user`, session objects, and request-scoped context.

## High-Risk Patterns

```ts
router.get("/invoices/:id", async (req, res) => {
  const invoice = await invoices.findById(req.params.id);
  res.json(invoice);
});
```

If `findById` is not tenant scoped and the route only uses URL ID, file a tenant-isolation finding.

## Safer Pattern

```ts
router.get("/invoices/:id", requireAuth, async (req, res) => {
  const invoice = await invoices.findForTenant(req.params.id, req.user.tenantId);
  if (!invoice) return res.sendStatus(404);
  res.json(invoice);
});
```

Use Supertest templates when generating route-level tests.
