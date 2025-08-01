/**
 * Epic 16 Contributor Profile Manager Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Interface for managing contributor profiles, achievements, badges,
 * and notification preferences.
 */
import React from 'react';
import { ContributorProfile } from '../../types/contributions';

}
}
export interface ContributorProfileManagerProps {
    profile: ContributorProfile;
    onProfileUpdate: (profile: ContributorProfile) => void;
    readOnly?: boolean;
    className?: string;

export declare const ContributorProfileManager: React.FC<ContributorProfileManagerProps>;
export default ContributorProfileManager;
//# sourceMappingURL=ContributorProfileManager.d.ts.map
}
}