import { test, expect } from "@playwright/test";

test.describe("Demo booking (public)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("demo page shows step 1 booking UI", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByRole("heading", { name: /book your productpixl demo/i })).toBeVisible();
    await expect(page.getByText("Step 1 of 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "Book a demo" })).toBeVisible();
    await expect(page.getByText("30 min")).toBeVisible();
  });
});
