#!/bin/bash

# Configuration Management for Dependency Updater

CONFIG_FILE="${HOME}/.dependency-updater.config"
CONFIG_TEMPLATE="${SCRIPT_DIR}/.dependency-updater.config.example"

# Default configuration
DEFAULT_CONFIG="
# Dependency Updater Configuration
# Generated on $(date)

# Enable/disable specific languages
ENABLE_NODEJS=true
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=true
ENABLE_GO=true
ENABLE_RUST=true

# Update strategy: patch, minor, major
UPDATE_STRATEGY=minor

# Run tests after updates
RUN_TESTS=true

# Run security audits
RUN_SECURITY_AUDIT=true

# Auto-commit changes
AUTO_COMMIT=true

# Create pull requests automatically
CREATE_PULL_REQUEST=true

# Parallel execution (faster but uses more resources)
PARALLEL_EXECUTION=true

# Maximum parallel jobs
MAX_PARALLEL_JOBS=4

# Git configuration
GIT_BRANCH_PREFIX=dependency-updates
GIT_COMMIT_MESSAGE=chore: update dependencies

# Logging
LOG_LEVEL=info
LOG_FILE=dependency-updater.log

# Docker Registry (for Docker module)
DOCKER_REGISTRIES=docker-hub,nexus

# Nexus Configuration (leave empty to disable)
NEXUS_ENABLED=false
NEXUS_URL=
NEXUS_USER=
NEXUS_PASSWORD=

# Languages to ignore (comma-separated)
IGNORE_LANGUAGES=

# Monorepo support
MONOREPO_ENABLED=false
MONOREPO_PATHS=

# Update notifications (slack, email, webhook)
NOTIFICATIONS_ENABLED=false
NOTIFICATION_TYPE=
NOTIFICATION_WEBHOOK=

# Conflict resolution strategy: manual, auto, ignore
CONFLICT_RESOLUTION=manual

# Generate reports
GENERATE_REPORTS=true
REPORT_FORMATS=json,csv,md,sbom

# Report output directory
REPORT_OUTPUT_DIR=./reports
"

load_config() {
    local log_func="${1:-echo}"
    
    if [[ -f "$CONFIG_FILE" ]]; then
        $log_func "📋 Loading configuration from: $CONFIG_FILE"
        source "$CONFIG_FILE" || $log_func "⚠️ Failed to load configuration"
    else
        $log_func "ℹ️ No configuration file found. Using defaults."
        create_config "$log_func"
    fi
}

create_config() {
    local log_func="${1:-echo}"
    
    $log_func "📝 Creating default configuration..."
    
    echo "$DEFAULT_CONFIG" > "$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
    
    $log_func "✅ Configuration created at: $CONFIG_FILE"
    $log_func "📖 Edit the file to customize settings"
}

show_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        cat "$CONFIG_FILE"
    else
        echo "No configuration file found."
        echo "Run 'create_config' to create default configuration."
    fi
}

validate_config() {
    local log_func="${1:-echo}"
    
    $log_func "🔍 Validating configuration..."
    
    # Check if languages are properly configured
    if [[ "$ENABLE_NODEJS" != "true" && "$ENABLE_NODEJS" != "false" ]]; then
        $log_func "⚠️ Invalid ENABLE_NODEJS value: $ENABLE_NODEJS"
        return 1
    fi
    
    # Check update strategy
    if [[ "$UPDATE_STRATEGY" != "patch" && "$UPDATE_STRATEGY" != "minor" && "$UPDATE_STRATEGY" != "major" ]]; then
        $log_func "⚠️ Invalid UPDATE_STRATEGY: $UPDATE_STRATEGY"
        return 1
    fi
    
    # Check conflict resolution strategy
    if [[ "$CONFLICT_RESOLUTION" != "manual" && "$CONFLICT_RESOLUTION" != "auto" && "$CONFLICT_RESOLUTION" != "ignore" ]]; then
        $log_func "⚠️ Invalid CONFLICT_RESOLUTION: $CONFLICT_RESOLUTION"
        return 1
    fi
    
    $log_func "✅ Configuration is valid"
    return 0
}

get_enabled_languages() {
    local languages=()
    
    [[ "$ENABLE_NODEJS" == "true" ]] && languages+=("nodejs")
    [[ "$ENABLE_PYTHON" == "true" ]] && languages+=("python")
    [[ "$ENABLE_DOCKER" == "true" ]] && languages+=("docker")
    [[ "$ENABLE_JAVA" == "true" ]] && languages+=("java")
    [[ "$ENABLE_GO" == "true" ]] && languages+=("go")
    [[ "$ENABLE_RUST" == "true" ]] && languages+=("rust")
    
    printf '%s\n' "${languages[@]}"
}

is_language_enabled() {
    local lang="$1"
    local enable_var="ENABLE_$(echo $lang | tr '[:lower:]' '[:upper:]')"
    
    [[ "${!enable_var}" == "true" ]]
}

should_ignore_language() {
    local lang="$1"
    
    if [[ -z "$IGNORE_LANGUAGES" ]]; then
        return 1
    fi
    
    [[ ",$IGNORE_LANGUAGES," == *",$lang,"* ]]
}

update_config() {
    local key="$1"
    local value="$2"
    local log_func="${3:-echo}"
    
    if [[ -z "$key" || -z "$value" ]]; then
        $log_func "❌ Usage: update_config KEY VALUE"
        return 1
    fi
    
    if [[ ! -f "$CONFIG_FILE" ]]; then
        $log_func "❌ Configuration file not found"
        return 1
    fi
    
    # Use sed to update the config
    sed -i.bak "s/^${key}=.*/${key}=${value}/" "$CONFIG_FILE"
    
    $log_func "✅ Updated $key to: $value"
}

list_config() {
    echo "📋 Current Configuration Settings:"
    echo ""
    
    # Languages
    echo "Language Support:"
    echo "  Node.js:  $ENABLE_NODEJS"
    echo "  Python:   $ENABLE_PYTHON"
    echo "  Docker:   $ENABLE_DOCKER"
    echo "  Java:     $ENABLE_JAVA"
    echo "  Go:       $ENABLE_GO"
    echo "  Rust:     $ENABLE_RUST"
    echo ""
    
    # Features
    echo "Features:"
    echo "  Update Strategy:        $UPDATE_STRATEGY"
    echo "  Run Tests:              $RUN_TESTS"
    echo "  Security Audit:         $RUN_SECURITY_AUDIT"
    echo "  Auto Commit:            $AUTO_COMMIT"
    echo "  Create Pull Request:    $CREATE_PULL_REQUEST"
    echo "  Parallel Execution:     $PARALLEL_EXECUTION"
    echo ""
    
    # Git
    echo "Git Configuration:"
    echo "  Branch Prefix:          $GIT_BRANCH_PREFIX"
    echo "  Commit Message:         $GIT_COMMIT_MESSAGE"
    echo ""
    
    # Logging
    echo "Logging:"
    echo "  Level:                  $LOG_LEVEL"
    echo "  File:                   $LOG_FILE"
    echo ""
    
    # Docker
    echo "Docker Configuration:"
    echo "  Registries:             $DOCKER_REGISTRIES"
    echo "  Nexus Enabled:          $NEXUS_ENABLED"
    echo ""
    
    # Reports
    echo "Reporting:"
    echo "  Generate Reports:       $GENERATE_REPORTS"
    echo "  Formats:                $REPORT_FORMATS"
    echo "  Output Directory:       $REPORT_OUTPUT_DIR"
}
