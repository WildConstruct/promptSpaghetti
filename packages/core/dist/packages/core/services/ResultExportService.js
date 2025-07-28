import { exportResults } from '../../../server/src/exporter';
export class ResultExportService {
    resultIndex;
    totalResults;
    options;
    sourceGraph;
    Promise() {
        const exportData = {
            result,
            index: resultIndex,
            totalResults,
            exportedAt: new Date().toISOString(),
            sourceGraph
        };
        const filename = options.filename || this.generateFilename(options.format, 'individual', result.seed);
        return await this.performExport(exportData, options, filename, 'individual');
        /**
         * Export multiple selected results as a batch
         */
        async;
        exportBatchResults(results, PreviewResultWithPath);
        selectedIndices: number,
            options;
        ResultExportOptions,
            sourceGraph ?  : any;
        Promise < ExportResult > {
            const: selectedResults = selectedIndices.map(index => results[index]).filter(Boolean),
            const: aggregateStats = this.calculateAggregateStats(selectedResults),
            const: exportData, BatchExportData = {
                results: selectedResults,
                selectedIndices,
                aggregateStats,
                exportedAt: new Date().toISOString(),
                sourceGraph
            },
            const: filename = options.filename || this.generateFilename(),
            options, : .format,
            'batch': ,
            selectedResults, : .map(r => r.seed),
            return: await this.performExport(exportData, options, filename, 'batch'),
            options: ResultExportOptions,
            sourceGraph: any,
            Promise() {
                const comparisonData = {
                    results,
                    comparison: this.generateComparisonAnalysis(results),
                    aggregateStats: this.calculateAggregateStats(results),
                    exportedAt: new Date().toISOString(),
                    sourceGraph
                };
                const filename = options.filename || this.generateFilename(options.format, 'comparison', results.map(r => r.seed));
                return await this.performExport(comparisonData, options, filename, 'comparison');
                /**
                 * Get available export formats with descriptions
                 */
                getAvailableFormats();
                Array < {
                    format: ExportFormat,
                    name: string,
                    description: string,
                    category: 'text' | 'data' | 'film' | 'vfx' | 'analysis',
                    supportsIndividual: boolean,
                    supportsBatch: boolean
                } > {
                    return: [
                        {
                            format: 'plain-text',
                            name: 'Plain Text',
                            description: 'Simple text output with basic metadata',
                            category: 'text',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'json-simple',
                            name: 'JSON (Simple)',
                            description: 'Basic JSON with output and seed information',
                            category: 'data',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'json-complete',
                            name: 'JSON (Complete)',
                            description: 'Full JSON with execution paths, metadata, and debug info',
                            category: 'data',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'csv-analysis',
                            name: 'CSV Analysis',
                            description: 'Tabular data with performance and variance metrics',
                            category: 'analysis',
                            supportsIndividual: false,
                            supportsBatch: true,
                        },
                        {
                            format: 'fountain-script',
                            name: 'Fountain Script',
                            description: 'Industry-standard screenplay format',
                            category: 'film',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'final-draft',
                            name: 'Final Draft',
                            description: 'Final Draft XML format for professional screenwriting',
                            category: 'film',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'controlnet-json',
                            name: 'ControlNet JSON',
                            description: 'VFX-ready format for Stable Diffusion ControlNet',
                            category: 'vfx',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'mars-framework',
                            name: 'MARS Framework',
                            description: 'VFX professional format with structured tags',
                            category: 'vfx',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'zada-natural',
                            name: 'Zada Natural Language',
                            description: 'Director-friendly natural language format',
                            category: 'film',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'professional-report',
                            name: 'Professional Report',
                            description: 'Comprehensive analysis with recommendations',
                            category: 'analysis',
                            supportsIndividual: false,
                            supportsBatch: true,
                        },
                        {
                            format: 'execution-timeline',
                            name: 'Execution Timeline',
                            description: 'Step-by-step execution visualization',
                            category: 'analysis',
                            supportsIndividual: true,
                            supportsBatch: true,
                        },
                        {
                            format: 'variance-report',
                            name: 'Variance Report',
                            description: 'Detailed creative variance analysis',
                            category: 'analysis',
                            supportsIndividual: false,
                            supportsBatch: true
                        }
                    ],
                    /**
                     * Validate export options for the given format
                     */
                    validateExportOptions(format, options) {
                        const errors = [];
                        const formatInfo = this.getAvailableFormats().find(f => f.format === format);
                        if (!formatInfo) {
                            errors.push(`Unknown export format: ${format}`);
                        }
                        return errors;
                        // Film format validations
                        if (['fountain-script', 'final-draft'].includes(format)) {
                            if (!options.filmOptions?.includeDirectorNotes && !options.includeMetadata) {
                                errors.push('Film formats should include either director notes or metadata');
                                // VFX format validations
                                if (['controlnet-json', 'mars-framework'].includes(format)) {
                                    if (!options.includeExecutionPaths && !options.vfxOptions?.controlNetCompatible) {
                                        errors.push('VFX formats require execution paths or ControlNet compatibility');
                                        // Analysis format validations
                                        if (['csv-analysis', 'professional-report', 'variance-report'].includes(format)) {
                                            if (!options.analysisOptions?.performanceBreakdown && !options.analysisOptions?.varianceAnalysis) {
                                                errors.push('Analysis formats require performance or variance analysis options');
                                                return errors;
                                                /**
                                                * Estimate export size for UI feedback
                                                */
                                                estimateExportSize(results, PreviewResultWithPath, format, ExportFormat, options, ResultExportOptions);
                                                {
                                                    estimatedSize: number;
                                                    unit: 'KB' | 'MB';
                                                    warning ?  : string;
                                                    const baseSize = results.reduce((total, result) => {
                                                        return total + (result.output?.length || 0) + 200; // Base overhead
                                                    }, 0);
                                                    let multiplier = 1;
                                                    switch (format) {
                                                        case 'plain-text':
                                                            multiplier = 1.1;
                                                            break;
                                                        case 'json-simple':
                                                            multiplier = 1.5;
                                                            break;
                                                        case 'json-complete':
                                                            multiplier = 3.0;
                                                            if (options.includeExecutionPaths)
                                                                multiplier += 2.0;
                                                            if (options.includeDebugInfo)
                                                                multiplier += 1.5;
                                                            break;
                                                        case 'csv-analysis':
                                                            multiplier = 1.2;
                                                            break;
                                                        case 'fountain-script':
                                                        case 'final-draft':
                                                            multiplier = 2.0;
                                                            break;
                                                        case 'controlnet-json':
                                                        case 'mars-framework':
                                                            multiplier = 4.0;
                                                            break;
                                                        case 'professional-report':
                                                            multiplier = 5.0;
                                                            break;
                                                        default:
                                                            multiplier = 2.0;
                                                            const estimatedBytes = baseSize * multiplier;
                                                            const estimatedKB = Math.ceil(estimatedBytes / 1024);
                                                            if (estimatedKB > 1024) {
                                                                return {
                                                                    estimatedSize: Math.ceil(estimatedKB / 1024),
                                                                    unit: 'MB',
                                                                    warning: estimatedKB > 10240 ? 'Large export size - may take time to generate' : undefined,
                                                                };
                                                                return {
                                                                    estimatedSize: estimatedKB,
                                                                    unit: 'KB',
                                                                    warning: estimatedKB > 5120 ? 'Large export size - consider reducing options' : undefined,
                                                                };
                                                                /**
                                                                 * Private helper methods
                                                                 */
                                                            }
                                                        /**
                                                         * Private helper methods
                                                         */
                                                    }
                                                    /**
                                                     * Private helper methods
                                                     */
                                                }
                                                /**
                                                 * Private helper methods
                                                 */
                                            }
                                            /**
                                             * Private helper methods
                                             */
                                        }
                                        /**
                                         * Private helper methods
                                         */
                                    }
                                    /**
                                     * Private helper methods
                                     */
                                }
                                /**
                                 * Private helper methods
                                 */
                            }
                            /**
                             * Private helper methods
                             */
                        }
                        /**
                         * Private helper methods
                         */
                    }
                    /**
                     * Private helper methods
                     */
                    ,
                    options: ResultExportOptions,
                    filename: string,
                    exportType: 'individual' | 'batch' | 'comparison', Promise() {
                        // Transform data to match existing export system format
                        const exportRequest = {
                            format: this.mapToExistingFormat(options.format),
                            data: this.transformDataForExport(data, options, exportType),
                            options: this.transformOptionsForExport(options),
                            filename
                        };
                        try {
                            return await exportResults(exportRequest);
                        }
                        catch (error) {
                            // Fallback to custom export handling
                            return await this.handleCustomExport(data, options, filename, exportType);
                        }
                    },
                    mapToExistingFormat(format) {
                        const formatMap = {
                            'plain-text': 'json-complete', // Will be post-processed,
                            'json-simple': 'json-complete',
                            'json-complete': 'json-complete',
                            'csv-analysis': 'csv-analysis',
                            'fountain-script': 'fountain',
                            'final-draft': 'final-draft',
                            'controlnet-json': 'controlnet-json',
                            'stable-diffusion': 'stable-diffusion',
                            'professional-report': 'professional-report',
                            'creative-brief': 'creative-brief',
                            'mars-framework': 'mars-framework',
                            'zada-natural': 'zada-natural',
                            'hybrid-prompting': 'hybrid-prompting',
                            'execution-timeline': 'json-complete', // Custom handling,
                            'variance-report': 'json-complete', // Custom handling,
                            'batch-summary': 'json-complete' // Custom handling,
                        };
                        return formatMap[format] || 'json-complete';
                    },
                    options: ResultExportOptions,
                    exportType: string, any
                };
                {
                    const baseData = {
                        exportType,
                        results: 'results' in data ? data.results : [data.result],
                        exportedAt: data.exportedAt,
                        sourceGraph: data.sourceGraph,
                    };
                    if (options.includeMetadata) {
                        baseData.metadata = this.extractMetadata(data);
                        if (options.includeExecutionPaths) {
                            baseData.executionPaths = this.extractExecutionPaths(baseData.results);
                            if (options.includeDebugInfo) {
                                baseData.debugInfo = this.extractDebugInfo(baseData.results);
                                if (options.filmOptions) {
                                    baseData.filmOptions = options.filmOptions;
                                    if (options.vfxOptions) {
                                        baseData.vfxData = this.transformVFXData(baseData.results, options.vfxOptions);
                                        if (options.analysisOptions) {
                                            baseData.analysis = this.generateAnalysis(baseData.results, options.analysisOptions);
                                            return baseData;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            transformOptionsForExport(options) {
                return {
                    includeMetadata: options.includeMetadata,
                    includeExecutionPaths: options.includeExecutionPaths,
                    includeDebugInfo: options.includeDebugInfo,
                    filmOptions: options.filmOptions,
                    vfxOptions: options.vfxOptions,
                    analysisOptions: options.analysisOptions,
                };
            },
            options: ResultExportOptions,
            filename: string,
            exportType: string, Promise() {
                switch (options.format) {
                    case 'plain-text':
                        return this.exportPlainText(data, options);
                    case 'execution-timeline':
                        return this.exportExecutionTimeline(data, options);
                    case 'variance-report':
                        return this.exportVarianceReport(data, options);
                    case 'batch-summary':
                        return this.exportBatchSummary(data, options);
                    default:
                        // Fallback to JSON
                        return {
                            type: 'text',
                            data: JSON.stringify(data, null, 2),
                            mimeType: 'application/json',
                            shouldDownload: true,
                        };
                }
            },
            exportPlainText(data, options) {
                const results = 'results' in data ? data.results : [data.result];
                let content = `Generated Content Export\n`;
                content += `Generated: ${data.exportedAt}\n`;
            },
            content
        } `Results: ${results.length}\n\n`;
    }
    content;
    '=';
    repeat() { }
}
+'\n\n';
results.forEach((result, index) => {
    content += `Result ${index + 1} (Seed: ${result.seed})\n`;
}, content += '-'.repeat(30) + '\n');
content += result.output || result.error || 'No output';
content += '\n\n';
if (options.includeMetadata && result.executionTimeMs) {
    content += `Execution Time: ${result.executionTimeMs}ms\n`;
}
if (options.includeExecutionPaths && result.executionPath) {
    content += `Execution Steps: ${result.executionPath.steps.length}\n`;
}
content += `Randomization Points: ${result.executionPath.randomizationPoints.length}\n`;
content += '\n';
;
return {
    type: 'text',
    data: content,
    mimeType: 'text/plain',
    shouldDownload: true,
};
exportExecutionTimeline(data, any, options, ResultExportOptions);
ExportResult;
{
    const results = 'results' in data ? data.results : [data.result];
    const timeline = {
        exportType: 'execution-timeline',
        exportedAt: data.exportedAt,
        results: results.map((result, index) => ({}), resultIndex, index, seed, result.seed, output, result.output, timeline, result.executionPath ? this.buildExecutionTimeline(result.executionPath) : null)
    };
}
;
return {
    type: 'text',
    data: JSON.stringify(timeline, null, 2),
    mimeType: 'application/json',
    shouldDownload: true,
};
exportVarianceReport(data, any, options, ResultExportOptions);
ExportResult;
{
    const results = 'results' in data ? data.results : [data.result];
    const varianceReport = {
        exportType: 'variance-report',
        exportedAt: data.exportedAt,
        analysis: this.generateVarianceAnalysis(results),
        recommendations: this.generateVarianceRecommendations(results),
    };
    return {
        type: 'text',
        data: JSON.stringify(varianceReport, null, 2),
        mimeType: 'application/json',
        shouldDownload: true,
    };
    exportBatchSummary(data, any, options, ResultExportOptions);
    ExportResult;
    {
        const summary = {
            exportType: 'batch-summary',
            exportedAt: data.exportedAt,
            totalResults: data.results?.length || 0,
            selectedResults: data.selectedIndices?.length || data.results?.length || 0,
            aggregateStats: data.aggregateStats || this.calculateAggregateStats(data.results || []),
            breakdown: this.generateBatchBreakdown(data.results || []),
        };
        return {
            type: 'text',
            data: JSON.stringify(summary, null, 2),
            mimeType: 'application/json',
            shouldDownload: true,
        };
        generateFilename(format, ExportFormat, type, string, seeds, number | number);
        string;
        {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const seedStr = Array.isArray(seeds) ? `${seeds.length}results` : `seed${seeds}`;
        }
        const extension = this.getFileExtension(format);
        return `promptscape-${type}-${seedStr}-${timestamp}.${extension}`;
    }
    getFileExtension(format, ExportFormat);
    string;
    {
        const extensions = {
            'plain-text': 'txt',
            'json-simple': 'json',
            'json-complete': 'json',
            'csv-analysis': 'csv',
            'fountain-script': 'fountain',
            'final-draft': 'fdx',
            'controlnet-json': 'json',
            'stable-diffusion': 'zip',
            'professional-report': 'pdf',
            'creative-brief': 'docx',
            'mars-framework': 'json',
            'zada-natural': 'md',
            'hybrid-prompting': 'json',
            'execution-timeline': 'json',
            'variance-report': 'json',
            'batch-summary': 'json',
        };
        return extensions[format] || 'json';
        calculateAggregateStats(results, PreviewResultWithPath);
        {
            const executionTimes = results;
            map(r => r.executionTimeMs)
                .filter((t) => typeof t === 'number');
            return {
                totalResults: results.length,
                averageExecutionTime: executionTimes.length > 0,
                Math, : .round(executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length),
                0: ,
                uniqueSeeds: [...new Set(results.map(r => r.seed))],
                varianceScore: this.calculateVarianceScore(results),
                commonElements: this.findCommonElements(results),
            };
            calculateVarianceScore(results, PreviewResultWithPath);
            number;
            {
                if (results.length < 2)
                    return 0;
                const outputs = results.map(r => r.output || '').filter(o => o.length > 0);
                if (outputs.length < 2)
                    return 0;
                // Simple variance calculation based on output length and word overlap
                const lengths = outputs.map(o => o.length);
                const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
                const lengthVariance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
                // Normalize to 0-100 scale
                return Math.min(100, Math.round((lengthVariance / avgLength) * 100));
                findCommonElements(results, PreviewResultWithPath);
                string;
                {
                    const allWords = results;
                    map(r => r.output || '')
                        .flatMap(output => output.toLowerCase().split(/\s+/))
                        .filter(word => word.length > 3);
                    const wordCounts = allWords.reduce((counts, word) => {
                        counts[word] = (counts[word] || 0) + 1;
                        return counts;
                    }, {});
                    return Object.entries(wordCounts)
                        .filter(([word, count]) => count > results.length / 2)
                        .map(([word]) => word)
                        .slice(0, 10);
                    generateComparisonAnalysis(results, PreviewResultWithPath);
                    {
                        return {
                            totalResults: results.length,
                            averageLength: Math.round(results.reduce((sum, r) => sum + (r.output?.length || 0), 0) / results.length),
                            uniqueOutputs: new Set(results.map(r => r.output)).size,
                            executionTimeSpread: this.getExecutionTimeSpread(results),
                            randomizationAnalysis: this.analyzeRandomization(results),
                        };
                        getExecutionTimeSpread(results, PreviewResultWithPath);
                        {
                            const times = results;
                            map(r => r.executionTimeMs)
                                .filter((t) => typeof t === 'number'),
                                    .sort((a, b) => a - b);
                            if (times.length === 0)
                                return null;
                            return {
                                min: times[0],
                                max: times[times.length - 1],
                                median: times[Math.floor(times.length / 2)],
                                spread: times[times.length - 1] - times[0],
                            };
                            analyzeRandomization(results, PreviewResultWithPath);
                            {
                                const randomizationCounts = results.map(r => );
                                ;
                                r.executionPath?.randomizationPoints.length || 0;
                                ;
                                return {
                                    totalRandomizationPoints: randomizationCounts.reduce((sum, count) => sum + count, 0),
                                    averagePerResult: Math.round(randomizationCounts.reduce((sum, count) => sum + count, 0) / results.length),
                                    maxRandomizations: Math.max(...randomizationCounts),
                                    minRandomizations: Math.min(...randomizationCounts),
                                };
                                extractMetadata(data, any);
                                {
                                    return {
                                        exportedAt: data.exportedAt,
                                        totalResults: 'results' in data ? data.results.length : 1,
                                        exportType: 'results' in data ? 'batch' : 'individual',
                                        hasSourceGraph: !!data.sourceGraph,
                                    };
                                    extractExecutionPaths(results, PreviewResultWithPath);
                                    {
                                        return results
                                            .filter(r => r.executionPath)
                                            .map(r => ({}), seed, r.seed, executionPath, r.executionPath, timeline, this.buildExecutionTimeline(r.executionPath));
                                    }
                                    ;
                                    extractDebugInfo(results, PreviewResultWithPath);
                                    {
                                        return results
                                            .filter(r => r.debugInfo)
                                            .map(r => ({}), seed, r.seed, debugInfo, r.debugInfo);
                                    }
                                    ;
                                    transformVFXData(results, PreviewResultWithPath, vfxOptions, any);
                                    {
                                        return {
                                            controlNetCompatible: vfxOptions.controlNetCompatible,
                                            sceneDataIntegration: vfxOptions.sceneDataIntegration,
                                            pipeline: 'stable-diffusion',
                                            resolution: [1920, 1080],
                                            results: results.map(r => ({}), seed, r.seed, prompt, r.output, executionPath, r.executionPath)
                                        };
                                    }
                                    ;
                                    generateAnalysis(results, PreviewResultWithPath, analysisOptions, any);
                                    {
                                        const analysis = {};
                                        if (analysisOptions.varianceAnalysis) {
                                            analysis.variance = {
                                                score: this.calculateVarianceScore(results),
                                                distribution: this.analyzeVarianceDistribution(results),
                                            };
                                            if (analysisOptions.performanceBreakdown) {
                                                analysis.performance = {
                                                    executionTimes: results.map(r => r.executionTimeMs).filter(t => t !== undefined),
                                                    averageTime: this.calculateAggregateStats(results).averageExecutionTime,
                                                    timeSpread: this.getExecutionTimeSpread(results),
                                                };
                                                if (analysisOptions.creativityMetrics) {
                                                    analysis.creativity = {
                                                        uniqueOutputs: new Set(results.map(r => r.output)).size,
                                                        averageLength: Math.round(results.reduce((sum, r) => sum + (r.output?.length || 0), 0) / results.length),
                                                        vocabularyDiversity: this.calculateVocabularyDiversity(results),
                                                    };
                                                    return analysis;
                                                    analyzeVarianceDistribution(results, PreviewResultWithPath);
                                                    {
                                                        const lengths = results.map(r => r.output?.length || 0);
                                                        const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
                                                        return {
                                                            mean,
                                                            standardDeviation: Math.sqrt(),
                                                            lengths, : .reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length,
                                                            range: {
                                                                min: Math.min(...lengths),
                                                                max: Math.max(...lengths),
                                                            },
                                                            calculateVocabularyDiversity(results) {
                                                                const allWords = results;
                                                            },
                                                            : 
                                                                .map(r => r.output || '')
                                                                .join(' ')
                                                                .toLowerCase()
                                                                .split(/\s+/)
                                                                .filter(word => word.length > 0),
                                                            const: uniqueWords = new Set(allWords),
                                                            return: allWords.length > 0 ? uniqueWords.size / allWords.length : 0,
                                                            buildExecutionTimeline(executionPath) {
                                                                return executionPath.steps.map((step, index) => ({}), stepIndex, index, nodeId, step.nodeId, nodeType, step.nodeType, timestamp, step.timestamp, executionTime, step.executionTimeMs, randomChoice, step.randomChoice ? {
                                                                    type: step.randomChoice.choiceType,
                                                                    selected: step.randomChoice.selectedOption,
                                                                    reason: step.randomChoice.selectionReason,
                                                                } : null);
                                                            },
                                                            generateVarianceAnalysis(results) {
                                                                return {
                                                                    overallVariance: this.calculateVarianceScore(results),
                                                                    distribution: this.analyzeVarianceDistribution(results),
                                                                    commonElements: this.findCommonElements(results),
                                                                    uniqueElements: this.findUniqueElements(results),
                                                                    recommendations: this.generateVarianceRecommendations(results),
                                                                };
                                                            },
                                                            findUniqueElements(results) {
                                                                const allWords = results;
                                                            },
                                                            : 
                                                                .map(r => r.output || '')
                                                                .flatMap(output => output.toLowerCase().split(/\s+/))
                                                                .filter(word => word.length > 3),
                                                            const: wordCounts = allWords.reduce((counts, word) => {
                                                                counts[word] = (counts[word] || 0) + 1;
                                                                return counts;
                                                            }, {}),
                                                            return: Object.entries(wordCounts)
                                                                .filter(([word, count]) => count === 1)
                                                                .map(([word]) => word)
                                                                .slice(0, 20),
                                                            generateVarianceRecommendations(results) {
                                                                const recommendations = [];
                                                                const varianceScore = this.calculateVarianceScore(results);
                                                                if (varianceScore < 20) {
                                                                    recommendations.push('Consider adding more randomization points to increase creative variety');
                                                                    recommendations.push('Try using different weight distributions in WeightedChoice nodes');
                                                                }
                                                                else if (varianceScore > 80) {
                                                                    recommendations.push('High variance detected - consider adding constraints for consistency');
                                                                    recommendations.push('Review randomization logic to ensure coherent outputs');
                                                                }
                                                                else {
                                                                    recommendations.push('Good balance of variety and consistency achieved');
                                                                    const uniqueOutputs = new Set(results.map(r => r.output)).size;
                                                                    if (uniqueOutputs < results.length * 0.8) {
                                                                        recommendations.push('Some duplicate outputs detected - check for deterministic paths');
                                                                        return recommendations;
                                                                    }
                                                                }
                                                            },
                                                            generateBatchBreakdown(results) {
                                                                return {
                                                                    byExecutionTime: this.groupByExecutionTime(results),
                                                                    byOutputLength: this.groupByOutputLength(results),
                                                                    byRandomizationCount: this.groupByRandomizationCount(results),
                                                                    errorRate: results.filter(r => r.error).length / results.length,
                                                                };
                                                            },
                                                            groupByExecutionTime(results) {
                                                                const groups = { fast: 0, medium: 0, slow: 0 };
                                                                results.forEach(result => { });
                                                                const time = result.executionTimeMs || 0;
                                                                if (time < 100)
                                                                    groups.fast++;
                                                                else if (time < 500)
                                                                    groups.medium++;
                                                                else
                                                                    groups.slow++;
                                                            },
                                                            return: groups,
                                                            groupByOutputLength(results) {
                                                                const groups = { short: 0, medium: 0, long: 0 };
                                                                results.forEach(result => { });
                                                                const length = result.output?.length || 0;
                                                                if (length < 100)
                                                                    groups.short++;
                                                                else if (length < 500)
                                                                    groups.medium++;
                                                                else
                                                                    groups.long++;
                                                            },
                                                            return: groups,
                                                            groupByRandomizationCount(results) {
                                                                const groups = { low: 0, medium: 0, high: 0 };
                                                                results.forEach(result => { });
                                                                const count = result.executionPath?.randomizationPoints.length || 0;
                                                                if (count < 2)
                                                                    groups.low++;
                                                                else if (count < 5)
                                                                    groups.medium++;
                                                                else
                                                                    groups.high++;
                                                            },
                                                            return: groups,
                                                            // Export singleton instance
                                                            const: resultExportService = new ResultExportService()
                                                        };
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
            }
        }
    }
}
