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
    accessToken: '',
    secretKey: '',
    role: '',
  },
};

export default appConfig;
