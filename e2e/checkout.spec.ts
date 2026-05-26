import { test, expect } from "@playwright/test";

test.describe("Checkout API (unauthenticated)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("requires authentication", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: { package: "starter" },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Checkout API (authenticated)", () => {
  test("returns structured response when signed in", async ({ page }) => {
    await page.goto("/studio");
    const res = await page.request.post("/api/checkout", {
      data: { package: "starter", returnTo: "/pricing" },
    });
    expect([200, 503]).toContain(res.status());
    const body = (await res.json()) as { url?: string; error?: string; code?: string };
    if (res.status() === 200) {
      expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com/);
    } else {
      expect(body.code).toBe("CHECKOUT_DISABLED");
      expect(body.error).toBeTruthy();
    }
  });
});
