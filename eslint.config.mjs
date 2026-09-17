import typescriptParser from '@typescript-eslint/parser';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginImportZod from 'eslint-plugin-import-zod';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...pluginImportZod.configs.recommended,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      '@typescript-eslint/consistent-type-exports': 'error',
    },
  },
  {
    rules: {
      'import/order': [
        'warn',
        {
          groups: [
            'type',
            'builtin',
            'object',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              group: 'external',
              pattern: '~/**',
              position: 'after',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      'no-console': 'warn',

      'padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          next: 'return',
          prev: '*',
        },
        {
          blankLine: 'always',
          next: '*',
          prev: ['const', 'let', 'var'],
        },
        {
          blankLine: 'any',
          next: ['const', 'let', 'var'],
          prev: ['const', 'let', 'var'],
        },
      ],
    },
  },
  {
    rules: {
      'react/jsx-curly-brace-presence': [
        'warn',
        {
          children: 'never',
          props: 'never',
        },
      ],

      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
        },
      ],

      'react/react-in-jsx-scope': 'off',

      'react/self-closing-comp': 'warn',
    },
  },
]);

export default eslintConfig;
