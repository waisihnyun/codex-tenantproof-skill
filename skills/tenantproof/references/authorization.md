# Authorization Review

Review authorization as part of tenant isolation. Missing authentication, missing role checks, or tenant IDs accepted from input can turn a query bug into cross-tenant access.

## Auth Context

Prefer tenant context derived from authenticated state:

```ts
ctx.user.tenantId
req.user.orgId
session.user.workspaceId
c.get("user").tenantId
```

Treat these as suspicious until validation is visible:

```ts
req.body.tenantId
req.query.orgId
req.headers["x-tenant-id"]
params.workspaceId
```

Path tenant IDs can be safe only when the route verifies membership or role against authenticated context before accessing tenant-owned data.

## Middleware Signals

Look for repository-specific middleware and guards:

```text
requireAuth authenticate withAuth authGuard jwtGuard
requireAdmin requireRole canManageTenant ownerOnly memberOfWorkspace
```

For NestJS, inspect guards, decorators, interceptors, and injected user/session decorators. For Hono and Express, inspect route registration order and middleware composition.

## High-Risk Authorization Gaps

- Sensitive route accesses tenant-owned data without obvious auth middleware.
- Admin/export/report route only checks authentication, not role or tenant permissions.
- Service accepts `tenantId` as a caller-supplied argument and the caller passes request input.
- Repository method has a name like `findById`, `updateById`, or `deleteById` and does not require tenant context.
- Route trusts `x-tenant-id`, `organizationId`, or `workspaceId` without membership validation.

## Finding Guidance

When a route lacks visible middleware, inspect app/router mounting before filing. If mounting context is unknown, use Medium confidence and say which file needs confirmation.

Suggested fixes should derive tenant and role from auth context and pass that context through service/repository boundaries.
