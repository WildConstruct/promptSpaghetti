/**
 * Epic 16 ROI Calculator Component
 * 
 * Calculates return on investment for prompt templates by comparing
 * template usage costs vs. manual prompt development time and Claude API costs.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, Clock, TrendingUp, Target, Zap } from 'lucide-react';
interface ROIInputs {
  // Template costs
  templatePrice: number; // in cents,
  templateUsageFrequency: number; // uses per month,
  claudeTokensPerUse: number; // estimated tokens per template use,
  // Manual alternative costs
  manualDevelopmentHours: number; // hours to develop equivalent manually,
  developerHourlyRate: number; // $/hour for developer time,
  manualTokensPerUse: number; // estimated tokens for manual prompts,
  // Time horizon
  analysisMonths: number; // number of months to analyze,
  // Claude API pricing (2025 rates)
  claudeTokenCostPer1K: number; // cost per 1K tokens,
  interface ROIResult {
  templateTotalCost: number;,
  manualTotalCost: number;
  netSavings: number;,
  roi: number; // as percentage,
  paybackMonths: number;,
  monthlySavings: number;
  timeToValue: string;,
  efficiency: number; // efficiency factor,
  interface ROICalculatorProps {
  className?: string;
  onResultsChange?: (results: ROIResult) => void;
  presetScenario?: 'startup' | 'enterprise' | 'individual' | 'agency';
  export const ROICalculator: React.FC<ROICalculatorProps> = ({,)
  className = '',
  onResultsChange,
  presetScenario
}) => {
  const [inputs, setInputs] = useState<ROIInputs>({)
  templatePrice: 999, // $9.99 in cents,
  templateUsageFrequency: 20,
  claudeTokensPerUse: 1500,
  manualDevelopmentHours: 8,
  developerHourlyRate: 85,
  manualTokensPerUse: 2500,
  analysisMonths: 12,
  claudeTokenCostPer1K: 0.015 // Claude 3 Haiku pricing,
});
  const [activeScenario, setActiveScenario] = useState<string>(presetScenario || 'individual');
  // Preset scenarios for different user types
  const presetScenarios = {
  individual: {,
  templatePrice: 499, // $4.99,
  templateUsageFrequency: 10,
  claudeTokensPerUse: 1200,
  manualDevelopmentHours: 4,
  developerHourlyRate: 50,
  manualTokensPerUse: 2000,
  analysisMonths: 6,
  claudeTokenCostPer1K: 0.015,
},
  startup: {,
  templatePrice: 999, // $9.99,
  templateUsageFrequency: 30,
  claudeTokensPerUse: 1500,
  manualDevelopmentHours: 6,
  developerHourlyRate: 75,
  manualTokensPerUse: 2500,
  analysisMonths: 12,
  claudeTokenCostPer1K: 0.015,
},
  agency: {,
  templatePrice: 1999, // $19.99,
  templateUsageFrequency: 100,
  claudeTokensPerUse: 2000,
  manualDevelopmentHours: 12,
  developerHourlyRate: 95,
  manualTokensPerUse: 3500,
  analysisMonths: 12,
  claudeTokenCostPer1K: 0.015,
},
  enterprise: {,
  templatePrice: 4999, // $49.99,
  templateUsageFrequency: 250,
  claudeTokensPerUse: 2500,
  manualDevelopmentHours: 20,
  developerHourlyRate: 120,
  manualTokensPerUse: 4000,
  analysisMonths: 24,
  claudeTokenCostPer1K: 0.015,
};
  // Load preset scenario when changed
  useEffect(() => {
    if (presetScenario && presetScenarios[presetScenario]) {
      setInputs(presetScenarios[presetScenario]);
      setActiveScenario(presetScenario);
  }, [presetScenario]);
  // Calculate ROI metrics
  const roiResults: ROIResult = useMemo(() => {
    // Template costs
    const templatePurchaseCost = inputs.templatePrice / 100; // convert cents to dollars;
    const templateClaudeTokenCost = (inputs.claudeTokensPerUse / 1000) * inputs.claudeTokenCostPer1K * inputs.templateUsageFrequency * inputs.analysisMonths;
    const templateTotalCost = templatePurchaseCost + templateClaudeTokenCost;
    // Manual alternative costs
    const manualDevelopmentCost = inputs.manualDevelopmentHours * inputs.developerHourlyRate;
    const manualClaudeTokenCost = (inputs.manualTokensPerUse / 1000) * inputs.claudeTokenCostPer1K * inputs.templateUsageFrequency * inputs.analysisMonths;
    const manualTotalCost = manualDevelopmentCost + manualClaudeTokenCost;
    // ROI calculations
    const netSavings = manualTotalCost - templateTotalCost;
    const roi = templateTotalCost > 0 ? (netSavings / templateTotalCost) * 100 : 0;
    const monthlySavings = netSavings / inputs.analysisMonths;
    const paybackMonths = templatePurchaseCost > 0 ? templatePurchaseCost / monthlySavings : 0;
    // Efficiency metrics
    const tokenEfficiency = inputs.manualTokensPerUse > 0 ? ((inputs.manualTokensPerUse - inputs.claudeTokensPerUse) / inputs.manualTokensPerUse) * 100 : 0;
    const timeToValue = paybackMonths < 1 ? `${Math.ceil(paybackMonths * 30)} days` : `${Math.ceil(paybackMonths)} months`;}
    const result: ROIResult = {
  templateTotalCost,
  manualTotalCost,
  netSavings,
  roi,
  paybackMonths,
  monthlySavings,
  timeToValue,
  efficiency: tokenEfficiency,
};
    return result;
  }, [inputs]);
  // Notify parent of results changes
  useEffect(() => {
    onResultsChange?.(roiResults);
  }, [roiResults, onResultsChange]);
  const handleInputChange = (field: keyof ROIInputs, value: number) => {
  setInputs(prev => ({)
  ...prev,
  [field]: value,
}));
  };
  const handleScenarioChange = (scenario: string) => {
    if (presetScenarios[scenario as keyof typeof presetScenarios]) {
      setInputs(presetScenarios[scenario as keyof typeof presetScenarios]);
      setActiveScenario(scenario);
  };
  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {)
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(amount);
  };
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;}
  };
  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-green-600';
    if (roi >= 100) return 'text-blue-600';
    if (roi >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };
  return;
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>}
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">ROI Calculator</h2>
            <p className="text-sm text-gray-500">
              Calculate return on investment for prompt templates vs. manual development
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Scenario Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Scenarios
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(presetScenarios).map((scenario) => ()
              <button
                key={scenario}
                onClick={() => handleScenarioChange(scenario)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
  activeScenario === scenario
  ? 'border-blue-500 bg-blue-50 text-blue-700'
  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
}`}
              >
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
            {/* Template Inputs */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Template Usage</h4>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Template Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={(inputs.templatePrice / 100).toFixed(2)}
                    onChange={(e) => handleInputChange('templatePrice', Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Usage Frequency (per month)
                </label>
                <input
                  type="number"
                  value={inputs.templateUsageFrequency}
                  onChange={(e) => handleInputChange('templateUsageFrequency', parseInt(e.target.value || '0'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Claude Tokens per Use
                </label>
                <input
                  type="number"
                  value={inputs.claudeTokensPerUse}
                  onChange={(e) => handleInputChange('claudeTokensPerUse', parseInt(e.target.value || '0'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                  step="100"
                />
              </div>
            </div>
            {/* Manual Alternative Inputs */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Manual Alternative</h4>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Development Hours
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={inputs.manualDevelopmentHours}
                    onChange={(e) => handleInputChange('manualDevelopmentHours', parseFloat(e.target.value || '0'))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="0.5"
                    min="0.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Developer Rate ($/hour)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={inputs.developerHourlyRate}
                    onChange={(e) => handleInputChange('developerHourlyRate', parseFloat(e.target.value || '0'))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="5"
                    min="10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Manual Tokens per Use
                </label>
                <input
                  type="number"
                  value={inputs.manualTokensPerUse}
                  onChange={(e) => handleInputChange('manualTokensPerUse', parseInt(e.target.value || '0'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                  step="100"
                />
              </div>
            </div>
            {/* Analysis Period */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Analysis Period (months)
              </label>
              <input
                type="number"
                value={inputs.analysisMonths}
                onChange={(e) => handleInputChange('analysisMonths', parseInt(e.target.value || '0'))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="60"
              />
            </div>
          </div>
          {/* Results */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">ROI Analysis</h3>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className={`text-2xl font-bold ${getROIColor(roiResults.roi)}`}>}
                      {formatPercentage(roiResults.roi)}
                    </p>
                  </div>
                  <TrendingUp className={`w-6 h-6 ${getROIColor(roiResults.roi)}`} />}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Net Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(roiResults.netSavings)}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payback Time</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {roiResults.timeToValue}
                    </p>
                  </div>
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPercentage(roiResults.efficiency)}
                    </p>
                  </div>
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            {/* Cost Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Cost Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Template Total Cost</span>
                  <span className="font-medium">{formatCurrency(roiResults.templateTotalCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Manual Total Cost</span>
                  <span className="font-medium">{formatCurrency(roiResults.manualTotalCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded">
                  <span className="text-sm font-medium text-green-700">Monthly Savings</span>
                  <span className="font-bold text-green-700">{formatCurrency(roiResults.monthlySavings)}</span>
                </div>
              </div>
            </div>
            {/* Analysis Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  Using this template saves <strong>{formatCurrency(roiResults.netSavings)}</strong> over {inputs.analysisMonths} months
                </p>
                <p>
                  ROI of <strong>{formatPercentage(roiResults.roi)}</strong> with payback in <strong>{roiResults.timeToValue}</strong>
                </p>
                <p>
                  <strong>{formatPercentage(roiResults.efficiency)}</strong> improvement in token efficiency
                </p>
              </div>
            </div>
            {/* Action Recommendation */}
            {roiResults.roi > 100 && ()
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Strong ROI Potential</h4>
                    <p className="text-sm text-green-800 mt-1">
                      This template shows excellent return on investment. The financial benefits justify the purchase cost.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;