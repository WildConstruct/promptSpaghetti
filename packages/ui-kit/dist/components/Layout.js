import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Layout components for responsive design
 */
import React, { forwardRef } from 'react';
import { useTheme } from '../hooks';
import { cn, resolveResponsiveValue, createSpacingStyles } from '../utils';
// Flex layout component
export const Flex = forwardRef(({ children, direction = 'row', align = 'stretch', justify = 'start', gap = 'md', wrap = false, padding, margin, className, style, testId, ...props }, ref) => {
    const theme = useTheme();
    const flexStyles = {
        display: 'flex',
        flexDirection: resolveResponsiveValue(direction),
        alignItems: resolveResponsiveValue(align),
        justifyContent: resolveResponsiveValue(justify),
        flexWrap: resolveResponsiveValue(wrap) ? 'wrap' : 'nowrap',
        gap: `${theme.spacing[resolveResponsiveValue(gap)]}px`,
        ...(padding && createSpacingStyles('padding', padding, theme)),
        ...(margin && createSpacingStyles('margin', margin, theme)),
        ...style,
    };
    return (_jsx("div", { ref: ref, className: cn('ui-flex', className), style: flexStyles, "data-testid": testId, ...props, children: children }));
});
Flex.displayName = 'Flex';
// Grid layout component
export const Grid = forwardRef(({ children, columns = 'auto', rows = 'auto', areas, gap = 'md', padding, margin, autoFit = false, minColumnWidth = '250px', className, style, testId, ...props }, ref) => {
    const theme = useTheme();
    const getGridColumns = () => {
        if (autoFit) {
            return `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
        }
        if (typeof columns === 'number') {
            return `repeat(${columns}, 1fr)`;
        }
        return columns;
    };
    const getGridRows = () => {
        if (typeof rows === 'number') {
            return `repeat(${rows}, auto)`;
        }
        return rows;
    };
    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: getGridColumns(),
        gridTemplateRows: getGridRows(),
        ...(areas && { gridTemplateAreas: areas }),
        gap: `${theme.spacing[resolveResponsiveValue(gap)]}px`,
        ...(padding && createSpacingStyles('padding', padding, theme)),
        ...(margin && createSpacingStyles('margin', margin, theme)),
        ...style,
    };
    return (_jsx("div", { ref: ref, className: cn('ui-grid', className), style: gridStyles, "data-testid": testId, ...props, children: children }));
});
Grid.displayName = 'Grid';
// Stack layout component (vertical flex with spacing)
export const Stack = forwardRef(({ children, spacing = 'md', divider, align = 'stretch', padding, margin, className, style, testId, ...props }, ref) => {
    const theme = useTheme();
    const childrenArray = React.Children.toArray(children);
    const stackStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: resolveResponsiveValue(align),
        ...(padding && createSpacingStyles('padding', padding, theme)),
        ...(margin && createSpacingStyles('margin', margin, theme)),
        ...style,
    };
    return (_jsx("div", { ref: ref, className: cn('ui-stack', className), style: stackStyles, "data-testid": testId, ...props, children: childrenArray.map((child, index) => (_jsxs(React.Fragment, { children: [child, divider && index < childrenArray.length - 1 && (_jsx("div", { className: "ui-stack-divider", style: {
                        margin: `${theme.spacing[spacing] / 2}px 0`,
                    }, children: divider })), !divider && index < childrenArray.length - 1 && (_jsx("div", { className: "ui-stack-spacer", style: {
                        height: `${theme.spacing[spacing]}px`,
                    } }))] }, index))) }));
});
Stack.displayName = 'Stack';
// Grid item component for more control
export const GridItem = forwardRef(({ children, colSpan, rowSpan, colStart, colEnd, rowStart, rowEnd, area, className, style, ...props }, ref) => {
    const gridItemStyles = {
        ...(colSpan && { gridColumn: `span ${colSpan}` }),
        ...(rowSpan && { gridRow: `span ${rowSpan}` }),
        ...(colStart && { gridColumnStart: colStart }),
        ...(colEnd && { gridColumnEnd: colEnd }),
        ...(rowStart && { gridRowStart: rowStart }),
        ...(rowEnd && { gridRowEnd: rowEnd }),
        ...(area && { gridArea: area }),
        ...style,
    };
    return (_jsx("div", { ref: ref, className: cn('ui-grid-item', className), style: gridItemStyles, ...props, children: children }));
});
GridItem.displayName = 'GridItem';
// Center component for quick centering
export const Center = forwardRef(({ children, minHeight = '100%', className, style, ...props }, ref) => {
    const centerStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        ...style,
    };
    return (_jsx("div", { ref: ref, className: cn('ui-center', className), style: centerStyles, ...props, children: children }));
});
Center.displayName = 'Center';
// Container component for max-width layouts
export const Container = forwardRef(({ children, maxWidth = '1200px', centerContent = true, className, style, ...props }, ref) => {
    const theme = useTheme();
    const containerStyles = {
        width: '100%',
        maxWidth,
        ...(centerContent && {
            marginLeft: 'auto',
            marginRight: 'auto',
        }),
        paddingLeft: `${theme.spacing.md}px`,
        paddingRight: `${theme.spacing.md}px`,
        ...style,
    };
    return (_jsx("div", { ref: ref, className: cn('ui-container', className), style: containerStyles, ...props, children: children }));
});
Container.displayName = 'Container';
//# sourceMappingURL=Layout.js.map