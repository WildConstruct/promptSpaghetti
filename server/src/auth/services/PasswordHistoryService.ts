/**
 * Password History Tracking Service - Epic 19 Implementation
 * Comprehensive password history management with policy enforcement and security analytics
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';



export interface PasswordHistoryEntry {
  id: string;
  userId: string;
  passwordHash: string;
  setAt: Date;
  expiresAt?: Date;
  strength: number;
  setBy: string; // userId or 'system' for automatic changes
  setReason: 'registration' | 'manual_change' | 'forced_rotation' | 'expired' | 'security_breach' | 'admin_reset';
  metadata: {
    sourceIP?: string;
    userAgent?: string;
    securityScore: number;
    complianceFlags: string[];
    rotationPolicy?: string;
    breachDetected?: boolean;



  };
  archivedAt?: Date;
  isActive: boolean;




export interface PasswordSecurityAnalysis {
  userId: string;
  analysisDate: Date;
  totalPasswords: number;
  averageStrength: number;
  strengthTrend: 'improving' | 'declining' | 'stable';
  reuseViolations: number;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  securityEvents: Array<{
    date: Date;
    event: string;
    severity: 'low' | 'medium' | 'high';
    description: string;



>;




export interface PasswordPattern {
  id: string;
  pattern: string;
  type: 'weak_pattern' | 'common_substitution' | 'keyboard_sequence' | 'dictionary_word';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
  affectedUsers: number;







export interface HistoryPolicy {
  preventReuse: number; // Number of previous passwords to remember
  minPasswordAge: number; // Minimum hours before password can be changed again
  maxPasswordAge: number; // Maximum hours before password expires
  strengthRequirement: number; // Minimum strength score (0-100)
  patternAnalysis: boolean; // Enable pattern detection
  complianceTracking: boolean; // Track compliance metrics
  retentionPeriod: number; // Days to keep password history





export class PasswordHistoryService {
  private passwordHistory: Map<string, PasswordHistoryEntry[]> = new Map();
  private detectedPatterns: Map<string, PasswordPattern> = new Map();
  private securityAnalyses: Map<string, PasswordSecurityAnalysis> = new Map();
  
  private readonly saltRounds = 12;
  private readonly defaultPolicy: HistoryPolicy = {
    preventReuse: 5,
    minPasswordAge: 24, // 24 hours
    maxPasswordAge: 90 * 24, // 90 days
    strengthRequirement: 60,
    patternAnalysis: true,
    complianceTracking: true,
    retentionPeriod: 365 // 1 year
  };

  constructor(private policy: Partial<HistoryPolicy> = {}) {
    this.policy = { ...this.defaultPolicy, ...policy };
    this.startMaintenanceTasks();


  /**
   * Record a new password in the user's history
   */
  async recordPassword(
    userId: string,
    password: string,
    setBy: string,
    setReason: PasswordHistoryEntry['setReason'],
    metadata: {
      sourceIP?: string;
      userAgent?: string;
      rotationPolicy?: string;
      breachDetected?: boolean;
 = {}
  ): Promise<PasswordHistoryEntry> {

    // Hash the password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    
    // Calculate password strength
    const strength = await this.calculatePasswordStrength(password);
    
    // Calculate security score
    const securityScore = await this.calculateSecurityScore(password, userId);
    
    // Detect compliance flags
    const complianceFlags = await this.detectComplianceIssues(password, userId);
    
    // Create history entry
    const entry: PasswordHistoryEntry = {
      id: this.generateEntryId(),
      userId,
      passwordHash,
      setAt: new Date(),
      expiresAt: new Date(Date.now() + this.policy.maxPasswordAge! * 60 * 60 * 1000),
      strength,
      setBy,
      setReason,
      metadata: {
        ...metadata,
        securityScore,
        complianceFlags

      isActive: true
    };

    // Get user's password history
    let userHistory = this.passwordHistory.get(userId) || [];
    
    // Deactivate previous password
    if (userHistory.length > 0) {
      const currentPassword = userHistory[userHistory.length - 1];
      currentPassword.isActive = false;
      currentPassword.archivedAt = new Date();

    
    // Add new password to history
    userHistory.push(entry);
    
    // Enforce retention policy
    if (userHistory.length > this.policy.preventReuse! + 5) {
      userHistory = this.enforceRetentionPolicy(userHistory);

    
    this.passwordHistory.set(userId, userHistory);

    // Perform pattern analysis if enabled
    if (this.policy.patternAnalysis) {
      await this.analyzePasswordPatterns(password, userId);


    // Update security analysis
    await this.updateSecurityAnalysis(userId);

    // Log the password change
    await this.logPasswordEvent(userId, 'password_recorded', {
      entryId: entry.id,
      strength,
      securityScore,
      setReason,
      complianceFlags
    });

    return entry;


  /**
   * Check if a password violates reuse policy
   */
  async checkPasswordReuse(userId: string, password: string): Promise<{
    isReused: boolean;
    violationIndex?: number;
    lastUsed?: Date;
    timeSinceLastUse?: number;
    allowedAfter?: Date;
> {

    const userHistory = this.passwordHistory.get(userId) || [];
    const recentPasswords = userHistory.slice(-this.policy.preventReuse!);

    for (let i = 0; i < recentPasswords.length; i++) {
      const historyEntry = recentPasswords[i];
      const isMatch = await bcrypt.compare(password, historyEntry.passwordHash);
      
      if (isMatch) {
        const timeSinceLastUse = Date.now() - historyEntry.setAt.getTime();
        const allowedAfter = new Date(historyEntry.setAt.getTime() + this.policy.minPasswordAge! * 60 * 60 * 1000);
        
        return {
          isReused: true,
          violationIndex: recentPasswords.length - i,
          lastUsed: historyEntry.setAt,
          timeSinceLastUse: Math.floor(timeSinceLastUse / (60 * 60 * 1000)), // hours
          allowedAfter
        };



    return { isReused: false };


  /**
   * Get password history for a user (excluding sensitive data)
   */
  getPasswordHistory(userId: string, includeMetadata: boolean = false): Array<{
    id: string;
    setAt: Date;
    expiresAt?: Date;
    strength: number;
    setBy: string;
    setReason: string;
    isActive: boolean;
    metadata?: any;
> {
    const userHistory = this.passwordHistory.get(userId) || [];
    
    return userHistory.map(entry => {
      const result: any = {
        id: entry.id,
        setAt: entry.setAt,
        expiresAt: entry.expiresAt,
        strength: entry.strength,
        setBy: entry.setBy,
        setReason: entry.setReason,
        isActive: entry.isActive
      };
      
      if (includeMetadata) {
        result.metadata = {
          securityScore: entry.metadata.securityScore,
          complianceFlags: entry.metadata.complianceFlags,
          rotationPolicy: entry.metadata.rotationPolicy
        };

      
      return result;
    });


  /**
   * Generate comprehensive security analysis for a user
   */
  async generateSecurityAnalysis(userId: string): Promise<PasswordSecurityAnalysis> {

    const userHistory = this.passwordHistory.get(userId) || [];
    
    if (userHistory.length === 0) {
      return this.createEmptyAnalysis(userId);


    // Calculate metrics
    const totalPasswords = userHistory.length;
    const averageStrength = userHistory.reduce((sum, entry) => sum + entry.strength, 0) / totalPasswords;
    
    // Determine strength trend
    const recentPasswords = userHistory.slice(-3);
    const strengthTrend = this.calculateStrengthTrend(recentPasswords);
    
    // Count reuse violations
    const reuseViolations = await this.countReuseViolations(userId);
    
    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(userHistory);
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(averageStrength, reuseViolations, complianceScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(userHistory, riskLevel);
    
    // Get security events
    const securityEvents = this.getSecurityEvents(userHistory);
    
    const analysis: PasswordSecurityAnalysis = {
      userId,
      analysisDate: new Date(),
      totalPasswords,
      averageStrength,
      strengthTrend,
      reuseViolations,
      complianceScore,
      riskLevel,
      recommendations,
      securityEvents
    };

    this.securityAnalyses.set(userId, analysis);
    return analysis;


  /**
   * Detect and analyze password patterns across users
   */
  async analyzePasswordPatterns(password: string, userId: string): Promise<PasswordPattern[]> {

    const detectedPatterns: PasswordPattern[] = [];
    
    // Check for common weak patterns
    const weakPatterns = [
      { pattern: /(.)\1{2
/, type: 'weak_pattern', description: 'Repeating characters' },
      { pattern: /^(.+)123+$/, type: 'common_substitution', description: 'Common number suffix' },
      { pattern: /qwerty|asdf|zxcv/i, type: 'keyboard_sequence', description: 'Keyboard sequence' },
      { pattern: /password|admin|login/i, type: 'dictionary_word', description: 'Common dictionary word' }
    ];

    for (const { pattern, type, description } of weakPatterns) {
      if (pattern.test(password)) {
        const patternId = this.generatePatternId(type, description);
        
        let existingPattern = this.detectedPatterns.get(patternId);
        if (!existingPattern) {
          existingPattern = {
            id: patternId,
            pattern: pattern.source,
            type: type as any,
            severity: this.calculatePatternSeverity(type),
            description,
            detectedAt: new Date(),
            affectedUsers: 0
          };
          this.detectedPatterns.set(patternId, existingPattern);

        
        existingPattern.affectedUsers++;
        detectedPatterns.push(existingPattern);



    // Log detected patterns
    if (detectedPatterns.length > 0) {
      await this.logPasswordEvent(userId, 'patterns_detected', {
        patterns: detectedPatterns.map(p => ({ type: p.type, description: p.description }))
      });


    return detectedPatterns;


  /**
   * Check if user can change password (respects minimum age policy)
   */
  canChangePassword(userId: string): {
    allowed: boolean;
    reason?: string;
    allowedAt?: Date;
    hoursRemaining?: number;
 {
    const userHistory = this.passwordHistory.get(userId) || [];
    
    if (userHistory.length === 0) {
      return { allowed: true };


    const currentPassword = userHistory[userHistory.length - 1];
    const minimumChangeTime = new Date(currentPassword.setAt.getTime() + this.policy.minPasswordAge! * 60 * 60 * 1000);
    const now = new Date();

    if (now < minimumChangeTime) {
      const hoursRemaining = Math.ceil((minimumChangeTime.getTime() - now.getTime()) / (60 * 60 * 1000));
      
      return {
        allowed: false,
        reason: `Password must be at least ${this.policy.minPasswordAge} hours old before changing`,
        allowedAt: minimumChangeTime,
        hoursRemaining
      };


    return { allowed: true };


  /**
   * Get password statistics for reporting
   */
  getPasswordStatistics(): {
    totalUsers: number;
    averageHistoryLength: number;
    averageStrength: number;
    complianceRate: number;
    commonPatterns: Array<{ pattern: string; count: number; severity: string }>;
    riskDistribution: Record<string, number>;
 {
    const allHistories = Array.from(this.passwordHistory.values());
    const totalUsers = allHistories.length;
    
    if (totalUsers === 0) {
      return {
        totalUsers: 0,
        averageHistoryLength: 0,
        averageStrength: 0,
        complianceRate: 0,
        commonPatterns: [],
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 }
      };


    const averageHistoryLength = allHistories.reduce((sum, history) => sum + history.length, 0) / totalUsers;
    
    const allEntries = allHistories.flat();
    const averageStrength = allEntries.reduce((sum, entry) => sum + entry.strength, 0) / allEntries.length;
    
    // Calculate compliance rate
    const compliantUsers = Array.from(this.securityAnalyses.values()).filter(analysis => analysis.complianceScore >= 80).length;
    const complianceRate = (compliantUsers / Math.max(this.securityAnalyses.size, 1)) * 100;

    // Get common patterns
    const commonPatterns = Array.from(this.detectedPatterns.values())
      .sort((a, b) => b.affectedUsers - a.affectedUsers)
      .slice(0, 10)
      .map(pattern => ({
        pattern: pattern.description,
        count: pattern.affectedUsers,
        severity: pattern.severity
      }));

    // Calculate risk distribution
    const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const analysis of this.securityAnalyses.values()) {
      riskDistribution[analysis.riskLevel]++;


    return {
      totalUsers,
      averageHistoryLength,
      averageStrength,
      complianceRate,
      commonPatterns,
      riskDistribution
    };


  // Private helper methods

  private async calculatePasswordStrength(password: string): Promise<number> {

    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 4, 40);
    
    // Character variety
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/[0-9]/.test(password)) score += 5;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    
    // Complexity bonus
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);
    
    // Penalty for common patterns
    if (/(.)\1{2
/.test(password)) score -= 10;
    if (/123|abc|qwe/i.test(password)) score -= 15;
    
    return Math.max(0, Math.min(100, score));


  private async calculateSecurityScore(password: string, userId: string): Promise<number> {

    let score = await this.calculatePasswordStrength(password);
    
    // Check against user's previous patterns
    const userHistory = this.passwordHistory.get(userId) || [];
    if (userHistory.length > 0) {
      // Bonus for not reusing recent patterns
      const recentPatterns = userHistory.slice(-3);
      // Implementation would analyze similarity to recent passwords
      score += 5; // Simplified bonus

    
    return Math.min(100, score);


  private async detectComplianceIssues(password: string, userId: string): Promise<string[]> {

    const flags: string[] = [];
    
    const strength = await this.calculatePasswordStrength(password);
    if (strength < this.policy.strengthRequirement!) {
      flags.push('below_minimum_strength');

    
    const reuseCheck = await this.checkPasswordReuse(userId, password);
    if (reuseCheck.isReused) {
      flags.push('password_reuse_violation');

    
    return flags;


  private enforceRetentionPolicy(history: PasswordHistoryEntry[]): PasswordHistoryEntry[] {
    const retentionCutoff = new Date(Date.now() - this.policy.retentionPeriod! * 24 * 60 * 60 * 1000);
    
    // Keep recent passwords and any that haven't reached retention limit
    return history.filter((entry, index) => 
      index >= history.length - this.policy.preventReuse! - 2 || entry.setAt >= retentionCutoff
    );


  private calculateStrengthTrend(recentPasswords: PasswordHistoryEntry[]): 'improving' | 'declining' | 'stable' {
    if (recentPasswords.length < 2) return 'stable';
    
    const first = recentPasswords[0].strength;
    const last = recentPasswords[recentPasswords.length - 1].strength;
    const difference = last - first;
    
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';


  private async countReuseViolations(userId: string): Promise<number> {

    // Implementation would count historical reuse violations
    return 0; // Simplified for example


  private calculateComplianceScore(history: PasswordHistoryEntry[]): number {
    if (history.length === 0) return 0;
    
    let score = 100;
    
    // Deduct points for compliance violations
    for (const entry of history) {
      score -= entry.metadata.complianceFlags.length * 5;

    
    return Math.max(0, score);


  private calculateRiskLevel(averageStrength: number, reuseViolations: number, complianceScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (complianceScore < 50 || reuseViolations > 5) return 'critical';
    if (averageStrength < 30 || reuseViolations > 2) return 'high';
    if (averageStrength < 60 || reuseViolations > 0) return 'medium';
    return 'low';


  private generateRecommendations(history: PasswordHistoryEntry[], riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Change password immediately using a strong, unique password');

    
    if (history.length > 0) {
      const averageStrength = history.reduce((sum, entry) => sum + entry.strength, 0) / history.length;
      if (averageStrength < 60) {
        recommendations.push('Use longer passwords with mixed character types');


    
    recommendations.push('Enable multi-factor authentication for additional security');
    
    return recommendations;


  private getSecurityEvents(history: PasswordHistoryEntry[]): Array<{
    date: Date;
    event: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
> {
    const events = [];
    
    for (const entry of history) {
      if (entry.metadata.breachDetected) {
        events.push({
          date: entry.setAt,
          event: 'security_breach',
          severity: 'high' as const,
          description: 'Password changed due to security breach'
        });

      
      if (entry.metadata.complianceFlags.includes('password_reuse_violation')) {
        events.push({
          date: entry.setAt,
          event: 'reuse_violation',
          severity: 'medium' as const,
          description: 'Password reuse policy violation detected'
        });


    
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());


  private createEmptyAnalysis(userId: string): PasswordSecurityAnalysis {
    return {
      userId,
      analysisDate: new Date(),
      totalPasswords: 0,
      averageStrength: 0,
      strengthTrend: 'stable',
      reuseViolations: 0,
      complianceScore: 100,
      riskLevel: 'low',
      recommendations: ['Set up your first password'],
      securityEvents: []
    };


  private calculatePatternSeverity(type: string): 'low' | 'medium' | 'high' {
    const severityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'weak_pattern': 'high',
      'common_substitution': 'medium',
      'keyboard_sequence': 'high',
      'dictionary_word': 'medium'
    };
    
    return severityMap[type] || 'medium';


  private async updateSecurityAnalysis(userId: string): Promise<void> {

    await this.generateSecurityAnalysis(userId);


  private startMaintenanceTasks(): void {
    // Run cleanup and analysis tasks daily
    setInterval(() => {
      this.performMaintenance();
    }, 24 * 60 * 60 * 1000);


  private performMaintenance(): void {
    // Clean up old password entries
    for (const [userId, history] of this.passwordHistory) {
      const cleanedHistory = this.enforceRetentionPolicy(history);
      this.passwordHistory.set(userId, cleanedHistory);

    
    // Update security analyses
    for (const userId of this.passwordHistory.keys()) {
      this.updateSecurityAnalysis(userId);



  private generateEntryId(): string {
    return `PH-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;


  private generatePatternId(type: string, description: string): string {
    const hash = crypto.createHash('sha256').update(type + description).digest('hex').substring(0, 8);
    return `PP-${type}-${hash}`;


  private async logPasswordEvent(userId: string, event: string, metadata: any): Promise<void> {

    console.log(`Password History Event: ${event} for user ${userId}`, metadata);

