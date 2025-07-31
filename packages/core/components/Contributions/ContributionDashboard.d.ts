/**
 * Epic 16 Contribution Dashboard Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Main dashboard for managing all types of contributions including
 * templates, knowledge articles, tutorials, case studies, and community content.
 */
import React from 'react';
import { Contribution, ContributionFilter } from '../../types/contributions';

}
export interface ContributionDashboardProps {
    userId?: string;
    showCreateForm?: boolean;
    initialFilter?: ContributionFilter;
    onContributionClick?: (contribution: Contribution) => void;
    onContributionEdit?: (contributionId: string) => void;
    onContributionDelete?: (contributionId: string) => void;
    className?: string;

export declare const ContributionDashboard: React.FC<ContributionDashboardProps>;
export default ContributionDashboard;
//# sourceMappingURL=ContributionDashboard.d.ts.map
}