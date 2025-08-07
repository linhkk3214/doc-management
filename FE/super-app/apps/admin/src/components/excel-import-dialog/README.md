# Excel Import Dialog - PrimeNG Migration

This document explains the changes made to convert the `ExcelImportDialogComponent` from a custom dialog to use PrimeNG's `p-dialog`.

## Changes Made

### 1. Import Changes
- Added PrimeNG modules: `DialogModule`, `ButtonModule`, `ProgressBarModule`
- Kept existing imports: `CommonModule`, `FormsModule`

### 2. Template Changes
- Replaced custom `<div class="excel-import-dialog">` with `<p-dialog>`
- Replaced custom buttons with `<p-button>` components
- Replaced custom progress bar with `<p-progressBar>`
- Added `ng-template pTemplate="footer"` for dialog footer buttons
- Added dialog configuration properties:
  - `[(visible)]="visible"`: Two-way binding for dialog visibility
  - `[modal]="true"`: Makes dialog modal
  - `header="Import Excel"`: Dialog title
  - `[style]="{ width: '600px' }"`: Fixed width
  - `[closable]="!importing()"`: Disable close button during import
  - `(onHide)="onDialogHide()"`: Handle dialog hide event
  - `[draggable]="false"`: Disable dragging
  - `[resizable]="false"`: Disable resizing

### 3. Component Class Changes
- Added `visible = signal(false)` to control dialog visibility
- Added `show()` method to open the dialog
- Added `hide()` method to close the dialog
- Added `onDialogHide()` method to handle PrimeNG's hide event
- Modified `closeDialog()` to use `hide()` method

### 4. Style Changes
- Removed custom dialog styling (handled by PrimeNG)
- Simplified styles to focus on content styling
- Added PrimeNG-specific deep selectors for customization:
  - `:host ::ng-deep .p-dialog-footer` for footer styling
  - `:host ::ng-deep .p-progressbar` for progress bar styling

## How to Use

### 1. In Parent Component Template
```html
<p-button 
  label="Import Excel" 
  icon="pi pi-upload" 
  (click)="openImportDialog()"
></p-button>

<app-excel-import-dialog 
  #importDialog
  (onClose)="handleDialogClose()"
  (onImportComplete)="handleImportComplete($event)"
></app-excel-import-dialog>
```

### 2. In Parent Component Class
```typescript
import { Component, ViewChild } from '@angular/core';
import { ExcelImportDialogComponent } from './excel-import-dialog.component';
import { ExcelImportResult } from '../../services/excel-import.service';

export class ParentComponent {
  @ViewChild('importDialog') importDialog!: ExcelImportDialogComponent;

  openImportDialog() {
    this.importDialog.show();
  }

  handleDialogClose() {
    console.log('Dialog closed');
  }

  handleImportComplete(result: ExcelImportResult) {
    console.log('Import completed:', result);
    if (result.success) {
      // Handle successful import
      // Maybe refresh data, show notification, etc.
    }
  }
}
```

### 3. Required Imports in Parent Component
Make sure to import required modules:
```typescript
import { ButtonModule } from 'primeng/button';
import { ExcelImportDialogComponent } from './excel-import-dialog.component';

@Component({
  // ...
  imports: [
    // ... other imports
    ButtonModule,
    ExcelImportDialogComponent
  ]
})
```

## Benefits of PrimeNG Dialog

1. **Consistent UI**: Matches the rest of the PrimeNG theme
2. **Accessibility**: Better keyboard navigation and screen reader support
3. **Mobile Responsive**: Handles mobile screens better
4. **Built-in Features**: Modal backdrop, ESC key handling, focus management
5. **Themeable**: Automatically adapts to PrimeNG themes
6. **Less Code**: No need to maintain custom dialog styles and behaviors

## File Upload Styling

The file input still uses custom styling since PrimeNG doesn't have a built-in file upload component that matches this specific use case. The custom styling is preserved for the file input section.

## Progress Bar

Now uses PrimeNG's `p-progressBar` component which provides:
- Consistent styling with the theme
- Built-in animation
- Better accessibility
- Customizable through PrimeNG theme variables

## Buttons

All buttons now use PrimeNG `p-button` component which provides:
- Consistent styling
- Built-in loading states
- Icon support
- Theme integration
- Accessibility features
