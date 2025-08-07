import { environment } from '../../environments/environment';

export const API_CONSTANTS = {
  BASE_URL: environment.apiUrl,
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
  (API_CONSTANTS as { BASE_URL: string; ENDPOINTS: Record<string, string> }).BASE_URL = baseUrl;
}
