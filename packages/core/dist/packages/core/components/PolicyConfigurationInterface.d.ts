/**
 * Policy Configuration Interface - Epic 19
 *
 * Comprehensive React interface for policy authoring, management, versioning,
 * and deployment configuration.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React from 'react';
type PolicyType = 'PRIVACY_POLICY' | 'TERMS_OF_SERVICE' | 'COOKIE_POLICY' | 'DATA_PROCESSING_AGREEMENT' | 'CONSENT_POLICY' | 'RETENTION_POLICY' | 'SECURITY_POLICY' | 'ACCEPTABLE_USE_POLICY' | 'GDPR_POLICY' | 'CCPA_POLICY' | 'CUSTOM';
interface PolicyConfigurationInterfaceProps {
    onPolicyCreate?: (policy: unknown) => void;
    onPolicyUpdate?: (policy: unknown) => void;
    onPolicyDeploy?: (deployment: unknown) => void;
    initialPolicy?: unknown;
    mode?: 'create' | 'edit' | 'view';
    complianceFrameworks?: string[];
    jurisdictions?: string[];
    templates?: PolicyTemplate[];
}
interface PolicyTemplate {
    templateId: string;
    name: string;
    description: string;
    framework: string;
    policyType: PolicyType;
    variables: TemplateVariable[];
}
interface TemplateVariable {
    name: string;
    type: 'TEXT' | 'EMAIL' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'LIST';
    required: boolean;
    defaultValue?: unknown;
    description?: string;
}
export declare const PolicyConfigurationInterface: React.FC<PolicyConfigurationInterfaceProps>;
export default PolicyConfigurationInterface;
//# sourceMappingURL=PolicyConfigurationInterface.d.ts.map