const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { sourceExts, assetExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts: [...sourceExts, 'mjs', 'cjs'],
    blockList: [
      /.*[/\\]android[/\\].*/,
      /.*[/\\]ios[/\\].*/,
      /.*[/\\]\.cxx[/\\].*/,
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);
