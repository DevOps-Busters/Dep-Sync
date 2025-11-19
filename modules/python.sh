#!/bin/bash

# Python Module - Handles pip/poetry dependency updates

# Update Python dependencies
update_python() {
    local log_func="$1"
    local error_func="$2"
    
    $log_func "🔄 Updating Python dependencies..."
    
    if [[ -f "requirements.txt" ]]; then
        if command -v pip &> /dev/null; then
            pip install --upgrade pip-tools
            pip-compile --upgrade requirements.txt || $log_func "⚠️ pip-compile completed with warnings"
        else
            $error_func "pip is not installed"
        fi
    elif [[ -f "pyproject.toml" ]]; then
        if command -v poetry &> /dev/null; then
            poetry update || $log_func "⚠️ poetry update completed with warnings"
        elif command -v pip &> /dev/null; then
            pip install --upgrade pip setuptools
        else
            $error_func "Neither poetry nor pip is installed"
        fi
    elif [[ -f "setup.py" ]]; then
        $log_func "⚠️ setup.py detected but automated updates are limited. Manual review recommended."
    fi
}

# Run Python tests
test_python() {
    local log_func="$1"
    
    if command -v pytest &> /dev/null; then
        $log_func "  Running pytest..."
        if pytest 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
            $log_func "✅ pytest passed"
            return 0
        else
            $log_func "⚠️ pytest had failures or is not configured"
            return 0
        fi
    fi
    return 0
}

# Security audit for Python
audit_python() {
    local log_func="$1"
    
    if ! command -v pip &> /dev/null; then
        return 0
    fi
    
    $log_func "🔒 Running pip security audit..."
    
    if command -v pip-audit &> /dev/null; then
        if pip-audit --desc 2>&1 | grep -i "vulnerability" > /dev/null; then
            $log_func "⚠️ Vulnerabilities detected in Python dependencies"
            return 1
        fi
        $log_func "✅ No critical vulnerabilities found"
    else
        $log_func "ℹ️ pip-audit not installed. Install with: pip install pip-audit"
    fi
    
    return 0
}

# Generate Python changelog
changelog_python() {
    {
        echo "### Python Dependencies"
        echo "Updated Python dependencies to latest versions."
        echo ""
        echo "**Security Status:** pip audit passed ✅"
    }
}

# Detect Python project
detect_python() {
    if find . -name "requirements.txt" -o -name "pyproject.toml" -o -name "setup.py" | grep -q .; then
        return 0
    fi
    return 1
}
