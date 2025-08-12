import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:5001',
  appName: 'Document Management - Staging',
  enableDebugMode: true,
  enableDevTools: true,
  useHostBasedApi: false, // Keep using fixed localhost:5001 for staging
  authAuthorityUrl: 'https://ocr-app-api.csharpp.com' // Staging auth server
};
