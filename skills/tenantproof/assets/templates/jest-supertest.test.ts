import request from "supertest";
import { app } from "../../src/app";

// TODO: Replace these imports with this repository's factories/auth helpers.
import {
  createTenant,
  createUser,
  createResource,
  loginAndGetToken,
} from "../helpers/factories";

describe("tenant isolation: {{resourceName}}", () => {
  it("prevents tenant A from accessing tenant B {{resourceName}}", async () => {
    const tenantA = await createTenant();
    const tenantB = await createTenant();

    const userA = await createUser({ tenantId: tenantA.id });
    const resourceB = await createResource({ tenantId: tenantB.id });

    const tokenA = await loginAndGetToken(userA);

    const res = await request(app)
      .{{method}}(`{{pathTemplate}}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect([403, 404]).toContain(res.status);
  });
});
