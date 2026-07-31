const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for npm-installed TwinMatrix SDKs.
 * Forces a single copy of React / RN peer singletons from the app root.
 */
const projectRoot = __dirname;
const appNodeModules = path.resolve(projectRoot, 'node_modules');

const peerSingletons = [
  'react',
  'react-native',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-svg',
  '@gorhom/bottom-sheet',
  '@shopify/flash-list',
  'zustand',
];

const extraNodeModules = {};
for (const name of peerSingletons) {
  extraNodeModules[name] = path.resolve(appNodeModules, name);
}

const config = {
  resolver: {
    extraNodeModules,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
