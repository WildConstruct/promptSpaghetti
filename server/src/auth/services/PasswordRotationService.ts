/**
 * Password Rotation Policies Service - Epic 19 Implementation
 * Automated password rotation policies with enforcement, notifications, and compliance tracking
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { EventEmitter } from 'events';



export interface PasswordRotationPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: {
    maxAge: number; // Days before password expires
    warningPeriod: number; // Days before expiry to start warnings
    graceLoginCount?: number; // Number of logins allowed after expiry
    enforceRotation: boolean; // Force rotation at expiry
    preventReuse: number; // Number of previous passwords to remember
    requireReason?: boolean; // Require reason for manual rotation



  };
  applicableRoles: string[];
  applicableUsers?: string[];
  exemptUsers?: string[];
  notificationSettings: {
    warningNotifications: boolean;
    expiryNotifications: boolean;
    rotationNotifications: boolean;
    escalationLevels: Array<{
      daysBeforeExpiry: number;
      notifyUser: boolean;
      notifyAdmin: boolean;
      notifyManager?: boolean;
>;
  };
  automationSettings: {
    autoGenerate: boolean;
    autoGenerateLength: number;
    autoGenerateComplexity: 'basic' | 'standard' | 'high';
    requireUserActivation: boolean;
    temporaryPasswordExpiry: number; // Hours
  };
  complianceSettings: {
    auditRequired: boolean;
    retentionPeriod: number; // Days to keep rotation history
    reportingEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;




export interface PasswordRotationRecord {
  id: string;
  userId: string;
  policyId: string;
  previousPasswordHash: string;
  newPasswordHash: string;
  rotationType: 'manual' | 'automatic' | 'forced' | 'emergency';
  rotationReason?: string;
  rotatedAt: Date;
  rotatedBy: string; // userId or 'system'
  metadata: {
    sourceIP?: string;
    userAgent?: string;
    previousStrength?: number;
    newStrength?: number;
    wasExpired: boolean;
    warningsIssued: number;
    complianceFlags: string[];



  };




export interface UserPasswordStatus {
  userId: string;
  currentPasswordHash: string;
  setAt: Date;
  expiresAt?: Date;
  lastRotated?: Date;
  rotationCount: number;
  appliedPolicies: string[];
  status: 'active' | 'expiring' | 'expired' | 'grace' | 'locked';
  warningsIssued: number;
  graceLoginsUsed: number;
  lastWarningAt?: Date;
  passwordHistory: Array<{
    hash: string;
    setAt: Date;
    strength: number;



>;
  complianceFlags: string[];




export interface RotationNotification {
  id: string;
  userId: string;
  type: 'warning' | 'expiry' | 'rotated' | 'locked';
  message: string;
  sentAt: Date;
  acknowledged: boolean;
  escalationLevel: number;
  policyId: string;
  metadata: Record<string, any>;





export class PasswordRotationService extends EventEmitter {
  private policies: Map<string, PasswordRotationPolicy> = new Map();
  private userStatuses: Map<string, UserPasswordStatus> = new Map();
  private rotationHistory: PasswordRotationRecord[] = [];
  private notifications: Map<string, RotationNotification[]> = new Map();

  constructor() {
    super();
    this.initializeDefaultPolicies();
    this.startRotationTasks();


  /**
   * Create a new password rotation policy
   */
  async createPolicy(
    policyData: Omit<PasswordRotationPolicy, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<PasswordRotationPolicy> {

    const policy: PasswordRotationPolicy = {
      ...policyData,
      id: this.generatePolicyId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    // Validate policy configuration
    await this.validatePolicy(policy);

    this.policies.set(policy.id, policy);

    // Apply policy to applicable users
    await this.applyPolicyToUsers(policy);

    await this.logPolicyEvent('policy_created', policy.id, createdBy, {
      policyName: policy.name,
      applicableRoles: policy.applicableRoles,
      maxAge: policy.rules.maxAge
    });

    this.emit('policyCreated', policy);
    return policy;


  /**
   * Update an existing password rotation policy
   */
  async updatePolicy(
    policyId: string,
    updates: Partial<PasswordRotationPolicy>,
    updatedBy: string
  ): Promise<PasswordRotationPolicy> {

    const existingPolicy = this.policies.get(policyId);
    if (!existingPolicy) {
      throw new Error('Policy not found');


    const updatedPolicy: PasswordRotationPolicy = {
      ...existingPolicy,
      ...updates,
      id: policyId, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    await this.validatePolicy(updatedPolicy);
    this.policies.set(policyId, updatedPolicy);

    // Re-apply policy to users if applicable roles/users changed
    if (updates.applicableRoles || updates.applicableUsers || updates.exemptUsers) {
      await this.applyPolicyToUsers(updatedPolicy);


    await this.logPolicyEvent('policy_updated', policyId, updatedBy, {
      changes: Object.keys(updates),
      previousEnabled: existingPolicy.enabled,
      newEnabled: updatedPolicy.enabled
    });

    this.emit('policyUpdated', updatedPolicy);
    return updatedPolicy;


  /**
   * Check and enforce password rotation for a user
   */
  async checkUserPasswordRotation(
    userId: string,
    userRoles: string[],
    sourceIP?: string
  ): Promise<{
    status: 'valid' | 'warning' | 'expired' | 'grace' | 'locked';
    daysUntilExpiry?: number;
    message?: string;
    actionRequired: boolean;
    allowedGraceLogins?: number;
> {

    const userStatus = await this.getUserPasswordStatus(userId);
    const applicablePolicies = await this.getApplicablePolicies(userId, userRoles);

    if (applicablePolicies.length === 0) {
      return {
        status: 'valid',
        actionRequired: false,
        message: 'No rotation policies apply to this user'
      };


    // Find the most restrictive policy
    const activePolicy = this.getMostRestrictivePolicy(applicablePolicies);
    const now = new Date();

    // Calculate password age
    const passwordAge = Math.floor((now.getTime() - userStatus.setAt.getTime()) / (24 * 60 * 60 * 1000));
    const daysUntilExpiry = activePolicy.rules.maxAge - passwordAge;

    // Determine status based on age and policy
    let status: 'valid' | 'warning' | 'expired' | 'grace' | 'locked' = 'valid';
    let actionRequired = false;
    let message = '';

    if (passwordAge >= activePolicy.rules.maxAge) {
      // Password has expired
      if (activePolicy.rules.graceLoginCount && 
          userStatus.graceLoginsUsed < activePolicy.rules.graceLoginCount) {
        status = 'grace';
        actionRequired = true;
        message = `Password expired ${passwordAge - activePolicy.rules.maxAge} days ago. ${
          activePolicy.rules.graceLoginCount - userStatus.graceLoginsUsed
 grace logins remaining.`;
        
        // Increment grace login count
        userStatus.graceLoginsUsed++;
 else if (activePolicy.rules.enforceRotation) {
        status = 'locked';
        actionRequired = true;
        message = 'Password has expired and must be changed before access is allowed.';
 else {
        status = 'expired';
        actionRequired = true;
        message = 'Password has expired and should be changed.';

 else if (daysUntilExpiry <= activePolicy.rules.warningPeriod) {
      // Password is expiring soon
      status = 'warning';
      actionRequired = false;
      message = `Password will expire in ${daysUntilExpiry} day(s).`;

      // Send warning notifications if needed
      await this.sendExpiryWarning(userId, activePolicy, daysUntilExpiry);


    // Update user status
    userStatus.status = status;
    await this.updateUserStatus(userStatus);

    // Log the check
    await this.logRotationEvent('password_check', userId, 'system', {
      status,
      passwordAge,
      daysUntilExpiry,
      policyId: activePolicy.id,
      sourceIP
    });

    return {
      status,
      daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : undefined,
      message,
      actionRequired,
      allowedGraceLogins: activePolicy.rules.graceLoginCount ? 
        activePolicy.rules.graceLoginCount - userStatus.graceLoginsUsed : undefined
    };


  /**
   * Rotate user password (manual or automatic)
   */
  async rotatePassword(
    userId: string,
    newPassword: string,
    rotationType: 'manual' | 'automatic' | 'forced' | 'emergency',
    rotatedBy: string,
    reason?: string,
    sourceIP?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    message: string;
    temporaryPassword?: string;
    expiresAt?: Date;
> {

    const userStatus = await this.getUserPasswordStatus(userId);
    const userRoles = await this.getUserRoles(userId);
    const applicablePolicies = await this.getApplicablePolicies(userId, userRoles);

    if (applicablePolicies.length === 0) {
      return {
        success: false,
        message: 'No password rotation policies apply to this user'
      };


    const activePolicy = this.getMostRestrictivePolicy(applicablePolicies);

    // Validate new password against policy requirements
    const validationResult = await this.validateNewPassword(
      newPassword,
      userStatus.passwordHistory,
      activePolicy
    );

    if (!validationResult.isValid) {
      return {
        success: false,
        message: `Password validation failed: ${validationResult.errors.join(', ')}`
      };


    try {
      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      const previousPasswordHash = userStatus.currentPasswordHash;

      // Create rotation record
      const rotationRecord: PasswordRotationRecord = {
        id: this.generateRecordId(),
        userId,
        policyId: activePolicy.id,
        previousPasswordHash,
        newPasswordHash,
        rotationType,
        rotationReason: reason,
        rotatedAt: new Date(),
        rotatedBy,
        metadata: {
          sourceIP,
          userAgent,
          previousStrength: await this.calculatePasswordStrength(userStatus.currentPasswordHash),
          newStrength: validationResult.strength,
          wasExpired: userStatus.status === 'expired' || userStatus.status === 'grace',
          warningsIssued: userStatus.warningsIssued,
          complianceFlags: this.checkComplianceFlags(userStatus, activePolicy)

      };

      // Update user status
      userStatus.currentPasswordHash = newPasswordHash;
      userStatus.setAt = new Date();
      userStatus.expiresAt = new Date(Date.now() + activePolicy.rules.maxAge * 24 * 60 * 60 * 1000);
      userStatus.lastRotated = new Date();
      userStatus.rotationCount++;
      userStatus.status = 'active';
      userStatus.warningsIssued = 0;
      userStatus.graceLoginsUsed = 0;
      userStatus.lastWarningAt = undefined;

      // Add to password history
      userStatus.passwordHistory.push({
        hash: previousPasswordHash,
        setAt: new Date(),
        strength: rotationRecord.metadata.previousStrength || 0
      });

      // Keep only required number of previous passwords
      if (userStatus.passwordHistory.length > activePolicy.rules.preventReuse) {
        userStatus.passwordHistory = userStatus.passwordHistory.slice(-activePolicy.rules.preventReuse);


      // Store records
      this.rotationHistory.push(rotationRecord);
      await this.updateUserStatus(userStatus);

      // Send notifications
      await this.sendRotationNotification(userId, activePolicy, rotationRecord);

      await this.logRotationEvent('password_rotated', userId, rotatedBy, {
        rotationType,
        reason,
        policyId: activePolicy.id,
        previousStrength: rotationRecord.metadata.previousStrength,
        newStrength: rotationRecord.metadata.newStrength,
        sourceIP
      });

      this.emit('passwordRotated', rotationRecord);

      return {
        success: true,
        message: 'Password rotated successfully',
        expiresAt: userStatus.expiresAt
      };
 catch (error) {
      await this.logRotationEvent('rotation_failed', userId, rotatedBy, {
        error: error.message,
        rotationType,
        reason,
        sourceIP
      });

      return {
        success: false,
        message: `Password rotation failed: ${error.message}`
      };



  /**
   * Generate automatic password for user
   */
  async generateAutomaticPassword(
    userId: string,
    complexity: 'basic' | 'standard' | 'high' = 'standard'
  ): Promise<{ password: string; strength: number; expiresAt: Date }> {

    const complexitySettings = {
      basic: { length: 12, includeSpecial: false, includeNumbers: true },
      standard: { length: 16, includeSpecial: true, includeNumbers: true },
      high: { length: 20, includeSpecial: true, includeNumbers: true }
    };

    const settings = complexitySettings[complexity];
    const charset = this.buildCharset(settings);
    
    let password = '';
    for (let i = 0; i < settings.length; i++) {
      password += charset[crypto.randomInt(0, charset.length)];


    // Ensure password meets complexity requirements
    password = this.enforceComplexity(password, settings);

    const strength = await this.calculatePasswordStrength(password);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return { password, strength, expiresAt };


  private initializeDefaultPolicies(): void {
    // Create a default standard policy
    const defaultPolicy: PasswordRotationPolicy = {
      id: 'default-standard',
      name: 'Standard Password Rotation',
      description: 'Standard password rotation policy for regular users',
      enabled: true,
      rules: {
        maxAge: 90, // 90 days
        warningPeriod: 14, // 2 weeks warning
        graceLoginCount: 3,
        enforceRotation: true,
        preventReuse: 5,
        requireReason: false

      applicableRoles: ['user', 'editor'],
      notificationSettings: {
        warningNotifications: true,
        expiryNotifications: true,
        rotationNotifications: true,
        escalationLevels: [
          { daysBeforeExpiry: 14, notifyUser: true, notifyAdmin: false },
          { daysBeforeExpiry: 7, notifyUser: true, notifyAdmin: false },
          { daysBeforeExpiry: 3, notifyUser: true, notifyAdmin: true },
          { daysBeforeExpiry: 0, notifyUser: true, notifyAdmin: true }
        ]

      automationSettings: {
        autoGenerate: false,
        autoGenerateLength: 16,
        autoGenerateComplexity: 'standard',
        requireUserActivation: true,
        temporaryPasswordExpiry: 24

      complianceSettings: {
        auditRequired: true,
        retentionPeriod: 365,
        reportingEnabled: true

      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.policies.set(defaultPolicy.id, defaultPolicy);


  private startRotationTasks(): void {
    // Check for password expirations every hour
    setInterval(() => {
      this.checkExpiredPasswords();
    }, 60 * 60 * 1000);

    // Send warning notifications daily
    setInterval(() => {
      this.sendDailyWarnings();
    }, 24 * 60 * 60 * 1000);

    // Clean up old rotation records monthly
    setInterval(() => {
      this.cleanupOldRecords();
    }, 30 * 24 * 60 * 60 * 1000);


  private async checkExpiredPasswords(): Promise<void> {

    for (const [userId, status] of this.userStatuses) {
      if (status.expiresAt && status.expiresAt <= new Date()) {
        const userRoles = await this.getUserRoles(userId);
        await this.checkUserPasswordRotation(userId, userRoles);




  private async sendDailyWarnings(): Promise<void> {

    const now = new Date();
    
    for (const [userId, status] of this.userStatuses) {
      if (!status.expiresAt) continue;

      const daysUntilExpiry = Math.ceil((status.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 14) {
        const userRoles = await this.getUserRoles(userId);
        const applicablePolicies = await this.getApplicablePolicies(userId, userRoles);
        
        if (applicablePolicies.length > 0) {
          const activePolicy = this.getMostRestrictivePolicy(applicablePolicies);
          await this.sendExpiryWarning(userId, activePolicy, daysUntilExpiry);





  private buildCharset(settings: { includeSpecial: boolean; includeNumbers: boolean }): string {
    let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (settings.includeNumbers) charset += '0123456789';
    if (settings.includeSpecial) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return charset;


  private enforceComplexity(password: string, settings: any): string {
    // Ensure at least one of each required character type
    let result = password;
    
    if (settings.includeNumbers && !/\d/.test(result)) {
      result = result.slice(0, -1) + '7';

    
    if (settings.includeSpecial && !/[^A-Za-z0-9]/.test(result)) {
      result = result.slice(0, -1) + '!';

    
    return result;


  // Helper methods and data access would continue here...
  // Due to length constraints, I'm showing the core implementation structure

  private generatePolicyId(): string {
    return `PRP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;


  private generateRecordId(): string {
    return `PRR-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;


  private async validatePolicy(policy: PasswordRotationPolicy): Promise<void> {

    if (policy.rules.maxAge < 1 || policy.rules.maxAge > 365) {
      throw new Error('Password max age must be between 1 and 365 days');

    
    if (policy.rules.warningPeriod >= policy.rules.maxAge) {
      throw new Error('Warning period must be less than max age');



  private async getUserPasswordStatus(userId: string): Promise<UserPasswordStatus> {

    return this.userStatuses.get(userId) || this.createDefaultUserStatus(userId);


  private createDefaultUserStatus(userId: string): UserPasswordStatus {
    const status: UserPasswordStatus = {
      userId,
      currentPasswordHash: '',
      setAt: new Date(),
      rotationCount: 0,
      appliedPolicies: [],
      status: 'active',
      warningsIssued: 0,
      graceLoginsUsed: 0,
      passwordHistory: [],
      complianceFlags: []
    };
    
    this.userStatuses.set(userId, status);
    return status;


  private async updateUserStatus(status: UserPasswordStatus): Promise<void> {

    this.userStatuses.set(status.userId, status);


  private async getUserRoles(userId: string): Promise<string[]> {

    // Mock implementation - would integrate with actual user service
    return ['user'];


  private async getApplicablePolicies(userId: string, userRoles: string[]): Promise<PasswordRotationPolicy[]> {

    const policies = [];
    
    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;
      
      if (policy.exemptUsers?.includes(userId)) continue;
      
      if (policy.applicableUsers?.includes(userId) || 
          policy.applicableRoles.some(role => userRoles.includes(role))) {
        policies.push(policy);


    
    return policies;


  private getMostRestrictivePolicy(policies: PasswordRotationPolicy[]): PasswordRotationPolicy {
    return policies.reduce((most, current) => 
      current.rules.maxAge < most.rules.maxAge ? current : most
    );


  private async validateNewPassword(
    password: string,
    history: Array<{ hash: string }>,
    policy: PasswordRotationPolicy
  ): Promise<{ isValid: boolean; errors: string[]; strength: number }> {

    const errors: string[] = [];
    
    // Check against password history
    for (const previousPassword of history.slice(-policy.rules.preventReuse)) {
      if (await bcrypt.compare(password, previousPassword.hash)) {
        errors.push(`Password cannot be the same as any of the last ${policy.rules.preventReuse} passwords`);
        break;


    
    return {
      isValid: errors.length === 0,
      errors,
      strength: await this.calculatePasswordStrength(password)
    };


  private async calculatePasswordStrength(password: string): Promise<number> {

    // Mock implementation - would use actual password strength calculation
    return Math.min(100, password.length * 5);


  private checkComplianceFlags(status: UserPasswordStatus, policy: PasswordRotationPolicy): string[] {
    const flags: string[] = [];
    
    if (status.warningsIssued > 5) {
      flags.push('excessive_warnings');

    
    if (status.graceLoginsUsed > 0) {
      flags.push('grace_period_used');

    
    return flags;


  private async sendExpiryWarning(
    userId: string,
    policy: PasswordRotationPolicy,
    daysUntilExpiry: number
  ): Promise<void> {

    // Implementation would send actual notifications
    console.log(`Sending password expiry warning to user ${userId}: ${daysUntilExpiry} days remaining`);


  private async sendRotationNotification(
    userId: string,
    policy: PasswordRotationPolicy,
    record: PasswordRotationRecord
  ): Promise<void> {

    // Implementation would send actual notifications
    console.log(`Sending password rotation notification to user ${userId}`);


  private async applyPolicyToUsers(policy: PasswordRotationPolicy): Promise<void> {

    // Implementation would apply policy to matching users
    console.log(`Applying policy ${policy.name} to applicable users`);


  private async logPolicyEvent(action: string, policyId: string, userId: string, metadata: any): Promise<void> {

    console.log(`Policy Event: ${action} for policy ${policyId} by ${userId}`, metadata);


  private async logRotationEvent(action: string, userId: string, rotatedBy: string, metadata: any): Promise<void> {

    console.log(`Rotation Event: ${action} for user ${userId} by ${rotatedBy}`, metadata);


  private cleanupOldRecords(): void {
    // Remove old rotation records based on retention policies
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365); // Default 1 year retention
    
    this.rotationHistory = this.rotationHistory.filter(record => record.rotatedAt >= cutoff);

