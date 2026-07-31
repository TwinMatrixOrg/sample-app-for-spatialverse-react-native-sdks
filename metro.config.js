const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * - Watches local MetaAtlas RN SDK (`./sdk/map-sdk`)
 * - Watches local `@twinmatrix/rn-ui-sdk` (`./sdk/ui-sdk`)
 * - Forces host app React / RN peers (UI SDK may ship different copies in node_modules)
 */
const projectRoot = __dirname;
const mapSdkRoot = path.resolve(projectRoot, 'sdk/map-sdk');
const uiSdkRoot = path.resolve(projectRoot, 'sdk/ui-sdk');
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
  'meta-atlas-sdk': mapSdkRoot,
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

const uiSdkEntry = path.resolve(uiSdkRoot, 'src/index.ts');

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
    /**
     * Resolve the UI SDK to TypeScript source (no build/lib required).
     * Keeps app imports as `@twinmatrix/rn-ui-sdk` while Metro + HMR watch `sdk/ui-sdk/src`.
     */
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === '@twinmatrix/rn-ui-sdk') {
        return {filePath: uiSdkEntry, type: 'sourceFile'};
      }
      if (moduleName === 'meta-atlas-sdk') {
        return {
          filePath: path.resolve(mapSdkRoot, 'src/index.ts'),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
