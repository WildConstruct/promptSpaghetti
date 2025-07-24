#!/bin/bash

# Dependency Conflict Checker
# Created as part of Story 1.1: Dependency Standardization and Conflict Resolution
# This script helps developers check for dependency conflicts locally before commits

set -e

echo "🔍 Checking for dependency version conflicts..."

# Function to check version consistency
check_dependency_consistency() {
    local dep_name=$1
    local dep_pattern="\"$dep_name\":"
    
    echo "Checking $dep_name versions..."
    
    # Find all package.json files excluding node_modules
    local versions=$(find . -name "package.json" -not -path "*/node_modules/*" -exec grep -l "$dep_pattern" {} \; | xargs grep "$dep_pattern" | awk -F'"' '{print $4}' | sort -u)
    local count=$(echo "$versions" | wc -l)
    
    if [ $count -gt 1 ]; then
        echo "❌ $dep_name version conflicts detected:"
        find . -name "package.json" -not -path "*/node_modules/*" -exec grep -l "$dep_pattern" {} \; | xargs grep "$dep_pattern"
        return 1
    else
        echo "✅ $dep_name versions are consistent"
        return 0
    fi
}

# Check critical dependencies
ERRORS=0

# Check Zod (critical - breaks CI if inconsistent)
if ! check_dependency_consistency "zod"; then
    ERRORS=$((ERRORS + 1))
    echo "🚨 CRITICAL: Zod version conflicts will break CI!"
fi

# Check TypeScript (warning level)
if ! check_dependency_consistency "typescript"; then
    echo "⚠️  TypeScript version inconsistencies detected"
fi

# Check Jest (warning level)
if ! check_dependency_consistency "jest"; then
    echo "⚠️  Jest version inconsistencies detected"
fi

# Check React (should be consistent)
if ! check_dependency_consistency "react"; then
    ERRORS=$((ERRORS + 1))
    echo "🚨 CRITICAL: React version conflicts detected!"
fi

# Security check
echo ""
echo "🔒 Running security audit..."
if ! pnpm audit --audit-level high; then
    echo "⚠️  Security vulnerabilities found. Review before committing."
fi

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
    echo "✅ All dependency conflict checks passed!"
    exit 0
else
    echo "❌ Found $ERRORS critical dependency conflicts!"
    echo "Please resolve these conflicts before committing."
    exit 1
fi