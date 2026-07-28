/**
 * Application configuration for the SpatialVerse RN sample app.
 * Replace MetaAtlas credentials with values from your TwinMatrix representative.
 */

export type AppConfig = {
  metaAtlas: {
    accessToken: string;
    secretKey: string;
    role: string;
  };
};

const appConfig: AppConfig = {
  metaAtlas: {
    // Demo credentials (from rn-u sample) — replace for your environment
    accessToken:
      '3c84fe0ae26083db52072126554c3b190ca199843a409f36514abca740474c26',
    secretKey: '7911y683-z093-yc17-z0x3-y045x76x',
    role: 'changipublic',
  },
};

export default appConfig;
