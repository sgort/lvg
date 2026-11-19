// Wonen and Koopwoningen per scenario, on the built site with the real API.
import type { Page } from '@playwright/test';

import { expect, expectAccessible, test } from './support';

// What the scenario switch stores; set before the page loads, as if chosen earlier.
const kiesScenario = (page: Page, scenario: string) =>
  page.addInitScript((waarde) => sessionStorage.setItem('lvg-scenario', waarde), scenario);

test('Wonen shows the three cards, accessibly', async ({ page }) => {
  await page.goto('/nl/wonen');

  await expect(page.getByRole('heading', { level: 1, name: 'Wonen' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Bekijk koopwoningen/ })).toBeVisible();
  await expectAccessible(page);
});

test('three properties: the list, accessibly', async ({ page }) => {
  await kiesScenario(page, 'drie-woningen');
  await page.goto('/nl/wonen/koopwoningen');

  const lijst = page.getByRole('list', { name: 'Uw gebouwen:' });
  await expect(lijst.getByRole('link')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Veelgestelde vragen' })).toBeVisible();
  await expectAccessible(page);
});

test('one property: straight to it, and Back does not return to the list', async ({ page }) => {
  await kiesScenario(page, 'een-woning');
  await page.goto('/nl/wonen');

  await page.getByRole('link', { name: /Bekijk koopwoningen/ }).click();
  await expect(page).toHaveURL(/\/nl\/wonen\/koopwoningen\/w-7f3a$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/nl\/wonen$/);
});

test('no property: the message and the Kadaster contact, accessibly', async ({ page }) => {
  await kiesScenario(page, 'geen-woning');
  await page.goto('/nl/wonen/koopwoningen');

  await expect(page.getByText('U heeft geen koopwoning op uw naam staan.')).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Klopt dit niet\? Neem contact op met het Kadaster/ })
  ).toBeVisible();
  await expectAccessible(page);
});
