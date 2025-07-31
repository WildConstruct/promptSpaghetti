/**
 * Utility functions for UI Kit components
 */
import { getBreakpoint, getViewportSize } from './platform';
// CSS class name utility (similar to clsx)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
// Resolve responsive values based on current breakpoint
export function resolveResponsiveValue(value, breakpoint) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  const currentBreakpoint = breakpoint || getBreakpoint(getViewportSize().width);
  // Cast to the expected type to handle the type system limitations
  const responsiveValue = value;
  // Return the most specific value available
  if (responsiveValue[currentBreakpoint] !== undefined) {
    return responsiveValue[currentBreakpoint];
  }
  // Fallback logic
  if (currentBreakpoint === 'desktop' && responsiveValue.tablet !== undefined) {
    return responsiveValue.tablet;
  }
  if (currentBreakpoint !== 'mobile' && responsiveValue.mobile !== undefined) {
    return responsiveValue.mobile;
  }
  // Return first available value as fallback
  return responsiveValue.desktop || responsiveValue.tablet || responsiveValue.mobile || value;
}
// Convert component size to pixel value
export function sizeToPixels(size, theme) {
  const sizeMap = {
    xs: theme.spacing.xs,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
    xl: theme.spacing.xl,
  };
  return sizeMap[size];
}
// Generate CSS styles for responsive values
export function createResponsiveStyles(property, value, transform) {
  if (typeof value !== 'object' || value === null) {
    return {
      [property]: transform ? transform(value) : value,
    };
  }
  const styles = {};
  // Cast to the expected type to handle the type system limitations
  const responsiveValue = value;
  // Base value (mobile-first)
  if (responsiveValue.mobile !== undefined) {
    styles[property] = transform ? transform(responsiveValue.mobile) : responsiveValue.mobile;
  }
  // Tablet breakpoint
  if (responsiveValue.tablet !== undefined) {
    styles['@media (min-width: 768px)'] = {
      [property]: transform ? transform(responsiveValue.tablet) : responsiveValue.tablet,
    };
  }
  // Desktop breakpoint
  if (responsiveValue.desktop !== undefined) {
    styles['@media (min-width: 1024px)'] = {
      [property]: transform ? transform(responsiveValue.desktop) : responsiveValue.desktop,
    };
  }
  return styles;
}
// Generate padding/margin CSS from ComponentSize
export function createSpacingStyles(type, value, theme) {
  return createResponsiveStyles(type, value, size => `${sizeToPixels(size, theme)}px`);
}
// Animation utilities
export function createTransition(properties, duration = '200ms', timing = 'ease-in-out') {
  const props = Array.isArray(properties) ? properties : [properties];
  return props.map(prop => `${prop} ${duration} ${timing}`).join(', ');
}
// Focus ring styles for accessibility
export function createFocusStyles(theme) {
  return {
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
      borderColor: theme.colors.primary,
    },
    '&:focus:not(:focus-visible)': {
      boxShadow: 'none',
      borderColor: 'inherit',
    },
  };
}
// Button variant styles
export function createButtonVariantStyles(variant, theme) {
  const baseStyles = {
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: `${theme.borderRadius}px`,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    transition: createTransition(['background-color', 'border-color', 'color']),
    ...createFocusStyles(theme),
  };
  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: theme.colors.primary,
        color: theme.colors.background,
        '&:hover:not(:disabled)': {
          backgroundColor: theme.colors.secondary,
        },
        '&:disabled': {
          backgroundColor: theme.colors.border,
          color: theme.colors.textSecondary,
          cursor: 'not-allowed',
        },
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        '&:hover:not(:disabled)': {
          backgroundColor: theme.colors.border,
        },
        '&:disabled': {
          backgroundColor: theme.colors.surface,
          color: theme.colors.textSecondary,
          cursor: 'not-allowed',
        },
      };
    case 'outline':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}`,
        '&:hover:not(:disabled)': {
          backgroundColor: theme.colors.primary,
          color: theme.colors.background,
        },
        '&:disabled': {
          borderColor: theme.colors.border,
          color: theme.colors.textSecondary,
          cursor: 'not-allowed',
        },
      };
    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: theme.colors.text,
        '&:hover:not(:disabled)': {
          backgroundColor: theme.colors.surface,
        },
        '&:disabled': {
          color: theme.colors.textSecondary,
          cursor: 'not-allowed',
        },
      };
    case 'link':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: theme.colors.primary,
        padding: 0,
        borderRadius: 0,
        '&:hover:not(:disabled)': {
          textDecoration: 'underline',
        },
        '&:disabled': {
          color: theme.colors.textSecondary,
          cursor: 'not-allowed',
        },
      };
    default:
      return baseStyles;
  }
}
// Input styles
export function createInputStyles(theme, error, disabled) {
  return {
    appearance: 'none',
    border: `1px solid ${error ? theme.colors.error : theme.colors.border}`,
    borderRadius: `${theme.borderRadius}px`,
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    fontSize: `${theme.typography.fontSize.md}px`,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: disabled ? theme.colors.surface : theme.colors.background,
    color: disabled ? theme.colors.textSecondary : theme.colors.text,
    transition: createTransition(['border-color', 'box-shadow']),
    ...createFocusStyles(theme),
    '&::placeholder': {
      color: theme.colors.textSecondary,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  };
}
// Size-based styles
export function createSizeStyles(size, theme, type = 'button') {
  const sizeMap = {
    xs: {
      button: {
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        fontSize: `${theme.typography.fontSize.xs}px`,
        minHeight: '24px',
      },
      input: {
        padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
        fontSize: `${theme.typography.fontSize.xs}px`,
        height: '24px',
      },
    },
    sm: {
      button: {
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        fontSize: `${theme.typography.fontSize.sm}px`,
        minHeight: '32px',
      },
      input: {
        padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
        fontSize: `${theme.typography.fontSize.sm}px`,
        height: '32px',
      },
    },
    md: {
      button: {
        padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
        fontSize: `${theme.typography.fontSize.md}px`,
        minHeight: '40px',
      },
      input: {
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        fontSize: `${theme.typography.fontSize.md}px`,
        height: '40px',
      },
    },
    lg: {
      button: {
        padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
        fontSize: `${theme.typography.fontSize.lg}px`,
        minHeight: '48px',
      },
      input: {
        padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
        fontSize: `${theme.typography.fontSize.lg}px`,
        height: '48px',
      },
    },
    xl: {
      button: {
        padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
        fontSize: `${theme.typography.fontSize.xl}px`,
        minHeight: '56px',
      },
      input: {
        padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
        fontSize: `${theme.typography.fontSize.xl}px`,
        height: '56px',
      },
    },
  };
  return sizeMap[size][type];
}
// Generate unique IDs for components
let idCounter = 0;
export function generateId(prefix = 'ui') {
  return `${prefix}-${++idCounter}`;
}
// Keyboard event handlers
export function createKeyboardHandler(handlers) {
  return event => {
    const handler = handlers[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  };
}
// Merge refs utility
export function mergeRefs(...refs) {
  return value => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
//# sourceMappingURL=utils.js.map
