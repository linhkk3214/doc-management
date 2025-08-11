# Docker Setup cho Doc Management Project

## Cấu trúc Files

### Frontend (FE/)
- `Dockerfile`: Build Angular application với Nginx
- `nginx.conf`: Cấu hình Nginx cho SPA
- `build-docker.sh`: Script build và push image FE

### Backend (BE/)
- `Dockerfile`: Build .NET 9.0 application
- `build-docker.sh`: Script build và push image BE

### Root
- `docker-compose.yml`: Orchestration cho tất cả services
- `build-all.sh`: Script build và push tất cả images

## Cách sử dụng

### 1. Build và Push Images

#### Build tất cả images:
```bash
./build-all.sh [tag]
```

#### Build riêng lẻ:
```bash
# Frontend
cd FE
./build-docker.sh [tag]

# Backend
cd BE
./build-docker.sh [tag]
```

### 2. Chạy Application

```bash
# Chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

### 3. Truy cập Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

## Docker Images

- **Frontend**: `dockerhub.ospgroup.vn/osp-public/sohoa-app-fe:latest`
- **Backend**: `dockerhub.ospgroup.vn/osp-public/sohoa-app-be:latest`

## Environment Variables

### Backend
- `ASPNETCORE_ENVIRONMENT`: Production
- `ConnectionStrings__DefaultConnection`: PostgreSQL connection string

### Frontend
- `API_URL`: Backend API URL

## Networks

Tất cả services chạy trong network `doc-management-network` để có thể giao tiếp với nhau.

## Volumes

- `postgres_data`: Persistent storage cho PostgreSQL
- `./init-scripts`: SQL scripts để khởi tạo database

## Troubleshooting

### Build Issues
1. Đảm bảo Docker daemon đang chạy
2. Kiểm tra quyền truy cập Docker registry
3. Xem logs chi tiết: `docker-compose logs [service_name]`

### Network Issues
1. Kiểm tra ports không bị conflict
2. Restart Docker daemon nếu cần
3. Xóa và tạo lại containers: `docker-compose down && docker-compose up -d`