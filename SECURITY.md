# Security Policy

## Supported Versions

The current supported line is `0.1.x` while the project is in MVP development.

## Responsible Disclosure

If you find a security issue in TenantProof itself, please report it privately to the maintainer before publishing details. Include:

- Affected version or commit.
- Reproduction steps.
- Impact and affected files.
- Any safe proof-of-concept using local synthetic data only.

## Safety Scope

TenantProof is intended for repositories you own, maintain, or are authorized to review. Do not use it to attack third-party systems.

TenantProof scripts must remain local-first:

- No telemetry by default.
- No uploads of repository contents.
- No reading `.env` secrets unless a user explicitly asks Codex to inspect them.
- No production endpoint testing.
