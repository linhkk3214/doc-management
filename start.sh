#!/bin/sh

# Startup script for the combined Angular + .NET application

echo "Starting combined Angular + .NET application..."

# Create log directories
mkdir -p /var/log/supervisor
mkdir -p /var/log/nginx

# Set proper permissions
chown -R nginx:nginx /app/frontend
chmod -R 755 /app/frontend

# Ensure .NET applications have proper permissions
chmod +x /app/backend/api/API.dll
chmod +x /app/backend/auth/Auth.dll
chmod +x /app/backend/bff/BffAuth.dll

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
else
    echo "Nginx configuration is invalid"
    exit 1
fi

# Start supervisor which will manage all processes
echo "Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
