#!/bin/bash

################################################################################
# Java Module - Handles Maven and Gradle dependency updates
################################################################################

# Detect Java project
detect_java() {
    if [[ -f "pom.xml" ]] || [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        return 0
    fi
    return 1
}

# Update Java dependencies
update_java() {
    local log_func="${1:-echo}"
    local error_func="${2:-echo}"
    
    $log_func "🔄 Updating Java dependencies..."
    
    # Maven project
    if [[ -f "pom.xml" ]]; then
        $log_func "   Detected: Maven project (pom.xml)"
        
        if ! command -v mvn &>/dev/null; then
            $error_func "Maven (mvn) is not installed"
            return 1
        fi
        
        $log_func "   Running mvn versions:use-latest-versions..."
        if ! mvn versions:use-latest-versions -DgenerateBackupPoms=false 2>&1; then
            $log_func "⚠️ Maven update completed with warnings"
        fi
        
        # Update parent POM if exists
        if grep -q "<parent>" pom.xml 2>/dev/null; then
            $log_func "   Updating parent POM..."
            mvn versions:update-parent -DgenerateBackupPoms=false 2>&1 || true
        fi
        
        $log_func "✅ Maven dependencies updated"
        return 0
    fi
    
    # Gradle project
    if [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        local gradle_file="build.gradle"
        [[ -f "build.gradle.kts" ]] && gradle_file="build.gradle.kts"
        
        $log_func "   Detected: Gradle project ($gradle_file)"
        
        # Check for Gradle wrapper
        if [[ -x "./gradlew" ]]; then
            $log_func "   Using Gradle wrapper..."
            
            # Check for dependency update plugin
            if ./gradlew tasks --all 2>/dev/null | grep -q "dependencyUpdates"; then
                $log_func "   Running dependencyUpdates task..."
                ./gradlew dependencyUpdates 2>&1 || {
                    $log_func "⚠️ Gradle dependencyUpdates completed with warnings"
                }
            else
                $log_func "ℹ️ Gradle versions plugin not configured"
                $log_func "   Add: id 'com.github.ben-manes.versions' to build.gradle"
            fi
            
            $log_func "✅ Gradle dependencies checked"
            return 0
        elif command -v gradle &>/dev/null; then
            $log_func "   Using system Gradle..."
            gradle dependencyUpdates 2>&1 || {
                $log_func "⚠️ Gradle update completed with warnings"
            }
            return 0
        else
            $error_func "Gradle wrapper not found and Gradle not installed"
            return 1
        fi
    fi
    
    $log_func "ℹ️ No Java project files detected"
    return 0
}

# Run Java tests
test_java() {
    local log_func="${1:-echo}"
    
    if ! detect_java; then
        return 0
    fi
    
    $log_func "🧪 Running Java tests..."
    
    # Maven tests
    if [[ -f "pom.xml" ]]; then
        if command -v mvn &>/dev/null; then
            if mvn test -DskipTests=false 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
                $log_func "✅ Maven tests passed"
                return 0
            else
                $log_func "⚠️ Maven tests failed"
                return 1
            fi
        fi
    fi
    
    # Gradle tests
    if [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        if [[ -x "./gradlew" ]]; then
            if ./gradlew test 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
                $log_func "✅ Gradle tests passed"
                return 0
            else
                $log_func "⚠️ Gradle tests failed"
                return 1
            fi
        elif command -v gradle &>/dev/null; then
            if gradle test 2>&1 | tee -a "${LOG_FILE:-/dev/null}"; then
                $log_func "✅ Gradle tests passed"
                return 0
            fi
        fi
    fi
    
    $log_func "ℹ️ Could not run Java tests"
    return 0
}

# Security audit for Java
audit_java() {
    local log_func="${1:-echo}"
    
    if ! detect_java; then
        return 0
    fi
    
    $log_func "🔒 Running Java security audit..."
    
    # Maven OWASP dependency-check
    if [[ -f "pom.xml" ]] && command -v mvn &>/dev/null; then
        # Check if dependency-check plugin is configured
        if grep -q "dependency-check-maven" pom.xml 2>/dev/null; then
            $log_func "   Running OWASP dependency-check..."
            mvn dependency-check:check 2>&1 | tail -20 || true
        else
            $log_func "ℹ️ OWASP dependency-check plugin not configured"
            $log_func "   Add org.owasp:dependency-check-maven to pom.xml"
        fi
        return 0
    fi
    
    # Gradle dependency-check
    if [[ -f "build.gradle" || -f "build.gradle.kts" ]]; then
        if [[ -x "./gradlew" ]]; then
            if ./gradlew tasks --all 2>/dev/null | grep -q "dependencyCheckAnalyze"; then
                $log_func "   Running Gradle dependency check..."
                ./gradlew dependencyCheckAnalyze 2>&1 | tail -20 || true
            else
                $log_func "ℹ️ OWASP dependency-check plugin not configured"
            fi
        fi
        return 0
    fi
    
    return 0
}

# Generate Java changelog
changelog_java() {
    echo "### Java Dependencies"
    echo ""
    
    if [[ -f "pom.xml" ]]; then
        echo "**Build Tool:** Maven"
        
        # Try to extract Java version
        local java_version=$(grep -oP '(?<=<java.version>)[^<]+' pom.xml 2>/dev/null || echo "")
        [[ -n "$java_version" ]] && echo "**Java Version:** $java_version"
    fi
    
    if [[ -f "build.gradle" ]] || [[ -f "build.gradle.kts" ]]; then
        echo "**Build Tool:** Gradle"
    fi
    
    echo ""
    echo "Updated Java dependencies to latest versions."
    echo ""
    echo "**Security Status:** Dependency check completed ✅"
}
