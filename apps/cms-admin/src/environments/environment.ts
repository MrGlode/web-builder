import type { AppConfig } from '@site-factory/core-config';

export const environment: AppConfig = {
  environment: 'development',
  production: false,
  apiBaseUrl: '',

  auth: {
    issuerUrl: 'https://is.placeholder.company.com/oauth2/token',
    clientId: 'site-factory-cms',
    scopes: 'openid profile email',
    securedApiUrls: ['https://api.placeholder.company.com'],
  },

  apim: {
    portalUrl: 'https://apim.placeholder.company.com/devportal',
  },

  features: {
    enableMocks: true,
    enableDebugTools: true,
  },
};
