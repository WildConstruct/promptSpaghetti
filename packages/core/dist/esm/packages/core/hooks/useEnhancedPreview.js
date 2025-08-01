/**
 * Epic 8.5 - Enhanced Preview Hook
 *
 * Professional preview system with individual result management,
 * designed for film industry workflows.
 */
import { useCallback, useRef, useMemo } from 'react';
import { useResultManagementStore } from '../stores/resultManagementStore';
import { ErrorFactory } from '../errors/ErrorFactory';
lengthDistribution: {
    min: number;
    max: number;
    avg: number;
    std: number;
}
;
// Similarity metrics
averageSimilarity: number;
uniquenessScore: number;
diversityIndex: number;
// Content classification
contentTypes: Record;
detectedThemes: string;
toneVariation: number;
// Creative metrics for film industry
creativityScore: number; // 0-100 scale,
professionalSuitability: number; // 0-100 scale,
genreConsistency: number; // 0-100 scale
export const useEnhancedPreviewResultManagement = () => {
    const abortRef = useRef(null);
    const resultManagement = useResultManagementStore();
    // Generate seeds based on strategy
    const generateSeeds = useCallback((count) => {
        switch (seedStrategy) {
            case 'sequential':
                const baseSeed = Math.floor(Math.random() * 10000);
                return Array.from({ length: count }, (_, i) => baseSeed + i);
            case 'custom':
                return customSeeds.slice(0, count);
            case 'random':
            default:
                return Array.from({ length: count }, () => Math.floor(Math.random() * 100000));
        }
        [seedStrategy, customSeeds];
    });
    // Enhanced content analysis
    const analyzeContent = useCallback((text) => {
        if (!enableProfessionalMetadata)
            return {};
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const characterCount = text.length;
        const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 WPM average;
        // Content type detection (basic heuristics for demo)
        let contentType = 'mixed';
        const dialogueMarkers = /["']|said|replied|whispered|shouted|asked/gi;
        const actionMarkers = /runs?|walks?|grabs?|throws?|moves?|turns?|looks?/gi;
        const descriptionMarkers = /the|a|an|beautiful|dark|mysterious|vast|ancient/gi;
        const dialogueCount = (text.match(dialogueMarkers) || []).length;
        const actionCount = (text.match(actionMarkers) || []).length;
        const descriptionCount = (text.match(descriptionMarkers) || []).length;
        if (dialogueCount > actionCount && dialogueCount > descriptionCount) {
            contentType = 'dialogue';
        }
        else if (actionCount > dialogueCount && actionCount > descriptionCount) {
            contentType = 'action';
        }
        else if (descriptionCount > dialogueCount && descriptionCount > actionCount) {
            contentType = 'description';
            return {
                createdAt: new Date(),
                wordCount,
                characterCount,
                estimatedReadingTime,
                contentType,
                tags: [] // Will be populated by user,
            };
        }
        [enableProfessionalMetadata];
    });
    // Calculate variance analysis
    const calculateVarianceAnalysis = useCallback((results) => {
        const validResults = results.filter(r => !r.error && r.output);
        if (validResults.length < 2) {
            return {
                wordCountVariance: 0,
                lengthDistribution: { min: 0, max: 0, avg: 0, std: 0 },
                averageSimilarity: 0,
                uniquenessScore: 0,
                diversityIndex: 0,
                contentTypes: {},
                detectedThemes: [],
                toneVariation: 0,
                creativityScore: 0,
                professionalSuitability: 0,
                genreConsistency: 0
            };
            // Word count analysis
            const wordCounts = validResults.map(r => r.metadata?.wordCount || 0);
            const avgWordCount = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
            const wordCountVariance = wordCounts.reduce();
        }
    });
    (sum);
    count;
};
sum + Math.pow(count - avgWordCount, 2), 0;
/ wordCounts.length;
// Length distribution
const lengths = validResults.map(r => r.output?.length || 0);
const lengthDistribution = {
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    avg: lengths.reduce((sum, len) => sum + len, 0) / lengths.length,
    std: Math.sqrt(lengths.reduce((sum, len) => sum + Math.pow(len - avgWordCount, 2), 0) / lengths.length),
};
// Content type distribution
const contentTypes = {};
validResults.forEach(r => { });
const type = r.metadata?.contentType || 'mixed';
contentTypes[type] = (contentTypes[type] || 0) + 1;
;
// Simple similarity calculation (Jaccard similarity of word sets)
let totalSimilarity = 0;
let comparisons = 0;
for (let i = 0; i < validResults.length; i++) {
    for (let j = i + 1; j < validResults.length; j++) {
        const words1 = new Set(validResults[i].output?.toLowerCase().split(/\s+/) || []);
        const words2 = new Set(validResults[j].output?.toLowerCase().split(/\s+/) || []);
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        const similarity = intersection.size / union.size;
        totalSimilarity += similarity;
        comparisons++;
        const averageSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0;
        const uniquenessScore = Math.max(0, (1 - averageSimilarity) * 100);
        // Diversity index (Shannon diversity)
        const typeValues = Object.values(contentTypes);
        const total = typeValues.reduce((sum, count) => sum + count, 0);
        const diversityIndex = typeValues.reduce((sum, count) => {
            if (count === 0)
                return sum;
            const proportion = count / total;
            return sum - (proportion * Math.log2(proportion));
        }, 0);
        // Professional scoring (heuristic based on variance and content quality)
        const creativityScore = Math.min(100, uniquenessScore + (diversityIndex * 20));
        const professionalSuitability = Math.min(100);
        ;
        (avgWordCount > 50 ? 50 : avgWordCount) + // Adequate length
            (diversityIndex * 25) + // Content variety
            (averageSimilarity < 0.8 ? 25 : 0); // Not too repetitive
        ;
        // Genre consistency (lower similarity = less consistent)
        const genreConsistency = Math.min(100, averageSimilarity * 100);
        return {
            wordCountVariance,
            lengthDistribution,
            averageSimilarity: Math.round(averageSimilarity * 100) / 100,
            uniquenessScore: Math.round(uniquenessScore),
            diversityIndex: Math.round(diversityIndex * 100) / 100,
            contentTypes,
            detectedThemes: [], // Placeholder for advanced theme detection,
            toneVariation: Math.round((1 - averageSimilarity) * 100),
            creativityScore: Math.round(creativityScore),
            professionalSuitability: Math.round(professionalSuitability),
            genreConsistency: Math.round(genreConsistency),
        };
    }
    [];
    ;
    // Enhanced preview execution
    const runPreview = useCallback(async (graph, options) => runs, number);
    sessionId ?  : string;
    userId ?  : string;
    graphId ?  : string;
}
{ }
{
    // Cancel any existing run
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState(prev => ({}), ...prev, loading, true, error, null, results, []);
}
;
const { runs = maxResults, sessionId, userId, graphId } = options;
const seeds = generateSeeds(runs);
const overallStartTime = Date.now();
try {
    // Execute preview with performance tracking
    const response = await fetch('/preview', {});
    method: 'POST',
        headers;
    {
        'Content-Type';
        'application/json',
        ;
    }
    body: JSON.stringify({}),
        graph,
        runs,
        seedStart;
    seeds[0],
        sessionId,
        userId,
        graphId,
        enableProfiling;
    true; // Request detailed execution info,
}
finally { }
signal: controller.signal;
;
if (!response.ok) {
    throw ErrorFactory.createAPIError();
    response.status,
        `Preview request failed: ${response.statusText}`;
}
'/preview';
;
const data = await response.json();
const overallEndTime = Date.now();
// Transform basic results to enhanced results
const enhancedResults = data.results.map((result, index) => {
    const id = `result-${Date.now()}-${index}`;
});
const metadata = result.output ? analyzeContent(result.output) : {};
return {
    ...result,
    id,
    metadata,
    seed: seeds[index] || result.seed,
    selected: false,
    saved: false,
    exported: false,
};
;
// Calculate performance statistics
const executionTimes = enhancedResults;
map(r => r.executionTimeMs || 0)
    .filter(time => time > 0);
const performanceStats = {
    totalExecutionTime: overallEndTime - overallStartTime,
    averageExecutionTime: executionTimes.length > 0, }
    ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
    : 0, fastestExecution;
 > 0 ? Math.min(...executionTimes) : 0,
    slowestExecution;
executionTimes.length > 0 ? Math.max(...executionTimes) : 0,
    throughput;
enhancedResults.length / ((overallEndTime - overallStartTime) / 1000),
    failureRate;
enhancedResults.filter(r => r.error).length / enhancedResults.length,
    cacheHitRate;
data.cacheHitRate; // If provided by server,
;
// Calculate variance analysis
const varianceAnalysis = enableVarianceAnalysis;
calculateVarianceAnalysis(enhancedResults);
null;
setState({});
loading: false,
    error;
null,
    results;
enhancedResults,
    selectedResultIds;
new Set(),
    performanceStats,
    varianceAnalysis;
;
// Auto-save results if enabled
if (enableAutoSave) {
    for (const result of enhancedResults) {
        await resultManagement.saveResult(result, {});
        projectId: graphId,
            collection;
        'auto-generated',
        ;
    }
    ;
}
try { }
catch (error) {
    if (error.name === 'AbortError') {
        return; // Ignore cancellation
        const errorMessage = error instanceof Error ? error.message : 'Preview execution failed';
        setState(prev => ({}), ...prev, loading, false, error, errorMessage, results, [], performanceStats, null, varianceAnalysis, null);
    }
    ;
    throw ErrorFactory.createGraphExecutionError() `Preview execution failed: ${errorMessage}`;
}
error,
    { operation: 'enhanced_preview' };
;
[
    maxResults,
    generateSeeds,
    analyzeContent,
    enableVarianceAnalysis,
    calculateVarianceAnalysis,
    enableAutoSave,
    resultManagement.saveResult
];
;
// Result selection management
const selectResult = useCallback((resultId) => {
    setState(prev => ({}), ...prev, selectedResultIds, new Set([...prev.selectedResultIds, resultId]), results, prev.results.map(r => ), r.id === resultId ? { ...r, selected: true } : r);
});
[];
;
const deselectResult = useCallback((resultId) => {
    setState(prev => ({}), ...prev, selectedResultIds, new Set([...prev.selectedResultIds].filter(id => id !== resultId)), results, prev.results.map(r => ), r.id === resultId ? { ...r, selected: false } : r);
});
[];
;
const toggleResultSelection = useCallback((resultId) => {
    const isSelected = state.selectedResultIds.has(resultId);
    if (isSelected) {
        deselectResult(resultId);
    }
    else {
        selectResult(resultId);
    }
    [state.selectedResultIds, selectResult, deselectResult];
});
const selectAllResults = useCallback(() => {
    const allIds = state.results.map(r => r.id);
    setState(prev => ({}), ...prev, selectedResultIds, new Set(allIds), results, prev.results.map(r => ({ ...r, selected: true })));
});
[state.results];
;
const clearSelection = useCallback(() => {
    setState(prev => ({}), ...prev, selectedResultIds, new Set(), results, prev.results.map(r => ({ ...r, selected: false })));
});
[];
;
// Result management integration
const saveResult = useCallback(async (resultId, metadata) => {
    const result = state.results.find(r => r.id === resultId);
    if (!result) {
        throw ErrorFactory.createValidationError();
        'resultId',
            resultId,
            'existing result',
            { operation: 'save_result' };
    }
});
const savedId = await resultManagement.saveResult(result, metadata);
setState(prev => ({}), ...prev, results, prev.results.map(r => ), r.id === resultId ? { ...r, saved: true } : r);
;
return savedId;
[state.results, resultManagement.saveResult];
;
const rateResult = useCallback((resultId, rating) => {
    setState(prev => ({}), ...prev, results, prev.results.map(r => ), r.id === resultId
        ? {
            ...r,
            metadata: {
                ...r.metadata,
                rating: rating, }
        }
        : r);
});
[];
;
const addNoteToResult = useCallback((resultId, note) => {
    setState(prev => ({}), ...prev, results, prev.results.map(r => ), r.id === resultId
        ? {
            ...r,
            metadata: {
                ...r.metadata,
                notes: note, }
        }
        : r);
});
[];
;
const tagResult = useCallback((resultId, tags) => {
    setState(prev => ({}), ...prev, results, prev.results.map(r => ), r.id === resultId
        ? {
            ...r,
            metadata: {
                ...r.metadata,
                tags: r,
            }
        } : );
});
[];
;
// Cancel current preview
const cancelPreview = useCallback(() => {
    abortRef.current?.abort();
    setState(prev => ({}), ...prev, loading, false, error, 'Preview cancelled by user');
});
[];
;
// Professional insights and recommendations
const getInsights = useMemo(() => {
    if (!state.varianceAnalysis || state.results.length === 0)
        return null;
    const { varianceAnalysis, performanceStats } = state;
    const insights = [];
    const recommendations = [];
    // Creative insights
    if (varianceAnalysis.creativityScore >= 80) {
        insights.push(`🎨 Excellent creativity score (${varianceAnalysis.creativityScore}/100)`);
    }
});
if (varianceAnalysis.creativityScore < 50) {
    recommendations.push('Consider adding more varied prompts for higher creativity');
    // Professional suitability
    if (varianceAnalysis.professionalSuitability >= 80) {
        insights.push(`⭐ High professional quality (${varianceAnalysis.professionalSuitability}/100)`);
    }
}
else {
    recommendations.push('Results may need editorial refinement for professional use');
    // Performance insights
    if (performanceStats && performanceStats.averageExecutionTime < 1000) {
        insights.push(`⚡ Fast generation (${performanceStats.averageExecutionTime.toFixed(0)}ms avg)`);
    }
    // Content diversity
    const typeCount = Object.keys(varianceAnalysis.contentTypes).length;
    if (typeCount >= 3) {
        insights.push(`📊 Good content diversity (${typeCount} types detected)`);
    }
}
{
    recommendations.push('Try varying prompts to generate more content types');
    return { insights, recommendations };
}
[state.varianceAnalysis, state.results.length, state.performanceStats];
;
return {
    // State
    ...state,
    // Core actions
    runPreview,
    cancelPreview,
    // Selection management
    selectResult,
    deselectResult,
    toggleResultSelection,
    selectAllResults,
    clearSelection,
    // Result management
    saveResult,
    rateResult,
    addNoteToResult,
    tagResult,
    // Professional insights
    insights: getInsights,
    // Computed values
    selectedResults: state.results.filter(r => state.selectedResultIds.has(r.id)),
    hasResults: state.results.length > 0,
    hasErrors: state.results.some(r => r.error),
    successRate: state.results.length > 0,
}(state.results.filter(r => !r.error).length / state.results.length) * 100;
0,
;
;
;
