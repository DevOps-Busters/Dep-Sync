#!/bin/bash
################################################################################
# Dep-Sync - Main Orchestrator
# Automated dependency updates for Node.js, Python, Docker, and Java
################################################################################

set -euo pipefail

# Get script directory and load shared library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SCRIPT_DIR

source "${SCRIPT_DIR}/lib/common.sh"

################################################################################
# Project Detection
################################################################################
detect_projects() {
    log "🔍 Detecting projects..."
    
    local detected=0
    local langs=(nodejs python docker java)
    local enable_vars=(ENABLE_NODEJS ENABLE_PYTHON ENABLE_DOCKER ENABLE_JAVA)
    local names=("Node.js" "Python" "Docker" "Java")
    
    for i in "${!langs[@]}"; do
        local lang="${langs[$i]}"
        local enabled="${!enable_vars[$i]}"
        local name="${names[$i]}"
        
        if [[ "$enabled" == "true" ]]; then
            if detect_language "$lang"; then
                log "  ✅ ${name} project detected"
                ((detected++))
            fi
        else
            log "  ⏭️  ${name} disabled"
        fi
    done
    
    [[ $detected -eq 0 ]] && { warning "⚠️ No projects detected"; return 1; }
    log "📊 Projects found: ${detected}"
    return 0
}

################################################################################
# Update Processing
################################################################################
process_language() {
    local lang="$1"
    local updater="${LANG_UPDATERS[$lang]}"
    local tester="${LANG_TESTERS[$lang]}"
    local auditor="${LANG_AUDITORS[$lang]}"
    local changelog="${LANG_CHANGELOGS[$lang]}"
    
    log "📦 Updating ${lang}..."
    
    # Update
    "$updater" "log" "error" || warning "⚠️ ${lang} update failed"
    
    # Test (if enabled)
    [[ "${RUN_TESTS}" == "true" ]] && { "$tester" "log" || warning "⚠️ ${lang} tests failed"; }
    
    # Audit (if enabled)
    [[ "${RUN_SECURITY_AUDIT}" == "true" ]] && { "$auditor" "log" || warning "⚠️ ${lang} audit issues"; }
    
    # Changelog
    "$changelog" >> "${CHANGELOG_FILE}.${lang}" 2>/dev/null || true
}

update_all() {
    log "🚀 Starting updates (parallel=${PARALLEL_EXECUTION}, tests=${RUN_TESTS}, audit=${RUN_SECURITY_AUDIT})"
    
    # Find projects to update
    local updates=()
    for lang in nodejs python docker java; do
        is_language_enabled "$lang" && detect_language "$lang" && updates+=("$lang")
    done
    
    [[ ${#updates[@]} -eq 0 ]] && { warning "⚠️ Nothing to update"; return 0; }
    
    log "📊 Updating: ${updates[*]}"
    
    # Create changelog
    {
        echo "# Dependency Updates - $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
    } > "${CHANGELOG_FILE}"
    
    local failed=()
    
    if [[ "${PARALLEL_EXECUTION}" == "true" ]]; then
        # Parallel execution
        local pids=() names=()
        
        for lang in "${updates[@]}"; do
            (process_language "$lang") &
            pids+=($!)
            names+=("$lang")
        done
        
        log "⏳ Waiting for updates..."
        for i in "${!pids[@]}"; do
            if wait "${pids[$i]}"; then
                success "  ✅ ${names[$i]} done"
            else
                warning "  ⚠️ ${names[$i]} failed"
                failed+=("${names[$i]}")
            fi
        done
    else
        # Sequential execution
        for lang in "${updates[@]}"; do
            if process_language "$lang"; then
                success "  ✅ ${lang} done"
            else
                warning "  ⚠️ ${lang} failed"
                failed+=("$lang")
            fi
        done
    fi
    
    # Merge changelogs
    for lang in "${updates[@]}"; do
        [[ -f "${CHANGELOG_FILE}.${lang}" ]] && {
            cat "${CHANGELOG_FILE}.${lang}" >> "${CHANGELOG_FILE}"
            rm -f "${CHANGELOG_FILE}.${lang}"
        }
    done
    
    # Add summary
    {
        echo ""
        echo "---"
        echo "**Summary:** ${#updates[@]} updated, ${#failed[@]} failed"
        echo "**Time:** $(date)"
    } >> "${CHANGELOG_FILE}"
    
    # Generate reports
    [[ "${GENERATE_REPORTS}" == "true" ]] && {
        mkdir -p "${REPORT_OUTPUT_DIR}"
        type generate_all_reports &>/dev/null && generate_all_reports "log" "${REPORT_OUTPUT_DIR}"
    }
    
    success "✅ Updates complete"
}

################################################################################
# Git Operations
################################################################################
create_backup() {
    command_exists git || return 1
    local backup="backup/$(git_current_branch)-$(date +%Y%m%d-%H%M%S)"
    git branch "$backup" 2>/dev/null && log "🔒 Backup: $backup" || true
}

git_commit_and_push() {
    log "📝 Git operations..."
    
    command_exists git || { error "Git not installed"; return 1; }
    [[ "${AUTO_COMMIT}" != "true" ]] && { log "ℹ️ Auto-commit disabled"; return 0; }
    
    git_has_changes || { log "ℹ️ No changes"; return 0; }
    
    local branch="${GIT_BRANCH_PREFIX}-$(date +%s)"
    
    log "🌿 Branch: ${branch}"
    git checkout -b "${branch}" 2>/dev/null || git checkout "${branch}" 2>/dev/null || true
    
    git add -A
    git commit -m "${GIT_COMMIT_MESSAGE}" || { warning "⚠️ Nothing to commit"; return 0; }
    
    if [[ "${PUSH_TO_REMOTE}" == "true" ]]; then
        log "🚀 Pushing..."
        git push -u origin "${branch}" || warning "⚠️ Push failed"
    fi
}

create_pull_request() {
    command_exists gh || { warning "⚠️ GitHub CLI not installed"; return 1; }
    gh auth status &>/dev/null || { warning "⚠️ Not authenticated"; return 1; }
    
    local branch="${GIT_BRANCH_PREFIX}-$(date +%s)"
    local title="${GIT_COMMIT_MESSAGE}"
    local body="## 📦 Dependency Update

### Changes
$(cat "${CHANGELOG_FILE}" 2>/dev/null || echo "See commits")

---
*Generated by Dep-Sync*"
    
    log "🔗 Creating PR..."
    
    local url
    url=$(gh pr create --title "$title" --body "$body" --base main --head "$branch" --label "dependencies" 2>&1) && {
        success "✅ PR created: $url"
        [[ -n "${DEFAULT_REVIEWERS:-}" ]] && gh pr edit --add-reviewer "${DEFAULT_REVIEWERS}" 2>/dev/null || true
    } || warning "⚠️ PR creation failed"
}

################################################################################
# Main
################################################################################
main() {
    echo ""
    log "╔══════════════════════════════════════════════════════════════╗"
    log "║                    Dep-Sync v2.0                             ║"
    log "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Initialize
    load_config
    load_all_modules
    echo ""
    
    # Detect
    detect_projects || { error "No projects found"; return 1; }
    echo ""
    
    # Backup
    [[ "${CREATE_BACKUP_BRANCH}" == "true" ]] && create_backup
    
    # Update
    update_all || { error "Update failed"; return 1; }
    echo ""
    
    # Git
    git_commit_and_push
    [[ "${CREATE_PULL_REQUEST}" == "true" && "${PUSH_TO_REMOTE}" == "true" ]] && create_pull_request
    
    echo ""
    success "╔══════════════════════════════════════════════════════════════╗"
    success "║                    ✅ Complete!                              ║"
    success "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    log "📋 Log: ${LOG_FILE}"
    log "📝 Changelog: ${CHANGELOG_FILE}"
}

main "$@"
