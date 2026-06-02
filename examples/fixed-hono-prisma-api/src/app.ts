import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

type UserContext = {
  id: string;
  tenantId: string;
};

export const prisma = new PrismaClient();
export const app = new Hono<{ Variables: { user: UserContext } }>();

app.use("/api/*", async (c, next) => {
  const userId = c.req.header("x-user-id");
  const tenantId = c.req.header("x-tenant-id");
  if (!userId || !tenantId) return c.json({ error: "unauthorized" }, 401);
  c.set("user", { id: userId, tenantId });
  await next();
});

app.get("/api/invoices/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      tenantId: user.tenantId,
    },
  });

  if (!invoice) return c.json({ error: "not found" }, 404);
  return c.json(invoice);
});
