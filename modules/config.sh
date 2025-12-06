#!/bin/bash
################################################################################
# Configuration Module
# Manages Dep-Sync settings
################################################################################

CONFIG_FILE="${HOME}/.depsync.config"

# Default configuration template
DEFAULT_CONFIG='# Dep-Sync Configuration

# Languages
ENABLE_NODEJS=true
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=false

# Update strategy: patch, minor, major
UPDATE_STRATEGY=minor

# Features
RUN_TESTS=true
RUN_SECURITY_AUDIT=true
AUTO_COMMIT=true
CREATE_PULL_REQUEST=true
PARALLEL_EXECUTION=true
MAX_PARALLEL_JOBS=4

# Git
GIT_BRANCH_PREFIX=deps/update
GIT_COMMIT_MESSAGE=chore(deps): update dependencies

# Logging
LOG_LEVEL=info
LOG_FILE=depsync.log

# Reports
GENERATE_REPORTS=true
REPORT_FORMATS=json,csv,md,sbom
REPORT_OUTPUT_DIR=./reports

# Docker registries
DOCKER_REGISTRIES=docker-hub
NEXUS_ENABLED=false

# Monorepo
MONOREPO_ENABLED=false

# Notifications
NOTIFICATIONS_ENABLED=false

# Conflict resolution: manual, auto, ignore
CONFLICT_RESOLUTION=manual
'

# Load configuration
load_config() {
    local log_func="${1:-echo}"
    
    if [[ -f "$CONFIG_FILE" ]]; then
        $log_func "📋 Config: $CONFIG_FILE"
        source "$CONFIG_FILE" || $log_func "⚠️ Failed to load config"
    else
        $log_func "ℹ️ Using defaults (no config file)"
    fi
}

# Create default config
create_config() {
    local log_func="${1:-echo}"
    
    echo "$DEFAULT_CONFIG" > "$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
    
    $log_func "✅ Created: $CONFIG_FILE"
}

# Show configuration
show_config() {
    [[ -f "$CONFIG_FILE" ]] && cat "$CONFIG_FILE" || echo "No config file. Run create_config."
}

# Validate configuration
validate_config() {
    local log_func="${1:-echo}"
    
    $log_func "🔍 Validating config..."
    
    # Check boolean values
    for var in ENABLE_NODEJS ENABLE_PYTHON ENABLE_DOCKER ENABLE_JAVA; do
        local val="${!var}"
        if [[ "$val" != "true" && "$val" != "false" ]]; then
            $log_func "⚠️ Invalid $var: $val"
            return 1
        fi
    done
    
    # Check update strategy
    if [[ ! "$UPDATE_STRATEGY" =~ ^(patch|minor|major)$ ]]; then
        $log_func "⚠️ Invalid UPDATE_STRATEGY: $UPDATE_STRATEGY"
        return 1
    fi
    
    $log_func "✅ Config valid"
    return 0
}

# Get enabled languages
get_enabled_languages() {
    local langs=()
    [[ "$ENABLE_NODEJS" == "true" ]] && langs+=("nodejs")
    [[ "$ENABLE_PYTHON" == "true" ]] && langs+=("python")
    [[ "$ENABLE_DOCKER" == "true" ]] && langs+=("docker")
    [[ "$ENABLE_JAVA" == "true" ]] && langs+=("java")
    printf '%s\n' "${langs[@]}"
}

# Check if language is enabled
is_language_enabled() {
    local lang="$1"
    local var="ENABLE_$(echo "$lang" | tr '[:lower:]' '[:upper:]')"
    [[ "${!var}" == "true" ]]
}

# Update config value
update_config() {
    local key="$1" value="$2"
    local log_func="${3:-echo}"
    
    [[ -z "$key" || -z "$value" ]] && { $log_func "❌ Usage: update_config KEY VALUE"; return 1; }
    [[ ! -f "$CONFIG_FILE" ]] && { $log_func "❌ No config file"; return 1; }
    
    sed -i.bak "s/^${key}=.*/${key}=${value}/" "$CONFIG_FILE"
    rm -f "${CONFIG_FILE}.bak"
    
    $log_func "✅ Updated $key=$value"
}

# List all settings
list_config() {
    echo "📋 Configuration"
    echo ""
    echo "Languages:"
    echo "  Node.js: ${ENABLE_NODEJS:-true}"
    echo "  Python:  ${ENABLE_PYTHON:-true}"
    echo "  Docker:  ${ENABLE_DOCKER:-true}"
    echo "  Java:    ${ENABLE_JAVA:-false}"
    echo ""
    echo "Features:"
    echo "  Strategy:  ${UPDATE_STRATEGY:-minor}"
    echo "  Tests:     ${RUN_TESTS:-true}"
    echo "  Audit:     ${RUN_SECURITY_AUDIT:-true}"
    echo "  Parallel:  ${PARALLEL_EXECUTION:-true}"
    echo ""
    echo "Git:"
    echo "  Prefix:    ${GIT_BRANCH_PREFIX:-deps/update}"
    echo "  Message:   ${GIT_COMMIT_MESSAGE:-chore(deps): update dependencies}"
}
