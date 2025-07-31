/**
 * GitHub Automation Service
 * Handles PR creation, updates, and automated git operations
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Ticket, GitHubAutomationConfig } from '../database/ticket-models';
import { logger } from '../utils/logger';
import * as path from 'path';

const execAsync = promisify(exec);

export type AutomationAction = 'create_pr' | 'update_pr' | 'push_commits';

export class GitHubAutomationService {
  private static instance: GitHubAutomationService;
  private projectRoot: string;

  private constructor() {
    // Assume we're running from server directory
    this.projectRoot = path.resolve(process.cwd(), '..');
  }

  static getInstance(): GitHubAutomationService {
    if (!GitHubAutomationService.instance) {
      GitHubAutomationService.instance = new GitHubAutomationService();
    }
    return GitHubAutomationService.instance;
  }

  /**
   * Execute GitHub automation based on action type
   */
  async execute(ticket: Ticket, config: GitHubAutomationConfig, action: AutomationAction): Promise<void> {
    logger.info(`Executing GitHub automation: ${action} for ticket ${ticket.id}`);

    try {
      switch (action) {
        case 'create_pr':
          await this.createOrUpdatePR(ticket, config, false);
          break;
        case 'update_pr':
          await this.createOrUpdatePR(ticket, config, true);
          break;
        case 'push_commits':
          await this.pushCommits(ticket, config);
          break;
      }
    } catch (error) {
      logger.error(`GitHub automation failed for ${action}:`, error);
      throw error;
    }
  }

  /**
   * Create or update a pull request
   */
  private async createOrUpdatePR(ticket: Ticket, config: GitHubAutomationConfig, isUpdate: boolean): Promise<void> {
    const branchName = ticket.branch_name || `ticket-${ticket.id}`;

    // Ensure we're on the correct branch
    await this.ensureBranch(branchName, config.base_branch);

    // Check if PR already exists
    if (!isUpdate && ticket.pr_number) {
      logger.info(`PR already exists for ticket ${ticket.id}: #${ticket.pr_number}`);
      return;
    }

    // Prepare PR title and body
    const prTitle = this.renderTemplate(config.pr_title_template, { ticket });
    const prBody = this.renderPRBody(ticket, config);

    if (isUpdate && ticket.pr_number) {
      // Update existing PR
      await this.updatePR(ticket.pr_number, prTitle, prBody);
    } else {
      // Create new PR
      const prData = await this.createPR(branchName, config.base_branch, prTitle, prBody, config);

      // Update ticket with PR info
      await this.updateTicketPRInfo(ticket.id, prData);
    }
  }

  /**
   * Push accumulated commits to GitHub
   */
  private async pushCommits(ticket: Ticket, config: GitHubAutomationConfig): Promise<void> {
    const branchName = ticket.branch_name || `ticket-${ticket.id}`;

    try {
      // Ensure we're on the correct branch
      await execAsync(`git checkout ${branchName}`, { cwd: this.projectRoot });

      // Push to remote
      const { stdout } = await execAsync(`git push origin ${branchName}`, { cwd: this.projectRoot });

      logger.info(`Pushed commits for ticket ${ticket.id}: ${stdout}`);

      // If PR exists, add a comment about the push
      if (ticket.pr_number) {
        await this.addPRComment(ticket.pr_number, `🚀 Pushed ${config.auto_push_interval} new commits to this PR.`);
      }
    } catch (error) {
      logger.error(`Failed to push commits: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Ensure we're on the correct branch, create if needed
   */
  private async ensureBranch(branchName: string, baseBranch: string): Promise<void> {
    try {
      // Check if branch exists locally
      await execAsync(`git rev-parse --verify ${branchName}`, { cwd: this.projectRoot });
      // Branch exists, checkout
      await execAsync(`git checkout ${branchName}`, { cwd: this.projectRoot });
    } catch {
      // Branch doesn't exist, create it
      await execAsync(`git checkout -b ${branchName} ${baseBranch}`, { cwd: this.projectRoot });
    }
  }

  /**
   * Create a new pull request using GitHub CLI
   */
  private async createPR(
    sourceBranch: string,
    baseBranch: string,
    title: string,
    body: string,
    config: GitHubAutomationConfig
  ): Promise<{ number: number; url: string }> {
    // First, push the branch
    await execAsync(`git push -u origin ${sourceBranch}`, { cwd: this.projectRoot });

    // Build gh pr create command
    let command = `gh pr create --base ${baseBranch} --head ${sourceBranch}`;
    command += ` --title "${title.replace(/"/g, '\\"')}"`;
    command += ` --body "${body.replace(/"/g, '\\"')}"`;

    if (config.draft_pr) {
      command += ' --draft';
    }

    // Add labels
    if (config.labels_to_add.length > 0) {
      command += ` --label ${config.labels_to_add.join(',')}`;
    }

    // Add reviewers
    if (config.reviewers.length > 0) {
      command += ` --reviewer ${config.reviewers.join(',')}`;
    }

    const { stdout } = await execAsync(command, { cwd: this.projectRoot });

    // Parse PR URL from output
    const prUrlMatch = stdout.match(/https:\/\/github\.com\/.*\/pull\/(\d+)/);
    if (!prUrlMatch) {
      throw new Error('Failed to parse PR URL from gh output');
    }

    const prNumber = parseInt(prUrlMatch[1]);
    const prUrl = prUrlMatch[0];

    logger.info(`Created PR #${prNumber}: ${prUrl}`);

    return { number: prNumber, url: prUrl };
  }

  /**
   * Update an existing pull request
   */
  private async updatePR(prNumber: number, title: string, body: string): Promise<void> {
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedBody = body.replace(/"/g, '\\"');
    const command = `gh pr edit ${prNumber} --title "${escapedTitle}" --body "${escapedBody}"`;

    await execAsync(command, { cwd: this.projectRoot });
    logger.info(`Updated PR #${prNumber}`);
  }

  /**
   * Add a comment to a pull request
   */
  private async addPRComment(prNumber: number, comment: string): Promise<void> {
    const command = `gh pr comment ${prNumber} --body "${comment.replace(/"/g, '\\"')}"`;

    await execAsync(command, { cwd: this.projectRoot });
    logger.info(`Added comment to PR #${prNumber}`);
  }

  /**
   * Render a template string with ticket data
   */
  private renderTemplate(template: string, data: { ticket: Ticket }): string {
    return template.replace(/\{\{(\w+\.?\w+)\}\}/g, (match, path) => {
      const keys = path.split('.');
      let value: unknown = data;

      for (const key of keys) {
        value = value[key];
        if (value === undefined) return match;
      }

      return String(value);
    });
  }

  /**
   * Generate PR body from ticket and config
   */
  private renderPRBody(ticket: Ticket, config: GitHubAutomationConfig): string {
    if (config.pr_body_template) {
      return this.renderTemplate(config.pr_body_template, { ticket });
    }

    // Default PR body
    return `## Summary
${ticket.description}

## Ticket Details
- **ID**: ${ticket.id}
- **Status**: ${ticket.status}
- **Priority**: ${ticket.priority}
${ticket.epic_id ? `- **Epic**: ${ticket.epic_id}` : ''}
${ticket.story_id ? `- **Story**: ${ticket.story_id}` : ''}

## Changes
- ${ticket.files_changed.join('\n- ')}

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
- [ ] No console errors or warnings

---
*This PR was automatically created by the GitHub Automation Service*`;
  }

  /**
   * Update ticket with PR information (this would call back to TicketDAO)
   */
  private async updateTicketPRInfo(ticketId: string, prData: { number: number; url: string }): Promise<void> {
    // This would typically call back to TicketDAO.updateTicket
    // For now, we'll just log it
    logger.info(`Ticket ${ticketId} should be updated with PR #${prData.number} (${prData.url})`);
  }
}

// Export singleton instance
export const executeGitHubAutomation = async (
  ticket: Ticket,
  config: GitHubAutomationConfig,
  action: AutomationAction
): Promise<void> => {
  const service = GitHubAutomationService.getInstance();
  await service.execute(ticket, config, action);
};
