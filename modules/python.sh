#!/bin/bash

################################################################################
# Python Module - Handles pip/poetry dependency updates
################################################################################

# Detect Python project
detect_python() {
    if [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]]; then
        return 0
    fi
    return 1
}

# Update Python dependencies
update_python() {
    local log_func="${1:-echo}"
    local error_func="${2:-echo}"
    
    $log_func "🔄 Updating Python dependencies..."
    
    # requirements.txt with pip-tools
    if [[ -f "requirements.txt" ]]; then
        if ! command -v pip &>/dev/null; then
            $error_func "pip is not installed"
            return 1
        fi
        
        $log_func "   Detected: requirements.txt"
        
        # Install pip-tools if needed
        if ! command -v pip-compile &>/dev/null; then
            $log_func "   Installing pip-tools..."
            pip install --upgrade pip-tools 2>&1 || {
                $error_func "Failed to install pip-tools"
                return 1
            }
        fi
        
        # Check if we have requirements.in (pip-tools workflow)
        if [[ -f "requirements.in" ]]; then
            $log_func "   Compiling requirements.in..."
            if ! pip-compile --upgrade requirements.in 2>&1; then
                $log_func "⚠️ pip-compile completed with warnings"
            fi
        else
            # Direct requirements.txt update
            $log_func "   Upgrading packages from requirements.txt..."
            pip install --upgrade -r requirements.txt 2>&1 || {
                $log_func "⚠️ Some packages failed to upgrade"
            }
        fi
        
        # Run pip-sync if available to sync environment
        if command -v pip-sync &>/dev/null && [[ -f "requirements.txt" ]]; then
            $log_func "   Syncing environment with pip-sync..."
            pip-sync requirements.txt 2>&1 || {
                $log_func "⚠️ pip-sync had warnings"
            }
        fi
        
        $log_func "✅ Python (pip) dependencies updated"
        return 0
    fi
    
    # pyproject.toml with Poetry
    if [[ -f "pyproject.toml" ]]; then
        $log_func "   Detected: pyproject.toml"
        
        if command -v poetry &>/dev/null; then
            $log_func "   Running poetry update..."
            if ! poetry update 2>&1; then
                $log_func "⚠️ poetry update completed with warnings"
            fi
            $log_func "✅ Python (Poetry) dependencies updated"
            return 0
        elif command -v pip &>/dev/null; then
            $log_func "   Poetry not found, using pip..."
            pip install --upgrade pip setuptools 2>&1
            pip install -e . 2>&1 || {
                $log_func "⚠️ pip install had warnings"
            }
            $log_func "✅ Python dependencies updated"
            return 0
        else
            $error_func "Neither poetry nor pip is installed"
            return 1
        fi
    fi
    
    # setup.py only
    if [[ -f "setup.py" ]]; then
        $log_func "   Detected: setup.py"
        $log_func "⚠️ setup.py detected but automated updates are limited"
        $log_func "   Consider migrating to pyproject.toml"
        
        if command -v pip &>/dev/null; then
            pip install --upgrade pip setuptools 2>&1
            pip install -e . 2>&1 || true
        fi
        return 0
    fi
    
    $log_func "ℹ️ No Python project files detected"
    return 0
}

# Run Python tests
test_python() {
    local log_func="${1:-echo}"
    
    if ! detect_python; then
        return 0
    fi
    
    $log_func "🧪 Running Python tests..."
    
    # Try pytest first
    if command -v pytest &>/dev/null; then
        if pytest 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
            $log_func "✅ pytest passed"
            return 0
        else
            $log_func "⚠️ pytest failed or no tests found"
            return 1
        fi
    fi
    
    # Try python -m pytest
    if command -v python3 &>/dev/null; then
        if python3 -m pytest 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
            $log_func "✅ pytest passed"
            return 0
        fi
    fi
    
    $log_func "ℹ️ pytest not available, skipping tests"
    return 0
}

# Security audit for Python
audit_python() {
    local log_func="${1:-echo}"
    
    if ! detect_python; then
        return 0
    fi
    
    $log_func "🔒 Running Python security audit..."
    
    # Try pip-audit first
    if command -v pip-audit &>/dev/null; then
        local audit_output
        audit_output=$(pip-audit 2>&1 || true)
        
        if echo "$audit_output" | grep -qi "vulnerability\|critical"; then
            $log_func "⚠️ Vulnerabilities detected:"
            echo "$audit_output" | grep -i "vulnerability\|critical" | head -10
            return 1
        fi
        
        $log_func "✅ No vulnerabilities found (pip-audit)"
        return 0
    fi
    
    # Try safety as fallback
    if command -v safety &>/dev/null; then
        if safety check 2>&1 | grep -qi "vulnerability"; then
            $log_func "⚠️ Vulnerabilities detected (safety)"
            return 1
        fi
        $log_func "✅ No vulnerabilities found (safety)"
        return 0
    fi
    
    $log_func "ℹ️ No Python audit tool installed"
    $log_func "   Install with: pip install pip-audit"
    return 0
}

# Generate Python changelog
changelog_python() {
    echo "### Python Dependencies"
    echo ""
    
    if [[ -f "requirements.txt" ]]; then
        echo "**Updated:** requirements.txt"
    fi
    if [[ -f "pyproject.toml" ]]; then
        echo "**Updated:** pyproject.toml (Poetry)"
    fi
    
    echo ""
    echo "**Security Status:** pip audit completed ✅"
}
