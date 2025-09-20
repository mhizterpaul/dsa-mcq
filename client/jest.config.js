/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        '@react-native',                // React Native core
        'react-native',                 // RN main package
        'react-clone-referenced-element',
        '@react-navigation',
        'react-native-url-polyfill',
        'whatwg-url-without-unicode',
        'react-native-gesture-handler',
        'react-redux',
        '@reduxjs/toolkit',
        'immer',
        '@mswjs/interceptors',
        'msw',
        'react-native-vector-icons',
        '@testing-library',             // ✅ include all testing-library deps
        'expo',                         // ✅ include Expo packages if used
        'expo-.*',                      // ✅ for deep expo deps
      ]
        .map(pkg => `${pkg}(/.*)?`)
        .join('|') +
      ')/)',  // ✅ Properly closes group and regex
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
