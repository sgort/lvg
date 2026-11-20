// The stand-in frame on the built site, under the deployed CSP.
import { expect, expectAccessible, test } from './support';

const BAND = 'Nagebootst MijnOverheid-kader. Geen onderdeel van de oplevering.';

test('Wonen shows the stand-in band and a page title, accessibly', async ({ page }) => {
  await page.goto('/nl/wonen');

  await expect(page.getByText(BAND)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectAccessible(page);
});

// A page wider than the viewport makes mobile browsers rescale it, and clicks then land on the
// wrong element. Checked on the pages with the widest content, at both sizes.
for (const pad of [
  '/nl/wonen',
  '/nl/wonen/koopwoningen/w-7f3a',
  '/nl/wonen/koopwoningen/w-7f3a/kadaster',
  '/nl/wonen/koopwoningen/w-7f3a/energielabel',
]) {
  test(`${pad} is no wider than the viewport`, async ({ page }) => {
    await page.goto(pad);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const { breedte, zichtbaar } = await page.evaluate(() => ({
      breedte: document.documentElement.scrollWidth,
      zichtbaar: document.documentElement.clientWidth,
    }));
    expect(breedte).toBeLessThanOrEqual(zichtbaar);
  });
}

test('?kader=uit shows the content without the frame', async ({ page }) => {
  await page.goto('/nl/wonen?kader=uit');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(BAND)).toHaveCount(0);
});
