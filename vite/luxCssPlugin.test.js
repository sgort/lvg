import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { extractLuxCss, LUX_MODULE, luxCssPlugin, VIRTUAL_ID } from './luxCssPlugin.js';

// The installed LUX module, so a LUX update that changes its bundling fails here. (Its
// package exports point `require` at a file it does not ship, so it is found by path.)
const luxPath = fileURLToPath(
  new URL('../node_modules/@lux-design-system/components-react/dist/index.mjs', import.meta.url)
);
const luxCode = readFileSync(luxPath, 'utf8');

describe('extractLuxCss', () => {
  const { code, css, count } = extractLuxCss(luxCode);

  it('takes every injected stylesheet out of the installed LUX module', () => {
    expect(count).toBeGreaterThan(50);
    expect(code).not.toMatch(/styleInject\$?1?\(css_248z/);
    expect(code).not.toContain('vite-plugin-css-injected-by-js');
    expect(code).not.toMatch(/createElement\(\s*["'`]style["'`]\s*\)\s*;?\s*\w+\.appendChild/);
  });

  it("keeps LUX's own component CSS, which it injects separately", () => {
    expect(css).toContain('.lux-alert');
  });

  it('takes out a self-invoking injection of a <style> element', () => {
    const sample = [
      'export const x = 1;',
      '(function() {',
      '  "use strict";',
      '  try {',
      '    if (typeof document != "undefined") {',
      '      var elementStyle = document.createElement("style");',
      "      elementStyle.appendChild(document.createTextNode('.lux-a{color:red}'));",
      '      document.head.appendChild(elementStyle);',
      '    }',
      '  } catch (e) {',
      '    console.error("vite-plugin-css-injected-by-js", e);',
      '  }',
      '})();',
    ].join('\n');

    const result = extractLuxCss(sample);

    expect(result.count).toBe(1);
    expect(result.css).toBe('.lux-a{color:red}');
    expect(result.code).not.toContain('createElement');
    expect(result.code).toContain('export const x = 1;');
  });

  it('keeps the CSS of the components the pages use', () => {
    for (const className of ['.utrecht-button', '.utrecht-link', '.utrecht-heading-1']) {
      expect(css).toContain(className);
    }
  });

  it('handles each quote style the bundle uses', () => {
    const sample = [
      'var css_248z$a = ".a{color:red}";',
      "var css_248z$b = '.b{color:blue}';",
      'var css_248z = `.c{\n  color:green}`;',
      'styleInject(css_248z$a);',
      'styleInject$1(css_248z$b);',
      'styleInject(css_248z);',
      'export const x = 1;',
    ].join('\n');

    const result = extractLuxCss(sample);

    expect(result.count).toBe(3);
    expect(result.css).toBe('.a{color:red}\n.b{color:blue}\n.c{\n  color:green}');
    expect(result.code).not.toContain('styleInject');
    expect(result.code).toContain('export const x = 1;');
  });
});

describe('luxCssPlugin', () => {
  const plugin = luxCssPlugin();
  const context = {
    error: (message) => {
      throw new Error(message);
    },
  };

  it('applies to the build only', () => {
    expect(plugin.apply).toBe('build');
  });

  it('serves the extracted CSS as a virtual stylesheet the LUX module imports', () => {
    expect(LUX_MODULE.test(luxPath)).toBe(true);

    const result = plugin.transform.call(context, luxCode, luxPath);

    expect(result.code.startsWith(`import "${VIRTUAL_ID}";`)).toBe(true);
    expect(plugin.resolveId(VIRTUAL_ID)).toBe(VIRTUAL_ID);
    expect(plugin.load(VIRTUAL_ID)).toContain('.utrecht-button');
  });

  it('leaves other modules alone', () => {
    expect(plugin.transform.call(context, 'export {}', '/src/main.tsx')).toBeUndefined();
  });

  it('fails the build when the LUX module no longer injects stylesheets', () => {
    const lege = luxPath;
    expect(() => plugin.transform.call(context, 'export const y = 2;', lege)).toThrow(/lux-css/);
  });
});
