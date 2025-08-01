/**
 * Daily Ticket Tracker Utility
 * 
 * Tracks and logs daily ticket completion statistics with automatic 
 * midnight Central Time reset functionality.
 * 
 * Features:
 * - Real-time tracking of approved and pushed tickets
 * - Daily statistics with agent breakdown
 * - Automatic midnight CT reset
 * - Historical data retention
 * - Performance metrics and trends
 */

const fs = require('fs').promises;
const path = require('path');

class DailyTicketTracker {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.dailyLogFile = path.join(this.dataDir, 'daily-ticket-log.json');
    this.historyFile = path.join(this.dataDir, 'ticket-history.json');
    this.configFile = path.join(this.dataDir, 'tracker-config.json');
    
    // Central Time zone offset (UTC-6 standard, UTC-5 daylight)
    this.centralTimeZone = 'America/Chicago';
    
    // Current day's data
    this.currentDay = {
      date: this.getCurrentDateCT(),
      approved: 0,
      pushed: 0,
      agents: new Map(),
      timeline: [],
      startTime: new Date(),
      lastUpdate: new Date()
    };
    
    // Configuration
    this.config = {
      resetTime: '00:00', // Midnight CT
      retentionDays: 90,
      enableNotifications: true,
      trackingEnabled: true,
      detailedLogging: true
    };
    
    this.initialized = false;
    this.resetTimer = null;


  /**
   * Initialize the tracker
   */
  async initialize() {
    try {
      // Ensure data directory exists
      await this.ensureDataDirectory();
      
      // Load configuration
      await this.loadConfig();
      
      // Load current day data
      await this.loadCurrentDay();
      
      // Set up midnight reset timer
      this.setupMidnightReset();
      
      this.initialized = true;
      console.log('✅ Daily Ticket Tracker initialized successfully');
      
      // Log initialization
      await this.logEvent('system', 'Tracker initialized');
 catch (error) {
      console.error('❌ Failed to initialize Daily Ticket Tracker:', error);
      throw error;



  /**
   * Track a ticket approval
   */
  async trackApproval(ticketId, agentId = 'unknown', metadata = {}) {
    if (!this.config.trackingEnabled) return;
    
    try {
      this.currentDay.approved++;
      this.updateAgentStats(agentId, 'approved');
      
      const event = {
        type: 'approval',
        ticketId,
        agentId,
        timestamp: new Date(),
        metadata
      };
      
      this.currentDay.timeline.push(event);
      this.currentDay.lastUpdate = new Date();
      
      await this.saveCurrentDay();
      
      if (this.config.detailedLogging) {
        console.log(`📋 Ticket approved: ${ticketId} by ${agentId}`);

      
      // Check for milestones
      await this.checkMilestones();
 catch (error) {
      console.error('Error tracking approval:', error);



  /**
   * Track a ticket push/commit
   */
  async trackPush(ticketIds = [], agentId = 'unknown', commitHash = '', metadata = {}) {
    if (!this.config.trackingEnabled) return;
    
    try {
      const count = Array.isArray(ticketIds) ? ticketIds.length : 1;
      this.currentDay.pushed += count;
      this.updateAgentStats(agentId, 'pushed', count);
      
      const event = {
        type: 'push',
        ticketIds: Array.isArray(ticketIds) ? ticketIds : [ticketIds],
        agentId,
        commitHash,
        timestamp: new Date(),
        count,
        metadata
      };
      
      this.currentDay.timeline.push(event);
      this.currentDay.lastUpdate = new Date();
      
      await this.saveCurrentDay();
      
      if (this.config.detailedLogging) {
        console.log(`🚀 ${count} ticket(s) pushed by ${agentId}: ${commitHash}`);

      
      // Check for milestones
      await this.checkMilestones();
 catch (error) {
      console.error('Error tracking push:', error);



  /**
   * Get current day statistics
   */
  getCurrentStats() {
    const agentStats = {};
    for (const [agentId, stats] of this.currentDay.agents) {
      agentStats[agentId] = {
        approved: stats.approved || 0,
        pushed: stats.pushed || 0,
        total: (stats.approved || 0) + (stats.pushed || 0),
        lastActivity: stats.lastActivity
      };

    
    const sessionDuration = Date.now() - this.currentDay.startTime.getTime();
    const hoursActive = sessionDuration / (1000 * 60 * 60);
    
    return {
      date: this.currentDay.date,
      approved: this.currentDay.approved,
      pushed: this.currentDay.pushed,
      total: this.currentDay.approved + this.currentDay.pushed,
      agents: {
        count: this.currentDay.agents.size,
        breakdown: agentStats
      },
      timeline: this.currentDay.timeline,
      session: {
        startTime: this.currentDay.startTime,
        duration: sessionDuration,
        hoursActive: Math.round(hoursActive * 100) / 100,
        avgTicketsPerHour: hoursActive > 0 ? Math.round((this.currentDay.approved + this.currentDay.pushed) / hoursActive * 100) / 100 : 0
      },
      lastUpdate: this.currentDay.lastUpdate
    };


  /**
   * Get historical statistics
   */
  async getHistoricalStats(days = 7) {
    try {
      const history = await this.loadHistory();
      const recentDays = history.slice(-days);
      
      if (recentDays.length === 0) {
        return {
          days: 0,
          totalApproved: 0,
          totalPushed: 0,
          avgPerDay: 0,
          trend: 'stable',
          dailyBreakdown: []
        };

      
      const totalApproved = recentDays.reduce((sum, day) => sum + (day.approved || 0), 0);
      const totalPushed = recentDays.reduce((sum, day) => sum + (day.pushed || 0), 0);
      const total = totalApproved + totalPushed;
      
      // Calculate trend
      const firstHalf = recentDays.slice(0, Math.floor(recentDays.length / 2));
      const secondHalf = recentDays.slice(Math.floor(recentDays.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, day) => sum + (day.approved || 0) + (day.pushed || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, day) => sum + (day.approved || 0) + (day.pushed || 0), 0) / secondHalf.length;
      
      let trend = 'stable';
      if (secondAvg > firstAvg * 1.1) trend = 'improving';
      else if (secondAvg < firstAvg * 0.9) trend = 'declining';
      
      return {
        days: recentDays.length,
        totalApproved,
        totalPushed,
        total,
        avgPerDay: Math.round(total / recentDays.length * 100) / 100,
        trend,
        dailyBreakdown: recentDays.map(day => ({
          date: day.date,
          approved: day.approved || 0,
          pushed: day.pushed || 0,
          total: (day.approved || 0) + (day.pushed || 0),
          agents: day.agentCount || 0
        }))
      };
 catch (error) {
      console.error('Error getting historical stats:', error);
      return null;



  /**
   * Generate daily report
   */
  async generateDailyReport(includeTimeline = false) {
    const currentStats = this.getCurrentStats();
    const historicalStats = await this.getHistoricalStats(7);
    
    const report = {
      summary: {
        date: currentStats.date,
        approved: currentStats.approved,
        pushed: currentStats.pushed,
        total: currentStats.total,
        activeAgents: currentStats.agents.count,
        productivity: currentStats.session.avgTicketsPerHour
      },
      agents: currentStats.agents.breakdown,
      session: currentStats.session,
      historical: historicalStats,
      milestones: this.checkDailyMilestones(currentStats),
      timestamp: new Date()
    };
    
    if (includeTimeline) {
      report.timeline = currentStats.timeline;

    
    return report;


  /**
   * Reset daily counters (called at midnight CT)
   */
  async resetDaily() {
    try {
      console.log('🕛 Daily reset triggered - archiving current day...');
      
      // Archive current day to history
      await this.archiveCurrentDay();
      
      // Reset current day
      this.currentDay = {
        date: this.getCurrentDateCT(),
        approved: 0,
        pushed: 0,
        agents: new Map(),
        timeline: [],
        startTime: new Date(),
        lastUpdate: new Date()
      };
      
      // Save reset day
      await this.saveCurrentDay();
      
      // Clean up old history
      await this.cleanupHistory();
      
      console.log(`✅ Daily reset complete - tracking for ${this.currentDay.date}`);
      
      // Log reset event
      await this.logEvent('system', 'Daily reset completed');
 catch (error) {
      console.error('❌ Error during daily reset:', error);



  /**
   * Manual reset (for testing or admin use)
   */
  async manualReset() {
    console.log('⚡ Manual reset triggered...');
    await this.resetDaily();


  // Private helper methods

  private async ensureDataDirectory() {
    try {
      await fs.access(this.dataDir);
 catch {
      await fs.mkdir(this.dataDir, { recursive: true });



  private async loadConfig() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(configData) };
 catch {
      // Use defaults, save initial config
      await this.saveConfig();



  private async saveConfig() {
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));


  private async loadCurrentDay() {
    try {
      const data = await fs.readFile(this.dailyLogFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Check if it's the same day
      if (parsed.date === this.getCurrentDateCT()) {
        this.currentDay = {
          ...parsed,
          agents: new Map(Object.entries(parsed.agents || {})),
          startTime: new Date(parsed.startTime),
          lastUpdate: new Date(parsed.lastUpdate)
        };
 else {
        // Different day, archive old data and start fresh
        if (parsed.date) {
          await this.archiveDay(parsed);


 catch {
      // File doesn't exist or is corrupted, start fresh



  private async saveCurrentDay() {
    const data = {
      ...this.currentDay,
      agents: Object.fromEntries(this.currentDay.agents)
    };
    await fs.writeFile(this.dailyLogFile, JSON.stringify(data, null, 2));


  private async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf8');
      return JSON.parse(data);
 catch {
      return [];



  private async saveHistory(history) {
    await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));


  private async archiveCurrentDay() {
    if (this.currentDay.approved === 0 && this.currentDay.pushed === 0) {
      return; // Don't archive empty days

    
    await this.archiveDay(this.currentDay);


  private async archiveDay(dayData) {
    const history = await this.loadHistory();
    
    const archiveEntry = {
      date: dayData.date,
      approved: dayData.approved || 0,
      pushed: dayData.pushed || 0,
      agentCount: dayData.agents ? dayData.agents.size : 0,
      agents: dayData.agents ? Object.fromEntries(dayData.agents) : {},
      timeline: dayData.timeline || [],
      sessionDuration: dayData.lastUpdate && dayData.startTime 
        ? new Date(dayData.lastUpdate).getTime() - new Date(dayData.startTime).getTime()
        : 0,
      archivedAt: new Date()
    };
    
    // Remove existing entry for same date
    const filteredHistory = history.filter(h => h.date !== dayData.date);
    filteredHistory.push(archiveEntry);
    
    // Sort by date
    filteredHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    await this.saveHistory(filteredHistory);


  private async cleanupHistory() {
    if (this.config.retentionDays <= 0) return;
    
    const history = await this.loadHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    const filteredHistory = history.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );
    
    if (filteredHistory.length !== history.length) {
      await this.saveHistory(filteredHistory);
      console.log(`🧹 Cleaned up ${history.length - filteredHistory.length} old history entries`);



  private updateAgentStats(agentId, type, count = 1) {
    if (!this.currentDay.agents.has(agentId)) {
      this.currentDay.agents.set(agentId, {
        approved: 0,
        pushed: 0,
        lastActivity: new Date()
      });

    
    const stats = this.currentDay.agents.get(agentId);
    stats[type] += count;
    stats.lastActivity = new Date();


  private getCurrentDateCT() {
    return new Date().toLocaleDateString('en-US', {
      timeZone: this.centralTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });


  private getNextMidnightCT() {
    const now = new Date();
    const centralTime = new Date(now.toLocaleString('en-US', { timeZone: this.centralTimeZone }));
    
    // Get next midnight Central Time
    const nextMidnight = new Date(centralTime);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    
    // Convert back to local time
    const utcOffset = now.getTimezoneOffset() * 60000;
    const centralOffset = this.getCentralTimeOffset();
    const localMidnight = new Date(nextMidnight.getTime() + centralOffset - utcOffset);
    
    return localMidnight;


  private getCentralTimeOffset() {
    // Central Standard Time is UTC-6, Central Daylight Time is UTC-5
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    
    const stdTimezoneOffset = Math.max(
      january.getTimezoneOffset(),
      july.getTimezoneOffset()
    );
    
    const isDST = now.getTimezoneOffset() < stdTimezoneOffset;
    return isDST ? -5 * 3600000 : -6 * 3600000; // Convert hours to milliseconds


  private setupMidnightReset() {
    // Clear existing timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);

    
    const nextMidnight = this.getNextMidnightCT();
    const msUntilMidnight = nextMidnight.getTime() - Date.now();
    
    console.log(`⏰ Next reset scheduled for: ${nextMidnight.toLocaleString()} (${Math.round(msUntilMidnight / 1000 / 60)} minutes)`);
    
    this.resetTimer = setTimeout(async () => {
      await this.resetDaily();
      // Schedule next reset
      this.setupMidnightReset();
    }, msUntilMidnight);


  private async checkMilestones() {
    const total = this.currentDay.approved + this.currentDay.pushed;
    const milestones = [10, 25, 50, 75, 100];
    
    for (const milestone of milestones) {
      if (total === milestone && this.config.enableNotifications) {
        console.log(`🎉 Milestone reached: ${milestone} tickets completed today!`);
        await this.logEvent('milestone', `${milestone} tickets completed`);




  private checkDailyMilestones(stats) {
    const milestones = [];
    const total = stats.total;
    
    if (total >= 100) milestones.push('Century Club (100+)');
    else if (total >= 75) milestones.push('Productivity Champion (75+)');
    else if (total >= 50) milestones.push('High Achiever (50+)');
    else if (total >= 25) milestones.push('Strong Performance (25+)');
    else if (total >= 10) milestones.push('Good Progress (10+)');
    
    if (stats.agents.count >= 5) milestones.push('Team Collaboration (5+ agents)');
    if (stats.session.avgTicketsPerHour >= 10) milestones.push('Speed Demon (10+ per hour)');
    
    return milestones;


  private async logEvent(type, message) {
    if (!this.config.detailedLogging) return;
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);


  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);

    
    await this.saveCurrentDay();
    console.log('📊 Daily Ticket Tracker shutdown complete');



module.exports = DailyTicketTracker;