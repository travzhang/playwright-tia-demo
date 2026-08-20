import { expect, test } from "./baseTest";
import { DEMO_EMAIL, DEMO_PASSWORD, login } from "./helpers";

test.describe("auth", () => {
  test("redirects anonymous users to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/player/demo");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DEMO_EMAIL);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert")).toHaveText("Invalid email or password");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs in with the demo account", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/$/);
  });
});
