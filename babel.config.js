module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind', unstable_transformImportMeta: true }], 'nativewind/babel'],

    plugins: [
      // NOTE: this is only necessary if you are using reanimated for animations
      'react-native-reanimated/plugin',
    ],
  };
};
