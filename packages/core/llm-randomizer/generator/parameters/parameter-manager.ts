// Epic 12 - LLM Agent Randomizer System
// Story 12.4 - Randomizer Generator Implementation
// Parameter management system with presets and history
import { 
  RandomizerParameters, 
  ParameterPreset, 
  ValidationResult,
  ParameterValidator,
  defaultPresets,
  RandomizerParametersSchema
} from './parameter-schema';

// Browser environment detection with proper typing - using global types
const isBrowser = (function() {
  try {
    return typeof window !== 'undefined' && 
           typeof localStorage !== 'undefined';
  } catch {
    return false;
})();

export interface ParameterHistory {
  id: string;,
  parameters: RandomizerParameters;
  timestamp: string;,
  success: boolean;
  generationTime?: number;
  errorCount?: number;
}
export interface ParameterManagerOptions {
  enableHistory: boolean;,
  maxHistorySize: number;
  autoSave: boolean;,
  storageKey: string;
  /**
  * Manages randomizer parameters, presets, and history
  */
}
export class ParameterManager {
  private presets: Map<string, ParameterPreset> = new Map();
  private history: ParameterHistory = [];
  private options: ParameterManagerOptions;
  constructor(options: Partial<ParameterManagerOptions> = {}) {
  this.options = {
  enableHistory: true,
  maxHistorySize: 50,
  autoSave: true,
  storageKey: 'llm-randomizer-parameters',
  ...options
};
    this.loadDefaultPresets();
    this.loadFromStorage();
  /**
   * Load default presets
   */
  private loadDefaultPresets(): void {
  for (const preset of defaultPresets) {
  this.presets.set(preset.id, preset);
  /**
  * Load from localStorage if available
  */
  private loadFromStorage(): void {,
  if (!isBrowser) return;
  try {
  const stored = localStorage!.getItem(this.options.storageKey);
  if (stored) {
  const data = JSON.parse(stored);
  // Load custom presets
  if (data.presets) {
  for (const preset of data.presets) {
  if (!this.presets.has(preset.id)) {
  this.presets.set(preset.id, preset);
  // Load history
  if (data.history && this.options.enableHistory) {
  this.history = data.history.slice(0, this.options.maxHistorySize);
} catch (error) {
  console.warn('Failed to load parameter data from storage:', error);
  /**
  * Save to localStorage if available
  */
  private saveToStorage(): void {,
  if (!this.options.autoSave || !isBrowser) return;
  try {
  const customPresets = Array.from(this.presets.values());
  .filter(preset => !Object.values(defaultPresets).some(dp => dp.id === preset.id));
  const data = {
  presets: customPresets,
  history: this.history,
};
      localStorage!.setItem(this.options.storageKey, JSON.stringify(data));
    } catch (error) {
  console.warn('Failed to save parameter data to storage:', error);
  /**
  * Validate parameters
  */
  validateParameters(parameters: Partial<RandomizerParameters>): ValidationResult {,
  return ParameterValidator.validate(parameters);
  /**
  * Get parameter suggestions
  */
  getSuggestions(parameters: Partial<RandomizerParameters>) {,
  return ParameterValidator.getSuggestions(parameters);
  /**
  * Create complete parameters with defaults
  */
  createCompleteParameters(partial: Partial<RandomizerParameters>): RandomizerParameters {,
  const result = RandomizerParametersSchema.parse({)
  purpose: '',
  complexity: 'moderate',
  nodeCount: 12,
  style: 'balanced',
  ...partial
});
    return result;
  /**
   * Get all presets
   */
  getPresets(): ParameterPreset {
    return Array.from(this.presets.values()).sort((a, b) => {
      // Default presets first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Then by category and name
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  /**
   * Get presets by category
   */
  getPresetsByCategory(): Record<string, ParameterPreset> {
    const presets = this.getPresets();
    const byCategory: Record<string, ParameterPreset> = {};
    for (const preset of presets) {
  if (!byCategory[preset.category]) {
  byCategory[preset.category] = [];
  byCategory[preset.category].push(preset);
  return byCategory;
  /**
  * Get preset by ID
  */
  getPreset(id: string): ParameterPreset | undefined {,
  return this.presets.get(id);
  /**
  * Create new preset from parameters
  */
  createPreset();
  name: string,
  description: string,
  category: string,
  parameters: RandomizerParameters,
  tags: string = []): ParameterPreset {,
  const preset: ParameterPreset = {,
  id: this.generateId(),
  name,
  description,
  category,
  parameters,
  tags,
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
    this.presets.set(preset.id, preset);
    this.saveToStorage();
    return preset;
  /**
   * Update existing preset
   */
  updatePreset(id: string, updates: Partial<Omit<ParameterPreset, 'id' | 'createdAt'>>): boolean {
  const preset = this.presets.get(id);
  if (!preset || preset.isDefault) {
  return false; // Cannot update default presets
  const updated = {
  ...preset,
  ...updates,
  updatedAt: new Date().toISOString(),
};
    this.presets.set(id, updated);
    this.saveToStorage();
    return true;
  /**
   * Delete preset
   */
  deletePreset(id: string): boolean {
  const preset = this.presets.get(id);
  if (!preset || preset.isDefault) {
  return false; // Cannot delete default presets
  this.presets.delete(id);
  this.saveToStorage();
  return true;
  /**
  * Get parameter history
  */
  getHistory(): ParameterHistory {,
  return [...this.history]; // Already in most recent first order (unshift puts new items at start)
  /**
  * Add to history
  */
  addToHistory();
  parameters: RandomizerParameters,
  success: boolean,
  generationTime?: number,
  errorCount?: number): void {,
  if (!this.options.enableHistory) return;
  const entry: ParameterHistory = {,
  id: this.generateId(),
  parameters,
  timestamp: new Date().toISOString(),
  success,
  generationTime,
  errorCount
};
    this.history.unshift(entry);
    // Maintain max history size
    if (this.history.length > this.options.maxHistorySize) {
      this.history = this.history.slice(0, this.options.maxHistorySize);
    this.saveToStorage();
  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    this.saveToStorage();
  /**
   * Get history statistics
   */
  getHistoryStats(): {
    totalGenerations: number;,
  successRate: number;
    averageGenerationTime: number;,
  mostUsedComplexity: string;
    mostUsedProvider: string;,
  popularNodeTypes: Array<{ nodeType: string; count: number }>;
    if (this.history.length === 0) {
  return {
  totalGenerations: 0,
  successRate: 0,
  averageGenerationTime: 0,
  mostUsedComplexity: 'moderate',
  mostUsedProvider: 'openai',
  popularNodeTypes: [],
};
    const totalGenerations = this.history.length;
    const successCount = this.history.filter(h => h.success).length;
    const successRate = successCount / totalGenerations;
    const generationTimes = this.history;
      .filter(h => h.generationTime)
      .map(h => h.generationTime!);
    const averageGenerationTime = generationTimes.length > 0;
      ? generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length
      : 0;
    // Most used complexity
    const complexityCounts = new Map<string, number>();
    this.history.forEach(h => {)
  const complexity = h.parameters.complexity;
      complexityCounts.set(complexity, (complexityCounts.get(complexity) || 0) + 1);
    });
    const mostUsedComplexity = Array.from(complexityCounts.entries());
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'moderate';
    // Most used provider
    const providerCounts = new Map<string, number>();
    this.history.forEach(h => {)
  const provider = h.parameters.provider;
      providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1);
    });
    const mostUsedProvider = Array.from(providerCounts.entries());
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'openai';
    // Popular node types
    const nodeTypeCounts = new Map<string, number>();
    this.history.forEach(h => {)
  h.parameters.nodeTypes.forEach(nt => {)
  nodeTypeCounts.set(nt.nodeType, (nodeTypeCounts.get(nt.nodeType) || 0) + 1);
      });
    });
    const popularNodeTypes = Array.from(nodeTypeCounts.entries());
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
  /**
   * Find similar parameters in history
   */
  findSimilarInHistory(parameters: Partial<RandomizerParameters>): ParameterHistory {
    if (!parameters.purpose) return [];
    const purpose = parameters.purpose.toLowerCase();
    const similar = this.history.filter(h => {)
  const historyPurpose = h.parameters.purpose.toLowerCase();
      // Simple similarity based on common words
      const purposeWords = purpose.split(/\s+/).filter(w => w.length > 3);
      const historyWords = historyPurpose.split(/\s+/).filter(w => w.length > 3);
      const commonWords = purposeWords.filter(w => historyWords.includes(w));
      const similarity = commonWords.length / Math.max(purposeWords.length, historyWords.length);
      return similarity > 0.3; // 30% similarity threshold
    });
    return similar.slice(0, 5); // Return top 5 similar
  /**
   * Export parameters and presets
   */
  exportData(): {
  presets: ParameterPreset;,
  history: ParameterHistory;
  exported: string;
  return {
  presets: Array.from(this.presets.values()),
  history: this.history,
  exported: new Date().toISOString(),
};
  /**
   * Import parameters and presets
   */
  importData(data: {)
  presets?: ParameterPreset;
  history?: ParameterHistory;
}): {
  presetsImported: number;,
  historyImported: number;
  errors: string;
  const result = {
  presetsImported: 0,
  historyImported: 0,
  errors: [],
};
    // Import presets
    if (data.presets) {
  for (const preset of data.presets) {
  try {
  // Validate preset structure
  if (preset.id && preset.name && preset.parameters) {
  // Don't overwrite existing presets with same ID
  if (!this.presets.has(preset.id)) {
  this.presets.set(preset.id, {)
  ...preset,
  isDefault: false, // Imported presets are never default,
  updatedAt: new Date().toISOString(),
});
              result.presetsImported++;
        } catch (error) {
          result.errors.push(`Failed to import preset ${preset.name}: ${error}`);}
    // Import history
    if (data.history && this.options.enableHistory) {
      for (const entry of data.history) {
        try {
          if (entry.id && entry.parameters && entry.timestamp) {
            this.history.push(entry);
            result.historyImported++;
        } catch (error) {
          result.errors.push(`Failed to import history entry: ${error}`);}
      // Maintain max history size
      if (this.history.length > this.options.maxHistorySize) {
        this.history = this.history.slice(0, this.options.maxHistorySize);
    this.saveToStorage();
    return result;
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}