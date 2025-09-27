/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-paper|react-native-vector-icons|react-native-gesture-handler|@react-navigation|react-native-app-auth|react-native-base64|msw)/)',
  ],

  setupFilesAfterEnv: ['./jest.setup.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

 testEnvironment: 'node',
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
};
