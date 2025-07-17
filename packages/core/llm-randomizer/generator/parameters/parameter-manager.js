"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterManager = void 0;
const parameter_schema_1 = require("./parameter-schema");
class ParameterManager {
    constructor(options = {}) {
        this.presets = new Map();
        this.history = [];
        this.options = {
            enableHistory: true,
            maxHistorySize: 50,
            autoSave: true,
            storageKey: 'llm-randomizer-parameters',
            ...options
        };
        this.loadDefaultPresets();
        this.loadFromStorage();
    }
    loadDefaultPresets() {
        for (const preset of parameter_schema_1.defaultPresets) {
            this.presets.set(preset.id, preset);
        }
    }
    loadFromStorage() {
        if (typeof localStorage === 'undefined')
            return;
        try {
            const stored = localStorage.getItem(this.options.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.presets) {
                    for (const preset of data.presets) {
                        if (!this.presets.has(preset.id)) {
                            this.presets.set(preset.id, preset);
                        }
                    }
                }
                if (data.history && this.options.enableHistory) {
                    this.history = data.history.slice(0, this.options.maxHistorySize);
                }
            }
        }
        catch (error) {
            console.warn('Failed to load parameter data from storage:', error);
        }
    }
    saveToStorage() {
        if (!this.options.autoSave || typeof localStorage === 'undefined')
            return;
        try {
            const customPresets = Array.from(this.presets.values())
                .filter(preset => !parameter_schema_1.defaultPresets.some(dp => dp.id === preset.id));
            const data = {
                presets: customPresets,
                history: this.history
            };
            localStorage.setItem(this.options.storageKey, JSON.stringify(data));
        }
        catch (error) {
            console.warn('Failed to save parameter data to storage:', error);
        }
    }
    validateParameters(parameters) {
        return parameter_schema_1.ParameterValidator.validate(parameters);
    }
    getSuggestions(parameters) {
        return parameter_schema_1.ParameterValidator.getSuggestions(parameters);
    }
    createCompleteParameters(partial) {
        const result = parameter_schema_1.RandomizerParametersSchema.parse({
            purpose: '',
            complexity: 'moderate',
            nodeCount: 12,
            style: 'balanced',
            ...partial
        });
        return result;
    }
    getPresets() {
        return Array.from(this.presets.values()).sort((a, b) => {
            if (a.isDefault && !b.isDefault)
                return -1;
            if (!a.isDefault && b.isDefault)
                return 1;
            if (a.category !== b.category)
                return a.category.localeCompare(b.category);
            return a.name.localeCompare(b.name);
        });
    }
    getPresetsByCategory() {
        const presets = this.getPresets();
        const byCategory = {};
        for (const preset of presets) {
            if (!byCategory[preset.category]) {
                byCategory[preset.category] = [];
            }
            byCategory[preset.category].push(preset);
        }
        return byCategory;
    }
    getPreset(id) {
        return this.presets.get(id);
    }
    createPreset(name, description, category, parameters, tags = []) {
        const preset = {
            id: this.generateId(),
            name,
            description,
            category,
            parameters,
            tags,
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.presets.set(preset.id, preset);
        this.saveToStorage();
        return preset;
    }
    updatePreset(id, updates) {
        const preset = this.presets.get(id);
        if (!preset || preset.isDefault) {
            return false;
        }
        const updated = {
            ...preset,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.presets.set(id, updated);
        this.saveToStorage();
        return true;
    }
    deletePreset(id) {
        const preset = this.presets.get(id);
        if (!preset || preset.isDefault) {
            return false;
        }
        this.presets.delete(id);
        this.saveToStorage();
        return true;
    }
    getHistory() {
        return [...this.history].reverse();
    }
    addToHistory(parameters, success, generationTime, errorCount) {
        if (!this.options.enableHistory)
            return;
        const entry = {
            id: this.generateId(),
            parameters,
            timestamp: new Date().toISOString(),
            success,
            generationTime,
            errorCount
        };
        this.history.unshift(entry);
        if (this.history.length > this.options.maxHistorySize) {
            this.history = this.history.slice(0, this.options.maxHistorySize);
        }
        this.saveToStorage();
    }
    clearHistory() {
        this.history = [];
        this.saveToStorage();
    }
    getHistoryStats() {
        if (this.history.length === 0) {
            return {
                totalGenerations: 0,
                successRate: 0,
                averageGenerationTime: 0,
                mostUsedComplexity: 'moderate',
                mostUsedProvider: 'openai',
                popularNodeTypes: []
            };
        }
        const totalGenerations = this.history.length;
        const successCount = this.history.filter(h => h.success).length;
        const successRate = successCount / totalGenerations;
        const generationTimes = this.history
            .filter(h => h.generationTime)
            .map(h => h.generationTime);
        const averageGenerationTime = generationTimes.length > 0
            ? generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length
            : 0;
        const complexityCounts = new Map();
        this.history.forEach(h => {
            const complexity = h.parameters.complexity;
            complexityCounts.set(complexity, (complexityCounts.get(complexity) || 0) + 1);
        });
        const mostUsedComplexity = Array.from(complexityCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'moderate';
        const providerCounts = new Map();
        this.history.forEach(h => {
            const provider = h.parameters.provider;
            providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1);
        });
        const mostUsedProvider = Array.from(providerCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'openai';
        const nodeTypeCounts = new Map();
        this.history.forEach(h => {
            h.parameters.nodeTypes.forEach(nt => {
                nodeTypeCounts.set(nt.nodeType, (nodeTypeCounts.get(nt.nodeType) || 0) + 1);
            });
        });
        const popularNodeTypes = Array.from(nodeTypeCounts.entries())
            .map(([nodeType, count]) => ({ nodeType, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            totalGenerations,
            successRate,
            averageGenerationTime,
            mostUsedComplexity,
            mostUsedProvider,
            popularNodeTypes
        };
    }
    findSimilarInHistory(parameters) {
        if (!parameters.purpose)
            return [];
        const purpose = parameters.purpose.toLowerCase();
        const similar = this.history.filter(h => {
            const historyPurpose = h.parameters.purpose.toLowerCase();
            const purposeWords = purpose.split(/\s+/).filter(w => w.length > 3);
            const historyWords = historyPurpose.split(/\s+/).filter(w => w.length > 3);
            const commonWords = purposeWords.filter(w => historyWords.includes(w));
            const similarity = commonWords.length / Math.max(purposeWords.length, historyWords.length);
            return similarity > 0.3;
        });
        return similar.slice(0, 5);
    }
    exportData() {
        return {
            presets: Array.from(this.presets.values()),
            history: this.history,
            exported: new Date().toISOString()
        };
    }
    importData(data) {
        const result = {
            presetsImported: 0,
            historyImported: 0,
            errors: []
        };
        if (data.presets) {
            for (const preset of data.presets) {
                try {
                    if (preset.id && preset.name && preset.parameters) {
                        if (!this.presets.has(preset.id)) {
                            this.presets.set(preset.id, {
                                ...preset,
                                isDefault: false,
                                updatedAt: new Date().toISOString()
                            });
                            result.presetsImported++;
                        }
                    }
                }
                catch (error) {
                    result.errors.push(`Failed to import preset ${preset.name}: ${error}`);
                }
            }
        }
        if (data.history && this.options.enableHistory) {
            for (const entry of data.history) {
                try {
                    if (entry.id && entry.parameters && entry.timestamp) {
                        this.history.push(entry);
                        result.historyImported++;
                    }
                }
                catch (error) {
                    result.errors.push(`Failed to import history entry: ${error}`);
                }
            }
            if (this.history.length > this.options.maxHistorySize) {
                this.history = this.history.slice(0, this.options.maxHistorySize);
            }
        }
        this.saveToStorage();
        return result;
    }
    generateId() {
        return `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.ParameterManager = ParameterManager;
//# sourceMappingURL=parameter-manager.js.map