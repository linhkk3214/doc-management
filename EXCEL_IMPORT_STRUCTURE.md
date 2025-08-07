# Excel Import Structure for Document Management System

## File Format
- **File type**: Excel (.xlsx, .xls)
- **Max size**: 50MB
- **Data starts**: Row 2 (Row 1 contains headers)

## Column Mapping

| Excel Column | Field Name | Description | Data Type | Example |
|--------------|------------|-------------|-----------|---------|
| D | Tên phông | Department/Fund name | Text | "Phông Văn bản Hành chính" |
| E | Phông số | Department/Fund code | Text | "P001" |
| F | Nhiệm kỳ | Term period | Text | "Nhiệm kỳ 2020-2025" |
| G | Mục lục số | Catalog number | Number | 1 |
| H | Hộp số | Box number | Number | 1 |
| I | Hồ sơ số | Portfolio code | Text | "HS001" |
| J | Thời hạn bảo quản | Retention period | Text | "10 năm" or "vĩnh viễn" |
| K | Tiêu đề hồ sơ | Portfolio title | Text | "Hồ sơ văn bản hành chính 2024" |
| L | Ngày bắt đầu | Start date | Date | 2024-01-01 |
| M | Ngày kết thúc | End date | Date | 2024-12-31 |
| N | Tổng số văn bản | Total documents count | Number | 5 |
| O | Số tờ | Number of sheets (portfolio) | Number | 10 |
| P | Số trang | Number of pages (portfolio) | Number | 20 |
| R | Cơ quan ban hành | Issuing agency | Text | "Cơ quan XYZ" |
| S | Số văn bản | Document number | Number | 1 |
| T | Ký hiệu văn bản | Document symbol | Text | "01/2024/CV-ABC" |
| X | Ngày ký | Signed date | Date | 2024-01-15 |
| Y | Thể loại văn bản | Document type name | Text | "Công văn" |
| Z | Ký hiệu loại văn bản | Document type code | Text | "CV" |
| AA | Trích yếu nội dung | Document summary | Text | "Về việc..." |
| AB | Người ký | Signer | Text | "Nguyễn Văn A" |
| AC | Loại bản | Document format | Text | "Bản chính" or "Bản sao" |
| AD | Số trang văn bản | Document page count | Number | 2 |
| AG | Địa chỉ tài liệu gốc | Original document address | Text | "Kho lưu trữ A" |
| AI | Số thứ tự trong hồ sơ | Sequence in portfolio | Number | 1 |
| AQ | Path gốc | Original file path | Text | "/docs/file.pdf" |

## Business Rules

### Portfolio Grouping
Documents are grouped into portfolios based on:
- Tên phông (D)
- Nhiệm kỳ (F) 
- Tiêu đề hồ sơ (K)
- Mục lục số (G)
- Hộp số (H)
- Hồ sơ số (I)

### Document Types
- If **Path gốc** (AQ) ends with "BIA.pdf" → Document is a cover page
- Otherwise → Regular document

### Master Data Creation
The system automatically creates missing master data:
- **DM_Phong** (Departments): Based on columns D & E
- **DM_NhiemKy** (Terms): Based on column F  
- **DM_LoaiVanBan** (Document Types): Based on columns Y & Z

### Data Validation
- Required fields must not be empty
- Dates must be in valid format
- Numbers must be numeric
- File size under 50MB

## Import Process

1. **File Upload & Validation**
   - Check file format (.xlsx, .xls)
   - Validate file size (max 50MB)
   - Parse Excel content starting from row 2

2. **Master Data Processing**
   - Extract unique departments (Phông)
   - Extract unique terms (Nhiệm kỳ)
   - Extract unique document types (Loại văn bản)
   - Create missing master data entries

3. **Portfolio Creation**
   - Group rows by portfolio identifiers
   - Create portfolio records
   - Link to appropriate departments and terms

4. **Document Import**
   - Create document records for each row
   - Link to portfolios and document types
   - Set document properties based on Excel data

## Error Handling

- **Validation Errors**: Stop import, return error details
- **Missing Data**: Create warnings, continue with defaults
- **Duplicate Data**: Skip existing, create new only
- **System Errors**: Log error, return failure status

## Success Response

```json
{
  "success": true,
  "message": "Import thành công",
  "importedDocuments": 15,
  "importedPortfolios": 3,
  "importedDocumentTypes": 5,
  "importedDepartments": 2,
  "importedTerms": 1,
  "errors": [],
  "warnings": ["Some warning messages"]
}
```

## Sample Excel Row

| Col | Value | Description |
|-----|-------|-------------|
| D | "Phông Văn bản Hành chính" | Department name |
| E | "P001" | Department code |
| F | "Nhiệm kỳ 2020-2025" | Term |
| G | 1 | Catalog number |
| H | 1 | Box number |
| I | "HS001" | Portfolio code |
| J | "10 năm" | Retention period |
| K | "Hồ sơ văn bản năm 2024" | Portfolio title |
| L | 2024-01-01 | Start date |
| M | 2024-12-31 | End date |
| ... | ... | ... |
| R | "Sở ABC" | Issuing agency |
| S | 1 | Document number |
| T | "01/2024/CV" | Document symbol |
| X | 2024-01-15 | Signed date |
| Y | "Công văn" | Document type |
| Z | "CV" | Document type code |
| AA | "Về việc tổ chức họp" | Summary |
| AB | "Giám đốc" | Signer |
| AC | "Bản chính" | Format |
| AD | 2 | Page count |
| AG | "Kho A" | Original address |
| AI | 1 | Sequence in portfolio |
| AQ | "/docs/2024/cv01.pdf" | File path |
