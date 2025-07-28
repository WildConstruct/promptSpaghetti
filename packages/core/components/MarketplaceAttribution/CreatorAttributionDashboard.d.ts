/**
 * Epic 16 Creator Attribution Dashboard
 * Task: E16-1753114247138-03634F - Add attribution system
 *
 * Comprehensive dashboard for template creators to manage their attribution,
 * revenue sharing, collaborations, and attribution claims.
 */
import React from 'react';

export interface CreatorAttributionDashboardProps {
    userId: string;
    onTemplateClick?: (templateId: string) => void;
    onCollaborationClick?: (templateId: string) => void;
    onSettingsClick?: () => void;
    className?: string;

export declare const CreatorAttributionDashboard: React.FC<CreatorAttributionDashboardProps>;
export default CreatorAttributionDashboard;
//# sourceMappingURL=CreatorAttributionDashboard.d.ts.map