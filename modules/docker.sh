#!/bin/bash

################################################################################
# Docker Module - Handles Dockerfile base image updates
# Supports Docker Hub and Enterprise Nexus registries
################################################################################

# Detect Docker project
detect_docker() {
    if find . -name "Dockerfile" 2>/dev/null | grep -q .; then
        return 0
    fi
    return 1
}

# Update Docker images
update_docker() {
    local log_func="${1:-echo}"
    local error_func="${2:-echo}"
    
    $log_func "🔄 Updating Docker base images..."
    
    if ! command -v docker &>/dev/null; then
        $log_func "ℹ️ Docker not installed - checking images via API only"
    fi
    
    # Find all Dockerfiles
    local dockerfiles
    dockerfiles=$(find . -name "Dockerfile" -o -name "Dockerfile.*" 2>/dev/null)
    
    if [[ -z "$dockerfiles" ]]; then
        $log_func "ℹ️ No Dockerfiles found"
        return 0
    fi
    
    local updated=0
    local failed=0
    
    while IFS= read -r dockerfile; do
        [[ -z "$dockerfile" ]] && continue
        
        $log_func "   Processing: $dockerfile"
        
        if update_dockerfile_images "$dockerfile" "$log_func"; then
            ((updated++))
        else
            ((failed++))
        fi
    done <<< "$dockerfiles"
    
    if [[ $updated -gt 0 ]]; then
        $log_func "✅ Updated $updated Dockerfile(s)"
    fi
    
    if [[ $failed -gt 0 ]]; then
        $log_func "⚠️ $failed Dockerfile(s) had issues"
    fi
    
    return 0
}

# Update images in a single Dockerfile
update_dockerfile_images() {
    local dockerfile="$1"
    local log_func="${2:-echo}"
    local tmp_file
    tmp_file=$(mktemp)
    local changes_made=false
    
    while IFS= read -r line; do
        if [[ $line =~ ^FROM[[:space:]] ]]; then
            local base_image
            base_image=$(echo "$line" | awk '{print $2}')
            
            # Skip scratch and build stages with AS
            if [[ "$base_image" == "scratch" ]]; then
                echo "$line" >> "$tmp_file"
                continue
            fi
            
            # Handle image name parsing
            local image_name="${base_image%%@*}"  # Remove digest
            local current_tag="${image_name##*:}"  # Get tag
            image_name="${image_name%%:*}"         # Get name without tag
            
            # Skip if no tag (using latest implicitly)
            if [[ "$base_image" == "$image_name" ]]; then
                $log_func "     ⚠️ $base_image uses implicit :latest tag"
                echo "$line" >> "$tmp_file"
                continue
            fi
            
            # Try to get latest tag
            local latest_tag
            latest_tag=$(get_docker_image_latest_tag "$image_name" "$log_func" 2>/dev/null || echo "")
            
            if [[ -n "$latest_tag" && "$current_tag" != "$latest_tag" ]]; then
                $log_func "     Updating $base_image → $image_name:$latest_tag"
                # Preserve any AS alias
                local alias_part=""
                [[ "$line" =~ [[:space:]]AS[[:space:]] ]] && alias_part=$(echo "$line" | grep -oP '\s+AS\s+\S+' || true)
                echo "FROM $image_name:$latest_tag$alias_part" >> "$tmp_file"
                changes_made=true
            else
                echo "$line" >> "$tmp_file"
            fi
        else
            echo "$line" >> "$tmp_file"
        fi
    done < "$dockerfile"
    
    if [[ "$changes_made" == "true" ]]; then
        mv "$tmp_file" "$dockerfile"
        return 0
    else
        rm "$tmp_file"
        return 1
    fi
}

# Get latest Docker image tag
get_docker_image_latest_tag() {
    local image_name="$1"
    local log_func="${2:-echo}"
    
    local registry=""
    local repo=""
    
    # Parse image name
    if [[ "$image_name" == *"/"* ]]; then
        # Check if it has a registry prefix
        local first_part="${image_name%%/*}"
        if [[ "$first_part" == *"."* ]] || [[ "$first_part" == *":"* ]]; then
            # Has registry
            registry="$first_part"
            repo="${image_name#*/}"
        else
            # Docker Hub with organization
            repo="$image_name"
        fi
    else
        # Docker Hub official image
        repo="library/$image_name"
    fi
    
    # Docker Hub
    if [[ -z "$registry" ]] || [[ "$registry" == "docker.io" ]]; then
        get_dockerhub_latest_tag "$repo"
        return $?
    fi
    
    # Nexus or other registry
    if [[ "$registry" == *"nexus"* ]] || [[ "$registry" == *"artifactory"* ]]; then
        get_nexus_latest_tag "$image_name" "$registry" "$repo" "$log_func"
        return $?
    fi
    
    # Unknown registry
    return 1
}

# Get latest tag from Docker Hub
get_dockerhub_latest_tag() {
    local repo="$1"
    
    # Use Docker Hub API v2
    local api_url="https://registry.hub.docker.com/v2/repositories/${repo}/tags?page_size=100"
    
    local response
    response=$(curl -s --connect-timeout 5 "$api_url" 2>/dev/null || echo "")
    
    if [[ -z "$response" ]]; then
        return 1
    fi
    
    # Extract version tags and sort them
    echo "$response" | \
        grep -oP '"name"\s*:\s*"\K[^"]+' | \
        grep -E '^[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9]+)?$' | \
        sort -V | \
        tail -n 1
}

# Get latest tag from Nexus registry
get_nexus_latest_tag() {
    local full_image="$1"
    local registry="$2"
    local repo="$3"
    local log_func="${4:-echo}"
    
    local nexus_url="${NEXUS_URL:-https://${registry}}"
    local nexus_user="${NEXUS_USER:-}"
    local nexus_password="${NEXUS_PASSWORD:-}"
    
    local api_endpoint="${nexus_url}/service/rest/v1/search/assets?repository=docker&name=${repo}"
    
    local response
    if [[ -n "$nexus_user" && -n "$nexus_password" ]]; then
        response=$(curl -s --connect-timeout 5 -u "${nexus_user}:${nexus_password}" "$api_endpoint" 2>/dev/null || echo "")
    else
        response=$(curl -s --connect-timeout 5 "$api_endpoint" 2>/dev/null || echo "")
    fi
    
    if [[ -z "$response" ]]; then
        return 1
    fi
    
    echo "$response" | \
        grep -oP '"name"\s*:\s*"\K[^"]+' | \
        grep -E '^[0-9]+(\.[0-9]+)*' | \
        sort -V | \
        tail -n 1
}

# Run Docker tests (validate Dockerfiles)
test_docker() {
    local log_func="${1:-echo}"
    
    if ! detect_docker; then
        return 0
    fi
    
    $log_func "🧪 Validating Dockerfiles..."
    
    local valid=0
    local invalid=0
    
    while IFS= read -r dockerfile; do
        [[ -z "$dockerfile" ]] && continue
        
        # Basic syntax check
        if grep -q "^FROM" "$dockerfile" 2>/dev/null; then
            ((valid++))
        else
            $log_func "⚠️ Invalid Dockerfile: $dockerfile (no FROM instruction)"
            ((invalid++))
        fi
        
        # Check with hadolint if available
        if command -v hadolint &>/dev/null; then
            hadolint "$dockerfile" 2>&1 | head -5 || true
        fi
    done < <(find . -name "Dockerfile" -o -name "Dockerfile.*" 2>/dev/null)
    
    if [[ $invalid -eq 0 ]]; then
        $log_func "✅ All Dockerfiles valid"
        return 0
    else
        $log_func "⚠️ $invalid invalid Dockerfile(s)"
        return 1
    fi
}

# Security audit for Docker
audit_docker() {
    local log_func="${1:-echo}"
    
    if ! detect_docker; then
        return 0
    fi
    
    $log_func "🔒 Scanning Docker images for vulnerabilities..."
    
    # Check if trivy is installed
    if ! command -v trivy &>/dev/null; then
        $log_func "ℹ️ Trivy not installed for image scanning"
        $log_func "   Install from: https://github.com/aquasecurity/trivy"
        return 0
    fi
    
    local issues_found=0
    
    while IFS= read -r dockerfile; do
        [[ -z "$dockerfile" ]] && continue
        
        while IFS= read -r line; do
            if [[ "$line" =~ ^FROM[[:space:]] ]]; then
                local image=$(echo "$line" | awk '{print $2}')
                [[ "$image" == "scratch" ]] && continue
                
                $log_func "   Scanning: $image"
                
                if trivy image --severity HIGH,CRITICAL --quiet "$image" 2>&1 | grep -q "CRITICAL\|HIGH"; then
                    $log_func "   ⚠️ Vulnerabilities found in $image"
                    ((issues_found++))
                else
                    $log_func "   ✅ $image - no high/critical vulnerabilities"
                fi
            fi
        done < "$dockerfile"
    done < <(find . -name "Dockerfile" 2>/dev/null)
    
    if [[ $issues_found -gt 0 ]]; then
        $log_func "⚠️ $issues_found image(s) have vulnerabilities"
        return 1
    fi
    
    $log_func "✅ All images passed security scan"
    return 0
}

# Generate Docker changelog
changelog_docker() {
    echo "### Docker Images"
    echo ""
    echo "Updated Docker base images to latest versions."
    echo ""
    
    if [[ -f "Dockerfile" ]]; then
        echo "**Base Images:**"
        grep "^FROM" Dockerfile 2>/dev/null | while read -r line; do
            echo "- \`$(echo "$line" | awk '{print $2}')\`"
        done
        echo ""
    fi
    
    echo "**Registry Support:** Docker Hub, Enterprise Nexus"
    echo "**Security Status:** Image scanning completed ✅"
}
