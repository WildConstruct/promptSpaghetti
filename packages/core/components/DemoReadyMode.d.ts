/**
 * Epic 8.1: Task 5 - Demo-Ready Polish Component
 *
 * This component provides a professional presentation mode that:
 * - Hides all development/technical elements
 * - Optimizes for presentation screens (1920x1080, 4K)
 * - Ensures professional branding and appearance
 * - Provides performance monitoring for smooth demos
 */
import React from 'react';
interface DemoReadyModeProps {
    children: React.ReactNode;
    enabled?: boolean;
    onToggle?: (enabled: boolean) => void;
}
export declare const DemoReadyMode: React.FC<DemoReadyModeProps>;
export declare const useDemoMode: () => {
    enabled: boolean;
    toggle: () => void;
    enable: () => void;
    disable: () => void;
};
export default DemoReadyMode;
//# sourceMappingURL=DemoReadyMode.d.ts.map