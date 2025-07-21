/**
 * Utility functions for UI Kit components
 */
import { ResponsiveValue, ComponentSize, Theme } from './types';
export declare function cn(...classes: (string | undefined | null | false)[]): string;
export declare function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  breakpoint?: 'mobile' | 'tablet' | 'desktop'
): T;
export declare function sizeToPixels(size: ComponentSize, theme: Theme): number;
export declare function createResponsiveStyles<T>(
  property: string,
  value: ResponsiveValue<T>,
  transform?: (val: T
) => string): Record<string, any>;
export declare function createSpacingStyles(
  type: 'padding' | 'margin',
  value: ResponsiveValue<ComponentSize>,
  theme: Theme
): Record<string, any>;
export declare function createTransition(properties: string | string[], duration?: string, timing?: string): string;
export declare function createFocusStyles(theme: Theme): Record<string, any>;
export declare function createButtonVariantStyles(
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link',
  theme: Theme
): Record<string, any>;
export declare function createInputStyles(theme: Theme, error?: string, disabled?: boolean): Record<string, any>;
export declare function createSizeStyles(
  size: ComponentSize,
  theme: Theme,
  type?: 'button' | 'input'
): Record<string, any>;
export declare function generateId(prefix?: string): string;
export declare function createKeyboardHandler(
  handlers: Record<string,
  (
) => void>): (event: React.KeyboardEvent) => void;
export declare function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T>;
//# sourceMappingURL=utils.d.ts.map