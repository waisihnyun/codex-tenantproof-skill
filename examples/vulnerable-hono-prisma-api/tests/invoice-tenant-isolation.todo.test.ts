import { describe, expect, it } from "vitest";
import { app } from "../src/app";

// This TODO test shows the regression TenantProof should generate. Replace the
// fixture helpers with real Prisma setup before running it in this example app.
describe("tenant isolation: invoices", () => {
  it.todo("prevents tenant A from reading tenant B invoice", async () => {
    const userA = { id: "user-a", tenantId: "tenant-a" };
    const invoiceB = { id: "invoice-b", tenantId: "tenant-b" };

    const res = await app.request(`/api/invoices/${invoiceB.id}`, {
      headers: {
        "x-user-id": userA.id,
        "x-tenant-id": userA.tenantId,
      },
    });

    expect([403, 404]).toContain(res.status);
  });
});
