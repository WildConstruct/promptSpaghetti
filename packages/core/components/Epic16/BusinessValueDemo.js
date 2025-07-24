import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Business Value Demo Component
 *
 * Demonstrates both ROI Calculator and Savings Estimation components
 * working together to showcase the business value of prompt templates.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import { useState } from 'react';
import { Calculator, PiggyBank, TrendingUp, BarChart3, Download } from 'lucide-react';
import { ROICalculator } from './ROICalculator.js';
import { SavingsEstimation } from './SavingsEstimation.js';
export const BusinessValueDemo = ({ className = '', templateExample = {
    name: 'Professional Email Templates',
    price: 999, // $9.99 in cents
    description: 'Comprehensive set of business email templates for various scenarios',
    category: 'Business Communication'
} }) => {
    const [activeTab, setActiveTab] = useState('roi');
    const [roiResults, setROIResults] = useState(null);
    const [savingsResults, setSavingsResults] = useState(null);
    const [industryPreset, setIndustryPreset] = useState('startup');
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };
    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };
    const generateReport = () => {
        if (!roiResults || !savingsResults)
            return;
        const report = {
            template: templateExample,
            roi: roiResults,
            savings: savingsResults,
            summary: {
                totalValue: roiResults.netSavings + savingsResults.totalSavings.totalProjectSavings,
                paybackTime: roiResults.timeToValue,
                efficiency: savingsResults.productivity.productivityGain,
                recommendation: roiResults.roi > 100 ? 'Strongly Recommended' : roiResults.roi > 50 ? 'Recommended' : 'Consider Alternatives'
            },
            generatedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `business-value-analysis-${templateExample.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Business Value Analysis" }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["Analyze the ROI and cost savings for: ", _jsx("span", { className: "font-medium", children: templateExample.name })] }), _jsxs("div", { className: "flex items-center space-x-4 text-sm", children: [_jsx("span", { className: "px-3 py-1 bg-blue-100 text-blue-800 rounded-full", children: templateExample.category }), _jsxs("span", { className: "text-gray-600", children: ["Price: ", formatCurrency(templateExample.price / 100)] })] })] }), _jsx("div", { className: "flex space-x-3", children: _jsxs("button", { onClick: generateReport, disabled: !roiResults || !savingsResults, className: `flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${roiResults && savingsResults
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`, children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export Report" })] }) })] }) }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Select Your Industry/Use Case" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: ['individual', 'startup', 'agency', 'enterprise'].map((preset) => (_jsx("button", { onClick: () => setIndustryPreset(preset), className: `p-3 rounded-lg border text-sm font-medium transition-colors ${industryPreset === preset
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`, children: preset.charAt(0).toUpperCase() + preset.slice(1) }, preset))) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [_jsxs("nav", { className: "flex border-b border-gray-200", children: [_jsx("button", { onClick: () => setActiveTab('roi'), className: `flex-1 py-4 px-6 text-center font-medium ${activeTab === 'roi'
                                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`, children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Calculator, { className: "w-4 h-4" }), _jsx("span", { children: "ROI Calculator" })] }) }), _jsx("button", { onClick: () => setActiveTab('savings'), className: `flex-1 py-4 px-6 text-center font-medium ${activeTab === 'savings'
                                    ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`, children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(PiggyBank, { className: "w-4 h-4" }), _jsx("span", { children: "Savings Estimation" })] }) }), _jsx("button", { onClick: () => setActiveTab('summary'), className: `flex-1 py-4 px-6 text-center font-medium ${activeTab === 'summary'
                                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`, children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(BarChart3, { className: "w-4 h-4" }), _jsx("span", { children: "Executive Summary" })] }) })] }), _jsxs("div", { className: "p-6", children: [activeTab === 'roi' && (_jsx(ROICalculator, { onResultsChange: setROIResults, presetScenario: industryPreset })), activeTab === 'savings' && (_jsx(SavingsEstimation, { onSavingsChange: setSavingsResults, industryPreset: industryPreset })), activeTab === 'summary' && (_jsx("div", { className: "space-y-6", children: !roiResults || !savingsResults ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(BarChart3, { className: "mx-auto w-12 h-12 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Complete Analysis Required" }), _jsx("p", { className: "text-gray-500", children: "Please visit the ROI Calculator and Savings Estimation tabs to generate your executive summary." })] })) : (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900", children: "Executive Summary" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "bg-green-50 rounded-lg p-6 border border-green-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-green-600 mb-1", children: "Total ROI" }), _jsx("p", { className: "text-3xl font-bold text-green-700", children: formatPercentage(roiResults.roi) }), _jsxs("p", { className: "text-sm text-green-600 mt-1", children: [formatCurrency(roiResults.netSavings), " savings"] })] }), _jsx(TrendingUp, { className: "w-8 h-8 text-green-600" })] }) }), _jsx("div", { className: "bg-blue-50 rounded-lg p-6 border border-blue-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-600 mb-1", children: "Payback Time" }), _jsx("p", { className: "text-3xl font-bold text-blue-700", children: roiResults.timeToValue }), _jsxs("p", { className: "text-sm text-blue-600 mt-1", children: [formatCurrency(roiResults.monthlySavings), "/month"] })] }), _jsx(Calculator, { className: "w-8 h-8 text-blue-600" })] }) }), _jsx("div", { className: "bg-purple-50 rounded-lg p-6 border border-purple-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-purple-600 mb-1", children: "Efficiency Gain" }), _jsx("p", { className: "text-3xl font-bold text-purple-700", children: formatPercentage(savingsResults.productivity.productivityGain) }), _jsx("p", { className: "text-sm text-purple-600 mt-1", children: "Productivity boost" })] }), _jsx(PiggyBank, { className: "w-8 h-8 text-purple-600" })] }) })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Business Impact" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h5", { className: "font-medium text-gray-700", children: "Financial Benefits" }), _jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Annual Savings:" }), _jsx("span", { className: "font-medium", children: formatCurrency(savingsResults.totalSavings.yearlySavings) })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Cost per Use:" }), _jsxs("span", { className: "font-medium", children: [formatCurrency(savingsResults.totalSavings.savingsPerUse), " saved"] })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Token Efficiency:" }), _jsx("span", { className: "font-medium", children: formatPercentage(savingsResults.tokenSavings.tokenEfficiency) })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h5", { className: "font-medium text-gray-700", children: "Operational Benefits" }), _jsxs("ul", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Time Efficiency:" }), _jsx("span", { className: "font-medium", children: formatPercentage(savingsResults.timeSavings.timeEfficiency) })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Error Reduction:" }), _jsx("span", { className: "font-medium", children: formatPercentage(savingsResults.productivity.errorReduction) })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: "Quality Improvement:" }), _jsx("span", { className: "font-medium", children: formatPercentage(savingsResults.qualitySavings.qualityImprovement) })] })] })] })] })] }), _jsxs("div", { className: `rounded-lg p-6 border ${roiResults.roi > 100
                                                ? 'bg-green-50 border-green-200'
                                                : roiResults.roi > 50
                                                    ? 'bg-yellow-50 border-yellow-200'
                                                    : 'bg-red-50 border-red-200'}`, children: [_jsx("h4", { className: `font-semibold mb-3 ${roiResults.roi > 100
                                                        ? 'text-green-900'
                                                        : roiResults.roi > 50
                                                            ? 'text-yellow-900'
                                                            : 'text-red-900'}`, children: "Recommendation" }), _jsx("div", { className: `text-sm ${roiResults.roi > 100
                                                        ? 'text-green-800'
                                                        : roiResults.roi > 50
                                                            ? 'text-yellow-800'
                                                            : 'text-red-800'}`, children: roiResults.roi > 100 ? (_jsxs("p", { children: [_jsx("strong", { children: "Strongly Recommended:" }), " This template shows excellent ROI with ", formatPercentage(roiResults.roi), " return and payback in ", roiResults.timeToValue, ". The business case is compelling with significant cost savings and productivity improvements."] })) : roiResults.roi > 50 ? (_jsxs("p", { children: [_jsx("strong", { children: "Recommended:" }), " This template provides positive ROI with reasonable payback time. Consider the productivity and quality benefits alongside the financial savings."] })) : (_jsxs("p", { children: [_jsx("strong", { children: "Consider Alternatives:" }), " The ROI is below optimal thresholds. Review usage patterns or explore alternative templates that might provide better value."] })) })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-6 border border-blue-200", children: [_jsx("h4", { className: "font-semibold text-blue-900 mb-3", children: "Next Steps" }), _jsxs("ul", { className: "space-y-2 text-sm text-blue-800", children: [_jsxs("li", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600", children: "\u2022" }), _jsx("span", { children: "Share this analysis with stakeholders for approval" })] }), _jsxs("li", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600", children: "\u2022" }), _jsxs("span", { children: ["Plan implementation timeline based on ", roiResults.timeToValue, " payback period"] })] }), _jsxs("li", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600", children: "\u2022" }), _jsx("span", { children: "Set up metrics tracking to measure actual vs. projected savings" })] }), _jsxs("li", { className: "flex items-start space-x-2", children: [_jsx("span", { className: "text-blue-600", children: "\u2022" }), _jsx("span", { children: "Consider scaling to additional use cases for maximum benefit" })] })] })] })] })) }))] })] })] }));
};
export default BusinessValueDemo;
