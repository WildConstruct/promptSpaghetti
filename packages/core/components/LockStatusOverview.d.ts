import React from 'react';
import { LockingStatistics, LockConflict } from '../types/locking';

}
interface LockStatusOverviewProps {
    statistics: LockingStatistics;
    conflicts: LockConflict[];
    onConflictClick: (conflict: LockConflict) => void;

export declare const LockStatusOverview: React.FC<LockStatusOverviewProps>;
}
export {};
//# sourceMappingURL=LockStatusOverview.d.ts.map