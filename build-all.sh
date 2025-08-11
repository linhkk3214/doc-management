#!/bin/bash

# Build and push all Docker images

set -e

# Default tag
TAG=${1:-latest}

echo "Building and pushing Docker images with tag: $TAG"

# Build and push Frontend
echo "\n=== Building Frontend ==="
cd FE
./build-docker.sh $TAG
cd ..

# Build and push Backend
echo "\n=== Building Backend ==="
cd BE
./build-docker.sh $TAG
cd ..

echo "\n=== All images built and pushed successfully! ==="
echo "Frontend: dockerhub.ospgroup.vn/osp-public/sohoa-app-fe:$TAG"
echo "Backend: dockerhub.ospgroup.vn/osp-public/sohoa-app-be:$TAG"
echo "\nTo run the application:"
echo "docker-compose up -d"