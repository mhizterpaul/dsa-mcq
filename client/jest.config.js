module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|uuid|@cucumber|jest-cucumber|@auth/pg-adapter|react-native-vector-icons)/)',
  ],
  testMatch: ['**/*.steps.ts', '**/*.test.ts'],
  modulePaths: ['<rootDir>/src/user/auth-server/node_modules'],
  moduleNameMapper: {
    '^@auth/pg-adapter$': '<rootDir>/src/user/auth-server/node_modules/@auth/pg-adapter/index.js',
    '^@google/genai$': '<rootDir>/__mocks__/@google/genai.js',
  },
};
