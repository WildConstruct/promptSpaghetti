/**
 * Touch feedback system for visual and haptic responses
 */
import { GestureType } from './gestures';
export type HapticStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid' | 'selection' | 'success' | 'warning' | 'error';
export type VisualFeedbackType = 'ripple' | 'highlight' | 'scale' | 'glow' | 'pulse' | 'shake';
export interface HapticFeedbackConfig {
    enabled: boolean;
    intensity: number;
    duration: number;
    pattern?: number[];
}
export interface VisualFeedbackConfig {
    enabled: boolean;
    type: VisualFeedbackType;
    duration: number;
    color?: string;
    scale?: number;
    opacity?: number;
}
export interface TouchFeedbackConfig {
    haptic: HapticFeedbackConfig;
    visual: VisualFeedbackConfig;
    audio?: {
        enabled: boolean;
        volume: number;
        sound?: string;
    };
}
/**
 * Default feedback configurations for different gestures
 */
export declare const gestureFeedbackPresets: Record<GestureType, TouchFeedbackConfig>;
/**
 * Haptic feedback manager
 */
export declare class HapticFeedback {
    private static instance;
    private enabled;
    static getInstance(): HapticFeedback;
    constructor();
    isSupported(): boolean;
    setEnabled(enabled: boolean): void;
    trigger(style: HapticStyle | HapticFeedbackConfig): void;
    private triggerPreset;
    private triggerCustom;
}
/**
 * Visual feedback renderer
 */
export declare class VisualFeedback {
    private static activeEffects;
    static trigger(element: HTMLElement, config: VisualFeedbackConfig, position?: {
        x: number;
        y: number;
    }): void;
    private static createRipple;
    private static createHighlight;
    private static createScale;
    private static createGlow;
    private static createPulse;
    private static createShake;
}
/**
 * Combined touch feedback manager
 */
export declare class TouchFeedback {
    private haptic;
    trigger(gesture: GestureType, element?: HTMLElement, position?: {
        x: number;
        y: number;
    }, customConfig?: Partial<TouchFeedbackConfig>): void;
}
/**
 * CSS animations for visual feedback
 */
export declare const touchFeedbackStyles = "\n  @keyframes touch-pulse {\n    0% {\n      transform: scale(1);\n    }\n    50% {\n      transform: scale(1.05);\n    }\n    100% {\n      transform: scale(1);\n    }\n  }\n  \n  @keyframes touch-shake {\n    0%, 100% {\n      transform: translateX(0);\n    }\n    25% {\n      transform: translateX(-5px);\n    }\n    75% {\n      transform: translateX(5px);\n    }\n  }\n  \n  .touch-ripple {\n    will-change: transform, opacity;\n  }\n";
//# sourceMappingURL=feedback.d.ts.map