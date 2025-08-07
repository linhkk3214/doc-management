import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileViewDialogComponent } from './file-view-dialog/file-view-dialog.component';
import { DocumentViewData } from './pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-pdf-test',
  standalone: true,
  imports: [CommonModule, FormsModule, FileViewDialogComponent],
  template: `
    <div class="test-container">
      <h2>PDF Viewer Test</h2>
      
      <div class="form-group">
        <label>Document ID:</label>
        <input 
          type="text" 
          [(ngModel)]="documentId" 
          placeholder="Enter document ID"
          class="form-control">
      </div>
      
      <div class="form-group">
        <label>Document Title:</label>
        <input 
          type="text" 
          [(ngModel)]="documentTitle" 
          placeholder="Enter document title"
          class="form-control">
      </div>
      
      <div class="form-group">
        <label>Document Symbol:</label>
        <input 
          type="text" 
          [(ngModel)]="documentSymbol" 
          placeholder="Enter document symbol"
          class="form-control">
      </div>
      
      <button 
        (click)="openPdfViewer()" 
        [disabled]="!documentId"
        class="btn btn-primary">
        View PDF
      </button>
      
      <!-- PDF Dialog -->
      <app-file-view-dialog
        [(visible)]="showDialog"
        [document]="currentDocument">
      </app-file-view-dialog>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .btn {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    .btn:hover:not(:disabled) {
      background-color: #0056b3;
    }
  `]
})
export class PdfTestComponent {
  documentId: string = '';
  documentTitle: string = '';
  documentSymbol: string = '';
  showDialog: boolean = false;
  currentDocument: DocumentViewData | null = null;

  openPdfViewer() {
    if (this.documentId) {
      this.currentDocument = {
        id: this.documentId,
        title: this.documentTitle || `Document ${this.documentId}`,
        documentSymbol: this.documentSymbol || `DOC-${this.documentId}`
      };
      this.showDialog = true;
    }
  }
}
