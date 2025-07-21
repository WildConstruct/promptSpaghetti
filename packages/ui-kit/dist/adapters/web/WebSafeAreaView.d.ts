/**
 * Web-specific SafeAreaView implementation
 */
import React from 'react';
export interface WebSafeAreaViewProps extends React.HTMLAttributes<HTMLDivElement> {
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    mode?: 'padding' | 'margin';
}
export declare const WebSafeAreaView: React.ForwardRefExoticComponent<WebSafeAreaViewProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=WebSafeAreaView.d.ts.map