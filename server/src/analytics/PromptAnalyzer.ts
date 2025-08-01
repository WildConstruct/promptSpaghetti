/**
 * Prompt Analyzer - High-level prompt analysis and interpretation service
 * 
 * Provides comprehensive analysis of prompts including token influence,
 * structural analysis, and optimization recommendations.
 */

import TokenInfluenceAnalyzer, { TokenInfluenceResult, TokenInfluence } from './TokenInfluenceAnalyzer';
import { AnalyticsCollector } from './AnalyticsCollector';
import { logger } from '../utils/logger';



export interface PromptAnalysisResult {
  prompt: string;
  analysis: {
    tokenInfluence: TokenInfluenceResult;
    structure: StructuralAnalysis;
    quality: QualityMetrics;
    optimization: OptimizationRecommendations;



  };
  summary: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    keyTokens: TokenInfluence[];
  };
  timestamp: number;
  metadata: {
    analysisTime: number;
    version: string;
  };




export interface StructuralAnalysis {
  tokenCount: number;
  sentenceCount: number;
  averageTokensPerSentence: number;
  complexity: 'simple' | 'moderate' | 'complex';
  readabilityScore: number;
  keyPhrases: KeyPhrase[];
  semanticClusters: SemanticCluster[];







export interface QualityMetrics {
  clarity: number;          // 0-1, how clear and specific the prompt is
  completeness: number;     // 0-1, how complete the instructions are
  consistency: number;      // 0-1, internal consistency of the prompt
  specificity: number;      // 0-1, how specific vs generic the prompt is
  actionability: number;    // 0-1, how actionable the instructions are
  overallQuality: number;   // 0-1, weighted combination







export interface OptimizationRecommendations {
  suggestions: Suggestion[];
  alternativeVersions: AlternativeVersion[];
  tokenOptimizations: TokenOptimization[];
  structuralImprovements: StructuralImprovement[];







export interface KeyPhrase {
  phrase: string;
  importance: number;
  category: 'instruction' | 'context' | 'constraint' | 'example';
  positions: number[];







export interface SemanticCluster {
  id: string;
  tokens: string[];
  centroid: string;
  coherence: number;
  importance: number;







export interface Suggestion {
  type: 'add' | 'remove' | 'modify' | 'reorder';
  priority: 'high' | 'medium' | 'low';
  description: string;
  reasoning: string;
  expectedImprovement: number;
  targetTokens?: number[];







export interface AlternativeVersion {
  version: string;
  changes: string[];
  expectedScore: number;
  confidenceLevel: number;







export interface TokenOptimization {
  position: number;
  currentToken: string;
  suggestedToken: string;
  improvement: number;
  reasoning: string;







export interface StructuralImprovement {
  issue: string;
  severity: 'critical' | 'major' | 'minor';
  solution: string;
  impact: number;





class PromptAnalyzer {
  private tokenInfluenceAnalyzer: TokenInfluenceAnalyzer;
  private analyticsCollector: AnalyticsCollector;
  private static instance: PromptAnalyzer;

  constructor(analyticsCollector: AnalyticsCollector) {
    this.analyticsCollector = analyticsCollector;
    this.tokenInfluenceAnalyzer = TokenInfluenceAnalyzer.getInstance(analyticsCollector);


  static getInstance(analyticsCollector: AnalyticsCollector): PromptAnalyzer {
    if (!PromptAnalyzer.instance) {
      PromptAnalyzer.instance = new PromptAnalyzer(analyticsCollector);

    return PromptAnalyzer.instance;


  /**
   * Perform comprehensive prompt analysis
   */
  public async analyzePrompt(
    prompt: string,
    predictionFunction: (prompt: string) => Promise<any>,
    options: {
      includeInfluence?: boolean;
      includeOptimizations?: boolean;
      analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
 = {}
  ): Promise<PromptAnalysisResult> {

    const startTime = Date.now();
    const opts = {
      includeInfluence: options.includeInfluence ?? true,
      includeOptimizations: options.includeOptimizations ?? true,
      analysisDepth: options.analysisDepth ?? 'detailed'
    };

    logger.info('Starting comprehensive prompt analysis', {
      promptLength: prompt.length,
      includeInfluence: opts.includeInfluence,
      analysisDepth: opts.analysisDepth
    });

    try {
      // Perform parallel analysis components
      const analysisPromises: Promise<any>[] = [
        this.analyzeStructure(prompt),
        this.analyzeQuality(prompt)
      ];

      if (opts.includeInfluence) {
        analysisPromises.push(
          this.tokenInfluenceAnalyzer.analyzeLIME(prompt, predictionFunction)
        );


      const [structure, quality, tokenInfluence] = await Promise.all(analysisPromises);

      // Generate optimization recommendations
      let optimization: OptimizationRecommendations = {
        suggestions: [],
        alternativeVersions: [],
        tokenOptimizations: [],
        structuralImprovements: []
      };

      if (opts.includeOptimizations) {
        optimization = await this.generateOptimizationRecommendations(
          prompt,
          tokenInfluence,
          structure,
          quality
        );


      // Create summary
      const summary = this.createSummary(prompt, tokenInfluence, structure, quality, optimization);

      const result: PromptAnalysisResult = {
        prompt,
        analysis: {
          tokenInfluence: tokenInfluence || ({} as TokenInfluenceResult),
          structure,
          quality,
          optimization

        summary,
        timestamp: startTime,
        metadata: {
          analysisTime: Date.now() - startTime,
          version: '1.0.0'

      };

      // Track analytics
      this.trackPromptAnalysis(result);

      logger.info('Prompt analysis completed', {
        overallScore: summary.overallScore,
        analysisTime: result.metadata.analysisTime,
        strengthsCount: summary.strengths.length,
        weaknessesCount: summary.weaknesses.length
      });

      return result;
 catch (error) {
      logger.error('Prompt analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        analysisTime: Date.now() - startTime
      });
      throw error;



  /**
   * Analyze prompt structure and composition
   */
  private async analyzeStructure(prompt: string): Promise<StructuralAnalysis> {

    const tokens = prompt.split(/\s+/).filter(token => token.length > 0);
    const sentences = prompt.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    const tokenCount = tokens.length;
    const sentenceCount = sentences.length;
    const averageTokensPerSentence = sentenceCount > 0 ? tokenCount / sentenceCount : 0;

    // Determine complexity
    let complexity: 'simple' | 'moderate' | 'complex';
    if (tokenCount < 20 && sentenceCount <= 2) complexity = 'simple';
    else if (tokenCount < 50 && sentenceCount <= 5) complexity = 'moderate';
    else complexity = 'complex';

    // Calculate readability score (simplified Flesch score)
    const readabilityScore = this.calculateReadabilityScore(prompt, tokenCount, sentenceCount);

    // Extract key phrases
    const keyPhrases = this.extractKeyPhrases(prompt, tokens);

    // Identify semantic clusters
    const semanticClusters = this.identifySemanticClusters(tokens);

    return {
      tokenCount,
      sentenceCount,
      averageTokensPerSentence,
      complexity,
      readabilityScore,
      keyPhrases,
      semanticClusters
    };


  /**
   * Analyze prompt quality metrics
   */
  private async analyzeQuality(prompt: string): Promise<QualityMetrics> {

    const clarity = this.assessClarity(prompt);
    const completeness = this.assessCompleteness(prompt);
    const consistency = this.assessConsistency(prompt);
    const specificity = this.assessSpecificity(prompt);
    const actionability = this.assessActionability(prompt);

    // Weighted overall quality score
    const overallQuality = 
      clarity * 0.25 +
      completeness * 0.2 +
      consistency * 0.2 +
      specificity * 0.15 +
      actionability * 0.2;

    return {
      clarity,
      completeness,
      consistency,
      specificity,
      actionability,
      overallQuality
    };


  private assessClarity(prompt: string): number {
    // Assess clarity based on various factors
    let score = 0.5; // Base score

    // Positive factors
    if (prompt.includes('specifically')) score += 0.1;
    if (prompt.includes('exactly')) score += 0.1;
    if (prompt.includes('please')) score += 0.05;
    if (/\d+/.test(prompt)) score += 0.1; // Contains numbers/specifics
    
    // Negative factors  
    if (prompt.includes('maybe') || prompt.includes('perhaps')) score -= 0.1;
    if (prompt.includes('sort of') || prompt.includes('kind of')) score -= 0.1;
    if (prompt.split(/\s+/).length > 100) score -= 0.1; // Too verbose

    return Math.max(0, Math.min(1, score));


  private assessCompleteness(prompt: string): number {
    let score = 0.3; // Base score

    // Check for key instruction components
    const hasTask = /\b(create|generate|write|analyze|summarize|explain|describe)\b/i.test(prompt);
    const hasContext = /\b(context|background|about|regarding)\b/i.test(prompt);
    const hasConstraints = /\b(must|should|don't|avoid|limit|maximum|minimum)\b/i.test(prompt);
    const hasFormat = /\b(format|style|tone|length|structure)\b/i.test(prompt);
    const hasExamples = /\b(example|instance|such as|like|including)\b/i.test(prompt);

    if (hasTask) score += 0.2;
    if (hasContext) score += 0.15;
    if (hasConstraints) score += 0.15;
    if (hasFormat) score += 0.1;
    if (hasExamples) score += 0.1;

    return Math.max(0, Math.min(1, score));


  private assessConsistency(prompt: string): number {
    let score = 0.7; // Base score (assume mostly consistent)

    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Check for contradictory instructions
    const contradictions = [
      ['brief', 'detailed'],
      ['short', 'comprehensive'],
      ['simple', 'complex'],
      ['formal', 'casual']
    ];

    for (const [term1, term2] of contradictions) {
      if (prompt.toLowerCase().includes(term1) && prompt.toLowerCase().includes(term2)) {
        score -= 0.15;



    // Check for tense consistency
    const pastTense = /\b\w+ed\b/g.test(prompt);
    const presentTense = /\b\w+(s|es)\b/g.test(prompt);
    const futureTense = /\bwill\b/g.test(prompt);
    
    const tenseCount = [pastTense, presentTense, futureTense].filter(Boolean).length;
    if (tenseCount > 1) score -= 0.1;

    return Math.max(0, Math.min(1, score));


  private assessSpecificity(prompt: string): number {
    let score = 0.3; // Base score

    // Positive specificity indicators
    const specificWords = ['exactly', 'precisely', 'specifically', 'particular', 'detailed'];
    const quantifiers = prompt.match(/\b\d+\b/g) || [];
    const technicalTerms = prompt.match(/[A-Z]{2
/g) || []; // Acronyms
    
    score += Math.min(0.2, specificWords.filter(word => 
      prompt.toLowerCase().includes(word)).length * 0.05);
    score += Math.min(0.2, quantifiers.length * 0.02);
    score += Math.min(0.1, technicalTerms.length * 0.01);

    // Negative specificity indicators
    const vagueWords = ['something', 'anything', 'various', 'some', 'general'];
    score -= Math.min(0.3, vagueWords.filter(word => 
      prompt.toLowerCase().includes(word)).length * 0.08);

    return Math.max(0, Math.min(1, score));


  private assessActionability(prompt: string): number {
    let score = 0.2; // Base score

    // Strong action verbs
    const actionVerbs = [
      'create', 'generate', 'write', 'develop', 'build', 'design',
      'analyze', 'evaluate', 'assess', 'compare', 'contrast',
      'explain', 'describe', 'summarize', 'outline', 'list'
    ];

    const foundActions = actionVerbs.filter(verb => 
      new RegExp(`\\b${verb}\\b`, 'i').test(prompt));
    score += Math.min(0.4, foundActions.length * 0.1);

    // Clear instructions
    if (/\bstep\s*\d+/i.test(prompt) || /\bfirst\b.*\bsecond\b/i.test(prompt)) {
      score += 0.2; // Sequential instructions


    // Format specifications
    if (/\b(bullet|numbered|table|paragraph|section)\b/i.test(prompt)) {
      score += 0.1;


    // Deliverable clarity
    if (/\bprovide\s+\w+\b|\binclude\s+\w+\b/i.test(prompt)) {
      score += 0.1;


    return Math.max(0, Math.min(1, score));


  private calculateReadabilityScore(prompt: string, tokenCount: number, sentenceCount: number): number {
    // Simplified Flesch Reading Ease score
    if (sentenceCount === 0) return 0;
    
    const averageWordsPerSentence = tokenCount / sentenceCount;
    const syllableCount = this.estimateSyllableCount(prompt);
    const averageSyllablesPerWord = syllableCount / tokenCount;

    // Flesch formula: 206.835 - (1.015 × ASL) - (84.6 × ASW)
    const score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, score / 100));


  private estimateSyllableCount(text: string): number {
    // Simple syllable estimation
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.reduce((total, word) => {
      const syllables = word.replace(/[^aeiouy]/g, '').length || 1;
      return total + syllables;
    }, 0);


  private extractKeyPhrases(prompt: string, tokens: string[]): KeyPhrase[] {
    const phrases: KeyPhrase[] = [];
    
    // Simple n-gram extraction (2-3 word phrases)
    for (let n = 2; n <= 3; n++) {
      for (let i = 0; i <= tokens.length - n; i++) {
        const phrase = tokens.slice(i, i + n).join(' ');
        const importance = this.calculatePhraseImportance(phrase);
        
        if (importance > 0.3) {
          phrases.push({
            phrase,
            importance,
            category: this.categorizePhrases(phrase),
            positions: [i]
          });




    // Deduplicate and sort by importance
    const uniquePhrases = phrases.reduce((acc, phrase) => {
      const existing = acc.find(p => p.phrase === phrase.phrase);
      if (existing) {
        existing.positions.push(...phrase.positions);
 else {
        acc.push(phrase);

      return acc;
    }, [] as KeyPhrase[]);

    return uniquePhrases.sort((a, b) => b.importance - a.importance).slice(0, 10);


  private calculatePhraseImportance(phrase: string): number {
    const importantWords = [
      'create', 'generate', 'analyze', 'write', 'develop', 'explain',
      'specific', 'detailed', 'comprehensive', 'exactly', 'must', 'should'
    ];
    
    const words = phrase.toLowerCase().split(/\s+/);
    const importantCount = words.filter(word => importantWords.includes(word)).length;
    
    return Math.min(1, importantCount / words.length + 0.1);


  private categorizePhrases(phrase: string): 'instruction' | 'context' | 'constraint' | 'example' {
    const lower = phrase.toLowerCase();
    
    if (/\b(create|generate|write|analyze|develop)\b/.test(lower)) return 'instruction';
    if (/\b(example|instance|such as|like)\b/.test(lower)) return 'example';
    if (/\b(must|should|don't|avoid|limit)\b/.test(lower)) return 'constraint';
    return 'context';


  private identifySemanticClusters(tokens: string[]): SemanticCluster[] {
    // Simple clustering based on word categories
    const clusters: Map<string, string[]> = new Map();
    
    const categories = {
      action: ['create', 'generate', 'write', 'develop', 'build', 'analyze'],
      quality: ['good', 'best', 'excellent', 'high', 'quality', 'detailed'],
      format: ['format', 'style', 'structure', 'layout', 'paragraph', 'list'],
      content: ['content', 'information', 'data', 'text', 'material', 'topic']
    };

    for (const [category, words] of Object.entries(categories)) {
      const matchingTokens = tokens.filter(token => 
        words.some(word => token.toLowerCase().includes(word)));
      
      if (matchingTokens.length > 0) {
        clusters.set(category, matchingTokens);



    return Array.from(clusters.entries()).map(([category, tokens], index) => ({
      id: `cluster_${index}`,
      tokens,
      centroid: category,
      coherence: tokens.length / 10, // Simple coherence measure
      importance: this.calculateClusterImportance(tokens)
    }));


  private calculateClusterImportance(tokens: string[]): number {
    // Higher importance for larger, more specific clusters
    return Math.min(1, tokens.length / 5 + 0.2);


  private async generateOptimizationRecommendations(
    prompt: string,
    tokenInfluence: TokenInfluenceResult | null,
    structure: StructuralAnalysis,
    quality: QualityMetrics
  ): Promise<OptimizationRecommendations> {

    const suggestions: Suggestion[] = [];
    const tokenOptimizations: TokenOptimization[] = [];
    const structuralImprovements: StructuralImprovement[] = [];
    const alternativeVersions: AlternativeVersion[] = [];

    // Generate suggestions based on quality metrics
    if (quality.clarity < 0.6) {
      suggestions.push({
        type: 'modify',
        priority: 'high',
        description: 'Improve clarity by being more specific',
        reasoning: 'Clarity score is below optimal threshold',
        expectedImprovement: 0.3
      });


    if (quality.completeness < 0.7) {
      suggestions.push({
        type: 'add',
        priority: 'medium',
        description: 'Add context or constraints to make instructions more complete',
        reasoning: 'Missing key instruction components',
        expectedImprovement: 0.2
      });


    // Generate token-level optimizations from influence analysis
    if (tokenInfluence) {
      const lowInfluenceTokens = tokenInfluence.tokens.filter(
        t => Math.abs(t.influenceScore) < 0.1 && t.importance === 'low'
      );

      lowInfluenceTokens.slice(0, 5).forEach(token => {
        tokenOptimizations.push({
          position: token.position,
          currentToken: token.token,
          suggestedToken: token.alternatives?.[0] || '[REMOVE]',
          improvement: 0.1,
          reasoning: 'Low influence token that could be optimized'
        });
      });


    // Structural improvements
    if (structure.complexity === 'complex' && structure.tokenCount > 80) {
      structuralImprovements.push({
        issue: 'Prompt is too complex and verbose',
        severity: 'major',
        solution: 'Break into simpler, more focused instructions',
        impact: 0.25
      });


    if (structure.averageTokensPerSentence > 25) {
      structuralImprovements.push({
        issue: 'Sentences are too long',
        severity: 'minor',
        solution: 'Use shorter, more direct sentences',
        impact: 0.15
      });


    // Generate alternative versions
    alternativeVersions.push({
      version: this.generateAlternativeVersion(prompt, 'concise'),
      changes: ['Reduced verbosity', 'Simplified language'],
      expectedScore: quality.overallQuality + 0.1,
      confidenceLevel: 0.7
    });

    return {
      suggestions,
      alternativeVersions,
      tokenOptimizations,
      structuralImprovements
    };


  private generateAlternativeVersion(prompt: string, style: string): string {
    // Simple alternative generation - in production use more sophisticated methods
    switch (style) {
    case 'concise':
      return prompt
        .replace(/\b(please|kindly|if you would)\b/gi, '')
        .replace(/\b(very|quite|rather|really)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    default:
      return prompt;



  private createSummary(
    prompt: string,
    tokenInfluence: TokenInfluenceResult | null,
    structure: StructuralAnalysis,
    quality: QualityMetrics,
    optimization: OptimizationRecommendations
  ) {
    const overallScore = quality.overallQuality;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const keyTokens = tokenInfluence?.tokens.filter(t => t.importance === 'high') || [];

    // Identify strengths
    if (quality.clarity > 0.7) strengths.push('Clear and specific instructions');
    if (quality.actionability > 0.7) strengths.push('Actionable and direct');
    if (structure.complexity === 'moderate') strengths.push('Well-balanced complexity');
    if (quality.completeness > 0.8) strengths.push('Comprehensive instructions');

    // Identify weaknesses
    if (quality.clarity < 0.5) weaknesses.push('Instructions lack clarity');
    if (quality.completeness < 0.6) weaknesses.push('Missing important details');
    if (structure.tokenCount > 100) weaknesses.push('Too verbose');
    if (quality.consistency < 0.6) weaknesses.push('Contains contradictory elements');

    return {
      overallScore,
      strengths,
      weaknesses,
      keyTokens
    };


  private trackPromptAnalysis(result: PromptAnalysisResult): void {
    this.analyticsCollector.trackEvent({
      type: 'prompt_analysis',
      timestamp: result.timestamp,
      metadata: {
        promptLength: result.prompt.length,
        overallScore: result.summary.overallScore,
        tokenCount: result.analysis.structure.tokenCount,
        complexity: result.analysis.structure.complexity,
        qualityScore: result.analysis.quality.overallQuality,
        analysisTime: result.metadata.analysisTime,
        strengthsCount: result.summary.strengths.length,
        weaknessesCount: result.summary.weaknesses.length,
        optimizationCount: result.analysis.optimization.suggestions.length

    });



export default PromptAnalyzer;