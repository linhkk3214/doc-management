export interface Environment {
  production: boolean;
  apiUrl: string;
  appName: string;
  enableDebugMode: boolean;
  enableDevTools: boolean;
  useHostBasedApi?: boolean; // Optional flag to enable dynamic API URL based on host
  authAuthorityUrl?: string; // Optional auth authority URL for fallback
}
