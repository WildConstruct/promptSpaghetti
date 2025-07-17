// Epic 11 Authentication Types and Interfaces
// TypeScript types for authentication and user management

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  hashedPassword?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockedUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  status: 'active' | 'suspended' | 'deleted';
  deletedAt?: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  timezone: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  category: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkedAccount {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  providerEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken?: string;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  revoked: boolean;
  revokedAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  scope: 'global' | 'organization' | 'team';
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  scope: 'global' | 'organization' | 'team' | 'own';
  conditions?: Record<string, any>;
  createdAt: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  grantedBy?: string;
  grantedAt: Date;
  expiresAt?: Date;
  scopeContext?: Record<string, any>;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  branding?: Record<string, any>;
  settings: Record<string, any>;
  plan: 'free' | 'pro' | 'enterprise';
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Team {
  id: string;
  organizationId: string;
  parentTeamId?: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  invitedBy?: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  token: string;
  roleId?: string;
  organizationId?: string;
  teamId?: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  createdAt: Date;
}

// JWT Token payload structure
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  roles: string[];
  permissions: string[];
  organizationId?: string;
  teamIds?: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: Record<string, any>;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
  expiresAt: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  invitationToken?: string;
}

export interface RegisterResponse {
  user: PublicUser;
  emailVerificationRequired: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Public user data (no sensitive information)
export interface PublicUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  profile?: UserProfile;
  roles: Role[];
  permissions: Permission[];
}

// OAuth provider types
export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  redirectUri: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  provider: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// Rate limiting types
export interface RateLimitRule {
  window: number; // time window in seconds
  max: number; // max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

// Security types
export interface SecurityConfig {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  maxFailedLoginAttempts: number;
  accountLockoutDuration: number; // minutes
  passwordResetTokenExpiry: number; // minutes
  emailVerificationTokenExpiry: number; // minutes
  sessionTokenExpiry: number; // minutes
  refreshTokenExpiry: number; // days
}

// Permission checking types
export interface PermissionContext {
  userId: string;
  organizationId?: string;
  teamId?: string;
  resourceId?: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  context?: PermissionContext;
}

// Database connection types for authentication
export interface AuthDatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  poolSize?: number;
}

// Redis session store types
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

// Authentication service configuration
export interface AuthConfig {
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  database: AuthDatabaseConfig;
  redis: RedisConfig;
  security: SecurityConfig;
  oauthProviders: Record<string, OAuthProvider>;
  emailService?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
}

// Service interfaces
export interface IUserService {
  createUser(data: RegisterRequest): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  verifyPassword(user: User, password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface ITokenService {
  generateAccessToken(user: User): Promise<string>;
  generateRefreshToken(user: User): Promise<string>;
  verifyAccessToken(token: string): Promise<JWTPayload>;
  verifyRefreshToken(token: string): Promise<JWTPayload>;
  revokeToken(token: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
}

export interface ISessionService {
  createSession(userId: string, deviceInfo?: Record<string, any>): Promise<UserSession>;
  getSession(sessionToken: string): Promise<UserSession | null>;
  updateSessionActivity(sessionId: string): Promise<void>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>;
}

export interface IPermissionService {
  checkPermission(userId: string, permission: PermissionCheck): Promise<boolean>;
  getUserPermissions(userId: string, context?: PermissionContext): Promise<Permission[]>;
  assignRole(userId: string, roleId: string, context?: Record<string, any>): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>;
  updateRole(id: string, data: Partial<Role>): Promise<Role>;
  deleteRole(id: string): Promise<void>;
}

export interface IRateLimitService {
  checkRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult>;
  resetRateLimit(key: string): Promise<void>;
}

export interface IAuditService {
  logEvent(event: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void>;
  getAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]>;
}