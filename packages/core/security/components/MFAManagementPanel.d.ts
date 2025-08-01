/**
 * MFA Management Panel
 *
 * Comprehensive UI component for managing multi-factor authentication settings.
 * Allows users to enable/disable MFA methods, configure backup codes, manage
 * trusted devices, and view security history.
 *
 * Features:
 * - TOTP setup and management
 * - SMS verification configuration
 * - Email verification settings
 * - Backup codes generation and management
 * - Trusted device management
 * - Security event history
 * - Recovery options configuration
 * - Real-time status updates
 */
import React from 'react';

}
}
interface SecurityEvent { id: string;
    type: 'login' | 'mfa_enabled' | 'mfa_disabled' | 'device_added' | 'device_removed' | 'backup_used';
    description: string;
    timestamp: Date;
    ipAddress: string;
    location: string;
    riskLevel: 'low' | 'medium' | 'high' }
}
}
interface MFAManagementProps {
    userId: string;
    onMFAStatusChange?: (enabled: boolean) => void;
    onSecurityEvent?: (event: SecurityEvent) => void;
    className?: string;

export declare const MFAManagementPanel: React.FC<MFAManagementProps>;
export default MFAManagementPanel;
//# sourceMappingURL=MFAManagementPanel.d.ts.map
}
}