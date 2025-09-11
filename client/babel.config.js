module.exports = {
  presets: [
    '@react-native/babel-preset', // React Native preset
    '@babel/preset-typescript',               // TypeScript support
  ],
  plugins: [
    'react-native-worklets/plugin',
  ],
};
