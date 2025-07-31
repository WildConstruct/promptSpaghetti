/**
 * Epic 16 Help Request System - Main Component
 *
 * Main integration component that brings together all Epic 16 help request
 * functionality including dashboard, form, and intelligent routing.
 */
import React from 'react';
import { HelpRequestConfig } from '../../services/Epic16HelpRequestService';

}
interface Epic16HelpRequestSystemProps {
    userId: string;
    userRole: 'user' | 'agent' | 'admin';
    userType: 'guest' | 'user' | 'seller' | 'buyer' | 'admin';
    userTier: 'free' | 'premium' | 'enterprise';
    config?: Partial<HelpRequestConfig>;
    onConfigChange?: (config: HelpRequestConfig) => void;

export declare const Epic16HelpRequestSystem: React.FC<Epic16HelpRequestSystemProps>;
export default Epic16HelpRequestSystem;
//# sourceMappingURL=Epic16HelpRequestSystem.d.ts.map
}