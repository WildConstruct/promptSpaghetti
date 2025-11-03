/**
 * Tests for ElementDetector utility
 * Tests DOM element detection with various scenarios
 */

import { jest } from '@jest/globals';
import { ElementDetector, ElementDetectionResult } from '../ElementDetector';

// Mock DOM elements
const mockElement = {
  getBoundingClientRect: () => ({
    top: 100,
    left: 100,
    width: 200,
    height: 100,
    right: 300,
    bottom: 200
  }),
  offsetWidth: 200,
  offsetHeight: 100,
  style: {
    display: 'block',
    visibility: 'visible',
    opacity: '1'
  }
} as HTMLElement;

// Mock document.querySelector
const originalQuerySelector = document.querySelector;
const mockQuerySelector = jest.fn();

describe('ElementDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.querySelector = mockQuerySelector;

    // Mock getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: jest.fn(() => ({
        display: 'block',
        visibility: 'visible',
        opacity: '1'
      })),
      configurable: true
    });
  });

  afterEach(() => {
    document.querySelector = originalQuerySelector;
  });

  describe('findElement', () => {
    it('should find element immediately if available', async () => {
      mockQuerySelector.mockReturnValue(mockElement);

      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '.test-element'
      });

      expect(result.found).toBe(true);
      expect(result.element).toBe(mockElement);
      expect(result.attempts).toBe(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should retry until element is found', async () => {
      let callCount = 0;
      mockQuerySelector.mockImplementation(() => {
        callCount++;
        return callCount >= 3 ? mockElement : null;
      });

      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '.test-element',
        maxRetries: 5,
        retryDelay: 10
      });

      expect(result.found).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should return not found if element never appears', async () => {
      mockQuerySelector.mockReturnValue(null);

      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '.non-existent',
        maxRetries: 2,
        retryDelay: 10
      });

      expect(result.found).toBe(false);
      expect(result.element).toBe(null);
      expect(result.attempts).toBe(2); // initial check + 2 scheduled attempts
    });

    it('should respect timeout', async () => {
      mockQuerySelector.mockReturnValue(null);

      const startTime = Date.now();
      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '.test-element',
        timeout: 50,
        retryDelay: 20
      });

      expect(result.found).toBe(false);
      expect(result.duration).toBeLessThan(100); // Should timeout quickly
    });

    it('should use MutationObserver when enabled', async () => {
      // Mock MutationObserver
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();

      global.MutationObserver = jest.fn(() => ({
        observe: mockObserve,
        disconnect: mockDisconnect
      }));

      mockQuerySelector.mockReturnValue(null);

      await ElementDetector.findElement({
        selector: '.test-element',
        useMutationObserver: true
      });

      expect(mockObserve).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'data-testid']
      });
    });

    it('should work without MutationObserver', async () => {
      mockQuerySelector.mockReturnValue(mockElement);

      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '.test-element',
        useMutationObserver: false
      });

      expect(result.found).toBe(true);
    });

    it('should handle querySelector errors gracefully', async () => {
      mockQuerySelector.mockImplementation(() => {
        throw new Error('Query selector error');
      });

      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '.test-element'
      });

      expect(result.found).toBe(false);
    });
  });

  describe('findElements', () => {
    it('should find multiple elements with same selector', async () => {
      const elements = [mockElement, { ...mockElement, id: 'element2' }];
      mockQuerySelector.mockReturnValue(elements[0]);
      document.querySelectorAll = jest.fn(() => elements as any);

      const results: ElementDetectionResult[] =
        await ElementDetector.findElements({
          selector: '.test-elements'
        });

      expect(results).toHaveLength(2);
      expect(results[0].found).toBe(true);
      expect(results[1].found).toBe(true);
    });

    it('should handle empty results', async () => {
      mockQuerySelector.mockReturnValue(null);

      const results: ElementDetectionResult[] =
        await ElementDetector.findElements({
          selector: '.non-existent'
        });

      expect(results).toHaveLength(1);
      expect(results[0].found).toBe(false);
    });
  });

  describe('waitForRemoval', () => {
    it('should resolve when element is removed', async () => {
      let elementExists = true;
      mockQuerySelector.mockImplementation(() =>
        elementExists ? mockElement : null
      );

      setTimeout(() => {
        elementExists = false;
      }, 50);

      const result: boolean = await ElementDetector.waitForRemoval(
        '.test-element',
        1000
      );
      expect(result).toBe(true);
    });

    it('should timeout if element never removed', async () => {
      mockQuerySelector.mockReturnValue(mockElement);

      const result: boolean = await ElementDetector.waitForRemoval(
        '.test-element',
        50
      );
      expect(result).toBe(false);
    });
  });

  describe('isVisible', () => {
    it('should return true for visible element', () => {
      const visibleElement = {
        ...mockElement,
        offsetWidth: 200,
        offsetHeight: 100
      };

      const result: boolean = ElementDetector.isVisible(visibleElement);
      expect(result).toBe(true);
    });

    it('should return false for hidden element', () => {
      const hiddenElement = {
        ...mockElement,
        offsetWidth: 0,
        offsetHeight: 0
      };

      const result: boolean = ElementDetector.isVisible(hiddenElement);
      expect(result).toBe(false);
    });

    it('should return false for display none element', () => {
      const displayNoneElement = {
        ...mockElement,
        style: { display: 'none' }
      };

      // Mock getComputedStyle to return display: none
      (window.getComputedStyle as jest.Mock).mockReturnValue({
        display: 'none',
        visibility: 'visible',
        opacity: '1'
      });

      const result: boolean = ElementDetector.isVisible(displayNoneElement);
      expect(result).toBe(false);
    });

    it('should return false for invisible element', () => {
      const invisibleElement = {
        ...mockElement,
        style: { visibility: 'hidden' }
      };

      (window.getComputedStyle as jest.Mock).mockReturnValue({
        display: 'block',
        visibility: 'hidden',
        opacity: '1'
      });

      const result: boolean = ElementDetector.isVisible(invisibleElement);
      expect(result).toBe(false);
    });

    it('should return false for transparent element', () => {
      const transparentElement = {
        ...mockElement,
        style: { opacity: '0' }
      };

      (window.getComputedStyle as jest.Mock).mockReturnValue({
        display: 'block',
        visibility: 'visible',
        opacity: '0'
      });

      const result: boolean = ElementDetector.isVisible(transparentElement);
      expect(result).toBe(false);
    });
  });

  describe('waitForVisible', () => {
    it('should resolve when element becomes visible', async () => {
      let isVisible = false;
      const element = document.createElement('div');
      Object.defineProperty(element, 'offsetWidth', {
        get: () => (isVisible ? 100 : 0)
      });
      Object.defineProperty(element, 'offsetHeight', {
        get: () => (isVisible ? 100 : 0)
      });

      mockQuerySelector.mockImplementation(
        () => element as unknown as HTMLElement
      );

      setTimeout(() => {
        isVisible = true;
      }, 50);

      const result: ElementDetectionResult =
        await ElementDetector.waitForVisible('.test-element', 1000);

      expect(result.found).toBe(true);
      expect(result.element).toBe(element);
    });

    it('should timeout if element never becomes visible', async () => {
      mockQuerySelector.mockReturnValue({
        ...mockElement,
        offsetWidth: 0,
        offsetHeight: 0
      });

      const result: ElementDetectionResult =
        await ElementDetector.waitForVisible('.test-element', 50);

      expect(result.found).toBe(false);
      expect(result.element).toBeDefined();
    });
  });

  describe('Integration with real DOM', () => {
    it('should handle real DOM element detection', async () => {
      // Create a real element for testing
      const testElement = document.createElement('div');
      testElement.className = 'test-element-integration';
      testElement.id = 'test-element-123';
      document.body.appendChild(testElement);

      const previousQuerySelector = document.querySelector;
      document.querySelector = originalQuerySelector;

      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '.test-element-integration'
      });

      expect(result.found).toBe(true);
      expect(result.element).toBe(testElement);

      // Cleanup
      document.body.removeChild(testElement);
      document.querySelector =
        previousQuerySelector as typeof document.querySelector;
    });

    it('should handle complex selectors', async () => {
      const container = document.createElement('div');
      container.id = 'container';

      const child = document.createElement('span');
      child.className = 'child-element';
      container.appendChild(child);

      document.body.appendChild(container);

      const previousQuerySelector = document.querySelector;
      document.querySelector = originalQuerySelector;

      const result: ElementDetectionResult = await ElementDetector.findElement({
        selector: '#container .child-element'
      });

      expect(result.found).toBe(true);
      expect(result.element).toBe(child);

      // Cleanup
      document.body.removeChild(container);
      document.querySelector =
        previousQuerySelector as typeof document.querySelector;
    });
  });
});
