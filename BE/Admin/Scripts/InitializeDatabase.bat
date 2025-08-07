@echo off
echo === KHOI TAO DATABASE CHO ADMIN SERVICE ===

set INFRASTRUCTURE_PROJECT=BE/Admin/Infrastructure/Infrastructure.csproj
set API_PROJECT=BE/Admin/API/API.csproj

echo Kiem tra dotnet ef tools...
dotnet ef --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Cai dat dotnet ef tools...
    dotnet tool install --global dotnet-ef
)

echo Tao migration dau tien...
dotnet ef migrations add InitialCreate --project %INFRASTRUCTURE_PROJECT% --startup-project %API_PROJECT% --context AdminDbContext

echo Ap dung migrations...
dotnet ef database update --project %INFRASTRUCTURE_PROJECT% --startup-project %API_PROJECT% --context AdminDbContext

echo Tao SQL script...
dotnet ef migrations script --project %INFRASTRUCTURE_PROJECT% --startup-project %API_PROJECT% --context AdminDbContext --output BE/Admin/Scripts/database-script.sql

echo === HOAN THANH KHOI TAO DATABASE ===
echo SQL Script da duoc tao tai: BE/Admin/Scripts/database-script.sql
echo Chay ung dung de seed du lieu mau: dotnet run --project BE/Admin/API

pause
