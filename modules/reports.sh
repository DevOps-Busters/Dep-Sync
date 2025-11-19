#!/bin/bash

# Dependency Report Generator
# Creates comprehensive inventory reports in JSON, CSV, and SBOM formats

generate_json_report() {
    local output_file="${1:-dependency-report.json}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating JSON dependency report..."
    
    {
        echo "{"
        echo "  \"report\": {"
        echo "    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "    \"workspace\": \"$(pwd)\","
        echo "    \"projects\": ["
        
        local first=true
        
        # Node.js
        if [[ -f "package.json" ]]; then
            [[ "$first" == "false" ]] && echo ","
            echo "    {"
            echo "      \"type\": \"nodejs\","
            echo "      \"file\": \"package.json\","
            echo "      \"manager\": \"npm\","
            echo "      \"dependencies\": $(cat package.json | grep -A 50 '"dependencies"' | head -20)"
            echo "    }"
            first=false
        fi
        
        # Python
        if [[ -f "requirements.txt" ]]; then
            [[ "$first" == "false" ]] && echo ","
            echo "    {"
            echo "      \"type\": \"python\","
            echo "      \"file\": \"requirements.txt\","
            echo "      \"manager\": \"pip\","
            echo "      \"dependency_count\": $(wc -l < requirements.txt)"
            echo "    }"
            first=false
        fi
        
        # Docker
        if [[ -f "Dockerfile" ]]; then
            [[ "$first" == "false" ]] && echo ","
            echo "    {"
            echo "      \"type\": \"docker\","
            echo "      \"file\": \"Dockerfile\","
            echo "      \"base_images\": ["
            while IFS= read -r line; do
                if [[ "$line" =~ ^FROM ]]; then
                    echo "        \"$(echo $line | cut -d' ' -f2)\","
                fi
            done < <(grep "^FROM" Dockerfile)
            echo "      ]"
            echo "    }"
            first=false
        fi
        
        # Java
        if [[ -f "pom.xml" ]]; then
            [[ "$first" == "false" ]] && echo ","
            echo "    {"
            echo "      \"type\": \"java\","
            echo "      \"file\": \"pom.xml\","
            echo "      \"manager\": \"maven\","
            echo "      \"dependencies\": $(grep -c "<dependency>" pom.xml 2>/dev/null || echo 0)"
            echo "    }"
            first=false
        fi
        
        # Go
        if [[ -f "go.mod" ]]; then
            [[ "$first" == "false" ]] && echo ","
            echo "    {"
            echo "      \"type\": \"go\","
            echo "      \"file\": \"go.mod\","
            echo "      \"manager\": \"go\","
            echo "      \"dependencies\": $(grep -c "^require" go.mod 2>/dev/null || echo 0)"
            echo "    }"
            first=false
        fi
        
        # Rust
        if [[ -f "Cargo.toml" ]]; then
            [[ "$first" == "false" ]] && echo ","
            echo "    {"
            echo "      \"type\": \"rust\","
            echo "      \"file\": \"Cargo.toml\","
            echo "      \"manager\": \"cargo\","
            echo "      \"dependencies\": $(grep -c "^\\[dependencies\\]" Cargo.toml 2>/dev/null || echo 0)"
            echo "    }"
        fi
        
        echo "    ]"
        echo "  }"
        echo "}"
    } > "$output_file"
    
    $log_func "✅ JSON report saved to: $output_file"
}

generate_csv_report() {
    local output_file="${1:-dependency-report.csv}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating CSV dependency report..."
    
    {
        echo "Language,Type,File,Manager,Dependencies,Last_Updated"
        
        [[ -f "package.json" ]] && echo "Node.js,Module,package.json,npm,$(jq '.dependencies | length' package.json 2>/dev/null || echo 0),$(stat -c %y package.json 2>/dev/null || echo 'N/A')"
        
        [[ -f "requirements.txt" ]] && echo "Python,Module,requirements.txt,pip,$(wc -l < requirements.txt),$(stat -c %y requirements.txt 2>/dev/null || echo 'N/A')"
        
        [[ -f "Dockerfile" ]] && echo "Docker,Container,Dockerfile,docker,$(grep -c '^FROM' Dockerfile),$(stat -c %y Dockerfile 2>/dev/null || echo 'N/A')"
        
        [[ -f "pom.xml" ]] && echo "Java,Module,pom.xml,maven,$(grep -c '<dependency>' pom.xml 2>/dev/null || echo 0),$(stat -c %y pom.xml 2>/dev/null || echo 'N/A')"
        
        [[ -f "go.mod" ]] && echo "Go,Module,go.mod,go,$(grep -c '^require' go.mod 2>/dev/null || echo 0),$(stat -c %y go.mod 2>/dev/null || echo 'N/A')"
        
        [[ -f "Cargo.toml" ]] && echo "Rust,Module,Cargo.toml,cargo,$(grep -c '^\[dependencies\]' Cargo.toml 2>/dev/null || echo 0),$(stat -c %y Cargo.toml 2>/dev/null || echo 'N/A')"
    } > "$output_file"
    
    $log_func "✅ CSV report saved to: $output_file"
}

generate_sbom_report() {
    local output_file="${1:-sbom.json}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating SBOM (Software Bill of Materials)..."
    
    {
        echo "{"
        echo "  \"bomFormat\": \"CycloneDX\","
        echo "  \"specVersion\": \"1.3\","
        echo "  \"version\": 1,"
        echo "  \"metadata\": {"
        echo "    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "    \"component\": {"
        echo "      \"type\": \"application\","
        echo "      \"name\": \"$(basename $(pwd))\","
        echo "      \"version\": \"1.0.0\""
        echo "    }"
        echo "  },"
        echo "  \"components\": ["
        
        local first=true
        
        # Extract components from various manifests
        if [[ -f "package.json" ]]; then
            jq -r '.dependencies | to_entries[] | {name: .key, version: .value}' package.json 2>/dev/null | \
            jq -s 'map(. + {type: "npm", language: "nodejs"})' 2>/dev/null | \
            while IFS= read -r line; do
                [[ "$first" == "false" ]] && echo ","
                echo "    $line"
                first=false
            done || true
        fi
        
        echo "  ]"
        echo "}"
    } > "$output_file"
    
    $log_func "✅ SBOM saved to: $output_file"
}

generate_detailed_report() {
    local output_file="${1:-dependency-detailed-report.md}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating detailed markdown report..."
    
    {
        echo "# Dependency Inventory Report"
        echo ""
        echo "**Generated:** $(date)"
        echo "**Workspace:** $(pwd)"
        echo ""
        echo "## Summary"
        echo ""
        
        local total_projects=0
        [[ -f "package.json" ]] && ((total_projects++))
        [[ -f "requirements.txt" ]] && ((total_projects++))
        [[ -f "Dockerfile" ]] && ((total_projects++))
        [[ -f "pom.xml" ]] && ((total_projects++))
        [[ -f "go.mod" ]] && ((total_projects++))
        [[ -f "Cargo.toml" ]] && ((total_projects++))
        
        echo "- **Total Projects:** $total_projects"
        echo "- **Last Updated:** $(date -r . '+%Y-%m-%d')"
        echo ""
        echo "## Detected Components"
        echo ""
        
        if [[ -f "package.json" ]]; then
            echo "### Node.js (npm)"
            echo "- **File:** package.json"
            echo "- **Dependencies:** $(jq '.dependencies | length' package.json 2>/dev/null || echo 'N/A')"
            echo "- **Dev Dependencies:** $(jq '.devDependencies | length' package.json 2>/dev/null || echo 'N/A')"
            echo ""
        fi
        
        if [[ -f "requirements.txt" ]]; then
            echo "### Python (pip)"
            echo "- **File:** requirements.txt"
            echo "- **Dependencies:** $(wc -l < requirements.txt)"
            echo ""
        fi
        
        if [[ -f "Dockerfile" ]]; then
            echo "### Docker"
            echo "- **File:** Dockerfile"
            echo "- **Base Images:**"
            grep "^FROM" Dockerfile | sed 's/^/  - /'
            echo ""
        fi
        
        if [[ -f "pom.xml" ]]; then
            echo "### Java (Maven)"
            echo "- **File:** pom.xml"
            echo "- **Dependencies:** $(grep -c '<dependency>' pom.xml 2>/dev/null || echo 0)"
            echo ""
        fi
        
        if [[ -f "go.mod" ]]; then
            echo "### Go"
            echo "- **File:** go.mod"
            echo "- **Go Version:** $(grep 'go ' go.mod | head -1)"
            echo "- **Dependencies:** $(grep -c '^require' go.mod 2>/dev/null || echo 0)"
            echo ""
        fi
        
        if [[ -f "Cargo.toml" ]]; then
            echo "### Rust (Cargo)"
            echo "- **File:** Cargo.toml"
            echo "- **Edition:** $(grep '^edition' Cargo.toml)"
            echo ""
        fi
        
        echo "## Recommendations"
        echo ""
        echo "1. Review outdated dependencies regularly"
        echo "2. Run security audits before each update"
        echo "3. Test thoroughly after dependency updates"
        echo "4. Monitor for breaking changes in major updates"
        echo "5. Consider using automated dependency management tools"
        echo ""
    } > "$output_file"
    
    $log_func "✅ Detailed report saved to: $output_file"
}

# Generate all report types
generate_all_reports() {
    local log_func="${1:-echo}"
    local report_dir="${2:-.}"
    
    $log_func "📊 Generating comprehensive dependency reports..."
    
    generate_json_report "${report_dir}/dependency-report.json" "$log_func"
    generate_csv_report "${report_dir}/dependency-report.csv" "$log_func"
    generate_sbom_report "${report_dir}/sbom.json" "$log_func"
    generate_detailed_report "${report_dir}/dependency-report.md" "$log_func"
    
    $log_func ""
    $log_func "✅ All reports generated in: $report_dir"
    $log_func "📋 Files created:"
    $log_func "   - dependency-report.json (machine-readable)"
    $log_func "   - dependency-report.csv (spreadsheet-friendly)"
    $log_func "   - sbom.json (CycloneDX format)"
    $log_func "   - dependency-report.md (human-readable)"
}
