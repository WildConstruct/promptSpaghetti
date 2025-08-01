/**
 * Password Expiration Rules Service - Epic 19 Implementation
 * Configurable password expiration policies with flexible rules, notifications, and compliance tracking
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';



export interface ExpirationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  applicability: {
    userRoles: string[];
    userGroups?: string[];
    userIds?: string[];
    excludeUsers?: string[];
    departments?: string[];
    accessLevels?: string[];



  };
  expirationPolicy: {
    maxAge: number; // Days
    warningThresholds: number[]; // Days before expiry to send warnings
    gracePeriod: number; // Days after expiry before locking
    allowSelfExtension: boolean;
    maxExtensions: number;
    extensionDuration: number; // Days per extension
    requireApprovalForExtension: boolean;
    emergencyOverride: boolean;
  };
  strengthRequirements: {
    minStrength: number; // 0-100 score
    enforceComplexity: boolean;
    preventReuse: number; // Number of previous passwords
    minUniqueChars: number;
    requireSpecialChars: boolean;
    preventCommonPatterns: boolean;
  };
  notifications: {
    warningNotifications: boolean;
    expiryNotifications: boolean;
    lockNotifications: boolean;
    extensionNotifications: boolean;
    escalationChain: Array<{
      daysBeforeExpiry: number;
      recipients: ('user' | 'manager' | 'admin' | 'security')[];
      notificationMethod: ('email' | 'sms' | 'push' | 'dashboard')[];
      template: string;
>;
  };
  compliance: {
    auditRequired: boolean;
    documentationRequired: boolean;
    approvalWorkflow: boolean;
    retentionPeriod: number; // Days
    reportingFrequency: 'daily' | 'weekly' | 'monthly';
    complianceStandards: string[]; // e.g., ['SOX', 'PCI-DSS', 'HIPAA']
  };
  schedule: {
    effectiveDate: Date;
    expirationDate?: Date;
    timeZone: string;
    businessHoursOnly: boolean;
    excludedDates: Date[]; // Holidays, maintenance windows
    maintenanceWindows: Array<{
      dayOfWeek: number; // 0-6
      startTime: string; // HH:MM
      endTime: string; // HH:MM
>;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;




export interface UserExpirationStatus {
  userId: string;
  currentPasswordSetAt: Date;
  expiresAt: Date;
  daysUntilExpiry: number;
  status: 'active' | 'warning' | 'expired' | 'grace' | 'locked' | 'extended';
  appliedRules: string[];
  warningsSent: number;
  lastWarningAt?: Date;
  gracePeriodEnds?: Date;
  extensionsUsed: number;
  canExtend: boolean;
  nextWarningDue?: Date;
  lockDate?: Date;
  complianceFlags: string[];
  metadata: {
    strengthScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastLoginAt?: Date;
    deviceFingerprints: string[];
    locationHistory: Array<{
      ip: string;
      location: string;
      timestamp: Date;



>;
  };




export interface ExpirationEvent {
  id: string;
  userId: string;
  ruleId: string;
  eventType: 'warning' | 'expired' | 'grace_start' | 'locked' | 'extended' | 'reset';
  timestamp: Date;
  details: {
    daysUntilExpiry?: number;
    warningLevel?: number;
    extensionDays?: number;
    approvedBy?: string;
    reason?: string;
    automaticAction?: boolean;



  };
  notificationsSent: Array<{
    recipient: string;
    method: string;
    status: 'sent' | 'failed' | 'pending';
    timestamp: Date;
>;
  compliance: {
    auditTrail: boolean;
    reportGenerated: boolean;
    standardsApplied: string[];
  };




export interface ExtensionRequest {
  id: string;
  userId: string;
  ruleId: string;
  requestedDays: number;
  reason: string;
  requestedAt: Date;
  requestedBy: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  approvedBy?: string;
  approvedAt?: Date;
  denyReason?: string;
  autoApproved: boolean;
  expiresAt: Date;
  metadata: {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    businessJustification: string;
    alternativesConsidered: string[];
    riskAssessment: string;



  };


export class PasswordExpirationService extends EventEmitter {
  private rules: Map<string, ExpirationRule> = new Map();
  private userStatuses: Map<string, UserExpirationStatus> = new Map();
  private expirationEvents: ExpirationEvent[] = [];
  private extensionRequests: Map<string, ExtensionRequest> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
    this.startExpirationTasks();


  /**
   * Create a new expiration rule
   */
  async createExpirationRule(
    ruleData: Omit<ExpirationRule, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ExpirationRule> {

    const rule: ExpirationRule = {
      ...ruleData,
      id: this.generateRuleId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    await this.validateRule(rule);
    
    // If compliance requires approval, mark as pending
    if (rule.compliance.approvalWorkflow && !rule.approvedBy) {
      await this.requestRuleApproval(rule, createdBy);


    this.rules.set(rule.id, rule);
    await this.recalculateAffectedUsers(rule);

    await this.logExpirationEvent(rule.id, 'system', 'rule_created', {
      ruleName: rule.name,
      maxAge: rule.expirationPolicy.maxAge,
      applicableRoles: rule.applicability.userRoles
    });

    this.emit('ruleCreated', rule);
    return rule;


  /**
   * Get expiration status for a user
   */
  async getUserExpirationStatus(userId: string): Promise<UserExpirationStatus> {

    let status = this.userStatuses.get(userId);
    
    if (!status) {
      status = await this.calculateUserStatus(userId);
      this.userStatuses.set(userId, status);


    // Refresh if status is stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (status.currentPasswordSetAt < oneHourAgo) {
      status = await this.calculateUserStatus(userId);
      this.userStatuses.set(userId, status);


    return status;


  /**
   * Check if password change is required for user
   */
  async checkPasswordExpiration(
    userId: string,
    userRoles: string[],
    userMetadata: Record<string, any> = {}
  ): Promise<{
    required: boolean;
    status: UserExpirationStatus['status'];
    message: string;
    daysUntilExpiry: number;
    allowedActions: string[];
    blockedActions: string[];
    nextAction?: {
      type: 'warning' | 'lock' | 'force_change';
      date: Date;
    };
> {

    const status = await this.getUserExpirationStatus(userId);
    const applicableRules = await this.getApplicableRules(userId, userRoles);

    if (applicableRules.length === 0) {
      return {
        required: false,
        status: 'active',
        message: 'No expiration rules apply to this user',
        daysUntilExpiry: Infinity,
        allowedActions: ['login', 'api_access', 'password_change'],
        blockedActions: []
      };


    const mostRestrictiveRule = this.getMostRestrictiveRule(applicableRules);
    
    // Determine required actions and restrictions
    const allowedActions: string[] = [];
    const blockedActions: string[] = [];
    let required = false;
    let message = '';

    switch (status.status) {
    case 'active':
      allowedActions.push('login', 'api_access', 'password_change');
      message = `Password is active (expires in ${status.daysUntilExpiry} days)`;
      break;

    case 'warning':
      allowedActions.push('login', 'api_access', 'password_change');
      if (status.canExtend) allowedActions.push('extend_password');
      message = `Password expires in ${status.daysUntilExpiry} days. Change recommended.`;
      break;

    case 'expired':
      if (mostRestrictiveRule.expirationPolicy.gracePeriod > 0) {
        allowedActions.push('password_change');
        if (status.canExtend) allowedActions.push('extend_password');
        blockedActions.push('login', 'api_access');
        required = true;
        message = `Password expired ${Math.abs(status.daysUntilExpiry)} days ago. Change required.`;

      break;

    case 'grace':
      allowedActions.push('password_change');
      if (status.canExtend) allowedActions.push('extend_password');
      blockedActions.push('api_access');
      required = true;
      const graceDaysLeft = status.gracePeriodEnds ? 
        Math.ceil((status.gracePeriodEnds.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : 0;
      message = `Password in grace period (${graceDaysLeft} days left). Change required.`;
      break;

    case 'locked':
      allowedActions.push('password_change');
      blockedActions.push('login', 'api_access');
      required = true;
      message = 'Account locked due to expired password. Change required to unlock.';
      break;

    case 'extended':
      allowedActions.push('login', 'api_access', 'password_change');
      message = `Password extended (expires in ${status.daysUntilExpiry} days)`;
      break;


    // Determine next action
    let nextAction: { type: 'warning' | 'lock' | 'force_change'; date: Date } | undefined;
    
    if (status.nextWarningDue) {
      nextAction = { type: 'warning', date: status.nextWarningDue };
 else if (status.lockDate) {
      nextAction = { type: 'lock', date: status.lockDate };


    return {
      required,
      status: status.status,
      message,
      daysUntilExpiry: status.daysUntilExpiry,
      allowedActions,
      blockedActions,
      nextAction
    };


  /**
   * Request password extension
   */
  async requestPasswordExtension(
    userId: string,
    requestedDays: number,
    reason: string,
    businessJustification: string,
    urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<ExtensionRequest> {

    const status = await this.getUserExpirationStatus(userId);
    const applicableRules = await this.getApplicableRules(userId, []);
    
    if (applicableRules.length === 0) {
      throw new Error('No expiration rules apply to this user');


    const rule = this.getMostRestrictiveRule(applicableRules);
    
    if (!rule.expirationPolicy.allowSelfExtension) {
      throw new Error('Self-extension not allowed by current policy');


    if (status.extensionsUsed >= rule.expirationPolicy.maxExtensions) {
      throw new Error(`Maximum extensions (${rule.expirationPolicy.maxExtensions}) already used`);


    if (requestedDays > rule.expirationPolicy.extensionDuration) {
      throw new Error(`Requested extension exceeds maximum allowed (${rule.expirationPolicy.extensionDuration} days)`);


    const request: ExtensionRequest = {
      id: this.generateRequestId(),
      userId,
      ruleId: rule.id,
      requestedDays,
      reason,
      requestedAt: new Date(),
      requestedBy: userId,
      status: rule.expirationPolicy.requireApprovalForExtension ? 'pending' : 'approved',
      autoApproved: !rule.expirationPolicy.requireApprovalForExtension,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to respond
      metadata: {
        urgency,
        businessJustification,
        alternativesConsidered: [],
        riskAssessment: this.assessExtensionRisk(status, requestedDays)

    };

    if (!rule.expirationPolicy.requireApprovalForExtension) {
      // Auto-approve
      request.approvedBy = 'system';
      request.approvedAt = new Date();
      await this.applyExtension(request);
 else {
      // Send for approval
      await this.sendApprovalRequest(request);


    this.extensionRequests.set(request.id, request);

    await this.logExpirationEvent(userId, userId, 'extension_requested', {
      requestId: request.id,
      requestedDays,
      reason,
      autoApproved: request.autoApproved
    });

    this.emit('extensionRequested', request);
    return request;


  /**
   * Approve or deny extension request
   */
  async processExtensionRequest(
    requestId: string,
    decision: 'approved' | 'denied',
    approvedBy: string,
    comments?: string
  ): Promise<ExtensionRequest> {

    const request = this.extensionRequests.get(requestId);
    if (!request) {
      throw new Error('Extension request not found');


    if (request.status !== 'pending') {
      throw new Error(`Request already ${request.status}`);


    request.status = decision;
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();

    if (decision === 'denied') {
      request.denyReason = comments || 'No reason provided';
 else {
      await this.applyExtension(request);


    await this.logExpirationEvent(request.userId, approvedBy, `extension_${decision}`, {
      requestId,
      requestedDays: request.requestedDays,
      reason: request.reason,
      comments
    });

    this.emit('extensionProcessed', request);
    return request;


  /**
   * Generate expiration compliance report
   */
  async generateComplianceReport(
    dateRange: { start: Date; end: Date },
    standards: string[] = []
  ): Promise<{
    summary: {
      totalUsers: number;
      activePasswords: number;
      expiredPasswords: number;
      lockedAccounts: number;
      extensionsGranted: number;
      complianceRate: number;
    };
    violations: Array<{
      userId: string;
      violationType: string;
      details: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      detectedAt: Date;
>;
    trends: {
      expirationRate: number[];
      extensionRate: number[];
      complianceScore: number[];
      dates: Date[];
    };
    recommendations: string[];
> {
    const events = this.expirationEvents.filter(event => 
      event.timestamp >= dateRange.start && 
      event.timestamp <= dateRange.end &&
      (standards.length === 0 || standards.some(std => event.compliance.standardsApplied.includes(std)))
    );

    const totalUsers = this.userStatuses.size;
    const userStatusArray = Array.from(this.userStatuses.values());
    
    const summary = {
      totalUsers,
      activePasswords: userStatusArray.filter(s => s.status === 'active').length,
      expiredPasswords: userStatusArray.filter(s => s.status === 'expired').length,
      lockedAccounts: userStatusArray.filter(s => s.status === 'locked').length,
      extensionsGranted: Array.from(this.extensionRequests.values()).filter(r => r.status === 'approved').length,
      complianceRate: this.calculateComplianceRate(userStatusArray)
    };

    const violations = this.identifyViolations(userStatusArray, standards);
    const trends = this.calculateTrends(events, dateRange);
    const recommendations = this.generateRecommendations(summary, violations);

    return { summary, violations, trends, recommendations };


  // Private helper methods

  private initializeDefaultRules(): void {
    const standardRule: ExpirationRule = {
      id: 'standard-password-expiration',
      name: 'Standard Password Expiration',
      description: 'Standard 90-day password expiration for regular users',
      enabled: true,
      priority: 100,
      applicability: {
        userRoles: ['user', 'editor'],
        excludeUsers: []

      expirationPolicy: {
        maxAge: 90,
        warningThresholds: [30, 14, 7, 3, 1],
        gracePeriod: 7,
        allowSelfExtension: true,
        maxExtensions: 2,
        extensionDuration: 30,
        requireApprovalForExtension: false,
        emergencyOverride: true

      strengthRequirements: {
        minStrength: 60,
        enforceComplexity: true,
        preventReuse: 5,
        minUniqueChars: 8,
        requireSpecialChars: true,
        preventCommonPatterns: true

      notifications: {
        warningNotifications: true,
        expiryNotifications: true,
        lockNotifications: true,
        extensionNotifications: true,
        escalationChain: [
          {
            daysBeforeExpiry: 30,
            recipients: ['user'],
            notificationMethod: ['email', 'dashboard'],
            template: 'password_warning_30days'

          {
            daysBeforeExpiry: 7,
            recipients: ['user', 'manager'],
            notificationMethod: ['email', 'sms', 'dashboard'],
            template: 'password_warning_7days'

          {
            daysBeforeExpiry: 1,
            recipients: ['user', 'manager', 'admin'],
            notificationMethod: ['email', 'sms', 'push', 'dashboard'],
            template: 'password_warning_1day'

        ]

      compliance: {
        auditRequired: true,
        documentationRequired: false,
        approvalWorkflow: false,
        retentionPeriod: 365,
        reportingFrequency: 'monthly',
        complianceStandards: ['ISO27001']

      schedule: {
        effectiveDate: new Date(),
        timeZone: 'UTC',
        businessHoursOnly: false,
        excludedDates: [],
        maintenanceWindows: []

      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.rules.set(standardRule.id, standardRule);


  private async calculateUserStatus(userId: string): Promise<UserExpirationStatus> {

    // Mock implementation - would integrate with actual password history service
    const passwordSetAt = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
    const applicableRules = await this.getApplicableRules(userId, ['user']);
    
    if (applicableRules.length === 0) {
      return this.createDefaultStatus(userId, passwordSetAt);


    const rule = this.getMostRestrictiveRule(applicableRules);
    const expiresAt = new Date(passwordSetAt.getTime() + rule.expirationPolicy.maxAge * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    
    let status: UserExpirationStatus['status'] = 'active';
    if (daysUntilExpiry <= 0) {
      const gracePeriodEnd = new Date(expiresAt.getTime() + rule.expirationPolicy.gracePeriod * 24 * 60 * 60 * 1000);
      if (Date.now() > gracePeriodEnd.getTime()) {
        status = 'locked';
 else if (daysUntilExpiry <= -rule.expirationPolicy.gracePeriod) {
        status = 'grace';
 else {
        status = 'expired';

 else if (daysUntilExpiry <= Math.max(...rule.expirationPolicy.warningThresholds)) {
      status = 'warning';


    return {
      userId,
      currentPasswordSetAt: passwordSetAt,
      expiresAt,
      daysUntilExpiry,
      status,
      appliedRules: [rule.id],
      warningsSent: 0,
      extensionsUsed: 0,
      canExtend: rule.expirationPolicy.allowSelfExtension,
      complianceFlags: [],
      metadata: {
        strengthScore: 75,
        riskLevel: 'low',
        deviceFingerprints: [],
        locationHistory: []

    };


  private createDefaultStatus(userId: string, passwordSetAt: Date): UserExpirationStatus {
    return {
      userId,
      currentPasswordSetAt: passwordSetAt,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
      daysUntilExpiry: 365,
      status: 'active',
      appliedRules: [],
      warningsSent: 0,
      extensionsUsed: 0,
      canExtend: false,
      complianceFlags: [],
      metadata: {
        strengthScore: 50,
        riskLevel: 'medium',
        deviceFingerprints: [],
        locationHistory: []

    };


  private async getApplicableRules(userId: string, userRoles: string[]): Promise<ExpirationRule[]> {

    const rules = [];
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      if (rule.applicability.excludeUsers?.includes(userId)) continue;
      
      if (rule.applicability.userIds?.includes(userId) ||
          rule.applicability.userRoles.some(role => userRoles.includes(role))) {
        rules.push(rule);



    return rules.sort((a, b) => b.priority - a.priority);


  private getMostRestrictiveRule(rules: ExpirationRule[]): ExpirationRule {
    return rules.reduce((most, current) => 
      current.expirationPolicy.maxAge < most.expirationPolicy.maxAge ? current : most
    );


  private startExpirationTasks(): void {
    // Check expiration status daily
    setInterval(() => {
      this.checkExpirations();
    }, 24 * 60 * 60 * 1000);

    // Send notifications hourly
    setInterval(() => {
      this.sendScheduledNotifications();
    }, 60 * 60 * 1000);


  private async checkExpirations(): Promise<void> {

    for (const userId of this.userStatuses.keys()) {
      await this.calculateUserStatus(userId);



  private async sendScheduledNotifications(): Promise<void> {

    // Implementation would send scheduled expiration notifications
    console.log('Checking for scheduled expiration notifications');


  // Additional helper methods would continue here...
  // Due to length constraints, showing core implementation structure

  private generateRuleId(): string {
    return `ER-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;


  private generateRequestId(): string {
    return `EXT-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;


  private async validateRule(rule: ExpirationRule): Promise<void> {

    if (rule.expirationPolicy.maxAge < 1 || rule.expirationPolicy.maxAge > 365) {
      throw new Error('Password max age must be between 1 and 365 days');



  private async recalculateAffectedUsers(rule: ExpirationRule): Promise<void> {

    // Implementation would recalculate status for users affected by the new rule
    console.log(`Recalculating status for users affected by rule ${rule.name}`);


  private async requestRuleApproval(rule: ExpirationRule, requestedBy: string): Promise<void> {

    console.log(`Requesting approval for rule ${rule.name} by ${requestedBy}`);


  private assessExtensionRisk(status: UserExpirationStatus, requestedDays: number): string {
    const riskFactors = [];
    
    if (status.extensionsUsed > 0) riskFactors.push('Previous extensions used');
    if (status.metadata.riskLevel === 'high') riskFactors.push('High user risk level');
    if (requestedDays > 30) riskFactors.push('Long extension period');
    
    return riskFactors.length > 0 ? riskFactors.join('; ') : 'Low risk';


  private async sendApprovalRequest(request: ExtensionRequest): Promise<void> {

    console.log(`Sending approval request for extension ${request.id}`);


  private async applyExtension(request: ExtensionRequest): Promise<void> {

    const status = this.userStatuses.get(request.userId);
    if (status) {
      status.expiresAt = new Date(status.expiresAt.getTime() + request.requestedDays * 24 * 60 * 60 * 1000);
      status.extensionsUsed++;
      status.status = 'extended';
      status.daysUntilExpiry = Math.ceil((status.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));



  private calculateComplianceRate(userStatuses: UserExpirationStatus[]): number {
    const compliantUsers = userStatuses.filter(s => 
      s.status !== 'locked' && s.complianceFlags.length === 0
    ).length;
    
    return userStatuses.length > 0 ? (compliantUsers / userStatuses.length) * 100 : 100;


  private identifyViolations(userStatuses: UserExpirationStatus[], standards: string[]): Array<{
    userId: string;
    violationType: string;
    details: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detectedAt: Date;
> {
    const violations = [];
    
    for (const status of userStatuses) {
      if (status.status === 'locked') {
        violations.push({
          userId: status.userId,
          violationType: 'account_locked',
          details: 'Account locked due to expired password',
          severity: 'high' as const,
          detectedAt: new Date()
        });

      
      if (status.complianceFlags.length > 0) {
        violations.push({
          userId: status.userId,
          violationType: 'compliance_violation',
          details: status.complianceFlags.join(', '),
          severity: 'medium' as const,
          detectedAt: new Date()
        });


    
    return violations;


  private calculateTrends(events: ExpirationEvent[], dateRange: { start: Date; end: Date }): {
    expirationRate: number[];
    extensionRate: number[];
    complianceScore: number[];
    dates: Date[];
 {
    // Mock implementation - would calculate actual trends
    return {
      expirationRate: [5, 7, 6, 8, 4],
      extensionRate: [2, 3, 1, 4, 2],
      complianceScore: [95, 94, 96, 93, 97],
      dates: [
        new Date(dateRange.start.getTime()),
        new Date(dateRange.start.getTime() + 7 * 24 * 60 * 60 * 1000),
        new Date(dateRange.start.getTime() + 14 * 24 * 60 * 60 * 1000),
        new Date(dateRange.start.getTime() + 21 * 24 * 60 * 60 * 1000),
        new Date(dateRange.end.getTime())
      ]
    };


  private generateRecommendations(summary: any, violations: any[]): string[] {
    const recommendations = [];
    
    if (summary.complianceRate < 90) {
      recommendations.push('Improve compliance rate by addressing password policy violations');

    
    if (summary.lockedAccounts > summary.totalUsers * 0.05) {
      recommendations.push('High number of locked accounts - consider adjusting grace periods');

    
    if (violations.length > 0) {
      recommendations.push('Address compliance violations to improve security posture');

    
    return recommendations;


  private async logExpirationEvent(target: string, performedBy: string, eventType: string, metadata: any): Promise<void> {

    console.log(`Expiration Event: ${eventType} for ${target} by ${performedBy}`, metadata);

