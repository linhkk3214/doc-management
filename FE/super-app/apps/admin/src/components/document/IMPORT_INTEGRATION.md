# Document Component - Excel Import Integration

## Changes Made

Đã chuyển logic Excel import từ `ExcelImportDialogComponent` trực tiếp vào `DocumentComponent` để đơn giản hóa workflow.

### Các thay đổi chính:

1. **Loại bỏ Dialog Component**: 
   - Xóa `ExcelImportDialogComponent` khỏi imports
   - Xóa các properties liên quan đến dialog (`showImportDialog`)

2. **Thêm Import Logic trực tiếp**:
   - `triggerFileInput()`: Tạo file input ẩn và trigger click
   - `onFileSelected()`: Xử lý khi user chọn file
   - `startImport()`: Logic import file Excel
   - `downloadTemplate()`: Tải file template Excel

3. **Thêm Progress Tracking**:
   - Signals: `importing`, `importProgress`, `importMessage`
   - Progress bar hiển thị trong toolbar khi đang import

4. **Toast Notifications**:
   - Sử dụng PrimeNG Toast để hiển thị thông báo thành công/lỗi
   - Thêm `MessageService` vào providers

5. **HTML Template**:
   - Thêm progress bar trong toolbar
   - Thêm button "Tải template"
   - Thêm `<p-toast></p-toast>` cho notifications

### Workflow mới:

1. **Import**: User click button "Import Excel" → File picker mở → Chọn file → Import tự động bắt đầu
2. **Progress**: Progress bar hiển thị trong toolbar với messages
3. **Results**: Toast notification hiển thị kết quả
4. **Auto Reload**: Data tự động reload sau khi import thành công

### Services Required:

- `ExcelImportService`: Xử lý logic import
- `MessageService`: Hiển thị toast notifications

### PrimeNG Modules:

- `ProgressBarModule`: Progress bar
- `ToastModule`: Toast notifications
- `ButtonModule`: Buttons

## Usage:

Component này sẽ tự động handle import workflow khi user click vào button Import trong ae-crud component.

```html
<ae-crud (import)="triggerFileInput()">
  <!-- Custom toolbar với progress bar -->
</ae-crud>
<p-toast></p-toast>
```

## Benefits:

- **Đơn giản hóa UX**: Không cần mở dialog, chỉ cần chọn file và import
- **Real-time Progress**: Hiển thị progress ngay trong toolbar
- **Better Integration**: Tích hợp trực tiếp với CRUD component
- **Auto Reload**: Data tự động refresh sau import
