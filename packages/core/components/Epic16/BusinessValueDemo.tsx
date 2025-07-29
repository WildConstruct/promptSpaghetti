/**
 * Epic 16 Business Value Demo Component
 * 
 * Demonstrates both ROI Calculator and Savings Estimation components
 * working together to showcase the business value of prompt templates.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import React, { useState } from 'react';
import { Calculator, PiggyBank, TrendingUp, BarChart3, Download } from 'lucide-react';
import { ROICalculator } from './ROICalculator';
import { SavingsEstimation } from './SavingsEstimation';
interface BusinessValueDemoProps {
  className?: string;
  templateExample?: {
  name: string;
  price: number;
  description: string;
  category: string;
};

export const BusinessValueDemo: React.FC<BusinessValueDemoProps> = ({)
  className = '',
  templateExample = {
  name: 'Professional Email Templates',
  price: 999, // $9.99 in cents,
  description: 'Comprehensive set of business email templates for various scenarios',
  category: 'Business Communication',
}) => {
  const [activeTab, setActiveTab] = useState<'roi' | 'savings' | 'summary'>('roi');
  const [roiResults, setROIResults] = useState<unknown>(null);
  const [savingsResults, setSavingsResults] = useState<unknown>(null);
  const [industryPreset, setIndustryPreset] = useState<string>('startup');
  const formatCurrency = (amount: number) => {,
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
  const generateReport = () => {
  if (!roiResults || !savingsResults) return;
  const report = {
  template: templateExample,
  roi: roiResults,
  savings: savingsResults,
  summary: {
  totalValue: roiResults.netSavings + savingsResults.totalSavings.totalProjectSavings,
  paybackTime: roiResults.timeToValue,
  efficiency: savingsResults.productivity.productivityGain,
  recommendation: roiResults.roi > 100 ? 'Strongly Recommended' : roiResults.roi > 50 ? 'Recommended' : 'Consider Alternatives',
},
  generatedAt: new Date().toISOString();
  };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-value-analysis-${templateExample.name.toLowerCase().replace(/\s+/g, '-')}.json`;}
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return;
    <div className={`space-y-6 ${className}`}>}
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Business Value Analysis
            </h2>
            <p className="text-gray-600 mb-4">
              Analyze the ROI and cost savings for: <span className="font-medium">{templateExample.name}</span>
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {templateExample.category}
              </span>
              <span className="text-gray-600">
                Price: {formatCurrency(templateExample.price / 100)}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateReport}
              disabled={!roiResults || !savingsResults}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
  roiResults && savingsResults
  ? 'bg-blue-600 text-white hover:bg-blue-700',
  : 'bg-gray-300 text-gray-500 cursor-not-allowed',
}`}
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>
      {/* Industry Preset Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Your Industry/Use Case
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['individual', 'startup', 'agency', 'enterprise'].map((preset) => ()
            <button
              key={preset}
              onClick={() => setIndustryPreset(preset)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
  industryPreset === preset
  ? 'border-blue-500 bg-blue-50 text-blue-700'
  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
}`}
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <nav className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('roi')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
  activeTab === 'roi'
  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span>ROI Calculator</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
  activeTab === 'savings'
  ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <PiggyBank className="w-4 h-4" />
              <span>Savings Estimation</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-4 px-6 text-center font-medium ${
  activeTab === 'summary'
  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Executive Summary</span>
            </div>
          </button>
        </nav>
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'roi' && ()
            <ROICalculator
              onResultsChange={setROIResults}
              presetScenario={industryPreset as any}
            />
          )}
          {activeTab === 'savings' && ()
            <SavingsEstimation
              onSavingsChange={setSavingsResults}
              industryPreset={industryPreset as any}
            />
          )}
          {activeTab === 'summary' && ()
            <div className="space-y-6">
              {!roiResults || !savingsResults ? ()
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Complete Analysis Required
                  </h3>
                  <p className="text-gray-500">
                    Please visit the ROI Calculator and Savings Estimation tabs to generate your executive summary.
                  </p>
                </div>
              ) : ()
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Executive Summary</h3>
                  {/* Key Metrics Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 mb-1">Total ROI</p>
                          <p className="text-3xl font-bold text-green-700">
                            {formatPercentage(roiResults.roi)}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            {formatCurrency(roiResults.netSavings)} savings
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 mb-1">Payback Time</p>
                          <p className="text-3xl font-bold text-blue-700">
                            {roiResults.timeToValue}
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            {formatCurrency(roiResults.monthlySavings)}/month
                          </p>
                        </div>
                        <Calculator className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 mb-1">Efficiency Gain</p>
                          <p className="text-3xl font-bold text-purple-700">
                            {formatPercentage(savingsResults.productivity.productivityGain)}
                          </p>
                          <p className="text-sm text-purple-600 mt-1">
                            Productivity boost
                          </p>
                        </div>
                        <PiggyBank className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  {/* Business Impact Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Business Impact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Financial Benefits</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex justify-between">
                            <span>Annual Savings:</span>
                            <span className="font-medium">{formatCurrency(savingsResults.totalSavings.yearlySavings)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Cost per Use:</span>
                            <span className="font-medium">{formatCurrency(savingsResults.totalSavings.savingsPerUse)} saved</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Token Efficiency:</span>
                            <span className="font-medium">{formatPercentage(savingsResults.tokenSavings.tokenEfficiency)}</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Operational Benefits</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex justify-between">
                            <span>Time Efficiency:</span>
                            <span className="font-medium">{formatPercentage(savingsResults.timeSavings.timeEfficiency)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Error Reduction:</span>
                            <span className="font-medium">{formatPercentage(savingsResults.productivity.errorReduction)}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Quality Improvement:</span>
                            <span className="font-medium">{formatPercentage(savingsResults.qualitySavings.qualityImprovement)}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  {/* Recommendation */}
                  <div className={`rounded-lg p-6 border ${
  roiResults.roi > 100
  ? 'bg-green-50 border-green-200'
  : roiResults.roi > 50,
  ? 'bg-yellow-50 border-yellow-200'
  : 'bg-red-50 border-red-200',
}`}>
                    <h4 className={`font-semibold mb-3 ${
  roiResults.roi > 100
  ? 'text-green-900'
  : roiResults.roi > 50,
  ? 'text-yellow-900'
  : 'text-red-900',
}`}>
                      Recommendation
                    </h4>
                    <div className={`text-sm ${
  roiResults.roi > 100
  ? 'text-green-800'
  : roiResults.roi > 50,
  ? 'text-yellow-800'
  : 'text-red-800',
}`}>
                      {roiResults.roi > 100 ? ()
                        <p>
                          <strong>Strongly Recommended:</strong> This template shows excellent ROI with {formatPercentage(roiResults.roi)} return 
                          and payback in {roiResults.timeToValue}. The business case is compelling with significant cost savings 
                          and productivity improvements.
                        </p>
                      ) : roiResults.roi > 50 ? ()
                        <p>
                          <strong>Recommended:</strong> This template provides positive ROI with reasonable payback time. 
                          Consider the productivity and quality benefits alongside the financial savings.
                        </p>
                      ) : ()
                        <p>
                          <strong>Consider Alternatives:</strong> The ROI is below optimal thresholds. 
                          Review usage patterns or explore alternative templates that might provide better value.
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Action Items */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">Next Steps</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>Share this analysis with stakeholders for approval</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>Plan implementation timeline based on {roiResults.timeToValue} payback period</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>Set up metrics tracking to measure actual vs. projected savings</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>Consider scaling to additional use cases for maximum benefit</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessValueDemo;