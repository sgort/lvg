// Runs axe on a rendered component or page and fails on any violation. Colour contrast is
// left to the walkthroughs: jsdom computes no styles, so axe cannot judge it here.
import axe from 'axe-core';
import { expect } from 'vitest';

export async function expectNoAxeViolations(container: Element): Promise<void> {
  // The strict CSP blocks <style> elements in the page (LuxIcon renders one), so a component
  // that brings one fails here already, not only in the walkthroughs.
  expect(container.querySelectorAll('style'), 'a <style> element breaks the CSP').toHaveLength(0);

  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const violations = results.violations.map(
    (violation) => `${violation.id}: ${violation.help} (${violation.nodes.length}×)`
  );
  expect(violations).toEqual([]);
}
