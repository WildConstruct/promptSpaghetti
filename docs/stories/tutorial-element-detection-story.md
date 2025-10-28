# TUTORIAL-ELEMENT-DETECTION - Story

## User Story

**As a** tutorial system  
**I want** robust detection of dynamic DOM elements  
**So that** tutorial steps can reliably find and highlight target elements

## Acceptance Criteria

- [ ] Tutorial can find elements that load after initial page load
- [ ] MutationObserver detects dynamically created elements
- [ ] Retry logic handles timing issues with React rendering
- [ ] Fallback mechanisms when elements can't be found
- [ ] No tutorial steps fail due to missing target elements
- [ ] Performance impact is minimal (< 5ms per detection attempt)

## Technical Details

### Current Problem

- TutorialOverlay.tsx uses basic `document.querySelector()` (line 56)
- Fails to find React-rendered elements that load asynchronously
- No retry logic for elements that appear after tutorial step starts
- Tutorial steps fail silently when targets don't exist

### Required Changes

#### 1. Create Robust Element Detector

**New File**: `packages/core/components/epic1/onboarding/ElementDetector.tsx`

```typescript
export interface ElementDetectionOptions {
  selector: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  useMutationObserver?: boolean;
}

export class ElementDetector {
  static async findElement(
    options: ElementDetectionOptions
  ): Promise<HTMLElement | null> {
    const {
      selector,
      maxRetries = 10,
      retryDelay = 100,
      timeout = 5000,
      useMutationObserver = true
    } = options;

    return new Promise(resolve => {
      let retries = 0;
      let timeoutId: NodeJS.Timeout;
      let observer: MutationObserver | null = null;

      const attemptFind = () => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          cleanup();
          resolve(element);
          return;
        }

        retries++;
        if (retries >= maxRetries) {
          cleanup();
          resolve(null);
          return;
        }

        timeoutId = setTimeout(attemptFind, retryDelay);
      };

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (observer) observer.disconnect();
      };

      // Set overall timeout
      setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeout);

      // Start detection
      if (useMutationObserver) {
        observer = new MutationObserver(() => {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            cleanup();
            resolve(element);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'id']
        });
      }

      attemptFind();
    });
  }
}
```

#### 2. Update TutorialOverlay.tsx

**File**: `packages/core/components/epic1/onboarding/TutorialOverlay.tsx`

**Replace basic querySelector with robust detection:**

```typescript
// CURRENT (line 56):
const element = document.querySelector(step.target) as HTMLElement;

// REPLACED WITH:
const element = await ElementDetector.findElement({
  selector: step.target,
  maxRetries: 15,
  retryDelay: 200,
  timeout: 10000
});
```

### Additional Changes Needed

- Import ElementDetector in TutorialOverlay.tsx
- Handle async nature of element detection
- Add loading states while detecting elements
- Graceful fallback when elements can't be found
- Update error handling for detection failures

### Testing Steps

1. Start tutorial on fresh page load
2. Verify all target elements are found reliably:
   - `.react-flow__viewport` (empty canvas)
   - `.react-flow__node` (created nodes)
   - `.react-flow__node-weighted` (weighted choice nodes)
3. Test with slow network conditions
4. Verify no performance degradation
5. Test error handling when elements don't exist

### Dependencies

- Independent story, can be implemented in parallel
- Will improve reliability of all tutorial steps
- Foundation for TUTORIAL-STEP-VALIDATION

### Definition of Done

- All tutorial target elements detected reliably
- MutationObserver working for dynamic content
- Reasonable timeout and retry limits
- Performance impact within acceptable range
- Graceful error handling for edge cases
