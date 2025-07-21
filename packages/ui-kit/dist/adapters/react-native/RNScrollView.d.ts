/**
 * React Native-specific ScrollView implementation
 */
import React from 'react';
export interface RNScrollViewProps {
    children: React.ReactNode;
    horizontal?: boolean;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    bounces?: boolean;
    pagingEnabled?: boolean;
    scrollEnabled?: boolean;
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
    contentContainerStyle?: any;
    style?: any;
    onScroll?: (event: any) => void;
    scrollEventThrottle?: number;
    decelerationRate?: 'normal' | 'fast' | number;
    maximumZoomScale?: number;
    minimumZoomScale?: number;
    pinchGestureEnabled?: boolean;
    zoomScale?: number;
    testID?: string;
}
export declare const RNScrollView: React.ForwardRefExoticComponent<RNScrollViewProps & React.RefAttributes<any>>;
//# sourceMappingURL=RNScrollView.d.ts.map