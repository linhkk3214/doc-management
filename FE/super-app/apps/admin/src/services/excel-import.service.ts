import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '@super-app/shared';
import { buildApiUrl, API_CONSTANTS } from '../app/constants/api.constants';

export interface ExcelImportProgress {
  stage: string;
  processed: number;
  total: number;
  percentage: number;
  message: string;
  isComplete: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface ExcelImportResult {
  success: boolean;
  message: string;
  importedDocuments: number;
  importedPortfolios: number;
  importedDocumentTypes: number;
  importedDepartments: number;
  importedTerms: number;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {
  private http = inject(HttpClient);
  private baseUrl = buildApiUrl(API_CONSTANTS.ENDPOINTS.DOCUMENTS_IMPORT_EXCEL);

  constructor() {}

  /**
   * Upload và import file Excel
   */
  importExcel(file: File): Observable<ExcelImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ExcelImportResult>(this.baseUrl, formData, {
      headers: {
        // Không set Content-Type để browser tự động set multipart/form-data
      }
    });
  }

  /**
   * Kiểm tra trạng thái import (để sử dụng với SignalR sau này)
   */
  checkImportStatus(importId: string): Observable<ExcelImportProgress> {
    return this.http.get<ExcelImportProgress>(`${this.baseUrl}/status/${importId}`);
  }

  /**
   * Validate file trước khi import
   */
  validateExcelFile(file: File): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];

    // Kiểm tra định dạng file
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      errors.push('File phải có định dạng Excel (.xlsx hoặc .xls)');
    }

    // Kiểm tra kích thước file (giới hạn 50MB)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File không được vượt quá 50MB');
    }

    // Kiểm tra file có rỗng không
    if (file.size === 0) {
      errors.push('File không được rỗng');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Lấy template Excel để download
   */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/template`, {
      responseType: 'blob'
    });
  }
}
