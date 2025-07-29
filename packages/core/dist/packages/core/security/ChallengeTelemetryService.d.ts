/**
 * Challenge Telemetry Service
 *
 * Comprehensive telemetry system for tracking the effectiveness of security
 * challenges, CAPTCHAs, and authentication methods. Provides real-time
 * analytics, fraud detection, and optimization recommendations.
 *
 * Features:
 * - Challenge success/failure rate tracking
 * - User behavior analytics
 * - Fraud pattern detection
 * - Performance metrics collection
 * - A/B testing support
 * - Real-time dashboards
 * - Automated optimization suggestions
 */
import { EventEmitter } from 'events';
export declare enum ChallengeType {
    CAPTCHA_IMAGE = "captcha_image",
    CAPTCHA_AUDIO = "captcha_audio",
    CAPTCHA_MATH = "captcha_math",
    CAPTCHA_TEXT = "captcha_text",
    TWO_FACTOR_SMS = "two_factor_sms",
    TWO_FACTOR_EMAIL = "two_factor_email",
    TWO_FACTOR_TOTP = "two_factor_totp",
    BIOMETRIC_FINGERPRINT = "biometric_fingerprint",
    BIOMETRIC_FACE = "biometric_face",
    BEHAVIORAL_ANALYSIS = "behavioral_analysis",
    DEVICE_VERIFICATION = "device_verification",
    LOCATION_VERIFICATION = "location_verification",
    export,
    enum,
    ChallengeOutcome
}
export declare class ChallengeTelemetryService extends EventEmitter {
    private events;
    private statistics;
    private abTests;
    private fraudPatterns;
    private sessionData;
    constructor();
    /**
    * Record a challenge event
    */
    recordChallengeEvent(event: Omit<ChallengeEvent, 'id' | 'timestamp'>): string;
    /**
     * Start tracking a challenge session
     */
    startChallengeSession(sessionId: string): any;
    challengeType: ChallengeType;
    context: Partial<ChallengeEvent['context']>;
}
//# sourceMappingURL=ChallengeTelemetryService.d.ts.map