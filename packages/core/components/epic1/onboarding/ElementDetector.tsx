/**
 * Robust Element Detector for Tutorial System
 * Provides reliable DOM element detection with retry logic and MutationObserver support
 */

export interface ElementDetectionOptions {
  selector: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  useMutationObserver?: boolean;
}

export interface ElementDetectionResult {
  element: HTMLElement | null;
  found: boolean;
  attempts: number;
  duration: number;
}

export class ElementDetector {
  /**
   * Find an element with robust detection strategies
   */
  static async findElement(options: ElementDetectionOptions): Promise<ElementDetectionResult> {
    const {
      selector,
      maxRetries = 10,
      retryDelay = 100,
      timeout = 5000,
      useMutationObserver = true
    } = options;

    const startTime = Date.now();
    let attempts = 0;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let overallTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let observer: MutationObserver | null = null;

    return new Promise((resolve) => {
      const cleanup = () => {
        if (retryTimeoutId) {
          clearTimeout(retryTimeoutId);
        }
        if (overallTimeoutId) {
          clearTimeout(overallTimeoutId);
        }

        if (observer) {
          observer.disconnect();
        }
      };

      const complete = (element: HTMLElement | null, found: boolean) => {
        cleanup();
        const duration = Date.now() - startTime;
        resolve({
          element,
          found,
          attempts,
          duration
        });
      };

      const attemptFind = () => {
        attempts++;
        const element = document.querySelector<HTMLElement>(selector);

        if (element) {
          console.log(`[ElementDetector] Found element "${selector}" after ${attempts} attempts (${Date.now() - startTime}ms)`);
          complete(element, true);
          return;
        }

        if (attempts >= maxRetries) {
          console.warn(`[ElementDetector] Element "${selector}" not found after ${attempts} attempts`);
          complete(null, false);
          return;
        }

        // Schedule next attempt
        retryTimeoutId = setTimeout(attemptFind, retryDelay);
      };

      // Set overall timeout
      overallTimeoutId = setTimeout(() => {
        console.warn(`[ElementDetector] Timeout: Element "${selector}" not found within ${timeout}ms`);
        complete(null, false);
      }, timeout);

      // Try to find element immediately
      const immediateElement = document.querySelector<HTMLElement>(selector);
      if (immediateElement) {
        console.log(`[ElementDetector] Found element "${selector}" immediately`);
        complete(immediateElement, true);
        return;
      }

      // Set up MutationObserver for dynamic content
      if (useMutationObserver) {
        observer = new MutationObserver(() => {
          // Check if our target element was added
          const element = document.querySelector<HTMLElement>(selector);
          if (element) {
            console.log(`[ElementDetector] Found element "${selector}" via MutationObserver after ${attempts} attempts`);
            complete(element, true);
          }
        });

        // Observe the entire document for changes
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'id', 'data-testid'] // Common attributes that change
        });
      }

      // Start the retry loop
      attemptFind();
    });
  }

  /**
   * Find multiple elements with the same selector
   */
  static async findElements(options: ElementDetectionOptions): Promise<ElementDetectionResult[]> {
    const result = await this.findElement(options);

    if (!result.found || !result.element) {
      return [result];
    }

    // Find all matching elements
    const allElements = Array.from(document.querySelectorAll<HTMLElement>(options.selector));

    return allElements.map(element => ({
      element,
      found: true,
      attempts: result.attempts,
      duration: result.duration
    }));
  }

  /**
   * Wait for an element to be removed from DOM
   */
  static async waitForRemoval(selector: string, timeout = 5000): Promise<boolean> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkRemoval = () => {
        const element = document.querySelector(selector);
        if (!element) {
          resolve(true);
          return;
        }

        if (Date.now() - startTime > timeout) {
          resolve(false);
          return;
        }

        setTimeout(checkRemoval, 50);
      };

      checkRemoval();
    });
  }

  /**
   * Check if an element is visible (not hidden by CSS)
   */
  static isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  /**
   * Wait for an element to become visible
   */
  static async waitForVisible(selector: string, timeout = 5000): Promise<ElementDetectionResult> {
    const result = await this.findElement({ selector, timeout });

    if (!result.found || !result.element) {
      return result;
    }

    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkVisibility = () => {
        if (result.element && this.isVisible(result.element)) {
          resolve({
            ...result,
            duration: Date.now() - startTime
          });
          return;
        }

        if (Date.now() - startTime > timeout) {
          resolve({
            element: result.element,
            found: false, // Found but not visible
            attempts: result.attempts,
            duration: Date.now() - startTime
          });
          return;
        }

        setTimeout(checkVisibility, 50);
      };

      checkVisibility();
    });
  }
}

export default ElementDetector;
