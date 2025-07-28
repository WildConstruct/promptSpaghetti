/**
 * UI Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the user interface system
 */
import React from 'react';
import { BaseExtension, ExtensionContext, ExtensionValidationResult } from './ExtensionInterfaces';

// UI Extension Interface
export interface UIExtension extends BaseExtension {
  readonly extensionType: 'ui';
  // Component registration
  getComponentDefinitions(): UIComponentDefinition[];
  createComponentInstance(componentId: string, props: any): React.ComponentType<any>;
  // Theme contributions
  getThemeContributions(): ThemeContribution[];
  // Command contributions
  getCommandContributions(): CommandContribution[];
  // Menu contributions
  getMenuContributions(): MenuContribution[];
  // Keybinding contributions
  getKeybindingContributions(): KeybindingContribution[];
  // UI lifecycle hooks
  onUIInitialized?(context: ExtensionContext): void;
  onUIDestroyed?(context: ExtensionContext): void;
  onThemeChanged?(theme: Theme): void;
}

// UI Component Definition
export interface UIComponentDefinition {
  // Basic metadata
  id: string;
  name: string;
  category: UIComponentCategory;
  description: string;
  version: string;
  // Component class
  component: React.ComponentType<any>;
  // Props schema
  propsSchema?: any; // Zod schema for props validation
  // UI configuration
  ui: UIComponentUIConfiguration;
  // Runtime configuration
  runtime: UIComponentRuntimeConfiguration;
  // Metadata
  metadata: UIComponentMetadata;
}

// UI Component Categories
export enum UIComponentCategory {
  EDITOR = 'editor',
  PANEL = 'panel',
  MODAL = 'modal',
  TOOLBAR = 'toolbar',
  MENU = 'menu',
  WIDGET = 'widget',
  OVERLAY = 'overlay',
  CUSTOM = 'custom'
}

// UI Component UI Configuration
export interface UIComponentUIConfiguration {
  // Layout
  layout?: UIComponentLayout;
  // Styling
  styling?: UIComponentStyling;
  // Responsive behavior
  responsive?: UIComponentResponsive;
  // Accessibility
  accessibility?: UIComponentAccessibility;
}

// UI Component Layout
export interface UIComponentLayout {
  position?: 'fixed' | 'absolute' | 'relative' | 'sticky';
  zIndex?: number;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  resizable?: boolean;
  draggable?: boolean;
}

// UI Component Styling
export interface UIComponentStyling {
  className?: string;
  style?: React.CSSProperties;
  theme?: string;
  variant?: string;
  customCSS?: string;
}

// UI Component Responsive
export interface UIComponentResponsive {
  breakpoints?: {
    mobile?: UIComponentLayout;
    tablet?: UIComponentLayout;
    desktop?: UIComponentLayout;
  };
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

// UI Component Accessibility
export interface UIComponentAccessibility {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  focusable?: boolean;
  keyboardNavigation?: boolean;
  screenReaderSupport?: boolean;
}

// UI Component Runtime Configuration
export interface UIComponentRuntimeConfiguration {
  // Rendering
  lazy?: boolean;
  suspense?: boolean;
  errorBoundary?: boolean;
  // Performance
  performance?: UIComponentPerformance;
  // State management
  state?: UIComponentStateConfiguration;
  // Event handling
  events?: UIComponentEventConfiguration;
}

// UI Component Performance
export interface UIComponentPerformance {
  memo?: boolean;
  virtualizeList?: boolean;
  debounceUpdates?: number;
  throttleUpdates?: number;
  measurePerformance?: boolean;
}

// UI Component State Configuration
export interface UIComponentStateConfiguration {
  persist?: boolean;
  scope?: 'global' | 'session' | 'local';
  initialState?: any;
  reducer?: (state: any, action: any) => any;
}

// UI Component Event Configuration
export interface UIComponentEventConfiguration {
  preventDefault?: string[];
  stopPropagation?: string[];
  capture?: string[];
  passive?: string[];
}

// UI Component Metadata
export interface UIComponentMetadata {
  author: string;
  license: string;
  repository?: string;
  documentation?: string;
  examples?: UIComponentExample[];
  screenshots?: string[];
  // Compatibility
  compatibility?: {
    minVersion: string;
    maxVersion?: string;
    browsers?: string[];
    devices?: string[];
  };
  // Tags
  tags?: string[];
  keywords?: string[];
}

// UI Component Example
export interface UIComponentExample {
  name: string;
  description: string;
  props: any;
  code?: string;
  preview?: string;
}

// Theme Contribution
export interface ThemeContribution {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark' | 'auto';
  // Color palette
  colors: ThemeColors;
  // Typography
  typography: ThemeTypography;
  // Spacing
  spacing: ThemeSpacing;
  // Shadows
  shadows: ThemeShadows;
  // Borders
  borders: ThemeBorders;
  // Transitions
  transitions: ThemeTransitions;
  // Custom properties
  custom?: Record<string, any>;
}

// Theme Colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  // Extended colors
  extended?: Record<string, string>;
}

// Theme Typography
export interface ThemeTypography {
  fontFamily: string;
  fontSize: {,
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {,
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {,
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {,
    tight: string;
    normal: string;
    wide: string;
  };
}

// Theme Spacing
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  // Custom spacing
  custom?: Record<string, string>;
}

// Theme Shadows
export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  none: string;
  // Custom shadows
  custom?: Record<string, string>;
}

// Theme Borders
export interface ThemeBorders {
  width: {,
    thin: string;
    normal: string;
    thick: string;
  };
  radius: {,
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  style: {,
    solid: string;
    dashed: string;
    dotted: string;
  };
}

// Theme Transitions
export interface ThemeTransitions {
  duration: {,
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {,
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

// Command Contribution
export interface CommandContribution {
  id: string;
  title: string;
  description?: string;
  category?: string;
  icon?: string;
  // Command handler
  handler: CommandHandler;
  // Enablement
  enablement?: CommandEnablement;
  // Keybinding
  keybinding?: string;
  // Context
  context?: string[];
}

// Command Handler
export interface CommandHandler {
  (context: ExtensionContext, ...args: any[]): Promise<any> | any;
}

// Command Enablement
export interface CommandEnablement {
  when?: string; // Boolean expression
  contexts?: string[];
  permissions?: string[];
}

// Menu Contribution
export interface MenuContribution {
  id: string;
  label: string;
  icon?: string;
  order?: number;
  // Menu type
  type: 'item' | 'submenu' | 'separator';
  // Command reference
  command?: string;
  // Submenu items
  submenu?: MenuContribution[];
  // Visibility
  when?: string; // Boolean expression
  // Target menu
  menu: MenuTarget;
}

// Menu Target
export enum MenuTarget {
  MAIN_MENU = 'main',
  CONTEXT_MENU = 'context',
  TOOLBAR = 'toolbar',
  PALETTE = 'palette',
  INSPECTOR = 'inspector',
  GRAPH = 'graph',
  CUSTOM = 'custom'
}

// Keybinding Contribution
export interface KeybindingContribution {
  id: string;
  key: string;
  command: string;
  when?: string; // Boolean expression
  args?: any[];
  // Platform-specific
  mac?: string;
  win?: string;
  linux?: string;
}

// Theme Interface
export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'auto';
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borders: ThemeBorders;
  transitions: ThemeTransitions;
  custom?: Record<string, any>;
}

// UI Context Manager
export interface UIContextManager {
  // Component registration
  registerComponent(definition: UIComponentDefinition): void;
  unregisterComponent(componentId: string): void;
  getComponent(componentId: string): UIComponentDefinition | undefined;
  getAllComponents(): UIComponentDefinition[];
  // Theme management
  registerTheme(theme: ThemeContribution): void;
  unregisterTheme(themeId: string): void;
  getTheme(themeId: string): ThemeContribution | undefined;
  getAllThemes(): ThemeContribution[];
  setActiveTheme(themeId: string): void;
  getActiveTheme(): ThemeContribution | undefined;
  // Command management
  registerCommand(command: CommandContribution): void;
  unregisterCommand(commandId: string): void;
  executeCommand(commandId: string, ...args: any[]): Promise<any>;
  getCommand(commandId: string): CommandContribution | undefined;
  getAllCommands(): CommandContribution[];
  // Menu management
  registerMenu(menu: MenuContribution): void;
  unregisterMenu(menuId: string): void;
  getMenu(menuId: string): MenuContribution | undefined;
  getMenusByTarget(target: MenuTarget): MenuContribution[];
  // Keybinding management
  registerKeybinding(keybinding: KeybindingContribution): void;
  unregisterKeybinding(keybindingId: string): void;
  getKeybinding(keybindingId: string): KeybindingContribution | undefined;
  getAllKeybindings(): KeybindingContribution[];
  // Event handling
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

// UI Component Factory
export interface UIComponentFactory {
  create(componentId: string, props: any): React.ComponentType<any>;
  canCreate(componentId: string): boolean;
  getPropsSchema(componentId: string): any;
  validateProps(componentId: string, props: any): ExtensionValidationResult;
}

// UI Extension Helper Functions
export namespace UIExtensionHelpers {
  export function createTheme(partial: Partial<ThemeContribution>): ThemeContribution {
    return {
      id: partial.id || 'custom-theme',
      name: partial.name || 'Custom Theme',
      description: partial.description || 'A custom theme',
      type: partial.type || 'light',
      colors: {,
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#17a2b8',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#e9ecef',
        error: '#dc3545',
        warning: '#ffc107',
        success: '#28a745',
        info: '#17a2b8',
        ...partial.colors
      },
      typography: {,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: {,
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {,
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        lineHeight: {,
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
        letterSpacing: {,
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
        },
        ...partial.typography
      },
      spacing: {,
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        ...partial.spacing
      },
      shadows: {,
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 1px 3px rgba(0, 0, 0, 0.1)',
        lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
        xl: '0 10px 15px rgba(0, 0, 0, 0.1)',
        none: 'none',
        ...partial.shadows
      },
      borders: {,
        width: {,
          thin: '1px',
          normal: '2px',
          thick: '4px',
        },
        radius: {,
          none: '0',
          sm: '0.125rem',
          md: '0.25rem',
          lg: '0.5rem',
          full: '9999px',
        },
        style: {,
          solid: 'solid',
          dashed: 'dashed',
          dotted: 'dotted',
        },
        ...partial.borders
      },
      transitions: {,
        duration: {,
          fast: '150ms',
          normal: '200ms',
          slow: '300ms',
        },
        easing: {,
          linear: 'linear',
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out',
        },
        ...partial.transitions
      },
      custom: partial.custom,
    };
  }
  export function createCommand(partial: Partial<CommandContribution>): CommandContribution {
    return {
      id: partial.id || 'custom-command',
      title: partial.title || 'Custom Command',
      description: partial.description,
      category: partial.category,
      icon: partial.icon,
      handler: partial.handler || (() => {}),
      enablement: partial.enablement,
      keybinding: partial.keybinding,
      context: partial.context,
    };
  }
  export function createMenu(partial: Partial<MenuContribution>): MenuContribution {
    return {
      id: partial.id || 'custom-menu',
      label: partial.label || 'Custom Menu',
      icon: partial.icon,
      order: partial.order || 0,
      type: partial.type || 'item',
      command: partial.command,
      submenu: partial.submenu,
      when: partial.when,
      menu: partial.menu || MenuTarget.CUSTOM
    };
  }
  export function validateUIComponent(definition: UIComponentDefinition): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    // Basic validation
    if (!definition.id) errors.push('Component ID is required');
    if (!definition.name) errors.push('Component name is required');
    if (!definition.component) errors.push('Component class is required');
    // React component validation
    if (definition.component && typeof definition.component !== 'function') {
      errors.push('Component must be a valid React component');
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}