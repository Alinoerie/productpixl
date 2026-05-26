import { test, expect } from "@playwright/test";

test.describe("Guide pack (public)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("ecommerce guide page loads without login", async ({ page }) => {
    await page.goto("/guides/ecommerce");
    await expect(page.getByRole("heading", { name: /ecommerce guide pack/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /unlock free guide/i })).toBeVisible();
    await expect(page.getByText("Catalog Audit Playbook")).toBeVisible();
  });
});
