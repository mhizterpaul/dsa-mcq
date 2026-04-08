process.env.RNTL_SKIP_DEPS_CHECK = 'true';

module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-redux|@reduxjs/toolkit|react-native-paper|react-native-vector-icons|react-native-app-auth|@react-navigation|react-native-gesture-handler|immer|react-native-base64|react-native-ui-lib|uilib-native|react-native-sse|msw|until-async|@mswjs)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
    'react-native-ui-lib': '<rootDir>/src/__mocks__/react-native-ui-lib.js',
    '^react-test-renderer$': 'test-renderer',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^msw/native$': '<rootDir>/node_modules/msw/lib/native/index.js',
    'react-native-quick-sqlite': '<rootDir>/src/infra/sqlite/database.ts',
  },
};
