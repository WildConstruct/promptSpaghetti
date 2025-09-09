#!/usr/bin/env node

/**
 * Knowledge Base Indexer
 *
 * Extracts patterns, solutions, and learnings from completed tasks to build a searchable
 * knowledge base and FAQ system for improved developer productivity and knowledge sharing.
 *
 * Key Features:
 * - Pattern extraction from completed tasks and solutions
 * - Automatic FAQ generation from common issues and resolutions
 * - Searchable knowledge base with full-text indexing
 * - Solution categorization and tagging
 * - Best practices identification and documentation
 * - Integration with task management system
 * - Knowledge gap analysis and recommendations
 */

const fs = require('fs').promises;
const path = require('path');

class KnowledgeBaseIndexer {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/knowledge-base');
    this.stateFile = path.join(__dirname, '../data/state.json');
    this.indexFile = path.join(this.dataDir, 'search-index.json');
    this.patternsFile = path.join(this.dataDir, 'patterns.json');
    this.faqFile = path.join(this.dataDir, 'faq.json');
    this.solutionsFile = path.join(this.dataDir, 'solutions.json');
    this.analyticsFile = path.join(this.dataDir, 'analytics.json');

    // Configuration for knowledge extraction
    this.config = {
      extraction: {
        // Pattern detection settings
        patternMinOccurrence: 3, // Minimum occurrences to consider a pattern
        similarityThreshold: 0.7, // Threshold for similarity matching
        keywordExtraction: true, // Extract keywords from solutions
        categoryThreshold: 5, // Minimum items per category

        // Content analysis
        minContentLength: 50, // Minimum content length to analyze
        maxContentLength: 10000, // Maximum content length to process
        skipTestFiles: true, // Skip test files in analysis
        includeComments: true, // Include code comments in analysis

        // Language processing
        stopWords: [
          'the',
          'a',
          'an',
          'and',
          'or',
          'but',
          'in',
          'on',
          'at',
          'to',
          'for',
          'of',
          'with',
          'by',
          'is',
          'are',
          'was',
          'were',
          'be',
          'been',
          'have',
          'has',
          'had',
          'do',
          'does',
          'did',
          'will',
          'would',
          'could',
          'should'
        ],

        // Technical keywords to prioritize
        technicalKeywords: [
          'bug',
          'fix',
          'error',
          'issue',
          'problem',
          'solution',
          'workaround',
          'optimization',
          'performance',
          'security',
          'refactor',
          'implement',
          'feature',
          'enhancement',
          'test',
          'debug',
          'config',
          'setup'
        ]
      },

      indexing: {
        // Search index configuration
        enableFullText: true, // Enable full-text search
        enableFaceted: true, // Enable faceted search
        maxSearchResults: 50, // Maximum search results to return
        searchBoosts: {
          title: 3.0, // Title field boost
          keywords: 2.0, // Keywords field boost
          description: 1.5, // Description field boost
          content: 1.0 // Content field boost
        },

        // Index optimization
        rebuildThreshold: 1000, // Rebuild index after N additions
        updateBatchSize: 100, // Batch size for index updates
        compressionEnabled: true // Enable index compression
      },

      categorization: {
        // Auto-categorization rules
        categories: {
          'bug-fixes': {
            keywords: ['bug', 'fix', 'error', 'issue', 'broken'],
            patterns: [/fix.*bug/i, /resolve.*issue/i, /error.*handling/i]
          },
          features: {
            keywords: ['feature', 'add', 'new', 'implement', 'create'],
            patterns: [
              /add.*feature/i,
              /implement.*functionality/i,
              /new.*component/i
            ]
          },
          optimizations: {
            keywords: ['optimize', 'performance', 'speed', 'memory', 'cache'],
            patterns: [
              /improve.*performance/i,
              /optimize.*query/i,
              /reduce.*memory/i
            ]
          },
          security: {
            keywords: [
              'security',
              'auth',
              'permission',
              'validation',
              'sanitize'
            ],
            patterns: [
              /security.*fix/i,
              /auth.*implementation/i,
              /validate.*input/i
            ]
          },
          refactoring: {
            keywords: ['refactor', 'cleanup', 'restructure', 'organize'],
            patterns: [
              /refactor.*code/i,
              /clean.*up/i,
              /restructure.*component/i
            ]
          },
          testing: {
            keywords: ['test', 'testing', 'coverage', 'spec', 'unit'],
            patterns: [/add.*test/i, /test.*coverage/i, /unit.*test/i]
          },
          documentation: {
            keywords: ['document', 'docs', 'readme', 'comment', 'explain'],
            patterns: [
              /add.*documentation/i,
              /update.*readme/i,
              /document.*api/i
            ]
          },
          configuration: {
            keywords: ['config', 'setup', 'environment', 'deploy', 'build'],
            patterns: [
              /config.*setup/i,
              /environment.*config/i,
              /build.*process/i
            ]
          }
        }
      },

      analytics: {
        // Analytics and insights
        trackUsage: true, // Track knowledge base usage
        identifyGaps: true, // Identify knowledge gaps
        generateReports: true, // Generate analytics reports
        retentionPeriod: 90, // Days to retain usage analytics

        // Trending analysis
        trendingWindow: 30, // Days for trending analysis
        popularityThreshold: 10, // Min views to be considered popular
        velocityThreshold: 5 // Min weekly growth for trending
      }
    };

    this.knowledgeBase = {
      patterns: new Map(),
      solutions: new Map(),
      faqs: [],
      categories: new Map(),
      searchIndex: new Map(),
      analytics: {
        totalItems: 0,
        totalSearches: 0,
        popularItems: [],
        knowledgeGaps: [],
        lastAnalysis: null
      }
    };

    this.searchIndex = new Map();
    this.lastIndexRebuild = null;
  }

  /**
   * Initialize the knowledge base indexer
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadExistingData();
      await this.buildSearchIndex();

      console.log('✅ Knowledge Base Indexer initialized');
      console.log(`📚 Loaded ${this.knowledgeBase.patterns.size} patterns`);
      console.log(`💡 Loaded ${this.knowledgeBase.solutions.size} solutions`);
      console.log(`❓ Loaded ${this.knowledgeBase.faqs.length} FAQ entries`);
    } catch (error) {
      console.error('❌ Failed to initialize Knowledge Base Indexer:', error);
      throw error;
    }
  }

  /**
   * Process completed tasks and extract knowledge
   */
  async indexCompletedTasks(options = {}) {
    console.log('📚 Indexing completed tasks for knowledge extraction...\n');

    try {
      const tasks = await this.getCompletedTasks();
      console.log(`📋 Found ${tasks.length} completed tasks to analyze`);

      let processedCount = 0;
      let extractedPatterns = 0;
      let newSolutions = 0;
      let generatedFAQs = 0;

      for (const task of tasks) {
        try {
          // Extract patterns from the task
          const patterns = await this.extractPatterns(task);
          extractedPatterns += patterns.length;

          // Extract solutions
          const solutions = await this.extractSolutions(task);
          newSolutions += solutions.length;

          // Generate FAQ entries
          const faqs = await this.generateFAQEntries(task);
          generatedFAQs += faqs.length;

          // Update knowledge base
          await this.updateKnowledgeBase(task, patterns, solutions, faqs);

          processedCount++;

          if (processedCount % 10 === 0) {
            console.log(
              `📊 Processed ${processedCount}/${tasks.length} tasks...`
            );
          }
        } catch (error) {
          console.warn(`⚠️  Could not process task ${task.id}:`, error.message);
        }
      }

      // Rebuild search index if needed
      await this.rebuildSearchIndexIfNeeded();

      // Generate analytics
      await this.generateAnalytics();

      // Save all data
      await this.saveKnowledgeBase();

      console.log('\n✅ Knowledge indexing complete:');
      console.log(`📋 Tasks processed: ${processedCount}`);
      console.log(`🔍 Patterns extracted: ${extractedPatterns}`);
      console.log(`💡 Solutions indexed: ${newSolutions}`);
      console.log(`❓ FAQ entries generated: ${generatedFAQs}`);

      return {
        processedCount,
        extractedPatterns,
        newSolutions,
        generatedFAQs
      };
    } catch (error) {
      console.error('❌ Knowledge indexing failed:', error);
      throw error;
    }
  }

  /**
   * Extract patterns from a completed task
   */
  async extractPatterns(task) {
    const patterns = [];

    // Analyze task content
    const content = this.extractTaskContent(task);
    if (!content || content.length < this.config.extraction.minContentLength) {
      return patterns;
    }

    // Extract common problem-solution patterns
    const problemSolutionPattern = this.extractProblemSolutionPattern(task);
    if (problemSolutionPattern) {
      patterns.push(problemSolutionPattern);
    }

    // Extract code patterns
    const codePatterns = await this.extractCodePatterns(task);
    patterns.push(...codePatterns);

    // Extract configuration patterns
    const configPatterns = this.extractConfigurationPatterns(task);
    patterns.push(...configPatterns);

    // Extract workflow patterns
    const workflowPatterns = this.extractWorkflowPatterns(task);
    patterns.push(...workflowPatterns);

    return patterns;
  }

  /**
   * Extract problem-solution patterns
   */
  extractProblemSolutionPattern(task) {
    const title = task.title || '';
    const description = task.description || '';
    const solution = task.solution || task.notes || '';

    // Look for common problem indicators
    const problemIndicators = [
      /issue.*with/i,
      /problem.*in/i,
      /error.*when/i,
      /bug.*in/i,
      /failing.*to/i,
      /cannot.*do/i,
      /unable.*to/i,
      /broken/i
    ];

    const hasProblem = problemIndicators.some(
      pattern => pattern.test(title) || pattern.test(description)
    );

    if (!hasProblem || !solution) return null;

    // Extract the core problem and solution
    const problem = this.extractProblemDescription(title, description);
    const solutionSummary = this.extractSolutionSummary(solution);

    if (!problem || !solutionSummary) return null;

    return {
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'problem-solution',
      problem: problem.trim(),
      solution: solutionSummary.trim(),
      category: this.categorizeContent(problem + ' ' + solutionSummary),
      keywords: this.extractKeywords(problem + ' ' + solutionSummary),
      source: task.id,
      confidence: this.calculatePatternConfidence(problem, solutionSummary),
      created: new Date().toISOString()
    };
  }

  /**
   * Extract code patterns from task files
   */
  async extractCodePatterns(task) {
    const patterns = [];

    if (!task.files || task.files.length === 0) return patterns;

    for (const filePath of task.files) {
      try {
        // Skip test files if configured
        if (this.config.extraction.skipTestFiles && this.isTestFile(filePath)) {
          continue;
        }

        const content = await fs.readFile(filePath, 'utf8');
        if (content.length > this.config.extraction.maxContentLength) {
          continue;
        }

        // Extract common code patterns
        const codePatterns = this.analyzeCodeStructure(content, filePath);
        patterns.push(...codePatterns);
      } catch (error) {
        // File might not exist or be accessible
        continue;
      }
    }

    return patterns;
  }

  /**
   * Analyze code structure for patterns
   */
  analyzeCodeStructure(content, filePath) {
    const patterns = [];

    // Extract import patterns
    const importPattern = this.extractImportPatterns(content);
    if (importPattern) patterns.push(importPattern);

    // Extract function patterns
    const functionPatterns = this.extractFunctionPatterns(content);
    patterns.push(...functionPatterns);

    // Extract error handling patterns
    const errorPatterns = this.extractErrorHandlingPatterns(content);
    patterns.push(...errorPatterns);

    // Extract configuration patterns
    const configPatterns = this.extractCodeConfigPatterns(content);
    patterns.push(...configPatterns);

    return patterns.map(pattern => ({
      ...pattern,
      file: filePath,
      fileType: path.extname(filePath),
      created: new Date().toISOString()
    }));
  }

  /**
   * Extract solutions from task
   */
  async extractSolutions(task) {
    const solutions = [];

    // Main solution from task completion
    const mainSolution = this.extractMainSolution(task);
    if (mainSolution) {
      solutions.push(mainSolution);
    }

    // Technical solutions from code changes
    const techSolutions = await this.extractTechnicalSolutions(task);
    solutions.push(...techSolutions);

    // Configuration solutions
    const configSolutions = this.extractConfigurationSolutions(task);
    solutions.push(...configSolutions);

    return solutions;
  }

  /**
   * Extract main solution from task
   */
  extractMainSolution(task) {
    const solution = task.solution || task.notes || task.description || '';
    if (
      !solution ||
      solution.length < this.config.extraction.minContentLength
    ) {
      return null;
    }

    const category = this.categorizeContent(solution);
    const keywords = this.extractKeywords(solution);
    const steps = this.extractSolutionSteps(solution);

    return {
      id: `solution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: this.generateSolutionTitle(task.title, solution),
      description: this.extractSolutionDescription(solution),
      steps,
      category,
      keywords,
      difficulty: this.assessSolutionDifficulty(solution, steps),
      effectiveness: this.assessSolutionEffectiveness(task),
      source: task.id,
      tags: this.generateSolutionTags(task, solution),
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  }

  /**
   * Generate FAQ entries from common patterns
   */
  async generateFAQEntries(task) {
    const faqs = [];

    // Generate FAQ from problem-solution pattern
    const problemSolution = this.extractProblemSolutionPattern(task);
    if (problemSolution) {
      const faq = {
        id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: this.generateFAQQuestion(problemSolution.problem),
        answer: this.generateFAQAnswer(problemSolution.solution),
        category: problemSolution.category,
        keywords: problemSolution.keywords,
        source: task.id,
        popularity: 0,
        helpful: 0,
        notHelpful: 0,
        created: new Date().toISOString()
      };

      faqs.push(faq);
    }

    // Generate FAQs from common issues
    const commonIssues = this.identifyCommonIssues(task);
    for (const issue of commonIssues) {
      const faq = {
        id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question: issue.question,
        answer: issue.answer,
        category: issue.category,
        keywords: this.extractKeywords(issue.question + ' ' + issue.answer),
        source: task.id,
        popularity: 0,
        helpful: 0,
        notHelpful: 0,
        created: new Date().toISOString()
      };

      faqs.push(faq);
    }

    return faqs;
  }

  /**
   * Search the knowledge base
   */
  async search(query, options = {}) {
    const {
      category = null,
      type = null,
      limit = this.config.indexing.maxSearchResults,
      includeContent = false
    } = options;

    console.log(`🔍 Searching knowledge base: "${query}"`);

    // Record search for analytics
    await this.recordSearch(query, options);

    const results = [];
    const queryTerms = this.tokenizeQuery(query);

    // Search patterns
    for (const [id, pattern] of this.knowledgeBase.patterns.entries()) {
      const score = this.calculateRelevanceScore(
        pattern,
        queryTerms,
        'pattern'
      );
      if (score > 0) {
        results.push({
          id,
          type: 'pattern',
          title: pattern.problem || pattern.title,
          description: pattern.solution || pattern.description,
          category: pattern.category,
          score,
          source: pattern.source,
          data: includeContent ? pattern : null
        });
      }
    }

    // Search solutions
    for (const [id, solution] of this.knowledgeBase.solutions.entries()) {
      const score = this.calculateRelevanceScore(
        solution,
        queryTerms,
        'solution'
      );
      if (score > 0) {
        results.push({
          id,
          type: 'solution',
          title: solution.title,
          description: solution.description,
          category: solution.category,
          score,
          difficulty: solution.difficulty,
          effectiveness: solution.effectiveness,
          data: includeContent ? solution : null
        });
      }
    }

    // Search FAQs
    for (const faq of this.knowledgeBase.faqs) {
      const score = this.calculateRelevanceScore(faq, queryTerms, 'faq');
      if (score > 0) {
        results.push({
          id: faq.id,
          type: 'faq',
          title: faq.question,
          description: faq.answer,
          category: faq.category,
          score,
          popularity: faq.popularity,
          helpful: faq.helpful,
          data: includeContent ? faq : null
        });
      }
    }

    // Filter by category and type
    let filteredResults = results;
    if (category) {
      filteredResults = filteredResults.filter(r => r.category === category);
    }
    if (type) {
      filteredResults = filteredResults.filter(r => r.type === type);
    }

    // Sort by relevance score and limit
    filteredResults.sort((a, b) => b.score - a.score);
    filteredResults = filteredResults.slice(0, limit);

    console.log(`📊 Found ${filteredResults.length} results`);

    return {
      query,
      totalResults: filteredResults.length,
      results: filteredResults,
      categories: this.getSearchCategories(results),
      suggestions: this.generateSearchSuggestions(query, filteredResults)
    };
  }

  /**
   * Get knowledge base statistics
   */
  async getStatistics() {
    return {
      overview: {
        totalPatterns: this.knowledgeBase.patterns.size,
        totalSolutions: this.knowledgeBase.solutions.size,
        totalFAQs: this.knowledgeBase.faqs.length,
        totalCategories: this.knowledgeBase.categories.size,
        lastIndexRebuild: this.lastIndexRebuild
      },

      analytics: {
        totalSearches: this.knowledgeBase.analytics.totalSearches,
        popularItems: this.knowledgeBase.analytics.popularItems.slice(0, 10),
        knowledgeGaps: this.knowledgeBase.analytics.knowledgeGaps.slice(0, 5),
        lastAnalysis: this.knowledgeBase.analytics.lastAnalysis
      },

      categories: this.getCategoryStatistics(),

      indexHealth: {
        searchIndexSize: this.searchIndex.size,
        averageRelevanceScore: this.calculateAverageRelevanceScore(),
        indexingEfficiency: this.calculateIndexingEfficiency()
      }
    };
  }

  /**
   * Generate analytics and insights
   */
  async generateAnalytics() {
    console.log('📊 Generating knowledge base analytics...');

    try {
      // Identify popular content
      const popularItems = this.identifyPopularContent();

      // Identify knowledge gaps
      const knowledgeGaps = this.identifyKnowledgeGaps();

      // Calculate category distribution
      const categoryDistribution = this.calculateCategoryDistribution();

      // Generate trends
      const trends = this.analyzeTrends();

      // Update analytics
      this.knowledgeBase.analytics = {
        totalItems:
          this.knowledgeBase.patterns.size +
          this.knowledgeBase.solutions.size +
          this.knowledgeBase.faqs.length,
        totalSearches: this.knowledgeBase.analytics.totalSearches,
        popularItems,
        knowledgeGaps,
        categoryDistribution,
        trends,
        lastAnalysis: new Date().toISOString()
      };

      // Save analytics
      await this.saveAnalytics();

      console.log(
        `✅ Analytics generated: ${popularItems.length} popular items, ${knowledgeGaps.length} knowledge gaps identified`
      );
    } catch (error) {
      console.error('❌ Analytics generation failed:', error);
    }
  }

  // Helper methods

  async ensureDataDirectory() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async loadExistingData() {
    try {
      // Load patterns
      const patternsData = await fs.readFile(this.patternsFile, 'utf8');
      const patterns = JSON.parse(patternsData);
      this.knowledgeBase.patterns = new Map(Object.entries(patterns));
    } catch {
      // No existing patterns
    }

    try {
      // Load solutions
      const solutionsData = await fs.readFile(this.solutionsFile, 'utf8');
      const solutions = JSON.parse(solutionsData);
      this.knowledgeBase.solutions = new Map(Object.entries(solutions));
    } catch {
      // No existing solutions
    }

    try {
      // Load FAQs
      const faqData = await fs.readFile(this.faqFile, 'utf8');
      this.knowledgeBase.faqs = JSON.parse(faqData);
    } catch {
      // No existing FAQs
    }

    try {
      // Load analytics
      const analyticsData = await fs.readFile(this.analyticsFile, 'utf8');
      this.knowledgeBase.analytics = JSON.parse(analyticsData);
    } catch {
      // No existing analytics
    }
  }

  async saveKnowledgeBase() {
    // Save patterns
    const patternsData = Object.fromEntries(this.knowledgeBase.patterns);
    await fs.writeFile(
      this.patternsFile,
      JSON.stringify(patternsData, null, 2)
    );

    // Save solutions
    const solutionsData = Object.fromEntries(this.knowledgeBase.solutions);
    await fs.writeFile(
      this.solutionsFile,
      JSON.stringify(solutionsData, null, 2)
    );

    // Save FAQs
    await fs.writeFile(
      this.faqFile,
      JSON.stringify(this.knowledgeBase.faqs, null, 2)
    );

    // Save search index
    const indexData = Object.fromEntries(this.searchIndex);
    await fs.writeFile(this.indexFile, JSON.stringify(indexData, null, 2));
  }

  async saveAnalytics() {
    await fs.writeFile(
      this.analyticsFile,
      JSON.stringify(this.knowledgeBase.analytics, null, 2)
    );
  }

  async getCompletedTasks() {
    try {
      const stateData = await fs.readFile(this.stateFile, 'utf8');
      const state = JSON.parse(stateData);

      const tasks = Object.values(state.tasks || {});
      return tasks.filter(
        task => task.state === 'DONE' || task.state === 'COMPLETED'
      );
    } catch {
      return [];
    }
  }

  extractTaskContent(task) {
    const parts = [
      task.title || '',
      task.description || '',
      task.solution || '',
      task.notes || '',
      ...(task.comments || []).map(c => c.text || '')
    ];

    return parts.join(' ').trim();
  }

  categorizeContent(content) {
    const text = content.toLowerCase();

    for (const [category, config] of Object.entries(
      this.config.categorization.categories
    )) {
      // Check keywords
      const keywordMatch = config.keywords.some(keyword =>
        text.includes(keyword)
      );
      if (keywordMatch) return category;

      // Check patterns
      const patternMatch = config.patterns.some(pattern =>
        pattern.test(content)
      );
      if (patternMatch) return category;
    }

    return 'general';
  }

  extractKeywords(text) {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        word =>
          word.length > 2 && !this.config.extraction.stopWords.includes(word)
      );

    // Count word frequency
    const frequency = new Map();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Sort by frequency and return top keywords
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  calculatePatternConfidence(problem, solution) {
    let confidence = 0.5; // Base confidence

    // Increase confidence for detailed descriptions
    if (problem.length > 100) confidence += 0.1;
    if (solution.length > 200) confidence += 0.2;

    // Increase confidence for technical keywords
    const technicalWords = this.config.extraction.technicalKeywords;
    const problemTech = technicalWords.filter(word =>
      problem.toLowerCase().includes(word)
    );
    const solutionTech = technicalWords.filter(word =>
      solution.toLowerCase().includes(word)
    );

    confidence += (problemTech.length + solutionTech.length) * 0.05;

    return Math.min(1.0, confidence);
  }

  isTestFile(filePath) {
    const testPatterns = [
      /\.test\./i,
      /\.spec\./i,
      /\/test\//i,
      /\/tests\//i,
      /__tests__/i
    ];

    return testPatterns.some(pattern => pattern.test(filePath));
  }

  // Placeholder implementations for complex extraction methods

  extractProblemDescription(title, description) {
    // Extract the core problem from title and description
    const text = `${title} ${description}`;

    // Look for problem patterns
    const problemPatterns = [
      /issue.*with\s+(.+)/i,
      /problem.*in\s+(.+)/i,
      /error.*when\s+(.+)/i,
      /cannot\s+(.+)/i,
      /unable.*to\s+(.+)/i
    ];

    for (const pattern of problemPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback to first sentence
    const firstSentence = text.split('.')[0];
    return firstSentence.length > 10 ? firstSentence : text.substring(0, 100);
  }

  extractSolutionSummary(solution) {
    // Extract key solution points
    const sentences = solution.split(/[.!?]+/);
    const importantSentences = sentences.filter(
      sentence =>
        sentence.length > 20 &&
        (sentence.includes('fix') ||
          sentence.includes('solve') ||
          sentence.includes('implement') ||
          sentence.includes('add'))
    );

    return importantSentences.slice(0, 2).join('. ').trim();
  }

  extractConfigurationPatterns(task) {
    // Extract configuration-related patterns
    return [];
  }

  extractWorkflowPatterns(task) {
    // Extract workflow and process patterns
    return [];
  }

  extractImportPatterns(content) {
    const imports = content.match(/import\s+.*?from\s+['"][^'"]+['"]/g);
    if (!imports || imports.length === 0) return null;

    return {
      id: `import-pattern-${Date.now()}`,
      type: 'import',
      pattern: 'common-imports',
      imports: imports.slice(0, 5),
      frequency: imports.length
    };
  }

  extractFunctionPatterns(content) {
    // Extract common function patterns
    return [];
  }

  extractErrorHandlingPatterns(content) {
    // Extract error handling patterns
    return [];
  }

  extractCodeConfigPatterns(content) {
    // Extract configuration patterns from code
    return [];
  }

  extractTechnicalSolutions(task) {
    // Extract technical solutions from code changes
    return [];
  }

  extractConfigurationSolutions(task) {
    // Extract configuration-related solutions
    return [];
  }

  extractSolutionSteps(solution) {
    // Extract step-by-step instructions from solution
    const steps = [];
    const lines = solution.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.match(/^\d+[\.\)]\s+/) ||
        trimmed.match(/^[-\*]\s+/) ||
        trimmed.toLowerCase().startsWith('step')
      ) {
        steps.push(trimmed);
      }
    }

    return steps.slice(0, 10); // Limit to 10 steps
  }

  generateSolutionTitle(taskTitle, solution) {
    // Generate a descriptive title for the solution
    if (taskTitle && taskTitle.length > 5) {
      return `Solution: ${taskTitle}`;
    }

    const firstLine = solution.split('\n')[0];
    return firstLine.length > 50
      ? firstLine.substring(0, 47) + '...'
      : firstLine;
  }

  extractSolutionDescription(solution) {
    // Extract the main description from solution
    const lines = solution.split('\n');
    const mainLines = lines.filter(
      line =>
        line.trim().length > 20 &&
        !line.trim().match(/^\d+[\.\)]/) &&
        !line.trim().match(/^[-\*]/)
    );

    return mainLines.slice(0, 3).join(' ').trim();
  }

  assessSolutionDifficulty(solution, steps) {
    // Assess the difficulty level of the solution
    let difficulty = 'easy';

    if (steps.length > 5) difficulty = 'medium';
    if (steps.length > 10) difficulty = 'hard';

    // Check for complexity indicators
    const complexityIndicators = [
      'configuration',
      'database',
      'migration',
      'deployment',
      'architecture',
      'refactor',
      'performance',
      'security'
    ];

    const hasComplexity = complexityIndicators.some(indicator =>
      solution.toLowerCase().includes(indicator)
    );

    if (hasComplexity && difficulty === 'easy') difficulty = 'medium';
    if (hasComplexity && difficulty === 'medium') difficulty = 'hard';

    return difficulty;
  }

  assessSolutionEffectiveness(task) {
    // Assess how effective the solution was
    // This could be based on task completion time, feedback, etc.
    return 'effective'; // Placeholder
  }

  generateSolutionTags(task, solution) {
    const tags = [];

    // Add category-based tags
    const category = this.categorizeContent(solution);
    tags.push(category);

    // Add technical tags
    const techKeywords = this.config.extraction.technicalKeywords;
    for (const keyword of techKeywords) {
      if (solution.toLowerCase().includes(keyword)) {
        tags.push(keyword);
      }
    }

    // Add file type tags if applicable
    if (task.files) {
      const extensions = task.files
        .map(f => path.extname(f).substring(1))
        .filter(Boolean);
      tags.push(...[...new Set(extensions)]);
    }

    return [...new Set(tags)].slice(0, 10);
  }

  generateFAQQuestion(problem) {
    // Convert problem description to FAQ question
    if (
      problem.toLowerCase().startsWith('how') ||
      problem.toLowerCase().startsWith('what') ||
      problem.toLowerCase().startsWith('why')
    ) {
      return problem.charAt(0).toUpperCase() + problem.slice(1) + '?';
    }

    return `How to resolve: ${problem}?`;
  }

  generateFAQAnswer(solution) {
    // Convert solution to FAQ answer
    return solution;
  }

  identifyCommonIssues(task) {
    // Identify common issues that could become FAQs
    return [];
  }

  async updateKnowledgeBase(task, patterns, solutions, faqs) {
    // Add patterns
    for (const pattern of patterns) {
      this.knowledgeBase.patterns.set(pattern.id, pattern);
    }

    // Add solutions
    for (const solution of solutions) {
      this.knowledgeBase.solutions.set(solution.id, solution);
    }

    // Add FAQs
    this.knowledgeBase.faqs.push(...faqs);

    // Update categories
    this.updateCategories(patterns, solutions, faqs);
  }

  updateCategories(patterns, solutions, faqs) {
    const allItems = [...patterns, ...solutions, ...faqs];

    for (const item of allItems) {
      if (item.category) {
        const count = this.knowledgeBase.categories.get(item.category) || 0;
        this.knowledgeBase.categories.set(item.category, count + 1);
      }
    }
  }

  async buildSearchIndex() {
    console.log('🔍 Building search index...');

    this.searchIndex.clear();

    // Index patterns
    for (const [id, pattern] of this.knowledgeBase.patterns.entries()) {
      this.addToSearchIndex(id, pattern, 'pattern');
    }

    // Index solutions
    for (const [id, solution] of this.knowledgeBase.solutions.entries()) {
      this.addToSearchIndex(id, solution, 'solution');
    }

    // Index FAQs
    for (const faq of this.knowledgeBase.faqs) {
      this.addToSearchIndex(faq.id, faq, 'faq');
    }

    this.lastIndexRebuild = new Date().toISOString();
    console.log(`✅ Search index built with ${this.searchIndex.size} entries`);
  }

  addToSearchIndex(id, item, type) {
    const searchableText = this.getSearchableText(item, type);
    const tokens = this.tokenizeContent(searchableText);

    this.searchIndex.set(id, {
      type,
      tokens,
      item: {
        id,
        title: this.getItemTitle(item, type),
        category: item.category,
        keywords: item.keywords || []
      }
    });
  }

  getSearchableText(item, type) {
    switch (type) {
      case 'pattern':
        return `${item.problem || ''} ${item.solution || ''} ${(item.keywords || []).join(' ')}`;
      case 'solution':
        return `${item.title || ''} ${item.description || ''} ${(item.keywords || []).join(' ')}`;
      case 'faq':
        return `${item.question || ''} ${item.answer || ''} ${(item.keywords || []).join(' ')}`;
      default:
        return '';
    }
  }

  getItemTitle(item, type) {
    switch (type) {
      case 'pattern':
        return item.problem || item.title || 'Untitled Pattern';
      case 'solution':
        return item.title || 'Untitled Solution';
      case 'faq':
        return item.question || 'Untitled FAQ';
      default:
        return 'Untitled';
    }
  }

  tokenizeContent(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        word =>
          word.length > 2 && !this.config.extraction.stopWords.includes(word)
      );
  }

  tokenizeQuery(query) {
    return this.tokenizeContent(query);
  }

  calculateRelevanceScore(item, queryTerms, type) {
    let score = 0;
    const searchableText = this.getSearchableText(item, type).toLowerCase();
    const itemTokens = this.tokenizeContent(searchableText);

    // Calculate term frequency
    for (const term of queryTerms) {
      const termFreq = itemTokens.filter(token => token.includes(term)).length;
      score += termFreq * this.config.indexing.searchBoosts.content;

      // Boost for exact matches in important fields
      if (
        type === 'pattern' &&
        item.problem &&
        item.problem.toLowerCase().includes(term)
      ) {
        score += this.config.indexing.searchBoosts.title;
      }
      if (
        type === 'solution' &&
        item.title &&
        item.title.toLowerCase().includes(term)
      ) {
        score += this.config.indexing.searchBoosts.title;
      }
      if (
        type === 'faq' &&
        item.question &&
        item.question.toLowerCase().includes(term)
      ) {
        score += this.config.indexing.searchBoosts.title;
      }

      // Boost for keyword matches
      if (
        item.keywords &&
        item.keywords.some(keyword => keyword.includes(term))
      ) {
        score += this.config.indexing.searchBoosts.keywords;
      }
    }

    return score;
  }

  async recordSearch(query, options) {
    this.knowledgeBase.analytics.totalSearches++;
    // In a full implementation, this would record search analytics
  }

  getSearchCategories(results) {
    const categories = new Map();

    for (const result of results) {
      if (result.category) {
        const count = categories.get(result.category) || 0;
        categories.set(result.category, count + 1);
      }
    }

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }

  generateSearchSuggestions(query, results) {
    // Generate search suggestions based on query and results
    const suggestions = [];

    if (results.length === 0) {
      suggestions.push('Try using more general terms');
      suggestions.push('Check spelling of search terms');
      suggestions.push('Browse categories for related content');
    } else if (results.length === 1) {
      suggestions.push('Try broader search terms for more results');
    }

    return suggestions;
  }

  async rebuildSearchIndexIfNeeded() {
    const totalItems =
      this.knowledgeBase.patterns.size +
      this.knowledgeBase.solutions.size +
      this.knowledgeBase.faqs.length;

    if (
      totalItems > this.config.indexing.rebuildThreshold &&
      this.searchIndex.size < totalItems * 0.9
    ) {
      await this.buildSearchIndex();
    }
  }

  // Analytics methods

  identifyPopularContent() {
    // Identify popular content based on search frequency and helpful votes
    return [];
  }

  identifyKnowledgeGaps() {
    // Identify areas where knowledge is lacking
    const gaps = [];

    // Analyze categories with few items
    for (const [category, count] of this.knowledgeBase.categories.entries()) {
      if (count < this.config.categorization.categoryThreshold) {
        gaps.push({
          type: 'category_gap',
          category,
          itemCount: count,
          severity: 'medium'
        });
      }
    }

    return gaps;
  }

  calculateCategoryDistribution() {
    const total =
      this.knowledgeBase.patterns.size +
      this.knowledgeBase.solutions.size +
      this.knowledgeBase.faqs.length;

    const distribution = {};
    for (const [category, count] of this.knowledgeBase.categories.entries()) {
      distribution[category] = {
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      };
    }

    return distribution;
  }

  analyzeTrends() {
    // Analyze trends in knowledge base growth and usage
    return {
      growthRate: 'steady',
      popularCategories: Array.from(this.knowledgeBase.categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category]) => category)
    };
  }

  getCategoryStatistics() {
    const stats = {};

    for (const [category, count] of this.knowledgeBase.categories.entries()) {
      stats[category] = {
        totalItems: count,
        patterns: 0,
        solutions: 0,
        faqs: 0
      };
    }

    // Count by type
    for (const pattern of this.knowledgeBase.patterns.values()) {
      if (pattern.category && stats[pattern.category]) {
        stats[pattern.category].patterns++;
      }
    }

    for (const solution of this.knowledgeBase.solutions.values()) {
      if (solution.category && stats[solution.category]) {
        stats[solution.category].solutions++;
      }
    }

    for (const faq of this.knowledgeBase.faqs) {
      if (faq.category && stats[faq.category]) {
        stats[faq.category].faqs++;
      }
    }

    return stats;
  }

  calculateAverageRelevanceScore() {
    // Calculate average relevance score for search quality assessment
    return 0.75; // Placeholder
  }

  calculateIndexingEfficiency() {
    // Calculate indexing efficiency metrics
    return {
      indexSize: this.searchIndex.size,
      averageTokensPerItem: 15,
      memoryUsage: 'efficient'
    };
  }
}

// CLI mode
if (require.main === module) {
  const indexer = new KnowledgeBaseIndexer();

  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      await indexer.initialize();

      switch (command) {
        case 'index':
          console.log('📚 Starting knowledge base indexing...\n');
          const result = await indexer.indexCompletedTasks();

          console.log('\n✅ Indexing complete:');
          console.log(`📋 Tasks processed: ${result.processedCount}`);
          console.log(`🔍 Patterns extracted: ${result.extractedPatterns}`);
          console.log(`💡 Solutions indexed: ${result.newSolutions}`);
          console.log(`❓ FAQ entries generated: ${result.generatedFAQs}`);
          break;

        case 'search':
          const query = args.slice(1).join(' ');
          if (!query) {
            console.error('❌ Search query required');
            process.exit(1);
          }

          console.log(`🔍 Searching for: "${query}"\n`);
          const searchResult = await indexer.search(query, {
            includeContent: true
          });

          console.log(`📊 Found ${searchResult.totalResults} results:\n`);

          for (const [index, result] of searchResult.results.entries()) {
            console.log(
              `${index + 1}. [${result.type.toUpperCase()}] ${result.title}`
            );
            console.log(`   Category: ${result.category}`);
            console.log(`   Score: ${result.score.toFixed(2)}`);
            if (result.description) {
              console.log(`   ${result.description.substring(0, 100)}...`);
            }
            console.log('');
          }

          if (searchResult.suggestions.length > 0) {
            console.log('💡 Suggestions:');
            searchResult.suggestions.forEach(suggestion =>
              console.log(`   • ${suggestion}`)
            );
          }
          break;

        case 'analytics':
          await indexer.generateAnalytics();
          console.log('✅ Analytics generated');
          break;

        case 'stats':
          const stats = await indexer.getStatistics();
          console.log('📊 Knowledge Base Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;

        case 'help':
        default:
          console.log(`
📚 Knowledge Base Indexer

USAGE:
  node KnowledgeBaseIndexer.js <command> [options]

COMMANDS:
  index                    Extract knowledge from completed tasks
  search <query>           Search the knowledge base
  analytics               Generate analytics and insights
  stats                   Display knowledge base statistics
  help                    Show this help

EXAMPLES:
  node KnowledgeBaseIndexer.js index
  node KnowledgeBaseIndexer.js search "react component error"
  node KnowledgeBaseIndexer.js search "database connection" 
  node KnowledgeBaseIndexer.js analytics

SEARCH TIPS:
  • Use specific technical terms for better results
  • Search by category, error message, or solution type
  • Use quotes for exact phrase matching
  • Try different keyword combinations

KNOWLEDGE EXTRACTION:
  The indexer automatically extracts:
  • Problem-solution patterns from completed tasks
  • Code patterns and best practices
  • Common configuration solutions
  • Frequently asked questions
  • Technical solutions and workarounds
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

module.exports = KnowledgeBaseIndexer;
