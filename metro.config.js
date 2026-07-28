const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * - Watches local MetaAtlas RN SDK (`./sdk`)
 * - Watches sibling `@twinmatrix/rn-ui-sdk` source/build
 * - Forces host app React / RN peers (UI SDK may ship different copies in node_modules)
 */
const projectRoot = __dirname;
const mapSdkRoot = path.resolve(projectRoot, 'sdk');
const uiSdkRoot = path.resolve(projectRoot, '../twinmatrix-ui-sdk');
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

const escapeForRegex = value =>
  value.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\\\\/g, '[/\\\\]');

const extraNodeModules = {
  '@twinmatrix/rn-ui-sdk': uiSdkRoot,
};
for (const name of peerSingletons) {
  extraNodeModules[name] = path.resolve(appNodeModules, name);
}

const uiSdkNodeModules = path.join(uiSdkRoot, 'node_modules');
const blockList = peerSingletons.map(
  name =>
    new RegExp(
      `${escapeForRegex(uiSdkNodeModules)}[/\\\\]${escapeForRegex(name)}[/\\\\].*`,
    ),
);

const config = {
  watchFolders: [mapSdkRoot, uiSdkRoot],
  resolver: {
    unstable_enableSymlinks: true,
    blockList,
    nodeModulesPaths: [
      appNodeModules,
      path.resolve(mapSdkRoot, 'node_modules'),
    ],
    extraNodeModules,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
