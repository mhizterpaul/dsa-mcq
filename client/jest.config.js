/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        '@react-native',
        'react-native',
        'react-clone-referenced-element',
        '@react-navigation',
        'react-native-url-polyfill',
        'whatwg-url-without-unicode',
        'react-native-gesture-handler',
        'react-native-ui-lib',
        'uilib-native',
        'react-native-worklets',
        'react-native-reanimated',
        'react-redux',
        '@reduxjs/toolkit',
        'immer',
        '@mswjs/interceptors',
        'msw',
        'react-native-vector-icons',
        '@testing-library',
      ]
        .map(pkg => `${pkg}(/.*)?`)
        .join('|') +
      ')/)',
  ],

  setupFilesAfterEnv: ['./jest.setup.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  clearMocks: true,
  verbose: true,
  testTimeout: 20000,
};
