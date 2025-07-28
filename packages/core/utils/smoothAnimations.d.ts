/**
 * Smooth Animation Utilities
 * Epic 8.1: Task 4 - Cinema 4D quality smooth animations and transitions
 *
 * Provides professional animation utilities for 60fps interactions
 */
import React from 'react';
export declare const easingFunctions: {
    cinema4d: {,
        ease: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
        professional: string;
        sharp: string;
        anticipate: string;
        bounce: string;
        substance: string;
    };
};
export declare const animationDurations: {
    micro: number;
    fast: number;
    normal: number;
    smooth: number;
    panel: number;
    complex: number;
    loading: number;
};
export declare const cssAnimationClasses: {
    nodeCreate: string;
    nodeDelete: string;
    nodeHover: string;
    panelExpand: string;
    panelCollapse: string;
    loadingSpinner: string;
    hoverLift: string;
};
/**
 * Creates smooth animation styles for React components
 */
export declare function createAnimationStyle(property: string, duration?: number, easing?: string): React.CSSProperties;
/**
 * Creates a comprehensive transition style for multiple properties
 */
export declare function createSmoothTransition(properties: string[], duration?: number, easing?: string): React.CSSProperties;
/**
 * Animation state management hook
 */
export declare function useAnimation(initialState?: boolean): {
    isAnimating: boolean;
    startAnimation: (duration?: number) => void;
    stopAnimation: () => void;
};
/**
 * Smooth scroll utilities
 */
export declare function smoothScrollTo(element: HTMLElement, top: number, duration?: number): void;
/**
 * Performance-optimized animation utilities
 */
export declare class AnimationManager {
    private activeAnimations;
    private rafId;
    /**
     * Register an animation to prevent overlapping animations
     */
    registerAnimation(id: string): boolean;
    /**
     * Unregister an animation
     */
    unregisterAnimation(id: string): void;
    /**
     * Check if animation is running
     */
    isAnimationActive(id: string): boolean;
    /**
     * Batch DOM updates for 60fps performance
     */
    batchUpdate(callback: () => void): void;
    /**
     * Cleanup all animations
     */
    cleanup(): void;

export declare const globalAnimationManager: AnimationManager;
/**
 * Hook for managing element hover states with smooth transitions
 */
export declare function useSmoothHover(duration?: number): {
    isHovered: boolean;
    isTransitioning: boolean;
    hoverProps: {,
        onMouseEnter: () => void;
        onMouseLeave: () => void;
    };
};
/**
 * Loading animation utilities
 */
export declare const loadingAnimations: {
    /**
     * Creates a spinning animation for loading spinners
     */
    createSpinner(): React.CSSProperties;
    /**
     * Creates a pulsing animation for loading states
     */
    createPulse(): React.CSSProperties;
};
/**
 * React component wrapper for smooth animations
 */
interface AnimatedProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    animationType?: 'fade' | 'slide' | 'scale' | 'lift';
    duration?: number;
    delay?: number;
    isVisible?: boolean;

export declare const AnimatedContainer: React.FC<AnimatedProps>;
export {};
//# sourceMappingURL=smoothAnimations.d.ts.map