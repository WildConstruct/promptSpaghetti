#!/bin/bash

# Daily Maintenance Script for Content Authoring Handbook
# Epic 8.3 Story 8.3.6 - Update Cycle and Maintenance

set -e

echo "🔧 Starting daily maintenance routine..."
echo "Timestamp: $(date)"

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HANDBOOK_DIR="$(dirname "$SCRIPT_DIR")"
REPORTS_DIR="$HANDBOOK_DIR/reports"
TEMP_DIR="$HANDBOOK_DIR/_temp"

# Create necessary directories
mkdir -p "$REPORTS_DIR"
mkdir -p "$TEMP_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌${NC} $1"
}

# Change to handbook directory
cd "$HANDBOOK_DIR"

# 1. Check system requirements
print_status "Checking system requirements..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2)
if [ "$(printf '%s\n' "16.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "16.0.0" ]; then
    print_error "Node.js version 16.0.0 or higher is required (current: $NODE_VERSION)"
    exit 1
fi

print_success "System requirements met"

# 2. Check dependencies
print_status "Checking and updating dependencies..."
if npm audit --audit-level=moderate &> /dev/null; then
    print_success "No moderate or high severity vulnerabilities found"
else
    print_warning "Security vulnerabilities detected, attempting to fix..."
    npm audit fix --force || print_warning "Some vulnerabilities could not be auto-fixed"
fi

# 3. Check link validity
print_status "Checking link validity..."
LINK_CHECK_RESULT="$TEMP_DIR/link-check-$(date +%Y%m%d-%H%M%S).json"

if npm run check-links > "$LINK_CHECK_RESULT" 2>&1; then
    print_success "All links are valid"
else
    print_warning "Some links may be broken, check report: $LINK_CHECK_RESULT"
fi

# 4. Validate code examples
print_status "Validating code examples..."
EXAMPLE_VALIDATION_RESULT="$TEMP_DIR/example-validation-$(date +%Y%m%d-%H%M%S).json"

if npm run validate-examples > "$EXAMPLE_VALIDATION_RESULT" 2>&1; then
    print_success "All examples are valid"
else
    print_warning "Some examples may be broken, check report: $EXAMPLE_VALIDATION_RESULT"
fi

# 5. Check content freshness
print_status "Checking content freshness..."
FRESHNESS_REPORT="$REPORTS_DIR/content-freshness-$(date +%Y%m%d).json"

if node assets/tools/content-freshness-checker.js > "$FRESHNESS_REPORT" 2>&1; then
    FRESHNESS_SCORE=$(node -e "
        const fs = require('fs');
        try {
            const report = JSON.parse(fs.readFileSync('$FRESHNESS_REPORT', 'utf8'));
            console.log(report.freshnessScore);
        } catch (e) {
            console.log('N/A');
        }
    ")
    
    if [ "$FRESHNESS_SCORE" != "N/A" ]; then
        if (( $(echo "$FRESHNESS_SCORE > 85" | bc -l) )); then
            print_success "Content freshness score: $FRESHNESS_SCORE%"
        else
            print_warning "Content freshness score: $FRESHNESS_SCORE% (target: >85%)"
        fi
    else
        print_warning "Could not calculate content freshness score"
    fi
else
    print_warning "Content freshness check failed"
fi

# 6. Update search index
print_status "Updating search index..."
if npm run build:search > /dev/null 2>&1; then
    SEARCH_INDEX_SIZE=$(du -h assets/data/search-index.json | cut -f1)
    DOCUMENT_COUNT=$(node -e "
        const fs = require('fs');
        try {
            const index = JSON.parse(fs.readFileSync('assets/data/search-index.json', 'utf8'));
            console.log(index.documents.length);
        } catch (e) {
            console.log('N/A');
        }
    ")
    
    print_success "Search index updated ($DOCUMENT_COUNT documents, $SEARCH_INDEX_SIZE)"
else
    print_error "Search index update failed"
fi

# 7. Check build performance
print_status "Checking build performance..."
BUILD_START=$(date +%s)

if npm run build > /dev/null 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    BUILD_SIZE=$(du -sh _build | cut -f1)
    
    print_success "Build completed in ${BUILD_TIME}s, output size: $BUILD_SIZE"
    
    # Log performance metrics
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),$BUILD_TIME,$BUILD_SIZE" >> "$REPORTS_DIR/build-performance.csv"
else
    print_error "Build failed"
fi

# 8. Check for outdated content
print_status "Checking for outdated content..."
OUTDATED_CONTENT=$(find part*/ -name "*.md" -mtime +90 2>/dev/null | wc -l)

if [ "$OUTDATED_CONTENT" -gt 0 ]; then
    print_warning "$OUTDATED_CONTENT files haven't been updated in 90+ days"
    find part*/ -name "*.md" -mtime +90 > "$REPORTS_DIR/outdated-content-$(date +%Y%m%d).txt" 2>/dev/null
else
    print_success "No significantly outdated content found"
fi

# 9. Generate maintenance report
print_status "Generating maintenance report..."
MAINTENANCE_REPORT="$REPORTS_DIR/daily-maintenance-$(date +%Y%m%d).json"

cat > "$MAINTENANCE_REPORT" << EOF
{
    "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "$(cat VERSION)",
    "checks": {
        "linkValidity": $([ -f "$LINK_CHECK_RESULT" ] && echo "true" || echo "false"),
        "exampleValidation": $([ -f "$EXAMPLE_VALIDATION_RESULT" ] && echo "true" || echo "false"),
        "contentFreshness": $([ -f "$FRESHNESS_REPORT" ] && echo "true" || echo "false"),
        "searchIndex": $([ -f "assets/data/search-index.json" ] && echo "true" || echo "false"),
        "buildPerformance": $([ -d "_build" ] && echo "true" || echo "false")
    },
    "metrics": {
        "buildTime": $BUILD_TIME,
        "buildSize": "$BUILD_SIZE",
        "searchIndexSize": "$SEARCH_INDEX_SIZE",
        "documentCount": $DOCUMENT_COUNT,
        "outdatedContent": $OUTDATED_CONTENT,
        "freshnessScore": $FRESHNESS_SCORE
    },
    "reports": {
        "linkCheck": "$LINK_CHECK_RESULT",
        "exampleValidation": "$EXAMPLE_VALIDATION_RESULT",
        "contentFreshness": "$FRESHNESS_REPORT",
        "maintenanceReport": "$MAINTENANCE_REPORT"
    }
}
EOF

print_success "Maintenance report generated: $MAINTENANCE_REPORT"

# 10. Clean up temporary files older than 7 days
print_status "Cleaning up old temporary files..."
find "$TEMP_DIR" -type f -mtime +7 -delete 2>/dev/null || true
find "$REPORTS_DIR" -type f -mtime +30 -delete 2>/dev/null || true

print_success "Cleanup completed"

# 11. Check disk space
print_status "Checking disk space..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$DISK_USAGE" -gt 90 ]; then
    print_warning "Disk usage is high: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -gt 80 ]; then
    print_warning "Disk usage is moderate: ${DISK_USAGE}%"
else
    print_success "Disk usage is acceptable: ${DISK_USAGE}%"
fi

# 12. Version check
print_status "Checking version information..."
CURRENT_VERSION=$(cat VERSION)
LAST_UPDATE=$(node assets/tools/version-tracker.js version)

print_success "Current version: $CURRENT_VERSION"

# 13. Final summary
echo
echo "🎯 Daily Maintenance Summary"
echo "==============================="
echo "Date: $(date)"
echo "Version: $CURRENT_VERSION"
echo "Build Time: ${BUILD_TIME}s"
echo "Build Size: $BUILD_SIZE"
echo "Document Count: $DOCUMENT_COUNT"
echo "Freshness Score: $FRESHNESS_SCORE%"
echo "Outdated Content: $OUTDATED_CONTENT files"
echo "Disk Usage: ${DISK_USAGE}%"
echo "==============================="

# 14. Exit with appropriate code
if [ "$OUTDATED_CONTENT" -gt 10 ] || [ "$DISK_USAGE" -gt 90 ]; then
    print_warning "Maintenance completed with warnings"
    exit 1
else
    print_success "Daily maintenance completed successfully"
    exit 0
fi