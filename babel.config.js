module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated removed due to React 19 compatibility issues
    // Can be added back when compatibility is resolved
  };
};

