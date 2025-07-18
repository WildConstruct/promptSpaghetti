/**
 * Responsive grid system
 */

import React from 'react';
import { Theme } from '../types';
import { BreakpointKey, createResponsiveStyles } from './breakpoints';
import { cn } from '../utils';

export interface GridProps {
  container?: boolean;
  item?: boolean;
  spacing?: number | Partial<Record<BreakpointKey, number>>;
  columns?: number | Partial<Record<BreakpointKey, number>>;
  xs?: number | 'auto';
  sm?: number | 'auto';
  md?: number | 'auto';
  lg?: number | 'auto';
  xl?: number | 'auto';
  xxl?: number | 'auto';
  direction?: 'row' | 'column' | Partial<Record<BreakpointKey, 'row' | 'column'>>;
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean | 'nowrap' | 'wrap' | 'wrap-reverse';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Calculate grid item width based on columns
 */
function calculateWidth(span?: number | 'auto', columns: number = 12): string {
  if (span === 'auto') return 'auto';
  if (!span || span < 1) return '100%';
  return `${(span / columns) * 100}%`;
}

/**
 * Create grid container styles
 */
function createGridContainerStyles(
  props: GridProps,
  theme: Theme
): React.CSSProperties {
  const {
    spacing = 0,
    direction = 'row',
    justify,
    align,
    wrap = true
  } = props;
  
  const styles: React.CSSProperties = {
    display: 'flex',
    boxSizing: 'border-box'
  };
  
  // Spacing
  if (typeof spacing === 'object') {
    Object.assign(styles, createResponsiveStyles(
      'gap',
      spacing,
      (value) => `${theme.spacing.sm * value}px`
    ));
  } else {
    styles.gap = `${theme.spacing.sm * spacing}px`;
  }
  
  // Direction
  if (typeof direction === 'object') {
    Object.assign(styles, createResponsiveStyles('flexDirection', direction));
  } else {
    styles.flexDirection = direction;
  }
  
  // Justify
  if (justify) {
    styles.justifyContent = justify.replace('space-', 'space-');
  }
  
  // Align
  if (align) {
    styles.alignItems = align === 'start' ? 'flex-start' : 
                      align === 'end' ? 'flex-end' : align;
  }
  
  // Wrap
  if (typeof wrap === 'boolean') {
    styles.flexWrap = wrap ? 'wrap' : 'nowrap';
  } else {
    styles.flexWrap = wrap;
  }
  
  return styles;
}

/**
 * Create grid item styles
 */
function createGridItemStyles(
  props: GridProps,
  theme: Theme
): React.CSSProperties {
  const { columns = 12 } = props;
  const styles: React.CSSProperties = {
    boxSizing: 'border-box'
  };
  
  // Column spans
  const columnSpans: Partial<Record<BreakpointKey, number | 'auto'>> = {};
  
  if (props.xs !== undefined) columnSpans.xs = props.xs;
  if (props.sm !== undefined) columnSpans.sm = props.sm;
  if (props.md !== undefined) columnSpans.md = props.md;
  if (props.lg !== undefined) columnSpans.lg = props.lg;
  if (props.xl !== undefined) columnSpans.xl = props.xl;
  if (props.xxl !== undefined) columnSpans.xxl = props.xxl;
  
  // Calculate responsive widths
  if (Object.keys(columnSpans).length > 0) {
    const widthValues: Partial<Record<BreakpointKey, string>> = {};
    
    Object.entries(columnSpans).forEach(([breakpoint, span]) => {
      const cols = typeof columns === 'object' 
        ? columns[breakpoint as BreakpointKey] || 12 
        : columns;
      widthValues[breakpoint as BreakpointKey] = calculateWidth(span, cols);
    });
    
    Object.assign(styles, createResponsiveStyles('flexBasis', widthValues));
    Object.assign(styles, createResponsiveStyles('maxWidth', widthValues));
  }
  
  return styles;
}

/**
 * Responsive grid component
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const {
    container,
    item,
    className,
    style,
    children,
    ...rest
  } = props;
  
  const theme: Theme = {
    colors: {} as any,
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    typography: {} as any,
    borderRadius: 8,
    shadows: {} as any,
    breakpoints: {} as any
  };
  
  let computedStyles: React.CSSProperties = {};
  
  if (container) {
    computedStyles = createGridContainerStyles(props, theme);
  } else if (item) {
    computedStyles = createGridItemStyles(props, theme);
  }
  
  return (
    <div
      ref={ref}
      className={cn('ui-grid', className)}
      style={{
        ...computedStyles,
        ...style
      }}
    >
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

/**
 * Row component - shorthand for Grid container
 */
export const Row: React.FC<Omit<GridProps, 'container'>> = (props) => {
  return <Grid container {...props} />;
};

/**
 * Col component - shorthand for Grid item
 */
export const Col: React.FC<Omit<GridProps, 'item'>> = (props) => {
  return <Grid item {...props} />;
};

/**
 * Responsive container with max-width constraints
 */
export interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  fixed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const containerMaxWidths = {
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxWidth = 'lg', disableGutters = false, fixed = false, className, style, children }, ref) => {
    const containerStyles: React.CSSProperties = {
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: disableGutters ? 0 : 16,
      paddingRight: disableGutters ? 0 : 16,
      boxSizing: 'border-box'
    };
    
    if (maxWidth && maxWidth !== false) {
      containerStyles.maxWidth = fixed 
        ? containerMaxWidths[maxWidth] 
        : '100%';
        
      if (!fixed) {
        // Responsive max-widths
        const mediaStyles = {
          '@media (min-width: 600px)': {
            maxWidth: containerMaxWidths.sm
          },
          '@media (min-width: 960px)': {
            maxWidth: containerMaxWidths.md
          },
          '@media (min-width: 1280px)': {
            maxWidth: containerMaxWidths.lg
          },
          '@media (min-width: 1920px)': {
            maxWidth: containerMaxWidths.xl
          }
        };
        
        // Apply only up to the specified maxWidth
        const maxWidthValue = containerMaxWidths[maxWidth];
        Object.entries(mediaStyles).forEach(([query, styles]) => {
          if (styles.maxWidth <= maxWidthValue) {
            Object.assign(containerStyles, { [query]: styles });
          }
        });
      }
    }
    
    return (
      <div
        ref={ref}
        className={cn('ui-container', className)}
        style={{ ...containerStyles, ...style }}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';