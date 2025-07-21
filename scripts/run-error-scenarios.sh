#!/bin/bash

# Epic 18 Error Scenario Test Runner
# Comprehensive error scenario testing for integration tests

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/test-reports"
INTEGRATION_CONFIG="$PROJECT_ROOT/tests/integration/jest.config.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Print header
print_header() {
    echo -e "${BLUE}"
    echo "================================================="
    echo "Epic 18 Error Scenario Test Suite"
    echo "================================================="
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        error "pnpm is required but not installed"
        exit 1
    fi
    
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error "package.json not found in project root"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Setup test environment
setup_environment() {
    log "Setting up test environment..."
    
    # Ensure reports directory exists
    mkdir -p "$REPORTS_DIR"
    mkdir -p "$REPORTS_DIR/errors"
    mkdir -p "$REPORTS_DIR/coverage"
    
    # Set environment variables
    export NODE_ENV=test
    export CI=true
    export JEST_WORKER_ID=1
    export __INTEGRATION_TEST_MODE__=true
    export __ERROR_REPORTING_ENABLED__=true
    
    success "Test environment setup complete"
}

# Run specific error scenario test
run_scenario() {
    local scenario_name="$1"
    local test_file="$PROJECT_ROOT/tests/integration/${scenario_name}.test.ts"
    
    log "Running scenario: $scenario_name"
    
    if [[ ! -f "$test_file" ]]; then
        error "Test file not found: $test_file"
        return 1
    fi
    
    # Run the specific test
    pnpm jest \
        --config="$INTEGRATION_CONFIG" \
        --testPathPattern="$scenario_name" \
        --verbose \
        --forceExit \
        --detectOpenHandles \
        --runInBand
}

# Run all error scenarios
run_all_scenarios() {
    log "Running all error scenarios..."
    
    local scenarios=(
        "ErrorScenarios"
        "GraphEngineErrorScenarios"
        "APIErrorScenarios"
        "SystemRecoveryScenarios"
    )
    
    local total_scenarios=${#scenarios[@]}
    local passed_scenarios=0
    local failed_scenarios=0
    
    for scenario in "${scenarios[@]}"; do
        echo ""
        log "Running scenario ${scenario}..."
        
        if run_scenario "$scenario"; then
            success "Scenario $scenario passed"
            ((passed_scenarios++))
        else
            error "Scenario $scenario failed"
            ((failed_scenarios++))
        fi
    done
    
    echo ""
    log "Error scenario test summary:"
    echo "  Total scenarios: $total_scenarios"
    echo "  Passed: $passed_scenarios"
    echo "  Failed: $failed_scenarios"
    
    if [[ $failed_scenarios -gt 0 ]]; then
        error "Some error scenarios failed"
        return 1
    else
        success "All error scenarios passed!"
        return 0
    fi
}

# Generate comprehensive report
generate_report() {
    log "Generating comprehensive test report..."
    
    # Run Jest with full reporting
    pnpm jest \
        --config="$INTEGRATION_CONFIG" \
        --testPathPattern="tests/integration" \
        --coverage \
        --coverageReporters=text-lcov,html,json-summary \
        --outputFile="$REPORTS_DIR/integration-results.json" \
        --json \
        --verbose \
        --runInBand \
        --forceExit
    
    success "Test report generated in $REPORTS_DIR"
}

# Cleanup function
cleanup() {
    log "Cleaning up test environment..."
    
    # Kill any remaining processes
    pkill -f jest || true
    pkill -f node || true
    
    # Clean up temporary files
    find "$PROJECT_ROOT" -name "*.log" -type f -delete 2>/dev/null || true
    
    success "Cleanup complete"
}

# Main execution
main() {
    print_header
    
    # Set up trap for cleanup on exit
    trap cleanup EXIT
    
    # Parse command line arguments
    local command="${1:-all}"
    
    case "$command" in
        "check")
            check_prerequisites
            ;;
        "setup")
            check_prerequisites
            setup_environment
            ;;
        "run")
            local scenario_name="${2:-}"
            if [[ -z "$scenario_name" ]]; then
                error "Scenario name required for 'run' command"
                echo "Usage: $0 run <scenario_name>"
                exit 1
            fi
            check_prerequisites
            setup_environment
            run_scenario "$scenario_name"
            ;;
        "all")
            check_prerequisites
            setup_environment
            run_all_scenarios
            ;;
        "report")
            check_prerequisites
            setup_environment
            generate_report
            ;;
        "help"|"-h"|"--help")
            echo "Epic 18 Error Scenario Test Runner"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  check              Check prerequisites"
            echo "  setup              Setup test environment"
            echo "  run <scenario>     Run specific error scenario"
            echo "  all                Run all error scenarios (default)"
            echo "  report             Generate comprehensive report"
            echo "  help               Show this help message"
            echo ""
            echo "Available scenarios:"
            echo "  ErrorScenarios                 - General error scenarios"
            echo "  GraphEngineErrorScenarios      - Graph engine specific errors"
            echo "  APIErrorScenarios              - API and HTTP errors"
            echo "  SystemRecoveryScenarios        - System recovery and resilience"
            echo ""
            ;;
        *)
            error "Unknown command: $command"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"