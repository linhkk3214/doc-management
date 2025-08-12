# Multi-stage Dockerfile for Angular Frontend + .NET Backend with Nginx Reverse Proxy

# Stage 1: Build Angular Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files for frontend
COPY FE/super-app/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY FE/super-app/ ./

# Build Angular application
RUN npx nx build admin --configuration=docker --skip-nx-cache

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /src

# Copy solution file
COPY BE/API.sln ./

# Copy project files for dependency restoration
COPY BE/Admin/API/*.csproj ./Admin/API/
COPY BE/Admin/Application/*.csproj ./Admin/Application/
COPY BE/Admin/Domain/*.csproj ./Admin/Domain/
COPY BE/Admin/Infrastructure/*.csproj ./Admin/Infrastructure/
COPY BE/Auth.DataAccess/*.csproj ./Auth.DataAccess/
COPY BE/BffAuth/*.csproj ./BffAuth/
COPY BE/IdentityServer4/*.csproj ./IdentityServer4/
COPY BE/Shared/*.csproj ./Shared/

# Restore dependencies
RUN dotnet restore

# Copy all backend source code
COPY BE/ ./

# Build and publish the main API project
WORKDIR /src/Admin/API
RUN dotnet publish -c Release -o /app/backend/api

# Build and publish the Auth project
WORKDIR /src/IdentityServer4
RUN dotnet publish -c Release -o /app/backend/auth

# Build and publish the BffAuth project
WORKDIR /src/BffAuth
RUN dotnet publish -c Release -o /app/backend/bff

# Stage 3: Final Runtime Image with Nginx and .NET
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Create application directories
RUN mkdir -p /app/backend/api /app/backend/auth /app/backend/bff /app/frontend /var/log/supervisor

# Copy built applications
COPY --from=frontend-build /app/frontend/dist/apps/admin /app/frontend
COPY --from=backend-build /app/backend/api /app/backend/api
COPY --from=backend-build /app/backend/auth /app/backend/auth
COPY --from=backend-build /app/backend/bff /app/backend/bff

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports
EXPOSE 80 443

# Use supervisor to start all services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
