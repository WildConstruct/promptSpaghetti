/**
 * Mobile navigation components
 */
import React from 'react';
/**
 * Mobile hamburger menu
 */
export interface HamburgerMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    color?: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}
export declare     showLabels?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
export declare         label: string;
    };
    rightActions?: Array<{
        icon: React.ReactNode;
        onClick: () => void;
        label: string;
    }>;
    transparent?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}
export declare     position?: 'left' | 'right';
    width?: number | string;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}
export declare const SlideMenu: React.FC<SlideMenuProps>;
//# sourceMappingURL=MobileNavigation.d.ts.map