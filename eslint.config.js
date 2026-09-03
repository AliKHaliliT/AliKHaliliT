import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsdoc from 'eslint-plugin-jsdoc'
import sonarjs from 'eslint-plugin-sonarjs'
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
    // Every export carries a doc comment; the one-sentence minimum is the rulebook's
    // code-level convention. Suites live outside src and are exempt. Where a comment
    // documents parameters, the names must be the signature's, which a machine decides.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { jsdoc },
    rules: {
      'jsdoc/check-param-names': ['error', { checkDestructured: false }],
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
  {
    // A local assigned and then immediately returned is a name that says nothing the
    // function's own name did not; inline it, and keep the names that explain an
    // expression. The style's decision 0022 carries the line.
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    plugins: { sonarjs },
    rules: {
      'sonarjs/prefer-immediate-return': 'error',
    },
  },
  {
    // The mechanical half of security, the part that needs no threat model to judge.
    // Every rule here fires on a construct that is wrong whoever the attacker is, so
    // none of them asks this project to guess at a threat model it does not have.
    // The style's decision 0024 carries why the rest of the security vocabulary stays out.
    //
    // The three warnings are advice rather than law. Each guesses from the shape of a
    // string or a pattern and cannot decide its own question, so it may not gate; it
    // hands review a candidate instead. The style's decision 0025 carries the principle,
    // and the agent guide states what a warning obliges. Warnings are read and answered,
    // never suppressed to make a run look clean.
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    plugins: { sonarjs },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'sonarjs/code-eval': 'error',
      'sonarjs/no-hardcoded-passwords': 'warn',
      'sonarjs/no-hardcoded-secrets': 'warn',
      'sonarjs/slow-regex': 'warn',
      'sonarjs/no-clear-text-protocols': 'error',
      'sonarjs/pseudo-random': 'error',
      'sonarjs/no-weak-cipher': 'error',
      'sonarjs/no-weak-keys': 'error',
      'sonarjs/hashing': 'error',
      'sonarjs/insecure-cookie': 'error',
      'sonarjs/no-intrusive-permissions': 'error',
    },
  },
  {
    // The ambient canvas rolls visual jitter only: spawn positions, drift speeds, and
    // twinkle phases of decorative motes. Nobody is attacking a decoration, so the
    // weak-randomness rule is waived for this one file instead of dimmed everywhere.
    files: ['src/shared/ui/AmbientField.tsx'],
    rules: {
      'sonarjs/pseudo-random': 'off',
    },
  },
  ...layerRules,
])
