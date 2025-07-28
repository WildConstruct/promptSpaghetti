// import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import { z } from 'zod';
import { randomBytes, createHash } from 'crypto';
import { WorkspaceDAO } from '../database/workspace-dao.js';
import { Permission } from '../database/workspace-models.js';
// import { User, UserRole } from '../database/workspace-models.js';

// OAuth Provider Configuration Schema
const OAuthProviderSchema = z.object({
  provider: z.enum(['google', 'github', 'microsoft', 'okta', 'auth0']),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  scope: z.string().optional(),
  domain: z.string().optional() // For enterprise SSO
});

// Session Management Schema
const SessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  workspaceId: z.string().optional(),
  permissions: z.array(z.string()),
  expiresAt: z.date(),
  metadata: z.record(z.any()).optional()
});

// MFA Configuration Schema
const MFAConfigSchema = z.object({
  userId: z.string(),
  secret: z.string(),
  backupCodes: z.array(z.string()),
  enabled: z.boolean(),
  lastUsed: z.date().optional()
});

export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type MFAConfig = z.infer<typeof MFAConfigSchema>;

}
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}
}

}
interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}
}

export class AuthService {
  private workspaceDAO: WorkspaceDAO;
  private jwtSecret: string;
  private sessionStore: Map<string, Session> = new Map();
  private mfaStore: Map<string, MFAConfig> = new Map();
  private oauthProviders: Map<string, OAuthProvider> = new Map();

  constructor(workspaceDAO: WorkspaceDAO, jwtSecret: string) {
    this.workspaceDAO = workspaceDAO;
    this.jwtSecret = jwtSecret;
  }

  // OAuth Provider Management
  async registerOAuthProvider(config: OAuthProvider): Promise<void> {

    const validatedConfig = OAuthProviderSchema.parse(config);
    this.oauthProviders.set(validatedConfig.provider, validatedConfig);
  }

  async getOAuthProvider(provider: string): Promise<OAuthProvider | null> {

    return this.oauthProviders.get(provider) || null;
  }

  // OAuth Authorization URL Generation
  async getAuthorizationUrl(provider: string, state?: string): Promise<string> {

    const config = await this.getOAuthProvider(provider);
    if (!config) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope || this.getDefaultScope(provider),
      state: state || this.generateState()
    });

    return `${this.getAuthEndpoint(provider)}?${params.toString()}`;
  }

  // OAuth Token Exchange
  async exchangeCodeForToken(provider: string, code: string, state?: string): Promise<TokenResponse> {

    const config = await this.getOAuthProvider(provider);
    if (!config) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    const tokenEndpoint = this.getTokenEndpoint(provider);
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
  }
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri
  }
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json() as TokenResponse;
  }

  // OAuth User Info Retrieval
  async getUserInfo(provider: string, accessToken: string): Promise<UserInfo> {

    const userInfoEndpoint = this.getUserInfoEndpoint(provider);
    const response = await fetch(userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const userInfo = await response.json();
    return this.normalizeUserInfo(provider, userInfo);
  }

  // Session Management
  async createSession(userId: string, workspaceId?: string, permissions: Permission[] = []): Promise<string> {

    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const session: Session = {
      sessionId,
      userId,
      workspaceId,
      permissions: permissions.map(p => p.toString()),
      expiresAt,
      metadata: {
        createdAt: new Date(),
        userAgent: '', // Will be set by request handler
        ipAddress: '' // Will be set by request handler
      }
    };

    this.sessionStore.set(sessionId, session);
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<Session | null> {

    const session = this.sessionStore.get(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      this.sessionStore.delete(sessionId);
      return null;
    }

    return session;
  }

  async refreshSession(sessionId: string): Promise<string> {

    const session = await this.validateSession(sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }

    // Create new session with extended expiry
    const newSessionId = await this.createSession(
      session.userId,
      session.workspaceId,
      session.permissions.map(p => parseInt(p) as Permission)
    );

    // Remove old session
    this.sessionStore.delete(sessionId);
    return newSessionId;
  }

  async revokeSession(sessionId: string): Promise<void> {

    this.sessionStore.delete(sessionId);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {

    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.userId === userId) {
        this.sessionStore.delete(sessionId);
      }
    }
  }

  // JWT Token Management
  async generateJWT(payload: Record<string, any>, expiresIn: string = '24h'): Promise<string> {

    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }

  async verifyJWT(token: string): Promise<unknown> {

    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  // Multi-Factor Authentication
  async enableMFA(userId: string): Promise<{ secret: string; backupCodes: string[] }> {

    const secret = this.generateMFASecret();
    const backupCodes = this.generateBackupCodes();

    const mfaConfig: MFAConfig = {
      userId,
      secret,
      backupCodes,
      enabled: true
    };

    this.mfaStore.set(userId, mfaConfig);
    return { secret, backupCodes };
  }

  async verifyMFA(userId: string, token: string): Promise<boolean> {

    const mfaConfig = this.mfaStore.get(userId);
    if (!mfaConfig || !mfaConfig.enabled) {
      return false;
    }

    // Check TOTP token
    if (this.verifyTOTP(mfaConfig.secret, token)) {
      mfaConfig.lastUsed = new Date();
      return true;
    }

    // Check backup codes
    const codeIndex = mfaConfig.backupCodes.indexOf(token);
    if (codeIndex !== -1) {
      mfaConfig.backupCodes.splice(codeIndex, 1); // Remove used backup code
      mfaConfig.lastUsed = new Date();
      return true;
    }

    return false;
  }

  async disableMFA(userId: string): Promise<void> {

    const mfaConfig = this.mfaStore.get(userId);
    if (mfaConfig) {
      mfaConfig.enabled = false;
    }
  }

  // Permission Management
  async getUserPermissions(userId: string, workspaceId?: string): Promise<Permission[]> {

    if (workspaceId) {
      const membership = await this.workspaceDAO.getUserMembership(userId, workspaceId);
      if (!membership) {
        return [];
      }
      return membership.permissions;
    }

    // Global permissions - would need to be extended based on requirements
    return [];
  }

  async hasPermission(userId: string, permission: Permission, workspaceId?: string): Promise<boolean> {

    const permissions = await this.getUserPermissions(userId, workspaceId);
    return permissions.includes(permission);
  }

  // Utility Methods
  private getDefaultScope(provider: string): string {
    const scopes = {
      google: 'openid email profile',
      github: 'user:email',
      microsoft: 'openid email profile',
      okta: 'openid email profile',
      auth0: 'openid email profile'
    };
    return scopes[provider as keyof typeof scopes] || 'openid email profile';
  }

  private getAuthEndpoint(provider: string): string {
    const endpoints = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      github: 'https://github.com/login/oauth/authorize',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      okta: '', // Will be configured per domain
      auth0: '' // Will be configured per domain
    };
    return endpoints[provider as keyof typeof endpoints];
  }

  private getTokenEndpoint(provider: string): string {
    const endpoints = {
      google: 'https://oauth2.googleapis.com/token',
      github: 'https://github.com/login/oauth/access_token',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      okta: '', // Will be configured per domain
      auth0: '' // Will be configured per domain
    };
    return endpoints[provider as keyof typeof endpoints];
  }

  private getUserInfoEndpoint(provider: string): string {
    const endpoints = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      github: 'https://api.github.com/user',
      microsoft: 'https://graph.microsoft.com/v1.0/me',
      okta: '', // Will be configured per domain
      auth0: '' // Will be configured per domain
    };
    return endpoints[provider as keyof typeof endpoints];
  }

  private normalizeUserInfo(provider: string, userInfo: unknown): UserInfo {
    switch (provider) {
    case 'google':
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        verified_email: userInfo.verified_email
      };
    case 'github':
      return {
        id: userInfo.id.toString(),
        email: userInfo.email,
        name: userInfo.name || userInfo.login,
        picture: userInfo.avatar_url
      };
    case 'microsoft':
      return {
        id: userInfo.id,
        email: userInfo.mail || userInfo.userPrincipalName,
        name: userInfo.displayName
      };
    default:
      return userInfo;
    }
  }

  private generateState(): string {
    return randomBytes(32).toString('hex');
  }

  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  private generateMFASecret(): string {
    return randomBytes(32).toString('base32');
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  private verifyTOTP(secret: string, token: string): boolean {
    // TOTP implementation would go here
    // This is a simplified placeholder
    const timeStep = Math.floor(Date.now() / 30000);
    const hash = createHash('sha1').update(secret + timeStep).digest('hex');
    const expectedToken = hash.substring(0, 6);
    return token === expectedToken;
  }

  // Enterprise SSO Support
  async configureSAML(____workspaceId: string, ____config: {
    entityId: string;
    ssoUrl: string;
    certificate: string;
    attributeMapping: Record<string, string>;
  }): Promise<void> {

    // SAML configuration implementation
    // This would integrate with a SAML library like passport-saml
    throw new Error('SAML configuration not yet implemented');
  }

  async configureOIDC(____workspaceId: string, ____config: {
    issuer: string;
    clientId: string;
    clientSecret: string;
    scope: string;
  }): Promise<void> {

    // OIDC configuration implementation
    // This would integrate with openid-client
    throw new Error('OIDC configuration not yet implemented');
  }
}