# 🚀 QUICK START - Khởi Tạo Database

## 📋 Các Câu Lệnh Nhanh

### 1. Cách Nhanh Nhất (Tự động)
```bash
# Chạy ứng dụng - database sẽ tự động được tạo trong môi trường Development
dotnet run --project BE/Admin/API
```

### 2. Sử dụng Script PowerShell
```powershell
# SQL Server
.\BE\Admin\Scripts\InitializeDatabase.ps1

# PostgreSQL  
.\BE\Admin\Scripts\InitializeDatabase.ps1 -DatabaseProvider PostgreSQL

# Tạo lại database hoàn toàn
.\BE\Admin\Scripts\InitializeDatabase.ps1 -RecreateDatabase
```

### 3. Sử dụng Entity Framework CLI

#### Cài đặt EF Tools:
```bash
dotnet tool install --global dotnet-ef
```

#### Tạo và áp dụng Migration:
```bash
# Tạo migration
dotnet ef migrations add InitialCreate --project BE/Admin/Infrastructure --startup-project BE/Admin/API --context AdminDbContext

# Áp dụng migration
dotnet ef database update --project BE/Admin/Infrastructure --startup-project BE/Admin/API --context AdminDbContext
```

### 4. Tạo SQL Script
```bash
dotnet ef migrations script --project BE/Admin/Infrastructure --startup-project BE/Admin/API --context AdminDbContext --output database-script.sql
```

## ⚙️ Cấu Hình Database

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

## 📊 Cấu Trúc Database

### Bảng được tạo:
- **City**: Thông tin thành phố (Id, Name, Code, Type, Created, Updated, Deleted)
- **District**: Thông tin quận/huyện (Id, Name, Code, IdCity, Population, HappyRate, Created, Updated, Deleted)

### Dữ liệu mẫu:
- **3 Cities**: Hà Nội, Hồ Chí Minh, Đà Nẵng
- **5 Districts**: Ba Đình, Hoàn Kiếm, Quận 1, Quận 3, Hải Châu

## 🐳 Docker PostgreSQL (Tùy chọn)
```bash
docker run --name postgres-admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=Admin -p 5432:5432 -d postgres:15
```

## 🛠️ Các Lệnh Hữu Ích

### Xem migrations:
```bash
dotnet ef migrations list --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```

### Xóa database:
```bash
dotnet ef database drop --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```

### Xóa migration cuối:
```bash
dotnet ef migrations remove --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```

## ❗ Lưu Ý Quan Trọng

1. **Development**: Database tự động khởi tạo khi chạy ứng dụng
2. **Production**: Sử dụng migrations thay vì EnsureCreated()
3. **Backup**: Luôn backup trước khi chạy migrations
4. **Security**: Không commit password vào source control

## 🔧 Troubleshooting

### Lỗi "dotnet ef not found":
```bash
dotnet tool install --global dotnet-ef
```

### Lỗi kết nối:
- Kiểm tra connection string
- Đảm bảo database server đang chạy
- Kiểm tra firewall/port

### Lỗi migration:
```bash
# Reset migrations
dotnet ef database drop --force --project BE/Admin/Infrastructure --startup-project BE/Admin/API
dotnet ef migrations remove --project BE/Admin/Infrastructure --startup-project BE/Admin/API
dotnet ef migrations add InitialCreate --project BE/Admin/Infrastructure --startup-project BE/Admin/API
dotnet ef database update --project BE/Admin/Infrastructure --startup-project BE/Admin/API
```
