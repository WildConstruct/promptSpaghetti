/**
 * UI Kit cross-platform types
 */

import { ReactNode, CSSProperties } from 'react';
import { GraphDocument, GraphNode, GraphEdge } from '@prompt-spaghetti/graph-core';

// Platform detection
export type Platform = 'web' | 'mobile' | 'desktop';

// Device capabilities
export interface DeviceCapabilities {
  touchSupport: boolean;
  hoverSupport: boolean;
  keyboardSupport: boolean;
  maxViewportWidth: number;
  maxViewportHeight: number;
  pixelRatio: number;
}

// Theme system
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
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: number;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// Component base props
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  testId?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Responsive design
// Legacy responsive value type (for backward compatibility)
export type ResponsiveValue<T> =
  | T
  | {
      mobile?: T;
      tablet?: T;
      desktop?: T;
    };

// Enhanced responsive value type with all breakpoints
export type ResponsiveValueEnhanced<T> =
  | T
  | {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      xxl?: T;
    };

// Animation presets
export type AnimationPreset =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'bounce'
  | 'elastic';

// Component sizes
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button component types
export interface ButtonProps extends BaseComponentProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input component types
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  size?: ComponentSize;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// Card component types
export interface CardProps extends BaseComponentProps {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: ResponsiveValue<ComponentSize>;
  clickable?: boolean;
  onClick?: () => void;
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

// Graph-specific component types
export interface GraphCanvasProps extends BaseComponentProps {
  graph: GraphDocument;
  onNodeSelect?: (node: GraphNode | null) => void;
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  onEdgeCreate?: (edge: Omit<GraphEdge, 'id'>) => void;
  onEdgeDelete?: (edgeId: string) => void;
  selectedNodeId?: string;
  readOnly?: boolean;
  showMinimap?: boolean;
  showControls?: boolean;
  fitView?: boolean;
}

export interface NodePaletteProps extends BaseComponentProps {
  onNodeAdd?: (nodeType: string) => void;
  availableNodeTypes?: string[];
  searchable?: boolean;
  collapsed?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export interface InspectorPanelProps extends BaseComponentProps {
  selectedNode?: GraphNode;
  onNodeUpdate?: (nodeId: string, updates: Partial<GraphNode>) => void;
  onNodeDelete?: (nodeId: string) => void;
  collapsed?: boolean;
  position?: 'left' | 'right' | 'bottom';
}

// Platform adapter types
export interface PlatformAdapter {
  platform: Platform;
  capabilities: DeviceCapabilities;
  getTheme: () => Theme;
  adaptComponent: <T>(component: React.ComponentType<T>, props: T) => React.ComponentType<T>;
  createNativeElement?: (type: string, props: any) => ReactNode;
}

// Legacy props for backward compatibility
export interface PlatformProps {
  platform?: Platform;
}

export interface NodeEditorProps extends PlatformProps {
  nodeId: string;
  onUpdate?: (nodeId: string, data: any) => void;
}

export interface PropertyPanelProps extends PlatformProps {
  title?: string;
  collapsible?: boolean;
  children: ReactNode;
}

// Layout types
export interface LayoutProps extends BaseComponentProps {
  children: ReactNode;
  direction?: ResponsiveValue<'row' | 'column'>;
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  justify?: ResponsiveValue<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
  gap?: ResponsiveValue<ComponentSize>;
  wrap?: ResponsiveValue<boolean>;
  padding?: ResponsiveValue<ComponentSize>;
  margin?: ResponsiveValue<ComponentSize>;
}

// State management
export interface UIState {
  theme: Theme;
  platform: Platform;
  capabilities: DeviceCapabilities;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  isReducedMotion: boolean;
  selectedNodeId?: string;
  inspectorOpen: boolean;
  paletteOpen: boolean;
}

// Event types
export interface GraphEvent {
  type: 'node-select' | 'node-move' | 'node-add' | 'node-delete' | 'edge-create' | 'edge-delete';
  payload: any;
  timestamp: number;
}
