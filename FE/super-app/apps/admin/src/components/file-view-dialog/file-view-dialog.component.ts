import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerComponent, DocumentViewData } from '../pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-file-view-dialog',
  standalone: true,
  imports: [CommonModule, PdfViewerComponent],
  templateUrl: './file-view-dialog.component.html',
  styleUrls: ['./file-view-dialog.component.scss']
})
export class FileViewDialogComponent {
  @Input() visible: boolean = false;
  @Input() document: DocumentViewData | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onBackdropClick(event: Event) {
    // Close dialog when clicking on backdrop
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
