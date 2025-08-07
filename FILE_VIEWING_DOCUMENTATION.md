# File Viewing System Documentation

## Overview
This document describes the file viewing system implemented for the Document Management application, which allows users to view and download files associated with documents stored in the database.

## Backend Implementation

### API Endpoints

#### 1. View File Endpoint
```
GET /documents/{id}/file
```
- **Purpose**: Returns the file content for viewing in browser (iframe, new tab)
- **Parameters**: 
  - `id`: Document GUID
- **Response**: File content with appropriate MIME type
- **Usage**: For viewing files in PDF viewer, iframe, or new tab

#### 2. Download File Endpoint
```
GET /documents/{id}/download
```
- **Purpose**: Forces file download with proper filename
- **Parameters**: 
  - `id`: Document GUID
- **Response**: File content with `application/octet-stream` content type
- **Usage**: For downloading files to user's device

### Configuration

#### appsettings.json
```json
{
  "DocumentSettings": {
    "BaseDirectory": "C:\\DocumentFiles"
  }
}
```

#### File Path Resolution
- Files can have absolute paths or relative paths
- Relative paths are resolved against the configured `BaseDirectory`
- The system checks if files exist before serving them

#### Supported File Types
- **PDF**: `application/pdf`
- **Word Documents**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Excel Files**: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **PowerPoint**: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- **Images**: `image/jpeg`, `image/png`, `image/gif`
- **Text Files**: `text/plain`, `application/rtf`

## Frontend Implementation

### Components

#### 1. PdfViewerComponent
- **Purpose**: Displays files in an iframe with toolbar controls
- **Features**:
  - File viewing in embedded iframe
  - Toolbar with download, new tab, and refresh buttons
  - Loading and error states
  - Responsive design

**Usage:**
```html
<app-pdf-viewer 
  [document]="documentData"
  [height]="'600px'"
  [showToolbar]="true">
</app-pdf-viewer>
```

#### 2. FileViewDialogComponent
- **Purpose**: Modal dialog wrapper for the PDF viewer
- **Features**:
  - Full-screen modal experience
  - Backdrop click to close
  - ESC key support (if implemented)

**Usage:**
```html
<app-file-view-dialog
  [visible]="showDialog"
  [document]="selectedDocument"
  (visibleChange)="onDialogClose()">
</app-file-view-dialog>
```

#### 3. Updated DocumentService
- **Purpose**: Service methods for file operations
- **Methods**:
  - `viewFile(documentId)`: Get file blob for viewing
  - `getFileUrl(documentId)`: Get direct URL for iframe
  - `downloadFile(documentId)`: Download file as blob
  - `getDownloadUrl(documentId)`: Get direct download URL

### Integration in Document List

The document list now includes action buttons for each document:

1. **View Button** (👁️): Opens file in modal dialog
2. **Download Button** (⬇️): Downloads file directly

```typescript
// View file
viewFile(rowData: any) {
  this.selectedDocument = {
    id: rowData.id,
    title: rowData.title || rowData.summary,
    documentSymbol: rowData.documentSymbol
  };
  this.showFileViewDialog = true;
}

// Download file
downloadFile(rowData: any) {
  this.documentService.downloadFile(rowData.id).subscribe({
    next: (blob: Blob) => {
      // Handle file download
    }
  });
}
```

## Setup Instructions

### Backend Setup

1. **Configure File Directory**
   ```json
   // In appsettings.json
   {
     "DocumentSettings": {
       "BaseDirectory": "C:\\DocumentFiles"
     }
   }
   ```

2. **Create Directory**
   ```bash
   mkdir "C:\DocumentFiles"
   ```

3. **Add Test Files**
   - Place PDF, DOC, XLS files in the directory
   - Update document records with correct `OriginalPath` values

### Frontend Setup

1. **Import Components**
   ```typescript
   import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
   import { FileViewDialogComponent } from './components/file-view-dialog/file-view-dialog.component';
   ```

2. **Add to Component**
   ```typescript
   @Component({
     imports: [PdfViewerComponent, FileViewDialogComponent]
   })
   ```

### Testing

1. **Test API Endpoints**
   - Use the provided `FileViewApi.http` file
   - Replace `{id}` with actual document GUIDs from your database

2. **Test Frontend**
   - Navigate to the Documents page
   - Click "View" button to open file in modal
   - Click "Download" button to download file

## Error Handling

### Backend Errors
- **404**: Document not found or file doesn't exist
- **500**: Server error reading file or database

### Frontend Errors
- **Loading States**: Spinner while loading file
- **Error Display**: User-friendly error messages
- **Retry Functionality**: Button to retry loading failed files

## Security Considerations

1. **Path Validation**: Prevents directory traversal attacks
2. **File Existence Check**: Validates files exist before serving
3. **MIME Type Validation**: Proper content type headers
4. **Access Control**: Should integrate with authentication/authorization system

## Performance Considerations

1. **File Caching**: Consider implementing browser caching headers
2. **Large Files**: Implement chunked reading for large files
3. **Concurrent Access**: Handle multiple users accessing same files
4. **File Locks**: Prevent issues with files being modified while served

## Future Enhancements

1. **Thumbnail Generation**: Generate preview thumbnails
2. **File Conversion**: Convert documents to PDF for consistent viewing
3. **Annotation Support**: Add PDF annotation capabilities
4. **Version Control**: Support for document versions
5. **Watermarking**: Add watermarks for sensitive documents

## Troubleshooting

### Common Issues

1. **File Not Found**
   - Check `OriginalPath` in database
   - Verify file exists in configured directory
   - Check file permissions

2. **Access Denied**
   - Verify application has read permissions to file directory
   - Check Windows file permissions

3. **CORS Issues**
   - Ensure CORS is configured for file endpoints
   - Check browser security settings

### Debug Steps

1. **Check Configuration**
   ```csharp
   // In controller, log the full path
   _logger.LogInformation($"Attempting to access file: {filePath}");
   ```

2. **Verify Database Data**
   ```sql
   SELECT Id, Title, OriginalPath FROM Documents 
   WHERE OriginalPath IS NOT NULL AND OriginalPath <> '';
   ```

3. **Test Direct Access**
   ```bash
   curl -I http://localhost:5001/documents/{id}/file
   ```

## Migration Guide

### Existing Data
- Update existing documents to include `OriginalPath` values
- Organize existing files in the configured directory structure
- Run data migration scripts to populate file paths

### Database Updates
```sql
-- Example migration to update file paths
UPDATE Documents 
SET OriginalPath = CONCAT('folder/', DocumentSymbol, '.pdf')
WHERE OriginalPath IS NULL OR OriginalPath = '';
```
