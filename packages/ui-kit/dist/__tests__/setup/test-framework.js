/**
 * Cross-platform testing framework setup
 */
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});
/**
 * Mock window.matchMedia for responsive tests
 */
export function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
/**
 * Mock IntersectionObserver for lazy loading tests
 */
export class MockIntersectionObserver {
  callback;
  elements = new Set();
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    this.elements.add(element);
    // Simulate immediate intersection
    this.callback(
      [
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: element.getBoundingClientRect(),
          intersectionRect: element.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        },
      ],
      this
    );
  }
  unobserve(element) {
    this.elements.delete(element);
  }
  disconnect() {
    this.elements.clear();
  }
}
global.IntersectionObserver = MockIntersectionObserver;
/**
 * Mock ResizeObserver for responsive tests
 */
export class MockResizeObserver {
  callback;
  elements = new Set();
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    this.elements.add(element);
    // Simulate resize
    this.callback(
      [
        {
          target: element,
          contentRect: element.getBoundingClientRect(),
          borderBoxSize: [{ inlineSize: 100, blockSize: 100 }],
          contentBoxSize: [{ inlineSize: 100, blockSize: 100 }],
          devicePixelContentBoxSize: [{ inlineSize: 100, blockSize: 100 }],
        },
      ],
      this
    );
  }
  unobserve(element) {
    this.elements.delete(element);
  }
  disconnect() {
    this.elements.clear();
  }
}
global.ResizeObserver = MockResizeObserver;
/**
 * Mock touch events
 */
export function createTouchEvent(type, touches) {
  const touchList = {
    length: touches.length,
    item: index => touches[index],
    ...touches.reduce((acc, touch, index) => ({ ...acc, [index]: touch }), {}),
  };
  return new Event(type, { bubbles: true });
}
/**
 * Mock platform detection
 */
export function mockPlatform(platform) {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: platform.userAgent || 'Mozilla/5.0',
  });
  Object.defineProperty(window.navigator, 'platform', {
    writable: true,
    value: platform.platform || 'MacIntel',
  });
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    writable: true,
    value: platform.maxTouchPoints || 0,
  });
  Object.defineProperty(window.navigator, 'vendor', {
    writable: true,
    value: platform.vendor || 'Google Inc.',
  });
}
/**
 * Platform presets
 */
export const platformPresets = {
  iPhone: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    platform: 'iPhone',
    maxTouchPoints: 5,
    vendor: 'Apple Computer, Inc.',
  },
  android: {
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36',
    platform: 'Linux armv81',
    maxTouchPoints: 5,
    vendor: 'Google Inc.',
  },
  desktop: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Win32',
    maxTouchPoints: 0,
    vendor: 'Google Inc.',
  },
  mac: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    platform: 'MacIntel',
    maxTouchPoints: 0,
    vendor: 'Apple Computer, Inc.',
  },
};
/**
 * Mock viewport size
 */
export function mockViewport(width, height) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}
/**
 * Viewport presets
 */
export const viewportPresets = {
  mobile: { width: 375, height: 667 }, // iPhone 8
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 }, // Full HD
  ultrawide: { width: 3440, height: 1440 }, // Ultrawide
};
/**
 * Mock safe area insets (iOS)
 */
export function mockSafeAreaInsets(insets) {
  const root = document.documentElement;
  root.style.setProperty('--sat', `${insets.top || 0}px`);
  root.style.setProperty('--sar', `${insets.right || 0}px`);
  root.style.setProperty('--sab', `${insets.bottom || 0}px`);
  root.style.setProperty('--sal', `${insets.left || 0}px`);
}
/**
 * Mock haptic feedback
 */
export function mockHapticFeedback() {
  const vibrate = jest.fn();
  Object.defineProperty(window.navigator, 'vibrate', {
    writable: true,
    value: vibrate,
  });
  return vibrate;
}
/**
 * Performance testing utilities
 */
export class PerformanceObserver {
  marks = new Map();
  mark(name) {
    this.marks.set(name, performance.now());
  }
  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (!start) {
      throw new Error(`Start mark "${startMark}" not found`);
    }
    if (endMark && !end) {
      throw new Error(`End mark "${endMark}" not found`);
    }
    return {
      name,
      duration: (end || performance.now()) - start,
      startTime: start,
    };
  }
  clear() {
    this.marks.clear();
  }
}
/**
 * Accessibility testing utilities
 */
export function checkAccessibility(element) {
  const issues = [];
  // Check for proper ARIA labels
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [tabindex]'
  );
  interactiveElements.forEach(el => {
    if (!el.getAttribute('aria-label') && !el.textContent?.trim()) {
      issues.push(`Interactive element missing accessible label: ${el.tagName}`);
    }
  });
  // Check for proper heading structure
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let lastLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    if (level > lastLevel + 1) {
      issues.push(`Heading level skipped: ${heading.tagName} after H${lastLevel}`);
    }
    lastLevel = level;
  });
  // Check for color contrast (simplified)
  const elementsWithColor = element.querySelectorAll('[style*="color"]');
  elementsWithColor.forEach(el => {
    // This is a simplified check - real contrast checking would be more complex
    const styles = window.getComputedStyle(el);
    if (styles.color && styles.backgroundColor) {
      // Add warning for potential contrast issues
      issues.push(`Check color contrast for element: ${el.tagName}`);
    }
  });
  return {
    passed: issues.length === 0,
    issues,
  };
}
/**
 * Visual regression testing setup
 */
export function setupVisualRegression() {
  // This would integrate with tools like Percy or Chromatic
  return {
    capture: (name, element) => {
      // In real implementation, this would capture screenshots
      console.log(`Visual regression capture: ${name}`);
      return Promise.resolve();
    },
    compare: (name, baseline, current) => {
      // In real implementation, this would compare images
      console.log(`Visual regression compare: ${name}`);
      return Promise.resolve({ match: true, diff: 0 });
    },
  };
}
/**
 * Test cleanup utilities
 */
export function cleanup() {
  // Reset all mocks
  jest.clearAllMocks();
  // Clear DOM
  document.body.innerHTML = '';
  // Reset viewport
  mockViewport(1024, 768);
  // Reset platform
  mockPlatform(platformPresets.desktop);
}
//# sourceMappingURL=test-framework.js.map
