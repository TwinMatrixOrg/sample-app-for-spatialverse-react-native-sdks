const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * - Watches local SDKs (`./sdk/map-sdk`, `./sdk/ui-sdk`)
 * - UI SDK resolves to TypeScript source for HMR
 * - Map SDK resolves to TypeScript source
 * - Forces host app React / RN peers
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

// Scoped names like `@shopify/flash-list` must match Windows `\` as well as `/`.
const packageNameToPathPattern = name =>
  name.split('/').map(escapeForRegex).join('[/\\\\]');

const isPeerSingleton = moduleName =>
  peerSingletons.some(
    name => moduleName === name || moduleName.startsWith(`${name}/`),
  );

const extraNodeModules = {
  '@twinmatrix/rn-ui-sdk': uiSdkRoot,
  '@twinmatrix/spatialverse-sdk-rn': mapSdkRoot,
};
for (const name of peerSingletons) {
  extraNodeModules[name] = path.resolve(appNodeModules, name);
}

const nestedNodeModulesRoots = [
  path.join(uiSdkRoot, 'node_modules'),
  path.join(mapSdkRoot, 'node_modules'),
];
const blockList = nestedNodeModulesRoots.flatMap(root =>
  peerSingletons.map(
    name =>
      new RegExp(
        `${escapeForRegex(root)}[/\\\\]${packageNameToPathPattern(
          name,
        )}[/\\\\].*`,
      ),
  ),
);

const uiSdkEntry = path.resolve(uiSdkRoot, 'src/index.ts');
const appPackageJson = path.join(appNodeModules, 'package.json');

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
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === '@twinmatrix/rn-ui-sdk') {
        return {filePath: uiSdkEntry, type: 'sourceFile'};
      }
      if (moduleName === '@twinmatrix/spatialverse-sdk-rn') {
        return {
          filePath: path.resolve(mapSdkRoot, 'src/index.ts'),
          type: 'sourceFile',
        };
      }
      // Nested SDK node_modules (esp. scoped peers on Windows) otherwise
      // register native views twice — AutoLayoutView / FlashList crash.
      if (isPeerSingleton(moduleName)) {
        return context.resolveRequest(
          {
            ...context,
            originModulePath: appPackageJson,
          },
          moduleName,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
