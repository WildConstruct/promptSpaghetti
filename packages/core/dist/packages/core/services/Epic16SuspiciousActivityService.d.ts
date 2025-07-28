export interface SuspiciousActivity {
    id: string;
    type: ActivityType;
    severity: SeverityLevel;
    confidence: number;
    userId?: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    description: string;
    evidence: ActivityEvidence;
    patterns: DetectionPattern;
    metadata: Record<string, any>;
    detectionMethod: DetectionMethod;
    detectedBy: string;
    riskScore: number;
    status: ActivityStatus;
    investigated: boolean;
    investigatedBy?: string;
    investigatedAt?: Date;
    resolution?: ActivityResolution;
    relatedActivities: string;
    clusterId?: string;
    actionsTriggered: ResponseAction;
    geolocation?: GeoLocation;
    deviceFingerprint?: DeviceFingerprint;
}
export declare enum ActivityType {
    BRUTE_FORCE_LOGIN = "brute_force_login",
    CREDENTIAL_STUFFING = "credential_stuffing",
    UNUSUAL_LOGIN_LOCATION = "unusual_login_location",
    IMPOSSIBLE_TRAVEL = "impossible_travel",
    MULTIPLE_ACCOUNT_ACCESS = "multiple_account_access",
    RAPID_ACCOUNT_CREATION = "rapid_account_creation",
    FAKE_ACCOUNT_CREATION = "fake_account_creation",
    ACCOUNT_TAKEOVER = "account_takeover",
    PROFILE_MANIPULATION = "profile_manipulation",
    FAKE_TEMPLATE_UPLOAD = "fake_template_upload",
    COPYRIGHT_VIOLATION = "copyright_violation",
    PRICE_MANIPULATION = "price_manipulation",
    FAKE_REVIEWS = "fake_reviews",
    RATING_MANIPULATION = "rating_manipulation",
    CHARGEBACK_FRAUD = "chargeback_fraud",
    SPAM_POSTING = "spam_posting",
    MASS_MESSAGING = "mass_messaging",
    HARASSMENT = "harassment",
    HATE_SPEECH = "hate_speech",
    DOXXING = "doxxing",
    IMPERSONATION = "impersonation",
    DDoS_ATTEMPT = "ddos_attempt",
    SCRAPING_ATTEMPT = "scraping_attempt",
    API_ABUSE = "api_abuse",
    INJECTION_ATTEMPT = "injection_attempt",
    XSS_ATTEMPT = "xss_attempt",
    PAYMENT_FRAUD = "payment_fraud",
    MONEY_LAUNDERING = "money_laundering",
    REFUND_ABUSE = "refund_abuse",
    CURRENCY_MANIPULATION = "currency_manipulation",
    DATA_SCRAPING = "data_scraping",
    PRIVACY_VIOLATION = "privacy_violation",
    UNAUTHORIZED_ACCESS = "unauthorized_access",
    DATA_EXFILTRATION = "data_exfiltration",
    VOTE_MANIPULATION = "vote_manipulation",
    ALGORITHM_GAMING = "algorithm_gaming",
    FAKE_ENGAGEMENT = "fake_engagement",
    COORDINATED_INAUTHENTIC_BEHAVIOR = "coordinated_inauthentic_behavior",
    export,
    enum,
    SeverityLevel
}
//# sourceMappingURL=Epic16SuspiciousActivityService.d.ts.map