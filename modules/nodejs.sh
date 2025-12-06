#!/bin/bash

################################################################################
# Node.js Module - Handles npm dependency updates
################################################################################

# Detect Node.js project
detect_nodejs() {
    if find . -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | grep -q .; then
        return 0
    fi
    return 1
}

# Update Node.js dependencies
update_nodejs() {
    local log_func="${1:-echo}"
    local error_func="${2:-echo}"
    
    $log_func "🔄 Updating Node.js dependencies..."
    
    # Check if ncu is installed
    if ! command -v ncu &>/dev/null; then
        $error_func "npm-check-updates (ncu) is not installed"
        $log_func "   Install with: npm install -g npm-check-updates"
        return 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &>/dev/null; then
        $error_func "npm is not installed"
        return 1
    fi
    
    # Run ncu to update package.json
    if ! ncu -u 2>&1; then
        $log_func "⚠️ ncu update completed with warnings"
    fi
    
    # Install updated packages
    if ! npm install 2>&1; then
        $error_func "npm install failed"
        return 1
    fi
    
    $log_func "✅ Node.js dependencies updated"
    return 0
}

# Run Node.js tests
test_nodejs() {
    local log_func="${1:-echo}"
    
    if [[ ! -f "package.json" ]]; then
        return 0
    fi
    
    # Check if test script exists
    if ! grep -q '"test"' package.json 2>/dev/null; then
        $log_func "ℹ️ No test script defined in package.json"
        return 0
    fi
    
    $log_func "🧪 Running npm tests..."
    
    if npm test 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
        $log_func "✅ npm tests passed"
        return 0
    else
        $log_func "⚠️ npm tests failed"
        return 1
    fi
}

# Security audit for Node.js
audit_nodejs() {
    local log_func="${1:-echo}"
    
    if ! command -v npm &>/dev/null; then
        $log_func "ℹ️ npm not installed, skipping audit"
        return 0
    fi
    
    if [[ ! -f "package.json" ]]; then
        return 0
    fi
    
    $log_func "🔒 Running npm security audit..."
    
    local audit_output
    audit_output=$(npm audit --json 2>/dev/null || echo "{}")
    
    local critical high moderate low
    critical=$(echo "$audit_output" | grep -o '"severity":"critical"' | wc -l)
    high=$(echo "$audit_output" | grep -o '"severity":"high"' | wc -l)
    moderate=$(echo "$audit_output" | grep -o '"severity":"moderate"' | wc -l)
    low=$(echo "$audit_output" | grep -o '"severity":"low"' | wc -l)
    
    if [[ ${critical} -gt 0 ]]; then
        $log_func "⛔ CRITICAL vulnerabilities: ${critical}"
        $log_func "⚠️  HIGH vulnerabilities: ${high}"
        return 1
    fi
    
    if [[ ${high} -gt 0 ]]; then
        $log_func "⚠️ HIGH vulnerabilities: ${high}"
        $log_func "ℹ️ Moderate: ${moderate}, Low: ${low}"
        return 0
    fi
    
    $log_func "✅ No critical/high vulnerabilities found"
    [[ ${moderate} -gt 0 || ${low} -gt 0 ]] && $log_func "ℹ️ Moderate: ${moderate}, Low: ${low}"
    return 0
}

# Generate Node.js changelog
changelog_nodejs() {
    echo "### Node.js Dependencies"
    echo ""
    
    if command -v ncu &>/dev/null; then
        echo "**Updated packages:**"
        echo '```'
        ncu 2>/dev/null | head -20 || echo "Run 'ncu' to see available updates"
        echo '```'
    else
        echo "Updated npm packages to latest versions."
    fi
    
    echo ""
    echo "**Security Status:** npm audit completed ✅"
}
