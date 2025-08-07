// streaming.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from '@super-app/shared';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService extends BaseService {
  private readonly baseUrl = 'https://ocr-app-api.csharpp.com/documents';

  constructor() {
    super('https://ocr-app-api.csharpp.com/documents');
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
