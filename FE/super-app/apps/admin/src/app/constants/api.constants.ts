import { environment } from '../../environments/environment';

/**
 * Dynamically determines the API base URL based on the current host
 * In unified container: uses same host as frontend with /api prefix
 * In development: falls back to environment configuration
 */
function getApiBaseUrl(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.host;
    const protocol = window.location.protocol;

    // In unified container, API is served from same host with /api prefix
    // This works because nginx routes /api/* to the backend services
    if (environment.production || environment.useHostBasedApi) {
      return `${protocol}//${currentHost}/api`;
    }
  }

  // Fallback to environment configuration for development
  return environment.apiUrl;
}

/**
 * Dynamically determines the Auth authority URL based on the current host
 * In unified container: uses same host as frontend with /api/auth prefix
 * In development: falls back to environment configuration
 */
export function getAuthAuthorityUrl(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.host;
    const protocol = window.location.protocol;

    // In unified container, auth is served from same host with /api/auth prefix
    if (environment.production || environment.useHostBasedApi) {
      return `${protocol}//${currentHost}/api/auth`;
    }
  }

  // Fallback to environment configuration for development
  return environment.authAuthorityUrl || 'https://ocr-app-api.csharpp.com';
}

export const API_CONSTANTS = {
  get BASE_URL(): string {
    return getApiBaseUrl();
  },
  ENDPOINTS: {
    CITIES: '/cities',
    PORTFOLIOS: '/portfolios',
    DOCUMENTS: '/documents',
    DM_PHONG: '/DMPhong',
    DM_NHIEM_KY: '/DMNhiemKy',
    DM_LOAI_VAN_BAN: '/dmLoaiVanBan',
    GRAPHQL: '/graphql',
    DOCUMENTS_IMPORT_EXCEL: '/documents/import-excel'
  }
};

// Helper function để build full URL
export function buildApiUrl(endpoint: string): string {
  return `${API_CONSTANTS.BASE_URL}${endpoint}`;
}

// Helper function để override base URL cho testing hoặc development
export function setApiBaseUrl(baseUrl: string): void {
  // This function is kept for backward compatibility but the dynamic approach
  // will take precedence in production environments
  console.warn('setApiBaseUrl is deprecated. Use environment.useHostBasedApi = false to disable dynamic API URL detection.');
}
