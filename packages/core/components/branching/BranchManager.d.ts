import React from 'react';
import { ProjectBranch } from '../../types/branching';
interface BranchManagerProps {
    projectId: string;
    currentBranchId?: string;
    onBranchSelect?: (branchId: string) => void;
    onBranchCreate?: (branch: ProjectBranch) => void;
    onBranchUpdate?: (branch: ProjectBranch) => void;
    onBranchDelete?: (branchId: string) => void;
}
export declare const BranchManager: React.FC<BranchManagerProps>;
export {};
//# sourceMappingURL=BranchManager.d.ts.map