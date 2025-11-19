#!/bin/bash

################################################################################
# Dep-Sync - Main Orchestrator
# Loads all language modules and orchestrates dependency synchronization across the project
################################################################################

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/depsync.log"
CHANGELOG_FILE="${SCRIPT_DIR}/CHANGELOG.md"
GIT_BRANCH="dependency-updates-$(date +%s)"
GIT_COMMIT_MESSAGE="chore: update dependencies"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    command -v "$1" &> /dev/null
}

################################################################################
# Module Loading
################################################################################

load_modules() {
    log "📦 Loading language modules..."
    
    local modules=(
        "nodejs"
        "python"
        "docker"
        "java"
        "go"
        "rust"
    )
    
    for module in "${modules[@]}"; do
        local module_path="${SCRIPT_DIR}/modules/${module}.sh"
        if [[ -f "${module_path}" ]]; then
            source "${module_path}"
            log "  ✅ Loaded ${module} module"
        else
            warning "  ⚠️ Module not found: ${module_path}"
        fi
    done
}

################################################################################
# Detection & Update Orchestration
################################################################################

detect_projects() {
    log "🔍 Detecting projects..."
    
    local detected=0
    
    if detect_nodejs &> /dev/null; then
        log "  ✅ Node.js project detected"
        ((detected++))
    fi
    
    if detect_python &> /dev/null; then
        log "  ✅ Python project detected"
        ((detected++))
    fi
    
    if detect_docker &> /dev/null; then
        log "  ✅ Docker project detected"
        ((detected++))
    fi
    
    if detect_java &> /dev/null; then
        log "  ✅ Java project detected"
        ((detected++))
    fi
    
    if detect_go &> /dev/null; then
        log "  ✅ Go project detected"
        ((detected++))
    fi
    
    if detect_rust &> /dev/null; then
        log "  ✅ Rust project detected"
        ((detected++))
    fi
    
    if [[ ${detected} -eq 0 ]]; then
        warning "⚠️ No supported projects detected"
        return 1
    fi
    
    log "📊 Total projects detected: ${detected}"
    return 0
}

update_all() {
    log "🚀 Starting dependency updates..."
    
    # Detect which projects need updating
    local updates_needed=()
    [[ $(detect_nodejs &> /dev/null && echo 1 || echo 0) -eq 1 ]] && updates_needed+=("nodejs")
    [[ $(detect_python &> /dev/null && echo 1 || echo 0) -eq 1 ]] && updates_needed+=("python")
    [[ $(detect_docker &> /dev/null && echo 1 || echo 0) -eq 1 ]] && updates_needed+=("docker")
    [[ $(detect_java &> /dev/null && echo 1 || echo 0) -eq 1 ]] && updates_needed+=("java")
    [[ $(detect_go &> /dev/null && echo 1 || echo 0) -eq 1 ]] && updates_needed+=("go")
    [[ $(detect_rust &> /dev/null && echo 1 || echo 0) -eq 1 ]] && updates_needed+=("rust")
    
    # Create changelog header
    {
        echo "# Dependency Updates - $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
    } > "${CHANGELOG_FILE}"
    
    # Array to store background job PIDs
    declare -a job_pids
    declare -a job_names
    
    # Process each language in parallel
    for lang in "${updates_needed[@]}"; do
        (
            case "$lang" in
                "nodejs")
                    log "📦 [PARALLEL] Updating Node.js dependencies..."
                    update_nodejs "log" "error" || warning "⚠️ Node.js update failed"
                    test_nodejs "log" || warning "⚠️ Node.js tests failed"
                    audit_nodejs "log" || warning "⚠️ Node.js security audit detected issues"
                    changelog_nodejs >> "${CHANGELOG_FILE}.nodejs"
                    ;;
                "python")
                    log "📦 [PARALLEL] Updating Python dependencies..."
                    update_python "log" "error" || warning "⚠️ Python update failed"
                    test_python "log" || warning "⚠️ Python tests failed"
                    audit_python "log" || warning "⚠️ Python security audit detected issues"
                    changelog_python >> "${CHANGELOG_FILE}.python"
                    ;;
                "docker")
                    log "📦 [PARALLEL] Updating Docker images..."
                    update_docker "log" "error" || warning "⚠️ Docker update failed"
                    test_docker "log" || warning "⚠️ Docker validation failed"
                    audit_docker "log" || warning "⚠️ Docker image scan found issues"
                    changelog_docker >> "${CHANGELOG_FILE}.docker"
                    ;;
                "java")
                    log "📦 [PARALLEL] Updating Java dependencies..."
                    update_java "log" "error" || warning "⚠️ Java update failed"
                    test_java "log" || warning "⚠️ Java tests failed"
                    audit_java "log" || warning "⚠️ Java security audit detected issues"
                    changelog_java >> "${CHANGELOG_FILE}.java"
                    ;;
                "go")
                    log "📦 [PARALLEL] Updating Go dependencies..."
                    update_go "log" "error" || warning "⚠️ Go update failed"
                    test_go "log" || warning "⚠️ Go tests failed"
                    audit_go "log" || warning "⚠️ Go security audit detected issues"
                    changelog_go >> "${CHANGELOG_FILE}.go"
                    ;;
                "rust")
                    log "📦 [PARALLEL] Updating Rust dependencies..."
                    update_rust "log" "error" || warning "⚠️ Rust update failed"
                    test_rust "log" || warning "⚠️ Rust tests failed"
                    audit_rust "log" || warning "⚠️ Rust security audit detected issues"
                    changelog_rust >> "${CHANGELOG_FILE}.rust"
                    ;;
            esac
        ) &
        
        local pid=$!
        job_pids+=($pid)
        job_names+=("$lang")
        log "  Started background job for $lang (PID: $pid)"
    done
    
    # Wait for all background jobs to complete
    log ""
    log "⏳ Waiting for all language updates to complete..."
    local failed_jobs=()
    
    for i in "${!job_pids[@]}"; do
        local pid=${job_pids[$i]}
        local name=${job_names[$i]}
        
        if wait $pid; then
            success "  ✅ ${name} completed"
        else
            warning "  ⚠️ ${name} completed with exit code $?"
            failed_jobs+=("$name")
        fi
    done
    
    # Consolidate changelogs
    log "📋 Consolidating changelogs..."
    for lang in "${updates_needed[@]}"; do
        if [[ -f "${CHANGELOG_FILE}.${lang}" ]]; then
            echo "" >> "${CHANGELOG_FILE}"
            cat "${CHANGELOG_FILE}.${lang}" >> "${CHANGELOG_FILE}"
            rm "${CHANGELOG_FILE}.${lang}"
        fi
    done
    
    echo "" >> "${CHANGELOG_FILE}"
    {
        echo "---"
        echo "**Update Report:**"
        echo "- Total languages processed: ${#updates_needed[@]}"
        if [[ ${#failed_jobs[@]} -gt 0 ]]; then
            echo "- Failed updates: ${failed_jobs[*]}"
        else
            echo "- All updates completed successfully ✅"
        fi
        echo "- Timestamp: $(date)"
    } >> "${CHANGELOG_FILE}"
    
    success "✅ All parallel updates completed"
}

git_commit_and_push() {
    log "📝 Preparing git commit..."
    
    if ! command_exists git; then
        error "Git is not installed"
        return 1
    fi
    
    # Check if there are changes
    if git diff --quiet; then
        log "ℹ️ No changes detected"
        return 0
    fi
    
    # Create branch
    log "🌿 Creating branch: ${GIT_BRANCH}"
    git checkout -b "${GIT_BRANCH}" || git checkout "${GIT_BRANCH}"
    
    # Stage changes
    log "📦 Staging changes..."
    git add -A
    
    # Commit
    log "💾 Committing changes..."
    git commit -m "${GIT_COMMIT_MESSAGE}" || warning "⚠️ Nothing to commit"
    
    # Push
    if [[ "${PUSH_TO_REMOTE:-false}" == "true" ]]; then
        log "🚀 Pushing to remote..."
        git push -u origin "${GIT_BRANCH}" || warning "⚠️ Push failed"
    fi
}

create_pull_request() {
    log "🔗 Pull request creation details:"
    log "  Branch: ${GIT_BRANCH}"
    log "  Title: ${GIT_COMMIT_MESSAGE}"
    log "  Changelog: $(head -10 ${CHANGELOG_FILE})"
    log "ℹ️ Configure GitHub Actions secrets for automated PR creation:"
    log "  - TOKEN: GitHub Personal Access Token"
    log "  - NEXUS_URL: Nexus repository URL (for Docker images)"
    log "  - NEXUS_USER: Nexus username"
    log "  - NEXUS_PASSWORD: Nexus password"
}

################################################################################
# Main
################################################################################

main() {
    echo ""
    log "╔════════════════════════════════════════════════════════════════╗"
    log "║           Dep-Sync - Main Orchestrator                        ║"
    log "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Load all language modules
    load_modules || {
        error "Failed to load modules"
        return 1
    }
    
    echo ""
    
    # Detect projects
    detect_projects || {
        error "No supported projects found"
        return 1
    }
    
    echo ""
    
    # Update all dependencies
    update_all || {
        error "Dependency update failed"
        return 1
    }
    
    echo ""
    
    # Git operations
    git_commit_and_push
    create_pull_request
    
    echo ""
    success "╔════════════════════════════════════════════════════════════════╗"
    success "║                   ✅ All tasks completed!                      ║"
    success "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    log "📋 Logs saved to: ${LOG_FILE}"
    log "📝 Changelog saved to: ${CHANGELOG_FILE}"
}

# Run main function
main "$@"
