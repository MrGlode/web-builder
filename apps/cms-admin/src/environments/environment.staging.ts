import type { AppConfig } from '@site-factory/core-config';

export const environment: AppConfig = {
  environment: 'staging',
  production: false,
  apiBaseUrl: 'https://api.staging.company.com',

  auth: {
    issuerUrl: 'https://is.staging.company.com/oauth2/token',
    clientId: 'site-factory-cms-staging',
    scopes: 'openid profile email',
    securedApiUrls: ['https://api.staging.company.com'],
  },

  apim: {
    portalUrl: 'https://apim.staging.company.com/devportal',
  },

  features: {
    enableMocks: false,
    enableDebugTools: true,
  },
};
