# Hono TenantProof Notes

## What To Inspect

- `new Hono()` router definitions.
- `app.use`, route groups, and mounted routers.
- `c.get("user")`, `c.var.user`, or custom context variables.
- Route params from `c.req.param()`, query from `c.req.query()`, and body from `await c.req.json()`.

## Auth And Tenant Context

Safer tenant context usually comes from middleware:

```ts
app.use("/api/*", requireAuth);
const user = c.get("user");
const tenantId = user.tenantId;
```

Suspicious patterns:

```ts
const tenantId = c.req.query("tenantId");
const { tenantId } = await c.req.json();
const tenantId = c.req.header("x-tenant-id");
```

## Testing

Prefer existing Hono app exports and Supertest or Hono request helpers. A simple Hono test may use `app.request()` when the app supports it, but reuse repository helpers first.
