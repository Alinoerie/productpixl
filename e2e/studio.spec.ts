import { test, expect } from "@playwright/test";

test.describe("Content studio", () => {
  test("studio home loads for signed-in seller", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByRole("heading", { name: /content studio|hi /i })).toBeVisible();
  });

  test("projects list loads", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: /projects/i })).toBeVisible();
  });

  test("image studio shows 2-step flow", async ({ page }) => {
    await page.goto("/studio/images");
    await expect(page.getByRole("heading", { name: "Images" })).toBeVisible();
    const stepper = page.getByLabel("Generation progress steps");
    await expect(stepper.getByText("Product & plan")).toBeVisible();
    await expect(stepper.getByText("Gallery", { exact: true })).toBeVisible();
  });

  test("copy studio loads", async ({ page }) => {
    await page.goto("/studio/copy");
    await expect(page.getByRole("heading", { name: "Copy" })).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /simple plans for every catalog size/i, level: 1 })).toBeVisible();
  });
});

test.describe("Auth guards", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects unauthenticated users from studio to login", async ({ page }) => {
    await page.goto("/studio");
    await expect(page).toHaveURL(/\/login/);
  });
});
