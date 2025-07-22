/**
 * Accessibility Manager Service
 *
 * Comprehensive accessibility management system providing fallback mechanisms
 * for users with disabilities, ensuring compliance with WCAG 2.1 AA standards
 * and providing inclusive authentication experiences.
 *
 * Features:
 * - Alternative authentication methods for accessibility
 * - Screen reader and assistive technology support
 * - Visual, auditory, and motor impairment accommodations
 * - Cognitive disability support
 * - Customizable user interface adaptations
 * - Compliance monitoring and reporting
 * - Emergency accessibility bypass procedures
 */
import { EventEmitter } from 'events';
export declare enum AccessibilityNeed {
    VISUAL_IMPAIRMENT = "visual_impairment",
    HEARING_IMPAIRMENT = "hearing_impairment",
    MOTOR_IMPAIRMENT = "motor_impairment",
    COGNITIVE_IMPAIRMENT = "cognitive_impairment",
    SPEECH_IMPAIRMENT = "speech_impairment",
    TEMPORARY_DISABILITY = "temporary_disability",
    MULTIPLE_DISABILITIES = "multiple_disabilities"
}
export declare enum SeverityLevel {
    MILD = "mild",
    MODERATE = "moderate",
    SEVERE = "severe",
    COMPLETE = "complete"
}
export declare enum FallbackMethod {
    AUDIO_CAPTCHA = "audio_captcha",
    LARGE_TEXT_DISPLAY = "large_text_display",
    HIGH_CONTRAST_MODE = "high_contrast_mode",
    SIMPLIFIED_INTERFACE = "simplified_interface",
    VOICE_AUTHENTICATION = "voice_authentication",
    GESTURE_AUTHENTICATION = "gesture_authentication",
    ASSISTED_INPUT = "assisted_input",
    EXTENDED_TIMEOUTS = "extended_timeouts",
    ALTERNATIVE_VERIFICATION = "alternative_verification",
    HUMAN_ASSISTANCE = "human_assistance",
    EMAIL_VERIFICATION = "email_verification",
    PHONE_VERIFICATION = "phone_verification",
    BACKUP_CODES = "backup_codes"
}
export declare enum AssistiveTechnology {
    SCREEN_READER = "screen_reader",
    MAGNIFIER = "magnifier",
    VOICE_CONTROL = "voice_control",
    EYE_TRACKER = "eye_tracker",
    SWITCH_ACCESS = "switch_access",
    KEYBOARD_ONLY = "keyboard_only",
    TOUCH_ASSISTANCE = "touch_assistance",
    COGNITIVE_ASSISTANT = "cognitive_assistant"
}
export declare enum InterfaceAdaptation {
    FONT_SIZE_INCREASE = "font_size_increase",
    CONTRAST_ENHANCEMENT = "contrast_enhancement",
    COLOR_ADJUSTMENT = "color_adjustment",
    MOTION_REDUCTION = "motion_reduction",
    TIMEOUT_EXTENSION = "timeout_extension",
    SIMPLIFIED_LAYOUT = "simplified_layout",
    AUDIO_DESCRIPTIONS = "audio_descriptions",
    CAPTIONS = "captions",
    FOCUS_INDICATORS = "focus_indicators",
    ERROR_CLARIFICATION = "error_clarification"
}
export interface UserAccessibilityProfile {
    userId: string;
    needs: AccessibilityNeed[];
    severityLevels: Record<AccessibilityNeed, SeverityLevel>;
    assistiveTechnologies: AssistiveTechnology[];
    preferredFallbacks: FallbackMethod[];
    interfaceAdaptations: InterfaceAdaptation[];
    customSettings: {
        fontSize: number;
        contrastRatio: number;
        timeoutMultiplier: number;
        audioEnabled: boolean;
        visualEnabled: boolean;
        hapticEnabled: boolean;
        animationsReduced: boolean;
        colorBlindnessType?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochromacy';
    };
    verificationMethods: {
        primary: string[];
        fallback: string[];
        emergency: string[];
    };
    emergencyContacts: Array<{
        name: string;
        relationship: string;
        phone: string;
        email: string;
        canAuthorize: boolean;
    }>;
    documentation: {
        medicalCertification?: string;
        accommodationLetter?: string;
        renewalDate?: Date;
    };
    lastUpdated: Date;
    isActive: boolean;
}
export interface AccessibilityContext {
    userAgent: string;
    screenReaderDetected: boolean;
    assistiveTechDetected: AssistiveTechnology[];
    deviceCapabilities: {
        hasCamera: boolean;
        hasMicrophone: boolean;
        hasTouch: boolean;
        hasKeyboard: boolean;
        hasMouse: boolean;
        screenSize: {
            width: number;
            height: number;
        };
        colorDepth: number;
    };
    environmentalFactors: {
        isNoisy: boolean;
        isLowLight: boolean;
        isPublicSpace: boolean;
        hasTimeConstraints: boolean;
    };
    sessionContext: {
        isEmergency: boolean;
        attemptCount: number;
        timeRemaining: number;
        lastSuccessfulMethod: string;
    };
}
export interface FallbackConfiguration {
    method: FallbackMethod;
    enabled: boolean;
    priority: number;
    requirements: {
        needsAudio: boolean;
        needsVisual: boolean;
        needsInteraction: boolean;
        minimumTime: number;
        maximumTime: number;
    };
    accessibility: {
        supportedNeeds: AccessibilityNeed[];
        incompatibleWith: AccessibilityNeed[];
        assistiveTechSupport: AssistiveTechnology[];
    };
    implementation: {
        component: string;
        params: Record<string, any>;
        validationRules: string[];
    };
    compliance: {
        wcagLevel: 'A' | 'AA' | 'AAA';
        section508: boolean;
        ada: boolean;
    };
}
export interface AccessibilityValidationResult {
    isAccessible: boolean;
    fallbacksRequired: FallbackMethod[];
    adaptationsNeeded: InterfaceAdaptation[];
    issues: Array<{
        type: 'critical' | 'major' | 'minor';
        description: string;
        wcagReference: string;
        recommendation: string;
    }>;
    score: number;
    complianceLevel: 'A' | 'AA' | 'AAA' | 'Non-compliant';
}
export interface EmergencyBypass {
    id: string;
    userId: string;
    reason: string;
    authorizedBy: string;
    authorizedAt: Date;
    expiresAt: Date;
    usageCount: number;
    maxUsages: number;
    conditions: {
        ipRestriction?: string[];
        timeRestriction?: {
            start: string;
            end: string;
        };
        requiresNotification: boolean;
        requiresFollowUp: boolean;
    };
    auditTrail: Array<{
        timestamp: Date;
        action: string;
        details: Record<string, any>;
    }>;
}
/**
 * Comprehensive accessibility management service
 */
export declare class AccessibilityManager extends EventEmitter {
    private userProfiles;
    private fallbackConfigs;
    private emergencyBypasses;
    private accessibilityMetrics;
    constructor();
    /**
     * Create or update user accessibility profile
     */
    createAccessibilityProfile(userId: string, profileData: Partial<UserAccessibilityProfile>): Promise<UserAccessibilityProfile>;
    /**
     * Analyze user context and recommend accessibility accommodations
     */
    analyzeAccessibilityNeeds(userId: string, context: AccessibilityContext): Promise<{
        recommendedFallbacks: FallbackMethod[];
        requiredAdaptations: InterfaceAdaptation[];
        estimatedDifficulty: 'low' | 'medium' | 'high' | 'critical';
        alternatives: Array<{
            method: string;
            accessibility: number;
            estimated_time: number;
            requirements: string[];
        }>;
    }>;
    /**
     * Validate accessibility compliance for authentication flow
     */
    validateAccessibilityCompliance(authenticationFlow: any, userProfile?: UserAccessibilityProfile): AccessibilityValidationResult;
    /**
     * Create emergency accessibility bypass
     */
    createEmergencyBypass(userId: string, reason: string, authorizedBy: string, durationHours?: number, maxUsages?: number): Promise<string>;
    /**
     * Use emergency accessibility bypass
     */
    useEmergencyBypass(bypassId: string, context: Record<string, any>): {
        allowed: boolean;
        reason?: string;
        remainingUses?: number;
    };
    /**
     * Get accessibility adaptation recommendations
     */
    getAdaptationRecommendations(userId: string, currentInterface: any): {
        adaptations: Array<{
            type: InterfaceAdaptation;
            priority: 'high' | 'medium' | 'low';
            implementation: {
                css?: Record<string, string>;
                js?: string;
                html?: string;
            };
            description: string;
        }>;
        estimatedImpact: number;
    };
    /**
     * Get accessibility statistics and metrics
     */
    getAccessibilityMetrics(): {
        totalUsers: number;
        usersWithProfiles: number;
        accessibilityNeeds: Record<AccessibilityNeed, number>;
        fallbackUsage: Record<FallbackMethod, number>;
        complianceScores: {
            average: number;
            distribution: Record<'A' | 'AA' | 'AAA' | 'Non-compliant', number>;
        };
        emergencyBypasses: {
            active: number;
            used: number;
            expired: number;
        };
        topIssues: Array<{
            issue: string;
            frequency: number;
            severity: 'critical' | 'major' | 'minor';
        }>;
    };
    private calculateDifficultyScore;
    private generateAuthenticationAlternatives;
    private getColorBlindnessFilter;
    private initializeFallbackConfigurations;
    private startComplianceMonitoring;
    private updateComplianceMetrics;
}
export declare const accessibilityManager: AccessibilityManager;
export default AccessibilityManager;
//# sourceMappingURL=AccessibilityManager.d.ts.map