module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      ...require('@typescript-eslint/eslint-plugin').configs.recommended.rules,
    },
  },
];