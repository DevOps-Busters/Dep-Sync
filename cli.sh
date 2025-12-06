#!/bin/bash
################################################################################
# Dep-Sync - Interactive CLI
# Menu-driven interface for dependency management
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SCRIPT_DIR

source "${SCRIPT_DIR}/lib/common.sh"

################################################################################
# Menu Display
################################################################################
show_menu() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              Dep-Sync - Interactive CLI v2.0                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "  1) Run full update"
    echo "  2) Select languages to update"
    echo "  3) Dry-run (preview)"
    echo "  4) View configuration"
    echo "  5) Edit configuration"
    echo "  6) Security audit only"
    echo "  7) Generate reports"
    echo "  8) Check tools"
    echo "  9) Exit"
    echo ""
}

################################################################################
# Option 1: Full Update
################################################################################
run_full_update() {
    clear
    log "🚀 Running full update..."
    echo ""
    bash "${SCRIPT_DIR}/dependency-updater-main.sh"
    echo ""
    read -p "Press Enter to continue..."
}

################################################################################
# Option 2: Selective Update (Bug 3 & Bug 4 fixes)
################################################################################
run_selective_update() {
    clear
    echo -e "${CYAN}═══ Select Languages ═══${NC}"
    echo ""
    
    local -A selected=([nodejs]=0 [python]=0 [docker]=0 [java]=0)
    local -A names=([nodejs]="Node.js" [python]="Python" [docker]="Docker" [java]="Java")
    
    for lang in nodejs python docker java; do
        if detect_language "$lang"; then
            echo -e "  ${GREEN}●${NC} ${names[$lang]} detected"
            read -p "     Update? (y/n): " -n 1 ans; echo ""
            [[ "$ans" =~ [yY] ]] && selected[$lang]=1
        else
            echo -e "  ${YELLOW}○${NC} ${names[$lang]} not found"
        fi
    done
    
    echo ""
    echo "Selected:"
    local any=false
    for lang in nodejs python docker java; do
        [[ ${selected[$lang]} -eq 1 ]] && { echo "  ✅ ${names[$lang]}"; any=true; }
    done
    
    [[ "$any" == "false" ]] && { echo "  (none)"; read -p "Press Enter..."; return; }
    
    echo ""
    read -p "Proceed? (y/n): " -n 1 confirm; echo ""
    [[ ! "$confirm" =~ [yY] ]] && return
    
    echo ""
    log "🚀 Updating selected languages..."
    log "   Tests: ${RUN_TESTS}, Audit: ${RUN_SECURITY_AUDIT}"
    echo ""
    
    # Initialize changelog for selective update
    local changelog_file="${SCRIPT_DIR}/CHANGELOG-selective.md"
    {
        echo "# Selective Dependency Update - $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
    } > "$changelog_file"
    
    for lang in nodejs python docker java; do
        [[ ${selected[$lang]} -eq 1 ]] && {
            log "📦 ${names[$lang]}..."
            
            # Bug 3 & 4 fix: Use case statement like main orchestrator
            # This ensures tests and changelogs are properly handled
            case "$lang" in
                nodejs)
                    update_nodejs "log" "error" || warning "⚠️ nodejs update failed"
                    # Bug 3 fix: Respect RUN_TESTS config
                    [[ "${RUN_TESTS}" == "true" ]] && { test_nodejs "log" || warning "⚠️ nodejs tests failed"; }
                    [[ "${RUN_SECURITY_AUDIT}" == "true" ]] && { audit_nodejs "log" || warning "⚠️ nodejs audit issues"; }
                    # Bug 4 fix: Generate changelog
                    changelog_nodejs >> "$changelog_file" 2>/dev/null || true
                    ;;
                python)
                    update_python "log" "error" || warning "⚠️ python update failed"
                    [[ "${RUN_TESTS}" == "true" ]] && { test_python "log" || warning "⚠️ python tests failed"; }
                    [[ "${RUN_SECURITY_AUDIT}" == "true" ]] && { audit_python "log" || warning "⚠️ python audit issues"; }
                    changelog_python >> "$changelog_file" 2>/dev/null || true
                    ;;
                docker)
                    update_docker "log" "error" || warning "⚠️ docker update failed"
                    [[ "${RUN_TESTS}" == "true" ]] && { test_docker "log" || warning "⚠️ docker tests failed"; }
                    [[ "${RUN_SECURITY_AUDIT}" == "true" ]] && { audit_docker "log" || warning "⚠️ docker audit issues"; }
                    changelog_docker >> "$changelog_file" 2>/dev/null || true
                    ;;
                java)
                    update_java "log" "error" || warning "⚠️ java update failed"
                    [[ "${RUN_TESTS}" == "true" ]] && { test_java "log" || warning "⚠️ java tests failed"; }
                    [[ "${RUN_SECURITY_AUDIT}" == "true" ]] && { audit_java "log" || warning "⚠️ java audit issues"; }
                    changelog_java >> "$changelog_file" 2>/dev/null || true
                    ;;
            esac
            
            success "  ✅ ${names[$lang]} done"
        }
    done
    
    # Add summary to changelog
    {
        echo ""
        echo "---"
        echo "**Time:** $(date)"
    } >> "$changelog_file"
    
    echo ""
    success "✅ Complete!"
    log "📝 Changelog: $changelog_file"
    read -p "Press Enter..."
}

################################################################################
# Option 3: Dry Run
################################################################################
run_dry_run() {
    clear
    echo -e "${CYAN}═══ Dry Run Preview ═══${NC}"
    echo ""
    
    local found=0
    local -A info=([nodejs]="ncu -u && npm install" [python]="pip-compile --upgrade" [docker]="Check base images" [java]="mvn versions:*")
    
    for lang in nodejs python docker java; do
        if detect_language "$lang"; then
            echo -e "  ${GREEN}📦 ${lang^}${NC}"
            echo "     Would run: ${info[$lang]}"
            [[ "${RUN_TESTS}" == "true" ]] && echo "     Would test: yes"
            [[ "${RUN_SECURITY_AUDIT}" == "true" ]] && echo "     Would audit: yes"
            echo ""
            ((found++))
        fi
    done
    
    [[ $found -eq 0 ]] && warning "⚠️ No projects found"
    [[ $found -gt 0 ]] && success "✅ ${found} project(s) would be updated"
    
    echo ""
    read -p "Press Enter..."
}

################################################################################
# Option 4/5: Configuration
################################################################################
view_config() {
    clear
    echo -e "${CYAN}═══ Configuration ═══${NC}"
    echo ""
    
    local cfg="${SCRIPT_DIR}/.depsync.config"
    [[ ! -f "$cfg" ]] && cfg="${HOME}/.depsync.config"
    
    if [[ -f "$cfg" ]]; then
        echo "File: $cfg"
        echo "─────────────────────────"
        cat "$cfg"
    else
        echo "No config file found."
        echo "Copy: .github/templates/config.example → ~/.depsync.config"
    fi
    
    echo ""
    read -p "Press Enter..."
}

edit_config() {
    local cfg="${HOME}/.depsync.config"
    local tpl="${SCRIPT_DIR}/.github/templates/config.example"
    
    [[ ! -f "$cfg" && -f "$tpl" ]] && cp "$tpl" "$cfg"
    ${EDITOR:-nano} "$cfg"
}

################################################################################
# Option 6: Security Audit
################################################################################
run_audit() {
    clear
    echo -e "${CYAN}═══ Security Audit ═══${NC}"
    echo ""
    
    local report="${SCRIPT_DIR}/security-audit.txt"
    echo "Security Audit - $(date)" > "$report"
    echo "========================" >> "$report"
    
    local issues=0
    for lang in nodejs python docker java; do
        if detect_language "$lang"; then
            echo "🔍 Auditing ${lang}..." | tee -a "$report"
            
            # Use case statement for consistency
            case "$lang" in
                nodejs) audit_nodejs "log" 2>&1 | tee -a "$report" || ((issues++)) ;;
                python) audit_python "log" 2>&1 | tee -a "$report" || ((issues++)) ;;
                docker) audit_docker "log" 2>&1 | tee -a "$report" || ((issues++)) ;;
                java) audit_java "log" 2>&1 | tee -a "$report" || ((issues++)) ;;
            esac
            
            echo "" | tee -a "$report"
        fi
    done
    
    echo "─────────────────────────"
    [[ $issues -gt 0 ]] && warning "⚠️ Issues in ${issues} language(s)" || success "✅ No critical issues"
    log "📋 Report: $report"
    
    echo ""
    read -p "Press Enter..."
}

################################################################################
# Option 7: Reports
################################################################################
run_reports() {
    clear
    echo -e "${CYAN}═══ Generate Reports ═══${NC}"
    echo ""
    
    read -p "Output directory [./reports]: " dir
    dir="${dir:-./reports}"
    mkdir -p "$dir"
    
    log "📊 Generating reports..."
    
    type generate_json_report &>/dev/null && generate_json_report "${dir}/deps.json" "log"
    type generate_csv_report &>/dev/null && generate_csv_report "${dir}/deps.csv" "log"
    type generate_markdown_report &>/dev/null && generate_markdown_report "${dir}/deps.md" "log"
    type generate_sbom_report &>/dev/null && generate_sbom_report "${dir}/sbom.json" "log"
    
    echo ""
    success "✅ Reports generated in: $dir"
    ls -la "$dir" 2>/dev/null | tail -n +2
    
    echo ""
    read -p "Press Enter..."
}

################################################################################
# Option 8: Check Tools
################################################################################
check_tools() {
    clear
    echo -e "${CYAN}═══ Installed Tools ═══${NC}"
    echo ""
    
    local tools=(
        "git:git --version"
        "jq:jq --version"
        "gh:gh --version"
        "node:node --version"
        "npm:npm --version"
        "ncu:ncu --version"
        "python3:python3 --version"
        "pip:pip --version"
        "pip-audit:pip-audit --version"
        "docker:docker --version"
        "java:java -version"
        "mvn:mvn --version"
        "trivy:trivy --version"
    )
    
    for item in "${tools[@]}"; do
        local cmd="${item%%:*}"
        if command_exists "$cmd"; then
            echo -e "  ${GREEN}✅${NC} $cmd"
        else
            echo -e "  ${YELLOW}○${NC} $cmd (not found)"
        fi
    done
    
    echo ""
    read -p "Press Enter..."
}

################################################################################
# Main Loop
################################################################################
main() {
    load_config
    load_all_modules
    
    while true; do
        show_menu
        read -p "Option (1-9): " opt
        
        case $opt in
            1) run_full_update ;;
            2) run_selective_update ;;
            3) run_dry_run ;;
            4) view_config ;;
            5) edit_config ;;
            6) run_audit ;;
            7) run_reports ;;
            8) check_tools ;;
            9) echo ""; log "👋 Bye!"; exit 0 ;;
            *) error "Invalid option"; sleep 1 ;;
        esac
    done
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"
