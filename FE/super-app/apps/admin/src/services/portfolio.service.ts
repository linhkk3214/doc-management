// streaming.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from '@super-app/shared';
import { Observable } from 'rxjs';
import { buildApiUrl, API_CONSTANTS } from '../app/constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService extends BaseService {
  private readonly baseUrl = buildApiUrl(API_CONSTANTS.ENDPOINTS.PORTFOLIOS);
  constructor() {
    super(buildApiUrl(API_CONSTANTS.ENDPOINTS.PORTFOLIOS));
  }

  /**
     * Get file blob for viewing (opens file in browser)
     */
    viewFile(documentId: string): Observable<Blob> {
      return this._http.get(`${this.baseUrl}/${documentId}/file`, { 
        responseType: 'blob' 
      });
    }
  
    /**
     * Get file URL for viewing in iframe or new tab
     */
    getFileUrl(documentId: string): string {
      return `${this.baseUrl}/${documentId}/file`;
    }
  
    /**
     * Download file (forces download with filename)
     */
    downloadFile(documentId: string): Observable<Blob> {
      return this._http.get(`${this.baseUrl}/${documentId}/download`, { 
        responseType: 'blob' 
      });
    }
  
    /**
     * Get download URL for direct download link
     */
    getDownloadUrl(documentId: string): string {
      return `${this.baseUrl}/${documentId}/download`;
    }
}
