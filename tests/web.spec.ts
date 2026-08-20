import { expect, test } from "@playwright/test";

test.describe("web production build", () => {
  test("serves the built app and hydrates client javascript", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("web");
    await expect(page.getByRole("heading", { name: "Get started" })).toBeVisible();
    await expect(page.getByAltText("React logo")).toBeVisible();
    await expect(page.getByAltText("Vite logo")).toBeVisible();

    const counter = page.getByRole("button", { name: /count is/i });
    await expect(counter).toHaveText("Count is 0");
    await counter.click();
    await expect(counter).toHaveText("Count is 1");
  });
});
