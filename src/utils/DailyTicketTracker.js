/**
 * Daily Ticket Tracker Utility
 *
 * Tracks and logs daily ticket completion statistics with automatic
 * midnight Central Time reset functionality.
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIRECTORY = path.join(__dirname, '../data');
const DAILY_LOG_FILE = path.join(DATA_DIRECTORY, 'daily-ticket-log.json');
const HISTORY_FILE = path.join(DATA_DIRECTORY, 'ticket-history.json');
const CONFIG_FILE = path.join(DATA_DIRECTORY, 'tracker-config.json');

const DEFAULT_CONFIG = {
  resetTime: '00:00',
  retentionDays: 90,
  enableNotifications: true,
  trackingEnabled: true,
  detailedLogging: true
};

class DailyTicketTracker {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.centralTimeZone = 'America/Chicago';
    this.currentDay = this.createEmptyDay();
    this.initialized = false;
    this.resetTimer = null;
  }

  /**
   * Initialise tracker by loading configuration and current day state.
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadConfig();
      await this.loadCurrentDay();
      this.setupMidnightReset();
      this.initialized = true;
      await this.logEvent('system', 'Tracker initialized');
      if (this.config.detailedLogging) {
        console.log('✅ Daily Ticket Tracker initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Daily Ticket Tracker:', error);
      throw error;
    }
  }

  /**
   * Record an approved ticket.
   */
  async trackApproval(ticketId, agentId = 'unknown', metadata = {}) {
    if (!this.config.trackingEnabled) {
      return;
    }

    try {
      this.currentDay.approved += 1;
      this.updateAgentStats(agentId, 'approved');

      const event = {
        type: 'approval',
        ticketIds: [ticketId],
        agentId,
        metadata,
        timestamp: new Date().toISOString()
      };

      this.currentDay.timeline.push(event);
      this.currentDay.lastUpdate = new Date();
      await this.saveCurrentDay();

      if (this.config.detailedLogging) {
        console.log(`📋 Ticket approved: ${ticketId} by ${agentId}`);
      }

      await this.checkMilestones();
    } catch (error) {
      console.error('Error tracking approval:', error);
    }
  }

  /**
   * Record a push/commit event.
   */
  async trackPush(ticketIds = [], agentId = 'unknown', commitHash = '', metadata = {}) {
    if (!this.config.trackingEnabled) {
      return;
    }

    try {
      const ids = Array.isArray(ticketIds) ? ticketIds : [ticketIds];
      const count = ids.length;
      this.currentDay.pushed += count;
      this.updateAgentStats(agentId, 'pushed', count);

      const event = {
        type: 'push',
        ticketIds: ids,
        agentId,
        commitHash,
        metadata,
        count,
        timestamp: new Date().toISOString()
      };

      this.currentDay.timeline.push(event);
      this.currentDay.lastUpdate = new Date();
      await this.saveCurrentDay();

      if (this.config.detailedLogging) {
        console.log(`🚀 ${count} ticket(s) pushed by ${agentId}: ${commitHash}`);
      }

      await this.checkMilestones();
    } catch (error) {
      console.error('Error tracking push:', error);
    }
  }

  /**
   * Current day's statistics.
   */
  getCurrentStats() {
    const agents = {};
    for (const [agentId, stats] of this.currentDay.agents.entries()) {
      agents[agentId] = {
        approved: stats.approved,
        pushed: stats.pushed,
        total: stats.approved + stats.pushed,
        lastActivity: stats.lastActivity
      };
    }

    const sessionDurationMs = Date.now() - this.currentDay.startTime.getTime();
    const hoursActive = sessionDurationMs / (1000 * 60 * 60);
    const totalTickets = this.currentDay.approved + this.currentDay.pushed;

    return {
      date: this.currentDay.date,
      approved: this.currentDay.approved,
      pushed: this.currentDay.pushed,
      total: totalTickets,
      agents: {
        count: this.currentDay.agents.size,
        breakdown: agents
      },
      timeline: [...this.currentDay.timeline],
      session: {
        startTime: this.currentDay.startTime,
        durationMs: sessionDurationMs,
        hoursActive: Number(hoursActive.toFixed(2)),
        avgTicketsPerHour:
          hoursActive > 0 ? Number((totalTickets / hoursActive).toFixed(2)) : 0
      },
      lastUpdate: this.currentDay.lastUpdate
    };
  }

  /**
   * Historical statistics for the requested number of days.
   */
  async getHistoricalStats(days = 7) {
    try {
      const history = await this.loadHistory();
      const recentDays = history.slice(-Math.max(days, 0));

      if (recentDays.length === 0) {
        return {
          days: 0,
          totalApproved: 0,
          totalPushed: 0,
          total: 0,
          avgPerDay: 0,
          trend: 'stable',
          dailyBreakdown: []
        };
      }

      const totalApproved = recentDays.reduce(
        (sum, day) => sum + (day.approved || 0),
        0
      );
      const totalPushed = recentDays.reduce(
        (sum, day) => sum + (day.pushed || 0),
        0
      );
      const total = totalApproved + totalPushed;

      const midpoint = Math.floor(recentDays.length / 2) || 1;
      const firstHalf = recentDays.slice(0, midpoint);
      const secondHalf = recentDays.slice(midpoint);

      const firstAvg =
        firstHalf.reduce(
          (sum, day) => sum + (day.approved || 0) + (day.pushed || 0),
          0
        ) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce(
          (sum, day) => sum + (day.approved || 0) + (day.pushed || 0),
          0
        ) / secondHalf.length;

      let trend = 'stable';
      if (secondAvg > firstAvg * 1.1) {
        trend = 'improving';
      } else if (secondAvg < firstAvg * 0.9) {
        trend = 'declining';
      }

      return {
        days: recentDays.length,
        totalApproved,
        totalPushed,
        total,
        avgPerDay: Number((total / recentDays.length).toFixed(2)),
        trend,
        dailyBreakdown: recentDays.map(day => ({
          date: day.date,
          approved: day.approved || 0,
          pushed: day.pushed || 0,
          total: (day.approved || 0) + (day.pushed || 0),
          agents: day.agentCount || 0
        }))
      };
    } catch (error) {
      console.error('Error getting historical stats:', error);
      return null;
    }
  }

  /**
   * Generate a report of the current day, optionally including the timeline.
   */
  async generateDailyReport(includeTimeline = false) {
    const current = this.getCurrentStats();
    const historical = await this.getHistoricalStats(7);

    const report = {
      summary: {
        date: current.date,
        approved: current.approved,
        pushed: current.pushed,
        total: current.total,
        activeAgents: current.agents.count,
        productivity: current.session.avgTicketsPerHour
      },
      agents: current.agents.breakdown,
      session: current.session,
      historical,
      milestones: this.checkDailyMilestones(current),
      timestamp: new Date().toISOString()
    };

    if (includeTimeline) {
      report.timeline = current.timeline;
    }

    return report;
  }

  /**
   * Reset counters at the end of the day.
   */
  async resetDaily() {
    try {
      if (this.config.detailedLogging) {
        console.log('🕛 Daily reset triggered - archiving current day...');
      }

      await this.archiveCurrentDay();
      this.currentDay = this.createEmptyDay();
      await this.saveCurrentDay();
      await this.cleanupHistory();
      await this.logEvent('system', 'Daily reset completed');

      if (this.config.detailedLogging) {
        console.log(`✅ Daily reset complete - tracking for ${this.currentDay.date}`);
      }
    } catch (error) {
      console.error('❌ Error during daily reset:', error);
    }
  }

  /**
   * Manual reset helper, primarily for tests/admins.
   */
  async manualReset() {
    await this.resetDaily();
  }

  /**
   * Ensure the data directory is present.
   */
  async ensureDataDirectory() {
    try {
      await fs.access(DATA_DIRECTORY);
    } catch {
      await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    }
  }

  async loadConfig() {
    try {
      const raw = await fs.readFile(CONFIG_FILE, 'utf8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      await this.saveConfig();
    }
  }

  async saveConfig() {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  async loadCurrentDay() {
    try {
      const raw = await fs.readFile(DAILY_LOG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.date === this.getCurrentDateCT()) {
        this.currentDay = {
          ...parsed,
          agents: new Map(Object.entries(parsed.agents || {})),
          startTime: parsed.startTime ? new Date(parsed.startTime) : new Date(),
          lastUpdate: parsed.lastUpdate ? new Date(parsed.lastUpdate) : new Date(),
          timeline: parsed.timeline || []
        };
        return;
      }

      if (parsed.date) {
        await this.archiveDay(parsed);
      }
    } catch {
      // fall through to create empty day
    }

    this.currentDay = this.createEmptyDay();
    await this.saveCurrentDay();
  }

  async saveCurrentDay() {
    const serialisable = {
      ...this.currentDay,
      agents: Object.fromEntries(this.currentDay.agents),
      startTime: this.currentDay.startTime.toISOString(),
      lastUpdate: this.currentDay.lastUpdate.toISOString()
    };
    await fs.writeFile(DAILY_LOG_FILE, JSON.stringify(serialisable, null, 2));
  }

  async loadHistory() {
    try {
      const raw = await fs.readFile(HISTORY_FILE, 'utf8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async saveHistory(history) {
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
  }

  async archiveCurrentDay() {
    if (this.currentDay.approved === 0 && this.currentDay.pushed === 0) {
      return;
    }

    await this.archiveDay(this.currentDay);
  }

  async archiveDay(dayData) {
    const history = await this.loadHistory();
    history.push({
      date: dayData.date,
      approved: dayData.approved || 0,
      pushed: dayData.pushed || 0,
      agentCount:
        dayData.agents instanceof Map
          ? dayData.agents.size
          : Object.keys(dayData.agents || {}).length
    });
    await this.saveHistory(history);
  }

  async cleanupHistory() {
    const history = await this.loadHistory();
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const filtered = history.filter(day => {
      const time = new Date(day.date).getTime();
      return Number.isNaN(time) || time >= cutoff;
    });
    if (filtered.length !== history.length) {
      await this.saveHistory(filtered);
    }
  }

  setupMidnightReset() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    const schedule = () => {
      const now = new Date();
      const resetTimeParts = this.config.resetTime.split(':').map(Number);
      const target = new Date(
        now.toLocaleString('en-US', { timeZone: this.centralTimeZone })
      );
      target.setHours(resetTimeParts[0] ?? 0, resetTimeParts[1] ?? 0, 0, 0);

      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();
      this.resetTimer = setTimeout(async () => {
        await this.resetDaily();
        schedule();
      }, delay);
    };

    schedule();
  }

  updateAgentStats(agentId, field, increment = 1) {
    if (!this.currentDay.agents.has(agentId)) {
      this.currentDay.agents.set(agentId, {
        approved: 0,
        pushed: 0,
        lastActivity: new Date().toISOString()
      });
    }
    const stats = this.currentDay.agents.get(agentId);
    stats[field] += increment;
    stats.lastActivity = new Date().toISOString();
  }

  async checkMilestones() {
    const total = this.currentDay.approved + this.currentDay.pushed;
    const milestones = [10, 25, 50, 100];
    if (milestones.includes(total)) {
      await this.logEvent('system', `Milestone reached: ${total} tickets`);
    }
  }

  checkDailyMilestones(currentStats) {
    const milestones = [10, 25, 50, 100];
    return milestones.filter(value => currentStats.total >= value);
  }

  async logEvent(actor, message, extra = {}) {
    const event = {
      type: 'log',
      actor,
      message,
      extra,
      timestamp: new Date().toISOString()
    };
    this.currentDay.timeline.push(event);
    this.currentDay.lastUpdate = new Date();
    await this.saveCurrentDay();
  }

  createEmptyDay() {
    const now = new Date();
    return {
      date: this.getCurrentDateCT(),
      approved: 0,
      pushed: 0,
      agents: new Map(),
      timeline: [],
      startTime: now,
      lastUpdate: now
    };
  }

  getCurrentDateCT() {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: this.centralTimeZone
    });
  }
}

module.exports = DailyTicketTracker;
