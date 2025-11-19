#!/bin/bash

# Interactive CLI for Dependency Updater
# Provides menu-driven interface with options for selective updates

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the main orchestrator to get logging functions
source "${SCRIPT_DIR}/dependency-updater-main.sh" 2>/dev/null || {
    echo "Error: Cannot find main orchestrator script"
    exit 1
}

################################################################################
# Interactive Menu System
################################################################################

show_main_menu() {
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║        Dependency Updater - Interactive CLI (v1.0)             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Select an option:"
    echo ""
    echo "  1) Run full update (all languages)"
    echo "  2) Select languages to update"
    echo "  3) Run in DRY-RUN mode (preview changes)"
    echo "  4) View configuration"
    echo "  5) Update configuration"
    echo "  6) Security audit only (no updates)"
    echo "  7) Generate dependency report"
    echo "  8) Exit"
    echo ""
}

show_language_menu() {
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║            Select Languages to Update                          ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Press space to select/deselect, Enter to confirm:"
    echo ""
    
    # Simple checkbox selection
    local nodejs_selected=0
    local python_selected=0
    local docker_selected=0
    local java_selected=0
    local go_selected=0
    local rust_selected=0
    
    echo ""
    read -p "Update Node.js? (y/n): " -n 1 ans; echo ""
    [[ "$ans" == "y" ]] && nodejs_selected=1
    
    read -p "Update Python? (y/n): " -n 1 ans; echo ""
    [[ "$ans" == "y" ]] && python_selected=1
    
    read -p "Update Docker? (y/n): " -n 1 ans; echo ""
    [[ "$ans" == "y" ]] && docker_selected=1
    
    read -p "Update Java? (y/n): " -n 1 ans; echo ""
    [[ "$ans" == "y" ]] && java_selected=1
    
    read -p "Update Go? (y/n): " -n 1 ans; echo ""
    [[ "$ans" == "y" ]] && go_selected=1
    
    read -p "Update Rust? (y/n): " -n 1 ans; echo ""
    [[ "$ans" == "y" ]] && rust_selected=1
    
    echo ""
    echo "Selected languages:"
    [[ $nodejs_selected -eq 1 ]] && echo "  ✅ Node.js"
    [[ $python_selected -eq 1 ]] && echo "  ✅ Python"
    [[ $docker_selected -eq 1 ]] && echo "  ✅ Docker"
    [[ $java_selected -eq 1 ]] && echo "  ✅ Java"
    [[ $go_selected -eq 1 ]] && echo "  ✅ Go"
    [[ $rust_selected -eq 1 ]] && echo "  ✅ Rust"
    
    echo ""
    read -p "Proceed? (y/n): " -n 1 ans; echo ""
    if [[ "$ans" == "y" ]]; then
        SELECTED_LANGUAGES="nodejs:$nodejs_selected python:$python_selected docker:$docker_selected java:$java_selected go:$go_selected rust:$rust_selected"
        return 0
    else
        return 1
    fi
}

run_dry_run() {
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    DRY-RUN MODE (Preview)                      ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    log "🔍 Scanning project for dependencies..."
    echo ""
    
    local found_projects=0
    
    if detect_nodejs &> /dev/null; then
        echo "  📦 Node.js project detected"
        echo "     - Files: $(find . -name 'package.json' -not -path '*/node_modules/*' 2>/dev/null | wc -l)"
        echo "     - Would run: npm update && npm install"
        echo "     - Would run: npm test"
        echo "     - Would run: npm audit"
        echo ""
        ((found_projects++))
    fi
    
    if detect_python &> /dev/null; then
        echo "  📦 Python project detected"
        if [[ -f "requirements.txt" ]]; then
            echo "     - Files: requirements.txt"
            echo "     - Would run: pip-compile --upgrade"
        fi
        if [[ -f "pyproject.toml" ]]; then
            echo "     - Files: pyproject.toml"
            echo "     - Would run: poetry update"
        fi
        echo "     - Would run: pytest"
        echo "     - Would run: pip-audit"
        echo ""
        ((found_projects++))
    fi
    
    if detect_docker &> /dev/null; then
        echo "  📦 Docker project detected"
        echo "     - Files: $(find . -name 'Dockerfile' 2>/dev/null | wc -l)"
        local image_count=$(grep -c "^FROM" Dockerfile 2>/dev/null || echo 0)
        echo "     - Base images to check: $image_count"
        echo "     - Would scan with: trivy"
        echo ""
        ((found_projects++))
    fi
    
    if detect_java &> /dev/null; then
        echo "  📦 Java project detected"
        if [[ -f "pom.xml" ]]; then
            echo "     - Files: pom.xml"
            echo "     - Would run: mvn versions:use-latest-versions"
        fi
        if [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
            echo "     - Files: build.gradle"
            echo "     - Would run: ./gradlew dependencyUpdates"
        fi
        echo ""
        ((found_projects++))
    fi
    
    if detect_go &> /dev/null; then
        echo "  📦 Go project detected"
        echo "     - Files: go.mod"
        echo "     - Would run: go get -u ./... && go mod tidy"
        echo "     - Would run: go test ./..."
        echo ""
        ((found_projects++))
    fi
    
    if detect_rust &> /dev/null; then
        echo "  📦 Rust project detected"
        echo "     - Files: Cargo.toml"
        echo "     - Would run: cargo update && cargo test"
        echo "     - Would run: cargo audit"
        echo ""
        ((found_projects++))
    fi
    
    if [[ $found_projects -eq 0 ]]; then
        warning "⚠️ No supported projects detected"
    else
        success "✅ Found $found_projects projects that would be updated"
        echo ""
        echo "Git operations that would be performed:"
        echo "  1. Create branch: dependency-updates-$(date +%s)"
        echo "  2. Commit changes with message: 'chore: update dependencies'"
        echo "  3. Create Pull Request (if GitHub Actions configured)"
    fi
    
    echo ""
    read -p "Press Enter to return to main menu..."
}

run_security_audit_only() {
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║               Security Audit (No Updates)                      ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Load modules
    source "${SCRIPT_DIR}/modules/nodejs.sh" 2>/dev/null
    source "${SCRIPT_DIR}/modules/python.sh" 2>/dev/null
    source "${SCRIPT_DIR}/modules/docker.sh" 2>/dev/null
    source "${SCRIPT_DIR}/modules/java.sh" 2>/dev/null
    source "${SCRIPT_DIR}/modules/go.sh" 2>/dev/null
    source "${SCRIPT_DIR}/modules/rust.sh" 2>/dev/null
    
    local audit_report="${SCRIPT_DIR}/security-audit-report.txt"
    {
        echo "Security Audit Report - $(date)"
        echo "====================================="
        echo ""
    } > "$audit_report"
    
    if detect_nodejs &> /dev/null; then
        echo "🔍 Auditing Node.js..." | tee -a "$audit_report"
        audit_nodejs "log" | tee -a "$audit_report"
        echo "" | tee -a "$audit_report"
    fi
    
    if detect_python &> /dev/null; then
        echo "🔍 Auditing Python..." | tee -a "$audit_report"
        audit_python "log" | tee -a "$audit_report"
        echo "" | tee -a "$audit_report"
    fi
    
    if detect_docker &> /dev/null; then
        echo "🔍 Auditing Docker..." | tee -a "$audit_report"
        audit_docker "log" | tee -a "$audit_report"
        echo "" | tee -a "$audit_report"
    fi
    
    if detect_java &> /dev/null; then
        echo "🔍 Auditing Java..." | tee -a "$audit_report"
        audit_java "log" | tee -a "$audit_report"
        echo "" | tee -a "$audit_report"
    fi
    
    if detect_go &> /dev/null; then
        echo "🔍 Auditing Go..." | tee -a "$audit_report"
        audit_go "log" | tee -a "$audit_report"
        echo "" | tee -a "$audit_report"
    fi
    
    if detect_rust &> /dev/null; then
        echo "🔍 Auditing Rust..." | tee -a "$audit_report"
        audit_rust "log" | tee -a "$audit_report"
        echo "" | tee -a "$audit_report"
    fi
    
    success "✅ Security audit complete"
    log "📋 Report saved to: $audit_report"
    echo ""
    read -p "Press Enter to return to main menu..."
}

################################################################################
# Main Interactive Loop
################################################################################

main() {
    while true; do
        show_main_menu
        read -p "Enter option (1-8): " option
        
        case $option in
            1)
                log "Running full dependency update..."
                update_all
                read -p "Press Enter to continue..."
                ;;
            2)
                if show_language_menu; then
                    log "Running selective update..."
                    # TODO: Implement selective updates
                    log "Feature coming soon!"
                fi
                read -p "Press Enter to continue..."
                ;;
            3)
                run_dry_run
                ;;
            4)
                clear
                echo "Current Configuration:"
                echo "====================="
                [[ -f "${SCRIPT_DIR}/.dependency-updater.config" ]] && cat "${SCRIPT_DIR}/.dependency-updater.config" || echo "No config file found"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            5)
                log "Opening configuration editor..."
                ${EDITOR:-nano} "${SCRIPT_DIR}/.dependency-updater.config"
                ;;
            6)
                run_security_audit_only
                ;;
            7)
                log "Generating dependency report..."
                # TODO: Implement report generation
                log "Feature coming soon!"
                read -p "Press Enter to continue..."
                ;;
            8)
                log "Exiting..."
                exit 0
                ;;
            *)
                error "Invalid option"
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Run main if not sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
