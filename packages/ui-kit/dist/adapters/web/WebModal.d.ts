/**
 * Web-specific Modal implementation with enhanced features
 */
import React from 'react';
import { ModalProps } from '../../components/Modal';
export interface WebModalProps extends ModalProps {
    backdrop?: 'static' | 'clickable';
    keyboard?: boolean;
    scrollable?: boolean;
    centered?: boolean;
    fullscreen?: boolean | 'sm' | 'md' | 'lg' | 'xl';
    animation?: boolean;
}
export declare const WebModal: React.FC<WebModalProps>;
//# sourceMappingURL=WebModal.d.ts.map