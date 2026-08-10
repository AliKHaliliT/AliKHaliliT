import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsdoc from 'eslint-plugin-jsdoc'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'


/**
 * The layer rule, enforced rather than reviewed.
 *
 * Each entry names a layer and the layers it may not reach. Cross-slice imports
 * always travel through the '@/' alias, which is what makes them checkable here;
 * a slice's own files use relative paths and are untouched by these patterns.
 */
const LAYERS = [
  { files: ['src/app/**'], forbid: [] },
  { files: ['src/pages/**'], forbid: ['app'] },
  { files: ['src/features/**'], forbid: ['app', 'pages'] },
  { files: ['src/entities/**'], forbid: ['app', 'pages', 'features'] },
  { files: ['src/shared/**'], forbid: ['app', 'pages', 'features', 'entities'] },
]

// A slice is entered through its index.ts, so reaching past one is its own
// violation. Suites live outside src/ and never match these globs.
const DEEP_IMPORT = {
  group: ['@/entities/*/*', '@/features/*/*', '@/pages/*/*', '@/shared/*/*'],
  message: 'Enter a slice through its index.ts, not by reaching inside it.',
}

// One rule per layer: ESLint's later config wins for a matching file, so the
// directional patterns and the deep-import pattern have to travel together.
const layerRules = LAYERS.map(({ files, forbid }) => ({
  files,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          ...forbid.map((layer) => ({
            group: [`@/${layer}`, `@/${layer}/**`],
            message: `Imports point downward only: this layer may not reach @/${layer}.`,
          })),
          DEEP_IMPORT,
        ],
      },
    ],
  },
}))

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // Match the TypeScript convention: underscore-prefixed = intentionally unused.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Where the choice of string delimiter is free, it is double quotes; switching
      // is only for avoiding escapes. The style's rule, checked here.
      quotes: ['error', 'double', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-double'],
      // The environment is read only through shared/config, and HTTP lives only in its
      // documented home; both rules are checked here, with the homes excepted below.
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.meta.name='import'][object.property.name='meta'][property.name='env']",
          message: 'Read the environment through shared/config, never import.meta.env directly.',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'HTTP lives in its documented home, not inline.' },
      ],
    },
  },
  {
    // Every export carries a doc comment; suites live outside src and are exempt.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { jsdoc },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            ClassDeclaration: true,
            FunctionDeclaration: true,
          },
          contexts: [
            'ExportNamedDeclaration > VariableDeclaration',
            'ExportDefaultDeclaration > ArrowFunctionExpression',
            'ExportNamedDeclaration > TSInterfaceDeclaration',
            'ExportNamedDeclaration > TSTypeAliasDeclaration',
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/config/**', 'vite.config.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'no-restricted-globals': 'off',
    },
  },
  ...layerRules,
])
