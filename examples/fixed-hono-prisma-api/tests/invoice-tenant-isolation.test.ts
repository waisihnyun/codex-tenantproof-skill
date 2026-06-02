import { describe, expect, it, vi } from "vitest";
import { app, prisma } from "../src/app";

describe("tenant isolation: invoices", () => {
  it("prevents tenant A from reading tenant B invoice", async () => {
    const userA = { id: "user-a", tenantId: "tenant-a" };
    const invoiceB = { id: "invoice-b", tenantId: "tenant-b", amount: 1200 };

    vi.spyOn(prisma.invoice, "findFirst").mockResolvedValueOnce(null);

    const res = await app.request(`/api/invoices/${invoiceB.id}`, {
      headers: {
        "x-user-id": userA.id,
        "x-tenant-id": userA.tenantId,
      },
    });

    expect(res.status).toBe(404);
    expect(prisma.invoice.findFirst).toHaveBeenCalledWith({
      where: {
        id: invoiceB.id,
        tenantId: userA.tenantId,
      },
    });
  });
});
