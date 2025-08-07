# Document Management System

Hệ thống quản lý tài liệu được xây dựng với .NET Core Backend và Angular Frontend.

## Yêu cầu hệ thống

### Backend (.NET Core)
- .NET 8.0 SDK
- Entity Framework Core Tools
- PostgreSQL (thông qua Docker)

### Frontend (Angular)
- Node.js 18+
- npm hoặc yarn
- Angular CLI
- Nx CLI

## Cài đặt và chạy

### 1. Khởi động PostgreSQL Database

```bash
# Khởi động PostgreSQL container
docker-compose up -d postgres

# Kiểm tra trạng thái
docker-compose ps
```

### 2. Cài đặt Backend Dependencies

```bash
cd BE

# Restore packages
dotnet restore

# Cài đặt EF Core Tools (nếu chưa có)
dotnet tool install --global dotnet-ef

# Tạo và apply migrations
cd Admin/API
dotnet ef migrations add InitialCreate --project ../Infrastructure --context AdminDbContext
dotnet ef database update --project ../Infrastructure --context AdminDbContext
```

### 3. Chạy Backend Services

```bash
# Chạy Admin API (Terminal 1)
cd BE/Admin/API
dotnet run
# Admin API sẽ chạy tại: http://localhost:5001

# Chạy Identity Server (Terminal 2)
cd BE/IdentityServer4
dotnet run
# Identity Server sẽ chạy tại: https://localhost:6996

# Chạy BFF Auth (Terminal 3)
cd BE/BffAuth
dotnet run
# BFF Auth sẽ chạy tại: http://localhost:5147
```

### 4. Cài đặt và chạy Frontend

```bash
cd FE/super-app

# Cài đặt dependencies
npm install

# Cài đặt Nx CLI globally (nếu chưa có)
npm install -g @nx/cli

# Chạy admin app
nx serve admin
# Frontend sẽ chạy tại: http://localhost:4200
```

## Thông tin Port

| Service | Port | URL | Trạng thái |
|---------|------|-----|----------|
| PostgreSQL | 5432 | localhost:5432 | ✅ Đang chạy |
| Admin API | 5001 | http://localhost:5001 | ✅ Đang chạy |
| Identity Server | 6996 | https://localhost:6996 | ⏸️ Chưa khởi động |
| BFF Auth | 5147 | http://localhost:5147 | ⏸️ Chưa khởi động |
| Frontend (Admin) | 4200 | http://localhost:4200 | ✅ Đang chạy |

## Database Configuration

Connection string được cấu hình trong `BE/Admin/API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=DocManagement;Username=postgres;Password=123456a@A;Port=5432;"
  },
  "DatabaseProvider": "PostgreSQL"
}
```

## Troubleshooting

### Database Issues
- Đảm bảo PostgreSQL container đang chạy: `docker-compose ps`
- Kiểm tra logs: `docker-compose logs postgres`
- Reset database: `docker-compose down -v && docker-compose up -d postgres`

### Backend Issues
- Kiểm tra .NET SDK version: `dotnet --version`
- Restore packages: `dotnet restore`
- Clean và rebuild: `dotnet clean && dotnet build`

### Frontend Issues
- Kiểm tra Node.js version: `node --version`
- Clear cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

## Development

### Tạo Migration mới

```bash
cd BE/Admin/API
dotnet ef migrations add <MigrationName> --project ../Infrastructure --context AdminDbContext
dotnet ef database update --project ../Infrastructure --context AdminDbContext
```

### Build Production

```bash
# Backend
cd BE
dotnet publish -c Release

# Frontend
cd FE/super-app
nx build admin --prod
```

## Architecture

- **Backend**: Clean Architecture với .NET Core
- **Frontend**: Angular với Nx monorepo
- **Database**: PostgreSQL
- **Authentication**: IdentityServer4
- **API Gateway**: BFF (Backend for Frontend)