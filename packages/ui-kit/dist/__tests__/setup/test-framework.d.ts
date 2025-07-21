/**
 * Cross-platform testing framework setup
 */
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
/**
 * Mock window.matchMedia for responsive tests
 */
export declare function mockMatchMedia(matches?: boolean): void;
/**
 * Mock IntersectionObserver for lazy loading tests
 */
export declare class MockIntersectionObserver {
    private callback;
    private elements;
    constructor(callback: IntersectionObserverCallback);
    observe(element: Element): void;
    unobserve(element: Element): void;
    disconnect(): void;
}
/**
 * Mock ResizeObserver for responsive tests
 */
export declare class MockResizeObserver {
    private callback;
    private elements;
    constructor(callback: ResizeObserverCallback);
    observe(element: Element): void;
    unobserve(element: Element): void;
    disconnect(): void;
}
/**
 * Mock touch events
 */
export declare function createTouchEvent(type: string, touches: Array<{
    clientX: number;
    clientY: number;
    identifier: number;
}>): TouchEvent;
/**
 * Mock platform detection
 */
export declare function mockPlatform(platform: {
    userAgent?: string;
    platform?: string;
    maxTouchPoints?: number;
    vendor?: string;
}): void;
/**
 * Platform presets
 */
export declare     compare: (name: string, baseline: string, current: string) => Promise<{
        match: boolean;
        diff: number;
    }>;
};
/**
 * Test cleanup utilities
 */
export declare function cleanup(): void;
//# sourceMappingURL=test-framework.d.ts.map