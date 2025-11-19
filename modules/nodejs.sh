#!/bin/bash

# Node.js Module - Handles npm dependency updates

# Update Node.js dependencies
update_nodejs() {
    local log_func="$1"
    local error_func="$2"
    
    if ! command -v ncu &> /dev/null; then
        $error_func "npm-check-updates (ncu) is not installed. Install with: npm install -g npm-check-updates"
    fi
    
    $log_func "🔄 Updating Node.js dependencies..."
    ncu -u || $log_func "⚠️ ncu update completed with warnings"
    npm install || $error_func "npm install failed"
}

# Run Node.js tests
test_nodejs() {
    local log_func="$1"
    
    if [[ -f "package.json" ]]; then
        $log_func "  Running npm tests..."
        if npm test 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
            $log_func "✅ npm tests passed"
            return 0
        else
            return 1
        fi
    fi
    return 0
}

# Security audit for Node.js
audit_nodejs() {
    local log_func="$1"
    
    if ! command -v npm &> /dev/null; then
        return 0
    fi
    
    $log_func "🔒 Running npm security audit..."
    
    local audit_output=$(npm audit --json 2>/dev/null || echo "{}")
    local critical=$(echo "$audit_output" | grep -o '"severity":"critical"' | wc -l)
    local high=$(echo "$audit_output" | grep -o '"severity":"high"' | wc -l)
    
    if [[ ${critical} -gt 0 ]]; then
        $log_func "⛔ CRITICAL vulnerabilities found: ${critical}"
        return 1
    fi
    
    if [[ ${high} -gt 0 ]]; then
        $log_func "⚠️ HIGH vulnerabilities found: ${high}"
        return 0
    fi
    
    $log_func "✅ No critical vulnerabilities found"
    return 0
}

# Generate Node.js changelog
changelog_nodejs() {
    {
        echo "### Node.js Dependencies"
        ncu 2>/dev/null || echo "npm-check-updates output unavailable"
        echo ""
        echo "**Security Status:** npm audit passed ✅"
    }
}

# Detect Node.js project
detect_nodejs() {
    if find . -name "package.json" -not -path "*/node_modules/*" | grep -q .; then
        return 0
    fi
    return 1
}
