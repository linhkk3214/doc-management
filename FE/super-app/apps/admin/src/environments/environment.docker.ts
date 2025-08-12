import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://localhost:5001', // Fallback URL, not used when useHostBasedApi is true
  appName: 'Document Management - Docker',
  enableDebugMode: false,
  enableDevTools: false,
  useHostBasedApi: true // Enable dynamic API URL based on host for unified container
};