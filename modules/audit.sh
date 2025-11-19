#!/bin/bash

# Shared utilities for all modules

# Run security audit for Node.js
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

# Run security audit for Python
audit_python() {
    local log_func="$1"
    
    if ! command -v pip &> /dev/null; then
        return 0
    fi
    
    $log_func "🔒 Running pip security audit..."
    
    if command -v pip-audit &> /dev/null; then
        local audit_output=$(pip-audit 2>&1 || true)
        if echo "$audit_output" | grep -i "critical\|vulnerability" > /dev/null; then
            $log_func "⚠️ Vulnerabilities detected in Python dependencies"
            echo "$audit_output" | tee -a "${LOG_FILE:-/dev/null}"
            return 1
        fi
        $log_func "✅ No critical vulnerabilities found"
    else
        $log_func "ℹ️ pip-audit not installed. Install with: pip install pip-audit"
    fi
    
    return 0
}

# Run security audit for Rust
audit_rust() {
    local log_func="$1"
    
    if ! command -v cargo &> /dev/null; then
        return 0
    fi
    
    $log_func "🔒 Running cargo security audit..."
    
    if cargo audit --json 2>&1 | grep -q "\"vulnerabilities\""; then
        $log_func "⚠️ Security vulnerabilities detected in Rust dependencies"
        cargo audit || true
        return 1
    fi
    
    $log_func "✅ No vulnerabilities found"
    return 0
}

# Run security audit for Java
audit_java() {
    local log_func="$1"
    
    if [[ -f "pom.xml" ]]; then
        $log_func "🔒 Running Maven dependency check..."
        if command -v mvn &> /dev/null; then
            mvn dependency-check:check 2>&1 | tail -20 | tee -a "${LOG_FILE:-/dev/null}" || true
        fi
    elif [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        $log_func "🔒 Running Gradle dependency check..."
        if [[ -x "gradlew" ]]; then
            ./gradlew dependencyCheckAnalyze 2>&1 | tail -20 | tee -a "${LOG_FILE:-/dev/null}" || true
        fi
    fi
    
    return 0
}

# Run security audit for Go
audit_go() {
    local log_func="$1"
    
    if ! command -v go &> /dev/null; then
        return 0
    fi
    
    $log_func "🔒 Running Go security check..."
    
    if command -v govulncheck &> /dev/null; then
        govulncheck ./... 2>&1 | tee -a "${LOG_FILE:-/dev/null}" || true
    else
        $log_func "ℹ️ govulncheck not installed. Install with: go install golang.org/x/vuln/cmd/govulncheck@latest"
    fi
    
    return 0
}

# Run security audit for Docker
audit_docker() {
    local log_func="$1"
    
    $log_func "🔒 Checking Docker image vulnerabilities..."
    
    if command -v trivy &> /dev/null; then
        while IFS= read -r line; do
            if [[ "$line" =~ ^FROM ]]; then
                local image=$(echo "$line" | awk '{print $2}')
                $log_func "  Scanning image: $image"
                trivy image --severity HIGH,CRITICAL "$image" 2>&1 | tail -10 || true
            fi
        done < Dockerfile
    else
        $log_func "ℹ️ Trivy not installed. Install from: https://github.com/aquasecurity/trivy"
    fi
    
    return 0
}
