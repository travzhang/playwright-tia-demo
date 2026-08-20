import type { Page } from "@playwright/test";
import { expect } from "./baseTest";

export const DEMO_EMAIL = "test@test.com";
export const DEMO_PASSWORD = "1234561233456";

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
}
