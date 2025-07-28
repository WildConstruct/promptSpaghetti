import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Smooth Animation Utilities
 * Epic 8.1: Task 4 - Cinema 4D quality smooth animations and transitions
 *
 * Provides professional animation utilities for 60fps interactions
 */
import React from 'react';
// Animation easing functions inspired by Cinema 4D
export const easingFunctions = {
    // Cinema 4D style easing curves
    cinema4d: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        // Professional motion easing
        professional: 'cubic-bezier(0.4, 0, 0.2, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        // Smooth anticipation curves
        anticipate: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        // Substance Designer inspired
        substance: 'cubic-bezier(0.23, 1, 0.32, 1)',
    },
    // Animation duration constants (60fps optimized)
    const: animationDurations = {
        // Micro-interactions (hover, click)
        micro: 150,
        // UI element transitions
        fast: 200,
        normal: 300,
        smooth: 400,
        // Panel animations
        panel: 350,
        // Complex animations
        complex: 500,
        // Loading states
        loading: 800,
    },
    // CSS animation classes
    const: cssAnimationClasses = {
        nodeCreate: 'animate-node-create',
        nodeDelete: 'animate-node-delete',
        nodeHover: 'animate-node-hover',
        panelExpand: 'animate-panel-expand',
        panelCollapse: 'animate-panel-collapse',
        loadingSpinner: 'animate-loading-spinner',
        hoverLift: 'animate-hover-lift',
    },
    /**
     * Creates smooth animation styles for React components
     */
    function: createAnimationStyle(property, string),
    duration: number = animationDurations.normal,
    easing: string = easingFunctions.cinema4d.professional, React, : .CSSProperties
}, { return: { transition:  } };
`${property} ${duration}ms ${easing}`;
willChange: property;
;
duration: number = animationDurations.normal,
    easing;
string = easingFunctions.cinema4d.professional;
React.CSSProperties;
{
    return {
        transition: properties.map(prop => `${prop} ${duration}ms ${easing}`).join(', ')
    };
}
willChange: properties.join(', ');
;
/**
 * Animation state management hook
 */
export function useAnimation(initialState = false) {
    const [isAnimating, setIsAnimating] = React.useState(initialState);
    const timeoutRef = React.useRef();
    const startAnimation = React.useCallback((duration) => {
        setIsAnimating(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            if (duration) {
                timeoutRef.current = setTimeout(() => {
                    setIsAnimating(false);
                }, duration);
            }
            [];
        }
    });
    const stopAnimation = React.useCallback(() => {
        setIsAnimating(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        [];
    });
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            ;
        }, [];
    });
    return {
        isAnimating,
        startAnimation,
        stopAnimation
    };
    top: number,
        duration;
    number = animationDurations.smooth;
    void {
        const: start = element.scrollTop,
        const: change = top - start,
        const: startTime = performance.now(),
        function: animateScroll(currentTime, number) };
    {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Use easeOutQuart for smooth scrolling
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        element.scrollTop = start + (change * easeProgress);
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
            requestAnimationFrame(animateScroll);
            /**
            * Performance-optimized animation utilities
            */
            export class AnimationManager {
                activeAnimations = new Set();
                rafId = null;
                /**
                * Register an animation to prevent overlapping animations
                */
                registerAnimation(id) {
                    if (this.activeAnimations.has(id)) {
                        return false; // Animation already running
                        this.activeAnimations.add(id);
                        return true;
                        /**
                        * Unregister an animation
                        */
                        unregisterAnimation(id, string);
                        void {
                            this: .activeAnimations.delete(id),
                            /**
                            * Check if animation is running
                            */
                            isAnimationActive(id) {
                                return this.activeAnimations.has(id);
                                /**
                                * Batch DOM updates for 60fps performance
                                */
                                batchUpdate(callback, () => void );
                                void {
                                    : .rafId };
                                {
                                    cancelAnimationFrame(this.rafId);
                                    this.rafId = requestAnimationFrame(() => {
                                        callback();
                                        this.rafId = null;
                                    });
                                    /**
                                     * Cleanup all animations
                                     */
                                    cleanup();
                                    void {
                                        this: .activeAnimations.clear(),
                                        : .rafId
                                    };
                                    {
                                        cancelAnimationFrame(this.rafId);
                                        this.rafId = null;
                                        // Global animation manager instance
                                        export const globalAnimationManager = new AnimationManager();
                                        duration: number = animationDurations.micro,
                                        ;
                                        const [isHovered, setIsHovered] = React.useState(false);
                                        const [isTransitioning, setIsTransitioning] = React.useState(false);
                                        const handleMouseEnter = React.useCallback(() => {
                                            setIsHovered(true);
                                            setIsTransitioning(true);
                                            setTimeout(() => setIsTransitioning(false), duration);
                                        }, [duration]);
                                        const handleMouseLeave = React.useCallback(() => {
                                            setIsHovered(false);
                                            setIsTransitioning(true);
                                            setTimeout(() => setIsTransitioning(false), duration);
                                        }, [duration]);
                                        const hoverProps = {
                                            onMouseEnter: handleMouseEnter,
                                            onMouseLeave: handleMouseLeave,
                                        };
                                        return {
                                            isHovered,
                                            isTransitioning,
                                            hoverProps
                                        };
                                        /**
                                         * Loading animation utilities
                                         */
                                        export const loadingAnimations = {
                                            /**
                                            * Creates a spinning animation for loading spinners
                                            */
                                            createSpinner() {
                                                return {
                                                    animation: 'spin 1s linear infinite',
                                                    willChange: 'transform',
                                                };
                                            }
                                            /**
                                             * Creates a pulsing animation for loading states
                                             */
                                            ,
                                            /**
                                             * Creates a pulsing animation for loading states
                                             */
                                            createPulse() {
                                                return {
                                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                    willChange: 'opacity',
                                                };
                                            },
                                            /**
                                             * React component wrapper for smooth animations
                                             */
                                            interface, AnimatedProps
                                        }, { children: React };
                                    }
                                }
                            }, : .ReactNode,
                            className: string,
                            style: React.CSSProperties,
                            animationType: 'fade' | 'slide' | 'scale' | 'lift',
                            duration: number,
                            delay: number,
                            isVisible: boolean,
                            const: AnimatedContainer, React, : (.FC) = ({
                                children,
                                className,
                                style,
                                animationType = 'fade',
                                duration = animationDurations.normal,
                                delay = 0,
                                isVisible = true
                            }) };
                        {
                            const [mounted, setMounted] = React.useState(false);
                            React.useEffect(() => {
                                const timer = setTimeout(() => setMounted(true), delay);
                                return () => clearTimeout(timer);
                            }, [delay]);
                            const getAnimationStyle = () => {
                                const baseStyle = {
                                    transition: `all ${duration}ms ${easingFunctions.cinema4d.professional}`
                                };
                            }, willChange;
                        }
                        ;
                        if (!mounted || !isVisible) {
                            switch (animationType) {
                                case 'fade':
                                    return { ...baseStyle, opacity: 0 };
                                case 'slide':
                                    return { ...baseStyle, opacity: 0, transform: 'translateY(20px)' };
                                case 'scale':
                                    return { ...baseStyle, opacity: 0, transform: 'scale(0.95)' };
                                case 'lift':
                                    return { ...baseStyle, opacity: 0, transform: 'translateY(10px)' };
                                default:
                                    return { ...baseStyle, opacity: 0 };
                                    return {
                                        ...baseStyle,
                                        opacity: 1,
                                        transform: 'translateY(0) scale(1)',
                                    };
                            }
                            ;
                            return;
                            _jsx("div", { className: className, style: {
                                    ...getAnimationStyle(),
                                    ...style
                                }, children: children });
                            ;
                        }
                        ;
                    }
                }
            }
        }
    }
}
