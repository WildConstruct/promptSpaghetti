/**
 * React Native-specific GraphCanvas implementation
 */

import React, { useRef, useState, useCallback } from 'react';
import { GraphCanvas, GraphCanvasProps } from '../../components/GraphCanvas';
import { usePlatformAdapter } from '../usePlatformAdapter';

export interface RNGraphCanvasProps extends GraphCanvasProps {
  enablePinchZoom?: boolean;
  enableDoubleTapZoom?: boolean;
  enableRotation?: boolean;
  minimumZoomScale?: number;
  maximumZoomScale?: number;
  bounces?: boolean;
  bouncesZoom?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  testID?: string;
}

export const RNGraphCanvas: React.FC<RNGraphCanvasProps> = ({
  enablePinchZoom = true,
  enableDoubleTapZoom = true,
  enableRotation = false,
  minimumZoomScale = 0.1,
  maximumZoomScale = 3,
  bounces = true,
  bouncesZoom = true,
  scrollEnabled = true,
  zoomEnabled = true,
  testID,
  onNodeSelect,
  onNodeMove,
  onEdgeCreate,
  onEdgeDelete,
  ...props
}) => {
  const adapter = usePlatformAdapter();
  const [gestureState, setGestureState] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotation: 0
  });

  // Try to use React Native gesture handling if available
  let PanGestureHandler, PinchGestureHandler, TapGestureHandler;
  try {
    const GestureHandler = require('react-native-gesture-handler');
    PanGestureHandler = GestureHandler.PanGestureHandler;
    PinchGestureHandler = GestureHandler.PinchGestureHandler;
    TapGestureHandler = GestureHandler.TapGestureHandler;
  } catch {
    // Fallback to basic touch handling
    PanGestureHandler = 'div';
    PinchGestureHandler = 'div';
    TapGestureHandler = 'div';
  }

  // Gesture handlers
  const handlePanGesture = useCallback((event: any) => {
    if (!scrollEnabled) return;
    
    const { translationX, translationY } = event.nativeEvent;
    setGestureState(prev => ({
      ...prev,
      translateX: prev.translateX + translationX,
      translateY: prev.translateY + translationY
    }));
  }, [scrollEnabled]);

  const handlePinchGesture = useCallback((event: any) => {
    if (!zoomEnabled || !enablePinchZoom) return;
    
    const { scale } = event.nativeEvent;
    const clampedScale = Math.max(minimumZoomScale, Math.min(maximumZoomScale, scale));
    
    setGestureState(prev => ({
      ...prev,
      scale: clampedScale
    }));
  }, [zoomEnabled, enablePinchZoom, minimumZoomScale, maximumZoomScale]);

  const handleDoubleTap = useCallback(() => {
    if (!enableDoubleTapZoom) return;
    
    // Toggle between fit-to-screen and 1:1 zoom
    const targetScale = gestureState.scale === 1 ? 2 : 1;
    setGestureState(prev => ({
      ...prev,
      scale: targetScale,
      translateX: targetScale === 1 ? 0 : prev.translateX,
      translateY: targetScale === 1 ? 0 : prev.translateY
    }));
    
    // Haptic feedback for double tap
    adapter.hapticFeedback('light');
  }, [enableDoubleTapZoom, gestureState.scale, adapter]);

  const handleNodePress = useCallback((node: any) => {
    // Haptic feedback for node selection
    adapter.hapticFeedback('light');
    onNodeSelect?.(node);
  }, [onNodeSelect, adapter]);

  const handleLongPress = useCallback((node: any) => {
    // Stronger haptic feedback for long press
    adapter.hapticFeedback('medium');
    // Could show context menu or enter edit mode
  }, [adapter]);

  // React Native specific touch handling
  const touchProps = {
    onTouchStart: (e: any) => {
      // Handle touch start
    },
    onTouchMove: (e: any) => {
      // Handle touch move for node dragging
      if (props.readOnly) return;
      
      // Touch-based node dragging logic
    },
    onTouchEnd: (e: any) => {
      // Handle touch end
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: 'transparent',
    // Apply gesture transformations
    transform: [
      { scale: gestureState.scale },
      { translateX: gestureState.translateX },
      { translateY: gestureState.translateY },
      ...(enableRotation ? [{ rotate: `${gestureState.rotation}deg` }] : [])
    ]
  };

  // Enhanced GraphCanvas with React Native optimizations
  const enhancedProps = {
    ...props,
    onNodeSelect: handleNodePress,
    onNodeMove,
    onEdgeCreate,
    onEdgeDelete,
    style: {
      ...props.style,
      // React Native specific styling
      flex: 1,
      // Remove web-specific properties
      cursor: undefined,
      userSelect: undefined,
      WebkitUserSelect: undefined
    }
  };

  if (PanGestureHandler !== 'div' && PinchGestureHandler !== 'div') {
    // Use React Native Gesture Handler if available
    return (
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <PinchGestureHandler onGestureEvent={handlePinchGesture}>
          <TapGestureHandler numberOfTaps={2} onActivated={handleDoubleTap}>
            <div style={containerStyle} testID={testID}>
              <GraphCanvas {...enhancedProps} />
            </div>
          </TapGestureHandler>
        </PinchGestureHandler>
      </PanGestureHandler>
    );
  }

  // Fallback to basic touch handling
  return (
    <div 
      style={containerStyle}
      testID={testID}
      {...touchProps}
    >
      <GraphCanvas {...enhancedProps} />
      
      {/* Touch-friendly controls overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          flexDirection: 'column'
        }}
      >
        {/* Zoom controls optimized for touch */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10
          }}
          onTouchEnd={() => {
            adapter.hapticFeedback('light');
            // Zoom in
            const newScale = Math.min(maximumZoomScale, gestureState.scale * 1.2);
            setGestureState(prev => ({ ...prev, scale: newScale }));
          }}
        >
          <span style={{ color: 'white', fontSize: 24 }}>+</span>
        </div>
        
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onTouchEnd={() => {
            adapter.hapticFeedback('light');
            // Zoom out
            const newScale = Math.max(minimumZoomScale, gestureState.scale / 1.2);
            setGestureState(prev => ({ ...prev, scale: newScale }));
          }}
        >
          <span style={{ color: 'white', fontSize: 24 }}>−</span>
        </div>
      </div>
    </div>
  );
};