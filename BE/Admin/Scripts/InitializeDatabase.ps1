# Script khởi tạo database cho Admin Service
param(
    [string]$DatabaseProvider = "SqlServer",  # SqlServer hoặc PostgreSQL
    [switch]$RecreateDatabase = $false,       # Có tạo lại database không
    [switch]$SeedData = $true                 # Có seed dữ liệu mẫu không
)

Write-Host "=== KHỞI TẠO DATABASE CHO ADMIN SERVICE ===" -ForegroundColor Green
Write-Host "Database Provider: $DatabaseProvider" -ForegroundColor Yellow

# Đường dẫn đến các project
$InfrastructureProject = "BE/Admin/Infrastructure/Infrastructure.csproj"
$APIProject = "BE/Admin/API/API.csproj"

try {
    # Kiểm tra xem dotnet ef tools đã được cài đặt chưa
    Write-Host "Kiểm tra dotnet ef tools..." -ForegroundColor Blue
    $efVersion = dotnet ef --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Cài đặt dotnet ef tools..." -ForegroundColor Yellow
        dotnet tool install --global dotnet-ef
    } else {
        Write-Host "dotnet ef tools đã được cài đặt: $efVersion" -ForegroundColor Green
    }

    # Tạo lại database nếu được yêu cầu
    if ($RecreateDatabase) {
        Write-Host "Xóa database hiện tại..." -ForegroundColor Red
        dotnet ef database drop --force --project $InfrastructureProject --startup-project $APIProject --context AdminDbContext
    }

    # Tạo migration đầu tiên nếu chưa có
    $migrationsFolder = "BE/Admin/Infrastructure/Migrations"
    if (!(Test-Path $migrationsFolder) -or (Get-ChildItem $migrationsFolder).Count -eq 0) {
        Write-Host "Tạo migration đầu tiên..." -ForegroundColor Blue
        dotnet ef migrations add InitialCreate --project $InfrastructureProject --startup-project $APIProject --context AdminDbContext
    }

    # Áp dụng migrations
    Write-Host "Áp dụng migrations..." -ForegroundColor Blue
    dotnet ef database update --project $InfrastructureProject --startup-project $APIProject --context AdminDbContext

    # Tạo SQL script (tùy chọn)
    Write-Host "Tạo SQL script..." -ForegroundColor Blue
    $scriptPath = "BE/Admin/Scripts/database-script-$DatabaseProvider.sql"
    dotnet ef migrations script --project $InfrastructureProject --startup-project $APIProject --context AdminDbContext --output $scriptPath

    Write-Host "=== HOÀN THÀNH KHỞI TẠO DATABASE ===" -ForegroundColor Green
    Write-Host "SQL Script đã được tạo tại: $scriptPath" -ForegroundColor Yellow
    
    if ($SeedData) {
        Write-Host "Lưu ý: Dữ liệu mẫu sẽ được seed khi chạy ứng dụng trong môi trường Development" -ForegroundColor Cyan
    }

} catch {
    Write-Host "LỖI: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== HƯỚNG DẪN SỬ DỤNG ===" -ForegroundColor Magenta
Write-Host "1. Để khởi tạo database SQL Server:" -ForegroundColor White
Write-Host "   .\InitializeDatabase.ps1 -DatabaseProvider SqlServer" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Để khởi tạo database PostgreSQL:" -ForegroundColor White
Write-Host "   .\InitializeDatabase.ps1 -DatabaseProvider PostgreSQL" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Để tạo lại database hoàn toàn:" -ForegroundColor White
Write-Host "   .\InitializeDatabase.ps1 -RecreateDatabase" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Chạy ứng dụng để seed dữ liệu mẫu:" -ForegroundColor White
Write-Host "   dotnet run --project BE/Admin/API" -ForegroundColor Gray
