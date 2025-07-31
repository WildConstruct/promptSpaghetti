/**
 * Verification Status Tracker - E17-1753114397395-B624E7
 *
 * Real-time status tracking for verification requests.
 * Shows current status, progress, and next steps for each verification type.
 */
import React from 'react';
import { IdentityValidationType } from '../../auth/IdentityValidation';

}
interface VerificationStatusTrackerProps {
    userId: string;
    onRefresh?: () => void;
    onRequestVerification?: (type: IdentityValidationType) => void;

export declare const VerificationStatusTracker: React.FC<VerificationStatusTrackerProps>;
export default VerificationStatusTracker;
//# sourceMappingURL=VerificationStatusTracker.d.ts.map
}