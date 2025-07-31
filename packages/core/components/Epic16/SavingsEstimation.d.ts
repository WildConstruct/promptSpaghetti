/**
 * Epic 16 Savings Estimation Component
 *
 * Estimates cost and time savings from using prompt templates compared to
 * manual prompt creation, with detailed breakdowns and projections.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import React from 'react';
}
interface SavingsBreakdown {
    tokenSavings: {
        templateTokenCost: number;
        manualTokenCost: number;
        netTokenSavings: number;
        tokenEfficiency: number;
}
    };
    timeSavings: {
        templateTimeSpent: number;
        manualTimeSpent: number;
        netTimeSavings: number;
        timeEfficiency: number;
    };
    qualitySavings: {
        templateQualityValue: number;
        manualQualityValue: number;
        qualityImprovement: number;
    };
    totalSavings: {
        monthlySavings: number;
        yearlySavings: number;
        totalProjectSavings: number;
        savingsPerUse: number;
    };
    productivity: {
        productivityGain: number;
        capacityIncrease: number;
        errorReduction: number;
    };
}
interface SavingsEstimationProps {
    className?: string;
    onSavingsChange?: (savings: SavingsBreakdown) => void;
    comparisonMode?: 'detailed' | 'summary';
    industryPreset?: 'content' | 'development' | 'marketing' | 'research';

export declare const SavingsEstimation: React.FC<SavingsEstimationProps>;
export default SavingsEstimation;
//# sourceMappingURL=SavingsEstimation.d.ts.map
}