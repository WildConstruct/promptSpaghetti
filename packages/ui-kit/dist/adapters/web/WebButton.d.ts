/**
 * Web-specific Button implementation
 */
import React from 'react';
import { ButtonProps } from '../../components/Button';
export interface WebButtonProps extends ButtonProps {
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    download?: string;
}
export declare const WebButton: React.FC<WebButtonProps>;
//# sourceMappingURL=WebButton.d.ts.map