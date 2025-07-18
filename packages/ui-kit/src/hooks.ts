/**
 * UI Kit hooks for cross-platform functionality
 */

export * from './hooks/useTheme';
export * from './hooks/useResponsive';
export * from './hooks/usePlatform';
export * from './hooks/useUIState';

// Re-export specific hooks for convenience
export { useTheme, useThemeControls } from './hooks/useTheme';
export { useResponsive, useBreakpoint, useMediaQuery } from './hooks/useResponsive';
export { 
  usePlatform, 
  useIsMobile, 
  useIsDesktop, 
  useIsWeb,
  useTouchSupport,
  useHoverSupport,
  useKeyboardSupport
} from './hooks/usePlatform';
export { 
  useUIState, 
  useSelectedNode, 
  useInspectorState, 
  usePaletteState,
  useThemeState
} from './hooks/useUIState';