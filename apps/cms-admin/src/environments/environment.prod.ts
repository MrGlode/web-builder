import type { AppConfig } from '@site-factory/core-config';

export const environment: AppConfig = {
  environment: 'production',
  production: true,
  apiBaseUrl: 'https://api.company.com',

  auth: {
    issuerUrl: 'https://is.company.com/oauth2/token',
    clientId: 'site-factory-cms',
    scopes: 'openid profile email',
    securedApiUrls: ['https://api.company.com'],
  },

  apim: {
    portalUrl: 'https://apim.company.com/devportal',
  },

  features: {
    enableMocks: false,
    enableDebugTools: false,
  },
};
