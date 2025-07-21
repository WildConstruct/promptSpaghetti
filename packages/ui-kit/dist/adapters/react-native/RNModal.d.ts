/**
 * React Native-specific Modal implementation
 */
import React from 'react';
import { ModalProps } from '../../components/Modal';
export interface RNModalProps extends ModalProps {
    animationType?: 'none' | 'slide' | 'fade';
    presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
    supportedOrientations?: ('portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right')[];
    onOrientationChange?: (event: {
        orientation: string;
    }) => void;
    statusBarTranslucent?: boolean;
    hardwareAccelerated?: boolean;
    testID?: string;
}
export declare const RNModal: React.FC<RNModalProps>;
//# sourceMappingURL=RNModal.d.ts.map