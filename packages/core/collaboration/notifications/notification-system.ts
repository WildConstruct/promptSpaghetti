/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

import { EventEmitter } from 'events';
import { WorkspaceId, 
  ProjectId, 
  UserId, 
  ResourceId,
  NotificationType,
  Notification }
  // ActivityType // Unused import 
 from '../types/workspace';
import { WorkspaceDAO } from '../dao/workspace-dao';


export interface NotificationChannel { type: 'in_app' | 'email' | 'slack' | 'webhook' }
  enabled: boolean;
  config: Record<string, unknown>;




export interface NotificationPreferences { userId: UserId;
  channels: NotificationChannel;
  filters: NotificationFilter;
  digest: {;
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  time?: string; // For scheduled digests }


};


export interface NotificationFilter { type: 'workspace' | 'project' | 'activity_type' | 'user';
  value: string;
  action: 'include' | 'exclude' }




export interface NotificationTemplate { type: NotificationType;
  channels: {;
  [channel: string]: { }
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;


};
  };


export interface NotificationContext { workspaceId: WorkspaceId;
  projectId?: ProjectId;
  resourceId?: ResourceId;
  actorUserId: UserId;
  targetUserIds: UserId;
  data: Record<string, unknown> }



export interface NotificationDelivery { id: string;
  notificationId: string;
  userId: UserId;
  channel: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  sentAt?: Date;
  readAt?: Date;
  error?: string;
  retryCount: number }

export class WorkspaceNotificationSystem extends EventEmitter { private preferences: Map<UserId, NotificationPreferences> = new Map();
  private templates: Map<NotificationType, NotificationTemplate> = new Map();
  private deliveryQueue: NotificationDelivery = [];
  private digestQueue: Map<UserId, Notification> = new Map();
  private isProcessing: boolean = false;
  constructor(private dao: WorkspaceDAO) {
    super();
    this.initializeTemplates();
    this.startDeliveryProcessor();
  private initializeTemplates(): void {
    // Workspace invitation template
    this.templates.set(NotificationType.WORKSPACE_INVITE, {)
  type: NotificationType.WORKSPACE_INVITE
      channels: { }
  in_app: {;
  subject: 'You\'ve been invited to {{workspace_name}}'
          body: '{{actor_name}} has invited you to join the {{workspace_name}} workspace.'
          metadata: { priority: 'high' }

  email: {
  subject: 'Invitation to join {{workspace_name}}'
          body: `Hi {{recipient_name}}
{{actor_name}} has invited you to join the "{{workspace_name}}" workspace.
{{#if workspace_description}}
About this workspace:
{{workspace_description}}
{{/if}}
Click here to accept the invitation: {{action_url}}
Best regards
The Team`
          metadata: { priority: 'high' }
    });
    // Project invitation template
    this.templates.set(NotificationType.PROJECT_INVITE, { )
  type: NotificationType.PROJECT_INVITE
      channels: { }
  in_app: {;
  subject: 'Invited to {{project_name}}'
          body: '{{actor_name}} invited you to collaborate on {{project_name}}.'

  email: {
  subject: 'Invitation to collaborate on {{project_name}}'
          body: `Hi {{recipient_name}}
{{actor_name}} has invited you to collaborate on the "{{project_name}}" project in the {{workspace_name}} workspace.
Project details:
{{#if project_description}}
{{project_description}}
{{/if}}
Click here to view the project: {{action_url}}
Best regards
The Team`
    });
    // Comment mention template
    this.templates.set(NotificationType.COMMENT_MENTION, { )
  type: NotificationType.COMMENT_MENTION
      channels: { }
  in_app: {;
  subject: '{{actor_name}} mentioned you'
          body: '{{actor_name}} mentioned you in a comment on {{resource_name}}.'

  email: {
  subject: 'You were mentioned in {{resource_name}}'
          body: `Hi {{recipient_name}}
{{actor_name}} mentioned you in a comment:
"{{comment_content}}"
View the full conversation: {{action_url}}
Best regards
The Team`
    });
    // Comment reply template
    this.templates.set(NotificationType.COMMENT_REPLY, { )
  type: NotificationType.COMMENT_REPLY
      channels: {
  in_app: {;
  subject: 'Reply to your comment' }
          body: '{{actor_name}} replied to your comment on {{resource_name}}.'

  email: {
  subject: 'New reply to your comment on {{resource_name}}'
          body: `Hi {{recipient_name}}
{{actor_name}} replied to your comment:
"{{comment_content}}"
View the conversation: {{action_url}}
Best regards
The Team`
    });
    // Resource shared template
    this.templates.set(NotificationType.RESOURCE_SHARED, { )
  type: NotificationType.RESOURCE_SHARED
      channels: { }
  in_app: {;
  subject: '{{resource_name}} shared with you'
          body: '{{actor_name}} shared {{resource_name}} with you.'

  email: {
  subject: '{{actor_name}} shared {{resource_name}} with you'
          body: `Hi {{recipient_name}}
{{actor_name}} has shared "{{resource_name}}" with you.
{{#if resource_description}}
About this resource:
{{resource_description}}
{{/if}}
View the resource: {{action_url}}
Best regards
The Team`
    });
    // Role changed template
    this.templates.set(NotificationType.ROLE_CHANGED, { )
  type: NotificationType.ROLE_CHANGED
      channels: {
  in_app: {;
  subject: 'Your role has been updated' }
          body: 'Your role in {{workspace_name}} has been changed to {{new_role}}.'

  email: {
  subject: 'Role update in {{workspace_name}}'
          body: `Hi {{recipient_name}}
Your role in "{{workspace_name}}" has been updated from {{old_role}} to {{new_role}}.
{{#if role_description}}
Your new permissions include:
{{role_description}}
{{/if}}
View workspace: {{action_url}}
Best regards
The Team`
    });
    // Activity digest template
    this.templates.set(NotificationType.ACTIVITY_DIGEST, { )
  type: NotificationType.ACTIVITY_DIGEST
      channels: { }
  in_app: {;
  subject: 'Activity digest for {{workspace_name}}'
          body: 'Here\'s what happened in {{workspace_name}} since your last visit.'

  email: {
  subject: 'Activity digest for {{workspace_name}}'
          body: `Hi {{recipient_name}}
Here's a summary of recent activity in "{{workspace_name}}":
{{#each activities}}
- {{description}} by {{actor_name}} ({{time_ago}})
{{/each}}
View full activity: {{action_url}}
Best regards
The Team`
    });
  // Set user notification preferences
  async setUserPreferences(preferences: NotificationPreferences): Promise<void> {

    this.preferences.set(preferences.userId, preferences);
    // Persist preferences to database or user settings
    // Implementation would store these in a user_notification_preferences table
    this.emit('preferences_updated', { userId: preferences.userId, preferences });
  // Get user notification preferences
  getUserPreferences(userId: UserId): NotificationPreferences { return this.preferences.get(userId) || this.getDefaultPreferences(userId);
  private getDefaultPreferences(userId: UserId): NotificationPreferences {
    return {
      userId
      channels: [
        {
          type: 'in_app'
          enabled: true }
          config: {}

        { type: 'email'
          enabled: true }
          config: {}
      ]
      filters: []
      digest: { 
  enabled: true
  frequency: 'daily'
  time: '09:00' }
};
  // Send notification for workspace invitation
  async notifyWorkspaceInvite(context: NotificationContext): Promise<void> { await this.sendNotification(NotificationType.WORKSPACE_INVITE, context);
  // Send notification for project invitation
  async notifyProjectInvite(context: NotificationContext): Promise<void> {

    await this.sendNotification(NotificationType.PROJECT_INVITE, context);
  // Send notification for comment mention
  async notifyCommentMention(context: NotificationContext): Promise<void> {

    await this.sendNotification(NotificationType.COMMENT_MENTION, context);
  // Send notification for comment reply
  async notifyCommentReply(context: NotificationContext): Promise<void> {

    await this.sendNotification(NotificationType.COMMENT_REPLY, context);
  // Send notification for resource sharing
  async notifyResourceShared(context: NotificationContext): Promise<void> {

    await this.sendNotification(NotificationType.RESOURCE_SHARED, context);
  // Send notification for role change
  async notifyRoleChanged(context: NotificationContext): Promise<void> {

    await this.sendNotification(NotificationType.ROLE_CHANGED, context);
  // Send activity digest
  async sendActivityDigest(userId: UserId, workspaceId: WorkspaceId): Promise<void> {

    const activities = await this.dao.getWorkspaceActivity(workspaceId, 50);
    const context: NotificationContext = {
      workspaceId
      actorUserId: userId
      targetUserIds: [userId] }
      data: { activities }
    };
    await this.sendNotification(NotificationType.ACTIVITY_DIGEST, context);
  // Core notification sending logic
  private async sendNotification(((
    type: NotificationType
    context: NotificationContext
  ): Promise<void> {

    const template = this.templates.get(type);
    if (!template) {
      console.error(`No template found for notification type: ${type}`);}
      return (
    for (const userId of context.targetUserIds) { // Skip self-notifications
  if (userId === context.actorUserId) continue;
  const preferences = this.getUserPreferences(userId);
  // Apply filters
  if (!this.shouldSendNotification(type, context, preferences)) {
  continue;
  // Create notification record
  const notification = await this.dao.createNotification({
  user_id: userId
  workspace_id: context.workspaceId
  project_id: context.projectId
  type
  title: this.renderTemplate(template.channels.in_app.subject, context, userId)
  message: this.renderTemplate(template.channels.in_app.body, context, userId)
  data: context.data
  is_active: true }
});
      // Queue delivery for each enabled channel
      for (const channel of preferences.channels) { if (!channel.enabled) continue;
        const channelTemplate = template.channels[channel.type];
        if (!channelTemplate) continue;
        if (preferences.digest.enabled && this.shouldAddToDigest(type, preferences)) {
          // Add to digest queue
          this.addToDigest(userId, notification) } else { // Send immediately
          await this.queueDelivery(notification, userId, channel.type, channelTemplate, context);
  private shouldSendNotification(type: NotificationType)
  context: NotificationContext
    preferences: NotificationPreferences): boolean {
    for (const filter of preferences.filters) {
      const shouldInclude = this.evaluateFilter(filter, type, context);
      if (filter.action === 'exclude' && shouldInclude) {
        return false;
      if (filter.action === 'include' && !shouldInclude) {
        return false;
    return true;
  private evaluateFilter(filter: NotificationFilter)
  type: NotificationType
    context: NotificationContext): boolean {
    switch (filter.type) {
    case 'workspace':
      return context.workspaceId === filter.value;
    case 'project':
      return context.projectId === filter.value;
    case 'activity_type':
      return type === filter.value;
    case 'user':
      return context.actorUserId === filter.value;
    default:
      return false;
  private shouldAddToDigest(type: NotificationType, preferences: NotificationPreferences): boolean {
    // Some notification types should always be sent immediately
    const immediateTypes = [
      NotificationType.WORKSPACE_INVITE
      NotificationType.PROJECT_INVITE
    ];
    return !immediateTypes.includes(type) && preferences.digest.enabled;
  private addToDigest(userId: UserId, notification: Notification): void {
    if (!this.digestQueue.has(userId)) {
      this.digestQueue.set(userId, []);
    this.digestQueue.get(userId)!.push(notification);
  private async queueDelivery(notification: Notification)
  userId: UserId
    channel: string
    _template: unknown, // Unused parameter
    _context: NotificationContext // Unused parameter): Promise<void> {
    const delivery: NotificationDelivery = { }
  id: `${notification.id}_${channel}_${Date.now()}`}

  notificationId: notification.id
      userId
      channel
      status: 'pending'
      retryCount: 0;
  };
    this.deliveryQueue.push(delivery);
    // Trigger processing if not already running
    if (!this.isProcessing) { this.processDeliveryQueue();
  private async processDeliveryQueue(): Promise<void> { }
  if (this.isProcessing) return (
  this.isProcessing = true;
  while (this.deliveryQueue.length > 0) { const delivery = this.deliveryQueue.shift()!;
  try {
  await this.deliverNotification(delivery);
  delivery.status = 'sent';
  delivery.sentAt = new Date() } catch (error) {
        delivery.status = 'failed';
        delivery.error = error.message;
        delivery.retryCount++;
        // Retry logic
        if (delivery.retryCount < 3) {
          delivery.status = 'pending';
          this.deliveryQueue.push(delivery);
    this.isProcessing = false;
  private async deliverNotification(delivery: NotificationDelivery): Promise<void> {

    switch (delivery.channel) {
    case 'in_app':
      // In-app notifications are already stored in the database
      break;
    case 'email':
      await this.deliverEmail(delivery);
      break;
    case 'slack':
      await this.deliverSlack(delivery);
      break;
    case 'webhook':
      await this.deliverWebhook(delivery);
      break;
    default:
      throw new Error(`Unsupported delivery channel: ${delivery.channel}`);}
  private async deliverEmail(delivery: NotificationDelivery): Promise<void> {

    // Email delivery implementation
    console.log(`Delivering email notification ${delivery.notificationId} to user ${delivery.userId}`);}
    // This would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, just log the delivery
  private async deliverSlack(delivery: NotificationDelivery): Promise<void> {

    // Slack delivery implementation
    console.log(`Delivering Slack notification ${delivery.notificationId} to user ${delivery.userId}`);}
    // This would integrate with Slack API
  private async deliverWebhook(delivery: NotificationDelivery): Promise<void> {

    // Webhook delivery implementation
    console.log(`Delivering webhook notification ${delivery.notificationId} to user ${delivery.userId}`);}
    // This would send HTTP POST to configured webhook URL
  private renderTemplate(template: string, context: NotificationContext, _userId: UserId): string { // Unused parameter
    // Simple template rendering - in production, use a proper template engine
    let rendered = template;
    // Replace common placeholders
    const replacements = {
      '{{workspace_name}}': 'Workspace Name', // Would fetch from database
      '{{project_name}}': 'Project Name',     // Would fetch from database
      '{{resource_name}}': 'Resource Name',   // Would fetch from database
      '{{actor_name}}': 'Actor Name',         // Would fetch from database
      '{{recipient_name}}': 'Recipient Name', // Would fetch from database
      '{{action_url}}': `${process.env.BASE_URL}/workspace/${context.workspaceId}`}

      ...context.data
    };
    for (const [placeholder, value] of Object.entries(replacements)) { rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
  return rendered;
  // Process digest notifications
  async processDigests(): Promise<void> {
  for (const [userId, notifications] of this.digestQueue) {
  if (notifications.length === 0) continue;
  const preferences = this.getUserPreferences(userId);
  if (!this.shouldSendDigest(preferences)) continue;
  // Group notifications by workspace
  const workspaceGroups = new Map<WorkspaceId, Notification>();
  for (const notification of notifications) {
  if (!workspaceGroups.has(notification.workspace_id)) {
  workspaceGroups.set(notification.workspace_id, []);
  workspaceGroups.get(notification.workspace_id)!.push(notification);
  // Send digest for each workspace
  for (const [workspaceId, workspaceNotifications] of workspaceGroups) {
  await this.sendDigestForWorkspace(userId, workspaceId, workspaceNotifications);
  // Clear processed notifications from queue
  this.digestQueue.set(userId, []);
  private shouldSendDigest(preferences: NotificationPreferences): boolean {
  if (!preferences.digest.enabled) return false;
  const now = new Date();
  const frequency = preferences.digest.frequency;
  // Simple frequency check - in production, implement proper scheduling
  switch (frequency) {
  case 'immediate':
  return true;
  case 'hourly':
  return now.getMinutes() === 0;
  case 'daily':
  return now.getHours().toString().padStart(2, '0') + ':' +
  now.getMinutes().toString().padStart(2, '0') ===
  (preferences.digest.time || '09:00');
  case 'weekly':
  return now.getDay() === 1 && // Monday
  now.getHours().toString().padStart(2, '0') + ':' +
  now.getMinutes().toString().padStart(2, '0') ===
  (preferences.digest.time || '09:00');
  default:
  return false;
  private async sendDigestForWorkspace(userId: UserId)
  workspaceId: WorkspaceId
  notifications: Notification): Promise<void> {
  const context: NotificationContext = {
  workspaceId
  actorUserId: userId
  targetUserIds: [userId]
  data: {
  notifications
  count: notifications.length
  activities: notifications.map(n => ({)
  description: n.message
  actor_name: 'User', // Would fetch from database
  time_ago: this.getTimeAgo(n.created_at) }
}))
    };
    await this.sendNotification(NotificationType.ACTIVITY_DIGEST, context);
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;}
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;}
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;}
    return 'just now';
  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {

    await this.dao.markNotificationRead(notificationId);
    this.emit('notification_read', { notificationId });
  // Get unread notifications for user
  async getUnreadNotifications(userId: UserId): Promise<Notification> { return await this.dao.getUserNotifications(userId, true);
  // Start scheduled digest processing
  private startDeliveryProcessor(): void { }
  // Process delivery queue every 10 seconds
  setInterval(() => { if (!this.isProcessing && this.deliveryQueue.length > 0) {
  this.processDeliveryQueue() }, 10000);
    // Process digests every minute
    setInterval(() => { this.processDigests() }, 60000);
  // Shutdown and cleanup
  async shutdown(): Promise<void> {

    // Process remaining items in queue
    if (this.deliveryQueue.length > 0) {
      await this.processDeliveryQueue();
    this.preferences.clear();
    this.digestQueue.clear();
    this.deliveryQueue.length = 0;
    this.removeAllListeners();
    console.log('Notification system shutdown complete');