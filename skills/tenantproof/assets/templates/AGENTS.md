## TenantProof Review Guidelines

- Treat cross-tenant data access as high priority.
- Verify every tenant-owned read, list, update, delete, export, report, upload, billing, user, admin, API key, and integration query is scoped by authenticated tenant context.
- Tenant context must come from auth/session context, not request body, query string, or headers unless membership validation is visible.
- Treat ID-only lookups, updates, and deletes on tenant-owned models as high risk.
- Verify sensitive routes are protected by authentication and, for admin/export/report actions, explicit role or permission checks.
- For migrations, verify tenant-owned tables include tenant boundary columns, tenant-scoped uniqueness where needed, and useful tenant indexes.
- Require cross-tenant regression tests for sensitive route or query changes. Tests should create tenant A, tenant B, user A, resource B, authenticate as user A, and assert 403 or 404.
- Avoid unrelated style comments when reviewing tenant-isolation changes.
