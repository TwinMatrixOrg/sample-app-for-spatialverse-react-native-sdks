module.exports = {
  preset: 'react-native',
  // Each SDK under sdk/ has its own Jest config; run `npm test` inside it.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/sdk/'],
};
