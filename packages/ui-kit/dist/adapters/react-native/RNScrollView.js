import { jsx as _jsx } from 'react/jsx-runtime';
/**
 * React Native-specific ScrollView implementation
 */
import { forwardRef } from 'react';
export const RNScrollView = forwardRef(
  (
    {
      children,
      horizontal = false,
      showsVerticalScrollIndicator = true,
      showsHorizontalScrollIndicator = true,
      bounces = true,
      pagingEnabled = false,
      scrollEnabled = true,
      keyboardShouldPersistTaps = 'never',
      contentContainerStyle,
      style,
      onScroll,
      scrollEventThrottle = 16,
      decelerationRate = 'normal',
      maximumZoomScale = 1,
      minimumZoomScale = 1,
      pinchGestureEnabled = false,
      zoomScale = 1,
      testID,
      ...props
    },
    ref
  ) => {
    // Try to use React Native ScrollView if available
    let RNScrollViewComponent;
    try {
      RNScrollViewComponent = require('react-native').ScrollView;
    } catch {
      // Fallback to web implementation
      RNScrollViewComponent = null;
    }
    const rnProps = {
      ref,
      horizontal,
      showsVerticalScrollIndicator,
      showsHorizontalScrollIndicator,
      bounces,
      pagingEnabled,
      scrollEnabled,
      keyboardShouldPersistTaps,
      contentContainerStyle,
      style,
      onScroll,
      scrollEventThrottle,
      decelerationRate,
      maximumZoomScale,
      minimumZoomScale,
      pinchGestureEnabled,
      zoomScale,
      testID,
      ...props,
    };
    if (RNScrollViewComponent) {
      return _jsx(RNScrollViewComponent, { ...rnProps, children: children });
    }
    // Fallback to web implementation with React Native-like behavior
    const webScrollViewStyle = {
      flex: 1,
      overflow: scrollEnabled ? 'auto' : 'hidden',
      overflowX: horizontal ? 'auto' : 'hidden',
      overflowY: !horizontal ? 'auto' : 'hidden',
      // Simulate React Native scrolling behavior
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: showsVerticalScrollIndicator || showsHorizontalScrollIndicator ? 'thin' : 'none',
      msOverflowStyle: showsVerticalScrollIndicator || showsHorizontalScrollIndicator ? 'auto' : 'none',
      ...style,
    };
    const webContentStyle = {
      display: horizontal ? 'flex' : 'block',
      flexDirection: horizontal ? 'row' : undefined,
      minWidth: horizontal ? 'max-content' : undefined,
      ...contentContainerStyle,
    };
    return _jsx('div', {
      ref: ref,
      style: webScrollViewStyle,
      onScroll: onScroll,
      'data-testid': testID,
      ...props,
      children: _jsx('div', { style: webContentStyle, children: children }),
    });
  }
);
RNScrollView.displayName = 'RNScrollView';
//# sourceMappingURL=RNScrollView.js.map
