# Hướng Dẫn Khởi Tạo Database

## 🚀 Các Cách Khởi Tạo Database

### 1. Sử dụng Script Tự Động (Khuyến nghị)

#### PowerShell (Windows):
```powershell
# Khởi tạo SQL Server database
.\BE\Admin\Scripts\InitializeDatabase.ps1 -DatabaseProvider SqlServer

# Khởi tạo PostgreSQL database  
.\BE\Admin\Scripts\InitializeDatabase.ps1 -DatabaseProvider PostgreSQL

# Tạo lại database hoàn toàn
.\BE\Admin\Scripts\InitializeDatabase.ps1 -RecreateDatabase
```

#### Batch File (Windows):
```cmd
BE\Admin\Scripts\InitializeDatabase.bat
```

### 2. Sử dụng Entity Framework CLI

#### Cài đặt EF Tools (nếu chưa có):
```bash
dotnet tool install --global dotnet-ef
```

#### Tạo Migration:
```bash
dotnet ef migrations add InitialCreate --project BE/Admin/Infrastructure --startup-project BE/Admin/API --context AdminDbContext
```

#### Áp dụng Migration:
```bash
dotnet ef database update --project BE/Admin/Infrastructure --startup-project BE/Admin/API --context AdminDbContext
```

#### Tạo SQL Script:
```bash
dotnet ef migrations script --project BE/Admin/Infrastructure --startup-project BE/Admin/API --context AdminDbContext --output database-script.sql
```

### 3. Sử dụng Code (Tự động khi chạy ứng dụng)

Database sẽ được tự động khởi tạo khi chạy ứng dụng trong môi trường Development:

```bash
dotnet run --project BE/Admin/API
```

## 📋 Cấu Trúc Database Được Tạo

### Bảng City
```sql
CREATE TABLE City (
    Id int NOT NULL,
    Name nvarchar(255) NULL,
    Code nvarchar(125) NULL,
    Type int NOT NULL DEFAULT 2,
    Created datetime2 NOT NULL DEFAULT (getdate()),
    Updated datetime2 NULL,
    Deleted bit NOT NULL DEFAULT 1,
    CONSTRAINT PK_City PRIMARY KEY (Id)
);
```

### Bảng District
```sql
CREATE TABLE District (
    Id int NOT NULL,
    Name nvarchar(255) NULL,
    Code nvarchar(125) NULL,
    IdCity int NOT NULL,
    Population decimal(18,0) NULL,
    HappyRate decimal(18,2) NULL,
    Created datetime2 NOT NULL DEFAULT (getdate()),
    Updated datetime2 NULL,
    Deleted bit NOT NULL DEFAULT 1,
    CONSTRAINT PK_District PRIMARY KEY (Id),
    CONSTRAINT FK_District_City FOREIGN KEY (IdCity) REFERENCES City (Id)
);
```

## 🔧 Cấu Hình Database

### SQL Server (Mặc định)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Admin;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "DatabaseProvider": "SqlServer"
}
```

### PostgreSQL
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=Admin;Username=postgres;Password=your_password;Port=5432;"
  },
  "DatabaseProvider": "PostgreSQL"
}
```

## 📊 Dữ Liệu Mẫu

Khi chạy ứng dụng trong môi trường Development, hệ thống sẽ tự động thêm dữ liệu mẫu:

### Cities:
- Hà Nội (HN)
- Hồ Chí Minh (HCM)  
- Đà Nẵng (DN)

### Districts:
- Ba Đình (Hà Nội)
- Hoàn Kiếm (Hà Nội)
- Quận 1 (Hồ Chí Minh)

## 🛠️ Các Lệnh Hữu Ích

### Xem danh sách migrations:
```bash
dotnet ef migrations list --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```

### Xóa migration cuối cùng:
```bash
dotnet ef migrations remove --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```

### Xóa database:
```bash
dotnet ef database drop --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```

### Tạo migration từ database có sẵn:
```bash
dotnet ef dbcontext scaffold "connection_string" Microsoft.EntityFrameworkCore.SqlServer --project BE/Admin/Infrastructure --context AdminDbContext --force
```

## 🐳 Docker Setup (PostgreSQL)

Nếu bạn muốn sử dụng PostgreSQL với Docker:

```bash
docker run --name postgres-admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=Admin -p 5432:5432 -d postgres:15
```

Sau đó cập nhật connection string:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=Admin;Username=postgres;Password=admin123;Port=5432;"
  },
  "DatabaseProvider": "PostgreSQL"
}
```

## ❗ Troubleshooting

### Lỗi "dotnet ef command not found":
```bash
dotnet tool install --global dotnet-ef
```

### Lỗi kết nối database:
- Kiểm tra connection string
- Đảm bảo database server đang chạy
- Kiểm tra firewall và port

### Lỗi migration:
```bash
# Xóa tất cả migrations và tạo lại
dotnet ef migrations remove --project BE/Admin/Infrastructure --startup-project BE/Admin/API
dotnet ef migrations add InitialCreate --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```

## 📝 Lưu Ý

1. **Development**: Database sẽ tự động khởi tạo khi chạy ứng dụng
2. **Production**: Nên sử dụng migrations thay vì EnsureCreated()
3. **Backup**: Luôn backup database trước khi chạy migrations
4. **Security**: Không commit connection string có password vào source control
