/**
 * Layout components for responsive design
 */
import React from 'react';
import { LayoutProps } from '../types';
export declare const Flex: React.ForwardRefExoticComponent<LayoutProps & React.RefAttributes<HTMLDivElement>>;
export declare const Grid: React.ForwardRefExoticComponent<LayoutProps & {
    columns?: number | string;
    rows?: number | string;
    areas?: string;
    autoFit?: boolean;
    minColumnWidth?: string;
} & React.RefAttributes<HTMLDivElement>>;
export declare const Stack: React.ForwardRefExoticComponent<LayoutProps & {
    spacing?: keyof typeof import("../types").ThemeSpacing;
    divider?: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>>;
export declare const GridItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    colSpan?: number;
    rowSpan?: number;
    colStart?: number;
    colEnd?: number;
    rowStart?: number;
    rowEnd?: number;
    area?: string;
} & React.RefAttributes<HTMLDivElement>>;
export declare const Center: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    minHeight?: string;
} & React.RefAttributes<HTMLDivElement>>;
export declare const Container: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    maxWidth?: string;
    centerContent?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=Layout.d.ts.map