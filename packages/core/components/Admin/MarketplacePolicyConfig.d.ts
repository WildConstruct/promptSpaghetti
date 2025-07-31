/**
 * Marketplace Policy Configuration - E17-1753114397363-F12F4D
 *
 * Configuration system for marketplace-specific policy use cases
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import React from 'react';

}
export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    action: string;
    enabled: boolean;
    priority: number;

}
export interface MarketplacePolicyTemplate {
    templateId: string;
    name: string;
    description: string;
    category: 'creator' | 'buyer' | 'template' | 'transaction' | 'system';
    rules: PolicyRule[];
    defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
    isSystemTemplate: boolean;
    configurable: {
        thresholds: Record<string, number>;
        timeframes: Record<string, number>;
        actions: string[];
}
    };

}
export interface MarketplacePolicyConfigProps {
    className?: string;

export declare const MarketplacePolicyConfig: React.FC<MarketplacePolicyConfigProps>;
export default MarketplacePolicyConfig;
//# sourceMappingURL=MarketplacePolicyConfig.d.ts.map
}