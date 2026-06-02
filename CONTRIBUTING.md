# Contributing

TenantProof is intentionally narrow: tenant isolation, adjacent authorization, migration safety, and cross-tenant regression tests.

## Add Framework References

1. Add a focused file under `skills/tenantproof/references/`.
2. Keep the guidance specific to tenant-boundary review.
3. Update `skills/tenantproof/SKILL.md` so Codex knows when to load the reference.
4. Add an example or test when the new reference introduces a repeatable pattern.

## Add Test Templates

1. Add templates under `skills/tenantproof/assets/templates/`.
2. Prefer syntactically valid TypeScript.
3. Include explicit TODOs for repo-specific factories/auth helpers.
4. Keep generated tests local-only and synthetic.

## Add Example Vulnerabilities

1. Put vulnerable examples under `examples/vulnerable-*`.
2. Put fixed examples under `examples/fixed-*`.
3. Include the expected TenantProof finding and a regression test pattern.
4. Avoid real credentials, production URLs, or external service calls.

## Coding Standards

- Use dependency-free Node.js scripts when possible.
- Do not add telemetry or network calls.
- Do not read `.env` values in helper scripts.
- Keep `SKILL.md` concise and move detailed guidance into references.
- Run `npm test` before opening a PR.
