module.exports = {
  presets: [
    '@react-native/babel-preset',   // core RN preset
    '@babel/preset-typescript',     // adds explicit TypeScript support
  ],

  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
        },
      },
    ],
    ['@babel/plugin-transform-runtime', { helpers: true }],
    'react-native-reanimated/plugin', // MUST be last
  ],

  env: {
    test: {
      plugins: ['dynamic-import-node'],
    },
  },
};