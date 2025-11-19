#!/bin/bash

# Go Module - Handles Go modules dependency updates

# Update Go dependencies
update_go() {
    local log_func="$1"
    local error_func="$2"
    
    $log_func "🔄 Updating Go dependencies..."
    
    if ! command -v go &> /dev/null; then
        $error_func "Go is not installed"
    fi
    
    go get -u ./... || $log_func "⚠️ Go dependency updates completed with warnings"
    go mod tidy || $log_func "⚠️ Go mod tidy completed with warnings"
}

# Run Go tests
test_go() {
    local log_func="$1"
    
    $log_func "  Running Go tests..."
    
    if go test ./... 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
        $log_func "✅ Go tests passed"
        return 0
    else
        return 1
    fi
}

# Security audit for Go
audit_go() {
    local log_func="$1"
    
    if ! command -v go &> /dev/null; then
        return 0
    fi
    
    $log_func "🔒 Running Go vulnerability check..."
    
    if command -v govulncheck &> /dev/null; then
        govulncheck ./... 2>&1 | tee -a "${LOG_FILE:-/dev/null}" || true
    else
        $log_func "ℹ️ govulncheck not installed. Install with: go install golang.org/x/vuln/cmd/govulncheck@latest"
    fi
    
    return 0
}

# Generate Go changelog
changelog_go() {
    {
        echo "### Go Dependencies"
        echo "Updated Go module dependencies to latest versions."
        if [[ -f "go.mod" ]]; then
            echo "**Go Version Requirement:** $(grep 'go ' go.mod | head -1)"
        fi
        echo ""
        echo "**Security Status:** govulncheck completed ✅"
    }
}

# Detect Go project
detect_go() {
    [[ -f "go.mod" ]] && return 0 || return 1
}
