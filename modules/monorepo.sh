#!/bin/bash
################################################################################
# Monorepo & Conflict Resolution Module
# Handles monorepo structures and dependency conflicts
################################################################################

# Detect monorepo structure
detect_monorepo() {
    local log_func="${1:-echo}"
    
    # npm/pnpm workspaces
    if [[ -f "package.json" ]] && grep -q '"workspaces"' package.json 2>/dev/null; then
        $log_func "📦 Monorepo: npm workspaces"
        return 0
    fi
    
    # Lerna
    if [[ -f "lerna.json" ]]; then
        $log_func "📦 Monorepo: Lerna"
        return 0
    fi
    
    # pnpm workspaces
    if [[ -f "pnpm-workspace.yaml" ]]; then
        $log_func "📦 Monorepo: pnpm"
        return 0
    fi
    
    # Packages directory pattern
    if [[ -d "packages" && -f "package.json" ]]; then
        $log_func "📦 Monorepo: packages/"
        return 0
    fi
    
    return 1
}

# List monorepo packages
list_monorepo_packages() {
    local packages=()
    
    # npm workspaces
    if command -v jq &>/dev/null && grep -q '"workspaces"' package.json 2>/dev/null; then
        while read -r pkg; do
            [[ -n "$pkg" ]] && packages+=("$pkg")
        done < <(jq -r '.workspaces[]?' package.json 2>/dev/null)
    fi
    
    # Lerna
    if [[ -f "lerna.json" ]] && command -v jq &>/dev/null; then
        while read -r pkg; do
            [[ -n "$pkg" ]] && packages+=("$pkg")
        done < <(jq -r '.packages[]?' lerna.json 2>/dev/null)
    fi
    
    # packages/ directory
    if [[ -d "packages" ]]; then
        while read -r dir; do
            packages+=("${dir#./}")
        done < <(find packages -maxdepth 2 -name "package.json" -exec dirname {} \; 2>/dev/null)
    fi
    
    printf '%s\n' "${packages[@]}" | sort -u
}

# Update single package
update_monorepo_package() {
    local pkg="$1"
    local log_func="${2:-echo}"
    
    [[ ! -d "$pkg" ]] && { $log_func "❌ Not found: $pkg"; return 1; }
    
    $log_func "📦 Updating: $pkg"
    
    (
        cd "$pkg" || exit 1
        [[ -f "package.json" ]] && {
            command -v ncu &>/dev/null && ncu -u
            npm install
        }
        [[ -f "pyproject.toml" ]] && command -v poetry &>/dev/null && poetry update
    )
}

# Update all packages
update_all_monorepo_packages() {
    local log_func="${1:-echo}"
    
    $log_func "🔄 Updating monorepo packages..."
    
    local packages
    mapfile -t packages < <(list_monorepo_packages)
    
    [[ ${#packages[@]} -eq 0 ]] && { $log_func "⚠️ No packages found"; return 1; }
    
    $log_func "📊 Found ${#packages[@]} packages"
    
    for pkg in "${packages[@]}"; do
        update_monorepo_package "$pkg" "$log_func"
    done
    
    $log_func "✅ Monorepo update complete"
}

################################################################################
# Conflict Resolution
################################################################################

detect_dependency_conflicts() {
    local log_func="${1:-echo}"
    local conflicts=0
    
    $log_func "🔍 Checking for conflicts..."
    
    # npm
    if [[ -f "package.json" ]] && command -v npm &>/dev/null; then
        if npm ls --depth=0 2>&1 | grep -q "npm ERR"; then
            $log_func "⚠️ npm conflicts detected"
            ((conflicts++))
        fi
    fi
    
    # pip
    if [[ -f "requirements.txt" ]] && command -v pip &>/dev/null; then
        if pip check 2>&1 | grep -q "not compatible"; then
            $log_func "⚠️ pip conflicts detected"
            ((conflicts++))
        fi
    fi
    
    return $conflicts
}

resolve_conflicts_auto() {
    local log_func="${1:-echo}"
    
    $log_func "🔧 Auto-resolving conflicts..."
    
    [[ -f "package.json" ]] && command -v npm &>/dev/null && {
        $log_func "  npm..."
        npm install --legacy-peer-deps 2>&1 | tail -3
    }
    
    [[ -f "requirements.txt" ]] && command -v pip &>/dev/null && {
        $log_func "  pip..."
        pip install --upgrade -r requirements.txt 2>&1 | tail -3
    }
    
    $log_func "✅ Resolution attempted"
}

suggest_conflict_resolution() {
    local file="$1"
    local log_func="${2:-echo}"
    
    $log_func "💡 Suggestions for $file:"
    
    case "$file" in
        package.json)
            $log_func "  1. npm install --force"
            $log_func "  2. npm ls --depth=0"
            $log_func "  3. npm ci"
            ;;
        requirements.txt)
            $log_func "  1. pip install --upgrade -r requirements.txt"
            $log_func "  2. pip check"
            $log_func "  3. Use pip-tools"
            ;;
    esac
}

validate_dependency_tree() {
    local log_func="${1:-echo}"
    local valid=true
    
    $log_func "🌳 Validating dependencies..."
    
    [[ -f "package.json" ]] && {
        if npm ls --depth=0 &>/dev/null; then
            $log_func "  ✅ npm OK"
        else
            $log_func "  ❌ npm has issues"
            valid=false
        fi
    }
    
    [[ -f "requirements.txt" ]] && {
        if pip check &>/dev/null; then
            $log_func "  ✅ pip OK"
        else
            $log_func "  ⚠️ pip has warnings"
        fi
    }
    
    [[ "$valid" == "true" ]]
}
