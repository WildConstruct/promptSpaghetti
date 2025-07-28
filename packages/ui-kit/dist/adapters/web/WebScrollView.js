import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Web-specific ScrollView implementation
 */
import { forwardRef } from 'react';
import { useTheme } from '../../hooks';
export const WebScrollView = forwardRef(({ children, horizontal = false, showsVerticalScrollIndicator = true, showsHorizontalScrollIndicator = true, bounces = true, pagingEnabled = false, scrollEnabled = true, contentContainerStyle, style, className, ...props }, ref) => {
    const theme = useTheme();
    const scrollViewStyles = {
        overflow: scrollEnabled ? 'auto' : 'hidden',
        overflowX: horizontal ? 'auto' : 'hidden',
        overflowY: !horizontal ? 'auto' : 'hidden',
        // Custom scrollbar styling
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.colors.border} ${theme.colors.surface}`,
        // Webkit scrollbar styling
        ...(!showsVerticalScrollIndicator && {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }),
        ...(!showsHorizontalScrollIndicator && horizontal && {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }),
        // Smooth scrolling
        scrollBehavior: 'smooth',
        // Momentum scrolling on iOS Safari
        WebkitOverflowScrolling: 'touch',
        // Paging
        ...(pagingEnabled && {
            scrollSnapType: horizontal ? 'x mandatory' : 'y mandatory'
        }),
        // Bouncing effect (approximated with CSS)
        ...(bounces && {
            overscrollBehavior: 'contain'
        }),
        ...style
    };
    const contentStyles = {
        display: horizontal ? 'flex' : 'block',
        flexDirection: horizontal ? 'row' : undefined,
        minWidth: horizontal ? 'max-content' : undefined,
        minHeight: !horizontal ? 'max-content' : undefined,
        ...(pagingEnabled && {
            scrollSnapAlign: 'start'
        }),
        ...contentContainerStyle
    };
    return (_jsxs("div", { ref: ref, className: `web-scroll-view ${className || ''}`, style: scrollViewStyles, ...props, children: [_jsx("div", { className: "web-scroll-view-content", style: contentStyles, children: children }), _jsx("style", { children: `
        .web-scroll-view::-webkit-scrollbar {
          width: ${showsVerticalScrollIndicator ? '8px' : '0px'};
          height: ${showsHorizontalScrollIndicator ? '8px' : '0px'};
        }
        
        .web-scroll-view::-webkit-scrollbar-track {
          background: ${theme.colors.surface};
          border-radius: 4px;
        }
        
        .web-scroll-view::-webkit-scrollbar-thumb {
          background: ${theme.colors.border};
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .web-scroll-view::-webkit-scrollbar-thumb:hover {
          background: ${theme.colors.textSecondary};
        }
        
        .web-scroll-view::-webkit-scrollbar-corner {
          background: ${theme.colors.surface};
        }
        
        ${!showsVerticalScrollIndicator ? `
          .web-scroll-view::-webkit-scrollbar:vertical {
            display: none;
          }
        ` : ''}
        
        ${!showsHorizontalScrollIndicator ? `
          .web-scroll-view::-webkit-scrollbar:horizontal {
            display: none;
          }
        ` : ''}
      ` })] }));
});
WebScrollView.displayName = 'WebScrollView';
//# sourceMappingURL=WebScrollView.js.map