/**
 * Epic 16 Contribution Card Component
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Displays individual contributions in card format with type-specific
 * styling, status indicators, and engagement metrics.
 */
import React from 'react';
import { Contribution } from '../../types/contributions';

}
export interface ContributionCardProps {
    contribution: Contribution;
    variant?: 'compact' | 'standard' | 'detailed';
    showActions?: boolean;
    onClick?: (contribution: Contribution) => void;
    onEdit?: (contributionId: string) => void;
    onDelete?: (contributionId: string) => void;
    onView?: (contributionId: string) => void;
    className?: string;

export declare const ContributionCard: React.FC<ContributionCardProps>;
export default ContributionCard;
//# sourceMappingURL=ContributionCard.d.ts.map
}