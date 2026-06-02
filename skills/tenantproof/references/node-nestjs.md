# NestJS TenantProof Notes

## What To Inspect

- Controllers and decorators: `@Get`, `@Post`, `@Patch`, `@Delete`.
- Guards: `@UseGuards`, global guards, module providers.
- Custom decorators that expose authenticated users or tenants.
- Services and repositories called by controllers.

## Auth Signals

Look for guards such as `JwtAuthGuard`, `RolesGuard`, `TenantGuard`, or custom policy guards. Verify sensitive routes have both authentication and tenant/role enforcement when needed.

## Suspicious Patterns

```ts
@Get(":id")
findOne(@Param("id") id: string) {
  return this.invoiceService.findById(id);
}
```

This is high risk if `findById` queries a tenant-owned model without tenant scope.

## Safer Pattern

```ts
@UseGuards(JwtAuthGuard)
@Get(":id")
findOne(@Param("id") id: string, @CurrentUser() user: UserContext) {
  return this.invoiceService.findForTenant(id, user.tenantId);
}
```

Tests can use Supertest against the Nest application when the repository already has e2e setup.
