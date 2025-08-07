# PostgreSQL Configuration for Admin Service

This document explains how to configure the Admin Service to use PostgreSQL instead of SQL Server.

## Prerequisites

1. PostgreSQL server installed and running
2. A database created for the Admin service
3. A user with appropriate permissions

## Configuration

### 1. Update appsettings.json

To use PostgreSQL, update your `appsettings.json` or `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=Admin;Username=postgres;Password=your_password;Port=5432;"
  },
  "DatabaseProvider": "PostgreSQL"
}
```

### 2. Connection String Parameters

- **Host**: PostgreSQL server hostname (default: localhost)
- **Database**: Database name
- **Username**: PostgreSQL username
- **Password**: PostgreSQL password
- **Port**: PostgreSQL port (default: 5432)

### 3. Database Provider Options

The `DatabaseProvider` setting supports the following values:
- `"PostgreSQL"` or `"postgres"` - Use PostgreSQL
- `"SqlServer"` - Use SQL Server (default)

## Database Differences

The DbContext automatically handles differences between SQL Server and PostgreSQL:

### Timestamp Functions
- **SQL Server**: `GETDATE()`
- **PostgreSQL**: `NOW()`

### Decimal Types
- **SQL Server**: `decimal(18, 2)`
- **PostgreSQL**: `numeric(18, 2)`

## Migration Commands

### Create Initial Migration for PostgreSQL
```bash
dotnet ef migrations add InitialCreate --project Infrastructure --startup-project API --context AdminDbContext
```

### Update Database
```bash
dotnet ef database update --project Infrastructure --startup-project API --context AdminDbContext
```

### Generate Migration for Existing SQL Server Schema
If you have an existing SQL Server database and want to migrate to PostgreSQL:

1. First, scaffold the existing database structure:
```bash
dotnet ef dbcontext scaffold "Host=localhost;Database=Admin;Username=postgres;Password=your_password" Npgsql.EntityFrameworkCore.PostgreSQL --project Infrastructure --context AdminDbContext --force
```

2. Then create and apply migrations as needed.

## Docker Setup (Optional)

You can use Docker to run PostgreSQL locally:

```bash
docker run --name postgres-admin -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=Admin -p 5432:5432 -d postgres:15
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure PostgreSQL is running and accessible
2. **Authentication failed**: Check username/password in connection string
3. **Database does not exist**: Create the database manually or use migrations
4. **Port conflicts**: Ensure port 5432 is available or use a different port

### Logging

Enable detailed logging by adding to appsettings.json:

```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

This will show SQL commands being executed, which helps with debugging.
