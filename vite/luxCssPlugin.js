// Build-time plugin: moves the LUX React components' styles into an ordinary stylesheet.
//
// @lux-design-system/components-react injects its CSS at run time, as one <style> element per
// component (a bundled `styleInject` helper). The strict CSP (`style-src 'self'`) blocks those,
// so the components would render unstyled, and LUX publishes no separate CSS package. This
// plugin rewrites the LUX module during the build: it collects the CSS strings, removes the
// injection calls, and imports the CSS as a virtual stylesheet that Vite emits as a file.
//
// The dev server pre-bundles dependencies without this plugin, so `npm run dev` keeps the
// injection; it sends no CSP. The build and `vite preview` (and so the walkthroughs) use the
// extracted file. If a LUX update changes how it bundles CSS, the build fails here instead of
// shipping unstyled pages.
import { parseAst } from 'vite';

export const LUX_MODULE = /[\\/]@lux-design-system[\\/]components-react[\\/]dist[\\/]index\.mjs$/;
export const VIRTUAL_ID = 'virtual:lux-components.css';

const isCssVariable = (name) => /^css_248z/.test(name);

// The value of a string literal or a template literal without expressions.
function literalValue(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((quasi) => quasi.value.cooked).join('');
  }
  return undefined;
}

/**
 * Takes the CSS out of the LUX module. Returns the module without its injection calls, the
 * CSS in source order, and how many stylesheets were found.
 */
export function extractLuxCss(code) {
  const ast = parseAst(code);
  const css = new Map();
  const removals = [];

  for (const statement of ast.body) {
    if (statement.type === 'VariableDeclaration') {
      for (const declarator of statement.declarations) {
        const name = declarator.id?.name;
        const value = literalValue(declarator.init);
        if (name && isCssVariable(name) && value !== undefined) css.set(name, value);
      }
    }
    const call = statement.type === 'ExpressionStatement' ? statement.expression : undefined;
    if (
      call?.type === 'CallExpression' &&
      call.callee.type === 'Identifier' &&
      /^styleInject/.test(call.callee.name) &&
      call.arguments[0]?.type === 'Identifier' &&
      isCssVariable(call.arguments[0].name)
    ) {
      removals.push({ start: statement.start, end: statement.end, name: call.arguments[0].name });
    }
  }

  const ordered = [];
  let output = code;
  for (const { start, end } of [...removals].reverse()) {
    output = output.slice(0, start) + output.slice(end);
  }
  for (const { name } of removals) {
    const sheet = css.get(name);
    if (sheet === undefined) throw new Error(`LUX stylesheet ${name} has no literal value`);
    ordered.push(sheet);
  }

  return { code: output, css: ordered.join('\n'), count: removals.length };
}

export function luxCssPlugin() {
  let css = '';
  return {
    name: 'lux-css',
    apply: 'build',
    enforce: 'pre',
    resolveId(id) {
      return id === VIRTUAL_ID ? VIRTUAL_ID : undefined;
    },
    load(id) {
      return id === VIRTUAL_ID ? css : undefined;
    },
    transform(code, id) {
      if (!LUX_MODULE.test(id.split('?')[0])) return undefined;
      const extracted = extractLuxCss(code);
      if (extracted.count === 0) {
        this.error('lux-css: no injected stylesheets found in the LUX module; check its bundling');
      }
      css = extracted.css;
      return { code: `import ${JSON.stringify(VIRTUAL_ID)};\n${extracted.code}`, map: null };
    },
  };
}
