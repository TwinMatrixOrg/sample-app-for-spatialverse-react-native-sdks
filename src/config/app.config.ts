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
      'a69f469d1ee1560faac3536dedfe81be5b7c7b55b875d0bddee9feca5e89316a',
    secretKey: 'z17074cx-z69y-c23b-14z4-223893yz',
    role: 'rws-tic',
  },
};

export default appConfig;
