# PII And Sensitive Logging

PII logging is secondary to tenant isolation. File a finding only when logging is adjacent to sensitive tenant-owned data, authentication, exports, billing, integrations, or user/admin routes.

## Sensitive Values

Flag logs containing:

```text
email password token apiKey api_key secret session authorization cookie
payment card address phone ssn idNumber passport refreshToken accessToken
```

Also flag full request/response bodies when routes process tenant-sensitive data.

## Risk Patterns

```ts
logger.info("creating payment", req.body);
console.log("auth header", req.headers.authorization);
logger.error("failed invoice export", { user, invoice, paymentMethod });
```

## Safer Patterns

Log minimal, non-sensitive identifiers and redact secrets:

```ts
logger.info("invoice export failed", {
  tenantId: ctx.user.tenantId,
  invoiceId,
  errorCode: error.code,
});
```

Avoid including emails, tokens, addresses, payment details, or full tenant-private metadata unless explicitly redacted.
