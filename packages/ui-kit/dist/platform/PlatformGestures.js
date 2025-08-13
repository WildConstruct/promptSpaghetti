import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Platform-specific gesture handling
 */
import { useEffect, useRef } from 'react';
import { deviceDetector } from '../responsive/device-detection';
import { iOSHaptics } from './ios/IOSAdaptations';
import { HapticFeedback } from '../touch/feedback';
/**
 * Platform-specific gesture configurations
 */
export const platformGestureConfigs = {
    ios: {
        // iOS-specific gestures
        edgeSwipe: true, // Back navigation from edge
        forceTouchDelay: 200, // 3D Touch timing
        pinchThreshold: 0.1, // More sensitive pinch
        swipeVelocity: 0.2, // Faster swipe detection
        bounceScroll: true, // Rubber band scrolling
        momentumScrolling: true, // Inertial scrolling
        overscrollBehavior: 'bounce',
    },
    android: {
        // Android-specific gestures
        edgeSwipe: false, // No edge swipe by default
        longPressDelay: 400, // Slightly faster than iOS
        doubleTapDelay: 300, // Standard Material timing
        swipeVelocity: 0.3, // Standard swipe speed
        overscrollBehavior: 'glow', // Overscroll glow effect
        pullToRefresh: true, // Native pull-to-refresh
    },
    desktop: {
        // Desktop-specific interactions
        rightClick: true, // Context menu on right click
        middleClick: true, // Middle click actions
        wheelZoom: true, // Ctrl+wheel zoom
        hoverDelay: 300, // Tooltip hover delay
        dragThreshold: 5, // Smaller drag threshold
        preciseCursor: true, // Sub-pixel positioning
    },
};
/**
 * Get platform-specific gesture config
 */
export function getPlatformGestureConfig() {
    const platform = deviceDetector.getPlatform();
    const os = deviceDetector.getOS();
    if (platform === 'mobile') {
        return os === 'iOS' ? platformGestureConfigs.ios : platformGestureConfigs.android;
    }
    return platformGestureConfigs.desktop;
}
/**
 * Platform-aware gesture handler
 */
export const PlatformGestureHandler = ({ children, onGesture, enablePlatformSpecific = true, }) => {
    const containerRef = useRef(null);
    const platform = deviceDetector.getPlatform();
    const os = deviceDetector.getOS();
    useEffect(() => {
        if (!containerRef.current || !enablePlatformSpecific)
            return;
        const config = getPlatformGestureConfig();
        const cleanup = [];
        // iOS-specific gestures
        if (os === 'iOS') {
            // Edge swipe for back navigation
            if (config.edgeSwipe) {
                const handleEdgeSwipe = (e) => {
                    const touch = e.touches[0];
                    if (touch.clientX < 20) {
                        // Left edge
                        onGesture?.('edgeSwipeRight', {
                            x: touch.clientX,
                            y: touch.clientY,
                            timestamp: Date.now(),
                        });
                    }
                };
                containerRef.current.addEventListener('touchstart', handleEdgeSwipe);
                cleanup.push(() => containerRef.current?.removeEventListener('touchstart', handleEdgeSwipe));
            }
            // Force touch detection
            if ('ontouchforcechange' in document) {
                const handleForceTouch = (e) => {
                    if (e.touches[0].force > 0.5) {
                        onGesture?.('forceTouch', {
                            force: e.touches[0].force,
                            x: e.touches[0].clientX,
                            y: e.touches[0].clientY,
                        });
                        iOSHaptics.impact('heavy');
                    }
                };
                containerRef.current.addEventListener('touchforcechange', handleForceTouch);
                cleanup.push(() => containerRef.current?.removeEventListener('touchforcechange', handleForceTouch));
            }
        }
        // Android-specific gestures
        if (os === 'Android') {
            // Pull to refresh
            if (config.pullToRefresh) {
                let startY = 0;
                let isPulling = false;
                const handleTouchStart = (e) => {
                    if (window.scrollY === 0) {
                        startY = e.touches[0].clientY;
                        isPulling = true;
                    }
                };
                const handleTouchMove = (e) => {
                    if (!isPulling)
                        return;
                    const currentY = e.touches[0].clientY;
                    const distance = currentY - startY;
                    if (distance > 50) {
                        onGesture?.('pullToRefresh', { distance });
                        HapticFeedback.getInstance().trigger('light');
                    }
                };
                const handleTouchEnd = () => {
                    isPulling = false;
                };
                containerRef.current.addEventListener('touchstart', handleTouchStart);
                containerRef.current.addEventListener('touchmove', handleTouchMove);
                containerRef.current.addEventListener('touchend', handleTouchEnd);
                cleanup.push(() => {
                    containerRef.current?.removeEventListener('touchstart', handleTouchStart);
                    containerRef.current?.removeEventListener('touchmove', handleTouchMove);
                    containerRef.current?.removeEventListener('touchend', handleTouchEnd);
                });
            }
        }
        // Desktop-specific interactions
        if (platform === 'desktop') {
            // Right-click context menu
            if (config.rightClick) {
                const handleContextMenu = (e) => {
                    e.preventDefault();
                    onGesture?.('rightClick', {
                        x: e.clientX,
                        y: e.clientY,
                        target: e.target,
                    });
                };
                containerRef.current.addEventListener('contextmenu', handleContextMenu);
                cleanup.push(() => containerRef.current?.removeEventListener('contextmenu', handleContextMenu));
            }
            // Middle click
            if (config.middleClick) {
                const handleMiddleClick = (e) => {
                    if (e.button === 1) {
                        e.preventDefault();
                        onGesture?.('middleClick', {
                            x: e.clientX,
                            y: e.clientY,
                            target: e.target,
                        });
                    }
                };
                containerRef.current.addEventListener('mousedown', handleMiddleClick);
                cleanup.push(() => containerRef.current?.removeEventListener('mousedown', handleMiddleClick));
            }
            // Ctrl+Wheel zoom
            if (config.wheelZoom) {
                const handleWheel = (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? 0.9 : 1.1;
                        onGesture?.('wheelZoom', {
                            scale: delta,
                            x: e.clientX,
                            y: e.clientY,
                        });
                    }
                };
                containerRef.current.addEventListener('wheel', handleWheel, { passive: false });
                cleanup.push(() => containerRef.current?.removeEventListener('wheel', handleWheel));
            }
        }
        return () => {
            cleanup.forEach(fn => fn());
        };
    }, [platform, os, enablePlatformSpecific, onGesture]);
    return (_jsx("div", { ref: containerRef, style: { width: '100%', height: '100%' }, children: children }));
};
export const PlatformScrollView = ({ children, onScroll, onRefresh, refreshing = false, }) => {
    const scrollRef = useRef(null);
    const platform = deviceDetector.getPlatform();
    const os = deviceDetector.getOS();
    useEffect(() => {
        if (!scrollRef.current)
            return;
        const config = getPlatformGestureConfig();
        // iOS momentum scrolling
        if (os === 'iOS' && config.momentumScrolling) {
            scrollRef.current.style.webkitOverflowScrolling = 'touch';
        }
        // Platform-specific overscroll behavior
        if (config.overscrollBehavior === 'bounce') {
            scrollRef.current.style.overscrollBehavior = 'auto';
        }
        else if (config.overscrollBehavior === 'glow') {
            scrollRef.current.style.overscrollBehavior = 'contain';
        }
        // Handle scroll events
        const handleScroll = () => {
            if (scrollRef.current) {
                onScroll?.({
                    scrollTop: scrollRef.current.scrollTop,
                    scrollLeft: scrollRef.current.scrollLeft,
                });
            }
        };
        scrollRef.current.addEventListener('scroll', handleScroll);
        return () => {
            scrollRef.current?.removeEventListener('scroll', handleScroll);
        };
    }, [platform, os, onScroll]);
    return (_jsxs("div", { ref: scrollRef, className: "platform-scroll-view", style: {
            width: '100%',
            height: '100%',
            overflow: 'auto',
            position: 'relative',
        }, children: [os === 'Android' && onRefresh && (_jsx("div", { className: "refresh-indicator", style: {
                    position: 'absolute',
                    top: refreshing ? 0 : -60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'top 0.3s ease',
                    zIndex: 10,
                }, children: _jsx("div", { className: "spinner", style: {
                        width: 24,
                        height: 24,
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    } }) })), children] }));
};
export const PlatformButton = ({ children, variant = 'primary', size = 'medium', fullWidth = false, disabled = false, onClick, }) => {
    const platform = deviceDetector.getPlatform();
    const os = deviceDetector.getOS();
    const handleClick = () => {
        if (disabled)
            return;
        // Platform-specific haptic feedback
        if (platform === 'mobile') {
            if (os === 'iOS') {
                iOSHaptics.impact('light');
            }
            else {
                HapticFeedback.getInstance().trigger('selection');
            }
        }
        onClick?.();
    };
    const getButtonStyles = () => {
        const baseStyles = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            width: fullWidth ? '100%' : 'auto',
            transition: 'all 0.2s ease',
            fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
            fontWeight: os === 'iOS' ? 600 : 500,
        };
        // iOS styles
        if (os === 'iOS') {
            return {
                ...baseStyles,
                padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
                borderRadius: variant === 'text' ? 0 : 10,
                backgroundColor: variant === 'primary'
                    ? 'var(--color-primary)'
                    : variant === 'secondary'
                        ? 'var(--color-secondary)'
                        : 'transparent',
                color: variant === 'text' ? 'var(--color-primary)' : 'white',
            };
        }
        // Android Material styles
        if (os === 'Android') {
            return {
                ...baseStyles,
                padding: size === 'small' ? '6px 16px' : size === 'large' ? '14px 24px' : '10px 20px',
                borderRadius: 20,
                backgroundColor: variant === 'primary'
                    ? 'var(--md-sys-color-primary)'
                    : variant === 'secondary'
                        ? 'var(--md-sys-color-secondary-container)'
                        : 'transparent',
                color: variant === 'primary'
                    ? 'var(--md-sys-color-on-primary)'
                    : variant === 'secondary'
                        ? 'var(--md-sys-color-on-secondary-container)'
                        : 'var(--md-sys-color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            };
        }
        // Desktop styles
        return {
            ...baseStyles,
            padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
            borderRadius: 4,
            backgroundColor: variant === 'primary'
                ? 'var(--color-primary)'
                : variant === 'secondary'
                    ? 'var(--color-secondary)'
                    : 'transparent',
            color: variant === 'text' ? 'var(--color-primary)' : 'white',
        };
    };
    return (_jsx("button", { onClick: handleClick, disabled: disabled, style: getButtonStyles(), className: `platform-button ${variant} ${size} ${os.toLowerCase()}`, children: children }));
};
/**
 * Platform gesture CSS styles
 */
export const platformGestureStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* iOS-specific styles */
  .ios .platform-scroll-view {
    -webkit-overflow-scrolling: touch;
  }
  
  .ios .platform-button:active:not(:disabled) {
    opacity: 0.7;
  }
  
  /* Android-specific styles */
  .android .platform-button {
    position: relative;
    overflow: hidden;
  }
  
  .android .platform-button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  .android .platform-button:active::after {
    width: 300px;
    height: 300px;
  }
  
  /* Desktop-specific styles */
  @media (hover: hover) {
    .desktop .platform-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .desktop .platform-button:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: none;
    }
  }
`;
//# sourceMappingURL=PlatformGestures.js.map