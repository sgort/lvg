// The stand-in frame on the built site, under the deployed CSP.
import { expect, expectAccessible, test } from './support';

const BAND = 'Nagebootst MijnOverheid-kader. Geen onderdeel van de oplevering.';

test('Wonen shows the stand-in band and a page title, accessibly', async ({ page }) => {
  await page.goto('/nl/wonen');

  await expect(page.getByText(BAND)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectAccessible(page);
});

test('?kader=uit shows the content without the frame', async ({ page }) => {
  await page.goto('/nl/wonen?kader=uit');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(BAND)).toHaveCount(0);
});
