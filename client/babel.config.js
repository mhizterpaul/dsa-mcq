module.exports = {
  presets: [ 'module:metro-react-native-babel-preset',
  ], // ⬅️ FIX: use official RN preset

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
  ],

  env: {
    test: {
      presets: [
        [
          '@react-native/babel-preset',
        ],
       '@babel/preset-typescript',   
      ],
      plugins: [
        'dynamic-import-node',
      ],
    },
  },
};
