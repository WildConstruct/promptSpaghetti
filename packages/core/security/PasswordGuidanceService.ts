/**
 * Password Security Guidance Service
 * 
 * Provides comprehensive guidance and recommendations for users with
 * compromised passwords, security incidents, and preventive measures.
 * 
 * Features:
 * - Breach notification analysis
 * - Password security assessment
 * - Step-by-step recovery guidance
 * - Preventive security recommendations
 * - Risk level assessment
 */
import { EventEmitter } from 'events';
import crypto from 'crypto';

// Risk Assessment Levels
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
  // Compromise Types
  export enum CompromiseType {
  DATA_BREACH = 'data_breach',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  PHISHING = 'phishing',
  MALWARE = 'malware',
  SOCIAL_ENGINEERING = 'social_engineering',
  INSIDER_THREAT = 'insider_threat',
  WEAK_PASSWORD = 'weak_password',
  REUSED_PASSWORD = 'reused_password'
  // Action Priority Levels
  export enum ActionPriority {
  IMMEDIATE = 'immediate',    // Within 1 hour
  URGENT = 'urgent',         // Within 24 hours
  HIGH = 'high',             // Within 3 days
  MEDIUM = 'medium',         // Within 1 week
  LOW = 'low'                // When convenient
  // Guidance Categories
  export enum GuidanceCategory {
  IMMEDIATE_ACTIONS = 'immediate_actions',
  ACCOUNT_SECURITY = 'account_security',
  PASSWORD_MANAGEMENT = 'password_management',
  MFA_SETUP = 'mfa_setup',
  MONITORING = 'monitoring',
  PREVENTION = 'prevention',
  RECOVERY = 'recovery'
  export interface CompromiseIndicator {
  type: CompromiseType;
  description: string;
  confidence: number; // 0-100,
  source: string;
  detectedAt: Date;
  evidence: string;
  affectedAccounts: string;
}
export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  category: GuidanceCategory;
  priority: ActionPriority;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  steps: ActionStep;
  benefits: string;
  risks: string;
  dependencies?: string; // IDs of other recommendations,
}
export interface ActionStep {
  stepNumber: number;
  title: string;
  description: string;
  action: string;
  verification: string;
  helpResources: string;
  timeEstimate: string;
  required: boolean;
}
export interface GuidanceSession {
  id: string;
  userId: string;
  riskLevel: RiskLevel;
  compromiseIndicators: CompromiseIndicator;
  recommendations: SecurityRecommendation;
  completedActions: string;
  createdAt: Date;
  lastUpdated: Date;
  expiresAt: Date;
  status: 'active' | 'completed' | 'expired'
  }
export interface PasswordSecurityAssessment {
  strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  score: number; // 0-100,
  weaknesses: string;
  recommendations: string;
  isCompromised: boolean;
  breachDatabases: string;
  reuseDetected: boolean;
  ageInDays: number;
}
export interface UserSecurityProfile {
  userId: string;
  riskScore: number; // 0-100,
  mfaEnabled: boolean;
  passwordLastChanged: Date;
  recentBreaches: CompromiseIndicator;
  securityScore: number;
  recommendations: SecurityRecommendation;
  /**
  * Comprehensive password guidance and security recommendation service
  */
}
export class PasswordGuidanceService extends EventEmitter {
  private sessions: Map<string, GuidanceSession> = new Map();
  private userProfiles: Map<string, UserSecurityProfile> = new Map();
  /**
  * Assess password compromise risk and generate guidance
  */
  public async assessPasswordCompromise(()
  userId: string,
  indicators: CompromiseIndicator): Promise<GuidanceSession> {,
  const riskLevel = this.calculateRiskLevel(indicators);
  const recommendations = await this.generateRecommendations(indicators, riskLevel);
  const session: GuidanceSession = {,
  id: this.generateSessionId(),
  userId,
  riskLevel,
  compromiseIndicators: indicators,
  recommendations,
  completedActions: [],
  createdAt: new Date(),
  lastUpdated: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days,
  status: 'active',
};
    this.sessions.set(session.id, session);
    // Update user security profile
    await this.updateUserSecurityProfile(userId, indicators);
    this.emit('guidanceSessionCreated', session);
    return session;
  /**
   * Get immediate actions for compromised password
   */
  public getImmediateActions(compromiseType: CompromiseType): SecurityRecommendation {
  const immediateActions: SecurityRecommendation = [];
  // Change password immediately
  immediateActions.push({)
  id: 'change-password-immediate',
  title: 'Change Your Password Immediately',
  description: 'Your password has been compromised and must be changed right now to secure your account.',
  category: GuidanceCategory.IMMEDIATE_ACTIONS,
  priority: ActionPriority.IMMEDIATE,
  estimatedTime: '5-10 minutes',
  difficulty: 'easy',
  steps: [,
  {
  stepNumber: 1,
  title: 'Access Account Settings',
  description: 'Log into your account and navigate to security settings',
  action: 'Click on Profile → Security → Change Password',
  verification: 'You should see the password change form',
  helpResources: ['/help/change-password', 'support@company.com'],
  timeEstimate: '1 minute',
  required: true,
}
        {
  stepNumber: 2,
  title: 'Create Strong Password',
  description: 'Generate a new, unique password that has never been used before',
  action: 'Use password generator or create 12+ character password with mixed characters',
  verification: 'Password strength indicator shows "Strong" or "Very Strong"',
  helpResources: ['/help/password-strength', '/tools/password-generator'],
  timeEstimate: '3 minutes',
  required: true,
}
        {
  stepNumber: 3,
  title: 'Confirm Password Change',
  description: 'Save the new password and verify the change was successful',
  action: 'Click "Save Password" and confirm via email if prompted',
  verification: 'You receive confirmation that password was changed',
  helpResources: ['/help/password-confirmation'],
  timeEstimate: '2 minutes',
  required: true],
  benefits: [,
  'Immediately secures your account from unauthorized access',
  'Prevents further damage from the compromise',
  'Blocks ongoing attacks using your old password'
  ],
  risks: [,
  'Temporary account lockout if you forget the new password',
  'Need to update password in other applications'
  ]
});
    // Check for unauthorized access
    immediateActions.push({)
  id: 'check-account-activity',
  title: 'Review Account Activity',
  description: 'Check for any unauthorized access or suspicious activity in your account.',
  category: GuidanceCategory.IMMEDIATE_ACTIONS,
  priority: ActionPriority.IMMEDIATE,
  estimatedTime: '10-15 minutes',
  difficulty: 'easy',
  steps: [,
  {
  stepNumber: 1,
  title: 'Review Login History',
  description: 'Check recent login attempts and locations',
  action: 'Go to Security → Login History and review recent activity',
  verification: 'All login locations and times look familiar to you',
  helpResources: ['/help/login-history'],
  timeEstimate: '3 minutes',
  required: true,
}
        {
  stepNumber: 2,
  title: 'Check Account Changes',
  description: 'Look for any unauthorized changes to your account',
  action: 'Review profile changes, email updates, and security settings',
  verification: 'All changes were made by you',
  helpResources: ['/help/account-audit'],
  timeEstimate: '5 minutes',
  required: true,
}
        {
  stepNumber: 3,
  title: 'Revoke Suspicious Sessions',
  description: 'End any active sessions that look suspicious',
  action: 'In Security settings, click "End All Other Sessions"',
  verification: 'Only your current session remains active',
  helpResources: ['/help/session-management'],
  timeEstimate: '2 minutes',
  required: true],
  benefits: [,
  'Identifies if attacker gained access to your account',
  'Helps assess the scope of the compromise',
  'Provides evidence for further security measures'
  ],
  risks: [,
  'May reveal additional compromised information',
  'Could indicate need for more extensive security measures'
  ]
});
    // Secure other accounts
    if (compromiseType === CompromiseType.DATA_BREACH || )
        compromiseType === CompromiseType.CREDENTIAL_STUFFING) {
  immediateActions.push({)
  id: 'secure-other-accounts',
  title: 'Secure Other Accounts Using Same Password',
  description: 'Change passwords on all other accounts that used the same or similar password.',
  category: GuidanceCategory.IMMEDIATE_ACTIONS,
  priority: ActionPriority.URGENT,
  estimatedTime: '30-60 minutes',
  difficulty: 'medium',
  steps: [,
  {
  stepNumber: 1,
  title: 'Identify Accounts with Same Password',
  description: 'Make a list of all accounts that used the compromised password',
  action: 'Think through email, social media, banking, shopping, and work accounts',
  verification: 'You have a complete list of potentially affected accounts',
  helpResources: ['/help/password-audit'],
  timeEstimate: '10 minutes',
  required: true,
}
          {
  stepNumber: 2,
  title: 'Prioritize Critical Accounts',
  description: 'Start with the most important accounts first',
  action: 'Change passwords for banking, email, work accounts first',
  verification: 'Critical accounts have new, unique passwords',
  helpResources: ['/help/account-prioritization'],
  timeEstimate: '20 minutes',
  required: true,
}
          {
  stepNumber: 3,
  title: 'Update Remaining Accounts',
  description: 'Change passwords for all other affected accounts',
  action: 'Work through your list systematically',
  verification: 'All accounts have new, unique passwords',
  helpResources: ['/help/bulk-password-update'],
  timeEstimate: '30 minutes',
  required: true],
  benefits: [,
  'Prevents credential stuffing attacks on other accounts',
  'Limits the scope of the security incident',
  'Protects your digital identity across platforms'
  ],
  risks: [,
  'Time-consuming process',
  'Risk of account lockouts if done too quickly',
  'May forget to update some accounts'
  ]
});
    return immediateActions;
  /**
   * Generate comprehensive security recommendations
   */
  private async generateRecommendations(()
    indicators: CompromiseIndicator,
    riskLevel: RiskLevel,
  ): Promise<SecurityRecommendation> {
  const recommendations: SecurityRecommendation = [];
  // Get immediate actions
  const compromiseTypes = [...new Set(indicators.map(i => i.type))];
  for (const type of compromiseTypes) {
  recommendations.push(...this.getImmediateActions(type));
  // Add MFA recommendation
  recommendations.push(this.getMFARecommendation());
  // Add password manager recommendation
  recommendations.push(this.getPasswordManagerRecommendation());
  // Add monitoring recommendations
  recommendations.push(...this.getMonitoringRecommendations(riskLevel));
  // Add prevention recommendations
  recommendations.push(...this.getPreventionRecommendations());
  return this.prioritizeRecommendations(recommendations, riskLevel);
  /**
  * Get MFA setup recommendation
  */
  private getMFARecommendation(): SecurityRecommendation {,
  return {
  id: 'enable-mfa',
  title: 'Enable Multi-Factor Authentication (MFA)',
  description: 'Add an extra layer of security to prevent unauthorized access even if your password is compromised.',
  category: GuidanceCategory.MFA_SETUP,
  priority: ActionPriority.URGENT,
  estimatedTime: '10-15 minutes',
  difficulty: 'medium',
  steps: [,
  {
  stepNumber: 1,
  title: 'Choose MFA Method',
  description: 'Select the most secure MFA method available to you',
  action: 'Go to Security → Multi-Factor Authentication and choose TOTP app or SMS',
  verification: 'MFA setup wizard opens',
  helpResources: ['/help/mfa-methods', '/help/authenticator-apps'],
  timeEstimate: '2 minutes',
  required: true,
}
        {
  stepNumber: 2,
  title: 'Set Up Authenticator App',
  description: 'Install and configure an authenticator app on your phone',
  action: 'Download Google Authenticator, Authy, or Microsoft Authenticator',
  verification: 'App installed and QR code scanner ready',
  helpResources: ['/help/authenticator-setup'],
  timeEstimate: '5 minutes',
  required: true,
}
        {
  stepNumber: 3,
  title: 'Complete MFA Setup',
  description: 'Scan QR code and verify MFA is working',
  action: 'Scan QR code with app and enter verification code',
  verification: 'MFA successfully enabled and backup codes saved',
  helpResources: ['/help/mfa-verification', '/help/backup-codes'],
  timeEstimate: '5 minutes',
  required: true],
  benefits: [,
  'Prevents account access even with compromised password',
  'Meets modern security standards',
  'Protects against most common attacks'
  ],
  risks: [,
  'Risk of lockout if phone is lost',
  'Slightly more time to log in',
  'Need to keep backup codes secure'
  ]
};
  /**
   * Get password manager recommendation
   */
  private getPasswordManagerRecommendation(): SecurityRecommendation {
  return {
  id: 'use-password-manager',
  title: 'Set Up a Password Manager',
  description: 'Use a password manager to generate and store unique, strong passwords for all your accounts.',
  category: GuidanceCategory.PASSWORD_MANAGEMENT,
  priority: ActionPriority.HIGH,
  estimatedTime: '30-45 minutes',
  difficulty: 'medium',
  steps: [,
  {
  stepNumber: 1,
  title: 'Choose Password Manager',
  description: 'Select a reputable password manager service',
  action: 'Research and choose from 1Password, Bitwarden, LastPass, or Dashlane',
  verification: 'Password manager account created',
  helpResources: ['/help/password-manager-comparison'],
  timeEstimate: '10 minutes',
  required: true,
}
        {
  stepNumber: 2,
  title: 'Install Browser Extension',
  description: 'Install the password manager extension in your web browser',
  action: 'Download and install browser extension from official store',
  verification: 'Extension installed and logged in',
  helpResources: ['/help/browser-extensions'],
  timeEstimate: '5 minutes',
  required: true,
}
        {
  stepNumber: 3,
  title: 'Import Existing Passwords',
  description: 'Import saved passwords from browser or export from other services',
  action: 'Use import feature to transfer existing passwords',
  verification: 'All passwords successfully imported',
  helpResources: ['/help/password-import'],
  timeEstimate: '15 minutes',
  required: false,
}
        {
  stepNumber: 4,
  title: 'Generate New Strong Passwords',
  description: 'Replace weak or reused passwords with strong, unique ones',
  action: 'Use password generator to create new passwords for important accounts',
  verification: 'Critical accounts have new, unique passwords',
  helpResources: ['/help/password-generation'],
  timeEstimate: '15 minutes',
  required: true],
  benefits: [,
  'Eliminates password reuse across accounts',
  'Generates strong, unique passwords automatically',
  'Simplifies login process with auto-fill',
  'Provides secure storage for all credentials'
  ],
  risks: [,
  'Single point of failure if master password is compromised',
  'Dependency on password manager service availability',
  'Learning curve for new workflow'
  ]
};
  /**
   * Get monitoring recommendations based on risk level
   */
  private getMonitoringRecommendations(riskLevel: RiskLevel): SecurityRecommendation {
  const recommendations: SecurityRecommendation = [];
  // Basic monitoring for all risk levels
  recommendations.push({)
  id: 'enable-security-alerts',
  title: 'Enable Security Alerts',
  description: 'Set up notifications for suspicious account activity and login attempts.',
  category: GuidanceCategory.MONITORING,
  priority: ActionPriority.HIGH,
  estimatedTime: '10 minutes',
  difficulty: 'easy',
  steps: [,
  {
  stepNumber: 1,
  title: 'Enable Login Alerts',
  description: 'Turn on notifications for new device logins',
  action: 'Go to Security → Notifications and enable login alerts',
  verification: 'Login alert notifications enabled',
  helpResources: ['/help/security-notifications'],
  timeEstimate: '3 minutes',
  required: true,
}
        {
  stepNumber: 2,
  title: 'Enable Unusual Activity Alerts',
  description: 'Get notified of suspicious account activity',
  action: 'Enable alerts for password changes, profile updates, etc.',
  verification: 'Activity alert notifications enabled',
  helpResources: ['/help/activity-monitoring'],
  timeEstimate: '3 minutes',
  required: true,
}
        {
  stepNumber: 3,
  title: 'Verify Contact Information',
  description: 'Ensure security alerts will reach you',
  action: 'Confirm email and phone number for security notifications',
  verification: 'Contact information up to date and verified',
  helpResources: ['/help/contact-verification'],
  timeEstimate: '4 minutes',
  required: true],
  benefits: [,
  'Early warning of account compromise attempts',
  'Real-time awareness of account activity',
  'Faster response to security incidents'
  ],
  risks: [,
  'Potential for alert fatigue',
  'False positives may cause unnecessary concern'
  ]
});
    // Enhanced monitoring for high/critical risk
    if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL) {
  recommendations.push({)
  id: 'credit-monitoring',
  title: 'Set Up Credit Monitoring',
  description: 'Monitor your credit reports for signs of identity theft.',
  category: GuidanceCategory.MONITORING,
  priority: ActionPriority.HIGH,
  estimatedTime: '20 minutes',
  difficulty: 'medium',
  steps: [,
  {
  stepNumber: 1,
  title: 'Check Credit Reports',
  description: 'Review your credit reports from all three bureaus',
  action: 'Visit annualcreditreport.com for free credit reports',
  verification: 'All three credit reports reviewed',
  helpResources: ['/help/credit-reports'],
  timeEstimate: '15 minutes',
  required: true,
}
          {
  stepNumber: 2,
  title: 'Set Up Credit Alerts',
  description: 'Enable credit monitoring with at least one bureau',
  action: 'Sign up for credit monitoring service or alerts',
  verification: 'Credit monitoring active',
  helpResources: ['/help/credit-monitoring'],
  timeEstimate: '10 minutes',
  required: true],
  benefits: [,
  'Early detection of identity theft',
  'Protection of credit score and financial health',
  'Peace of mind regarding financial security'
  ],
  risks: [,
  'May cost money for comprehensive monitoring',
  'Potential for false alarms'
  ]
});
    return recommendations;
  /**
   * Get prevention recommendations
   */
  private getPreventionRecommendations(): SecurityRecommendation {
  return [
  {
  id: 'security-awareness-training',
  title: 'Learn About Security Best Practices',
  description: 'Educate yourself about common threats and how to avoid them.',
  category: GuidanceCategory.PREVENTION,
  priority: ActionPriority.MEDIUM,
  estimatedTime: '30 minutes',
  difficulty: 'easy',
  steps: [,
  {
  stepNumber: 1,
  title: 'Learn About Phishing',
  description: 'Understand how to identify and avoid phishing attempts',
  action: 'Read phishing awareness guide and take quiz',
  verification: 'Completed phishing awareness training',
  helpResources: ['/training/phishing-awareness'],
  timeEstimate: '15 minutes',
  required: true,
}
          {
  stepNumber: 2,
  title: 'Understand Social Engineering',
  description: 'Learn about social engineering tactics and defenses',
  action: 'Review social engineering examples and prevention tips',
  verification: 'Completed social engineering training',
  helpResources: ['/training/social-engineering'],
  timeEstimate: '15 minutes',
  required: true],
  benefits: [,
  'Reduces likelihood of future compromises',
  'Improves overall security awareness',
  'Helps protect others by recognizing threats'
  ],
  risks: [,
  'Time investment required',
  'Information may become outdated'
  ]
}
      {
  id: 'regular-security-checkups',
  title: 'Schedule Regular Security Reviews',
  description: 'Perform periodic security audits of your accounts and practices.',
  category: GuidanceCategory.PREVENTION,
  priority: ActionPriority.LOW,
  estimatedTime: '15 minutes monthly',
  difficulty: 'easy',
  steps: [,
  {
  stepNumber: 1,
  title: 'Monthly Password Review',
  description: 'Check for weak or reused passwords',
  action: 'Use password manager security dashboard',
  verification: 'All passwords are strong and unique',
  helpResources: ['/help/password-audit'],
  timeEstimate: '10 minutes',
  required: true,
}
          {
  stepNumber: 2,
  title: 'Review Account Activity',
  description: 'Check login history and account changes',
  action: 'Review security logs for all important accounts',
  verification: 'No suspicious activity detected',
  helpResources: ['/help/security-review'],
  timeEstimate: '15 minutes',
  required: true],
  benefits: [,
  'Proactive identification of security issues',
  'Maintains strong security posture over time',
  'Builds good security habits'
  ],
  risks: [,
  'Requires ongoing time commitment',
  'May become routine and less effective'
  ]
  ];
  /**
  * Calculate overall risk level from indicators
  */
  private calculateRiskLevel(indicators: CompromiseIndicator): RiskLevel {,
  if (indicators.length === 0) return RiskLevel.LOW;
  let totalRisk = 0;
  let weightedSum = 0;
  for (const indicator of indicators) {
  let riskWeight = 0;
  switch (indicator.type) {
  case CompromiseType.DATA_BREACH:,
  riskWeight = indicator.confidence >= 80 ? 4 : 3;
  break;
  case CompromiseType.CREDENTIAL_STUFFING:,
  riskWeight = 4;
  break;
  case CompromiseType.PHISHING:,
  riskWeight = 3;
  break;
  case CompromiseType.MALWARE:,
  riskWeight = 4;
  break;
  case CompromiseType.SOCIAL_ENGINEERING:,
  riskWeight = 3;
  break;
  case CompromiseType.INSIDER_THREAT:,
  riskWeight = 4;
  break;
  case CompromiseType.WEAK_PASSWORD:,
  riskWeight = 2;
  break;
  case CompromiseType.REUSED_PASSWORD:,
  riskWeight = 3;
  break;
  totalRisk += riskWeight * (indicator.confidence / 100);
  weightedSum += riskWeight;
  // Calculate max risk instead of average - if any single indicator is critical, treat as critical
  const maxRisk = indicators.reduce((max, indicator) => {
  let riskWeight = 0;
  switch (indicator.type) {
  case CompromiseType.DATA_BREACH:,
  riskWeight = indicator.confidence >= 80 ? 4 : 3;
  break;
  case CompromiseType.CREDENTIAL_STUFFING:,
  case CompromiseType.MALWARE:,
  case CompromiseType.INSIDER_THREAT:,
  riskWeight = 4;
  break;
  case CompromiseType.PHISHING:,
  case CompromiseType.SOCIAL_ENGINEERING:,
  case CompromiseType.REUSED_PASSWORD:,
  riskWeight = 3;
  break;
  case CompromiseType.WEAK_PASSWORD:,
  riskWeight = 2;
  break;
  const adjustedRisk = riskWeight * (indicator.confidence / 100);
  return Math.max(max, adjustedRisk);
}, 0);
    if (maxRisk >= 3.5) return RiskLevel.CRITICAL;
    if (maxRisk >= 2.5) return RiskLevel.HIGH;
    if (maxRisk >= 1.5) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  /**
   * Prioritize recommendations based on risk level and dependencies
   */
  private prioritizeRecommendations(()
    recommendations: SecurityRecommendation,
    riskLevel: RiskLevel,
  ): SecurityRecommendation {
  // Sort by priority, then by category importance
  const priorityOrder = {
  [ActionPriority.IMMEDIATE]: 0,
  [ActionPriority.URGENT]: 1,
  [ActionPriority.HIGH]: 2,
  [ActionPriority.MEDIUM]: 3,
  [ActionPriority.LOW]: 4,
};
    const categoryOrder = {
  [GuidanceCategory.IMMEDIATE_ACTIONS]: 0,
  [GuidanceCategory.ACCOUNT_SECURITY]: 1,
  [GuidanceCategory.MFA_SETUP]: 2,
  [GuidanceCategory.PASSWORD_MANAGEMENT]: 3,
  [GuidanceCategory.MONITORING]: 4,
  [GuidanceCategory.RECOVERY]: 5,
  [GuidanceCategory.PREVENTION]: 6,
};
    return recommendations.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // Then by category
      return categoryOrder[a.category] - categoryOrder[b.category];
    });
  /**
   * Mark action as completed
   */
  public markActionCompleted(sessionId: string, actionId: string): boolean {
  const session = this.sessions.get(sessionId);
  if (!session) return false;
  if (!session.completedActions.includes(actionId)) {
  session.completedActions.push(actionId);
  session.lastUpdated = new Date();
  this.emit('actionCompleted', {)
  sessionId,
  actionId,
  progress: this.calculateProgress(session),
});
    return true;
  /**
   * Get guidance session progress
   */
  public getSessionProgress(sessionId: string): {
  total: number;
  completed: number;
  percentage: number;
  remainingCritical: number;
} | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return this.calculateProgress(session);
  /**
   * Calculate session progress
   */
  private calculateProgress(session: GuidanceSession): {
  total: number;
    completed: number;
  percentage: number;
    remainingCritical: number;
    const total = session.recommendations.length;
    const completed = session.completedActions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const remainingCritical = session.recommendations;
      .filter(r => )
        (r.priority === ActionPriority.IMMEDIATE || r.priority === ActionPriority.URGENT) &&
        !session.completedActions.includes(r.id)
      ).length;
    return { total, completed, percentage, remainingCritical };
  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `PWD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;}
  /**
   * Update user security profile
   */
  private async updateUserSecurityProfile(()
    userId: string,
    indicators: CompromiseIndicator,
  ): Promise<void> {
  let profile = this.userProfiles.get(userId);
  if (!profile) {
  profile = {
  userId,
  riskScore: 0,
  mfaEnabled: false,
  passwordLastChanged: new Date(),
  recentBreaches: [],
  securityScore: 50,
  recommendations: [],
};
    // Update recent breaches
    profile.recentBreaches = [
      ...indicators,
      ...profile.recentBreaches.filter()
        existing => !indicators.some()
          indicator => indicator.type === existing.type && 
                      indicator.source === existing.source
    ].slice(0, 10); // Keep last 10 breaches
    // Recalculate risk score
    profile.riskScore = this.calculateUserRiskScore(profile);
    this.userProfiles.set(userId, profile);
    this.emit('userProfileUpdated', profile);
  /**
   * Calculate user risk score
   */
  private calculateUserRiskScore(profile: UserSecurityProfile): number {
  let riskScore = 0;
  // Recent breaches increase risk
  const recentBreaches = profile.recentBreaches.filter(;);
  breach => (Date.now() - breach.detectedAt.getTime()) < (30 * 24 * 60 * 60 * 1000) // 30 days
  );
  riskScore += recentBreaches.length * 15;
  // No MFA increases risk
  if (!profile.mfaEnabled) {
  riskScore += 25;
  // Old password increases risk
  const passwordAge = (Date.now() - profile.passwordLastChanged.getTime()) / (24 * 60 * 60 * 1000);
  if (passwordAge > 365) riskScore += 20; // 1+ years
  else if (passwordAge > 180) riskScore += 10; // 6+ months
  return Math.min(100, riskScore);
  /**
  * Get user security dashboard
  */
  public getUserSecurityDashboard(userId: string): {
  profile: UserSecurityProfile | null;
  activeSessions: GuidanceSession;
  recommendedActions: SecurityRecommendation;
  securityTips: string;
  const profile = this.userProfiles.get(userId) || null;
  const activeSessions = Array.from(this.sessions.values());
  .filter(session => session.userId === userId && session.status === 'active');
  const recommendedActions = profile ? ;
  this.getPersonalizedRecommendations(profile) : [];
  const securityTips = this.getSecurityTips(profile?.riskScore || 50);
  return {
  profile,
  activeSessions,
  recommendedActions,
  securityTips
};
  /**
   * Get personalized security recommendations
   */
  private getPersonalizedRecommendations(profile: UserSecurityProfile): SecurityRecommendation {
    const recommendations: SecurityRecommendation = [];
    if (!profile.mfaEnabled) {
      recommendations.push(this.getMFARecommendation());
    if (profile.riskScore > 75) {
      recommendations.push(...this.getMonitoringRecommendations(RiskLevel.HIGH));
    return recommendations;
  /**
   * Get contextual security tips
   */
  private getSecurityTips(riskScore: number): string {
    const tips = [;
      'Use unique passwords for every account',
      'Enable two-factor authentication wherever possible',
      'Keep your software and browsers updated',
      'Be cautious of phishing emails and suspicious links',
      'Use a reputable password manager',
      'Regularly review your account activity'
    ];
    if (riskScore > 50) {
      tips.unshift()
        'Your security risk is elevated - consider changing passwords',
        'Review recent account activity for suspicious behavior'
      );
    return tips;

// Export default instance

export default PasswordGuidanceService;