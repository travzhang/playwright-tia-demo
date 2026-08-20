import { caseId, expect, test } from "./baseTest";
import { login } from "./helpers";

test.describe("settings", () => {
  test("changes theme, language, and logs out", caseId("settings-001"), async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    await page.getByLabel("Theme").selectOption("dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.getByLabel("Theme").selectOption("light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.getByLabel("Theme").selectOption("system");
    await expect(page.locator("html")).toHaveAttribute("data-theme-pref", "system");

    await page.getByLabel("Language").selectOption("zh");
    await expect(page.getByRole("heading", { name: "设置" })).toBeVisible();

    await page.getByLabel("语言").selectOption("ja");
    await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();

    await page.getByRole("button", { name: "ログアウト" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });
});
