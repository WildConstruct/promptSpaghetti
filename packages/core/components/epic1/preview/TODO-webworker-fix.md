# WebWorker Implementation TODO

## Issue
The Epic1 preview system attempts to use WebWorkers for parallel graph execution, but encounters a MIME type error because Vite cannot directly import TypeScript files as workers.

## Temporary Solution
WebWorkers have been temporarily disabled in `PreviewEngine.ts` to prevent the MIME type error. The system now falls back to main thread execution.

## Proper Solution
To properly implement WebWorkers with Vite:

1. **Create a separate worker entry file** that can be built independently:
   ```typescript
   // execution.worker.entry.ts
   import './execution.worker';
   ```

2. **Update Vite config** to handle worker files:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     worker: {
       format: 'es',
       rollupOptions: {
         output: {
           entryFileNames: '[name].js'
         }
       }
     }
   });
   ```

3. **Use Vite's worker import syntax**:
   ```typescript
   import ExecutionWorker from './execution.worker?worker';
   const worker = new ExecutionWorker();
   ```

4. **Update WorkerPool** to accept Worker constructors instead of URLs:
   ```typescript
   class WorkerPool {
     constructor(
       workerConstructor: new () => Worker,
       minWorkers: number,
       maxWorkers: number
     ) {
       // Create workers using constructor
     }
   }
   ```

## Files to Update
- `/packages/core/components/epic1/preview/PreviewEngine.ts` - Re-enable worker initialization
- `/packages/core/components/epic1/preview/WorkerPool.ts` - Accept Worker constructors
- `/packages/core/components/epic1/preview/execution.worker.ts` - Ensure proper module exports
- `/client/vite.config.ts` - Add worker configuration

## Benefits of WebWorkers
- Parallel execution of multiple seeds
- Non-blocking UI during complex graph computations
- Better performance for large graphs
- Progress reporting without freezing the interface