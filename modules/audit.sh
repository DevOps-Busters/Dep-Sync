#!/bin/bash
################################################################################
# Security Audit Module
# Unified security auditing across all supported languages
################################################################################

AUDIT_REPORT="${SCRIPT_DIR:-$(pwd)}/security-audit-report.txt"

# Run all security audits
run_all_audits() {
    local log_func="${1:-echo}"
    
    $log_func "🔒 Running security audit..."
    
    {
        echo "Security Audit Report"
        echo "====================="
        echo "Generated: $(date)"
        echo ""
    } > "$AUDIT_REPORT"
    
    local issues=0 scanned=0
    
    for lang in nodejs python docker java; do
        if type "detect_${lang}" &>/dev/null && "detect_${lang}" &>/dev/null; then
            $log_func "🔍 Auditing ${lang}..."
            echo "## ${lang^}" >> "$AUDIT_REPORT"
            
            if type "audit_${lang}" &>/dev/null; then
                "audit_${lang}" "$log_func" >> "$AUDIT_REPORT" 2>&1 || ((issues++))
            fi
            echo "" >> "$AUDIT_REPORT"
            ((scanned++))
        fi
    done
    
    echo "Summary: $scanned scanned, $issues with issues" >> "$AUDIT_REPORT"
    
    $log_func "✅ Audit complete (${scanned} scanned, ${issues} issues)"
    $log_func "📋 Report: $AUDIT_REPORT"
    
    return $issues
}

# Check available audit tools
check_audit_tools() {
    local log_func="${1:-echo}"
    local found=0 missing=0
    
    $log_func "🔧 Checking audit tools..."
    
    local tools=(
        "npm:npm audit"
        "pip-audit:pip-audit"
        "trivy:trivy"
        "mvn:OWASP dependency-check"
    )
    
    for item in "${tools[@]}"; do
        local cmd="${item%%:*}"
        local name="${item#*:}"
        if command -v "$cmd" &>/dev/null; then
            $log_func "  ✅ $name"
            ((found++))
        else
            $log_func "  ⚠️ $name (missing)"
            ((missing++))
        fi
    done
    
    $log_func "📊 Found: $found, Missing: $missing"
    return $missing
}

# Quick security check
quick_security_check() {
    local log_func="${1:-echo}"
    local issues=false
    
    $log_func "⚡ Quick security check..."
    
    # npm
    if [[ -f "package.json" ]] && command -v npm &>/dev/null; then
        if npm audit --audit-level=critical 2>/dev/null | grep -q "critical"; then
            $log_func "  ⛔ Node.js: CRITICAL vulnerabilities"
            issues=true
        else
            $log_func "  ✅ Node.js: OK"
        fi
    fi
    
    # pip
    if [[ -f "requirements.txt" ]] && command -v pip-audit &>/dev/null; then
        if pip-audit 2>/dev/null | grep -qi "critical"; then
            $log_func "  ⛔ Python: CRITICAL vulnerabilities"
            issues=true
        else
            $log_func "  ✅ Python: OK"
        fi
    fi
    
    [[ "$issues" == "true" ]] && return 1 || return 0
}

# Generate audit summary for PRs
generate_audit_summary() {
    if [[ ! -f "$AUDIT_REPORT" ]]; then
        echo "No audit report available."
        return 1
    fi
    
    echo "### 🔒 Security Audit"
    echo ""
    grep -E "^##|✅|⚠️|⛔|Summary" "$AUDIT_REPORT" | head -15
}
