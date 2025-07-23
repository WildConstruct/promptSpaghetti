/**
 * Project Health Alert Service
 * Monitors project activity and team contributions to detect stalled projects and uneven contributions
 */

import { Database } from 'sqlite3';
import { WorkspaceDAO, ProjectWithStats } from '../database/workspace-dao';
import { AttributionService } from './attribution-service';
import { AnalyticsDAO } from '../database/analytics-dao';

export interface AlertThresholds {
  // Stalled project detection
  stalledProject: {
    inactivityDays: number;           // Days without any activity
    noExecutionDays: number;          // Days without graph execution
    noCollaborationDays: number;      // Days without multi-user activity
    minActivityThreshold: number;     // Minimum activities per week
  };
  
  // Uneven contribution detection
  unevenContributions: {
    maxContributionRatio: number;     // Max ratio of top contributor (e.g., 0.8 = 80%)
    minActiveContributors: number;    // Minimum number of active contributors
    contributionImbalanceThreshold: number; // Gini coefficient threshold
    inactiveUserDays: number;         // Days to consider user inactive
  };
  
  // General health metrics
  engagement: {
    minWeeklyActive: number;          // Minimum weekly active users
    minMonthlyGrowth: number;         // Minimum monthly activity growth
    maxErrorRate: number;             // Maximum acceptable error rate
  };
}

export interface ProjectHealthAlert {
  id: string;
  alertType: 'STALLED_PROJECT' | 'UNEVEN_CONTRIBUTIONS' | 'LOW_ENGAGEMENT' | 'HIGH_ERROR_RATE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectId: string;
  workspaceId: string;
  title: string;
  description: string;
  
  // Alert metadata
  detectedAt: Date;
  triggeredBy: Record<string, any>;  // Metrics that triggered the alert
  affectedUsers: string[];           // Users affected by this issue
  recommendedActions: string[];      // Suggested fixes
  
  // Status tracking
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  dismissedBy?: string;
  dismissedReason?: string;
}

export interface ContributionAnalysis {
  totalContributions: number;
  activeContributors: number;
  contributionDistribution: Array<{
    userId: string;
    contributions: number;
    percentage: number;
    lastActivity: Date;
  }>;
  giniCoefficient: number;            // Measure of contribution inequality (0 = equal, 1 = maximum inequality)
  dominantContributor?: {
    userId: string;
    percentage: number;
  };
  inactiveUsers: string[];
}

export class ProjectHealthAlertService {
  private workspaceDAO: WorkspaceDAO;
  private attributionService: AttributionService;
  private analyticsDAO: AnalyticsDAO;
  
  // Default alert thresholds
  private defaultThresholds: AlertThresholds = {
    stalledProject: {
      inactivityDays: 7,              // 1 week without activity
      noExecutionDays: 14,            // 2 weeks without executions
      noCollaborationDays: 21,        // 3 weeks without collaboration
      minActivityThreshold: 5         // Minimum 5 activities per week
    },
    unevenContributions: {
      maxContributionRatio: 0.75,     // No single user >75% of contributions
      minActiveContributors: 2,       // At least 2 active contributors
      contributionImbalanceThreshold: 0.6, // Gini coefficient threshold
      inactiveUserDays: 14           // 2 weeks to be considered inactive
    },
    engagement: {
      minWeeklyActive: 2,             // At least 2 active users per week
      minMonthlyGrowth: 0.0,          // No negative growth
      maxErrorRate: 0.1               // Max 10% error rate
    }
  };

  constructor(
    database: Database,
    attributionService: AttributionService,
    analyticsDAO: AnalyticsDAO
  ) {
    this.workspaceDAO = new WorkspaceDAO(database);
    this.attributionService = attributionService;
    this.analyticsDAO = analyticsDAO;
  }

  /**
   * Scan all projects for health issues and generate alerts
   */
  async scanProjectsForAlerts(
    workspaceId: string,
    thresholds: Partial<AlertThresholds> = {}
  ): Promise<ProjectHealthAlert[]> {
    const finalThresholds = { ...this.defaultThresholds, ...thresholds };
    const alerts: ProjectHealthAlert[] = [];

    try {
      // Get all projects in workspace
      const projects = await this.workspaceDAO.getWorkspaceProjects(workspaceId);
      
      for (const project of projects) {
        // Check for stalled projects
        const stalledAlert = await this.checkStalledProject(project, finalThresholds);
        if (stalledAlert) alerts.push(stalledAlert);

        // Check for uneven contributions
        const contributionAlert = await this.checkUnevenContributions(project, finalThresholds);
        if (contributionAlert) alerts.push(contributionAlert);

        // Check for low engagement
        const engagementAlert = await this.checkLowEngagement(project, finalThresholds);
        if (engagementAlert) alerts.push(engagementAlert);

        // Check for high error rates
        const errorRateAlert = await this.checkHighErrorRate(project, finalThresholds);
        if (errorRateAlert) alerts.push(errorRateAlert);
      }

      return alerts;
    } catch (error) {
      console.error('Error scanning projects for alerts:', error);
      throw error;
    }
  }

  /**
   * Check if a project is stalled based on activity patterns
   */
  private async checkStalledProject(
    project: ProjectWithStats,
    thresholds: AlertThresholds
  ): Promise<ProjectHealthAlert | null> {
    const now = new Date();
    const { stalledProject } = thresholds;

    try {
      // Get recent activity
      const recentActivity = await this.workspaceDAO.getProjectActivity(
        project.workspace_id,
        project.id,
        new Date(now.getTime() - stalledProject.inactivityDays * 24 * 60 * 60 * 1000),
        now
      );

      // Check for complete inactivity
      if (recentActivity.length === 0) {
        const daysSinceLastActivity = project.last_activity 
          ? Math.floor((now.getTime() - new Date(project.last_activity).getTime()) / (24 * 60 * 60 * 1000))
          : Infinity;

        if (daysSinceLastActivity >= stalledProject.inactivityDays) {
          return {
            id: `stalled-${project.id}-${Date.now()}`,
            alertType: 'STALLED_PROJECT',
            severity: daysSinceLastActivity >= 30 ? 'CRITICAL' : 
              daysSinceLastActivity >= 14 ? 'HIGH' : 'MEDIUM',
            projectId: project.id,
            workspaceId: project.workspace_id,
            title: `Project "${project.name}" appears stalled`,
            description: `No activity detected for ${daysSinceLastActivity} days. Last activity: ${
              project.last_activity ? new Date(project.last_activity).toLocaleDateString() : 'Unknown'
            }`,
            detectedAt: now,
            triggeredBy: {
              daysSinceLastActivity,
              threshold: stalledProject.inactivityDays,
              lastActivity: project.last_activity
            },
            affectedUsers: [], // Will be populated with project members
            recommendedActions: [
              'Check in with project team members',
              'Review project goals and timeline',
              'Consider project archival if no longer needed',
              'Schedule team sync to re-engage contributors'
            ],
            status: 'ACTIVE'
          };
        }
      }

      // Check for low activity level
      const weeklyActivity = await this.getWeeklyActivityCount(project);
      if (weeklyActivity < stalledProject.minActivityThreshold) {
        return {
          id: `low-activity-${project.id}-${Date.now()}`,
          alertType: 'STALLED_PROJECT',
          severity: 'LOW',
          projectId: project.id,
          workspaceId: project.workspace_id,
          title: `Low activity in project "${project.name}"`,
          description: `Only ${weeklyActivity} activities this week (threshold: ${stalledProject.minActivityThreshold})`,
          detectedAt: now,
          triggeredBy: {
            weeklyActivity,
            threshold: stalledProject.minActivityThreshold
          },
          affectedUsers: [],
          recommendedActions: [
            'Encourage more frequent updates',
            'Check for blockers preventing progress',
            'Consider breaking down large tasks'
          ],
          status: 'ACTIVE'
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking stalled project:', error);
      return null;
    }
  }

  /**
   * Check for uneven contribution patterns
   */
  private async checkUnevenContributions(
    project: ProjectWithStats,
    thresholds: AlertThresholds
  ): Promise<ProjectHealthAlert | null> {
    const { unevenContributions } = thresholds;

    try {
      const contributionAnalysis = await this.analyzeContributions(project, unevenContributions);

      // Check for dominant contributor
      if (contributionAnalysis.dominantContributor && 
          contributionAnalysis.dominantContributor.percentage > unevenContributions.maxContributionRatio) {
        
        return {
          id: `uneven-contrib-${project.id}-${Date.now()}`,
          alertType: 'UNEVEN_CONTRIBUTIONS',
          severity: contributionAnalysis.dominantContributor.percentage > 0.9 ? 'HIGH' : 'MEDIUM',
          projectId: project.id,
          workspaceId: project.workspace_id,
          title: `Uneven contributions in project "${project.name}"`,
          description: `One contributor is responsible for ${Math.round(contributionAnalysis.dominantContributor.percentage * 100)}% of project activity. Consider encouraging more distributed collaboration.`,
          detectedAt: new Date(),
          triggeredBy: {
            dominantContributorPercentage: contributionAnalysis.dominantContributor.percentage,
            threshold: unevenContributions.maxContributionRatio,
            giniCoefficient: contributionAnalysis.giniCoefficient,
            activeContributors: contributionAnalysis.activeContributors
          },
          affectedUsers: contributionAnalysis.contributionDistribution.map(c => c.userId),
          recommendedActions: [
            'Encourage pair programming or collaborative editing',
            'Distribute tasks more evenly across team members',
            'Provide mentoring to less active contributors',
            'Review task assignment and workload distribution'
          ],
          status: 'ACTIVE'
        };
      }

      // Check for insufficient active contributors
      if (contributionAnalysis.activeContributors < unevenContributions.minActiveContributors) {
        return {
          id: `low-contributors-${project.id}-${Date.now()}`,
          alertType: 'UNEVEN_CONTRIBUTIONS',
          severity: 'MEDIUM',
          projectId: project.id,
          workspaceId: project.workspace_id,
          title: `Too few active contributors in project "${project.name}"`,
          description: `Only ${contributionAnalysis.activeContributors} active contributors (minimum: ${unevenContributions.minActiveContributors})`,
          detectedAt: new Date(),
          triggeredBy: {
            activeContributors: contributionAnalysis.activeContributors,
            threshold: unevenContributions.minActiveContributors,
            inactiveUsers: contributionAnalysis.inactiveUsers
          },
          affectedUsers: contributionAnalysis.inactiveUsers,
          recommendedActions: [
            'Engage inactive team members',
            'Review team capacity and availability',
            'Consider adding more contributors to the project',
            'Provide training or support to increase participation'
          ],
          status: 'ACTIVE'
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking uneven contributions:', error);
      return null;
    }
  }

  /**
   * Check for low overall engagement
   */
  private async checkLowEngagement(
    project: ProjectWithStats,
    thresholds: AlertThresholds
  ): Promise<ProjectHealthAlert | null> {
    const { engagement } = thresholds;

    try {
      const weeklyActiveUsers = await this.getWeeklyActiveUsers(project);
      
      if (weeklyActiveUsers < engagement.minWeeklyActive) {
        return {
          id: `low-engagement-${project.id}-${Date.now()}`,
          alertType: 'LOW_ENGAGEMENT',
          severity: weeklyActiveUsers === 0 ? 'HIGH' : 'MEDIUM',
          projectId: project.id,
          workspaceId: project.workspace_id,
          title: `Low engagement in project "${project.name}"`,
          description: `Only ${weeklyActiveUsers} active users this week (minimum: ${engagement.minWeeklyActive})`,
          detectedAt: new Date(),
          triggeredBy: {
            weeklyActiveUsers,
            threshold: engagement.minWeeklyActive
          },
          affectedUsers: [],
          recommendedActions: [
            'Review project relevance and goals',
            'Improve project visibility and communication',
            'Organize team meetings or check-ins',
            'Simplify project access and contribution process'
          ],
          status: 'ACTIVE'
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking low engagement:', error);
      return null;
    }
  }

  /**
   * Check for high error rates in project executions
   */
  private async checkHighErrorRate(
    project: ProjectWithStats,
    thresholds: AlertThresholds
  ): Promise<ProjectHealthAlert | null> {
    const { engagement } = thresholds;

    try {
      const errorRate = await this.getProjectErrorRate(project);
      
      if (errorRate > engagement.maxErrorRate) {
        return {
          id: `high-errors-${project.id}-${Date.now()}`,
          alertType: 'HIGH_ERROR_RATE',
          severity: errorRate > 0.5 ? 'HIGH' : 'MEDIUM',
          projectId: project.id,
          workspaceId: project.workspace_id,
          title: `High error rate in project "${project.name}"`,
          description: `${Math.round(errorRate * 100)}% of recent executions failed (threshold: ${Math.round(engagement.maxErrorRate * 100)}%)`,
          detectedAt: new Date(),
          triggeredBy: {
            errorRate,
            threshold: engagement.maxErrorRate
          },
          affectedUsers: [],
          recommendedActions: [
            'Review recent project changes for bugs',
            'Check for broken dependencies or integrations',
            'Validate graph structure and node configurations',
            'Consider rolling back to last known good state'
          ],
          status: 'ACTIVE'
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking high error rate:', error);
      return null;
    }
  }

  /**
   * Analyze contribution patterns for a project
   */
  private async analyzeContributions(
    project: ProjectWithStats,
    thresholds: AlertThresholds['unevenContributions']
  ): Promise<ContributionAnalysis> {
    try {
      // Get attribution data
      const attributionStats = await this.attributionService.getProjectAttributionStats(project.id);
      
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - thresholds.inactiveUserDays * 24 * 60 * 60 * 1000);
      
      // Analyze contribution distribution
      const contributionDistribution = attributionStats.byAuthor
        .map(author => ({
          userId: author.authorId,
          contributions: author.totalChanges,
          percentage: author.totalChanges / attributionStats.overview.totalChanges,
          lastActivity: new Date(author.lastActivity)
        }))
        .sort((a, b) => b.contributions - a.contributions);

      // Calculate Gini coefficient for contribution inequality
      const giniCoefficient = this.calculateGiniCoefficient(
        contributionDistribution.map(c => c.contributions)
      );

      // Identify active vs inactive contributors
      const activeContributors = contributionDistribution.filter(
        c => c.lastActivity > cutoffDate
      ).length;

      const inactiveUsers = contributionDistribution
        .filter(c => c.lastActivity <= cutoffDate)
        .map(c => c.userId);

      // Find dominant contributor
      const dominantContributor = contributionDistribution.length > 0 
        ? {
          userId: contributionDistribution[0].userId,
          percentage: contributionDistribution[0].percentage
        }
        : undefined;

      return {
        totalContributions: attributionStats.overview.totalChanges,
        activeContributors,
        contributionDistribution,
        giniCoefficient,
        dominantContributor,
        inactiveUsers
      };
    } catch (error) {
      console.error('Error analyzing contributions:', error);
      throw error;
    }
  }

  /**
   * Calculate Gini coefficient for measuring inequality
   */
  private calculateGiniCoefficient(values: number[]): number {
    if (values.length === 0) return 0;
    if (values.length === 1) return 0;

    const sortedValues = values.slice().sort((a, b) => a - b);
    const n = sortedValues.length;
    const sum = sortedValues.reduce((acc, val) => acc + val, 0);
    
    if (sum === 0) return 0;

    let weightedSum = 0;
    for (let i = 0; i < n; i++) {
      weightedSum += (2 * i - n + 1) * sortedValues[i];
    }

    return weightedSum / (n * sum);
  }

  /**
   * Get weekly activity count for a project
   */
  private async getWeeklyActivityCount(project: ProjectWithStats): Promise<number> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const activities = await this.workspaceDAO.getProjectActivity(
      project.workspace_id,
      project.id,
      oneWeekAgo,
      now
    );

    return activities.length;
  }

  /**
   * Get number of weekly active users for a project
   */
  private async getWeeklyActiveUsers(project: ProjectWithStats): Promise<number> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const activities = await this.workspaceDAO.getProjectActivity(
      project.workspace_id,
      project.id,
      oneWeekAgo,
      now
    );

    const uniqueUsers = new Set(activities.map(activity => activity.actor_id));
    return uniqueUsers.size;
  }

  /**
   * Get error rate for project executions
   */
  private async getProjectErrorRate(project: ProjectWithStats): Promise<number> {
    try {
      // Query analytics for execution success/failure rates
      const executions = await this.analyticsDAO.getProjectExecutions(project.id, 7); // Last 7 days
      
      if (executions.total === 0) return 0;
      
      return executions.failed / executions.total;
    } catch (error) {
      console.warn('Could not get error rate, defaulting to 0:', error);
      return 0;
    }
  }

  /**
   * Get all active alerts for a workspace
   */
  async getActiveAlerts(workspaceId: string): Promise<ProjectHealthAlert[]> {
    // This would be implemented with a proper database table for storing alerts
    // For now, we'll generate fresh alerts each time
    return this.scanProjectsForAlerts(workspaceId);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    // Implementation would update alert status in database
    console.log(`Alert ${alertId} acknowledged by user ${userId}`);
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    // Implementation would mark alert as resolved
    console.log(`Alert ${alertId} resolved`);
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string, userId: string, reason: string): Promise<void> {
    // Implementation would mark alert as dismissed
    console.log(`Alert ${alertId} dismissed by user ${userId}: ${reason}`);
  }
}