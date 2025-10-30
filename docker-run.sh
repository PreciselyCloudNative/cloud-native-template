#!/bin/bash
# Docker Run Script for Precisely Cloud Native App
# This script makes it easy to run the Docker container with the correct configuration

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Precisely Cloud Native - Docker Launch${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Configuration
CONTAINER_NAME="precisely-app"
IMAGE_NAME="precisely-cloud-native:latest"
PORT=3000
ENV_FILE=".env.docker"

# Check if .env.docker exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Warning: $ENV_FILE not found!${NC}"
    echo "Creating from .env.example..."
    cp .env.example "$ENV_FILE"
    echo -e "${YELLOW}Please edit $ENV_FILE and add your API key${NC}"
    exit 1
fi

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}Stopping existing container...${NC}"
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    echo -e "${YELLOW}Removing existing container...${NC}"
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
fi

# Check if image exists
if ! docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_NAME}$"; then
    echo -e "${YELLOW}Image $IMAGE_NAME not found. Building...${NC}"
    docker build -t "$IMAGE_NAME" .
fi

# Run container
echo -e "${GREEN}Starting container: $CONTAINER_NAME${NC}"
docker run -d \
  -p ${PORT}:${PORT} \
  --env-file "$ENV_FILE" \
  --name "$CONTAINER_NAME" \
  "$IMAGE_NAME"

# Wait for container to start
sleep 2

# Check if container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "\n${GREEN}✅ Container started successfully!${NC}\n"
    echo -e "${BLUE}Container Info:${NC}"
    echo -e "  Name: $CONTAINER_NAME"
    echo -e "  Port: http://localhost:$PORT"
    echo -e "  Env File: $ENV_FILE"
    echo -e "\n${BLUE}Useful Commands:${NC}"
    echo -e "  View logs:    ${GREEN}docker logs $CONTAINER_NAME${NC}"
    echo -e "  Follow logs:  ${GREEN}docker logs -f $CONTAINER_NAME${NC}"
    echo -e "  Stop:         ${GREEN}docker stop $CONTAINER_NAME${NC}"
    echo -e "  Restart:      ${GREEN}docker restart $CONTAINER_NAME${NC}"
    echo -e "  Remove:       ${GREEN}docker rm -f $CONTAINER_NAME${NC}"
    echo -e "\n${BLUE}Test Endpoints:${NC}"
    echo -e "  Health:       ${GREEN}curl http://localhost:$PORT/api/health${NC}"
    echo -e "  Open browser: ${GREEN}open http://localhost:$PORT${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  Container failed to start${NC}"
    echo "View logs with: docker logs $CONTAINER_NAME"
    exit 1
fi
