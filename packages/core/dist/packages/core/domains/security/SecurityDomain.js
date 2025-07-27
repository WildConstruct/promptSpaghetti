/**
 * Security Domain Interface
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Main interface and export for the security domain
 */
// Event constants for cross-domain communication
export const SECURITY_DOMAIN_EVENTS = {
    USER_AUTHENTICATED: 'security:user:authenticated',
    USER_LOGGED_OUT: 'security:user:logged_out',
    AUTHENTICATION_FAILED: 'security:authentication:failed',
    ACCESS_GRANTED: 'security:access:granted',
    ACCESS_DENIED: 'security:access:denied',
    PERMISSION_CHANGED: 'security:permission:changed',
    SECURITY_VIOLATION: 'security:violation:detected',
    POLICY_VIOLATION: 'security:policy:violation',
    AUDIT_LOG_CREATED: 'security:audit:log:created',
    SECURITY_ALERT: 'security:alert:created',
    RISK_SCORE_UPDATED: 'security:risk:score:updated',
    SESSION_EXPIRED: 'security:session:expired',
    MFA_REQUIRED: 'security:mfa:required',
    ENCRYPTION_KEY_ROTATED: 'security:encryption:key:rotated'
};
