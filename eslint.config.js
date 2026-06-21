module.exports = [{
  files: ['**/*.{js,jsx,ts,tsx}'],
  ignores: ['node_modules/**', 'dist/**'],
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      project: './tsconfig.json',
    },
  },
  plugins: {
    react: require('eslint-plugin-react'),
    '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
}];
