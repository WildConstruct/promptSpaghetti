/**
 * Usage Quota Management Dashboard - Epic 17
 *
 * Comprehensive admin interface for managing usage quotas, tracking violations,
 * and monitoring system-wide quota utilization. Part of Epic 17 Backstage
 * Admin Controls for platform oversight and resource management.
 *
 * Task: E17-1753114397228-B591AA - Create usage quotas
 * Epic: 17 - Backstage Admin Controls
 */
import React from 'react';
import { UsageQuota } from '../../types/UsageQuotaTypes';
interface UsageQuotaDashboardProps {
    onQuotaCreate?: (quota: Omit<UsageQuota, 'quotaId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onQuotaUpdate?: (quotaId: string, updates: Partial<UsageQuota>) => Promise<void>;
    onQuotaDelete?: (quotaId: string) => Promise<void>;
    onViolationResolve?: (violationId: string, resolution: string) => Promise<void>;
    onQuotaOverride?: (quotaId: string, userId: string, overrideAmount: number, duration: number) => Promise<void>;
    className?: string;
}
export declare const UsageQuotaDashboard: React.FC<UsageQuotaDashboardProps>;
export default UsageQuotaDashboard;
//# sourceMappingURL=UsageQuotaDashboard.d.ts.map