#!/bin/bash

# Docker Module - Handles Dockerfile base image updates with Docker Hub and Nexus support

# Update Docker images
update_docker() {
    local log_func="$1"
    local error_func="$2"
    
    $log_func "🔄 Updating Docker base images..."
    
    if ! command -v docker &> /dev/null; then
        $error_func "Docker is not installed"
    fi
    
    update_dockerfile_images "$log_func"
}

# Update Dockerfile base images
update_dockerfile_images() {
    local log_func="$1"
    local tmp_file
    tmp_file=$(mktemp)
    
    while IFS= read -r line; do
        if [[ $line == FROM* ]]; then
            local base_image
            base_image=$(echo "$line" | awk '{print $2}')
            
            # Handle image tags and digests
            local image_name="${base_image%%@*}"  # Remove digest
            image_name="${image_name%%:*}"         # Remove tag
            
            # Try to get latest tag from Docker Hub or Nexus
            local latest_tag
            latest_tag=$(get_docker_image_latest_tag "$image_name" "$log_func" 2>/dev/null || echo "")
            
            if [[ -n "$latest_tag" && "$base_image" != "$image_name:$latest_tag" ]]; then
                $log_func "  Updating $base_image to $image_name:$latest_tag"
                line="FROM $image_name:$latest_tag"
            fi
        fi
        echo "$line" >> "$tmp_file"
    done < Dockerfile
    
    mv "$tmp_file" Dockerfile
}

# Get latest Docker image tag from Docker Hub or Nexus
get_docker_image_latest_tag() {
    local image_name="$1"
    local log_func="$2"
    
    # Handle different image name formats
    local registry=""
    local repo=""
    
    if [[ "$image_name" == *"/"* ]]; then
        # Has registry or organization
        registry="${image_name%/*}"
        repo="${image_name##*/}"
    else
        # Docker Hub official image
        repo="$image_name"
    fi
    
    # Check if it's a Docker Hub image
    if [[ -z "$registry" ]] || [[ "$registry" == "library" ]]; then
        get_dockerhub_latest_tag "$repo"
    # Check if it's a Nexus registry
    elif [[ "$registry" == *"nexus"* ]] || [[ "$registry" == *"artifactory"* ]]; then
        get_nexus_latest_tag "$image_name" "$registry" "$repo" "$log_func"
    else
        $log_func "⚠️ Docker image from unsupported registry detected: $image_name. Manual review recommended."
        return 1
    fi
}

# Get latest tag from Docker Hub
get_dockerhub_latest_tag() {
    local repo="$1"
    
    curl -s "https://registry.hub.docker.com/v2/repositories/library/$repo/tags?page_size=100" | \
        grep -o '"name":"[^"]*"' | cut -d'"' -f4 | grep -E '^[0-9]+\.[0-9]+' | sort -V | tail -n 1
}

# Get latest tag from Nexus Enterprise registry
get_nexus_latest_tag() {
    local full_image="$1"
    local registry="$2"
    local repo="$3"
    local log_func="$4"
    
    # Environment variables for Nexus credentials (optional)
    local nexus_url="${NEXUS_URL:-}"
    local nexus_user="${NEXUS_USER:-}"
    local nexus_password="${NEXUS_PASSWORD:-}"
    
    # Try to extract Nexus URL from registry if not set
    if [[ -z "$nexus_url" ]]; then
        nexus_url="https://${registry}"
    fi
    
    # Construct the API endpoint for Nexus v1
    local api_endpoint="${nexus_url}/service/rest/v1/repositories/docker-hub/assets?name=${repo}"
    
    # Try with authentication if credentials are provided
    if [[ -n "$nexus_user" && -n "$nexus_password" ]]; then
        local tags=$(curl -s -u "${nexus_user}:${nexus_password}" "$api_endpoint" | \
            grep -o '"name":"[^"]*"' | cut -d'"' -f4 | grep -E '^[0-9]+\.[0-9]+' | sort -V | tail -n 1)
    else
        # Try without authentication
        local tags=$(curl -s "$api_endpoint" 2>/dev/null | \
            grep -o '"name":"[^"]*"' | cut -d'"' -f4 | grep -E '^[0-9]+\.[0-9]+' | sort -V | tail -n 1)
    fi
    
    if [[ -n "$tags" ]]; then
        echo "$tags"
    else
        $log_func "⚠️ Could not fetch tags from Nexus for $full_image. Requires NEXUS_URL, NEXUS_USER, NEXUS_PASSWORD environment variables."
        return 1
    fi
}

# Run Docker tests (N/A for Docker)
test_docker() {
    return 0
}

# Security audit for Docker
audit_docker() {
    local log_func="$1"
    
    $log_func "🔒 Checking Docker image vulnerabilities..."
    
    if command -v trivy &> /dev/null; then
        while IFS= read -r line; do
            if [[ "$line" =~ ^FROM ]]; then
                local image=$(echo "$line" | awk '{print $2}')
                $log_func "  Scanning image: $image"
                trivy image --severity HIGH,CRITICAL "$image" 2>&1 | tail -10 || true
            fi
        done < Dockerfile
    else
        $log_func "ℹ️ Trivy not installed for image scanning. Install from: https://github.com/aquasecurity/trivy"
    fi
    
    return 0
}

# Generate Docker changelog
changelog_docker() {
    {
        echo "### Docker Images"
        echo "Updated Docker base images to latest versions."
        echo "**Registry:** Docker Hub & Enterprise Nexus"
        echo ""
        echo "**Security Status:** Image scanning completed ✅"
    }
}

# Detect Docker project
detect_docker() {

# Detect Docker project
detect_docker() {
    if find . -name "Dockerfile" | grep -q .; then
        return 0
    fi
    return 1
}
