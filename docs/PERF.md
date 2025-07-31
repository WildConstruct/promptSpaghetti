# Performance Metrics & Optimization

This document tracks performance metrics, optimizations, and benchmarks for the PromptScape Randomizer Graph application.

## Performance Targets

- **Graph Execution**: Generate 5 prompt variants in < 1 second
- **Memory Usage**: Peak memory < 500 MB during execution
- **UI Responsiveness**: Maintain ≥ 30 FPS during canvas interactions
- **Large Graph Support**: Support up to 1000 nodes with virtualization

## Current Optimizations

### React Component Optimizations

1. **Memoized Node Components**
   - `GraphNode` component wrapped with `React.memo`
   - `NodeRender` component in `GraphEditor` memoized to prevent unnecessary re-renders
   - Reduces render cycles when node data hasn't changed

2. **Stable References**
   - `nodeTypes` mapping memoized with `useMemo`
   - Event handlers wrapped with `useCallback` to prevent child re-renders
   - Palette state management optimized to minimize re-renders

### Canvas Performance

3. **Debounced Operations**
   - Graph validation debounced to 300ms
   - Preview execution debounced to 500ms after graph changes
   - Autosave debounced to 5 seconds

4. **Efficient State Management**
   - Zustand store for centralized state management
   - Selective state updates to minimize React re-renders
   - Optimized edge and node styling calculations

### Virtualization (Planned)

5. **Canvas Virtualization**
   - For graphs with >500 nodes, render only visible nodes
   - Implement viewport-based culling
   - Use React-Flow's built-in performance features

## Performance Test Results

### Baseline Measurements

| Metric                       | Target    | Current | Status     |
| ---------------------------- | --------- | ------- | ---------- |
| 250-node graph FPS           | ≥30 FPS   | TBD     | ⏳ Pending |
| Memory usage (250 nodes)     | <500 MB   | TBD     | ⏳ Pending |
| Graph execution (5 variants) | <1 second | TBD     | ⏳ Pending |
| Bundle size                  | <5 MB     | TBD     | ⏳ Pending |

### Test Scenarios

1. **Large Graph Rendering**
   - 250 nodes distributed across canvas
   - Measure FPS during pan/zoom operations
   - Monitor memory usage during interactions

2. **Graph Execution Performance**
   - Complex graph with multiple weighted choices
   - Measure execution time for 5 sequential runs
   - Profile memory allocation during execution

3. **UI Responsiveness**
   - Rapid node creation/deletion
   - Edge connection performance
   - Inspector sidebar updates

## Monitoring Setup

### Development Monitoring

```bash
# Run performance tests
npm run test:performance

# Profile with Chrome DevTools
npm run dev
# Open Chrome DevTools > Performance tab
# Record during heavy graph operations
```

### CI Performance Monitoring

Performance tests run automatically on:

- Pull requests to main branch
- Nightly builds
- Release candidates

### Performance Regression Detection

- Automated performance tests fail if:
  - FPS drops below 25 (warning at 30)
  - Memory usage exceeds 600MB (warning at 500MB)
  - Execution time exceeds 1.5s (warning at 1s)

## Bundle Size Analysis

### Current Bundle Sizes

```bash
# Analyze bundle size
npm run build
npm run analyze-bundle
```

**Target breakdown:**

- Core application: <2MB
- React-Flow: ~1MB
- Dependencies: <2MB
- Total: <5MB

### Optimization Strategies

1. **Code Splitting**
   - Lazy load non-critical components
   - Split node type implementations
   - Dynamic imports for heavy libraries

2. **Tree Shaking**
   - Remove unused React-Flow features
   - Optimize icon imports
   - Eliminate dead code

3. **Asset Optimization**
   - Compress images and icons
   - Use SVG sprites for icons
   - Optimize font loading

## Memory Management

### Memory Leak Prevention

1. **Event Listeners**
   - Properly cleanup event listeners in useEffect
   - Cancel pending operations on unmount
   - Clear timeouts and intervals

2. **State Management**
   - Avoid memory leaks in Zustand store
   - Clear large data structures when not needed
   - Implement proper cleanup in custom hooks

3. **React-Flow Integration**
   - Proper cleanup of React-Flow instances
   - Avoid memory leaks in node/edge handlers
   - Clear cached data on graph changes

### Memory Profiling

```javascript
// Monitor memory usage in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (performance.memory) {
      console.log('Memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      });
    }
  }, 10000);
}
```

## Web Worker Optimization (Future)

For CPU-intensive operations:

1. **Graph Execution**
   - Move complex graph traversal to Web Worker
   - Prevent UI blocking during heavy computation
   - Implement cancellation support

2. **Graph Validation**
   - Offload validation to Web Worker for large graphs
   - Implement progressive validation
   - Cache validation results

## Performance Best Practices

### Development Guidelines

1. **Component Design**
   - Use React.memo for expensive components
   - Implement proper shouldComponentUpdate logic
   - Avoid inline object/function creation in render

2. **State Management**
   - Minimize state updates
   - Use selective subscriptions
   - Implement proper memoization

3. **Event Handling**
   - Debounce expensive operations
   - Use passive event listeners where possible
   - Implement proper cleanup

### Testing Requirements

1. **Performance Tests**
   - All new features must include performance tests
   - Measure performance impact of changes
   - Ensure no regressions in key metrics

2. **Profiling**
   - Profile before optimizing
   - Use Chrome DevTools Performance tab
   - Measure real-world usage patterns

## Future Optimizations

### Planned Improvements

1. **Canvas Virtualization**
   - Implement viewport-based rendering
   - Add node clustering for dense graphs
   - Optimize edge rendering for large graphs

2. **Streaming Updates**
   - Implement incremental graph updates
   - Add real-time collaboration support
   - Optimize network payload sizes

3. **Advanced Caching**
   - Cache computed node layouts
   - Implement smart invalidation
   - Add persistent caching layer

### Performance Roadmap

- **Q1**: Canvas virtualization for >500 nodes
- **Q2**: Web Worker integration for heavy operations
- **Q3**: Advanced caching and streaming updates
- **Q4**: Performance monitoring dashboard

## Troubleshooting

### Common Performance Issues

1. **Slow Canvas Interactions**
   - Check for unnecessary re-renders
   - Profile React component updates
   - Verify event handler efficiency

2. **Memory Growth**
   - Look for event listener leaks
   - Check for uncleaned state
   - Profile memory allocations

3. **Bundle Size Growth**
   - Analyze import statements
   - Check for duplicate dependencies
   - Review chunk splitting strategy

### Debug Tools

```bash
# Performance profiling
npm run dev:profile

# Memory analysis
npm run analyze:memory

# Bundle analysis
npm run analyze:bundle
```

---

_Last updated: 2025-07-15_
_Next review: 2025-08-15_
