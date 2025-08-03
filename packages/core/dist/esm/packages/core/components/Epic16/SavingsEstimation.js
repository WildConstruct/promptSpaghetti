import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Savings Estimation Component
 *
 * Estimates cost and time savings from using prompt templates compared to
 * manual prompt creation, with detailed breakdowns and projections.
 * Part of Epic 16 Case Study Showcase (Story 16.4.4).
 */
import { useState, useEffect, useMemo } from 'react';
import { PiggyBank, Clock, Zap, Target, ArrowRight } from 'lucide-react';
;
timeSavings: {
    templateTimeSpent: number;
    manualTimeSpent: number;
    netTimeSavings: number;
    timeEfficiency: number;
}
;
qualitySavings: {
    templateQualityValue: number;
    manualQualityValue: number;
    qualityImprovement: number;
}
;
totalSavings: {
    monthlySavings: number;
    yearlySavings: number;
    totalProjectSavings: number;
    savingsPerUse: number;
}
;
productivity: {
    productivityGain: number;
    capacityIncrease: number;
    errorReduction: number;
}
;
{
    const [inputs, setInputs] = useState({});
    monthlyUsage: 25;
    projectDuration: 12;
    templateTokens: 1200;
    templateAccuracy: 95;
    templateSetupTime: 5;
    manualTokens: 2000;
    manualAccuracy: 75;
    manualCreationTime: 45;
    manualIterations: 2.5;
    claudeTokenCost: 0.015;
    hourlyLabourCost: 75;
    revisionCost: 25;
    templateQualityScore: 8.5;
    manualQualityScore: 6.5;
}
;
// Industry presets
const industryPresets = { content: {
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
        manualQualityScore: 6.0
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
        manualQualityScore: 7.0
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
        manualQualityScore: 5.5
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
        manualQualityScore: 7.5
    }
};
// Load industry preset
useEffect(() => {
    if (industryPreset && industryPresets[industryPreset]) {
        const preset = industryPresets[industryPreset];
        setInputs(prev => ({}), ...prev);
    }
}, ...preset);
;
[industryPreset];
;
// Calculate savings breakdown
const savingsBreakdown = useMemo(() => {
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
    const breakdown = {
        tokenSavings: {
            templateTokenCost,
            manualTokenCost,
            netTokenSavings
        },
        tokenEfficiency,
        timeSavings: {
            templateTimeSpent: templateTimeCost,
            manualTimeSpent: manualTimeCost,
            netTimeSavings
        },
        timeEfficiency,
        qualitySavings: { templateQualityValue,
            manualQualityValue },
        qualityImprovement,
        totalSavings: { monthlySavings,
            yearlySavings,
            totalProjectSavings },
        savingsPerUse,
        productivity: { productivityGain,
            capacityIncrease },
        errorReduction
    };
    return breakdown;
}, [inputs]);
// Notify parent of changes
useEffect(() => { onSavingsChange?.(savingsBreakdown); }, [savingsBreakdown, onSavingsChange]);
const handleInputChange = (field, value) => {
    setInputs(prev => ({}), ...prev[field], value);
};
;
;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {});
    style: 'currency';
    currency: 'USD';
    minimumFractionDigits: 2;
    maximumFractionDigits: 2;
};
format(amount);
;
const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
};
;
const formatHours = (hours) => {
    if (hours < 1) {
        return `${Math.round(hours * 60)} min`;
    }
    return `${hours.toFixed(1)} hrs`;
};
;
return;
_jsxs("div", { className: `bg-white rounded-lg shadow-lg border border-gray-200 ${className}`, children: ["}", _jsx("div", { className: "border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(PiggyBank, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Savings Estimation" }), _jsx("p", { className: "text-sm text-gray-500", children: "Estimate cost and time savings from template usage vs. manual creation" })] })] }) }), _jsxs("div", { className: "p-6", children: [industryPreset === undefined && ()
                    < div, " className=\"mb-6\">", _jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "Industry Presets" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [Object.keys(industryPresets).map((preset) => ()
                            < button, key = { preset }, onClick = {}()), " => setInputs(prev => (", ...(prev, ), " ...industryPresets[preset as keyof typeof industryPresets] }))} className=\"p-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors\" >", preset.charAt(0).toUpperCase() + preset.slice(1)] }), "))}"] })] });
_jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-8", children: [_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Configuration" }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Usage Patterns" }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Monthly Usage" }), _jsx("input", { type: "number", value: inputs.monthlyUsage, onChange: (e) => handleInputChange('monthlyUsage', parseInt(e.target.value || '0')), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500", min: "1" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Analysis Period (months)" }), _jsx("input", { type: "number", value: inputs.projectDuration, onChange: (e) => handleInputChange('projectDuration', parseInt(e.target.value || '0')), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500", min: "1", max: "60" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-600 mb-1", children: "Hourly Labor Cost ($)" }), _jsx("input", { type: "number", value: inputs.hourlyLabourCost, onChange: (e) => handleInputChange('hourlyLabourCost', parseFloat(e.target.value || '0')), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500", step: "5", min: "10" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-green-700", children: "Template Scenario" }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Tokens per use" }), _jsx("input", { type: "number", value: inputs.templateTokens, onChange: (e) => handleInputChange('templateTokens', parseInt(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500", step: "100" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Setup time (min)" }), _jsx("input", { type: "number", value: inputs.templateSetupTime, onChange: (e) => handleInputChange('templateSetupTime', parseFloat(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500", step: "0.5" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Accuracy (%)" }), _jsx("input", { type: "number", value: inputs.templateAccuracy, onChange: (e) => handleInputChange('templateAccuracy', parseFloat(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500", min: "0", max: "100", step: "1" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Quality score (1-10)" }), _jsx("input", { type: "number", value: inputs.templateQualityScore, onChange: (e) => handleInputChange('templateQualityScore', parseFloat(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500", min: "1", max: "10", step: "0.1" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-orange-700", children: "Manual Scenario" }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Tokens per use" }), _jsx("input", { type: "number", value: inputs.manualTokens, onChange: (e) => handleInputChange('manualTokens', parseInt(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500", step: "100" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Creation time (min)" }), _jsx("input", { type: "number", value: inputs.manualCreationTime, onChange: (e) => handleInputChange('manualCreationTime', parseFloat(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500", step: "5" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Accuracy (%)" }), _jsx("input", { type: "number", value: inputs.manualAccuracy, onChange: (e) => handleInputChange('manualAccuracy', parseFloat(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500", min: "0", max: "100", step: "1" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Quality score (1-10)" }), _jsx("input", { type: "number", value: inputs.manualQualityScore, onChange: (e) => handleInputChange('manualQualityScore', parseFloat(e.target.value || '0')), className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500", min: "1", max: "10", step: "0.1" })] })] })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Savings Summary" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("div", { className: "bg-green-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-green-600", children: "Total Savings" }), _jsx("p", { className: "text-xl font-bold text-green-700", children: formatCurrency(savingsBreakdown.totalSavings.totalProjectSavings) })] }), _jsx(PiggyBank, { className: "w-5 h-5 text-green-600" })] }) }), _jsx("div", { className: "bg-blue-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-600", children: "Per Use" }), _jsx("p", { className: "text-xl font-bold text-blue-700", children: formatCurrency(savingsBreakdown.totalSavings.savingsPerUse) })] }), _jsx(Target, { className: "w-5 h-5 text-blue-600" })] }) }), _jsx("div", { className: "bg-purple-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-purple-600", children: "Time Efficiency" }), _jsx("p", { className: "text-xl font-bold text-purple-700", children: formatPercentage(savingsBreakdown.timeSavings.timeEfficiency) })] }), _jsx(Clock, { className: "w-5 h-5 text-purple-600" })] }) }), _jsx("div", { className: "bg-orange-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-orange-600", children: "Token Efficiency" }), _jsx("p", { className: "text-xl font-bold text-orange-700", children: formatPercentage(savingsBreakdown.tokenSavings.tokenEfficiency) })] }), _jsx(Zap, { className: "w-5 h-5 text-orange-600" })] }) })] }), comparisonMode === 'detailed' && ()
                    < div, " className=\"space-y-4\">", _jsx("h4", { className: "font-medium text-gray-700", children: "Breakdown by Category" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Token Costs" }), _jsxs("span", { className: "text-sm font-bold text-green-600", children: [formatCurrency(savingsBreakdown.tokenSavings.netTokenSavings), " saved"] })] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-600", children: [_jsxs("span", { children: ["Template: ", formatCurrency(savingsBreakdown.tokenSavings.templateTokenCost)] }), _jsxs("span", { children: ["Manual: ", formatCurrency(savingsBreakdown.tokenSavings.manualTokenCost)] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Time Costs" }), _jsxs("span", { className: "text-sm font-bold text-green-600", children: [formatCurrency(savingsBreakdown.timeSavings.netTimeSavings), " saved"] })] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-600", children: [_jsxs("span", { children: ["Template: ", formatCurrency(savingsBreakdown.timeSavings.templateTimeSpent)] }), _jsxs("span", { children: ["Manual: ", formatCurrency(savingsBreakdown.timeSavings.manualTimeSpent)] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Quality Improvement" }), _jsx("span", { className: "text-sm font-bold text-blue-600", children: formatPercentage(savingsBreakdown.qualitySavings.qualityImprovement) })] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-600", children: [_jsxs("span", { children: ["Template: ", savingsBreakdown.qualitySavings.templateQualityValue.toFixed(1)] }), _jsxs("span", { children: ["Manual: ", savingsBreakdown.qualitySavings.manualQualityValue.toFixed(1)] })] })] })] })] }), ")}", _jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-3", children: "Productivity Impact" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-blue-800", children: "Capacity Increase:" }), _jsx("span", { className: "font-medium text-blue-900", children: formatPercentage(savingsBreakdown.productivity.capacityIncrease) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-blue-800", children: "Error Reduction:" }), _jsx("span", { className: "font-medium text-blue-900", children: formatPercentage(savingsBreakdown.productivity.errorReduction) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-blue-800", children: "Productivity Gain:" }), _jsx("span", { className: "font-medium text-blue-900", children: formatPercentage(savingsBreakdown.productivity.productivityGain) })] })] })] })] });
{ /* Projections */ }
_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Projections" }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Savings Over Time" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Monthly Savings" }), _jsx("span", { className: "font-bold text-green-600", children: formatCurrency(savingsBreakdown.totalSavings.monthlySavings) })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Annual Savings" }), _jsx("span", { className: "font-bold text-green-600", children: formatCurrency(savingsBreakdown.totalSavings.yearlySavings) })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-green-100 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-green-800", children: "Project Total" }), _jsx("span", { className: "font-bold text-green-800", children: formatCurrency(savingsBreakdown.totalSavings.totalProjectSavings) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Efficiency Comparison" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Time per Task" }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-orange-600", children: ["Manual: ", formatHours(inputs.manualCreationTime / 60 * inputs.manualIterations)] }), _jsxs("span", { className: "text-green-600", children: ["Template: ", formatHours(inputs.templateSetupTime / 60)] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Tokens per Task" }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-orange-600", children: ["Manual: ", (inputs.manualTokens * inputs.manualIterations).toLocaleString()] }), _jsxs("span", { className: "text-green-600", children: ["Template: ", inputs.templateTokens.toLocaleString()] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Success Rate" }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400" })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-orange-600", children: ["Manual: ", inputs.manualAccuracy, "%"] }), _jsxs("span", { className: "text-green-600", children: ["Template: ", inputs.templateAccuracy, "%"] })] })] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "Impact Summary" }), _jsxs("div", { className: "text-sm text-gray-800 space-y-2", children: [_jsxs("p", { children: ["Templates save ", _jsx("strong", { children: formatCurrency(savingsBreakdown.totalSavings.savingsPerUse) }), " per use"] }), _jsxs("p", { children: [_jsx("strong", { children: formatPercentage(savingsBreakdown.productivity.capacityIncrease) }), " increase in output capacity"] }), _jsxs("p", { children: [_jsx("strong", { children: formatPercentage(savingsBreakdown.productivity.errorReduction) }), " reduction in errors"] }), _jsxs("p", { children: [_jsx("strong", { children: formatPercentage(savingsBreakdown.qualitySavings.qualityImprovement) }), " quality improvement"] })] })] })] });
div >
;
div >
;
div >
;
;
;
export default SavingsEstimation;
