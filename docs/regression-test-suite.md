# Prompt Spaghetti Regression Test Suite

## Overview

This document defines the comprehensive regression test suite for the Prompt Spaghetti brownfield rebuild. All existing functionality must pass these tests before new features are deployed.

## Test Categories

### 1. Core Graph Functionality

#### 1.1 Graph Creation & Manipulation
- [ ] Create new empty graph
- [ ] Add nodes of each existing type (TextBlock, WeightedChoice, Concat, Variable)
- [ ] Delete nodes without breaking connections
- [ ] Create valid connections between compatible nodes
- [ ] Prevent invalid connections (type mismatches)
- [ ] Duplicate nodes with preserved settings
- [ ] Undo/Redo graph operations
- [ ] Clear entire graph

#### 1.2 Graph Persistence
- [ ] Save graph to localStorage
- [ ] Load saved graph from localStorage
- [ ] Export graph to .psg file format
- [ ] Import .psg file and restore graph
- [ ] Handle corrupted save data gracefully
- [ ] Autosave functionality (5-second debounce)

#### 1.3 Graph Validation
- [ ] Detect cycles in graph
- [ ] Validate node connections
- [ ] Show validation errors in UI
- [ ] Prevent execution of invalid graphs
- [ ] Clear validation errors when fixed

### 2. Node Types & Execution

#### 2.1 TextBlock Node
- [ ] Create TextBlock with text content
- [ ] Edit text content via inspector
- [ ] Execute outputs exact text
- [ ] Handle empty text gracefully
- [ ] Support multi-line text

#### 2.2 WeightedChoice Node
- [ ] Create WeightedChoice with options
- [ ] Add/remove choices dynamically
- [ ] Adjust weights via sliders
- [ ] Weights normalize to 100%
- [ ] Deterministic selection with seed
- [ ] Equal distribution validation

#### 2.3 Concat Node
- [ ] Concatenate multiple inputs
- [ ] Custom separator support
- [ ] Handle empty inputs
- [ ] Preserve input order
- [ ] Dynamic input addition

#### 2.4 Variable Node
- [ ] Set variable values
- [ ] Get variable values
- [ ] Variable scoping rules
- [ ] Handle undefined variables
- [ ] Type preservation

### 3. Execution Engine

#### 3.1 Deterministic Execution
- [ ] Same seed produces identical output (100 runs)
- [ ] Different seeds produce different outputs
- [ ] Sub-seed generation consistency
- [ ] Execution order consistency
- [ ] Performance: <50ms for 100-node graph

#### 3.2 Preview System
- [ ] Generate multiple variations (10-20)
- [ ] Display execution time
- [ ] Copy individual results
- [ ] Export all results
- [ ] Handle execution errors gracefully

### 4. UI Components

#### 4.1 Graph Editor (React Flow)
- [ ] Pan and zoom controls
- [ ] Node selection (single/multi)
- [ ] Keyboard shortcuts work
- [ ] Context menus functional
- [ ] Minimap navigation
- [ ] Grid snap behavior

#### 4.2 Inspector Panel
- [ ] Display node properties
- [ ] Edit node values
- [ ] Real-time validation
- [ ] Collapse/expand sections
- [ ] Responsive resize

#### 4.3 Node Palette
- [ ] Drag nodes to canvas
- [ ] Node preview on hover
- [ ] Category organization
- [ ] Search functionality
- [ ] Keyboard navigation

### 5. API Endpoints

#### 5.1 Preview API
- [ ] POST /preview accepts valid graph
- [ ] Returns array of results
- [ ] Respects seed parameter
- [ ] Handles malformed input
- [ ] Performance: <1s for 20 variations

#### 5.2 Export API
- [ ] POST /export creates bundle
- [ ] Valid GeneratorBundle format
- [ ] Includes all node data
- [ ] Preserves connections
- [ ] ComfyUI compatibility

#### 5.3 Health Check
- [ ] GET /health returns 200
- [ ] Includes version info
- [ ] Reports system status

### 6. Data Integrity

#### 6.1 Migration Testing
- [ ] Old format graphs load correctly
- [ ] Data upgrade without loss
- [ ] Backward compatibility
- [ ] Version detection

#### 6.2 Edge Cases
- [ ] Very large graphs (500+ nodes)
- [ ] Deeply nested variables
- [ ] Circular variable references
- [ ] Unicode and special characters
- [ ] Maximum text lengths

### 7. Performance Baselines

#### 7.1 Load Time
- [ ] Initial page load: <2 seconds
- [ ] Graph load (100 nodes): <500ms
- [ ] First interaction: <100ms

#### 7.2 Runtime Performance
- [ ] 60 FPS during node dragging
- [ ] No memory leaks (1hr session)
- [ ] Smooth zoom/pan operations
- [ ] Preview generation: <1s

### 8. Browser Compatibility

#### 8.1 Supported Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### 8.2 Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (1024x768)
- [ ] Minimum: 1024x600

## Test Implementation

### Automated Tests

```javascript
// Jest test structure
describe('Regression: Graph Functionality', () => {
  describe('Graph Creation', () => {
    test('should create empty graph', async () => {
      // Test implementation
    });
  });
});

// Playwright E2E structure  
test.describe('Regression: Full User Flow', () => {
  test('should complete medieval demo', async ({ page }) => {
    // E2E test implementation
  });
});
```

### Manual Test Procedures

1. **Demo Flow Test**
   - Start with empty canvas
   - Create medieval merchant prompt
   - Generate 20 variations
   - Verify all UI interactions smooth
   - Time: Must complete in <30s

2. **Stress Test**
   - Create graph with 100+ nodes
   - Verify performance remains acceptable
   - Check memory usage
   - Test save/load with large graph

### CI/CD Integration

```yaml
# GitHub Actions workflow
regression-tests:
  - jest --testMatch="**/*.regression.test.{js,ts}"
  - playwright test --grep @regression
  - performance-benchmarks
  - visual-regression-tests
```

## Success Criteria

- All regression tests must pass before deployment
- No performance degradation >10%
- Zero breaking changes to existing workflows
- All existing keyboard shortcuts functional
- Data migration 100% successful

## Test Data

### Standard Test Graphs
1. `medieval-demo.psg` - Standard demo graph
2. `complex-100-nodes.psg` - Performance test
3. `edge-cases.psg` - Unicode, special chars
4. `legacy-format.psg` - Migration test

## Monitoring

Post-deployment monitoring for:
- Error rates on existing endpoints
- Performance metrics vs baselines
- User session success rates
- Feature adoption metrics

## Rollback Triggers

Automatic rollback if:
- Regression test failure rate >5%
- Performance degradation >50%
- Error rate increase >10x
- User reports of data loss