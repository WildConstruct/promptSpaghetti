import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 ROI Calculator Component
 *
 * Calculates return on investment for prompt templates by comparing
 * template usage costs vs. manual prompt development time and Claude API costs.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, Clock, TrendingUp, Target, Zap } from 'lucide-react';
{
    const [inputs, setInputs] = useState({});
    templatePrice: 999, // $9.99 in cents
        templateUsageFrequency;
    20;
    claudeTokensPerUse: 1500;
    manualDevelopmentHours: 8;
    developerHourlyRate: 85;
    manualTokensPerUse: 2500;
    analysisMonths: 12;
    claudeTokenCostPer1K: 0.015; // Claude 3 Haiku pricing }
}
;
const [activeScenario, setActiveScenario] = useState(presetScenario || 'individual');
// Preset scenarios for different user types
const presetScenarios = { individual: {
        templatePrice: 499, // $4.99
        templateUsageFrequency: 10,
        claudeTokensPerUse: 1200,
        manualDevelopmentHours: 4,
        developerHourlyRate: 50,
        manualTokensPerUse: 2000,
        analysisMonths: 6,
        claudeTokenCostPer1K: 0.015
    },
    startup: {
        templatePrice: 999, // $9.99
        templateUsageFrequency: 30,
        claudeTokensPerUse: 1500,
        manualDevelopmentHours: 6,
        developerHourlyRate: 75,
        manualTokensPerUse: 2500,
        analysisMonths: 12,
        claudeTokenCostPer1K: 0.015
    },
    agency: {
        templatePrice: 1999, // $19.99
        templateUsageFrequency: 100,
        claudeTokensPerUse: 2000,
        manualDevelopmentHours: 12,
        developerHourlyRate: 95,
        manualTokensPerUse: 3500,
        analysisMonths: 12,
        claudeTokenCostPer1K: 0.015
    },
    enterprise: {
        templatePrice: 4999, // $49.99
        templateUsageFrequency: 250,
        claudeTokensPerUse: 2500,
        manualDevelopmentHours: 20,
        developerHourlyRate: 120,
        manualTokensPerUse: 4000,
        analysisMonths: 24,
        claudeTokenCostPer1K: 0.015
    }
};
// Load preset scenario when changed
useEffect(() => {
    if (presetScenario && presetScenarios[presetScenario]) {
        setInputs(presetScenarios[presetScenario]);
        setActiveScenario(presetScenario);
    }
    [presetScenario];
});
// Calculate ROI metrics
const roiResults = useMemo(() => {
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
    const timeToValue = paybackMonths < 1 ? `${Math.ceil(paybackMonths * 30)} days` : `${Math.ceil(paybackMonths)} months`;
});
const result = { templateTotalCost,
    manualTotalCost,
    netSavings,
    roi,
    paybackMonths,
    monthlySavings,
    timeToValue,
    efficiency: tokenEfficiency };
;
return result;
[inputs];
;
// Notify parent of results changes
useEffect(() => { onResultsChange?.(roiResults); }, [roiResults, onResultsChange]);
const handleInputChange = (field, value) => {
    setInputs(prev => ({}), ...prev, [field], value);
};
;
;
const handleScenarioChange = (scenario) => {
    if (presetScenarios[scenario]) {
        setInputs(presetScenarios[scenario]);
        setActiveScenario(scenario);
    }
    ;
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {});
        style: 'currency',
            currency;
        'USD',
            minimumFractionDigits;
        2,
            maximumFractionDigits;
        2;
    };
}, format;
(amount);
;
const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
};
;
const getROIColor = (roi) => {
    if (roi >= 300)
        return 'text-green-600';
    if (roi >= 100)
        return 'text-blue-600';
    if (roi >= 0)
        return 'text-yellow-600';
    return 'text-red-600';
};
return;
_jsxs("div", { className: `bg-white rounded-lg shadow-lg border border-gray-200 ${className}`, children: ["}", _jsx("div", { className: "border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Calculator, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "ROI Calculator" }), _jsx("p", { className: "text-sm text-gray-500", children: "Calculate return on investment for prompt templates vs. manual development" })] })] }) }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Quick Scenarios" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [Object.keys(presetScenarios).map((scenario) => ()
                                < button, key = { scenario }, onClick = {}()), " => handleScenarioChange(scenario)} className=", `p-3 rounded-lg border text-sm font-medium transition-colors ${activeScenario === scenario
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
`, ">", scenario.charAt(0).toUpperCase() + scenario.slice(1)] }), "))}"] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Configuration" }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Template Usage" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Template Price" }), _jsxs("div", { className: "relative", children: [_jsx(DollarSign, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "number", value: (inputs.templatePrice / 100).toFixed(2), onChange: (e) => handleInputChange('templatePrice', Math.round(parseFloat(e.target.value || '0') * 100)), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", step: "0.01", min: "0" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Usage Frequency (per month)" }), _jsx("input", { type: "number", value: inputs.templateUsageFrequency, onChange: (e) => handleInputChange('templateUsageFrequency', parseInt(e.target.value || '0')), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", min: "1" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Claude Tokens per Use" }), _jsx("input", { type: "number", value: inputs.claudeTokensPerUse, onChange: (e) => handleInputChange('claudeTokensPerUse', parseInt(e.target.value || '0')), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", min: "100", step: "100" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Manual Alternative" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Development Hours" }), _jsxs("div", { className: "relative", children: [_jsx(Clock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "number", value: inputs.manualDevelopmentHours, onChange: (e) => handleInputChange('manualDevelopmentHours', parseFloat(e.target.value || '0')), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", step: "0.5", min: "0.5" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Developer Rate ($/hour)" }), _jsxs("div", { className: "relative", children: [_jsx(DollarSign, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "number", value: inputs.developerHourlyRate, onChange: (e) => handleInputChange('developerHourlyRate', parseFloat(e.target.value || '0')), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", step: "5", min: "10" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Manual Tokens per Use" }), _jsx("input", { type: "number", value: inputs.manualTokensPerUse, onChange: (e) => handleInputChange('manualTokensPerUse', parseInt(e.target.value || '0')), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", min: "100", step: "100" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Analysis Period (months)" }), _jsx("input", { type: "number", value: inputs.analysisMonths, onChange: (e) => handleInputChange('analysisMonths', parseInt(e.target.value || '0')), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500", min: "1", max: "60" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "ROI Analysis" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "ROI" }), _jsxs("p", { className: `text-2xl font-bold ${getROIColor(roiResults.roi)}`, children: ["}", formatPercentage(roiResults.roi)] })] }), _jsx(TrendingUp, { className: `w-6 h-6 ${getROIColor(roiResults.roi)}` }), "}"] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Net Savings" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(roiResults.netSavings) })] }), _jsx(DollarSign, { className: "w-6 h-6 text-green-600" })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Payback Time" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: roiResults.timeToValue })] }), _jsx(Target, { className: "w-6 h-6 text-blue-600" })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Efficiency" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: formatPercentage(roiResults.efficiency) })] }), _jsx(Zap, { className: "w-6 h-6 text-purple-600" })] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Cost Breakdown" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Template Total Cost" }), _jsx("span", { className: "font-medium", children: formatCurrency(roiResults.templateTotalCost) })] }), _jsxs("div", { className: "flex justify-between items-center py-2 border-b border-gray-100", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Manual Total Cost" }), _jsx("span", { className: "font-medium", children: formatCurrency(roiResults.manualTotalCost) })] }), _jsxs("div", { className: "flex justify-between items-center py-2 bg-green-50 px-3 rounded", children: [_jsx("span", { className: "text-sm font-medium text-green-700", children: "Monthly Savings" }), _jsx("span", { className: "font-bold text-green-700", children: formatCurrency(roiResults.monthlySavings) })] })] })] }), _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Analysis Summary" }), _jsxs("div", { className: "text-sm text-blue-800 space-y-1", children: [_jsxs("p", { children: ["Using this template saves ", _jsx("strong", { children: formatCurrency(roiResults.netSavings) }), " over ", inputs.analysisMonths, " months"] }), _jsxs("p", { children: ["ROI of ", _jsx("strong", { children: formatPercentage(roiResults.roi) }), " with payback in ", _jsx("strong", { children: roiResults.timeToValue })] }), _jsxs("p", { children: [_jsx("strong", { children: formatPercentage(roiResults.efficiency) }), " improvement in token efficiency"] })] })] }), roiResults.roi > 100 && ()
                            < div, " className=\"bg-green-50 border border-green-200 rounded-lg p-4\">", _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-green-900", children: "Strong ROI Potential" }), _jsx("p", { className: "text-sm text-green-800 mt-1", children: "This template shows excellent return on investment. The financial benefits justify the purchase cost." })] })] })] }), ")}"] })] });
div >
;
div >
;
;
;
export default ROICalculator;
