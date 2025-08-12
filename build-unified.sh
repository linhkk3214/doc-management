#!/bin/bash

# Build script for unified Angular + .NET Docker container

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="unified-doc-management"
IMAGE_TAG="latest"
CONTAINER_NAME="unified-doc-management-app"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Clean up existing containers and images
cleanup() {
    print_header "Cleaning up existing containers and images"
    
    # Stop and remove existing container
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "Stopping existing container: ${CONTAINER_NAME}"
        docker stop ${CONTAINER_NAME} || true
        docker rm ${CONTAINER_NAME} || true
        print_success "Removed existing container"
    fi
    
    # Remove existing image
    if docker images --format 'table {{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_NAME}:${IMAGE_TAG}$"; then
        echo "Removing existing image: ${IMAGE_NAME}:${IMAGE_TAG}"
        docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true
        print_success "Removed existing image"
    fi
}

# Build the Docker image
build_image() {
    print_header "Building Docker image"
    
    echo "Building image: ${IMAGE_NAME}:${IMAGE_TAG}"
    
    # Build with progress output
    docker build \
        --tag ${IMAGE_NAME}:${IMAGE_TAG} \
        --progress=plain \
        --no-cache \
        .
    
    print_success "Docker image built successfully"
}

# Run the container
run_container() {
    print_header "Running Docker container"
    
    docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        -p 82:80 \
        -p 8443:443 \
        -e ASPNETCORE_ENVIRONMENT=Production \
        -e Logging__LogLevel__Default=Information \
        ${IMAGE_NAME}:${IMAGE_TAG}
    
    print_success "Container started successfully"
    echo "Container name: ${CONTAINER_NAME}"
    echo "Access the application at: http://localhost"
}

# Show container status
show_status() {
    print_header "Container Status"
    
    echo "Container status:"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "Container logs (last 20 lines):"
    docker logs --tail 20 ${CONTAINER_NAME} || true
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  build     Build the Docker image only"
    echo "  run       Run the container (assumes image exists)"
    echo "  rebuild   Clean, build, and run (default)"
    echo "  clean     Clean up containers and images"
    echo "  status    Show container status and logs"
    echo "  logs      Show container logs"
    echo "  stop      Stop the container"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                # Clean, build, and run"
    echo "  $0 build          # Build image only"
    echo "  $0 status         # Show status"
}

# Show logs
show_logs() {
    print_header "Container Logs"
    docker logs -f ${CONTAINER_NAME}
}

# Stop container
stop_container() {
    print_header "Stopping Container"
    docker stop ${CONTAINER_NAME} || true
    print_success "Container stopped"
}

# Main execution
main() {
    case "${1:-rebuild}" in
        "build")
            check_docker
            build_image
            ;;
        "run")
            check_docker
            run_container
            show_status
            ;;
        "rebuild")
            check_docker
            cleanup
            build_image
            run_container
            show_status
            ;;
        "clean")
            check_docker
            cleanup
            ;;
        "status")
            check_docker
            show_status
            ;;
        "logs")
            check_docker
            show_logs
            ;;
        "stop")
            check_docker
            stop_container
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
