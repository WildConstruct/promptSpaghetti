/**
 * Enhanced Daily Ticket Tracker
 *
 * Comprehensive tracking system for tickets with rich historical data,
 * multiple categories, performance metrics, and trend analysis.
 */

const fs = require('fs').promises;
const path = require('path');

class EnhancedTicketTracker {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/tracking');
    this.currentDayFile = path.join(this.dataDir, 'current-day.json');
    this.historyFile = path.join(this.dataDir, 'historical-data.json');
    this.metricsFile = path.join(this.dataDir, 'performance-metrics.json');
    this.trendsFile = path.join(this.dataDir, 'trend-analysis.json');
    this.agentStatsFile = path.join(this.dataDir, 'agent-statistics.json');
    this.configFile = path.join(this.dataDir, 'tracker-config.json');

    // Central Time zone
    this.centralTimeZone = 'America/Chicago';

    // Enhanced tracking categories
    this.currentDay = {
      date: this.getCurrentDateCT(),
      metrics: {
        // Core ticket metrics
        approved: 0,
        pushed: 0,
        committed: 0,
        merged: 0,

        // Quality metrics
        qaApproved: 0,
        qaFailed: 0,
        qaRetries: 0,
        reviewRequests: 0,

        // Performance metrics
        avgProcessingTime: 0,
        avgApprovalTime: 0,
        avgCommitSize: 0,

        // Complexity metrics
        simpleTickets: 0, // < 1 hour
        mediumTickets: 0, // 1-4 hours
        complexTickets: 0, // > 4 hours

        // Type breakdown
        features: 0,
        bugfixes: 0,
        refactoring: 0,
        documentation: 0,
        tests: 0,
        infrastructure: 0,
      },

      // Agent-specific data
      agents: new Map(),

      // Detailed activity timeline
      timeline: [],

      // Story/Epic tracking
      stories: new Map(),
      epics: new Map(),

      // Time-based metrics
      hourlyDistribution: new Array(24).fill(0),
      peakHours: [],

      // Session info
      startTime: new Date(),
      lastUpdate: new Date(),
      uptime: 0,
    };

    // Enhanced configuration
    this.config = {
      resetTime: '00:00',
      retentionDays: 365, // Keep a full year
      enableNotifications: true,
      trackingEnabled: true,
      detailedLogging: true,

      // Performance thresholds
      thresholds: {
        highProductivity: 50,
        mediumProductivity: 25,
        slowApprovalTime: 3600000, // 1 hour in ms
        largeCommit: 10, // 10+ tickets
      },

      // Data collection settings
      collectPerformanceMetrics: true,
      collectAgentMetrics: true,
      collectTrendData: true,
      generateWeeklyReports: true,
      generateMonthlyReports: true,
    };

    this.initialized = false;
    this.resetTimer = null;
    this.autoSaveTimer = null;
  }

  /**
   * Initialize enhanced tracker
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadConfig();
      await this.loadCurrentDay();
      await this.setupTimers();

      this.initialized = true;
      console.log('✅ Enhanced Daily Ticket Tracker initialized');

      await this.logEvent('system', 'Enhanced tracker initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Tracker:', error);
      throw error;
    }
  }

  /**
   * Track ticket approval with enhanced data
   */
  async trackApproval(ticketId, agentId = 'unknown', metadata = {}) {
    if (!this.config.trackingEnabled) return;

    try {
      // Core metrics
      this.currentDay.metrics.approved++;

      // Update agent stats
      this.updateAgentStats(agentId, 'approved', 1, metadata);

      // Track complexity
      this.trackComplexity(metadata.estimate || metadata.hours);

      // Track type
      this.trackTicketType(metadata.type || metadata.wipClass);

      // Track story/epic
      this.trackStoryEpic(metadata.story, metadata.epic);

      // Track hourly distribution
      const hour = new Date().getHours();
      this.currentDay.hourlyDistribution[hour]++;

      // Calculate processing time if available
      if (metadata.startTime) {
        const processingTime = Date.now() - new Date(metadata.startTime).getTime();
        this.updateProcessingTime(processingTime);
      }

      const event = {
        type: 'approval',
        ticketId,
        agentId,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          complexity: this.getComplexityFromEstimate(metadata.estimate),
          ticketType: this.normalizeTicketType(metadata.type || metadata.wipClass),
          story: metadata.story,
          epic: metadata.epic,
        },
      };

      this.currentDay.timeline.push(event);
      this.currentDay.lastUpdate = new Date();

      await this.saveCurrentDay();

      if (this.config.detailedLogging) {
        console.log(`📋 Enhanced tracking - Approval: ${ticketId} by ${agentId} (${event.metadata.complexity})`);
      }

      await this.checkMilestones();
    } catch (error) {
      console.error('Error in enhanced approval tracking:', error);
    }
  }

  /**
   * Track ticket push/commit with enhanced data
   */
  async trackPush(ticketIds = [], agentId = 'unknown', commitHash = '', metadata = {}) {
    if (!this.config.trackingEnabled) return;

    try {
      const count = Array.isArray(ticketIds) ? ticketIds.length : 1;
      const tickets = Array.isArray(ticketIds) ? ticketIds : [ticketIds];

      // Core metrics
      this.currentDay.metrics.pushed += count;
      this.currentDay.metrics.committed++;

      // Track commit size
      this.updateCommitSize(count);

      // Update agent stats
      this.updateAgentStats(agentId, 'pushed', count, metadata);

      // Track each ticket in the commit
      for (const ticketId of tickets) {
        await this.trackIndividualPush(ticketId, agentId, metadata);
      }

      const event = {
        type: 'push',
        ticketIds: tickets,
        agentId,
        commitHash,
        timestamp: new Date(),
        count,
        metadata: {
          ...metadata,
          commitSize: count,
          branch: metadata.branch || 'main',
          linesChanged: metadata.linesChanged,
          filesChanged: metadata.filesChanged,
        },
      };

      this.currentDay.timeline.push(event);
      this.currentDay.lastUpdate = new Date();

      await this.saveCurrentDay();

      if (this.config.detailedLogging) {
        console.log(`🚀 Enhanced tracking - Push: ${count} ticket(s) by ${agentId} (${commitHash})`);
      }

      await this.checkMilestones();
    } catch (error) {
      console.error('Error in enhanced push tracking:', error);
    }
  }

  /**
   * Track QA activity
   */
  async trackQA(results, agentId = 'qa-agent') {
    if (!this.config.trackingEnabled) return;

    try {
      if (results.passed) {
        this.currentDay.metrics.qaApproved += results.passed.length || results.passed;
      }

      if (results.failed) {
        this.currentDay.metrics.qaFailed += results.failed.length || results.failed;
      }

      if (results.retries) {
        this.currentDay.metrics.qaRetries += results.retries;
      }

      const event = {
        type: 'qa',
        agentId,
        timestamp: new Date(),
        metadata: {
          passed: results.passed,
          failed: results.failed,
          retries: results.retries,
          totalTests: results.totalTests,
          duration: results.duration,
        },
      };

      this.currentDay.timeline.push(event);
      await this.saveCurrentDay();

      console.log(`🔍 Enhanced tracking - QA: ${results.passed || 0} passed, ${results.failed || 0} failed`);
    } catch (error) {
      console.error('Error tracking QA activity:', error);
    }
  }

  /**
   * Track review requests
   */
  async trackReview(ticketId, reviewer, requester, metadata = {}) {
    if (!this.config.trackingEnabled) return;

    try {
      this.currentDay.metrics.reviewRequests++;

      const event = {
        type: 'review',
        ticketId,
        reviewer,
        requester,
        timestamp: new Date(),
        metadata,
      };

      this.currentDay.timeline.push(event);
      await this.saveCurrentDay();
    } catch (error) {
      console.error('Error tracking review:', error);
    }
  }

  /**
   * Get comprehensive current statistics
   */
  getCurrentStats() {
    const agentStats = {};
    for (const [agentId, stats] of this.currentDay.agents) {
      agentStats[agentId] = {
        ...stats,
        total: (stats.approved || 0) + (stats.pushed || 0),
        productivity: this.calculateAgentProductivity(stats),
        avgProcessingTime:
          stats.totalProcessingTime && stats.processedTickets ? stats.totalProcessingTime / stats.processedTickets : 0,
      };
    }

    const sessionDuration = Date.now() - this.currentDay.startTime.getTime();
    const hoursActive = sessionDuration / (1000 * 60 * 60);
    const totalTickets = this.currentDay.metrics.approved + this.currentDay.metrics.pushed;

    // Find peak hours
    const peakHour = this.currentDay.hourlyDistribution.indexOf(Math.max(...this.currentDay.hourlyDistribution));

    return {
      date: this.currentDay.date,
      metrics: { ...this.currentDay.metrics },

      // Summary stats
      summary: {
        totalTickets,
        activeAgents: this.currentDay.agents.size,
        productivity: hoursActive > 0 ? totalTickets / hoursActive : 0,
        qualityScore: this.calculateQualityScore(),
        complexityDistribution: {
          simple: this.currentDay.metrics.simpleTickets,
          medium: this.currentDay.metrics.mediumTickets,
          complex: this.currentDay.metrics.complexTickets,
        },
      },

      // Agent breakdown
      agents: {
        count: this.currentDay.agents.size,
        breakdown: agentStats,
        topPerformer: this.getTopPerformer(),
      },

      // Time analysis
      timeAnalysis: {
        sessionDuration,
        hoursActive: Math.round(hoursActive * 100) / 100,
        peakHour: peakHour >= 0 ? `${peakHour}:00` : 'No activity',
        hourlyDistribution: this.currentDay.hourlyDistribution,
      },

      // Story/Epic progress
      storyProgress: Object.fromEntries(this.currentDay.stories),
      epicProgress: Object.fromEntries(this.currentDay.epics),

      // Timeline
      timeline: this.currentDay.timeline,
      lastUpdate: this.currentDay.lastUpdate,
    };
  }

  /**
   * Generate comprehensive daily report
   */
  async generateEnhancedReport(includeTimeline = false) {
    const currentStats = this.getCurrentStats();
    const historicalStats = await this.getHistoricalStats(30); // Last 30 days
    const trends = await this.calculateTrends();
    const performance = await this.getPerformanceMetrics();

    const report = {
      summary: {
        date: currentStats.date,
        totalTickets: currentStats.summary.totalTickets,
        productivity: currentStats.summary.productivity,
        qualityScore: currentStats.summary.qualityScore,
        activeAgents: currentStats.agents.count,
        sessionHours: currentStats.timeAnalysis.hoursActive,
      },

      // Detailed metrics
      metrics: currentStats.metrics,

      // Agent performance
      agents: {
        count: currentStats.agents.count,
        topPerformer: currentStats.agents.topPerformer,
        breakdown: currentStats.agents.breakdown,
      },

      // Complexity analysis
      complexity: currentStats.summary.complexityDistribution,

      // Type distribution
      typeDistribution: {
        features: currentStats.metrics.features,
        bugfixes: currentStats.metrics.bugfixes,
        refactoring: currentStats.metrics.refactoring,
        documentation: currentStats.metrics.documentation,
        tests: currentStats.metrics.tests,
        infrastructure: currentStats.metrics.infrastructure,
      },

      // Quality metrics
      quality: {
        qaApproved: currentStats.metrics.qaApproved,
        qaFailed: currentStats.metrics.qaFailed,
        qaRetries: currentStats.metrics.qaRetries,
        qualityScore: currentStats.summary.qualityScore,
        avgApprovalTime: currentStats.metrics.avgApprovalTime,
      },

      // Time analysis
      timeAnalysis: currentStats.timeAnalysis,

      // Historical comparison
      historical: historicalStats,

      // Trend analysis
      trends,

      // Performance insights
      performance,

      // Milestones achieved
      milestones: this.checkDailyMilestones(currentStats),

      // Story/Epic progress
      projectProgress: {
        stories: currentStats.storyProgress,
        epics: currentStats.epicProgress,
      },

      timestamp: new Date(),
    };

    if (includeTimeline) {
      report.timeline = currentStats.timeline;
    }

    // Save report for historical reference
    await this.saveReport(report);

    return report;
  }

  /**
   * Get historical statistics with trend analysis
   */
  async getHistoricalStats(days = 30) {
    try {
      const history = await this.loadHistory();
      const recentDays = history.slice(-days);

      if (recentDays.length === 0) {
        return this.getEmptyHistoricalStats();
      }

      const totalTickets = recentDays.reduce(
        (sum, day) => sum + (day.metrics?.approved || 0) + (day.metrics?.pushed || 0),
        0
      );

      const avgProductivity =
        recentDays.reduce((sum, day) => sum + (day.summary?.productivity || 0), 0) / recentDays.length;

      const avgQuality = recentDays.reduce((sum, day) => sum + (day.summary?.qualityScore || 0), 0) / recentDays.length;

      // Calculate week-over-week trend
      const thisWeek = recentDays.slice(-7);
      const lastWeek = recentDays.slice(-14, -7);

      const thisWeekTotal = thisWeek.reduce(
        (sum, day) => sum + (day.metrics?.approved || 0) + (day.metrics?.pushed || 0),
        0
      );
      const lastWeekTotal = lastWeek.reduce(
        (sum, day) => sum + (day.metrics?.approved || 0) + (day.metrics?.pushed || 0),
        0
      );

      const weeklyTrend = lastWeekTotal > 0 ? (((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(1) : 0;

      return {
        days: recentDays.length,
        totalTickets,
        avgPerDay: Math.round((totalTickets / recentDays.length) * 100) / 100,
        avgProductivity: Math.round(avgProductivity * 100) / 100,
        avgQuality: Math.round(avgQuality * 100) / 100,
        weeklyTrend: `${weeklyTrend > 0 ? '+' : ''}${weeklyTrend}%`,
        dailyBreakdown: recentDays.map(day => ({
          date: day.date,
          tickets: (day.metrics?.approved || 0) + (day.metrics?.pushed || 0),
          quality: day.summary?.qualityScore || 0,
          agents: day.agents?.count || 0,
        })),
      };
    } catch (error) {
      console.error('Error getting historical stats:', error);
      return this.getEmptyHistoricalStats();
    }
  }

  // Enhanced helper methods

  updateAgentStats(agentId, type, count = 1, metadata = {}) {
    if (!this.currentDay.agents.has(agentId)) {
      this.currentDay.agents.set(agentId, {
        approved: 0,
        pushed: 0,
        qaApproved: 0,
        qaFailed: 0,
        reviews: 0,
        totalProcessingTime: 0,
        processedTickets: 0,
        ticketTypes: new Map(),
        complexityHandled: new Map(),
        lastActivity: new Date(),
        sessionStart: new Date(),
      });
    }

    const stats = this.currentDay.agents.get(agentId);
    stats[type] += count;
    stats.lastActivity = new Date();

    // Track processing time if available
    if (metadata.processingTime) {
      stats.totalProcessingTime += metadata.processingTime;
      stats.processedTickets += count;
    }

    // Track ticket types
    if (metadata.type || metadata.wipClass) {
      const ticketType = this.normalizeTicketType(metadata.type || metadata.wipClass);
      stats.ticketTypes.set(ticketType, (stats.ticketTypes.get(ticketType) || 0) + count);
    }

    // Track complexity
    const complexity = this.getComplexityFromEstimate(metadata.estimate);
    if (complexity) {
      stats.complexityHandled.set(complexity, (stats.complexityHandled.get(complexity) || 0) + count);
    }
  }

  trackComplexity(estimate) {
    const hours = this.parseEstimate(estimate);
    if (hours < 1) {
      this.currentDay.metrics.simpleTickets++;
    } else if (hours <= 4) {
      this.currentDay.metrics.mediumTickets++;
    } else {
      this.currentDay.metrics.complexTickets++;
    }
  }

  trackTicketType(type) {
    const normalizedType = this.normalizeTicketType(type);
    if (normalizedType && this.currentDay.metrics.hasOwnProperty(normalizedType)) {
      this.currentDay.metrics[normalizedType]++;
    }
  }

  trackStoryEpic(storyId, epicId) {
    if (storyId) {
      this.currentDay.stories.set(storyId, (this.currentDay.stories.get(storyId) || 0) + 1);
    }
    if (epicId) {
      this.currentDay.epics.set(epicId, (this.currentDay.epics.get(epicId) || 0) + 1);
    }
  }

  normalizeTicketType(type) {
    if (!type) return 'features'; // default

    const typeMap = {
      feat: 'features',
      feature: 'features',
      bug: 'bugfixes',
      fix: 'bugfixes',
      refactor: 'refactoring',
      docs: 'documentation',
      test: 'tests',
      infra: 'infrastructure',
      infrastructure: 'infrastructure',
    };

    return typeMap[type.toLowerCase()] || 'features';
  }

  getComplexityFromEstimate(estimate) {
    const hours = this.parseEstimate(estimate);
    if (hours < 1) return 'simple';
    if (hours <= 4) return 'medium';
    return 'complex';
  }

  parseEstimate(estimate) {
    if (typeof estimate === 'number') return estimate;
    if (typeof estimate === 'string') {
      const match = estimate.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : 1;
    }
    return 1; // default
  }

  calculateQualityScore() {
    const total = this.currentDay.metrics.qaApproved + this.currentDay.metrics.qaFailed;
    if (total === 0) return 100; // No QA data yet

    return Math.round((this.currentDay.metrics.qaApproved / total) * 100);
  }

  calculateAgentProductivity(stats) {
    const sessionDuration = Date.now() - stats.sessionStart.getTime();
    const hoursActive = sessionDuration / (1000 * 60 * 60);
    const totalTickets = (stats.approved || 0) + (stats.pushed || 0);

    return hoursActive > 0 ? Math.round((totalTickets / hoursActive) * 100) / 100 : 0;
  }

  getTopPerformer() {
    let topAgent = null;
    let maxScore = 0;

    for (const [agentId, stats] of this.currentDay.agents) {
      const score = (stats.approved || 0) + (stats.pushed || 0);
      if (score > maxScore) {
        maxScore = score;
        topAgent = {
          agentId,
          score,
          approved: stats.approved || 0,
          pushed: stats.pushed || 0,
        };
      }
    }

    return topAgent;
  }

  async saveReport(report) {
    const reportsDir = path.join(this.dataDir, 'reports');
    await this.ensureDirectory(reportsDir);

    const fileName = `daily-report-${report.summary.date.replace(/\//g, '-')}.json`;
    const filePath = path.join(reportsDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  }

  getEmptyHistoricalStats() {
    return {
      days: 0,
      totalTickets: 0,
      avgPerDay: 0,
      avgProductivity: 0,
      avgQuality: 100,
      weeklyTrend: '0%',
      dailyBreakdown: [],
    };
  }

  async setupTimers() {
    this.setupMidnightReset();
    this.setupAutoSave();
  }

  setupAutoSave() {
    // Auto-save every 5 minutes
    this.autoSaveTimer = setInterval(
      async () => {
        try {
          await this.saveCurrentDay();
        } catch (error) {
          console.error('Auto-save error:', error);
        }
      },
      5 * 60 * 1000
    );
  }

  // Missing methods that need to be implemented

  updateProcessingTime(processingTime) {
    // Update average processing time
    const currentAvg = this.currentDay.metrics.avgProcessingTime;
    const totalTickets = this.currentDay.metrics.approved + this.currentDay.metrics.pushed;

    if (totalTickets === 1) {
      this.currentDay.metrics.avgProcessingTime = processingTime;
    } else {
      this.currentDay.metrics.avgProcessingTime = (currentAvg * (totalTickets - 1) + processingTime) / totalTickets;
    }
  }

  updateCommitSize(count) {
    // Update average commit size
    const currentAvg = this.currentDay.metrics.avgCommitSize;
    const totalCommits = this.currentDay.metrics.committed;

    if (totalCommits === 1) {
      this.currentDay.metrics.avgCommitSize = count;
    } else {
      this.currentDay.metrics.avgCommitSize = (currentAvg * (totalCommits - 1) + count) / totalCommits;
    }
  }

  async trackIndividualPush(ticketId, agentId, metadata) {
    // Track complexity and type for individual tickets in a push
    this.trackComplexity(metadata.estimate || metadata.hours);
    this.trackTicketType(metadata.type || metadata.wipClass);
    this.trackStoryEpic(metadata.story, metadata.epic);
  }

  async calculateTrends() {
    try {
      const history = await this.loadHistory();
      if (history.length < 7) {
        return {
          productivity: 'insufficient_data',
          quality: 'insufficient_data',
          complexity: 'insufficient_data',
        };
      }

      const last7Days = history.slice(-7);
      const previous7Days = history.slice(-14, -7);

      const last7Productivity = last7Days.reduce((sum, day) => sum + (day.summary?.productivity || 0), 0) / 7;
      const prev7Productivity = previous7Days.reduce((sum, day) => sum + (day.summary?.productivity || 0), 0) / 7;

      const productivityTrend =
        prev7Productivity > 0 ? (((last7Productivity - prev7Productivity) / prev7Productivity) * 100).toFixed(1) : 0;

      return {
        productivity: `${productivityTrend > 0 ? '+' : ''}${productivityTrend}%`,
        quality: 'stable', // Simplified for now
        complexity: 'balanced', // Simplified for now
      };
    } catch (error) {
      console.error('Error calculating trends:', error);
      return {
        productivity: 'error',
        quality: 'error',
        complexity: 'error',
      };
    }
  }

  async getPerformanceMetrics() {
    return {
      avgTicketsPerHour:
        this.getCurrentStats().timeAnalysis.hoursActive > 0
          ? (this.currentDay.metrics.approved + this.currentDay.metrics.pushed) /
            this.getCurrentStats().timeAnalysis.hoursActive
          : 0,
      peakProductivityHour: this.getCurrentStats().timeAnalysis.peakHour,
      qualityTrend: 'stable',
      bottlenecks: [],
    };
  }

  checkDailyMilestones(stats) {
    const milestones = [];
    const total = stats.summary.totalTickets;

    if (total >= 100) milestones.push('Century Club (100+)');
    else if (total >= 75) milestones.push('Productivity Champion (75+)');
    else if (total >= 50) milestones.push('High Achiever (50+)');
    else if (total >= 25) milestones.push('Strong Performance (25+)');
    else if (total >= 10) milestones.push('Good Progress (10+)');

    if (stats.agents.count >= 5) milestones.push('Team Collaboration (5+ agents)');
    if (stats.summary.productivity >= 10) milestones.push('Speed Demon (10+ per hour)');

    return milestones;
  }

  async checkMilestones() {
    const total = this.currentDay.metrics.approved + this.currentDay.metrics.pushed;
    const milestones = [10, 25, 50, 75, 100];

    for (const milestone of milestones) {
      if (total === milestone && this.config.enableNotifications) {
        console.log(`🎉 Milestone reached: ${milestone} tickets completed today!`);
        await this.logEvent('milestone', `${milestone} tickets completed`);
      }
    }
  }

  async logEvent(type, message) {
    if (!this.config.detailedLogging) return;

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  // Data management methods

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async ensureDirectory(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch {
      // Use defaults, save initial config
      await this.saveConfig();
    }
  }

  async saveConfig() {
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  async loadCurrentDay() {
    try {
      const data = await fs.readFile(this.currentDayFile, 'utf8');
      const parsed = JSON.parse(data);

      // Check if it's the same day
      if (parsed.date === this.getCurrentDateCT()) {
        this.currentDay = {
          ...parsed,
          agents: new Map(Object.entries(parsed.agents || {})),
          stories: new Map(Object.entries(parsed.stories || {})),
          epics: new Map(Object.entries(parsed.epics || {})),
          startTime: new Date(parsed.startTime),
          lastUpdate: new Date(parsed.lastUpdate),
        };
      } else {
        // Different day, archive old data and start fresh
        if (parsed.date) {
          await this.archiveDay(parsed);
        }
      }
    } catch {
      // File doesn't exist or is corrupted, start fresh
    }
  }

  async saveCurrentDay() {
    const data = {
      ...this.currentDay,
      agents: Object.fromEntries(this.currentDay.agents),
      stories: Object.fromEntries(this.currentDay.stories),
      epics: Object.fromEntries(this.currentDay.epics),
    };
    await fs.writeFile(this.currentDayFile, JSON.stringify(data, null, 2));
  }

  async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveHistory(history) {
    await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
  }

  async archiveDay(dayData) {
    const history = await this.loadHistory();

    const archiveEntry = {
      date: dayData.date,
      metrics: dayData.metrics || {},
      summary: {
        totalTickets: (dayData.metrics?.approved || 0) + (dayData.metrics?.pushed || 0),
        activeAgents: dayData.agents ? Object.keys(dayData.agents).length : 0,
        productivity: 0, // Calculate if needed
        qualityScore:
          dayData.metrics?.qaApproved && dayData.metrics?.qaFailed
            ? Math.round((dayData.metrics.qaApproved / (dayData.metrics.qaApproved + dayData.metrics.qaFailed)) * 100)
            : 100,
      },
      agents: {
        count: dayData.agents ? Object.keys(dayData.agents).length : 0,
        breakdown: dayData.agents || {},
      },
      timeline: dayData.timeline || [],
      archivedAt: new Date(),
    };

    // Remove existing entry for same date
    const filteredHistory = history.filter(h => h.date !== dayData.date);
    filteredHistory.push(archiveEntry);

    // Sort by date
    filteredHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    await this.saveHistory(filteredHistory);
  }

  getCurrentDateCT() {
    return new Date().toLocaleDateString('en-US', {
      timeZone: this.centralTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getNextMidnightCT() {
    // Simple approach: get next local midnight and add 24 hours for safety
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return tomorrow;
  }

  getCentralTimeOffset() {
    // Central Standard Time is UTC-6, Central Daylight Time is UTC-5
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);

    const stdTimezoneOffset = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());

    const isDST = now.getTimezoneOffset() < stdTimezoneOffset;
    return isDST ? -5 * 3600000 : -6 * 3600000; // Convert hours to milliseconds
  }

  setupMidnightReset() {
    // Clear existing timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    const nextMidnight = this.getNextMidnightCT();
    const msUntilMidnight = nextMidnight.getTime() - Date.now();

    console.log(
      `⏰ Next reset scheduled for: ${nextMidnight.toLocaleString()} (${Math.round(msUntilMidnight / 1000 / 60)} minutes)`
    );

    this.resetTimer = setTimeout(async () => {
      await this.resetDaily();
      // Schedule next reset
      this.setupMidnightReset();
    }, msUntilMidnight);
  }

  async resetDaily() {
    try {
      console.log('🕛 Enhanced daily reset triggered - archiving current day...');

      // Archive current day to history
      await this.archiveDay(this.currentDay);

      // Reset current day
      this.currentDay = {
        date: this.getCurrentDateCT(),
        metrics: {
          approved: 0,
          pushed: 0,
          committed: 0,
          merged: 0,
          qaApproved: 0,
          qaFailed: 0,
          qaRetries: 0,
          reviewRequests: 0,
          avgProcessingTime: 0,
          avgApprovalTime: 0,
          avgCommitSize: 0,
          simpleTickets: 0,
          mediumTickets: 0,
          complexTickets: 0,
          features: 0,
          bugfixes: 0,
          refactoring: 0,
          documentation: 0,
          tests: 0,
          infrastructure: 0,
        },
        agents: new Map(),
        timeline: [],
        stories: new Map(),
        epics: new Map(),
        hourlyDistribution: new Array(24).fill(0),
        peakHours: [],
        startTime: new Date(),
        lastUpdate: new Date(),
        uptime: 0,
      };

      // Save reset day
      await this.saveCurrentDay();

      console.log(`✅ Enhanced daily reset complete - tracking for ${this.currentDay.date}`);

      // Log reset event
      await this.logEvent('system', 'Enhanced daily reset completed');
    } catch (error) {
      console.error('❌ Error during enhanced daily reset:', error);
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    await this.saveCurrentDay();
    console.log('📊 Enhanced Daily Ticket Tracker shutdown complete');
  }
}

module.exports = EnhancedTicketTracker;
