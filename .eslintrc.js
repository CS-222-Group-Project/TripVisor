module.exports = {
  extends: 'airbnb',
  parser: '@babel/eslint-parser',
  plugins: [
    'jest',
  ],
  parserOptions: {
    ecmaFeatures: {
      classes: true,
    },
  },
  env: {
    'jest/globals': true,
  },
  rules: {
    'max-len': [2, { code: 250, tabWidth: 4, ignoreUrls: true }],
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'global-require': 'off',
    'no-use-before-define': 'off',
    'no-console': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'no-underscore-dangle': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-nested-ternary': 'off',
    'react/no-multi-comp': 'off',
    'react/no-unescaped-entities': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-fragments': 'off',
  },
};
