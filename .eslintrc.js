module.exports = {
  root: true,
  extends: 'airbnb-typescript/base',
  plugins: ['import', 'prettier'],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  'overrides': [
    {
      'files': ['./**/*.ts'],
      'parserOptions': {
        'project': './tsconfig.json',
      },
    },
  ],
  ignorePatterns: ['node_modules', 'dist', 'data', 'volumes', 'repositories'],
};