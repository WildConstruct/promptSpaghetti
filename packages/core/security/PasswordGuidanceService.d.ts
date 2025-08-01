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
export declare enum RiskLevel { LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export declare enum CompromiseType {
    DATA_BREACH = "data_breach",
    CREDENTIAL_STUFFING = "credential_stuffing",
    PHISHING = "phishing",
    MALWARE = "malware",
    SOCIAL_ENGINEERING = "social_engineering",
    INSIDER_THREAT = "insider_threat",
    WEAK_PASSWORD = "weak_password",
    REUSED_PASSWORD = "reused_password"

export declare enum ActionPriority {
    IMMEDIATE = "immediate",// Within 1 hour
    URGENT = "urgent",// Within 24 hours
    HIGH = "high",// Within 3 days
    MEDIUM = "medium",// Within 1 week
    LOW = "low"

export declare enum GuidanceCategory {
    IMMEDIATE_ACTIONS = "immediate_actions",
    ACCOUNT_SECURITY = "account_security",
    PASSWORD_MANAGEMENT = "password_management",
    MFA_SETUP = "mfa_setup",
    MONITORING = "monitoring",
    PREVENTION = "prevention" }
    RECOVERY = "recovery"

}
}
export interface CompromiseIndicator { type: CompromiseType;
    description: string;
    confidence: number;
    source: string;
    detectedAt: Date;
    evidence: string[];
    affectedAccounts: string[] }
}
}
export interface SecurityRecommendation { id: string;
    title: string;
    description: string;
    category: GuidanceCategory;
    priority: ActionPriority;
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'advanced';
    steps: ActionStep[];
    benefits: string[];
    risks: string[];
    dependencies?: string[] }
}
}
export interface ActionStep { stepNumber: number;
    title: string;
    description: string;
    action: string;
    verification: string;
    helpResources: string[];
    timeEstimate: string;
    required: boolean }
}
}
export interface GuidanceSession { id: string;
    userId: string;
    riskLevel: RiskLevel;
    compromiseIndicators: CompromiseIndicator[];
    recommendations: SecurityRecommendation[];
    completedActions: string[];
    createdAt: Date;
    lastUpdated: Date;
    expiresAt: Date;
    status: 'active' | 'completed' | 'expired' }
}
}
export interface PasswordSecurityAssessment { strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
    score: number;
    weaknesses: string[];
    recommendations: string[];
    isCompromised: boolean;
    breachDatabases: string[];
    reuseDetected: boolean;
    ageInDays: number }
}
}
export interface UserSecurityProfile { userId: string;
    riskScore: number;
    mfaEnabled: boolean;
    passwordLastChanged: Date;
    recentBreaches: CompromiseIndicator[];
    securityScore: number;
    recommendations: SecurityRecommendation[];


/**
 * Comprehensive password guidance and security recommendation service
 */
export declare class PasswordGuidanceService extends EventEmitter {
    private sessions;
    private userProfiles;
    /**
     * Assess password compromise risk and generate guidance
     */
    assessPasswordCompromise(userId: string, indicators: CompromiseIndicator[]): Promise<GuidanceSession>;
    /**
     * Get immediate actions for compromised password
     */
    getImmediateActions(compromiseType: CompromiseType): SecurityRecommendation[];
    /**
     * Generate comprehensive security recommendations
     */
    private generateRecommendations;
    /**
     * Get MFA setup recommendation
     */
    private getMFARecommendation;
    /**
     * Get password manager recommendation
     */
    private getPasswordManagerRecommendation;
    /**
     * Get monitoring recommendations based on risk level
     */
    private getMonitoringRecommendations;
    /**
     * Get prevention recommendations
     */
    private getPreventionRecommendations;
    /**
     * Calculate overall risk level from indicators
     */
    private calculateRiskLevel;
    /**
     * Prioritize recommendations based on risk level and dependencies
     */
    private prioritizeRecommendations;
    /**
     * Mark action as completed
     */
    markActionCompleted(sessionId: string, actionId: string): boolean;
    /**
     * Get guidance session progress
     */
    getSessionProgress(sessionId: string): {
        total: number;
        completed: number;
        percentage: number;
        remainingCritical: number }
}
    } | null;
    /**
     * Calculate session progress
     */
    private calculateProgress;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Update user security profile
     */
    private updateUserSecurityProfile;
    /**
     * Calculate user risk score
     */
    private calculateUserRiskScore;
    /**
     * Get user security dashboard
     */
    getUserSecurityDashboard(userId: string): { profile: UserSecurityProfile | null;
        activeSessions: GuidanceSession[];
        recommendedActions: SecurityRecommendation[];
        securityTips: string[] };
    /**
     * Get personalized security recommendations
     */
    private getPersonalizedRecommendations;
    /**
     * Get contextual security tips
     */
    private getSecurityTips;

export default PasswordGuidanceService;
//# sourceMappingURL=PasswordGuidanceService.d.ts.map