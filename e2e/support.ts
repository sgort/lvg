// Shared set-up for the walkthroughs: every test fails on a Content Security Policy violation
// in the console, and expectAccessible runs axe for WCAG 2.2 AA.
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test as base } from '@playwright/test';

export const test = base.extend<{ cspSchendingen: string[] }>({
  cspSchendingen: [
    async ({ page }, use) => {
      const schendingen: string[] = [];
      page.on('console', (bericht) => {
        if (bericht.text().includes('Content Security Policy')) schendingen.push(bericht.text());
      });
      await use(schendingen);
      expect(schendingen, 'Content Security Policy violations').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function expectAccessible(page: Page): Promise<void> {
  const resultaat = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(resultaat.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}×)`)).toEqual([]);
}
