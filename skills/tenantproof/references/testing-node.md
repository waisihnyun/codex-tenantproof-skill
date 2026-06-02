# Node Test Generation

Generate tests that prove a tenant-boundary invariant with synthetic local data.

## Discovery

Search for:

```text
vitest.config.* jest.config.* package.json
tests/ __tests__/ test/
factory factories fixture fixtures seed seeds
login token auth request supertest app server
```

Reuse existing helpers before adding new scaffolding.

## Test Shape

Every cross-tenant access test should include:

1. Tenant A and tenant B.
2. User A belonging to tenant A.
3. Resource B belonging to tenant B.
4. Authentication as user A.
5. Request or method call against resource B.
6. Assertion that access is denied, usually 403 or 404.

## Status Expectations

Use the repository convention when visible. If unclear, permit both:

```ts
expect([403, 404]).toContain(res.status);
```

## TODO Fallback

When helpers are unknown, include explicit TODOs rather than inventing opaque APIs:

```ts
// TODO: Replace with this repository's tenant factory.
const tenantA = await createTenant();
```

## Safety

Generated tests must use local app/test database helpers only. Do not call real production URLs, external services, real credentials, or non-test destructive operations.
