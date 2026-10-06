import { expect, test } from "@playwright/test";
import { completeCircuits, completeRounds, onboard, startSaee, throughIhram } from "./helpers";

test("full journey from Start Umrah through Umrah Complete", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await onboard(page);
  await throughIhram(page);
  await expect(page.getByTestId("tawaf-counter")).toHaveText("1 / 7");
  await expect(page.getByTestId("instruction-tawaf.walking.circuits_1_3")).toBeVisible();
  await completeCircuits(page, 1, 3);
  await expect(page.getByTestId("instruction-tawaf.walking.circuits_4_7")).toBeVisible();
  await completeCircuits(page, 4, 7);
  await expect(page.getByText("All 7 circuits completed")).toBeVisible();
  await expect(page.getByRole("button", { name: /Complete Circuit/ })).toHaveCount(0);

  await startSaee(page);
  const expected = [
    ["As-Safa", "Al-Marwah"],
    ["Al-Marwah", "As-Safa"],
    ["As-Safa", "Al-Marwah"],
    ["Al-Marwah", "As-Safa"],
    ["As-Safa", "Al-Marwah"],
    ["Al-Marwah", "As-Safa"],
    ["As-Safa", "Al-Marwah"],
  ];
  for (const [i, [from, to]] of expected.entries()) {
    await expect(page.getByTestId("saee-from")).toHaveText(from!);
    await expect(page.getByTestId("saee-to")).toHaveText(to!);
    await completeRounds(page, i + 1, i + 1);
  }
  await expect(page.getByText("Sa'ee Complete")).toBeVisible();
  await expect(page.getByText("You are at Al-Marwah")).toBeVisible();

  await page.getByRole("link", { name: "Next: Shaving / Trimming" }).click();
  await page.getByRole("button", { name: "Complete Umrah" }).click();
  await page.getByRole("button", { name: "Yes, complete Umrah" }).click();
  await page.waitForURL("**/journey/complete");
  await expect(page.getByText("UMRAH COMPLETE")).toBeVisible();
  await expect(page.getByRole("link", { name: "Review Journey" })).toBeVisible();

  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.getByText("Your Umrah is complete. Alhamdulillah.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Tawaf progress survives refresh: 4 circuits completed, next = Circuit 5", async ({ page }) => {
  await onboard(page);
  await throughIhram(page);
  await completeCircuits(page, 1, 4);
  await page.reload();
  await expect(page.getByTestId("tawaf-completed")).toHaveText("4 of 7 circuits completed");
  await expect(page.getByTestId("tawaf-counter")).toHaveText("5 / 7");
  await expect(page.getByRole("button", { name: "Complete Circuit 5" })).toBeVisible();
});

test("Sa'ee progress survives refresh with the correct direction", async ({ page }) => {
  await onboard(page);
  await throughIhram(page);
  await completeCircuits(page, 1, 7);
  await startSaee(page);
  await completeRounds(page, 1, 4);
  await page.reload();
  await expect(page.getByTestId("saee-completed")).toHaveText("4 of 7 rounds completed");
  await expect(page.getByTestId("saee-counter")).toHaveText("5 / 7");
  await expect(page.getByTestId("saee-from")).toHaveText("As-Safa");
  await expect(page.getByTestId("saee-to")).toHaveText("Al-Marwah");
});

test("Tawaf undo and reset", async ({ page }) => {
  await onboard(page);
  await throughIhram(page);
  await completeCircuits(page, 1, 2);
  await page.getByRole("button", { name: "Undo last circuit" }).first().click();
  await expect(page.getByTestId("tawaf-completed")).toHaveText("1 of 7 circuits completed");
  await page.getByRole("button", { name: "Reset Tawaf" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Reset Tawaf" }).click();
  await expect(page.getByText("Tawaf has not started.")).toBeVisible();
});

test("checklist persists across reload", async ({ page }) => {
  await onboard(page);
  await page.goto("/checklist");
  await page.getByText("Drink Zamzam", { exact: true }).click();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: /Drink Zamzam/ })).toBeChecked();
});

test("Arabic switches the whole layout to RTL", async ({ page }) => {
  await onboard(page);
  await page.goto("/settings");
  await page.getByText("العربية").click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("heading", { name: "الإعدادات" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
