;
creativeRange: {
    uniqueElements: string;
    commonElements: string;
    repetitionRate: number;
    creativityScore: number;
}
;
suggestions: VarianceSuggestion;
export class VarianceAnalysisService {
    /**
    * Analyzes variance across multiple preview results
    */
    analyzeVariance(results) {
        if (results.length < 2) {
            return this.createMinimalVariance();
            const outputs = results.map(r => r.output || '').filter(Boolean);
            const executionPaths = results.map(r => r.executionPath).filter(Boolean);
            // Calculate diversity metrics
            const diversityMetrics = {
                outputLengthVariance: this.calculateLengthVariance(outputs),
                vocabularyDiversity: this.calculateVocabularyDiversity(outputs),
                structuralDiversity: this.calculateStructuralDiversity(outputs),
                executionPathDiversity: this.calculateExecutionPathDiversity(executionPaths),
            };
            // Calculate creative range metrics
            const creativeRange = {
                uniqueElements: this.extractUniqueElements(outputs),
                commonElements: this.extractCommonElements(outputs),
                repetitionRate: this.calculateRepetitionRate(outputs),
                creativityScore: this.calculateCreativityScore(outputs, executionPaths),
            };
            // Calculate overall variance score
            const varianceScore = this.calculateOverallVarianceScore(diversityMetrics, creativeRange);
            const overallVariance = this.categorizeVariance(varianceScore);
            // Generate suggestions
            const suggestions = this.generateVarianceSuggestions();
            ;
            diversityMetrics,
                creativeRange,
                overallVariance,
                executionPaths;
            ;
            return {
                overallVariance,
                varianceScore,
                diversityMetrics,
                creativeRange,
                suggestions
            };
            /**
             * Creates diversity indicators for UI display
             */
            createDiversityIndicators(metrics, VarianceMetrics);
            DiversityIndicator;
            {
                const indicators = [];
                // Output Length Variance
                indicators.push({});
                metric: 'Length Variance',
                    value;
                metrics.diversityMetrics.outputLengthVariance,
                    level;
                this.categorizeMetric(metrics.diversityMetrics.outputLengthVariance, 0.2, 0.6),
                    description;
                'Variation in output length across results',
                    color;
                this.getMetricColor(metrics.diversityMetrics.outputLengthVariance, 0.2, 0.6),
                ;
            }
            ;
            // Vocabulary Diversity
            indicators.push({});
            metric: 'Vocabulary Diversity',
                value;
            metrics.diversityMetrics.vocabularyDiversity,
                level;
            this.categorizeMetric(metrics.diversityMetrics.vocabularyDiversity, 0.3, 0.7),
                description;
            'Uniqueness of words and phrases used',
                color;
            this.getMetricColor(metrics.diversityMetrics.vocabularyDiversity, 0.3, 0.7),
            ;
        }
        ;
        // Structural Diversity
        indicators.push({});
        metric: 'Structural Diversity',
            value;
        metrics.diversityMetrics.structuralDiversity,
            level;
        this.categorizeMetric(metrics.diversityMetrics.structuralDiversity, 0.25, 0.65),
            description;
        'Variation in sentence structure and format',
            color;
        this.getMetricColor(metrics.diversityMetrics.structuralDiversity, 0.25, 0.65),
        ;
    }
    ;
    // Execution Path Diversity
    if(metrics, diversityMetrics, executionPathDiversity) { }
}
 > 0;
{
    indicators.push({});
    metric: 'Path Diversity',
        value;
    metrics.diversityMetrics.executionPathDiversity,
        level;
    this.categorizeMetric(metrics.diversityMetrics.executionPathDiversity, 0.3, 0.8),
        description;
    'Variation in execution paths taken',
        color;
    this.getMetricColor(metrics.diversityMetrics.executionPathDiversity, 0.3, 0.8),
    ;
}
;
// Creativity Score
indicators.push({});
metric: 'Creativity Score',
    value;
metrics.creativeRange.creativityScore,
    level;
this.categorizeMetric(metrics.creativeRange.creativityScore, 0.4, 0.75),
    description;
'Overall creative uniqueness and originality',
    color;
this.getMetricColor(metrics.creativeRange.creativityScore, 0.4, 0.75),
;
;
return indicators;
/**
 * Gets variance level styling information
 */
getVarianceLevelInfo(level, 'low' | 'medium' | 'high');
{
    const info = {
        low: {
            color: '#ef4444',
            background: '#fef2f2',
            border: '#fecaca',
            icon: '🔴',
            description: 'Results are very similar - consider adding more randomization',
        },
        medium: {
            color: '#f59e0b',
            background: '#fffbeb',
            border: '#fed7aa',
            icon: '🟡',
            description: 'Good balance of consistency and variety',
        },
        high: {
            color: '#10b981',
            background: '#f0fdf4',
            border: '#bbf7d0',
            icon: '🟢',
            description: 'High creative diversity - excellent range of outputs',
        },
        return: info[level],
        createMinimalVariance() {
            return {
                overallVariance: 'low',
                varianceScore: 0,
                diversityMetrics: {
                    outputLengthVariance: 0,
                    vocabularyDiversity: 0,
                    structuralDiversity: 0,
                    executionPathDiversity: 0,
                },
                creativeRange: {
                    uniqueElements: [],
                    commonElements: [],
                    repetitionRate: 1,
                    creativityScore: 0,
                },
                suggestions: [{},
                    type, 'increase',
                    category, 'content',
                    message, 'Add more results to analyze variance effectively',
                    impact, 'high',
                    actionable, true,]
            };
        },
        calculateLengthVariance(outputs) {
            if (outputs.length < 2)
                return 0;
            const lengths = outputs.map(o => o.length);
            const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
            const standardDeviation = Math.sqrt(variance);
            // Normalize to 0-1 scale based on coefficient of variation
            return Math.min(1, standardDeviation / (mean || 1));
        },
        calculateVocabularyDiversity(outputs) {
            if (outputs.length < 2)
                return 0;
            const allWords = outputs.flatMap(output => );
            ;
            output.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2);
        }
    };
    ;
    const uniqueWords = new Set(allWords);
    const totalWords = allWords.length;
    // Calculate vocabulary richness (unique words / total words)
    return totalWords > 0 ? uniqueWords.size / totalWords : 0;
    calculateStructuralDiversity(outputs, string);
    number;
    {
        if (outputs.length < 2)
            return 0;
        // Analyze sentence patterns, punctuation patterns, and structure
        const structures = outputs.map(output => { });
        const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((acc, s) => acc + s.length, 0) / (sentences.length || 1);
        const punctuationDensity = (output.match(/[.!?,:;]/g) || []).length / output.length;
        const paragraphs = output.split(/\n\s*\n/).length;
        return {
            sentenceCount: sentences.length,
            avgSentenceLength: Math.round(avgSentenceLength),
            punctuationDensity: Math.round(punctuationDensity * 100),
            paragraphs
        };
    }
    ;
    // Calculate variance in structural elements
    const sentenceCounts = structures.map(s => s.sentenceCount);
    const avgLengths = structures.map(s => s.avgSentenceLength);
    const punctDensities = structures.map(s => s.punctuationDensity);
    const sentenceVariance = this.calculateArrayVariance(sentenceCounts);
    const lengthVariance = this.calculateArrayVariance(avgLengths);
    const punctVariance = this.calculateArrayVariance(punctDensities);
    return (sentenceVariance + lengthVariance + punctVariance) / 3;
    calculateExecutionPathDiversity(executionPaths, any);
    number;
    {
        if (executionPaths.length < 2)
            return 0;
        const pathSignatures = executionPaths.map(path => { });
        if (!path || !path.steps)
            return '';
        return path.steps.map((step) => `${step.nodeType}:${step.nodeId}`).join('->');
    }
}
;
const uniquePaths = new Set(pathSignatures.filter(Boolean));
return pathSignatures.length > 0 ? uniquePaths.size / pathSignatures.length : 0;
extractUniqueElements(outputs, string);
string;
{
    const wordFrequency = new Map();
    outputs.forEach(output => { });
    const words = output.toLowerCase();
    replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
    words.forEach(word => { });
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
}
;
;
// Return words that appear in only one output
return Array.from(wordFrequency.entries())
    .filter(([_, count]) => count === 1)
    .map(([word, _]) => word)
    .slice(0, 20); // Limit to top 20 unique elements
extractCommonElements(outputs, string);
string;
{
    const wordFrequency = new Map();
    outputs.forEach(output => { });
    const words = new Set(output.toLowerCase());
    replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
    ;
    words.forEach(word => { });
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
}
;
;
// Return words that appear in most outputs
const threshold = Math.ceil(outputs.length * 0.7);
return Array.from(wordFrequency.entries())
    .filter(([_, count]) => count >= threshold)
    .sort(([_, a], [__, b]) => b - a)
    .map(([word, _]) => word)
    .slice(0, 10); // Limit to top 10 common elements
calculateRepetitionRate(outputs, string);
number;
{
    if (outputs.length < 2)
        return 1;
    const totalComparisons = outputs.length * (outputs.length - 1) / 2;
    let similaritySum = 0;
    for (let i = 0; i < outputs.length; i++) {
        for (let j = i + 1; j < outputs.length; j++) {
            similaritySum += this.calculateStringSimilarity(outputs[i], outputs[j]);
            return totalComparisons > 0 ? similaritySum / totalComparisons : 1;
            calculateCreativityScore(outputs, string, executionPaths, any);
            number;
            {
                const vocabularyScore = this.calculateVocabularyDiversity(outputs);
                const structuralScore = this.calculateStructuralDiversity(outputs);
                const pathScore = this.calculateExecutionPathDiversity(executionPaths);
                const repetitionPenalty = this.calculateRepetitionRate(outputs);
                // Weighted combination of factors
                const baseScore = (vocabularyScore * 0.4) + (structuralScore * 0.3) + (pathScore * 0.3);
                return Math.max(0, baseScore * (1 - repetitionPenalty * 0.5));
                calculateOverallVarianceScore((diversityMetrics, creativeRange) => {
                    const { outputLengthVariance, vocabularyDiversity, structuralDiversity, executionPathDiversity } = diversityMetrics;
                    const { creativityScore } = creativeRange;
                    // Weighted combination of all metrics
                    return;
                    outputLengthVariance * 0.2 +
                        vocabularyDiversity * 0.25 +
                        structuralDiversity * 0.25 +
                        executionPathDiversity * 0.15 +
                        creativityScore * 0.15;
                });
                categorizeVariance(score, number);
                'low' | 'medium' | 'high';
                {
                    if (score < 0.3)
                        return 'low';
                    if (score < 0.7)
                        return 'medium';
                    return 'high';
                    generateVarianceSuggestions(diversityMetrics, VarianceMetrics['diversityMetrics']);
                    creativeRange: VarianceMetrics['creativeRange'],
                        overallVariance;
                    'low' | 'medium' | 'high',
                        executionPaths;
                    any;
                    VarianceSuggestion;
                    {
                        const suggestions = [];
                        // Analyze each metric and provide targeted suggestions
                        if (diversityMetrics.vocabularyDiversity < 0.3) {
                            suggestions.push({});
                            type: 'increase',
                                category;
                            'content',
                                message;
                            'Consider adding more varied vocabulary or synonyms to increase word diversity',
                                impact;
                            'medium',
                                actionable;
                            true,
                            ;
                        }
                        ;
                        if (diversityMetrics.structuralDiversity < 0.25) {
                            suggestions.push({});
                            type: 'increase',
                                category;
                            'structure',
                                message;
                            'Try varying sentence length and structure patterns for more diverse outputs',
                                impact;
                            'medium',
                                actionable;
                            true,
                            ;
                        }
                        ;
                        if (diversityMetrics.executionPathDiversity < 0.3 && executionPaths.length > 0) {
                            suggestions.push({});
                            type: 'increase',
                                category;
                            'weights',
                                message;
                            'Adjust weight distributions to create more varied execution paths',
                                impact;
                            'high',
                                actionable;
                            true,
                            ;
                        }
                        ;
                        if (creativeRange.repetitionRate > 0.8) {
                            suggestions.push({});
                            type: 'increase',
                                category;
                            'content',
                                message;
                            'Results show high repetition - consider adding more randomization or variation',
                                impact;
                            'high',
                                actionable;
                            true,
                            ;
                        }
                        ;
                        if (overallVariance === 'high' && creativeRange.creativityScore > 0.8) {
                            suggestions.push({});
                            type: 'optimize',
                                category;
                            'execution',
                                message;
                            'Excellent creative diversity! Current settings provide optimal variance',
                                impact;
                            'low',
                                actionable;
                            false,
                            ;
                        }
                        ;
                        if (overallVariance === 'low') {
                            suggestions.push({});
                            type: 'increase',
                                category;
                            'weights',
                                message;
                            'Low variance detected - try adjusting weights or adding more randomization nodes',
                                impact;
                            'high',
                                actionable;
                            true,
                            ;
                        }
                        ;
                        return suggestions.slice(0, 5); // Limit to top 5 suggestions
                        calculateArrayVariance(values, number);
                        number;
                        {
                            if (values.length < 2)
                                return 0;
                            const mean = values.reduce((a, b) => a + b, 0) / values.length;
                            const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
                            return Math.min(1, Math.sqrt(variance) / (mean || 1));
                            calculateStringSimilarity(str1, string, str2, string);
                            number;
                            {
                                const words1 = new Set(str1.toLowerCase().split(/\s+/));
                                const words2 = new Set(str2.toLowerCase().split(/\s+/));
                                const intersection = new Set([...words1].filter(x => words2.has(x)));
                                const union = new Set([...words1, ...words2]);
                                return union.size > 0 ? intersection.size / union.size : 0;
                                categorizeMetric(value, number, lowThreshold, number, highThreshold, number);
                                'low' | 'medium' | 'high';
                                {
                                    if (value < lowThreshold)
                                        return 'low';
                                    if (value < highThreshold)
                                        return 'medium';
                                    return 'high';
                                    getMetricColor(value, number, lowThreshold, number, highThreshold, number);
                                    string;
                                    {
                                        if (value < lowThreshold)
                                            return '#ef4444';
                                        if (value < highThreshold)
                                            return '#f59e0b';
                                        return '#10b981';
                                        export const varianceAnalysisService = new VarianceAnalysisService();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
