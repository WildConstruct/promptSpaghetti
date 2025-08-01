// Epic 11 Authentication Service
// Main orchestration service for authentication functionality

import {
  AuthConfig,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerificationRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  PublicUser,
  User
 from './types';

import { UserService } from './services/UserService';
import { TokenService } from './services/TokenService';
import { AuditService } from './services/AuditService';
import { RateLimitService } from './services/RateLimitService';
import { PasswordResetService } from './services/PasswordResetService';
import { EmailService } from './services/EmailService';
import { DatabaseService } from './database/DatabaseService';
import { RedisService } from './database/RedisService';

import { RATE_LIMIT_RULES, AUDIT_EVENTS } from './config';

export class AuthenticationService {
  private config: AuthConfig;
  private userService: UserService;
  private tokenService: TokenService;
  private auditService: AuditService;
  private rateLimitService: RateLimitService;
  private passwordResetService: PasswordResetService;
  private emailService: EmailService;
  private dbService: DatabaseService;
  private redisService: RedisService;

  constructor(config: AuthConfig) {
    this.config = config;
    
    // Initialize database services
    this.dbService = new DatabaseService(config);
    this.redisService = new RedisService(config.redis);
    
    // Initialize core services
    this.auditService = new AuditService(config, this.dbService);
    this.userService = new UserService(config, this.dbService, this.auditService);
    this.tokenService = new TokenService(config, this.redisService, this.dbService);
    this.rateLimitService = new RateLimitService(this.redisService);
    this.emailService = new EmailService(config);
    this.passwordResetService = new PasswordResetService(
      this.dbService,
      this.emailService,
      this.auditService,
      this.rateLimitService
    );


  async initialize(): Promise<void> {

    try {
      // Connect to Redis
      await this.redisService.connect();
      
      // Initialize database schema
      await this.dbService.initializeSchema();
      
      console.log('Authentication service initialized successfully');
 catch (error) {
      console.error('Failed to initialize authentication service:', error);
      throw error;



  async register(
    request: RegisterRequest,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<RegisterResponse> {

    // Rate limiting
    const rateLimitResult = await this.rateLimitService.checkIPRateLimit(
      context.ipAddress || 'unknown',
      'register',
      RATE_LIMIT_RULES.register
    );

    if (!rateLimitResult.allowed) {
      await this.auditService.logEvent({
        action: AUDIT_EVENTS.BRUTE_FORCE_ATTEMPT,
        details: { 
          endpoint: 'register',
          ipAddress: context.ipAddress,
          rateLimitExceeded: true

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw new Error('Rate limit exceeded. Please try again later.');


    try {
      // Create user
      const user = await this.userService.createUser(request);
      
      // Log successful registration
      await this.auditService.logEvent({
        userId: user.id,
        action: AUDIT_EVENTS.USER_CREATED,
        resourceType: 'user',
        resourceId: user.id,
        details: { 
          email: user.email,
          registrationMethod: 'email'

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return {
        user: await this.toPublicUser(user),
        emailVerificationRequired: !user.emailVerified
      };
 catch (error) {
      // Log failed registration
      await this.auditService.logEvent({
        action: 'registration_failed',
        details: { 
          email: request.email,
          error: error instanceof Error ? error.message : String(error)

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw error;



  async login(
    request: LoginRequest,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<LoginResponse> {

    // Rate limiting
    const rateLimitResult = await this.rateLimitService.checkIPRateLimit(
      context.ipAddress || 'unknown',
      'login',
      RATE_LIMIT_RULES.login
    );

    if (!rateLimitResult.allowed) {
      await this.auditService.logEvent({
        action: AUDIT_EVENTS.BRUTE_FORCE_ATTEMPT,
        details: { 
          endpoint: 'login',
          ipAddress: context.ipAddress,
          rateLimitExceeded: true

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw new Error('Rate limit exceeded. Please try again later.');


    let user: User | null = null;
    
    try {
      // Get user by email
      user = await this.userService.getUserByEmail(request.email);
      
      if (!user) {
        throw new Error('Invalid email or password');


      // Check if account is locked
      if (user.accountLocked && user.lockedUntil && user.lockedUntil > new Date()) {
        await this.auditService.logEvent({
          userId: user.id,
          action: AUDIT_EVENTS.LOGIN_FAILED,
          details: { 
            reason: 'account_locked',
            lockedUntil: user.lockedUntil

          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'warning'
        });
        
        throw new Error('Account is locked. Please try again later or reset your password.');


      // Verify password
      const isPasswordValid = await this.userService.verifyPassword(user, request.password);
      
      if (!isPasswordValid) {
        await this.auditService.logEvent({
          userId: user.id,
          action: AUDIT_EVENTS.LOGIN_FAILED,
          details: { 
            reason: 'invalid_password',
            failedAttempts: user.failedLoginAttempts + 1

          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'warning'
        });
        
        throw new Error('Invalid email or password');


      // Check if user is active
      if (user.status !== 'active') {
        await this.auditService.logEvent({
          userId: user.id,
          action: AUDIT_EVENTS.LOGIN_FAILED,
          details: { 
            reason: 'inactive_account',
            status: user.status

          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          severity: 'warning'
        });
        
        throw new Error('Account is not active. Please contact support.');


      // Generate tokens
      const accessToken = await this.tokenService.generateAccessToken(user);
      const refreshToken = await this.tokenService.generateRefreshToken(user);

      // Update last login
      await this.userService.updateUser(user.id, {
        lastLoginAt: new Date()
      });

      // Create session record
      const sessionId = await this.createSession(user.id, {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceInfo: request.deviceInfo
      });

      // Log successful login
      await this.auditService.logEvent({
        userId: user.id,
        action: AUDIT_EVENTS.LOGIN_SUCCESS,
        details: { 
          loginMethod: 'password',
          sessionId

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId,
        severity: 'info'
      });

      // Calculate token expiry
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      return {
        accessToken,
        refreshToken,
        user: await this.toPublicUser(user),
        expiresAt
      };
 catch (error) {
      // Log failed login attempt
      await this.auditService.logEvent({
        userId: user?.id,
        action: AUDIT_EVENTS.LOGIN_FAILED,
        details: { 
          email: request.email,
          error: error instanceof Error ? error.message : String(error)

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw error;



  async logout(
    userId: string,
    sessionId?: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    try {
      // Revoke all user tokens
      await this.tokenService.revokeAllUserTokens(userId);

      // Log logout
      await this.auditService.logEvent({
        userId,
        action: AUDIT_EVENTS.LOGOUT,
        details: { sessionId },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId,
        severity: 'info'
      });
 catch (error) {
      console.error('Logout error:', error);
      // Don't throw - logout should always succeed



  async refreshToken(
    request: RefreshTokenRequest,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {

    try {
      const tokens = await this.tokenService.refreshAccessToken(request.refreshToken);
      
      // Log token refresh
      const payload = await this.tokenService.verifyRefreshToken(request.refreshToken);
      await this.auditService.logEvent({
        userId: payload.sub,
        action: 'token_refreshed',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return tokens;
 catch (error) {
      // Log failed token refresh
      await this.auditService.logEvent({
        action: 'token_refresh_failed',
        details: { error: error instanceof Error ? error.message : String(error) },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw error;



  async requestPasswordReset(
    request: PasswordResetRequest,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {

    // Rate limiting
    const rateLimitResult = await this.rateLimitService.checkIPRateLimit(
      context.ipAddress || 'unknown',
      'password_reset',
      RATE_LIMIT_RULES.passwordReset
    );

    if (!rateLimitResult.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');


    try {
      const resetToken = await this.userService.requestPasswordReset(request.email);
      
      // TODO: Send password reset email
      // await this.emailService.sendPasswordResetEmail(request.email, resetToken);
      
      // Log password reset request (don't include email in logs for privacy)
      await this.auditService.logEvent({
        action: AUDIT_EVENTS.PASSWORD_RESET_REQUESTED,
        details: { hashedEmail: this.hashEmail(request.email) },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });
 catch (error) {
      // Log failed password reset request
      await this.auditService.logEvent({
        action: 'password_reset_request_failed',
        details: { 
          hashedEmail: this.hashEmail(request.email),
          error: error instanceof Error ? error.message : String(error)

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      // Don't throw - don't reveal if email exists



  async resetPassword(
    request: PasswordResetConfirmRequest,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {

    try {
      const user = await this.userService.resetPassword(request.token, request.newPassword);
      
      // Revoke all existing tokens
      await this.tokenService.revokeAllUserTokens(user.id);
      
      // Log password reset completion
      await this.auditService.logEvent({
        userId: user.id,
        action: AUDIT_EVENTS.PASSWORD_RESET_COMPLETED,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });
      
      // TODO: Send password changed notification email
 catch (error) {
      // Log failed password reset
      await this.auditService.logEvent({
        action: 'password_reset_failed',
        details: { 
          token: request.token,
          error: error instanceof Error ? error.message : String(error)

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw error;



  async verifyEmail(
    request: EmailVerificationRequest,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {

    try {
      const user = await this.userService.verifyEmail(request.token);
      
      // Log email verification
      await this.auditService.logEvent({
        userId: user.id,
        action: AUDIT_EVENTS.EMAIL_VERIFIED,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });
 catch (error) {
      // Log failed email verification
      await this.auditService.logEvent({
        action: 'email_verification_failed',
        details: { 
          token: request.token,
          error: error instanceof Error ? error.message : String(error)

        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw error;



  async changePassword(
    userId: string,
    request: ChangePasswordRequest,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {

    // Rate limiting
    const rateLimitResult = await this.rateLimitService.checkUserRateLimit(
      userId,
      'password_change',
      RATE_LIMIT_RULES.passwordChange
    );

    if (!rateLimitResult.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');


    try {
      await this.userService.changePassword(
        userId,
        request.currentPassword,
        request.newPassword
      );
      
      // Revoke all existing tokens except current session
      await this.tokenService.revokeAllUserTokens(userId);
      
      // Log password change
      await this.auditService.logEvent({
        userId,
        action: AUDIT_EVENTS.PASSWORD_CHANGED,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });
      
      // TODO: Send password changed notification email
 catch (error) {
      // Log failed password change
      await this.auditService.logEvent({
        userId,
        action: 'password_change_failed',
        details: { error: error instanceof Error ? error.message : String(error) },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
      
      throw error;



  async validateToken(token: string): Promise<PublicUser> {

    const payload = await this.tokenService.verifyAccessToken(token);
    const user = await this.userService.getUserById(payload.sub);
    
    if (!user) {
      throw new Error('User not found');

    
    return this.toPublicUser(user);


  async healthCheck(): Promise<{ status: string; checks: Record<string, boolean> }> {
    const checks = {
      database: await this.dbService.healthCheck(),
      redis: await this.redisService.healthCheck()
    };
    
    const allHealthy = Object.values(checks).every(check => check);
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks
    };


  private async createSession(
    userId: string,
    sessionData: {
      ipAddress?: string;
      userAgent?: string;
      deviceInfo?: unknown;

  ): Promise<string> {

    const sessionId = require('crypto').randomUUID();
    
    await this.dbService.query(`
      INSERT INTO user_sessions (id, user_id, session_token, ip_address, user_agent, device_info, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      sessionId,
      userId,
      sessionId, // Using same ID for simplicity
      sessionData.ipAddress,
      sessionData.userAgent,
      JSON.stringify(sessionData.deviceInfo || {}),
      new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    ]);
    
    return sessionId;


  private async toPublicUser(user: User): Promise<PublicUser> {

    // Get user profile
    const profileResult = await this.dbService.query(`
      SELECT * FROM user_profiles WHERE user_id = $1
    `, [user.id]);
    
    const profile = profileResult.rows.length > 0 ? {
      id: profileResult.rows[0].id,
      userId: profileResult.rows[0].user_id,
      displayName: profileResult.rows[0].display_name,
      firstName: profileResult.rows[0].first_name,
      lastName: profileResult.rows[0].last_name,
      bio: profileResult.rows[0].bio,
      avatarUrl: profileResult.rows[0].avatar_url,
      timezone: profileResult.rows[0].timezone,
      locale: profileResult.rows[0].locale,
      createdAt: profileResult.rows[0].created_at,
      updatedAt: profileResult.rows[0].updated_at
 : undefined;

    // Get user roles and permissions
    const roles = await this.getUserRoles(user.id);
    const permissions = await this.getUserPermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profile,
      roles,
      permissions
    };


  private async getUserRoles(userId: string) {
    const result = await this.dbService.query(`
      SELECT r.* FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      organizationId: row.organization_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));


  private async getUserPermissions(userId: string) {
    const result = await this.dbService.query(`
      SELECT p.* FROM permissions p
      INNER JOIN roles r ON p.role_id = r.id
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      roleId: row.role_id,
      resource: row.resource,
      action: row.action,
      scope: row.scope,
      conditions: row.conditions ? JSON.parse(row.conditions) : undefined,
      createdAt: row.created_at
    }));


  private hashEmail(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');


  // Service registry for accessing individual services
  getService(serviceName: string): unknown {
    switch (serviceName) {
    case 'user':
      return this.userService;
    case 'token':
      return this.tokenService;
    case 'audit':
      return this.auditService;
    case 'rateLimit':
      return this.rateLimitService;
    case 'passwordReset':
      return this.passwordResetService;
    case 'email':
      return this.emailService;
    case 'database':
      return this.dbService;
    case 'redis':
      return this.redisService;
    default:
      throw new Error(`Unknown service: ${serviceName}`);



  async getHealthStatus(): Promise<{ database: string; redis: string; authentication: string }> {

    try {
      // Check database connectivity
      const dbStatus = await this.dbService.query('SELECT 1 as health');
      const dbHealth = dbStatus.rows.length > 0 ? 'healthy' : 'unhealthy';

      // Check Redis connectivity
      const redisHealth = await this.redisService.healthCheck() ? 'healthy' : 'unhealthy';

      return {
        database: dbHealth,
        redis: redisHealth,
        authentication: 'healthy'
      };
 catch (error) {
      return {
        database: 'unhealthy',
        redis: 'unhealthy',
        authentication: 'unhealthy'
      };



  async shutdown(): Promise<void> {

    await this.redisService.close();
    await this.dbService.close();

