#!/bin/bash

# Build and push Docker image for Frontend

set -e

# Default tag
TAG=${1:-latest}

# Docker registry and image name
REGISTRY="dockerhub.ospgroup.vn/osp-public"
IMAGE_NAME="sohoa-app-fe"
FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"

echo "Building Docker image: $FULL_IMAGE_NAME"

# Build Docker image
docker build -t $FULL_IMAGE_NAME .

echo "Docker image built successfully: $FULL_IMAGE_NAME"

# Push to registry
echo "Pushing image to registry..."
docker push $FULL_IMAGE_NAME

echo "Image pushed successfully: $FULL_IMAGE_NAME"