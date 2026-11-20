// From the list to the property and each of its detail pages, and back: by the breadcrumb on
// desktop, by the back link on mobile. Only one of the two is visible per viewport, and
// Playwright's role locators skip hidden elements, so one locator covers both.
import type { Page } from '@playwright/test';

import { expect, expectAccessible, test } from './support';

const ADRES_KORT = 'Voorbeeldlaan 73 B';

const terugNaarWoning = (page: Page) =>
  page.getByRole('link', { name: ADRES_KORT, exact: true }).click();

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('lvg-scenario', 'drie-woningen'));
});

test('the property summary and its three detail pages, accessibly', async ({ page }) => {
  await page.goto('/nl/wonen/koopwoningen');
  await page.getByRole('list', { name: 'Uw gebouwen:' }).getByRole('link').first().click();

  await expect(page.getByRole('heading', { level: 1, name: ADRES_KORT })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Veelgestelde vragen' })).toBeVisible();
  await expectAccessible(page);

  for (const [link, titel] of [
    [/Bekijk kadastrale gegevens/, 'Kadastrale gegevens'],
    [/Bekijk WOZ-gegevens/, 'WOZ-gegevens'],
    [/Bekijk energielabel/, 'Energielabel'],
  ] as const) {
    await page.getByRole('link', { name: link }).click();
    await expect(page.getByRole('heading', { level: 1, name: titel })).toBeVisible();
    await expectAccessible(page);

    await terugNaarWoning(page);
    await expect(page.getByRole('heading', { level: 1, name: ADRES_KORT })).toBeVisible();
  }
});

test('the energy label page offers the roof insulation advice', async ({ page }) => {
  await page.goto('/nl/wonen/koopwoningen/w-7f3a/energielabel');

  await expect(page.getByRole('heading', { name: 'Uw woning verduurzamen' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Bekijk advies dakisolatie/ })).toBeVisible();
});
