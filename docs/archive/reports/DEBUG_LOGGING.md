# Debug Logging System

## Overview

To improve performance, particularly during mouse movements and node dragging, console.log statements have been wrapped with conditional debug flags. This prevents unnecessary logging in production while allowing developers to enable detailed logging when needed.

## Debug Flags

The following debug flags are available:

- `DEBUG` - Master debug flag (must be true for any logging)
- `DEBUG_EPIC1` - Epic1-specific logs (node creation, dragging, etc.)
- `DEBUG_EXECUTION` - Execution engine logs (graph execution, node processing)

## Enabling Debug Logs

### Method 1: Environment Variables (Recommended for Development)

```bash
# Enable all debug logs
REACT_APP_DEBUG=true npm run dev

# Enable specific debug categories
REACT_APP_DEBUG=true REACT_APP_DEBUG_EPIC1=true npm run dev
REACT_APP_DEBUG=true REACT_APP_DEBUG_EXECUTION=true npm run dev
```

### Method 2: Browser Console (Runtime Toggle)

```javascript
// Enable all debug logs
localStorage.setItem('DEBUG', 'true');

// Enable specific categories
localStorage.setItem('DEBUG_EPIC1', 'true');
localStorage.setItem('DEBUG_EXECUTION', 'true');

// Disable debug logs
localStorage.removeItem('DEBUG');
localStorage.removeItem('DEBUG_EPIC1');
localStorage.removeItem('DEBUG_EXECUTION');

// Refresh the page after changing settings
location.reload();
```

## Debug Functions

The following debug functions are available in the codebase:

- `debugLog()` - General debug logging
- `debugLogEpic1()` - Epic1-specific logging
- `debugLogExecution()` - Execution engine logging

## Performance Impact

With debug logging disabled (default in production):
- No console.log statements execute during mouse movement or node dragging
- Significantly improved performance during interactive operations
- No impact on production bundle size (logging code is still present but not executed)

## Files Updated

The following files have been updated to use conditional debug logging:

### Epic1 Components
- `/packages/core/components/epic1/Epic1GraphEditor.tsx` - Removed frequent state change logs
- `/packages/core/components/epic1/NodeToolbar.tsx` - Wrapped drag event logs
- `/packages/core/components/epic1/NodePalette.tsx` - Wrapped drag and mount logs
- `/packages/core/components/epic1/preview/PreviewPanel.tsx` - Wrapped preview update logs
- `/packages/core/components/epic1/nodes/nodeFactory.ts` - Wrapped node conversion logs

### Execution Engine
- `/packages/core/runtime/nodes/epic1/Epic1ExecutionEngine.ts` - Wrapped execution logs

### Editor Container
- `/client/src/Epic1EditorContainer.tsx` - Removed frequent history and state change logs

## Note on Intentional Console Logs

Some console.log statements were intentionally preserved:
- `/client/src/Epic1Editor/Epic1EditorContainer.tsx` - Console toggle feature (user-triggered)
- Error and warning logs (console.error, console.warn) - Important for debugging issues

## Best Practices

1. Use debug functions instead of direct console.log for performance-sensitive code
2. Choose the appropriate debug category for your logs
3. Remove or wrap console.log statements in code that executes frequently
4. Keep error and warning logs unwrapped for production debugging