/**
 * Epic 16 ROI Calculator Component
 *
 * Calculates return on investment for prompt templates by comparing
 * template usage costs vs. manual prompt development time and Claude API costs.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import React from 'react';

}
interface ROIResult {
    templateTotalCost: number;
    manualTotalCost: number;
    netSavings: number;
    roi: number;
    paybackMonths: number;
    monthlySavings: number;
    timeToValue: string;
    efficiency: number;


}
interface ROICalculatorProps {
    className?: string;
    onResultsChange?: (results: ROIResult) => void;
    presetScenario?: 'startup' | 'enterprise' | 'individual' | 'agency';

export declare const ROICalculator: React.FC<ROICalculatorProps>;
export default ROICalculator;
//# sourceMappingURL=ROICalculator.d.ts.map
}