#!/bin/bash
################################################################################
# Dep-Sync - Shared Library
# Common functions used across all scripts
################################################################################

# Prevent multiple sourcing
[[ -n "${_DEPSYNC_COMMON_LOADED:-}" ]] && return 0
_DEPSYNC_COMMON_LOADED=1

################################################################################
# Colors
################################################################################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

################################################################################
# Script Directory
################################################################################
if [[ -z "${SCRIPT_DIR:-}" ]]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}")" && pwd)"
fi
export SCRIPT_DIR

################################################################################
# Default Configuration
################################################################################
LOG_FILE="${LOG_FILE:-${SCRIPT_DIR}/depsync.log}"
CHANGELOG_FILE="${CHANGELOG_FILE:-${SCRIPT_DIR}/CHANGELOG.md}"

# Git settings
GIT_BRANCH_PREFIX="${GIT_BRANCH_PREFIX:-deps/update}"
GIT_COMMIT_MESSAGE="${GIT_COMMIT_MESSAGE:-chore(deps): update dependencies}"

# Feature flags
PARALLEL_EXECUTION="${PARALLEL_EXECUTION:-true}"
MAX_PARALLEL_JOBS="${MAX_PARALLEL_JOBS:-4}"
RUN_TESTS="${RUN_TESTS:-true}"
RUN_SECURITY_AUDIT="${RUN_SECURITY_AUDIT:-true}"
AUTO_COMMIT="${AUTO_COMMIT:-true}"
CREATE_PULL_REQUEST="${CREATE_PULL_REQUEST:-true}"
PUSH_TO_REMOTE="${PUSH_TO_REMOTE:-true}"
CREATE_BACKUP_BRANCH="${CREATE_BACKUP_BRANCH:-true}"

# Language toggles
ENABLE_NODEJS="${ENABLE_NODEJS:-true}"
ENABLE_PYTHON="${ENABLE_PYTHON:-true}"
ENABLE_DOCKER="${ENABLE_DOCKER:-true}"
ENABLE_JAVA="${ENABLE_JAVA:-false}"

# Reports
GENERATE_REPORTS="${GENERATE_REPORTS:-false}"
REPORT_OUTPUT_DIR="${REPORT_OUTPUT_DIR:-./reports}"

################################################################################
# Logging Functions
################################################################################
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} ${message}" | tee -a "${LOG_FILE}"
}

error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[${timestamp}] ERROR: ${message}${NC}" | tee -a "${LOG_FILE}" >&2
}

success() {
    local message="$1"
    echo -e "${GREEN}${message}${NC}" | tee -a "${LOG_FILE}"
}

warning() {
    local message="$1"
    echo -e "${YELLOW}${message}${NC}" | tee -a "${LOG_FILE}"
}

################################################################################
# Utility Functions
################################################################################
command_exists() {
    command -v "$1" &>/dev/null
}

# Load configuration from file
load_config() {
    local config_file="${HOME}/.depsync.config"
    local local_config="${SCRIPT_DIR}/.depsync.config"
    
    if [[ -f "${local_config}" ]]; then
        log "📋 Loading config: ${local_config}"
        source "${local_config}"
    elif [[ -f "${config_file}" ]]; then
        log "📋 Loading config: ${config_file}"
        source "${config_file}"
    fi
}

# Load all language modules
load_language_modules() {
    local modules=("nodejs" "python" "docker" "java")
    
    for module in "${modules[@]}"; do
        local path="${SCRIPT_DIR}/modules/${module}.sh"
        [[ -f "$path" ]] && source "$path"
    done
}

# Load utility modules
load_utility_modules() {
    local modules=("audit" "reports" "monorepo" "pr-enhance")
    
    for module in "${modules[@]}"; do
        local path="${SCRIPT_DIR}/modules/${module}.sh"
        [[ -f "$path" ]] && source "$path"
    done
}

# Load all modules
load_all_modules() {
    load_utility_modules
    load_language_modules
}

################################################################################
# Language Detection Helper
################################################################################
declare -A LANG_DETECTORS=(
    ["nodejs"]="detect_nodejs"
    ["python"]="detect_python"
    ["docker"]="detect_docker"
    ["java"]="detect_java"
)

declare -A LANG_UPDATERS=(
    ["nodejs"]="update_nodejs"
    ["python"]="update_python"
    ["docker"]="update_docker"
    ["java"]="update_java"
)

declare -A LANG_TESTERS=(
    ["nodejs"]="test_nodejs"
    ["python"]="test_python"
    ["docker"]="test_docker"
    ["java"]="test_java"
)

declare -A LANG_AUDITORS=(
    ["nodejs"]="audit_nodejs"
    ["python"]="audit_python"
    ["docker"]="audit_docker"
    ["java"]="audit_java"
)

declare -A LANG_CHANGELOGS=(
    ["nodejs"]="changelog_nodejs"
    ["python"]="changelog_python"
    ["docker"]="changelog_docker"
    ["java"]="changelog_java"
)

# Get list of enabled languages
get_enabled_languages() {
    local languages=()
    [[ "${ENABLE_NODEJS}" == "true" ]] && languages+=("nodejs")
    [[ "${ENABLE_PYTHON}" == "true" ]] && languages+=("python")
    [[ "${ENABLE_DOCKER}" == "true" ]] && languages+=("docker")
    [[ "${ENABLE_JAVA}" == "true" ]] && languages+=("java")
    echo "${languages[@]}"
}

# Check if a language is enabled
is_language_enabled() {
    local lang="$1"
    local var="ENABLE_$(echo "$lang" | tr '[:lower:]' '[:upper:]')"
    [[ "${!var}" == "true" ]]
}

# Detect a language project
detect_language() {
    local lang="$1"
    local detector="${LANG_DETECTORS[$lang]}"
    [[ -n "$detector" ]] && type "$detector" &>/dev/null && "$detector" &>/dev/null
}

################################################################################
# Git Helpers
################################################################################
git_has_changes() {
    ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null
}

git_current_branch() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main"
}

