/**
 * React Native-specific SafeAreaView implementation
 */

import React, { forwardRef } from 'react';

export interface RNSafeAreaViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  mode?: 'padding' | 'margin';
  style?: any;
  testID?: string;
}

export const RNSafeAreaView = forwardRef<any, RNSafeAreaViewProps>(({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  mode = 'padding',
  style,
  testID,
  ...props
}, ref) => {
  // Try to use React Native SafeAreaView if available
  let RNSafeAreaViewComponent;
  try {
    RNSafeAreaViewComponent = require('react-native-safe-area-context').SafeAreaView;
  } catch {
    try {
      // Fallback to React Native built-in SafeAreaView
      RNSafeAreaViewComponent = require('react-native').SafeAreaView;
    } catch {
      // Final fallback to web implementation
      RNSafeAreaViewComponent = null;
    }
  }

  const rnProps = {
    ref,
    edges,
    mode,
    style,
    testID,
    ...props
  };

  if (RNSafeAreaViewComponent) {
    return (
      <RNSafeAreaViewComponent {...rnProps}>
        {children}
      </RNSafeAreaViewComponent>
    );
  }

  // Fallback to web implementation with React Native-like behavior
  // This would be similar to the WebSafeAreaView but with different detection logic
  const webSafeAreaStyle = {
    flex: 1,
    // Default safe area insets for mobile web
    paddingTop: edges.includes('top') ? 20 : 0,
    paddingBottom: edges.includes('bottom') ? 0 : 0,
    paddingLeft: edges.includes('left') ? 0 : 0,
    paddingRight: edges.includes('right') ? 0 : 0,
    ...style
  };

  return (
    <div 
      ref={ref}
      style={webSafeAreaStyle}
      data-testid={testID}
      {...props}
    >
      {children}
    </div>
  );
});

RNSafeAreaView.displayName = 'RNSafeAreaView';