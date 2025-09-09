# Color System Documentation

## Overview

Prompt Spaghetti uses a centralized color system defined in `client/src/styles/colors.css`. This provides a single source of truth for all colors used throughout the application, making theming and maintenance much easier.

## Color Variables

### Background Colors

```css
--color-bg-primary: #1e1e1e; /* Main background */
--color-bg-secondary: #2a2a2a; /* Secondary panels */
--color-bg-tertiary: #353535; /* Elevated surfaces */
--color-bg-quaternary: #404040; /* Highest elevation */
--color-bg-hover: #2d2d2d; /* Hover state backgrounds */
--color-bg-active: #383838; /* Active/pressed state */
--color-bg-selected: #525252; /* Selected items */
--color-bg-overlay: rgba(0, 0, 0, 0.8); /* Modal overlays */
--color-bg-tooltip: rgba(42, 42, 42, 0.95); /* Tooltip backgrounds */
```

### Text Colors

```css
--color-text-primary: #e8e8e8; /* Primary text (high contrast) */
--color-text-secondary: #b8b8b8; /* Secondary text (medium contrast) */
--color-text-tertiary: #888888; /* Tertiary text (low contrast) */
--color-text-disabled: #4b5563; /* Disabled/muted text */
--color-text-inverse: #1a1a1a; /* Text on light backgrounds */
--color-text-accent: #ff7c00; /* Accent colored text */
```

### Brand & Accent Colors

```css
--color-accent-orange: #ff7c00; /* Primary brand color */
--color-accent-orange-dark: #e65100; /* Darker orange variant */
--color-accent-orange-light: #ff9a40; /* Lighter orange variant */
--color-accent-orange-alpha: rgba(255, 124, 0, 0.25); /* Transparent orange */
--color-accent-blue: #4a9eff; /* Secondary accent */
--color-accent-cyan: #00d4ff; /* Cyan accent */
--color-accent-purple: #b45cff; /* Purple accent */
--color-accent-green: #4ade80; /* Success/positive */
--color-accent-red: #ef4444; /* Error/negative */
```

### UI Element Colors

```css
/* Borders */
--color-ui-border: #404040; /* Default borders */
--color-ui-border-light: #525252; /* Lighter borders */
--color-ui-border-hover: #5a5a5a; /* Hover state borders */
--color-ui-border-active: #ff7c00; /* Active/selected borders */
--color-ui-border-focus: #4a9eff; /* Focus indicator borders */

/* Focus and selection */
--color-ui-focus: #4a9eff; /* Focus indicators */
--color-ui-selection: rgba(255, 124, 0, 0.25); /* Selection highlight */
```

### Status Colors

```css
--color-status-success: #4ade80; /* Success states */
--color-status-success-bg: rgba(74, 222, 128, 0.1);
--color-status-success-border: #10b981;

--color-status-error: #ef4444; /* Error states */
--color-status-error-bg: rgba(239, 68, 68, 0.1);
--color-status-error-border: #dc2626;

--color-status-warning: #f59e0b; /* Warning states */
--color-status-warning-bg: rgba(245, 158, 11, 0.1);
--color-status-warning-border: #d97706;

--color-status-info: #3b82f6; /* Info states */
--color-status-info-bg: rgba(59, 130, 246, 0.1);
--color-status-info-border: #2563eb;
```

### Node-Specific Colors

```css
--color-node-bg: #2a2a2a; /* Default node background */
--color-node-bg-hover: #333333; /* Node hover state */
--color-node-bg-selected: #3a3a3a; /* Selected node */
--color-node-bg-active: #404040; /* Active/editing node */

/* Node types */
--color-node-text: #4a9eff; /* Text nodes */
--color-node-weighted: #ff7c00; /* Weighted choice nodes */
--color-node-output: #4ade80; /* Output nodes */
--color-node-conditional: #b45cff; /* Conditional nodes */
--color-node-sequential: #00d4ff; /* Sequential nodes */
--color-node-markov: #f59e0b; /* Markov nodes */

/* Node borders and connections */
--color-node-border: #444444; /* Default node border */
--color-node-border-selected: #ff7c00; /* Selected node border */
--color-node-connection: #666666; /* Default connection lines */
--color-node-connection-selected: #4caf50; /* Selected connection */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.25);
--shadow-md:
  0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
--shadow-lg:
  0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.25);
--shadow-xl:
  0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.6);

/* Node-specific shadows */
--shadow-node: 0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2);
--shadow-node-hover:
  0 8px 25px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.25);
--shadow-node-selected:
  0 0 0 2px var(--color-accent-orange),
  0 8px 25px var(--color-accent-orange-alpha), 0 4px 12px rgba(0, 0, 0, 0.4);

/* Focus shadows */
--shadow-focus-orange: 0 0 0 3px rgba(255, 120, 0, 0.2);
--shadow-focus-blue: 0 0 0 3px rgba(74, 158, 255, 0.2);
```

## Usage

### In CSS Files

```css
/* Import the color system */
@import './styles/colors.css';

/* Use the variables */
.my-component {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-ui-border);
}

.my-button:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-accent-orange);
}
```

### In JavaScript/TypeScript

For inline styles that require dynamic colors, use the style utilities:

```typescript
import { colors, shadows } from './utils/styleUtils';

// Get color values dynamically
const primaryColor = colors.bgPrimary();
const accentColor = colors.accentOrange();

// Or use CSS variables directly
const style = {
  backgroundColor: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  boxShadow: 'var(--shadow-md)'
};
```

### Utility Classes

The color system also provides utility classes for common use cases:

```css
/* Text colors */
.text-primary {
  color: var(--color-text-primary);
}
.text-secondary {
  color: var(--color-text-secondary);
}
.text-tertiary {
  color: var(--color-text-tertiary);
}
.text-accent {
  color: var(--color-accent-orange);
}
.text-success {
  color: var(--color-status-success);
}
.text-error {
  color: var(--color-status-error);
}
.text-warning {
  color: var(--color-status-warning);
}
.text-info {
  color: var(--color-status-info);
}

/* Background colors */
.bg-primary {
  background-color: var(--color-bg-primary);
}
.bg-secondary {
  background-color: var(--color-bg-secondary);
}
.bg-tertiary {
  background-color: var(--color-bg-tertiary);
}
.bg-quaternary {
  background-color: var(--color-bg-quaternary);
}

/* Border colors */
.border-default {
  border-color: var(--color-ui-border);
}
.border-light {
  border-color: var(--color-ui-border-light);
}
.border-accent {
  border-color: var(--color-accent-orange);
}
.border-success {
  border-color: var(--color-status-success-border);
}
.border-error {
  border-color: var(--color-status-error-border);
}
```

## Theming

The color system supports multiple themes. Currently available:

### Dark Theme (Default)

The default theme with dark backgrounds and light text.

### Light Theme

```css
.light-theme {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-bg-quaternary: #e5e7eb;

  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #6b7280;
  --color-text-disabled: #9ca3af;

  /* ... other overrides ... */
}
```

### High Contrast Theme

```css
.high-contrast {
  --color-text-primary: #ffffff;
  --color-text-secondary: #e5e7eb;
  --color-text-tertiary: #d1d5db;
  --color-ui-border: #6b7280;
  --color-ui-border-light: #9ca3af;
}
```

To apply a theme, add the theme class to the body or root element:

```html
<body class="light-theme">
  <!-- Your app -->
</body>
```

## Migration Guide

If you're updating existing code to use the centralized color system:

1. **Replace hardcoded colors** with CSS variables:

   ```css
   /* Before */
   color: #e8e8e8;

   /* After */
   color: var(--color-text-primary);
   ```

2. **Update inline styles** in React components:

   ```tsx
   /* Before */
   <div style={{ color: '#ff7c00' }}>

   /* After */
   <div style={{ color: 'var(--color-accent-orange)' }}>
   ```

3. **Use utility classes** where appropriate:

   ```tsx
   /* Before */
   <div style={{ color: 'red' }}>Error</div>

   /* After */
   <div className="text-error">Error</div>
   ```

## Best Practices

1. **Always use variables** instead of hardcoding colors
2. **Choose semantic names** based on purpose, not appearance
3. **Test with all themes** to ensure proper contrast
4. **Document any new colors** added to the system
5. **Use alpha variants** for transparency needs
6. **Prefer CSS classes** over inline styles when possible

## Adding New Colors

To add a new color to the system:

1. Add it to `client/src/styles/colors.css` in the appropriate section
2. Follow the naming convention: `--color-{category}-{name}[-{variant}]`
3. Add theme overrides if necessary
4. Update this documentation
5. Consider adding utility classes if commonly used
