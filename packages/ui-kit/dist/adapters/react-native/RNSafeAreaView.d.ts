/**
 * React Native-specific SafeAreaView implementation
 */
import React from 'react';
export interface RNSafeAreaViewProps {
    children: React.ReactNode;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    mode?: 'padding' | 'margin';
    style?: any;
    testID?: string;
}
export declare const RNSafeAreaView: React.ForwardRefExoticComponent<RNSafeAreaViewProps & React.RefAttributes<any>>;
//# sourceMappingURL=RNSafeAreaView.d.ts.map