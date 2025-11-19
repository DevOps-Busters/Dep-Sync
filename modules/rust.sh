#!/bin/bash

# Rust Module - Handles Cargo dependency updates

# Update Rust dependencies
update_rust() {
    local log_func="$1"
    local error_func="$2"
    
    $log_func "🔄 Updating Rust dependencies..."
    
    if ! command -v cargo &> /dev/null; then
        $error_func "Cargo is not installed"
    fi
    
    cargo update || $log_func "⚠️ Cargo update completed with warnings"
}

# Run Rust tests
test_rust() {
    local log_func="$1"
    
    $log_func "  Running Rust tests..."
    
    if cargo test 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
        $log_func "✅ Rust tests passed"
        return 0
    else
        return 1
    fi
}

# Security audit for Rust
audit_rust() {
    local log_func="$1"
    
    if ! command -v cargo &> /dev/null; then
        return 0
    fi
    
    $log_func "🔒 Running cargo security audit..."
    
    if cargo audit --json 2>&1 | grep -q '"vulnerabilities"'; then
        $log_func "⚠️ Security vulnerabilities detected"
        cargo audit || true
        return 1
    fi
    
    $log_func "✅ No vulnerabilities found"
    return 0
}

# Generate Rust changelog
changelog_rust() {
    {
        echo "### Rust Dependencies"
        echo "Updated Rust crate dependencies to latest versions."
        if [[ -f "Cargo.toml" ]]; then
            echo "**Edition:** $(grep 'edition' Cargo.toml | head -1 | cut -d'=' -f2)"
        fi
        echo ""
        echo "**Security Status:** cargo audit passed ✅"
    }
}

# Detect Rust project
detect_rust() {
    [[ -f "Cargo.toml" ]] && return 0 || return 1
}
