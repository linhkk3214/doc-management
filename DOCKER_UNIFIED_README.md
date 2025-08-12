# Unified Docker Container: Angular Frontend + .NET Backend

This Dockerfile creates a single Docker container that runs both the Angular frontend application and multiple .NET backend services with nginx as a reverse proxy.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Container                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐                                           │
│  │   Nginx     │ ← Entry Point (Port 80/443)               │
│  │ Reverse     │                                           │
│  │   Proxy     │                                           │
│  └─────────────┘                                           │
│         │                                                   │
│         ├─── / (root) ──→ Angular Frontend (Static Files)  │
│         │                                                   │
│         ├─── /api/ ────→ .NET API Backend (Port 5000)      │
│         │                                                   │
│         ├─── /api/auth/ → .NET Auth Backend (Port 5001)    │
│         │                                                   │
│         └─── /api/bff/ ─→ .NET BFF Backend (Port 5002)     │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Angular App │ │ .NET API    │ │ .NET Auth   │          │
│  │ (Static)    │ │ Service     │ │ Service     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                             │
│  ┌─────────────┐                                           │
│  │ .NET BFF    │                                           │
│  │ Service     │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 🔄 Dynamic Backend Routing
- **Path-based routing**: Routes API requests to different backend services based on URL patterns
- **Domain-aware**: Nginx configuration includes headers for domain-based routing decisions
- **No hardcoded endpoints**: Backend routing adapts dynamically to the request context

### 🏗️ Multi-stage Build
- **Stage 1**: Build Angular application using Node.js
- **Stage 2**: Build .NET applications using .NET SDK
- **Stage 3**: Combine everything in a lightweight runtime image with nginx

### 🔧 Process Management
- **Supervisor**: Manages multiple processes (nginx + 3 .NET services)
- **Auto-restart**: Automatic restart of failed services
- **Logging**: Centralized logging for all services

## Routing Configuration

| Request Path | Destination | Backend Service |
|-------------|-------------|-----------------|
| `/` | Angular Frontend | Static files served by nginx |
| `/api/auth/*` | .NET Auth Service | Port 5001 |
| `/api/bff/*` | .NET BFF Service | Port 5002 |
| `/api/*` | .NET API Service | Port 5000 |

## Build and Run

### Build the Docker Image
```bash
docker build -t unified-app .
```

### Run the Container
```bash
docker run -p 80:80 -p 443:443 unified-app
```

### Run with Environment Variables
```bash
docker run -p 80:80 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="your-connection-string" \
  unified-app
```

## Configuration Files

### 📄 Dockerfile
- Multi-stage build combining Angular and .NET applications
- Installs .NET runtime in Alpine Linux
- Sets up supervisor for process management

### 📄 nginx.conf
- Reverse proxy configuration
- Dynamic backend routing based on URL patterns
- Security headers and performance optimizations
- Rate limiting for API endpoints

### 📄 supervisord.conf
- Process management configuration
- Defines all services (nginx + 3 .NET backends)
- Logging and restart policies

### 📄 start.sh
- Initialization script
- Permission setup
- Configuration validation

## Environment Variables

The following environment variables can be used to configure the .NET applications:

```bash
# General ASP.NET Core settings
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:5000

# Database connections
ConnectionStrings__DefaultConnection="your-connection-string"
ConnectionStrings__AuthConnection="your-auth-connection-string"

# Authentication settings
Auth__Authority="https://your-auth-server"
Auth__ClientId="your-client-id"
Auth__ClientSecret="your-client-secret"
```

## Monitoring and Health Checks

### Health Check Endpoints
- **Application Health**: `GET /health`
- **Nginx Status**: `GET /nginx_status` (localhost only)

### Logs
All service logs are available in `/var/log/supervisor/`:
- `nginx.out.log` / `nginx.err.log`
- `dotnet-api.out.log` / `dotnet-api.err.log`
- `dotnet-auth.out.log` / `dotnet-auth.err.log`
- `dotnet-bff.out.log` / `dotnet-bff.err.log`

### View Logs
```bash
# View all logs
docker exec -it <container-id> tail -f /var/log/supervisor/*.log

# View specific service logs
docker exec -it <container-id> tail -f /var/log/supervisor/dotnet-api.out.log
```

## Security Features

- **Rate Limiting**: API endpoints are rate-limited
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **SSL Ready**: HTTPS configuration template included
- **Process Isolation**: Each service runs in its own process space

## Performance Optimizations

- **Gzip Compression**: Enabled for text-based content
- **Static Asset Caching**: Long-term caching for frontend assets
- **Connection Keepalive**: Persistent connections to backend services
- **Buffer Optimization**: Optimized proxy buffering settings

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 80 and 443 are available
2. **Memory Issues**: .NET applications may need more memory in production
3. **Database Connections**: Verify connection strings are correct

### Debug Commands
```bash
# Check running processes
docker exec -it <container-id> supervisorctl status

# Restart a specific service
docker exec -it <container-id> supervisorctl restart dotnet-api

# Check nginx configuration
docker exec -it <container-id> nginx -t
```

## Production Considerations

1. **SSL Certificates**: Add proper SSL certificates for HTTPS
2. **Environment Variables**: Use secrets management for sensitive data
3. **Resource Limits**: Set appropriate CPU and memory limits
4. **Monitoring**: Implement proper monitoring and alerting
5. **Backup**: Ensure database and file backups are configured
