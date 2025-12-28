import mantine from 'eslint-config-mantine';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// @ts-check
export default defineConfig(
  tseslint.configs.recommended,
  ...mantine,

  // 🔥 React Hooks rules
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  { ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}', '.next'] },

  {
    files: ['**/*.story.tsx'],
    rules: { 'no-console': 'off' },
  },

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: process.cwd(),
        project: ['./tsconfig.json'],
      },
    },
  }
);
