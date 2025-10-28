#!/usr/bin/env node

/**
 * Task Estimation Improver
 *
 * Learns from completion times vs estimates to suggest accurate time estimates
 * using machine learning and historical data analysis.
 *
 * Key Features:
 * - Historical data analysis and pattern recognition
 * - Machine learning models for estimation accuracy
 * - Agent-specific estimation patterns and adjustments
 * - Task complexity analysis and categorization
 * - Real-time estimation suggestions and confidence scores
 * - Continuous learning from new completion data
 * - Estimation accuracy tracking and improvement metrics
 */

const fs = require('fs').promises;
const path = require('path');

class TaskEstimationImprover {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/estimation');
    this.stateFile = path.join(__dirname, '../data/state.json');
    this.modelsFile = path.join(this.dataDir, 'estimation-models.json');
    this.historyFile = path.join(this.dataDir, 'estimation-history.json');
    this.metricsFile = path.join(this.dataDir, 'estimation-metrics.json');
    this.patternsFile = path.join(this.dataDir, 'estimation-patterns.json');

    // Configuration for estimation improvement
    this.config = {
      learning: {
        // Data requirements
        minimumSamples: 10, // Minimum samples needed for reliable estimation
        trainingWindowDays: 90, // Days of data to use for training
        retrainInterval: 24 * 60 * 60 * 1000, // Retrain every 24 hours

        // Feature weights
        taskComplexityWeight: 0.3, // Weight for task complexity features
        agentExperienceWeight: 0.2, // Weight for agent experience
        historicalAccuracyWeight: 0.3, // Weight for historical accuracy
        contextWeight: 0.2, // Weight for contextual factors

        // Learning parameters
        learningRate: 0.01, // Rate of model adjustment
        confidenceThreshold: 0.7, // Minimum confidence for suggestions
        outlierThreshold: 3.0, // Standard deviations for outlier detection

        // Model validation
        testDataPercentage: 0.2, // 20% of data for testing
        crossValidationFolds: 5, // K-fold cross validation
        minimumAccuracy: 0.6 // Minimum acceptable model accuracy
      },

      features: {
        // Task characteristics
        taskFeatures: [
          'wordCount', // Number of words in description
          'acceptanceCriteriaCount', // Number of acceptance criteria
          'tagCount', // Number of tags
          'priorityLevel', // Priority as numeric value
          'epicComplexity', // Epic-level complexity score
          'dependencyCount', // Number of dependencies
          'fileCount', // Estimated number of files to change
          'newFeatureFlag', // Boolean: is this a new feature
          'bugFixFlag', // Boolean: is this a bug fix
          'refactorFlag', // Boolean: is this refactoring
          'testingFlag' // Boolean: is this testing work
        ],

        // Agent characteristics
        agentFeatures: [
          'experienceLevel', // Agent experience level (1-5)
          'domainExpertise', // Expertise in relevant domain
          'velocityScore', // Historical velocity score
          'accuracyScore', // Historical estimation accuracy
          'currentWorkload', // Current task load
          'recentPerformance' // Recent performance trend
        ],

        // Contextual features
        contextFeatures: [
          'timeOfDay', // Hour of day when estimated
          'dayOfWeek', // Day of week
          'quarterOfYear', // Business quarter
          'teamVelocity', // Current team velocity
          'projectPhase', // Project phase (planning, dev, testing, etc.)
          'pressureLevel' // Time pressure level
        ]
      },

      models: {
        // Model types to use
        primary: 'ensemble', // Primary model type
        ensemble: {
          models: ['linear', 'polynomial', 'exponential'],
          weights: [0.4, 0.4, 0.2] // Weights for ensemble combination
        },

        // Model parameters
        linearRegression: {
          regularization: 0.01, // L2 regularization factor
          maxIterations: 1000
        },

        polynomialRegression: {
          degree: 2, // Polynomial degree
          regularization: 0.05
        },

        exponentialModel: {
          baseRate: 1.1, // Base exponential rate
          smoothingFactor: 0.3
        }
      },

      suggestions: {
        // Suggestion parameters
        confidenceLevels: {
          high: 0.85, // High confidence threshold
          medium: 0.65, // Medium confidence threshold
          low: 0.45 // Low confidence threshold
        },

        // Adjustment factors
        adjustmentFactors: {
          complexity: [0.7, 1.0, 1.3, 1.6, 2.0], // Multipliers by complexity level
          experience: [1.4, 1.2, 1.0, 0.9, 0.8], // Multipliers by experience level
          workload: [0.9, 1.0, 1.1, 1.3, 1.5] // Multipliers by workload level
        },

        // Output formatting
        roundToNearest: 0.5, // Round estimates to nearest 0.5 hours
        minimumEstimate: 0.5, // Minimum estimate (30 minutes)
        maximumEstimate: 40, // Maximum estimate (40 hours)
        includeRange: true, // Include estimate range (min-max)
        includeRecommendations: true // Include improvement recommendations
      }
    };

    this.models = new Map();
    this.estimationHistory = [];
    this.patterns = {
      agentPatterns: new Map(),
      taskPatterns: new Map(),
      contextPatterns: new Map()
    };
    this.metrics = {
      overallAccuracy: 0,
      modelPerformance: {},
      improvementTrend: [],
      lastTraining: null,
      totalPredictions: 0,
      accuratePredictions: 0
    };
  }

  /**
   * Initialize the estimation improver
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadExistingData();
      await this.loadModels();

      // Schedule automatic retraining
      this.scheduleRetraining();

      console.log('✅ Task Estimation Improver initialized');
      console.log(
        `📊 Loaded ${this.estimationHistory.length} historical estimates`
      );
      console.log(
        `🎯 Overall accuracy: ${(this.metrics.overallAccuracy * 100).toFixed(1)}%`
      );
    } catch (error) {
      console.error('❌ Failed to initialize Task Estimation Improver:', error);
      throw error;
    }
  }

  /**
   * Get estimation suggestion for a task
   */
  async getEstimationSuggestion(taskData, agentData = null) {
    console.log(`🔮 Generating estimation for task: ${taskData.id}`);

    try {
      // Extract features from task and context
      const features = this.extractFeatures(taskData, agentData);

      // Get predictions from all models
      const predictions = await this.generatePredictions(features);

      // Calculate ensemble prediction
      const ensemblePrediction = this.calculateEnsemblePrediction(predictions);

      // Apply adjustments and constraints
      const adjustedEstimate = this.applyAdjustments(
        ensemblePrediction,
        features
      );

      // Calculate confidence score
      const confidence = this.calculateConfidence(predictions, features);

      // Generate estimate range
      const estimateRange = this.calculateEstimateRange(
        adjustedEstimate,
        confidence
      );

      // Create suggestion object
      const suggestion = {
        taskId: taskData.id,
        estimatedHours: this.roundEstimate(adjustedEstimate),
        range: {
          min: this.roundEstimate(estimateRange.min),
          max: this.roundEstimate(estimateRange.max)
        },
        confidence: confidence,
        confidenceLevel: this.getConfidenceLevel(confidence),
        features: features,
        predictions: predictions,
        reasoning: this.generateReasoning(
          features,
          adjustedEstimate,
          confidence
        ),
        recommendations: this.generateRecommendations(features, confidence),
        timestamp: new Date().toISOString(),
        modelVersion: this.getModelVersion()
      };

      // Store suggestion for future learning
      await this.storeSuggestion(suggestion);

      console.log(
        `📈 Estimate: ${suggestion.estimatedHours}h (${suggestion.range.min}-${suggestion.range.max}h)`
      );
      console.log(
        `🎯 Confidence: ${(confidence * 100).toFixed(1)}% (${suggestion.confidenceLevel})`
      );

      return suggestion;
    } catch (error) {
      console.error(
        `❌ Failed to generate estimation for task ${taskData.id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Record actual completion time for learning
   */
  async recordCompletion(taskId, actualHours, agentId = null, metadata = {}) {
    console.log(`📝 Recording completion: ${taskId} took ${actualHours}h`);

    try {
      // Find the original suggestion
      const suggestion = this.estimationHistory.find(
        s => s.taskId === taskId && s.type === 'suggestion'
      );

      // Create completion record
      const completion = {
        taskId,
        actualHours,
        agentId,
        completedAt: new Date().toISOString(),
        metadata,
        type: 'completion'
      };

      // Calculate accuracy if we had a suggestion
      if (suggestion) {
        const estimatedHours = suggestion.estimatedHours;
        const accuracy = this.calculateAccuracy(estimatedHours, actualHours);
        const withinRange =
          actualHours >= suggestion.range.min &&
          actualHours <= suggestion.range.max;

        completion.originalEstimate = estimatedHours;
        completion.estimateRange = suggestion.range;
        completion.accuracy = accuracy;
        completion.withinRange = withinRange;
        completion.confidence = suggestion.confidence;

        // Update metrics
        this.updateAccuracyMetrics(accuracy);

        console.log(`📊 Estimation accuracy: ${(accuracy * 100).toFixed(1)}%`);
        console.log(`🎯 Within range: ${withinRange ? 'Yes' : 'No'}`);
      }

      // Store completion record
      this.estimationHistory.push(completion);

      // Update patterns
      await this.updatePatterns(completion, suggestion);

      // Save data
      await this.saveHistory();
      await this.saveMetrics();

      // Trigger retraining if we have enough new data
      await this.checkRetrainingNeeds();

      return completion;
    } catch (error) {
      console.error(
        `❌ Failed to record completion for task ${taskId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Train estimation models with historical data
   */
  async trainModels() {
    console.log('🧠 Training estimation models...');

    try {
      // Get training data
      const trainingData = this.prepareTrainingData();

      if (trainingData.length < this.config.learning.minimumSamples) {
        console.log(
          `⚠️  Insufficient training data (${trainingData.length} samples, need ${this.config.learning.minimumSamples})`
        );
        return false;
      }

      // Split data into training and testing sets
      const { trainSet, testSet } = this.splitTrainingData(trainingData);

      console.log(
        `📚 Training with ${trainSet.length} samples, testing with ${testSet.length} samples`
      );

      // Train each model type
      const modelResults = {};

      // Linear regression model
      modelResults.linear = await this.trainLinearModel(trainSet, testSet);

      // Polynomial regression model
      modelResults.polynomial = await this.trainPolynomialModel(
        trainSet,
        testSet
      );

      // Exponential model
      modelResults.exponential = await this.trainExponentialModel(
        trainSet,
        testSet
      );

      // Evaluate model performance
      const evaluation = this.evaluateModels(modelResults, testSet);

      // Store best performing models
      this.models.set('linear', modelResults.linear);
      this.models.set('polynomial', modelResults.polynomial);
      this.models.set('exponential', modelResults.exponential);

      // Update metrics
      this.metrics.modelPerformance = evaluation;
      this.metrics.lastTraining = new Date().toISOString();
      this.metrics.overallAccuracy = evaluation.ensemble.accuracy;

      // Save models and metrics
      await this.saveModels();
      await this.saveMetrics();

      console.log('✅ Model training complete:');
      console.log(
        `   Linear model accuracy: ${(evaluation.linear.accuracy * 100).toFixed(1)}%`
      );
      console.log(
        `   Polynomial model accuracy: ${(evaluation.polynomial.accuracy * 100).toFixed(1)}%`
      );
      console.log(
        `   Exponential model accuracy: ${(evaluation.exponential.accuracy * 100).toFixed(1)}%`
      );
      console.log(
        `   Ensemble accuracy: ${(evaluation.ensemble.accuracy * 100).toFixed(1)}%`
      );

      return true;
    } catch (error) {
      console.error('❌ Model training failed:', error);
      throw error;
    }
  }

  /**
   * Extract features from task and context
   */
  extractFeatures(taskData, agentData = null) {
    const features = {};

    // Task features
    features.wordCount = this.countWords(
      taskData.title + ' ' + (taskData.description || '')
    );
    features.acceptanceCriteriaCount = (
      taskData.acceptanceCriteria || []
    ).length;
    features.tagCount = (taskData.tags || []).length;
    features.priorityLevel = this.encodePriority(taskData.priority);
    features.epicComplexity = this.calculateEpicComplexity(taskData.epic);
    features.dependencyCount = (taskData.dependencies || []).length;
    features.fileCount = this.estimateFileCount(taskData);

    // Task type flags
    const description = (
      taskData.title +
      ' ' +
      (taskData.description || '')
    ).toLowerCase();
    features.newFeatureFlag =
      description.includes('new') || description.includes('feature') ? 1 : 0;
    features.bugFixFlag =
      description.includes('bug') || description.includes('fix') ? 1 : 0;
    features.refactorFlag =
      description.includes('refactor') || description.includes('improve')
        ? 1
        : 0;
    features.testingFlag =
      description.includes('test') || description.includes('testing') ? 1 : 0;

    // Agent features (if provided)
    if (agentData) {
      features.experienceLevel = this.encodeExperience(agentData.experience);
      features.domainExpertise = this.calculateDomainExpertise(
        agentData,
        taskData
      );
      features.velocityScore = agentData.performance?.velocity || 1.0;
      features.accuracyScore = agentData.accuracyScore || 1.0;
      features.currentWorkload = agentData.utilizationRate || 0.5;
      features.recentPerformance = this.calculateRecentPerformance(agentData);
    } else {
      // Default agent features
      features.experienceLevel = 3; // Intermediate
      features.domainExpertise = 0.5;
      features.velocityScore = 1.0;
      features.accuracyScore = 1.0;
      features.currentWorkload = 0.5;
      features.recentPerformance = 1.0;
    }

    // Context features
    const now = new Date();
    features.timeOfDay = now.getHours();
    features.dayOfWeek = now.getDay();
    features.quarterOfYear = Math.floor(now.getMonth() / 3) + 1;
    features.teamVelocity = this.calculateTeamVelocity();
    features.projectPhase = this.determineProjectPhase();
    features.pressureLevel = this.calculatePressureLevel(taskData);

    return features;
  }

  /**
   * Generate predictions from all models
   */
  async generatePredictions(features) {
    const predictions = {};

    // Linear model prediction
    if (this.models.has('linear')) {
      predictions.linear = this.predictLinear(features);
    }

    // Polynomial model prediction
    if (this.models.has('polynomial')) {
      predictions.polynomial = this.predictPolynomial(features);
    }

    // Exponential model prediction
    if (this.models.has('exponential')) {
      predictions.exponential = this.predictExponential(features);
    }

    // Pattern-based prediction
    predictions.pattern = this.predictFromPatterns(features);

    // Historical similarity prediction
    predictions.similarity = this.predictFromSimilarity(features);

    return predictions;
  }

  /**
   * Calculate ensemble prediction
   */
  calculateEnsemblePrediction(predictions) {
    const weights = this.config.models.ensemble.weights;
    const models = this.config.models.ensemble.models;

    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < models.length; i++) {
      const modelName = models[i];
      const weight = weights[i];

      if (
        predictions[modelName] !== undefined &&
        !isNaN(predictions[modelName])
      ) {
        weightedSum += predictions[modelName] * weight;
        totalWeight += weight;
      }
    }

    // Include pattern and similarity predictions with lower weights
    if (predictions.pattern !== undefined) {
      weightedSum += predictions.pattern * 0.1;
      totalWeight += 0.1;
    }

    if (predictions.similarity !== undefined) {
      weightedSum += predictions.similarity * 0.1;
      totalWeight += 0.1;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 4; // Default 4 hours
  }

  /**
   * Apply adjustments based on features
   */
  applyAdjustments(baseEstimate, features) {
    let adjusted = baseEstimate;

    // Apply complexity adjustment
    const complexityLevel = this.determineComplexityLevel(features);
    adjusted *=
      this.config.suggestions.adjustmentFactors.complexity[complexityLevel];

    // Apply experience adjustment
    const experienceLevel = Math.round(features.experienceLevel) - 1;
    if (experienceLevel >= 0 && experienceLevel < 5) {
      adjusted *=
        this.config.suggestions.adjustmentFactors.experience[experienceLevel];
    }

    // Apply workload adjustment
    const workloadLevel = Math.floor(features.currentWorkload * 5);
    if (workloadLevel >= 0 && workloadLevel < 5) {
      adjusted *=
        this.config.suggestions.adjustmentFactors.workload[workloadLevel];
    }

    // Apply constraints
    adjusted = Math.max(this.config.suggestions.minimumEstimate, adjusted);
    adjusted = Math.min(this.config.suggestions.maximumEstimate, adjusted);

    return adjusted;
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(predictions, features) {
    // Calculate prediction variance
    const values = Object.values(predictions).filter(v => !isNaN(v) && v > 0);
    if (values.length === 0) return 0.5;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;

    // Lower variance = higher confidence
    let confidence = Math.max(0, 1 - coefficientOfVariation);

    // Adjust confidence based on data quality
    const dataQuality = this.assessDataQuality(features);
    confidence *= dataQuality;

    // Adjust confidence based on historical accuracy
    if (this.metrics.overallAccuracy > 0) {
      confidence *= 0.5 + this.metrics.overallAccuracy * 0.5;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate estimate range
   */
  calculateEstimateRange(estimate, confidence) {
    const uncertaintyFactor = 1 - confidence;
    const range = estimate * uncertaintyFactor * 0.5; // 50% range based on uncertainty

    return {
      min: Math.max(this.config.suggestions.minimumEstimate, estimate - range),
      max: Math.min(this.config.suggestions.maximumEstimate, estimate + range)
    };
  }

  /**
   * Train linear regression model
   */
  async trainLinearModel(trainSet, testSet) {
    const model = {
      type: 'linear',
      weights: {},
      intercept: 0,
      trained: new Date().toISOString()
    };

    // Simple linear regression implementation
    const features = this.getFeatureNames(trainSet);

    // Initialize weights
    features.forEach(feature => {
      model.weights[feature] = Math.random() * 0.1 - 0.05; // Small random weights
    });

    // Gradient descent training
    const learningRate = this.config.learning.learningRate;
    const iterations = this.config.models.linearRegression.maxIterations;

    for (let iter = 0; iter < iterations; iter++) {
      let totalError = 0;
      const gradients = {};
      let interceptGradient = 0;

      // Initialize gradients
      features.forEach(feature => (gradients[feature] = 0));

      // Calculate gradients
      for (const sample of trainSet) {
        const prediction = this.predictLinearSample(sample.features, model);
        const error = prediction - sample.target;
        totalError += error * error;

        // Update gradients
        features.forEach(feature => {
          gradients[feature] += error * (sample.features[feature] || 0);
        });
        interceptGradient += error;
      }

      // Update weights
      features.forEach(feature => {
        model.weights[feature] -=
          (learningRate * gradients[feature]) / trainSet.length;
      });
      model.intercept -= (learningRate * interceptGradient) / trainSet.length;

      // Check convergence
      const meanSquaredError = totalError / trainSet.length;
      if (meanSquaredError < 0.001) break;
    }

    // Test model
    model.accuracy = this.testLinearModel(model, testSet);

    return model;
  }

  /**
   * Train polynomial regression model
   */
  async trainPolynomialModel(trainSet, testSet) {
    // Extend features with polynomial terms
    const extendedTrainSet = trainSet.map(sample => ({
      features: this.createPolynomialFeatures(sample.features),
      target: sample.target
    }));

    const extendedTestSet = testSet.map(sample => ({
      features: this.createPolynomialFeatures(sample.features),
      target: sample.target
    }));

    // Train linear model on extended features
    const baseModel = await this.trainLinearModel(
      extendedTrainSet,
      extendedTestSet
    );

    return {
      type: 'polynomial',
      baseModel,
      degree: this.config.models.polynomialRegression.degree,
      trained: new Date().toISOString(),
      accuracy: baseModel.accuracy
    };
  }

  /**
   * Train exponential model
   */
  async trainExponentialModel(trainSet, testSet) {
    const model = {
      type: 'exponential',
      baseRate: this.config.models.exponentialModel.baseRate,
      complexityFactor: 1.2,
      experienceFactor: 0.8,
      trained: new Date().toISOString()
    };

    // Simple parameter optimization
    let bestAccuracy = 0;
    let bestParams = { ...model };

    // Grid search over parameter space
    for (let baseRate = 1.05; baseRate <= 1.2; baseRate += 0.05) {
      for (
        let complexityFactor = 1.1;
        complexityFactor <= 1.4;
        complexityFactor += 0.1
      ) {
        for (
          let experienceFactor = 0.7;
          experienceFactor <= 0.9;
          experienceFactor += 0.1
        ) {
          const testModel = {
            ...model,
            baseRate,
            complexityFactor,
            experienceFactor
          };
          const accuracy = this.testExponentialModel(testModel, testSet);

          if (accuracy > bestAccuracy) {
            bestAccuracy = accuracy;
            bestParams = { ...testModel };
          }
        }
      }
    }

    bestParams.accuracy = bestAccuracy;
    return bestParams;
  }

  // Prediction methods

  predictLinear(features) {
    const model = this.models.get('linear');
    if (!model) return 4; // Default

    return this.predictLinearSample(features, model);
  }

  predictLinearSample(features, model) {
    let prediction = model.intercept;

    for (const [feature, weight] of Object.entries(model.weights)) {
      prediction += weight * (features[feature] || 0);
    }

    return Math.max(0, prediction);
  }

  predictPolynomial(features) {
    const model = this.models.get('polynomial');
    if (!model) return 4; // Default

    const polynomialFeatures = this.createPolynomialFeatures(features);
    return this.predictLinearSample(polynomialFeatures, model.baseModel);
  }

  predictExponential(features) {
    const model = this.models.get('exponential');
    if (!model) return 4; // Default

    const complexity = this.determineComplexityLevel(features);
    const experience = features.experienceLevel || 3;

    let estimate =
      Math.pow(model.baseRate, complexity) * model.complexityFactor;
    estimate *= Math.pow(model.experienceFactor, experience - 1);

    return estimate;
  }

  predictFromPatterns(features) {
    // Find similar patterns in historical data
    const similarTasks = this.findSimilarTasks(features);

    if (similarTasks.length === 0) return 4; // Default

    // Average the completion times of similar tasks
    const totalHours = similarTasks.reduce(
      (sum, task) => sum + task.actualHours,
      0
    );
    return totalHours / similarTasks.length;
  }

  predictFromSimilarity(features) {
    // Use k-nearest neighbors approach
    const k = 5;
    const neighbors = this.findKNearestNeighbors(features, k);

    if (neighbors.length === 0) return 4; // Default

    // Weighted average based on similarity
    let weightedSum = 0;
    let totalWeight = 0;

    for (const neighbor of neighbors) {
      const weight = neighbor.similarity;
      weightedSum += neighbor.actualHours * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 4;
  }

  // Helper methods

  countWords(text) {
    return (text || '').split(/\s+/).filter(word => word.length > 0).length;
  }

  encodePriority(priority) {
    const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
    return priorities[priority] || 2;
  }

  encodeExperience(experience) {
    const levels = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
      senior: 5
    };
    return levels[experience] || 2;
  }

  calculateEpicComplexity(epic) {
    // Simple epic complexity scoring
    if (!epic) return 1;

    const complexEpics = [
      'security',
      'performance',
      'architecture',
      'migration'
    ];
    return complexEpics.some(keyword => epic.toLowerCase().includes(keyword))
      ? 3
      : 2;
  }

  estimateFileCount(taskData) {
    const description = (
      taskData.title +
      ' ' +
      (taskData.description || '')
    ).toLowerCase();

    // Simple heuristics for file count estimation
    if (description.includes('new feature')) return 5;
    if (description.includes('refactor')) return 3;
    if (description.includes('bug fix')) return 1;
    if (description.includes('test')) return 2;

    return 2; // Default
  }

  calculateDomainExpertise(agentData, taskData) {
    // Calculate agent's expertise in the task's domain
    const taskDomains = this.extractTaskDomains(taskData);
    const agentSkills = agentData.skills || {};

    let totalExpertise = 0;
    let domainCount = 0;

    for (const domain of taskDomains) {
      if (agentSkills[domain]) {
        totalExpertise += agentSkills[domain];
        domainCount++;
      }
    }

    return domainCount > 0 ? totalExpertise / domainCount / 4 : 0.5; // Normalize to 0-1
  }

  extractTaskDomains(taskData) {
    const text = (
      taskData.title +
      ' ' +
      (taskData.description || '')
    ).toLowerCase();
    const domains = [
      'frontend',
      'backend',
      'database',
      'testing',
      'devops',
      'mobile',
      'api',
      'ui'
    ];

    return domains.filter(domain => text.includes(domain));
  }

  calculateRecentPerformance(agentData) {
    // Simple recent performance calculation
    return agentData.performance?.velocity || 1.0;
  }

  calculateTeamVelocity() {
    // Placeholder for team velocity calculation
    return 1.0;
  }

  determineProjectPhase() {
    // Placeholder for project phase determination
    return 'development';
  }

  calculatePressureLevel(taskData) {
    const priority = taskData.priority || 'medium';
    const pressureLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    return pressureLevels[priority] || 2;
  }

  determineComplexityLevel(features) {
    let complexity = 0;

    // Word count contribution
    if (features.wordCount > 100) complexity++;
    if (features.wordCount > 200) complexity++;

    // Acceptance criteria contribution
    if (features.acceptanceCriteriaCount > 3) complexity++;
    if (features.acceptanceCriteriaCount > 6) complexity++;

    // Feature flags contribution
    if (features.newFeatureFlag) complexity++;
    if (features.refactorFlag) complexity++;

    // Dependency contribution
    if (features.dependencyCount > 2) complexity++;

    return Math.min(complexity, 4); // Cap at level 4
  }

  roundEstimate(estimate) {
    const roundTo = this.config.suggestions.roundToNearest;
    return Math.round(estimate / roundTo) * roundTo;
  }

  getConfidenceLevel(confidence) {
    const levels = this.config.suggestions.confidenceLevels;

    if (confidence >= levels.high) return 'high';
    if (confidence >= levels.medium) return 'medium';
    if (confidence >= levels.low) return 'low';
    return 'very_low';
  }

  generateReasoning(features, estimate, confidence) {
    const reasons = [];

    // Task complexity reasoning
    const complexity = this.determineComplexityLevel(features);
    if (complexity >= 3) {
      reasons.push(
        'High task complexity detected based on description length and requirements'
      );
    } else if (complexity <= 1) {
      reasons.push(
        'Low task complexity suggests straightforward implementation'
      );
    }

    // Agent experience reasoning
    if (features.experienceLevel >= 4) {
      reasons.push('Experienced agent should complete task more efficiently');
    } else if (features.experienceLevel <= 2) {
      reasons.push('Less experienced agent may need additional time');
    }

    // Workload reasoning
    if (features.currentWorkload > 0.8) {
      reasons.push('High current workload may slow completion');
    } else if (features.currentWorkload < 0.3) {
      reasons.push('Low current workload allows focused attention');
    }

    // Historical data reasoning
    if (this.estimationHistory.length > 50) {
      reasons.push(
        `Based on analysis of ${this.estimationHistory.length} historical tasks`
      );
    }

    // Confidence reasoning
    if (confidence < 0.5) {
      reasons.push('Low confidence due to limited similar historical data');
    } else if (confidence > 0.8) {
      reasons.push('High confidence based on strong historical patterns');
    }

    return reasons;
  }

  generateRecommendations(features, confidence) {
    const recommendations = [];

    // Confidence-based recommendations
    if (confidence < 0.6) {
      recommendations.push(
        'Consider breaking down into smaller, more estimatable tasks'
      );
      recommendations.push('Gather more detailed requirements before starting');
    }

    // Complexity-based recommendations
    const complexity = this.determineComplexityLevel(features);
    if (complexity >= 3) {
      recommendations.push('Plan for code review and testing time');
      recommendations.push('Consider pair programming for complex parts');
    }

    // Experience-based recommendations
    if (features.experienceLevel <= 2) {
      recommendations.push('Plan time for research and learning');
      recommendations.push('Consider mentoring or code review');
    }

    // Workload-based recommendations
    if (features.currentWorkload > 0.8) {
      recommendations.push('Consider deferring until workload decreases');
      recommendations.push('Factor in context switching overhead');
    }

    return recommendations;
  }

  // Data preparation and model evaluation methods

  prepareTrainingData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(
      cutoffDate.getDate() - this.config.learning.trainingWindowDays
    );

    // Get completion records with original estimates
    const completions = this.estimationHistory.filter(
      record =>
        record.type === 'completion' &&
        record.originalEstimate !== undefined &&
        new Date(record.completedAt) > cutoffDate
    );

    return completions.map(completion => {
      // Reconstruct features (simplified)
      const features =
        completion.features || this.reconstructFeatures(completion);

      return {
        features,
        target: completion.actualHours,
        weight: this.calculateSampleWeight(completion)
      };
    });
  }

  splitTrainingData(data) {
    const testSize = Math.floor(
      data.length * this.config.learning.testDataPercentage
    );
    const shuffled = [...data].sort(() => Math.random() - 0.5);

    return {
      trainSet: shuffled.slice(testSize),
      testSet: shuffled.slice(0, testSize)
    };
  }

  evaluateModels(modelResults, testSet) {
    const evaluation = {};

    // Evaluate each model
    for (const [modelName, model] of Object.entries(modelResults)) {
      evaluation[modelName] = {
        accuracy: model.accuracy,
        mse: this.calculateMSE(model, testSet),
        mae: this.calculateMAE(model, testSet)
      };
    }

    // Evaluate ensemble
    const ensemblePredictions = testSet.map(sample => {
      const predictions = {};
      predictions.linear = this.predictLinearSample(
        sample.features,
        modelResults.linear
      );
      predictions.polynomial = this.predictLinearSample(
        this.createPolynomialFeatures(sample.features),
        modelResults.polynomial.baseModel
      );
      predictions.exponential = this.predictExponentialSample(
        sample.features,
        modelResults.exponential
      );

      return this.calculateEnsemblePrediction(predictions);
    });

    const ensembleAccuracy = this.calculateAccuracyFromPredictions(
      ensemblePredictions,
      testSet.map(s => s.target)
    );

    evaluation.ensemble = {
      accuracy: ensembleAccuracy,
      mse: this.calculateMSEFromPredictions(
        ensemblePredictions,
        testSet.map(s => s.target)
      ),
      mae: this.calculateMAEFromPredictions(
        ensemblePredictions,
        testSet.map(s => s.target)
      )
    };

    return evaluation;
  }

  // Accuracy and error calculation methods

  calculateAccuracy(estimated, actual) {
    if (actual === 0) return estimated === 0 ? 1 : 0;

    const error = Math.abs(estimated - actual) / actual;
    return Math.max(0, 1 - error);
  }

  calculateAccuracyFromPredictions(predictions, actuals) {
    if (predictions.length !== actuals.length || predictions.length === 0)
      return 0;

    let totalAccuracy = 0;
    for (let i = 0; i < predictions.length; i++) {
      totalAccuracy += this.calculateAccuracy(predictions[i], actuals[i]);
    }

    return totalAccuracy / predictions.length;
  }

  calculateMSE(model, testSet) {
    let sumSquaredError = 0;

    for (const sample of testSet) {
      const prediction = this.predictWithModel(model, sample.features);
      const error = prediction - sample.target;
      sumSquaredError += error * error;
    }

    return sumSquaredError / testSet.length;
  }

  calculateMAE(model, testSet) {
    let sumAbsoluteError = 0;

    for (const sample of testSet) {
      const prediction = this.predictWithModel(model, sample.features);
      const error = Math.abs(prediction - sample.target);
      sumAbsoluteError += error;
    }

    return sumAbsoluteError / testSet.length;
  }

  calculateMSEFromPredictions(predictions, actuals) {
    if (predictions.length !== actuals.length) return Infinity;

    let sumSquaredError = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - actuals[i];
      sumSquaredError += error * error;
    }

    return sumSquaredError / predictions.length;
  }

  calculateMAEFromPredictions(predictions, actuals) {
    if (predictions.length !== actuals.length) return Infinity;

    let sumAbsoluteError = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = Math.abs(predictions[i] - actuals[i]);
      sumAbsoluteError += error;
    }

    return sumAbsoluteError / predictions.length;
  }

  predictWithModel(model, features) {
    switch (model.type) {
      case 'linear':
        return this.predictLinearSample(features, model);
      case 'polynomial':
        return this.predictLinearSample(
          this.createPolynomialFeatures(features),
          model.baseModel
        );
      case 'exponential':
        return this.predictExponentialSample(features, model);
      default:
        return 4; // Default
    }
  }

  predictExponentialSample(features, model) {
    const complexity = this.determineComplexityLevel(features);
    const experience = features.experienceLevel || 3;

    let estimate =
      Math.pow(model.baseRate, complexity) * model.complexityFactor;
    estimate *= Math.pow(model.experienceFactor, experience - 1);

    return estimate;
  }

  testLinearModel(model, testSet) {
    const predictions = testSet.map(sample =>
      this.predictLinearSample(sample.features, model)
    );
    const actuals = testSet.map(sample => sample.target);

    return this.calculateAccuracyFromPredictions(predictions, actuals);
  }

  testExponentialModel(model, testSet) {
    const predictions = testSet.map(sample =>
      this.predictExponentialSample(sample.features, model)
    );
    const actuals = testSet.map(sample => sample.target);

    return this.calculateAccuracyFromPredictions(predictions, actuals);
  }

  // Utility methods

  createPolynomialFeatures(features) {
    const polynomial = { ...features };
    const degree = this.config.models.polynomialRegression.degree;

    // Add squared terms
    if (degree >= 2) {
      for (const [key, value] of Object.entries(features)) {
        if (typeof value === 'number') {
          polynomial[`${key}_squared`] = value * value;
        }
      }
    }

    // Add interaction terms for key features
    const keyFeatures = ['wordCount', 'experienceLevel', 'priorityLevel'];
    for (let i = 0; i < keyFeatures.length; i++) {
      for (let j = i + 1; j < keyFeatures.length; j++) {
        const feature1 = keyFeatures[i];
        const feature2 = keyFeatures[j];

        if (
          features[feature1] !== undefined &&
          features[feature2] !== undefined
        ) {
          polynomial[`${feature1}_x_${feature2}`] =
            features[feature1] * features[feature2];
        }
      }
    }

    return polynomial;
  }

  getFeatureNames(trainSet) {
    const featureSet = new Set();

    for (const sample of trainSet) {
      for (const feature of Object.keys(sample.features)) {
        featureSet.add(feature);
      }
    }

    return Array.from(featureSet);
  }

  calculateSampleWeight(completion) {
    // Weight samples based on recency and confidence
    const daysAgo =
      (Date.now() - new Date(completion.completedAt)) / (1000 * 60 * 60 * 24);
    const timeWeight = Math.exp(-daysAgo / 30); // Exponential decay over 30 days

    const confidenceWeight = completion.confidence || 0.5;

    return timeWeight * confidenceWeight;
  }

  reconstructFeatures(completion) {
    // Reconstruct features from completion record (simplified)
    return {
      wordCount: 50,
      acceptanceCriteriaCount: 2,
      tagCount: 1,
      priorityLevel: 2,
      epicComplexity: 2,
      dependencyCount: 1,
      fileCount: 2,
      newFeatureFlag: 0,
      bugFixFlag: 1,
      refactorFlag: 0,
      testingFlag: 0,
      experienceLevel: 3,
      domainExpertise: 0.5,
      velocityScore: 1.0,
      accuracyScore: 1.0,
      currentWorkload: 0.5,
      recentPerformance: 1.0,
      timeOfDay: 10,
      dayOfWeek: 2,
      quarterOfYear: 2,
      teamVelocity: 1.0,
      projectPhase: 'development',
      pressureLevel: 2
    };
  }

  findSimilarTasks(features) {
    // Find tasks with similar characteristics
    const threshold = 0.7;
    return this.estimationHistory
      .filter(record => record.type === 'completion' && record.features)
      .filter(
        record =>
          this.calculateSimilarity(features, record.features) > threshold
      )
      .slice(-10); // Last 10 similar tasks
  }

  findKNearestNeighbors(features, k) {
    const neighbors = this.estimationHistory
      .filter(record => record.type === 'completion' && record.features)
      .map(record => ({
        ...record,
        similarity: this.calculateSimilarity(features, record.features)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);

    return neighbors;
  }

  calculateSimilarity(features1, features2) {
    const keys = new Set([
      ...Object.keys(features1),
      ...Object.keys(features2)
    ]);
    let similarity = 0;
    let count = 0;

    for (const key of keys) {
      const val1 = features1[key] || 0;
      const val2 = features2[key] || 0;

      // Normalize to 0-1 range for comparison
      const max = Math.max(Math.abs(val1), Math.abs(val2), 1);
      const diff = Math.abs(val1 - val2) / max;

      similarity += 1 - diff;
      count++;
    }

    return count > 0 ? similarity / count : 0;
  }

  assessDataQuality(features) {
    // Assess quality of feature data
    const completeness =
      Object.values(features).filter(v => v !== undefined && v !== null)
        .length / Object.keys(features).length;

    // Check for reasonable feature values
    const reasonableness = this.checkFeatureReasonableness(features);

    return (completeness + reasonableness) / 2;
  }

  checkFeatureReasonableness(features) {
    let score = 1.0;

    // Check for unreasonable values
    if (features.wordCount > 1000) score -= 0.1; // Very long description
    if (features.experienceLevel > 5 || features.experienceLevel < 1)
      score -= 0.2;
    if (features.currentWorkload > 1.5) score -= 0.1; // Overloaded

    return Math.max(0, score);
  }

  updateAccuracyMetrics(accuracy) {
    this.metrics.totalPredictions++;
    this.metrics.accuratePredictions += accuracy;
    this.metrics.overallAccuracy =
      this.metrics.accuratePredictions / this.metrics.totalPredictions;
  }

  async updatePatterns(completion, suggestion) {
    // Update agent-specific patterns
    if (completion.agentId) {
      if (!this.patterns.agentPatterns.has(completion.agentId)) {
        this.patterns.agentPatterns.set(completion.agentId, {
          accuracyHistory: [],
          velocityHistory: [],
          complexityPreference: {}
        });
      }

      const agentPattern = this.patterns.agentPatterns.get(completion.agentId);
      if (suggestion) {
        agentPattern.accuracyHistory.push({
          estimated: suggestion.estimatedHours,
          actual: completion.actualHours,
          accuracy: completion.accuracy,
          timestamp: completion.completedAt
        });
      }
    }

    await this.savePatterns();
  }

  async checkRetrainingNeeds() {
    const newCompletions = this.estimationHistory.filter(
      record =>
        record.type === 'completion' &&
        new Date(record.completedAt) >
          new Date(this.metrics.lastTraining || '1970-01-01')
    ).length;

    if (newCompletions >= this.config.learning.minimumSamples) {
      console.log(
        `🧠 Triggering model retraining (${newCompletions} new completions)`
      );
      await this.trainModels();
    }
  }

  scheduleRetraining() {
    setInterval(async () => {
      try {
        await this.trainModels();
      } catch (error) {
        console.error('Scheduled retraining failed:', error);
      }
    }, this.config.learning.retrainInterval);
  }

  getModelVersion() {
    return this.metrics.lastTraining || 'initial';
  }

  async storeSuggestion(suggestion) {
    this.estimationHistory.push({
      ...suggestion,
      type: 'suggestion'
    });

    await this.saveHistory();
  }

  // Data persistence methods

  async ensureDataDirectory() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async loadExistingData() {
    try {
      const historyData = await fs.readFile(this.historyFile, 'utf8');
      this.estimationHistory = JSON.parse(historyData);
    } catch {
      // No existing history
    }

    try {
      const metricsData = await fs.readFile(this.metricsFile, 'utf8');
      this.metrics = { ...this.metrics, ...JSON.parse(metricsData) };
    } catch {
      // No existing metrics
    }

    try {
      const patternsData = await fs.readFile(this.patternsFile, 'utf8');
      const patterns = JSON.parse(patternsData);
      this.patterns.agentPatterns = new Map(patterns.agentPatterns || []);
      this.patterns.taskPatterns = new Map(patterns.taskPatterns || []);
      this.patterns.contextPatterns = new Map(patterns.contextPatterns || []);
    } catch {
      // No existing patterns
    }
  }

  async loadModels() {
    try {
      const modelsData = await fs.readFile(this.modelsFile, 'utf8');
      const models = JSON.parse(modelsData);

      for (const [name, model] of Object.entries(models)) {
        this.models.set(name, model);
      }
    } catch {
      // No existing models
    }
  }

  async saveHistory() {
    await fs.writeFile(
      this.historyFile,
      JSON.stringify(this.estimationHistory, null, 2)
    );
  }

  async saveModels() {
    const modelsData = Object.fromEntries(this.models);
    await fs.writeFile(this.modelsFile, JSON.stringify(modelsData, null, 2));
  }

  async saveMetrics() {
    await fs.writeFile(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  async savePatterns() {
    const patternsData = {
      agentPatterns: Array.from(this.patterns.agentPatterns.entries()),
      taskPatterns: Array.from(this.patterns.taskPatterns.entries()),
      contextPatterns: Array.from(this.patterns.contextPatterns.entries())
    };

    await fs.writeFile(
      this.patternsFile,
      JSON.stringify(patternsData, null, 2)
    );
  }

  /**
   * Get estimation statistics
   */
  async getStatistics() {
    const recentHistory = this.estimationHistory.filter(record => {
      const recordDate = new Date(record.completedAt || record.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate > thirtyDaysAgo;
    });

    const suggestions = this.estimationHistory.filter(
      r => r.type === 'suggestion'
    );
    const completions = this.estimationHistory.filter(
      r => r.type === 'completion'
    );

    return {
      overview: {
        totalPredictions: this.metrics.totalPredictions,
        overallAccuracy: (this.metrics.overallAccuracy * 100).toFixed(1) + '%',
        modelsAvailable: this.models.size,
        lastTraining: this.metrics.lastTraining
      },

      recentActivity: {
        recentSuggestions: recentHistory.filter(r => r.type === 'suggestion')
          .length,
        recentCompletions: recentHistory.filter(r => r.type === 'completion')
          .length,
        averageAccuracy: this.calculateRecentAccuracy(recentHistory)
      },

      modelPerformance: {
        linearAccuracy: this.metrics.modelPerformance?.linear?.accuracy || 0,
        polynomialAccuracy:
          this.metrics.modelPerformance?.polynomial?.accuracy || 0,
        exponentialAccuracy:
          this.metrics.modelPerformance?.exponential?.accuracy || 0,
        ensembleAccuracy: this.metrics.modelPerformance?.ensemble?.accuracy || 0
      },

      dataQuality: {
        totalSuggestions: suggestions.length,
        totalCompletions: completions.length,
        dataCompletenessRate:
          completions.length > 0
            ? (
                (completions.filter(c => c.originalEstimate !== undefined)
                  .length /
                  completions.length) *
                100
              ).toFixed(1) + '%'
            : '0%'
      }
    };
  }

  calculateRecentAccuracy(recentHistory) {
    const recentCompletions = recentHistory.filter(
      r => r.type === 'completion' && r.accuracy !== undefined
    );

    if (recentCompletions.length === 0) return '0%';

    const averageAccuracy =
      recentCompletions.reduce((sum, r) => sum + r.accuracy, 0) /
      recentCompletions.length;
    return (averageAccuracy * 100).toFixed(1) + '%';
  }
}

// CLI mode
if (require.main === module) {
  const improver = new TaskEstimationImprover();

  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      await improver.initialize();

      switch (command) {
        case 'estimate':
          const taskData = {
            id: args[1] || 'test-task',
            title: args[2] || 'Test Task',
            description: args[3] || 'A test task for estimation',
            priority: args[4] || 'medium',
            tags: (args[5] || '').split(',').filter(t => t.trim())
          };

          console.log('🔮 Generating estimation...\n');
          const suggestion = await improver.getEstimationSuggestion(taskData);

          console.log('\n📋 Estimation Suggestion:');
          console.log(`   Estimated Hours: ${suggestion.estimatedHours}`);
          console.log(
            `   Range: ${suggestion.range.min} - ${suggestion.range.max} hours`
          );
          console.log(
            `   Confidence: ${(suggestion.confidence * 100).toFixed(1)}% (${suggestion.confidenceLevel})`
          );

          if (suggestion.reasoning.length > 0) {
            console.log('\n💭 Reasoning:');
            suggestion.reasoning.forEach(reason =>
              console.log(`   • ${reason}`)
            );
          }

          if (suggestion.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            suggestion.recommendations.forEach(rec =>
              console.log(`   • ${rec}`)
            );
          }
          break;

        case 'record':
          const taskId = args[1];
          const actualHours = parseFloat(args[2]);
          const agentId = args[3] || null;

          if (!taskId || isNaN(actualHours)) {
            console.error(
              'Usage: node TaskEstimationImprover.js record <taskId> <actualHours> [agentId]'
            );
            process.exit(1);
          }

          console.log(`📝 Recording completion: ${taskId} = ${actualHours}h`);
          const completion = await improver.recordCompletion(
            taskId,
            actualHours,
            agentId
          );

          if (completion.accuracy !== undefined) {
            console.log(
              `📊 Estimation accuracy: ${(completion.accuracy * 100).toFixed(1)}%`
            );
          }
          break;

        case 'train':
          console.log('🧠 Training estimation models...\n');
          const success = await improver.trainModels();

          if (success) {
            console.log('✅ Model training completed successfully');
          } else {
            console.log('⚠️  Training skipped due to insufficient data');
          }
          break;

        case 'stats':
          const stats = await improver.getStatistics();
          console.log('📊 Task Estimation Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;

        case 'help':
        default:
          console.log(`
🔮 Task Estimation Improver

USAGE:
  node TaskEstimationImprover.js <command> [options]

COMMANDS:
  estimate <id> <title> [description] [priority] [tags]   Get estimation for a task
  record <taskId> <actualHours> [agentId]                Record actual completion time
  train                                                   Train estimation models
  stats                                                   Display estimation statistics
  help                                                    Show this help

EXAMPLES:
  node TaskEstimationImprover.js estimate T-123 "Fix login bug" "Fix authentication issue" high "backend,security"
  node TaskEstimationImprover.js record T-123 6.5 agent1
  node TaskEstimationImprover.js train
  node TaskEstimationImprover.js stats

ESTIMATION PROCESS:
  1. Feature extraction from task description and context
  2. Multiple model predictions (linear, polynomial, exponential)
  3. Ensemble prediction with confidence scoring
  4. Adjustment based on agent experience and workload
  5. Range calculation and recommendations

LEARNING PROCESS:
  1. Record actual completion times vs estimates
  2. Continuous model training with new data
  3. Pattern recognition for agents and task types
  4. Accuracy tracking and improvement

FEATURES ANALYZED:
  - Task complexity (word count, acceptance criteria)
  - Task type (new feature, bug fix, refactor, testing)
  - Agent experience and domain expertise
  - Historical performance patterns
  - Current workload and context
`);
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = TaskEstimationImprover;
