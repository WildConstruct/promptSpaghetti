// Epic 11 Authentication Configuration
// Security configuration and OWASP compliance settings

import { AuthConfig, SecurityConfig, OAuthProvider, OAuthProviderConfig, RateLimitRule } from './types';

// Default security configuration following OWASP guidelines
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  // Password policy (OWASP recommendations)
  passwordMinLength: 12,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  
  // Account lockout policy
  maxFailedLoginAttempts: 5,
  accountLockoutDuration: 30, // 30 minutes
  
  // Token expiry settings
  passwordResetTokenExpiry: 60, // 1 hour
  emailVerificationTokenExpiry: 24 * 60, // 24 hours
  sessionTokenExpiry: 15, // 15 minutes (short-lived access tokens)
  refreshTokenExpiry: 7 // 7 days
};

// Rate limiting rules for different endpoints
export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  // Authentication endpoints
  login: {
    window: 60, // 1 minute
    max: 5, // 5 attempts per minute
    skipSuccessfulRequests: true

  register: {
    window: 60, // 1 minute
    max: 3 // 3 registrations per minute

  passwordReset: {
    window: 300, // 5 minutes
    max: 3 // 3 password reset requests per 5 minutes

  emailVerification: {
    window: 300, // 5 minutes
    max: 5 // 5 email verification attempts per 5 minutes

  // API endpoints
  apiGeneral: {
    window: 60, // 1 minute
    max: 100 // 100 requests per minute

  // Sensitive operations
  passwordChange: {
    window: 300, // 5 minutes
    max: 3 // 3 password changes per 5 minutes

  // OAuth endpoints
  oauth: {
    window: 60, // 1 minute
    max: 10 // 10 OAuth attempts per minute

};

// OAuth provider configurations
export const OAUTH_PROVIDERS: Record<string, Partial<OAuthProviderConfig>> = {
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile']

  github: {
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scopes: ['user:email']

  microsoft: {
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['openid', 'email', 'profile']

};

// Environment-based configuration builder
export function buildAuthConfig(): AuthConfig {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');


  return {
    jwtSecret,
    jwtIssuer: process.env.JWT_ISSUER || 'promptscape-auth',
    jwtAudience: process.env.JWT_AUDIENCE || 'promptscape-api',
    
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'promptscape',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true',
      poolSize: parseInt(process.env.DB_POOL_SIZE || '10')

    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'auth:'

    security: {
      ...DEFAULT_SECURITY_CONFIG,
      // Allow environment overrides
      passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '12'),
      maxFailedLoginAttempts: parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS || '5'),
      accountLockoutDuration: parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || '30'),
      sessionTokenExpiry: parseInt(process.env.SESSION_TOKEN_EXPIRY || '15'),
      refreshTokenExpiry: parseInt(process.env.REFRESH_TOKEN_EXPIRY || '7')

    oauth: buildOAuthProviders(),
    
    emailService: process.env.EMAIL_API_KEY ? {
      apiKey: process.env.EMAIL_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@promptscape.com',
      fromName: process.env.EMAIL_FROM_NAME || 'PromptScape'
 : undefined
  };


function buildOAuthProviders(): AuthConfig['oauth'] {
  return {
    google: {
      ...OAUTH_PROVIDERS.google,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8000/auth/oauth/google/callback'
 as OAuthProviderConfig,
    github: {
      ...OAUTH_PROVIDERS.github,
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:8000/auth/oauth/github/callback'
 as OAuthProviderConfig,
    microsoft: {
      ...OAUTH_PROVIDERS.microsoft,
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:8000/auth/oauth/microsoft/callback'
 as OAuthProviderConfig
  };


// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\'; connect-src \'self\''
};

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

// Password validation rules
export const PASSWORD_RULES = {
  minLength: DEFAULT_SECURITY_CONFIG.passwordMinLength,
  maxLength: 128,
  requireUppercase: DEFAULT_SECURITY_CONFIG.passwordRequireUppercase,
  requireLowercase: DEFAULT_SECURITY_CONFIG.passwordRequireLowercase,
  requireNumbers: DEFAULT_SECURITY_CONFIG.passwordRequireNumbers,
  requireSymbols: DEFAULT_SECURITY_CONFIG.passwordRequireSymbols,
  forbiddenPasswords: [
    'password', 'password123', '123456', 'qwerty', 'abc123',
    'letmein', 'monkey', '1234567890', 'dragon', 'princess',
    'password1', 'admin', 'root', 'user', 'guest'
  ]
};

// Email templates configuration
export const EMAIL_TEMPLATES = {
  emailVerification: {
    subject: 'Verify your email address',
    template: 'email-verification'

  passwordReset: {
    subject: 'Reset your password',
    template: 'password-reset'

  passwordChanged: {
    subject: 'Your password has been changed',
    template: 'password-changed'

  loginAlert: {
    subject: 'New login to your account',
    template: 'login-alert'

  accountLocked: {
    subject: 'Your account has been locked',
    template: 'account-locked'

};

// Audit event types
export const AUDIT_EVENTS = {
  // Authentication events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  EMAIL_VERIFIED: 'email_verified',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',
  
  // User management events
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_SUSPENDED: 'user_suspended',
  USER_REACTIVATED: 'user_reactivated',
  
  // Role and permission events
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_REMOVED: 'role_removed',
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  
  // Organization events
  ORGANIZATION_CREATED: 'organization_created',
  ORGANIZATION_UPDATED: 'organization_updated',
  ORGANIZATION_DELETED: 'organization_deleted',
  USER_INVITED: 'user_invited',
  INVITATION_ACCEPTED: 'invitation_accepted',
  
  // Security events
  SUSPICIOUS_LOGIN: 'suspicious_login',
  BRUTE_FORCE_ATTEMPT: 'brute_force_attempt',
  TOKEN_COMPROMISED: 'token_compromised',
  UNAUTHORIZED_ACCESS: 'unauthorized_access'
};

// JWT configuration
export const JWT_CONFIG = {
  algorithm: 'RS256' as const,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: process.env.JWT_ISSUER || 'promptscape-auth',
  audience: process.env.JWT_AUDIENCE || 'promptscape-api'
};

// Session configuration
export const SESSION_CONFIG = {
  cookieName: 'promptscape-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours

};

// Database migration configuration
export const MIGRATION_CONFIG = {
  directory: './src/auth/migrations',
  tableName: 'auth_migrations',
  schemaVersion: '1.0.0'
};

export default buildAuthConfig;