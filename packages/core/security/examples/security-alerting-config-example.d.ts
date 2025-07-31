/**
 * Security Alerting Configuration Integration Example
 * Task T-1752989143998-161: Build security alerting configuration UI
 *
 * This example demonstrates how to integrate the SecurityAlertingConfigurationUI
 * component into an application with proper state management, validation,
 * and error handling.
 *
 * Features Demonstrated:
 * - Configuration state management
 * - Real-time validation
 * - Error handling and user feedback
 * - Role-based access control
 * - Theme customization
 * - Persistence layer integration
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React from 'react';

}
interface SecurityConfigurationPageProps {
    userRole: 'admin' | 'security_admin' | 'security_analyst';
    userId: string;
    organizationId: string;
    theme?: 'light' | 'dark' | 'cinema';


/**
 * Complete security configuration page with state management and persistence
 */
export declare const SecurityConfigurationPage: React.FC<SecurityConfigurationPageProps>;
/**
 * Simplified example for basic usage
 */
export declare const BasicSecurityConfigExample: React.FC;
/**
 * Hook-based example using the custom hook
 */
export declare const HookBasedExample: React.FC;
export default SecurityConfigurationPage;
//# sourceMappingURL=security-alerting-config-example.d.ts.map
}