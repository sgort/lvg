// The link-preview tags on the built site. The walkthroughs run on whatever dist/ was built
// (local, acceptance or stable), so either card is accepted; the plugin's unit tests pin which
// site gets which.
import { expect, test } from './support';

const meta = (sleutel: string) => `meta[property="${sleutel}"], meta[name="${sleutel}"]`;

test('Wonen has a social card that the site serves as a PNG', async ({ page, request }) => {
  await page.goto('/nl/wonen');

  const ogImage = await page.locator(meta('og:image')).getAttribute('content');
  expect(ogImage).toMatch(/\/og-image-(prod|acc)\.png$/);
  await expect(page.locator(meta('twitter:image'))).toHaveAttribute('content', ogImage ?? '');

  const antwoord = await request.get(new URL(ogImage ?? '').pathname);
  expect(antwoord.status()).toBe(200);
  expect(antwoord.headers()['content-type']).toBe('image/png');

  await expect(page.locator(meta('og:title'))).toHaveAttribute(
    'content',
    /Mijn woning – Wonen in MijnOverheid \(prototype\)$/
  );
  await expect(page.locator(meta('og:image:width'))).toHaveAttribute('content', '1200');
});
