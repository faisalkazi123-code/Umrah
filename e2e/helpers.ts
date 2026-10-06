import { expect, type Page } from "@playwright/test";

export async function onboard(page: Page) {
  await page.goto("/");
  await page.waitForURL("**/welcome");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Start Umrah" }).click();
  await page.waitForURL("**/journey/ihram");
}

export async function throughIhram(page: Page) {
  for (const item of ["Remove unwanted hair", "Trim nails", "Make ghusl", "Make wudhu", "Put on Ihram clothing"]) {
    await page.getByText(item, { exact: true }).click();
  }
  await page.getByRole("link", { name: "Continue to Niyyah" }).click();
  await page.getByRole("button", { name: "I have made the Niyyah" }).click();
  await page.waitForURL("**/journey/ihram/talbiyah");
  await page.getByRole("button", { name: "I have recited the Talbiyah" }).click();
  await page.waitForURL("**/journey/haram");
  await page.getByRole("button", { name: "Start Tawaf" }).click();
  await page.waitForURL("**/journey/tawaf");
}

export async function completeCircuits(page: Page, from: number, to: number) {
  for (let n = from; n <= to; n++) {
    await page.getByRole("button", { name: `Complete Circuit ${n}` }).click();
    await page.getByRole("button", { name: "Yes, completed" }).click();
    await expect(page.getByTestId("tawaf-completed")).toHaveText(`${n} of 7 circuits completed`);
  }
}

export async function startSaee(page: Page) {
  await page.getByRole("link", { name: "Continue: After Tawaf" }).click();
  await page.waitForURL("**/journey/tawaf/complete");
  await page.getByRole("button", { name: "Start Sa'ee" }).click();
  await page.waitForURL("**/journey/saee");
}

export async function completeRounds(page: Page, from: number, to: number) {
  for (let n = from; n <= to; n++) {
    await page.getByRole("button", { name: `Complete Round ${n}` }).click();
    await page.getByRole("button", { name: /^Yes, reached/ }).click();
    await expect(page.getByTestId("saee-completed")).toHaveText(`${n} of 7 rounds completed`);
  }
}
