#!/bin/bash
################################################################################
# Report Generator Module
# Creates dependency reports in JSON, CSV, SBOM, and Markdown formats
################################################################################

check_jq() {
    command -v jq &>/dev/null
}

################################################################################
# JSON Report
################################################################################
generate_json_report() {
    local output="${1:-dependency-report.json}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating JSON report..."
    
    local projects="" first=true
    
    # Node.js
    if [[ -f "package.json" ]]; then
        local deps=0 dev_deps=0
        check_jq && {
            deps=$(jq '.dependencies | length // 0' package.json 2>/dev/null || echo 0)
            dev_deps=$(jq '.devDependencies | length // 0' package.json 2>/dev/null || echo 0)
        }
        [[ "$first" == "false" ]] && projects+=","
        projects+='{"type":"nodejs","file":"package.json","deps":'$deps',"devDeps":'$dev_deps'}'
        first=false
    fi
    
    # Python
    if [[ -f "requirements.txt" ]]; then
        local deps=$(grep -cv '^#\|^$' requirements.txt 2>/dev/null || echo 0)
        [[ "$first" == "false" ]] && projects+=","
        projects+='{"type":"python","file":"requirements.txt","deps":'$deps'}'
        first=false
    fi
    
    if [[ -f "pyproject.toml" ]]; then
        [[ "$first" == "false" ]] && projects+=","
        projects+='{"type":"python","file":"pyproject.toml","manager":"poetry"}'
        first=false
    fi
    
    # Docker
    if [[ -f "Dockerfile" ]]; then
        local images=""
        local img_first=true
        while read -r line; do
            [[ "$line" =~ ^FROM[[:space:]] ]] && {
                local img=$(echo "$line" | awk '{print $2}')
                [[ "$img_first" == "false" ]] && images+=","
                images+="\"$img\""
                img_first=false
            }
        done < Dockerfile
        [[ "$first" == "false" ]] && projects+=","
        projects+='{"type":"docker","file":"Dockerfile","images":['$images']}'
        first=false
    fi
    
    # Java
    if [[ -f "pom.xml" ]]; then
        local deps=$(grep -c '<dependency>' pom.xml 2>/dev/null || echo 0)
        [[ "$first" == "false" ]] && projects+=","
        projects+='{"type":"java","file":"pom.xml","deps":'$deps'}'
        first=false
    fi
    
    if [[ -f "build.gradle" || -f "build.gradle.kts" ]]; then
        local file="build.gradle"
        [[ -f "build.gradle.kts" ]] && file="build.gradle.kts"
        [[ "$first" == "false" ]] && projects+=","
        projects+='{"type":"java","file":"'$file'","manager":"gradle"}'
        first=false
    fi
    
    cat > "$output" << EOF
{"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","generator":"Dep-Sync","projects":[$projects]}
EOF
    
    check_jq && jq . "$output" > "${output}.tmp" && mv "${output}.tmp" "$output"
    $log_func "✅ JSON: $output"
}

################################################################################
# CSV Report
################################################################################
generate_csv_report() {
    local output="${1:-dependency-report.csv}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating CSV report..."
    
    echo "Language,File,Manager,Dependencies" > "$output"
    
    [[ -f "package.json" ]] && {
        local deps=0
        check_jq && deps=$(jq '(.dependencies|length//0)+(.devDependencies|length//0)' package.json 2>/dev/null || echo 0)
        echo "Node.js,package.json,npm,$deps" >> "$output"
    }
    
    [[ -f "requirements.txt" ]] && {
        echo "Python,requirements.txt,pip,$(grep -cv '^#\|^$' requirements.txt 2>/dev/null || echo 0)" >> "$output"
    }
    
    [[ -f "pyproject.toml" ]] && echo "Python,pyproject.toml,poetry,N/A" >> "$output"
    [[ -f "Dockerfile" ]] && echo "Docker,Dockerfile,docker,$(grep -c '^FROM' Dockerfile 2>/dev/null || echo 0)" >> "$output"
    [[ -f "pom.xml" ]] && echo "Java,pom.xml,maven,$(grep -c '<dependency>' pom.xml 2>/dev/null || echo 0)" >> "$output"
    [[ -f "build.gradle" ]] && echo "Java,build.gradle,gradle,N/A" >> "$output"
    [[ -f "build.gradle.kts" ]] && echo "Java,build.gradle.kts,gradle,N/A" >> "$output"
    
    $log_func "✅ CSV: $output"
}

################################################################################
# SBOM (CycloneDX)
################################################################################
generate_sbom_report() {
    local output="${1:-sbom.json}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating SBOM..."
    
    local components="" first=true
    
    # Node.js deps
    if [[ -f "package.json" ]] && check_jq; then
        while IFS='|' read -r name version; do
            [[ -n "$name" && -n "$version" ]] && {
                [[ "$first" == "false" ]] && components+=","
                components+='{"type":"library","name":"'"$name"'","version":"'"$version"'","purl":"pkg:npm/'"$name"'@'"$version"'"}'
                first=false
            }
        done < <(jq -r '.dependencies//{}|to_entries[]|"\(.key)|\(.value)"' package.json 2>/dev/null)
    fi
    
    # Python deps
    if [[ -f "requirements.txt" ]]; then
        while read -r line; do
            [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
            local name=$(echo "$line" | sed 's/[=<>!].*//')
            local ver=$(echo "$line" | grep -oP '(?<===)[^,]+' || echo "")
            [[ -n "$name" ]] && {
                [[ "$first" == "false" ]] && components+=","
                components+='{"type":"library","name":"'"$name"'","version":"'"${ver:-unspecified}"'","purl":"pkg:pypi/'"$name"'"}'
                first=false
            }
        done < requirements.txt
    fi
    
    cat > "$output" << EOF
{"bomFormat":"CycloneDX","specVersion":"1.4","metadata":{"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","tools":[{"name":"Dep-Sync"}]},"components":[$components]}
EOF
    
    check_jq && jq . "$output" > "${output}.tmp" && mv "${output}.tmp" "$output"
    $log_func "✅ SBOM: $output"
}

################################################################################
# Markdown Report
################################################################################
generate_markdown_report() {
    local output="${1:-dependency-report.md}"
    local log_func="${2:-echo}"
    
    $log_func "📊 Generating Markdown report..."
    
    cat > "$output" << EOF
# Dependency Report

**Generated:** $(date)
**Workspace:** $(pwd)

## Projects

EOF
    
    [[ -f "package.json" ]] && {
        local deps=0 dev=0
        check_jq && {
            deps=$(jq '.dependencies|length//0' package.json 2>/dev/null || echo 0)
            dev=$(jq '.devDependencies|length//0' package.json 2>/dev/null || echo 0)
        }
        echo "### Node.js" >> "$output"
        echo "- **File:** package.json" >> "$output"
        echo "- **Dependencies:** $deps" >> "$output"
        echo "- **Dev Dependencies:** $dev" >> "$output"
        echo "" >> "$output"
    }
    
    [[ -f "requirements.txt" ]] && {
        echo "### Python (pip)" >> "$output"
        echo "- **File:** requirements.txt" >> "$output"
        echo "- **Dependencies:** $(grep -cv '^#\|^$' requirements.txt 2>/dev/null || echo 0)" >> "$output"
        echo "" >> "$output"
    }
    
    [[ -f "pyproject.toml" ]] && {
        echo "### Python (Poetry)" >> "$output"
        echo "- **File:** pyproject.toml" >> "$output"
        echo "" >> "$output"
    }
    
    [[ -f "Dockerfile" ]] && {
        echo "### Docker" >> "$output"
        echo "**Base Images:**" >> "$output"
        grep "^FROM" Dockerfile | while read -r line; do
            echo "- \`$(echo "$line" | awk '{print $2}')\`" >> "$output"
        done
        echo "" >> "$output"
    }
    
    [[ -f "pom.xml" ]] && {
        echo "### Java (Maven)" >> "$output"
        echo "- **File:** pom.xml" >> "$output"
        echo "- **Dependencies:** $(grep -c '<dependency>' pom.xml 2>/dev/null || echo 0)" >> "$output"
        echo "" >> "$output"
    }
    
    [[ -f "build.gradle" || -f "build.gradle.kts" ]] && {
        echo "### Java (Gradle)" >> "$output"
        [[ -f "build.gradle" ]] && echo "- **File:** build.gradle" >> "$output"
        [[ -f "build.gradle.kts" ]] && echo "- **File:** build.gradle.kts" >> "$output"
        echo "" >> "$output"
    }
    
    echo "---" >> "$output"
    echo "*Generated by Dep-Sync*" >> "$output"
    
    $log_func "✅ Markdown: $output"
}

################################################################################
# Generate All Reports
################################################################################
generate_all_reports() {
    local log_func="${1:-echo}"
    local dir="${2:-.}"
    
    mkdir -p "$dir"
    
    $log_func "📊 Generating all reports..."
    
    generate_json_report "${dir}/deps.json" "$log_func"
    generate_csv_report "${dir}/deps.csv" "$log_func"
    generate_sbom_report "${dir}/sbom.json" "$log_func"
    generate_markdown_report "${dir}/deps.md" "$log_func"
    
    $log_func "✅ All reports in: $dir"
}
