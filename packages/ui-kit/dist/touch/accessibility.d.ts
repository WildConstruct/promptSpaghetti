/**
 * Touch target accessibility utilities
 */
export interface TouchTargetConfig {
    minSize: number;
    preferredSize: number;
    padding: number;
    spacing: number;
}
export interface TouchTargetAnalysis {
    isAccessible: boolean;
    actualSize: {
        width: number;
        height: number;
    };
    recommendedSize: {
        width: number;
        height: number;
    };
    issues: string[];
    suggestions: string[];
}
/**
 * WCAG 2.1 Level AA and AAA touch target guidelines
 */
export declare const accessibilityGuidelines: {
    wcagAA: {
        minSize: number;
        preferredSize: number;
        padding: number;
        spacing: number;
    };
    wcagAAA: {
        minSize: number;
        preferredSize: number;
        padding: number;
        spacing: number;
    };
    ios: {
        minSize: number;
        preferredSize: number;
        padding: number;
        spacing: number;
    };
    material: {
        minSize: number;
        preferredSize: number;
        padding: number;
        spacing: number;
    };
    graphEditing: {
        minSize: number;
        preferredSize: number;
        padding: number;
        spacing: number;
    };
};
/**
 * Analyze touch target accessibility
 */
export declare function analyzeTouchTarget(
  element: HTMLElement,
  guideline?: keyof typeof accessibilityGuidelines
): TouchTargetAnalysis;
/**
 * Create accessible touch target wrapper
 */
export declare function createAccessibleTouchTarget(element: HTMLElement, config?: TouchTargetConfig): HTMLElement;
/**
 * Touch target visual debugging
 */
export declare function enableTouchTargetDebugging(show?: boolean): void;
/**
 * Touch target enhancement utilities
 */
export declare const touchTargetUtils: {
    /**
     * Ensure minimum touch target size
     */
    ensureMinimumSize(element: HTMLElement, minSize?: 44): void;
    /**
     * Add touch-friendly padding
     */
    addTouchPadding(element: HTMLElement, padding?: number): void;
    /**
     * Create invisible touch area extension
     */
    extendTouchArea(element: HTMLElement, extension?: number): void;
};
//# sourceMappingURL=accessibility.d.ts.map