import { expect, test } from "@playwright/test";
import { completeCircuits, onboard, startSaee, throughIhram } from "./helpers";

test("core journey works offline after the first visit", async ({ page, context }) => {
  await onboard(page);
  // Wait until the service worker has precached the app and controls the page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
    }
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("You are offline")).toBeVisible();
  await throughIhram(page);
  await completeCircuits(page, 1, 7);
  await startSaee(page);
  await expect(page.getByTestId("saee-to")).toHaveText("Al-Marwah");

  await page.goto("/duas");
  await expect(page.getByTestId("dua-dua.talbiyah")).toBeVisible();
  await page.goto("/checklist");
  await expect(page.getByText("Make ghusl", { exact: true })).toBeVisible();
  await page.goto("/guide/footnotes");
  await expect(page.getByText("Ruknul-Yamani")).toBeVisible();

  // Restart while still offline: progress is restored from IndexedDB.
  await page.goto("/journey/saee");
  await page.reload();
  await expect(page.getByTestId("saee-counter")).toHaveText("1 / 7");
  await page.goto("/journey/tawaf");
  await expect(page.getByText("All 7 circuits completed")).toBeVisible();
});
