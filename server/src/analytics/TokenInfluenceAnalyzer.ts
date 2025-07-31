/**
 * Token Influence Analyzer - LIME and Saliency Analysis for Prompt Tokens
 * 
 * This service provides model-agnostic explanations for token influence
 * using LIME (Local Interpretable Model-agnostic Explanations) and
 * saliency mapping techniques.
 */

import { logger } from '../utils/logger';
import { AnalyticsCollector } from './AnalyticsCollector';

}
}
export interface TokenInfluenceResult {
  originalPrompt: string;
  tokens: TokenInfluence[];
  overallScore: number;
  analysisMethod: 'LIME' | 'SALIENCY' | 'GRADIENT';
  modelConfidence: number;
  timestamp: number;
  metadata: {
    modelId?: string;
    executionId?: string;
    analysisTime: number;
    tokenCount: number;
    perturbationCount?: number;
}
}
  };
}

}
}
export interface TokenInfluence {
  token: string;
  position: number;
  influenceScore: number;
  confidence: number;
  importance: 'high' | 'medium' | 'low';
  isPositive: boolean;
  alternatives?: string[];
  contextWindow?: {
    before: string[];
    after: string[];
}
}
  };
}

}
}
export interface LimeAnalysisOptions {
  numSamples: number;           // Number of perturbations for LIME
  perturbationStrategy: 'mask' | 'replace' | 'reorder';
  neighborhoodSize: number;     // Local neighborhood size
  kernelWidth: number;          // Exponential kernel width
  maxFeatures: number;          // Max features in explanation
  regularization: number;       // Ridge regression alpha
}
}
}

}
}
export interface SaliencyAnalysisOptions {
  gradientMethod: 'vanilla' | 'integrated' | 'smoothgrad';
  baselineStrategy: 'zero' | 'random' | 'mask';
  numSteps: number;             // Steps for integrated gradients
  noiseLevel: number;           // Noise for SmoothGrad
  aggregationMethod: 'mean' | 'max' | 'l2_norm';
}
}
}

}
}
export interface PromptPerturbation {
  perturbedPrompt: string;
  changedPositions: number[];
  similarity: number;
  prediction?: any;
}
}
}

class TokenInfluenceAnalyzer {
  private analyticsCollector: AnalyticsCollector;
  private static instance: TokenInfluenceAnalyzer;

  constructor(analyticsCollector: AnalyticsCollector) {
    this.analyticsCollector = analyticsCollector;
  }

  static getInstance(analyticsCollector: AnalyticsCollector): TokenInfluenceAnalyzer {
    if (!TokenInfluenceAnalyzer.instance) {
      TokenInfluenceAnalyzer.instance = new TokenInfluenceAnalyzer(analyticsCollector);
    }
    return TokenInfluenceAnalyzer.instance;
  }

  /**
   * Analyze token influence using LIME methodology
   */
  public async analyzeLIME(
    prompt: string,
    predictionFunction: (prompt: string) => Promise<any>,
    options: Partial<LimeAnalysisOptions> = {}
  ): Promise<TokenInfluenceResult> {

    const startTime = Date.now();
    
    const opts: LimeAnalysisOptions = {
      numSamples: options.numSamples || 500,
      perturbationStrategy: options.perturbationStrategy || 'mask',
      neighborhoodSize: options.neighborhoodSize || 100,
      kernelWidth: options.kernelWidth || 0.75,
      maxFeatures: options.maxFeatures || 10,
      regularization: options.regularization || 1.0
    };

    logger.info('Starting LIME analysis for token influence', {
      promptLength: prompt.length,
      numSamples: opts.numSamples,
      strategy: opts.perturbationStrategy
    });

    try {
      // Tokenize the prompt
      const tokens = this.tokenizePrompt(prompt);
      
      // Get original prediction
      const originalPrediction = await predictionFunction(prompt);
      
      // Generate perturbations
      const perturbations = this.generatePerturbations(prompt, tokens, opts);
      
      // Get predictions for perturbations
      const perturbedPredictions = await Promise.all(
        perturbations.map(async (p, index) => {
          try {
            const prediction = await predictionFunction(p.perturbedPrompt);
            return { ...p, prediction, index };
          } catch (error) {
            logger.warn(
              `Perturbation ${index} failed`,
              { error: error instanceof Error ? error.message : String(error
              ) });
            return { ...p, prediction: null, index };
          }
  }
      );

      // Filter successful predictions
      const validPerturbations = perturbedPredictions.filter(p => p.prediction !== null);
      
      // Calculate influence scores using LIME
      const influences = this.calculateLimeInfluences(
        tokens,
        originalPrediction,
        validPerturbations,
        opts
      );
      
      // Calculate overall scores
      const overallScore = this.calculateOverallScore(influences);
      const modelConfidence = this.calculateModelConfidence(originalPrediction);
      
      const result: TokenInfluenceResult = {
        originalPrompt: prompt,
        tokens: influences,
        overallScore,
        analysisMethod: 'LIME',
        modelConfidence,
        timestamp: startTime,
        metadata: {
          analysisTime: Date.now() - startTime,
          tokenCount: tokens.length,
          perturbationCount: validPerturbations.length
        }
      };

      // Track analytics
      this.trackAnalysisEvent('lime_analysis', result);

      logger.info('LIME analysis completed', {
        tokenCount: tokens.length,
        perturbationsUsed: validPerturbations.length,
        analysisTime: result.metadata.analysisTime,
        overallScore
      });

      return result;
    } catch (error) {
      logger.error('LIME analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        analysisTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Analyze token influence using Saliency mapping
   */
  public async analyzeSaliency(
    prompt: string,
    gradientFunction: (prompt: string) => Promise<number[]>,
    options: Partial<SaliencyAnalysisOptions> = {}
  ): Promise<TokenInfluenceResult> {

    const startTime = Date.now();
    
    const opts: SaliencyAnalysisOptions = {
      gradientMethod: options.gradientMethod || 'vanilla',
      baselineStrategy: options.baselineStrategy || 'zero',
      numSteps: options.numSteps || 50,
      noiseLevel: options.noiseLevel || 0.1,
      aggregationMethod: options.aggregationMethod || 'mean'
    };

    logger.info('Starting Saliency analysis for token influence', {
      promptLength: prompt.length,
      gradientMethod: opts.gradientMethod,
      baselineStrategy: opts.baselineStrategy
    });

    try {
      // Tokenize the prompt
      const tokens = this.tokenizePrompt(prompt);
      
      // Calculate saliency scores based on method
      let saliencyScores: number[];
      
      switch (opts.gradientMethod) {
      case 'integrated':
        saliencyScores = await this.calculateIntegratedGradients(
          prompt, tokens, gradientFunction, opts
        );
        break;
      case 'smoothgrad':
        saliencyScores = await this.calculateSmoothGrad(
          prompt, tokens, gradientFunction, opts
        );
        break;
      case 'vanilla':
      default:
        saliencyScores = await gradientFunction(prompt);
        break;
      }

      // Convert saliency scores to token influences
      const influences = tokens.map((token, index) => {
        const score = saliencyScores[index] || 0;
        return this.createTokenInfluence(token, index, score, 'saliency');
      });

      // Calculate overall scores
      const overallScore = this.calculateOverallScore(influences);
      
      const result: TokenInfluenceResult = {
        originalPrompt: prompt,
        tokens: influences,
        overallScore,
        analysisMethod: 'SALIENCY',
        modelConfidence: 0.5, // Placeholder for saliency
        timestamp: startTime,
        metadata: {
          analysisTime: Date.now() - startTime,
          tokenCount: tokens.length
        }
      };

      // Track analytics
      this.trackAnalysisEvent('saliency_analysis', result);

      logger.info('Saliency analysis completed', {
        tokenCount: tokens.length,
        analysisTime: result.metadata.analysisTime,
        overallScore,
        gradientMethod: opts.gradientMethod
      });

      return result;
    } catch (error) {
      logger.error('Saliency analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        analysisTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Compare multiple analysis methods
   */
  public async compareAnalysisMethods(
    prompt: string,
    predictionFunction: (prompt: string) => Promise<any>,
    gradientFunction: (prompt: string) => Promise<number[]>
  ): Promise<{
    lime: TokenInfluenceResult;
    saliency: TokenInfluenceResult;
    comparison: {
      correlation: number;
      agreement: number;
      divergentTokens: TokenInfluence[];
    };
  }> {

    logger.info('Starting comparative token influence analysis');

    const [limeResult, saliencyResult] = await Promise.all([
      this.analyzeLIME(prompt, predictionFunction),
      this.analyzeSaliency(prompt, gradientFunction)
    ]);

    const comparison = this.compareResults(limeResult, saliencyResult);

    // Track comparative analysis
    this.analyticsCollector.trackEvent({
      type: 'comparative_analysis',
      timestamp: Date.now(),
      metadata: {
        correlation: comparison.correlation,
        agreement: comparison.agreement,
        divergentCount: comparison.divergentTokens.length
      }
    });

    return {
      lime: limeResult,
      saliency: saliencyResult,
      comparison
    };
  }

  private tokenizePrompt(prompt: string): string[] {
    // Simple tokenization - in production this would use a proper tokenizer
    return prompt.split(/\s+/).filter(token => token.length > 0);
  }

  private generatePerturbations(
    prompt: string,
    tokens: string[],
    options: LimeAnalysisOptions
  ): PromptPerturbation[] {
    const perturbations: PromptPerturbation[] = [];

    for (let i = 0; i < options.numSamples; i++) {
      const perturbedTokens = [...tokens];
      const changedPositions: number[] = [];

      // Randomly select tokens to perturb
      const numChanges = Math.floor(Math.random() * tokens.length * 0.3) + 1;
      const positionsToChange = this.sampleWithoutReplacement(
        Array.from({ length: tokens.length }, (_, i) => i),
        numChanges
      );

      for (const pos of positionsToChange) {
        changedPositions.push(pos);
        
        switch (options.perturbationStrategy) {
        case 'mask':
          perturbedTokens[pos] = '[MASK]';
          break;
        case 'replace':
          perturbedTokens[pos] = this.getRandomReplacement(tokens[pos]);
          break;
        case 'reorder':
          // Swap with adjacent token if possible
          const swapPos = pos > 0 ? pos - 1 : pos + 1;
          if (swapPos < tokens.length) {
            [perturbedTokens[pos], perturbedTokens[swapPos]] = 
                [perturbedTokens[swapPos], perturbedTokens[pos]];
            changedPositions.push(swapPos);
          }
          break;
        }
      }

      const perturbedPrompt = perturbedTokens.join(' ');
      const similarity = this.calculateSimilarity(prompt, perturbedPrompt);

      perturbations.push({
        perturbedPrompt,
        changedPositions,
        similarity
      });
    }

    return perturbations;
  }

  private calculateLimeInfluences(
    tokens: string[],
    originalPrediction: any,
    perturbations: any[],
    options: LimeAnalysisOptions
  ): TokenInfluence[] {
    // Simplified LIME implementation
    // In production, this would use proper linear regression
    
    const influences: TokenInfluence[] = [];
    const originalScore = this.extractPredictionScore(originalPrediction);

    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      const token = tokens[tokenIndex];
      
      // Find perturbations that affected this token
      const relevantPerturbations = perturbations.filter(p => 
        p.changedPositions.includes(tokenIndex)
      );

      if (relevantPerturbations.length === 0) {
        influences.push(this.createTokenInfluence(token, tokenIndex, 0, 'lime'));
        continue;
      }

      // Calculate average impact when this token is changed
      const impactScores = relevantPerturbations.map(p => {
        const perturbedScore = this.extractPredictionScore(p.prediction);
        return originalScore - perturbedScore; // Positive = token contributed positively
      });

      const averageImpact = impactScores.reduce((sum, score) => sum + score, 0) / impactScores.length;
      const confidence = this.calculateConfidence(impactScores);

      influences.push(this.createTokenInfluence(token, tokenIndex, averageImpact, 'lime', confidence));
    }

    return influences;
  }

  private async calculateIntegratedGradients(
    prompt: string,
    tokens: string[],
    gradientFunction: (prompt: string) => Promise<number[]>,
    options: SaliencyAnalysisOptions
  ): Promise<number[]> {

    const baseline = this.createBaseline(prompt, tokens, options.baselineStrategy);
    const steps = options.numSteps;
    
    const integratedGrads: number[] = new Array(tokens.length).fill(0);

    for (let step = 0; step < steps; step++) {
      const alpha = step / steps;
      const interpolatedPrompt = this.interpolatePrompts(baseline, prompt, alpha);
      const gradients = await gradientFunction(interpolatedPrompt);
      
      for (let i = 0; i < tokens.length; i++) {
        integratedGrads[i] += gradients[i] / steps;
      }
    }

    // Scale by input difference
    const inputDiff = this.calculateInputDifference(baseline, prompt, tokens);
    return integratedGrads.map((grad, i) => grad * inputDiff[i]);
  }

  private async calculateSmoothGrad(
    prompt: string,
    tokens: string[],
    gradientFunction: (prompt: string) => Promise<number[]>,
    options: SaliencyAnalysisOptions
  ): Promise<number[]> {

    const numSamples = 50; // Number of noisy samples
    const smoothedGrads: number[] = new Array(tokens.length).fill(0);

    for (let sample = 0; sample < numSamples; sample++) {
      const noisyPrompt = this.addNoise(prompt, tokens, options.noiseLevel);
      const gradients = await gradientFunction(noisyPrompt);
      
      for (let i = 0; i < tokens.length; i++) {
        smoothedGrads[i] += gradients[i] / numSamples;
      }
    }

    return smoothedGrads;
  }

  private createTokenInfluence(
    token: string,
    position: number,
    score: number,
    method: string,
    confidence: number = 0.5
  ): TokenInfluence {
    const absScore = Math.abs(score);
    let importance: 'high' | 'medium' | 'low' = 'low';
    
    if (absScore > 0.7) importance = 'high';
    else if (absScore > 0.3) importance = 'medium';

    return {
      token,
      position,
      influenceScore: score,
      confidence,
      importance,
      isPositive: score > 0,
      alternatives: this.generateAlternatives(token)
    };
  }

  private generateAlternatives(token: string): string[] {
    // Simple alternatives generation - in production use word embeddings
    const alternatives = [
      token.toLowerCase(),
      token.toUpperCase(),
      token + 's',
      token.slice(0, -1)
    ].filter(alt => alt !== token && alt.length > 0);

    return alternatives.slice(0, 3);
  }

  private calculateOverallScore(influences: TokenInfluence[]): number {
    if (influences.length === 0) return 0;
    
    const totalInfluence = influences.reduce((sum, inf) => sum + Math.abs(inf.influenceScore), 0);
    return totalInfluence / influences.length;
  }

  private calculateModelConfidence(prediction: any): number {
    // Extract confidence from prediction - implementation depends on model format
    if (typeof prediction === 'object' && prediction.confidence) {
      return prediction.confidence;
    }
    return 0.5; // Default confidence
  }

  private extractPredictionScore(prediction: any): number {
    // Extract numerical score from prediction - implementation depends on model format
    if (typeof prediction === 'number') return prediction;
    if (typeof prediction === 'object' && prediction.score) return prediction.score;
    return 0;
  }

  private calculateSimilarity(prompt1: string, prompt2: string): number {
    // Simple Jaccard similarity
    const tokens1 = new Set(prompt1.split(/\s+/));
    const tokens2 = new Set(prompt2.split(/\s+/));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return intersection.size / union.size;
  }

  private calculateConfidence(scores: number[]): number {
    if (scores.length <= 1) return 0.5;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher confidence
    return Math.max(0.1, Math.min(1.0, 1 - (stdDev / Math.max(Math.abs(mean), 1))));
  }

  private compareResults(result1: TokenInfluenceResult, result2: TokenInfluenceResult) {
    const scores1 = result1.tokens.map(t => t.influenceScore);
    const scores2 = result2.tokens.map(t => t.influenceScore);
    
    const correlation = this.calculateCorrelation(scores1, scores2);
    
    // Agreement: percentage of tokens with same sign
    const agreement = scores1.reduce((count, score1, index) => {
      const score2 = scores2[index];
      return count + ((score1 > 0) === (score2 > 0) ? 1 : 0);
    }, 0) / scores1.length;

    // Find divergent tokens (large difference in scores)
    const divergentTokens: TokenInfluence[] = [];
    result1.tokens.forEach((token, index) => {
      const scoreDiff = Math.abs(token.influenceScore - scores2[index]);
      if (scoreDiff > 0.5) {
        divergentTokens.push(token);
      }
    });

    return { correlation, agreement, divergentTokens };
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private sampleWithoutReplacement<T>(array: T[], count: number): T[] {
    const result: T[] = [];
    const remaining = [...array];
    
    for (let i = 0; i < count && remaining.length > 0; i++) {
      const index = Math.floor(Math.random() * remaining.length);
      result.push(remaining.splice(index, 1)[0]);
    }
    
    return result;
  }

  private getRandomReplacement(token: string): string {
    // Simple random replacement - in production use semantic replacements
    const replacements = ['the', 'and', 'or', 'but', 'with', 'from', 'to', 'of', 'in', 'on'];
    return replacements[Math.floor(Math.random() * replacements.length)];
  }

  private createBaseline(prompt: string, tokens: string[], strategy: string): string {
    switch (strategy) {
    case 'zero':
      return '';
    case 'mask':
      return tokens.map(() => '[MASK]').join(' ');
    case 'random':
      return tokens.map(() => this.getRandomReplacement('')).join(' ');
    default:
      return '';
    }
  }

  private interpolatePrompts(baseline: string, prompt: string, alpha: number): string {
    // Simple linear interpolation - in production use embedding interpolation
    if (alpha === 0) return baseline;
    if (alpha === 1) return prompt;
    
    const baseTokens = baseline.split(/\s+/).filter(t => t.length > 0);
    const promptTokens = prompt.split(/\s+/).filter(t => t.length > 0);
    
    const maxLength = Math.max(baseTokens.length, promptTokens.length);
    const interpolated: string[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      const baseToken = baseTokens[i] || '';
      const promptToken = promptTokens[i] || '';
      
      // Simple interpolation: use prompt token if alpha > threshold
      interpolated.push(Math.random() < alpha ? promptToken : baseToken);
    }
    
    return interpolated.filter(t => t.length > 0).join(' ');
  }

  private calculateInputDifference(baseline: string, prompt: string, tokens: string[]): number[] {
    // Calculate difference between baseline and prompt for each token
    const baseTokens = baseline.split(/\s+/).filter(t => t.length > 0);
    const promptTokens = prompt.split(/\s+/).filter(t => t.length > 0);
    
    return tokens.map((token, i) => {
      const baseToken = baseTokens[i] || '';
      const promptToken = promptTokens[i] || token;
      
      return baseToken === promptToken ? 0 : 1;
    });
  }

  private addNoise(prompt: string, tokens: string[], noiseLevel: number): string {
    // Add noise to tokens for SmoothGrad
    return tokens.map(token => {
      if (Math.random() < noiseLevel) {
        // Simple character-level noise
        const chars = token.split('');
        const noiseIndex = Math.floor(Math.random() * chars.length);
        chars[noiseIndex] = String.fromCharCode(
          chars[noiseIndex].charCodeAt(0) + Math.floor(Math.random() * 3) - 1
        );
        return chars.join('');
      }
      return token;
    }).join(' ');
  }

  private trackAnalysisEvent(eventType: string, result: TokenInfluenceResult): void {
    this.analyticsCollector.trackEvent({
      type: eventType,
      timestamp: result.timestamp,
      metadata: {
        method: result.analysisMethod,
        tokenCount: result.metadata.tokenCount,
        analysisTime: result.metadata.analysisTime,
        overallScore: result.overallScore,
        highInfluenceTokens: result.tokens.filter(t => t.importance === 'high').length
      }
    });
  }
}

export default TokenInfluenceAnalyzer;