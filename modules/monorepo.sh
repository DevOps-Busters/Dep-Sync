#!/bin/bash

# Monorepo & Conflict Resolution Module

# Detect monorepo structure
detect_monorepo() {
    local log_func="${1:-echo}"
    
    if [[ -f "lerna.json" ]] || [[ -f "pnpm-workspace.yaml" ]] || [[ -f "package.json" ]]; then
        if grep -q '"workspaces"' package.json 2>/dev/null; then
            $log_func "📦 Monorepo detected (npm workspaces)"
            return 0
        fi
    fi
    
    if [[ -f "go.work" ]]; then
        $log_func "📦 Monorepo detected (Go workspaces)"
        return 0
    fi
    
    if [[ -d "packages" ]] && [[ -f "package.json" ]]; then
        $log_func "📦 Monorepo structure detected (packages directory)"
        return 0
    fi
    
    return 1
}

list_monorepo_packages() {
    local log_func="${1:-echo}"
    
    local packages=()
    
    # NPM workspaces
    if grep -q '"workspaces"' package.json 2>/dev/null; then
        while IFS= read -r pkg; do
            [[ ! -z "$pkg" ]] && packages+=("$pkg")
        done < <(jq -r '.workspaces[]?' package.json 2>/dev/null)
    fi
    
    # Lerna
    if [[ -f "lerna.json" ]]; then
        while IFS= read -r pkg; do
            [[ ! -z "$pkg" ]] && packages+=("$pkg")
        done < <(jq -r '.packages[]?' lerna.json 2>/dev/null)
    fi
    
    # Find packages directory
    if [[ -d "packages" ]]; then
        while IFS= read -r dir; do
            packages+=("${dir#./}")
        done < <(find packages -maxdepth 2 -name "package.json" -exec dirname {} \; 2>/dev/null)
    fi
    
    printf '%s\n' "${packages[@]}" | sort -u
}

update_monorepo_package() {
    local package_path="$1"
    local log_func="${2:-echo}"
    
    if [[ ! -d "$package_path" ]]; then
        $log_func "❌ Package not found: $package_path"
        return 1
    fi
    
    $log_func "📦 Updating package: $package_path"
    
    (
        cd "$package_path"
        
        if [[ -f "package.json" ]]; then
            ncu -u || $log_func "⚠️ npm-check-updates had issues"
            npm install || $log_func "⚠️ npm install had issues"
        elif [[ -f "pyproject.toml" ]]; then
            poetry update || $log_func "⚠️ poetry update had issues"
        elif [[ -f "Cargo.toml" ]]; then
            cargo update || $log_func "⚠️ cargo update had issues"
        fi
    )
}

update_all_monorepo_packages() {
    local log_func="${1:-echo}"
    
    $log_func "🔄 Updating all monorepo packages..."
    
    local packages=($(list_monorepo_packages "$log_func"))
    
    if [[ ${#packages[@]} -eq 0 ]]; then
        $log_func "⚠️ No packages found in monorepo"
        return 1
    fi
    
    $log_func "📊 Found ${#packages[@]} packages"
    
    for pkg in "${packages[@]}"; do
        update_monorepo_package "$pkg" "$log_func"
    done
    
    $log_func "✅ Monorepo update complete"
}

# Conflict Resolution

detect_dependency_conflicts() {
    local log_func="${1:-echo}"
    
    $log_func "🔍 Scanning for dependency conflicts..."
    
    local conflicts_found=0
    
    # Check npm conflicts
    if [[ -f "package.json" ]] && command -v npm &> /dev/null; then
        if npm ls --depth=0 2>&1 | grep -q "npm ERR"; then
            $log_func "⚠️ Dependency conflicts detected in npm"
            ((conflicts_found++))
        fi
    fi
    
    # Check pip conflicts
    if [[ -f "requirements.txt" ]] && command -v pip &> /dev/null; then
        if pip check 2>&1 | grep -q "not compatible"; then
            $log_func "⚠️ Dependency conflicts detected in pip"
            ((conflicts_found++))
        fi
    fi
    
    return $conflicts_found
}

suggest_conflict_resolution() {
    local file="$1"
    local log_func="${2:-echo}"
    
    $log_func ""
    $log_func "💡 Suggested Resolutions:"
    $log_func ""
    
    if [[ "$file" == "package.json" ]]; then
        $log_func "1. Run: npm install --force"
        $log_func "2. Review conflicting packages with: npm ls --depth=0"
        $log_func "3. Update compatible versions in package.json"
        $log_func "4. Run: npm ci (for clean install)"
    elif [[ "$file" == "requirements.txt" ]]; then
        $log_func "1. Run: pip install --upgrade --force-reinstall"
        $log_func "2. Check conflicts with: pip check"
        $log_func "3. Review and update incompatible versions"
        $log_func "4. Consider using: pip-tools for dependency resolution"
    elif [[ "$file" == "Cargo.toml" ]]; then
        $log_func "1. Run: cargo update"
        $log_func "2. Review Cargo.lock conflicts"
        $log_func "3. Update version constraints in Cargo.toml"
        $log_func "4. Run: cargo check"
    fi
}

resolve_conflicts_automatically() {
    local log_func="${1:-echo}"
    
    $log_func "🔧 Attempting automatic conflict resolution..."
    
    if [[ -f "package.json" ]] && command -v npm &> /dev/null; then
        $log_func "  Resolving npm conflicts..."
        npm install --legacy-peer-deps 2>&1 | tail -5 | tee -a "${LOG_FILE:-/dev/null}"
    fi
    
    if [[ -f "requirements.txt" ]] && command -v pip &> /dev/null; then
        $log_func "  Resolving pip conflicts..."
        pip install --upgrade --force-reinstall 2>&1 | tail -5 | tee -a "${LOG_FILE:-/dev/null}"
    fi
    
    if [[ -f "Cargo.toml" ]] && command -v cargo &> /dev/null; then
        $log_func "  Resolving Cargo conflicts..."
        cargo update 2>&1 | tail -5 | tee -a "${LOG_FILE:-/dev/null}"
    fi
    
    $log_func "✅ Conflict resolution attempted"
}

interactive_conflict_resolution() {
    local log_func="${1:-echo}"
    
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║             Interactive Conflict Resolution                    ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    detect_dependency_conflicts "$log_func"
    
    if [[ $? -eq 0 ]]; then
        $log_func "✅ No conflicts detected"
        return 0
    fi
    
    echo ""
    echo "Options:"
    echo "1) Attempt automatic resolution"
    echo "2) View suggestions"
    echo "3) Manually resolve"
    echo "4) Skip conflict resolution"
    echo ""
    
    read -p "Select option (1-4): " -n 1 option; echo ""
    
    case $option in
        1)
            resolve_conflicts_automatically "$log_func"
            ;;
        2)
            if [[ -f "package.json" ]]; then
                suggest_conflict_resolution "package.json" "$log_func"
            fi
            if [[ -f "requirements.txt" ]]; then
                suggest_conflict_resolution "requirements.txt" "$log_func"
            fi
            if [[ -f "Cargo.toml" ]]; then
                suggest_conflict_resolution "Cargo.toml" "$log_func"
            fi
            ;;
        3)
            $log_func "ℹ️ Please manually resolve conflicts in your dependency files"
            $log_func "   Then re-run the updater"
            ;;
        4)
            $log_func "⏭️ Skipping conflict resolution"
            ;;
    esac
}

validate_dependency_tree() {
    local log_func="${1:-echo}"
    
    $log_func "🌳 Validating dependency tree..."
    
    local all_valid=true
    
    if [[ -f "package.json" ]]; then
        if npm ls --depth=0 &> /dev/null; then
            $log_func "  ✅ npm dependency tree valid"
        else
            $log_func "  ❌ npm dependency tree has issues"
            all_valid=false
        fi
    fi
    
    if [[ -f "requirements.txt" ]]; then
        if pip check 2>&1 | grep -q "No broken requirements"; then
            $log_func "  ✅ pip dependency tree valid"
        else
            $log_func "  ⚠️ pip has incompatible requirements"
        fi
    fi
    
    if [[ -f "Cargo.toml" ]]; then
        if cargo check --message-format=short 2>&1 | grep -q "error" ; then
            $log_func "  ❌ Cargo dependency tree has errors"
            all_valid=false
        else
            $log_func "  ✅ Cargo dependency tree valid"
        fi
    fi
    
    [[ "$all_valid" == "true" ]] && return 0 || return 1
}
