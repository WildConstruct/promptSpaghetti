/**
 * Platform-specific adaptations exports
 */
export { SafeAreaInsets, getIOSSafeAreaInsets, IOSSafeAreaContext, IOSSafeAreaProvider, IOSNavigationBar, IOSNavigationBarProps, IOSTabBar, IOSTabBarProps, IOSSwitch, IOSSwitchProps, IOSActionSheet, IOSActionSheetProps, iOSHaptics, iOSStyles } from './ios/IOSAdaptations';
export { materialElevation, materialMotion, MaterialColorScheme, MaterialAppBar, MaterialAppBarProps, MaterialBottomNav, MaterialBottomNavProps, MaterialFAB, MaterialFABProps, MaterialSwitch, MaterialSwitchProps, MaterialRipple, MaterialSnackbar, MaterialSnackbarProps, materialStyles } from './android/AndroidAdaptations';
export { useHoverState, KeyboardShortcut, KeyboardShortcutsManager, useKeyboardShortcuts, DesktopTooltip, DesktopTooltipProps, DesktopContextMenu, DesktopContextMenuProps, DesktopWindowControls, DesktopWindowControlsProps, desktopShortcuts, desktopHoverStyles } from './desktop/DesktopAdaptations';
export { platformGestureConfigs, getPlatformGestureConfig, PlatformGestureHandler, PlatformGestureHandlerProps, PlatformScrollView, PlatformScrollViewProps, PlatformButton, PlatformButtonProps, platformGestureStyles } from './PlatformGestures';
export { NavigationItem, AdaptiveNavigation, AdaptiveNavigationProps, BreadcrumbItem, AdaptiveBreadcrumb, AdaptiveBreadcrumbProps } from './AdaptiveNavigation';
export { platformPerformanceConfig, getPlatformPerformanceConfig, OptimizedImage, OptimizedImageProps, OptimizedScroll, OptimizedScrollProps, OptimizedAnimation, OptimizedAnimationProps, usePlatformOptimization, platformOptimizationStyles } from './PlatformOptimizations';
/**
 * Platform detection utilities
 */
export { deviceDetector } from '../responsive/device-detection';
/**
 * Initialize platform-specific features
 */
export declare function initializePlatformAdaptations(options?: {
    enableHaptics?: boolean;
    enableOptimizations?: boolean;
    customStyles?: boolean;
}): void;
/**
 * React hook for platform features
 */
export declare function usePlatformFeatures(): {
    platform: any;
    os: any;
    browser: any;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isMacOS: boolean;
    isWindows: boolean;
    supportsTouch: boolean;
    supportsHaptics: boolean;
    supportsHover: boolean;
};
//# sourceMappingURL=index.d.ts.map