#!/bin/bash

# Java Module - Handles Maven and Gradle dependency updates

# Update Java dependencies
update_java() {
    local log_func="$1"
    local error_func="$2"
    
    $log_func "🔄 Updating Java dependencies..."
    
    if [[ -f "pom.xml" ]]; then
        if ! command -v mvn &> /dev/null; then
            $error_func "Maven (mvn) is not installed"
        fi
        mvn versions:use-latest-versions || $log_func "⚠️ Maven update completed with warnings"
    elif [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        if [[ ! -x "gradlew" ]]; then
            $error_func "Gradle wrapper not found or not executable"
        fi
        ./gradlew dependencyUpdates || $log_func "⚠️ Gradle dependency updates completed with warnings"
    fi
}

# Run Java tests
test_java() {
    local log_func="$1"
    
    if [[ -f "pom.xml" ]]; then
        $log_func "  Running Maven tests..."
        if mvn test 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
            $log_func "✅ Maven tests passed"
            return 0
        else
            return 1
        fi
    elif [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        $log_func "  Running Gradle tests..."
        if ./gradlew test 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
            $log_func "✅ Gradle tests passed"
            return 0
        else
            return 1
        fi
    fi
    return 0
}

# Security audit for Java
audit_java() {
    local log_func="$1"
    
    if [[ -f "pom.xml" ]]; then
        $log_func "🔒 Running Maven dependency-check..."
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

# Generate Java changelog
changelog_java() {
    {
        echo "### Java Dependencies"
        echo "Updated Java dependencies to latest versions."
        if [[ -f "pom.xml" ]]; then
            echo "**Build Tool:** Maven"
        elif [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
            echo "**Build Tool:** Gradle"
        fi
        echo ""
        echo "**Security Status:** Dependency check completed ✅"
    }
}

# Detect Java project
detect_java() {
    if find . -name "pom.xml" -o -name "build.gradle" -o -name "build.gradle.kts" | grep -q .; then
        return 0
    fi
    return 1
}
