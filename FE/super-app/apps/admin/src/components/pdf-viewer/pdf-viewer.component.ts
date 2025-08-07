import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DocumentService } from '../../services/document.service';
import { Subject, takeUntil } from 'rxjs';
import { ObjectType } from '@super-app/shared';

export interface DocumentViewData {
  id: string;
  title?: string;
  documentSymbol?: string;
}

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  @Input()
  set document(value: any) {
    this._document = value;
    this.loadFile();
  }
  _document: any;
  @Input() width: string = '100%';
  @Input() height: string = '600px';
  @Input() showToolbar: boolean = true;

  pdfSrc: string | Uint8Array | null = null;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // PDF viewer variables
  zoom: number = 1.0;
  page: number = 1;
  totalPages: number = 0;
  initialized = false;

  constructor(private documentService: DocumentService) {}

  ngOnInit() {
    this.initialized = true;
    if (this._document) {
      this.loadFile();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFile() {
    if (!this.initialized) return;
    if (!this._document?.id) {
      this.error = 'Không có thông tin tài liệu';
      return;
    }

    this.loading = true;
    this.error = null;

    // Load file as blob for ng2-pdf-viewer
    this.documentService
      .viewFile(this._document.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          // Convert blob to array buffer for ng2-pdf-viewer
          blob.arrayBuffer().then((arrayBuffer) => {
            this.pdfSrc = new Uint8Array(arrayBuffer);
            this.loading = false;
          });
        },
        error: (error) => {
          console.error('Load file error:', error);
          this.loading = false;
          this.error =
            error.status === 404
              ? 'File không tồn tại hoặc đã bị xóa'
              : 'Có lỗi xảy ra khi tải file. Vui lòng thử lại.';
        },
      });
  }

  onPdfLoaded(pdf: any) {
    this.totalPages = pdf.numPages;
    this.loading = false;
    this.error = null;
  }

  onPdfLoadError(error: any) {
    console.error('PDF load error:', error);
    this.loading = false;
    this.error =
      'Không thể tải file PDF. File có thể bị hỏng hoặc không đúng định dạng PDF.';
  }

  onPageChange(page: any) {
    this.page = page;
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  zoomIn() {
    this.zoom = Math.min(3, this.zoom + 0.25);
  }

  zoomOut() {
    this.zoom = Math.max(0.25, this.zoom - 0.25);
  }

  goToPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.page = pageNum;
    }
  }

  downloadFile() {
    if (!this.document?.id) return;

    this.documentService
      .downloadFile(this.document.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Try to get filename from document info or use default
          const filename = this.document?.documentSymbol
            ? `${this.document.documentSymbol}.pdf`
            : 'document.pdf';

          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('Download error:', error);
          this.error = 'Có lỗi xảy ra khi tải file';
        },
      });
  }

  openInNewTab() {
    if (!this.document?.id) return;

    const url = this.documentService.getFileUrl(this.document.id);
    window.open(url, '_blank');
  }

  retry() {
    this.loadFile();
  }
}
