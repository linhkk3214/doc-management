import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {
  ExcelImportService,
  ExcelImportResult,
} from '../../services/excel-import.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
  ],
  template: `
    <p-dialog
      [visible]="true"
      [modal]="true"
      header="Import Excel"
      [style]="{ width: '600px' }"
      [closable]="!importing()"
      (onHide)="onDialogHide()"
      [draggable]="false"
      [resizable]="false"
    >
      <div class="dialog-content">
        <!-- Hướng dẫn -->
        <div
          class="instruction-section"
          *ngIf="!selectedFile() && !importing()"
        >
          <h4>Hướng dẫn import</h4>
          <ul>
            <li>File Excel phải có định dạng .xlsx hoặc .xls</li>
            <li>Kích thước file không vượt quá 50MB</li>
            <li>Dữ liệu bắt đầu từ dòng 2 (dòng 1 là tiêu đề)</li>
            <li>Các cột bắt buộc phải có dữ liệu</li>
          </ul>

          <div class="template-section">
            <p-button
              label="📄 Tải template Excel"
              severity="secondary"
              (click)="downloadTemplate()"
            ></p-button>
            <small>Tải file mẫu để xem cấu trúc dữ liệu</small>
          </div>
        </div>

        <!-- Upload file -->
        <div class="upload-section" *ngIf="!importing()">
          <div class="file-input-wrapper">
            <input
              type="file"
              id="excelFile"
              accept=".xlsx,.xls"
              (change)="onFileSelected($event)"
              #fileInput
            />
            <label for="excelFile" class="file-input-label">
              <span *ngIf="!selectedFile()">📁 Chọn file Excel</span>
              <span *ngIf="selectedFile()">✓ {{ selectedFile()?.name }}</span>
            </label>
          </div>

          <div class="validation-errors" *ngIf="validationErrors().length > 0">
            <div class="error-item" *ngFor="let error of validationErrors()">
              ❌ {{ error }}
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="progress-section" *ngIf="importing()">
          <div class="progress-info">
            <div class="progress-label">Đang xử lý...</div>
            <div class="progress-percentage">{{ importProgress() }}%</div>
          </div>
          <p-progressBar
            [value]="importProgress()"
            [showValue]="false"
          ></p-progressBar>
          <div class="progress-message">{{ importMessage() }}</div>
        </div>

        <!-- Results -->
        <div class="results-section" *ngIf="importResult() && !importing()">
          <div
            class="result-header"
            [class.success]="importResult()!.success"
            [class.error]="!importResult()!.success"
          >
            <h4 *ngIf="importResult()!.success">✅ Import thành công!</h4>
            <h4 *ngIf="!importResult()!.success">❌ Import thất bại!</h4>
          </div>

          <div class="result-stats" *ngIf="importResult()!.success">
            <div class="stat-item">
              <span class="stat-label">Văn bản:</span>
              <span class="stat-value">{{
                importResult()!.importedDocuments
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Hồ sơ:</span>
              <span class="stat-value">{{
                importResult()!.importedPortfolios
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Loại văn bản:</span>
              <span class="stat-value">{{
                importResult()!.importedDocumentTypes
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Phông:</span>
              <span class="stat-value">{{
                importResult()!.importedDepartments
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Nhiệm kỳ:</span>
              <span class="stat-value">{{
                importResult()!.importedTerms
              }}</span>
            </div>
          </div>

          <div class="result-errors" *ngIf="importResult()!.errors.length > 0">
            <h5>Lỗi:</h5>
            <div
              class="error-item"
              *ngFor="let error of importResult()!.errors"
            >
              ❌ {{ error }}
            </div>
          </div>

          <div
            class="result-warnings"
            *ngIf="importResult()!.warnings.length > 0"
          >
            <h5>Cảnh báo:</h5>
            <div
              class="warning-item"
              *ngFor="let warning of importResult()!.warnings"
            >
              ⚠️ {{ warning }}
            </div>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="{{ importing() ? 'Đang xử lý...' : 'Đóng' }}"
          severity="secondary"
          (click)="closeDialog()"
          [disabled]="importing()"
        ></p-button>

        <p-button
          label="{{ importing() ? 'Đang import...' : 'Bắt đầu import' }}"
          (click)="startImport()"
          [disabled]="
            !selectedFile() || validationErrors().length > 0 || importing()
          "
          *ngIf="!importResult() || !importResult()!.success"
        ></p-button>

        <p-button
          label="Import file khác"
          (click)="resetForm()"
          *ngIf="importResult() && importResult()!.success"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .dialog-content {
        max-height: 60vh;
        overflow-y: auto;
      }

      .instruction-section {
        margin-bottom: 24px;
      }

      .instruction-section h4 {
        margin: 0 0 12px 0;
        color: #333;
        font-size: 1.1rem;
      }

      .instruction-section ul {
        margin: 0 0 20px 0;
        padding-left: 20px;
        color: #666;
      }

      .instruction-section li {
        margin-bottom: 8px;
      }

      .template-section {
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #007bff;
      }

      .template-section small {
        display: block;
        margin-top: 8px;
        color: #666;
      }

      .file-input-wrapper {
        margin-bottom: 16px;
      }

      .file-input-wrapper input[type='file'] {
        display: none;
      }

      .file-input-label {
        display: inline-block;
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-weight: 500;
      }

      .file-input-label:hover {
        background: #0056b3;
      }

      .validation-errors {
        background: #fff5f5;
        border: 1px solid #fed7d7;
        border-radius: 6px;
        padding: 12px;
      }

      .error-item {
        color: #e53e3e;
        margin-bottom: 4px;
      }

      .error-item:last-child {
        margin-bottom: 0;
      }

      .progress-section {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 20px 0;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .progress-label {
        font-weight: 500;
        color: #333;
      }

      .progress-percentage {
        font-weight: bold;
        color: #007bff;
      }

      .progress-message {
        font-size: 0.9rem;
        color: #666;
        text-align: center;
        margin-top: 8px;
      }

      .results-section {
        margin-top: 24px;
      }

      .result-header.success {
        color: #38a169;
      }

      .result-header.error {
        color: #e53e3e;
      }

      .result-header h4 {
        margin: 0 0 16px 0;
      }

      .result-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-label {
        color: #666;
        font-size: 0.9rem;
      }

      .stat-value {
        font-weight: bold;
        color: #38a169;
        font-size: 1.1rem;
      }

      .result-errors,
      .result-warnings {
        margin-top: 16px;
        padding: 12px;
        border-radius: 6px;
      }

      .result-errors {
        background: #fff5f5;
        border: 1px solid #fed7d7;
      }

      .result-warnings {
        background: #fffaf0;
        border: 1px solid #fbd38d;
      }

      .result-errors h5,
      .result-warnings h5 {
        margin: 0 0 8px 0;
        font-size: 1rem;
      }

      .result-errors h5 {
        color: #e53e3e;
      }

      .result-warnings h5 {
        color: #d69e2e;
      }

      .warning-item {
        color: #d69e2e;
        margin-bottom: 4px;
      }

      .warning-item:last-child {
        margin-bottom: 0;
      }

      /* PrimeNG Dialog customizations */
      :host ::ng-deep .p-dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      :host ::ng-deep .p-progressbar {
        height: 8px;
        border-radius: 4px;
        background: #e9ecef;
      }

      :host ::ng-deep .p-progressbar .p-progressbar-value {
        background: linear-gradient(90deg, #007bff, #0056b3);
      }
    `,
  ],
})
export class ExcelImportDialogComponent {
  private excelImportService = inject(ExcelImportService);

  // Output events
  onClose = output<void>();
  onImportComplete = output<ExcelImportResult>();

  // Signals for reactive UI
  selectedFile = signal<File | null>(null);
  validationErrors = signal<string[]>([]);
  importing = signal(false);
  importProgress = signal(0);
  importMessage = signal('');
  importResult = signal<ExcelImportResult | null>(null);

  close = new EventEmitter<any>();

  onDialogHide() {
    this.onClose.emit();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      this.selectedFile.set(null);
      this.validationErrors.set([]);
      return;
    }

    this.selectedFile.set(file);

    const validation = this.excelImportService.validateExcelFile(file);
    this.validationErrors.set(validation.errors);
  }

  startImport() {
    const file = this.selectedFile();
    if (!file) return;

    this.importing.set(true);
    this.importProgress.set(0);
    this.importMessage.set('Đang tải file lên server...');
    this.importResult.set(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const current = this.importProgress();
      if (current < 90) {
        this.importProgress.set(current + 10);
        if (current === 0)
          this.importMessage.set('Đang phân tích dữ liệu Excel...');
        else if (current === 30)
          this.importMessage.set('Đang xử lý danh mục...');
        else if (current === 60)
          this.importMessage.set('Đang tạo hồ sơ và văn bản...');
      }
    }, 500);

    this.excelImportService
      .importExcel(file)
      .pipe(
        finalize(() => {
          clearInterval(progressInterval);
          this.importing.set(false);
          this.importProgress.set(100);
        })
      )
      .subscribe({
        next: (result) => {
          this.importResult.set(result);
          if (result.success) {
            this.importMessage.set('Import hoàn tất thành công!');
            this.onImportComplete.emit(result);
          } else {
            this.importMessage.set('Import thất bại!');
          }
        },
        error: (error) => {
          console.error('Import error:', error);
          this.importResult.set({
            success: false,
            message: 'Có lỗi xảy ra trong quá trình import',
            importedDocuments: 0,
            importedPortfolios: 0,
            importedDocumentTypes: 0,
            importedDepartments: 0,
            importedTerms: 0,
            errors: [
              error.error?.message || error.message || 'Lỗi không xác định',
            ],
            warnings: [],
          });
          this.importMessage.set('Có lỗi xảy ra!');
        },
      });
  }

  downloadTemplate() {
    this.excelImportService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Template_Import_Document.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Download template error:', error);
        alert('Không thể tải template. Vui lòng thử lại sau.');
      },
    });
  }

  resetForm() {
    this.selectedFile.set(null);
    this.validationErrors.set([]);
    this.importing.set(false);
    this.importProgress.set(0);
    this.importMessage.set('');
    this.importResult.set(null);

    // Reset file input
    const fileInput = document.getElementById('excelFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  closeDialog() {
    this.onClose.emit();
  }
}
