import { expect, test } from "./baseTest";
import { login } from "./helpers";

test.describe("media", () => {
  test("creates, plays, updates, and deletes a media item", async ({ page }) => {
    const title = `Clip ${Date.now()}`;
    const updated = `${title} updated`;
    const url = "https://example.com/sample.mp4";

    await login(page);
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("URL").fill(url);
    await page.getByRole("button", { name: "Add" }).click();

    const item = page.getByRole("listitem").filter({ hasText: title });
    await expect(item.getByRole("link", { name: title })).toBeVisible();

    await item.getByRole("link", { name: title }).click();
    await expect(page).toHaveURL(/\/player\/.+/);
    await expect(page.getByRole("heading", { name: "Player" })).toBeVisible();
    await expect(page.getByText(`Now playing: ${title}`)).toBeVisible();
    await expect(page.getByText(/^ID: /)).toBeVisible();

    await page.getByRole("link", { name: "Back" }).click();
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

    await page.getByRole("button", { name: `Edit ${title}` }).click();
    await page.getByRole("listitem").getByLabel("Title").fill(updated);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("link", { name: updated })).toBeVisible();

    await page.getByRole("button", { name: `Delete ${updated}` }).click();
    await expect(page.getByRole("link", { name: updated })).toHaveCount(0);
    await expect(page.getByText("No media yet")).toBeVisible();
  });
});
