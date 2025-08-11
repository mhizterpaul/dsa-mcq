module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|uuid|@cucumber|jest-cucumber)/)',
  ],
  testMatch: ['**/*.steps.ts', '**/*.test.ts'],
};
