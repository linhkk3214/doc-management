# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY super-app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY super-app/ ./

# Build the application
RUN npx nx build admin --configuration=docker --skip-nx-cache

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist/apps/admin /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]