import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const NO_FRAME = {
  group: ['**/frame', '**/frame/**'],
  message: 'Content must not import from src/frame/.',
};

const NO_API = {
  group: ['**/api', '**/api/**'],
  allowTypeImports: true,
  message: 'Features and UI components never call the API: take data as props.',
};

export default [
  // Generated output, including Playwright's reports, is not linted.
  { ignores: ['dist/**', 'docs/**', '.superpowers/**', 'playwright-report/**', 'test-results/**'] },

  js.configs.recommended,

  // Application source
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // New TypeScript code: type-checked rules, and the layering of the spec ("Layers").
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts', 'playwright.config.ts'],
  })),
  {
    files: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      parserOptions: {
        // playwright.config.ts sits outside both projects; it is checked with e2e's.
        projectService: {
          allowDefaultProject: ['playwright.config.ts'],
          defaultProject: 'e2e/tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // The walkthroughs and their config run in Node.
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.tsx'],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Only src/api/ talks to the network. (The old page in .jsx is removed in Task 26.)
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/api/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Only src/api/ fetches. Get data from a route loader.' },
      ],
    },
  },
  // Content never depends on the stand-in frame, so the frame can be switched off. Features
  // and UI components also never call the API: data comes in as props. Types may be shared.
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: [NO_FRAME] }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: [NO_FRAME, NO_API] }],
    },
  },

  // Root configuration files and scripts
  {
    files: ['*.{js,mjs}', 'scripts/**/*.{js,mjs}', 'api/**/*.js', 'vite/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },

  // Formatting belongs to Prettier.
  prettier,
];
