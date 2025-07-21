/**
 * Web-specific ScrollView implementation
 */
import React from 'react';
export interface WebScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
    horizontal?: boolean;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    bounces?: boolean;
    pagingEnabled?: boolean;
    scrollEnabled?: boolean;
    contentContainerStyle?: React.CSSProperties;
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}
export declare const WebScrollView: React.ForwardRefExoticComponent<WebScrollViewProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=WebScrollView.d.ts.map