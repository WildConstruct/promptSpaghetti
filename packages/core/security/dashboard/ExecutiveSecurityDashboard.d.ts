/**
 * Executive Security Dashboard
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * High-level executive dashboard providing C-level executives with
 * strategic security posture overview, risk metrics, and business
 * impact assessments for informed decision-making.
 *
 * Features:
 * - Executive-friendly KPI visualization
 * - Business risk impact scoring
 * - Compliance status overview
 * - Security investment ROI
 * - Incident cost analysis
 * - Trend analysis and forecasting
 * - Board-ready reporting
 *
 * Target Users:
 * - Chief Information Security Officer (CISO)
 * - Chief Executive Officer (CEO)
 * - Chief Technology Officer (CTO)
 * - Chief Risk Officer (CRO)
 * - Board of Directors
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React from 'react';
import { DashboardTheme } from './SecurityDashboardFramework';
export interface ExecutiveMetrics {
    securityScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    incidentCount: {,
        total: number;
        resolved: number;
        open: number;
        critical: number;
    };
    complianceScore: number;
    financialImpact: {,
        prevented: number;
        incurred: number;
        savings: number;
        roi: number;
    };
    trends: {,
        securityTrend: 'improving' | 'stable' | 'declining';
        threatTrend: 'increasing' | 'stable' | 'decreasing';
        complianceTrend: 'improving' | 'stable' | 'declining';
    };
    benchmarks: {,
        industryRanking: number;
        peerComparison: 'above' | 'average' | 'below';
        maturityLevel: 'initial' | 'managed' | 'defined' | 'quantitative' | 'optimizing';
    };
}
export interface ExecutiveInsight {
    id: string;
    type: 'risk' | 'opportunity' | 'compliance' | 'investment';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    recommendation: string;
    cost: number;
    benefit: number;
    timeline: string;
    owner: string;
    status: 'new' | 'in_progress' | 'completed' | 'deferred';
}
export interface ExecutiveSecurityDashboardProps {
    metrics: ExecutiveMetrics;
    insights: ExecutiveInsight[];
    theme?: DashboardTheme;
    refreshInterval?: number;
    showFinancials?: boolean;
    showBenchmarks?: boolean;
    onInsightAction?: (insight: ExecutiveInsight, action: string) => void;
    onDrillDown?: (metric: string) => void;
}
/**
 * Executive Security Dashboard Component
 */
export declare const ExecutiveSecurityDashboard: React.FC<ExecutiveSecurityDashboardProps>;
export default ExecutiveSecurityDashboard;
//# sourceMappingURL=ExecutiveSecurityDashboard.d.ts.map