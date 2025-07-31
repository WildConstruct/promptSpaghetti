/**
 * Epic 16 Savings Estimation Component
 * 
 * Estimates cost and time savings from using prompt templates compared to
 * manual prompt creation, with detailed breakdowns and projections.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { PiggyBank, Clock, Zap, Target, ArrowRight } from 'lucide-react';
}
interface SavingsInputs {
  // Usage patterns
  monthlyUsage: number; // number of times template/manual prompts used per month,
  projectDuration: number; // months to analyze,
  // Template scenario
  templateTokens: number; // average tokens per template use,
  templateAccuracy: number; // accuracy rate (0-100%),
  templateSetupTime: number; // minutes to set up and use template,
  // Manual scenario
  manualTokens: number; // average tokens per manual prompt,
  manualAccuracy: number; // accuracy rate (0-100%),
  manualCreationTime: number; // minutes to create manual prompt,
  manualIterations: number; // average iterations needed,
  // Cost factors
  claudeTokenCost: number; // cost per 1K tokens,
  hourlyLabourCost: number; // cost per hour for human time,
  revisionCost: number; // cost of revision cycles,
  // Quality factors
  templateQualityScore: number; // 1-10 quality score,
  manualQualityScore: number; // 1-10 quality score,
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
  export const SavingsEstimation: React.FC<SavingsEstimationProps> = ({,)
  className = '',
  onSavingsChange,
  comparisonMode = 'detailed',
  industryPreset
}
}) => {
  const [inputs, setInputs] = useState<SavingsInputs>({)
  monthlyUsage: 25,
  projectDuration: 12,
  templateTokens: 1200,
  templateAccuracy: 95,
  templateSetupTime: 5,
  manualTokens: 2000,
  manualAccuracy: 75,
  manualCreationTime: 45,
  manualIterations: 2.5,
  claudeTokenCost: 0.015,
  hourlyLabourCost: 75,
  revisionCost: 25,
  templateQualityScore: 8.5,
  manualQualityScore: 6.5,
});
  // Industry presets
  const industryPresets = {
  content: {
  monthlyUsage: 40,
  templateTokens: 800,
  templateAccuracy: 92,
  templateSetupTime: 3,
  manualTokens: 1500,
  manualAccuracy: 70,
  manualCreationTime: 35,
  manualIterations: 3,
  hourlyLabourCost: 65,
  templateQualityScore: 8.2,
  manualQualityScore: 6.0,
},
  development: {
  monthlyUsage: 60,
  templateTokens: 1500,
  templateAccuracy: 98,
  templateSetupTime: 8,
  manualTokens: 2500,
  manualAccuracy: 80,
  manualCreationTime: 60,
  manualIterations: 2,
  hourlyLabourCost: 95,
  templateQualityScore: 9.0,
  manualQualityScore: 7.0,
},
  marketing: {
  monthlyUsage: 30,
  templateTokens: 1000,
  templateAccuracy: 90,
  templateSetupTime: 4,
  manualTokens: 1800,
  manualAccuracy: 65,
  manualCreationTime: 40,
  manualIterations: 3.5,
  hourlyLabourCost: 70,
  templateQualityScore: 8.0,
  manualQualityScore: 5.5,
},
  research: {
  monthlyUsage: 20,
  templateTokens: 2000,
  templateAccuracy: 96,
  templateSetupTime: 10,
  manualTokens: 3000,
  manualAccuracy: 85,
  manualCreationTime: 75,
  manualIterations: 2,
  hourlyLabourCost: 85,
  templateQualityScore: 9.2,
  manualQualityScore: 7.5,
};
  // Load industry preset
  useEffect(() => {
    if (industryPreset && industryPresets[industryPreset]) {
      const preset = industryPresets[industryPreset];
      setInputs(prev => ({)
  ...prev,
        ...preset
      }));
  }, [industryPreset]);
  // Calculate savings breakdown
  const savingsBreakdown: SavingsBreakdown = useMemo(() => {
  const totalUsage = inputs.monthlyUsage * inputs.projectDuration;
  // Token costs
  const templateTokenCost = (inputs.templateTokens / 1000) * inputs.claudeTokenCost * totalUsage;
  const manualTokenCost = (inputs.manualTokens / 1000) * inputs.claudeTokenCost * totalUsage * inputs.manualIterations;
  const netTokenSavings = manualTokenCost - templateTokenCost;
  const tokenEfficiency = manualTokenCost > 0 ? (netTokenSavings / manualTokenCost) * 100 : 0;
  // Time costs
  const templateTimeHours = (inputs.templateSetupTime / 60) * totalUsage;
  const manualTimeHours = (inputs.manualCreationTime / 60) * totalUsage * inputs.manualIterations;
  const templateTimeCost = templateTimeHours * inputs.hourlyLabourCost;
  const manualTimeCost = manualTimeHours * inputs.hourlyLabourCost;
  const netTimeSavings = manualTimeCost - templateTimeCost;
  const timeEfficiency = manualTimeCost > 0 ? (netTimeSavings / manualTimeCost) * 100 : 0;
  // Quality value calculation
  const templateQualityValue = inputs.templateQualityScore * inputs.templateAccuracy * 0.01;
  const manualQualityValue = inputs.manualQualityScore * inputs.manualAccuracy * 0.01;
  const qualityImprovement = ((templateQualityValue - manualQualityValue) / manualQualityValue) * 100;
  // Total savings
  const totalProjectSavings = netTokenSavings + netTimeSavings;
  const monthlySavings = totalProjectSavings / inputs.projectDuration;
  const yearlySavings = monthlySavings * 12;
  const savingsPerUse = totalProjectSavings / totalUsage;
  // Productivity metrics
  const productivityGain = timeEfficiency;
  const capacityIncrease = manualTimeHours > 0 ? ((manualTimeHours - templateTimeHours) / manualTimeHours) * 100 : 0;
  const errorReduction = ((inputs.templateAccuracy - inputs.manualAccuracy) / inputs.manualAccuracy) * 100;
  const breakdown: SavingsBreakdown = {,
  tokenSavings: {
  templateTokenCost,
  manualTokenCost,
  netTokenSavings,
  tokenEfficiency
},
  timeSavings: {
  templateTimeSpent: templateTimeCost,
  manualTimeSpent: manualTimeCost,
  netTimeSavings,
  timeEfficiency
},
  qualitySavings: {
        templateQualityValue,
        manualQualityValue,
        qualityImprovement
  },
  totalSavings: {
        monthlySavings,
        yearlySavings,
        totalProjectSavings,
        savingsPerUse
  },
  productivity: {
        productivityGain,
        capacityIncrease,
        errorReduction
    };
    return breakdown;
  }, [inputs]);
  // Notify parent of changes
  useEffect(() => {
    onSavingsChange?.(savingsBreakdown);
  }, [savingsBreakdown, onSavingsChange]);
  const handleInputChange = (field: keyof SavingsInputs, value: number) => {
  setInputs(prev => ({)
  ...prev,
  [field]: value,
}));
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
  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;}
    return `${hours.toFixed(1)} hrs`;}
  };
  return;
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>}
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <PiggyBank className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Savings Estimation</h2>
            <p className="text-sm text-gray-500">
              Estimate cost and time savings from template usage vs. manual creation
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Industry Presets */}
        {industryPreset === undefined && ()
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Industry Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(industryPresets).map((preset) => ()
                <button
                  key={preset}
                  onClick={() => setInputs(prev => ({ ...prev, ...industryPresets[preset as keyof typeof industryPresets] }))}
                  className="p-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
            {/* Usage Parameters */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Usage Patterns</h4>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Monthly Usage
                </label>
                <input
                  type="number"
                  value={inputs.monthlyUsage}
                  onChange={(e) => handleInputChange('monthlyUsage', parseInt(e.target.value || '0'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Analysis Period (months)
                </label>
                <input
                  type="number"
                  value={inputs.projectDuration}
                  onChange={(e) => handleInputChange('projectDuration', parseInt(e.target.value || '0'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Hourly Labor Cost ($)
                </label>
                <input
                  type="number"
                  value={inputs.hourlyLabourCost}
                  onChange={(e) => handleInputChange('hourlyLabourCost', parseFloat(e.target.value || '0'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  step="5"
                  min="10"
                />
              </div>
            </div>
            {/* Template vs Manual Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium text-green-700">Template Scenario</h4>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tokens per use</label>
                  <input
                    type="number"
                    value={inputs.templateTokens}
                    onChange={(e) => handleInputChange('templateTokens', parseInt(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Setup time (min)</label>
                  <input
                    type="number"
                    value={inputs.templateSetupTime}
                    onChange={(e) => handleInputChange('templateSetupTime', parseFloat(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Accuracy (%)</label>
                  <input
                    type="number"
                    value={inputs.templateAccuracy}
                    onChange={(e) => handleInputChange('templateAccuracy', parseFloat(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quality score (1-10)</label>
                  <input
                    type="number"
                    value={inputs.templateQualityScore}
                    onChange={(e) => handleInputChange('templateQualityScore', parseFloat(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    min="1"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-orange-700">Manual Scenario</h4>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tokens per use</label>
                  <input
                    type="number"
                    value={inputs.manualTokens}
                    onChange={(e) => handleInputChange('manualTokens', parseInt(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Creation time (min)</label>
                  <input
                    type="number"
                    value={inputs.manualCreationTime}
                    onChange={(e) => handleInputChange('manualCreationTime', parseFloat(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                    step="5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Accuracy (%)</label>
                  <input
                    type="number"
                    value={inputs.manualAccuracy}
                    onChange={(e) => handleInputChange('manualAccuracy', parseFloat(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quality score (1-10)</label>
                  <input
                    type="number"
                    value={inputs.manualQualityScore}
                    onChange={(e) => handleInputChange('manualQualityScore', parseFloat(e.target.value || '0'))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                    min="1"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Savings Summary */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Savings Summary</h3>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Total Savings</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(savingsBreakdown.totalSavings.totalProjectSavings)}
                    </p>
                  </div>
                  <PiggyBank className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Per Use</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(savingsBreakdown.totalSavings.savingsPerUse)}
                    </p>
                  </div>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Time Efficiency</p>
                    <p className="text-xl font-bold text-purple-700">
                      {formatPercentage(savingsBreakdown.timeSavings.timeEfficiency)}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Token Efficiency</p>
                    <p className="text-xl font-bold text-orange-700">
                      {formatPercentage(savingsBreakdown.tokenSavings.tokenEfficiency)}
                    </p>
                  </div>
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
            {/* Detailed Breakdown */}
            {comparisonMode === 'detailed' && ()
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Breakdown by Category</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Token Costs</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(savingsBreakdown.tokenSavings.netTokenSavings)} saved
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Template: {formatCurrency(savingsBreakdown.tokenSavings.templateTokenCost)}</span>
                      <span>Manual: {formatCurrency(savingsBreakdown.tokenSavings.manualTokenCost)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Time Costs</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(savingsBreakdown.timeSavings.netTimeSavings)} saved
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Template: {formatCurrency(savingsBreakdown.timeSavings.templateTimeSpent)}</span>
                      <span>Manual: {formatCurrency(savingsBreakdown.timeSavings.manualTimeSpent)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Quality Improvement</span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatPercentage(savingsBreakdown.qualitySavings.qualityImprovement)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Template: {savingsBreakdown.qualitySavings.templateQualityValue.toFixed(1)}</span>
                      <span>Manual: {savingsBreakdown.qualitySavings.manualQualityValue.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Productivity Gains */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Productivity Impact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-800">Capacity Increase:</span>
                  <span className="font-medium text-blue-900">
                    {formatPercentage(savingsBreakdown.productivity.capacityIncrease)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Error Reduction:</span>
                  <span className="font-medium text-blue-900">
                    {formatPercentage(savingsBreakdown.productivity.errorReduction)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Productivity Gain:</span>
                  <span className="font-medium text-blue-900">
                    {formatPercentage(savingsBreakdown.productivity.productivityGain)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Projections */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Projections</h3>
            {/* Time-based Projections */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Savings Over Time</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Monthly Savings</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(savingsBreakdown.totalSavings.monthlySavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Annual Savings</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(savingsBreakdown.totalSavings.yearlySavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Project Total</span>
                  <span className="font-bold text-green-800">
                    {formatCurrency(savingsBreakdown.totalSavings.totalProjectSavings)}
                  </span>
                </div>
              </div>
            </div>
            {/* Efficiency Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Efficiency Comparison</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Time per Task</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">
                      Manual: {formatHours(inputs.manualCreationTime / 60 * inputs.manualIterations)}
                    </span>
                    <span className="text-green-600">
                      Template: {formatHours(inputs.templateSetupTime / 60)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tokens per Task</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">
                      Manual: {(inputs.manualTokens * inputs.manualIterations).toLocaleString()}
                    </span>
                    <span className="text-green-600">
                      Template: {inputs.templateTokens.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">
                      Manual: {inputs.manualAccuracy}%
                    </span>
                    <span className="text-green-600">
                      Template: {inputs.templateAccuracy}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Impact Summary</h4>
              <div className="text-sm text-gray-800 space-y-2">
                <p>
                  Templates save <strong>{formatCurrency(savingsBreakdown.totalSavings.savingsPerUse)}</strong> per use
                </p>
                <p>
                  <strong>{formatPercentage(savingsBreakdown.productivity.capacityIncrease)}</strong> increase in output capacity
                </p>
                <p>
                  <strong>{formatPercentage(savingsBreakdown.productivity.errorReduction)}</strong> reduction in errors
                </p>
                <p>
                  <strong>{formatPercentage(savingsBreakdown.qualitySavings.qualityImprovement)}</strong> quality improvement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsEstimation;