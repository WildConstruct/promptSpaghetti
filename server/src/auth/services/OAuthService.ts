// Epic 11 OAuth Service
// Handles OAuth integration with multiple providers (Google, GitHub, Microsoft)

import { AuthConfig, OAuthProvider, OAuthTokenResponse, OAuthUserInfo } from '../types';
import { UserService } from './UserService';
import { TokenService } from './TokenService';
import { AuditService } from './AuditService';
import { DatabaseService } from '../database/DatabaseService';
import { CertificatePinningManager, loadPinConfigFromEnv } from '../../security/tls-config';

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  userInfoMapping: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    verified?: string;
  };
}

export interface OAuthStateData {
  provider: OAuthProvider;
  returnUrl?: string;
  sessionId: string;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class OAuthService {
  private config: AuthConfig;
  private userService: UserService;
  private tokenService: TokenService;
  private auditService: AuditService;
  private dbService: DatabaseService;
  private providerConfigs: Map<OAuthProvider, OAuthProviderConfig>;
  private certificatePinningManager: CertificatePinningManager;
  private pinnedFetch: typeof fetch;

  constructor(
    config: AuthConfig,
    userService: UserService,
    tokenService: TokenService,
    auditService: AuditService,
    dbService: DatabaseService
  ) {
    this.config = config;
    this.userService = userService;
    this.tokenService = tokenService;
    this.auditService = auditService;
    this.dbService = dbService;
    this.providerConfigs = new Map();
    
    // Initialize certificate pinning for OAuth security
    const pinConfig = loadPinConfigFromEnv();
    this.certificatePinningManager = new CertificatePinningManager(pinConfig);
    this.pinnedFetch = this.certificatePinningManager.createPinnedFetch();
    
    this.initializeProviders();
  }

  /**
   * Enhanced redirect URI validation following OAuth 2.1 security best practices
   * Implements strict validation to prevent redirect URI attacks
   */
  private validateRedirectUriStrict(
    registeredUris: string[], 
    requestedUri: string
  ): boolean {
    return registeredUris.some(registered => {
      // OAuth 2.1: Exact string matching - no partial matches
      if (registered !== requestedUri) return false;
      
      // Enforce HTTPS in production environments
      if (process.env.NODE_ENV === 'production' && !requestedUri.startsWith('https://')) {
        this.auditService.logEvent({
          eventType: 'OAUTH_HTTP_REDIRECT_BLOCKED',
          details: { requestedUri, environment: 'production' },
          severity: 'MEDIUM'
        });
        return false;
      }
      
      // Prevent path traversal attacks - check the normalized URL
      try {
        const url = new URL(requestedUri);
        const normalizedPath = url.pathname;
        
        if (normalizedPath.includes('..') || normalizedPath.includes('/./') || 
            requestedUri.includes('..') || requestedUri.includes('/./')) {
          this.auditService.logEvent({
            eventType: 'OAUTH_PATH_TRAVERSAL_ATTEMPT',
            details: { requestedUri },
            severity: 'HIGH'
          });
          return false;
        }
      } catch (urlError) {
        // If URL parsing fails, treat as path traversal for security
        if (requestedUri.includes('..') || requestedUri.includes('/./')) {
          this.auditService.logEvent({
            eventType: 'OAUTH_PATH_TRAVERSAL_ATTEMPT',
            details: { requestedUri },
            severity: 'HIGH'
          });
          return false;
        }
      }
      
      // Additional security checks
      try {
        const url = new URL(requestedUri);
        
        // Block suspicious query parameters that could be used for attacks
        const suspiciousParams = ['javascript:', 'data:', 'vbscript:', 'file:'];
        if (suspiciousParams.some(param => url.href.toLowerCase().includes(param))) {
          this.auditService.logEvent({
            eventType: 'OAUTH_SUSPICIOUS_REDIRECT_URI',
            details: { requestedUri, reason: 'suspicious_scheme' },
            severity: 'HIGH'
          });
          return false;
        }
        
        return true;
      } catch (error) {
        this.auditService.logEvent({
          eventType: 'OAUTH_INVALID_REDIRECT_URI',
          details: { requestedUri, error: error.message },
          severity: 'MEDIUM'
        });
        return false;
      }
    });
  }

  /**
   * PKCE downgrade protection following OAuth 2.1 security requirements
   * Prevents attacks that attempt to bypass PKCE validation
   */
  private validatePkceRequirement(
    clientId: string, 
    codeChallenge?: string,
    clientType: 'public' | 'confidential' = 'public'
  ): void {
    // OAuth 2.1: PKCE is mandatory for all public clients
    if (clientType === 'public' && !codeChallenge) {
      this.auditService.logEvent({
        eventType: 'OAUTH_PKCE_REQUIRED_VIOLATION',
        details: { clientId, clientType },
        severity: 'HIGH'
      });
      throw new Error('PKCE is required for public clients (OAuth 2.1 compliance)');
    }
    
    // For existing clients that support PKCE, prevent downgrade attacks
    // Only apply to public clients to allow confidential clients legacy support
    if (clientType === 'public') {
      const clientSupportsPkce = this.checkClientPkceCapability(clientId);
      if (clientSupportsPkce && !codeChallenge) {
        this.auditService.logEvent({
          eventType: 'OAUTH_PKCE_DOWNGRADE_ATTEMPT',
          details: { clientId },
          severity: 'HIGH'
        });
        throw new Error('PKCE downgrade attempt detected - client supports PKCE but none provided');
      }
    }
  }

  /**
   * Check if a client has PKCE capability based on registration
   * This would typically be stored in client configuration
   */
  private checkClientPkceCapability(clientId: string): boolean {
    // Implementation would check client configuration
    // For now, assume all clients support PKCE (OAuth 2.1 best practice)
    return true;
  }

  /**
   * Enhanced authorization URL generation with security improvements
   */
  async generateSecureAuthorizationUrl(
    provider: OAuthProvider,
    state: string,
    codeChallenge?: string,
    clientId?: string
  ): Promise<string> {
    const config = this.providerConfigs.get(provider);
    if (!config) {
      throw new Error(`OAuth provider not configured: ${provider}`);
    }

    // Validate PKCE requirements
    if (clientId) {
      this.validatePkceRequirement(clientId, codeChallenge);
    }

    // Validate redirect URI against registered URIs
    const registeredUris = [config.redirectUri]; // In production, this would come from client registration
    if (!this.validateRedirectUriStrict(registeredUris, config.redirectUri)) {
      throw new Error('Invalid redirect URI configuration');
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
      ...(codeChallenge && { 
        code_challenge: codeChallenge,
        code_challenge_method: 'S256' 
      })
    });
    
    const authUrl = `${config.authorizationUrl}?${params.toString()}`;
    
    // Log authorization request for audit trail
    this.auditService.logEvent({
      eventType: 'OAUTH_AUTHORIZATION_URL_GENERATED',
      details: {
        provider,
        clientId: config.clientId,
        scopes: config.scopes,
        pkceUsed: !!codeChallenge
      },
      severity: 'LOW'
    });
    
    return authUrl;
  }

  private initializeProviders(): void {
    // Google OAuth Configuration
    this.providerConfigs.set('google', {
      clientId: this.config.oauth.google.clientId,
      clientSecret: this.config.oauth.google.clientSecret,
      redirectUri: this.config.oauth.google.redirectUri,
      scopes: ['openid', 'email', 'profile'],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      userInfoMapping: {
        id: 'id',
        email: 'email',
        name: 'name',
        picture: 'picture',
        verified: 'verified_email'
      }
    });

    // GitHub OAuth Configuration
    this.providerConfigs.set('github', {
      clientId: this.config.oauth.github.clientId,
      clientSecret: this.config.oauth.github.clientSecret,
      redirectUri: this.config.oauth.github.redirectUri,
      scopes: ['user:email', 'read:user'],
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      userInfoMapping: {
        id: 'id',
        email: 'email',
        name: 'name',
        picture: 'avatar_url'
      }
    });

    // Microsoft OAuth Configuration
    this.providerConfigs.set('microsoft', {
      clientId: this.config.oauth.microsoft.clientId,
      clientSecret: this.config.oauth.microsoft.clientSecret,
      redirectUri: this.config.oauth.microsoft.redirectUri,
      scopes: ['openid', 'email', 'profile'],
      authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      userInfoMapping: {
        id: 'id',
        email: 'mail',
        name: 'displayName',
        picture: 'photo'
      }
    });
  }

  async generateAuthorizationUrl(
    provider: OAuthProvider,
    returnUrl?: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ url: string; state: string }> {
    const providerConfig = this.providerConfigs.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // Generate state parameter for CSRF protection
    const state = await this.generateOAuthState(provider, returnUrl, context);

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: providerConfig.redirectUri,
      response_type: 'code',
      scope: providerConfig.scopes.join(' '),
      state
    });

    // Provider-specific parameters
    if (provider === 'google') {
      params.append('access_type', 'offline');
      params.append('prompt', 'consent');
    } else if (provider === 'microsoft') {
      params.append('response_mode', 'query');
    }

    const authUrl = `${providerConfig.authorizationUrl}?${params.toString()}`;

    // Log OAuth initiation
    await this.auditService.logEvent({
      action: 'oauth_authorization_initiated',
      details: {
        provider,
        returnUrl,
        state
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });

    return { url: authUrl, state };
  }

  async handleCallback(
    provider: OAuthProvider,
    code: string,
    state: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ user: any; tokens: any; isNewUser: boolean }> {
    try {
      // Validate state parameter
      const stateData = await this.validateOAuthState(state);
      if (stateData.provider !== provider) {
        throw new Error('Invalid OAuth state: provider mismatch');
      }

      // Exchange authorization code for tokens
      const oauthTokens = await this.exchangeCodeForTokens(provider, code);

      // Get user info from provider
      const userInfo = await this.getUserInfo(provider, oauthTokens.access_token);

      // Find or create user
      const { user, isNewUser } = await this.findOrCreateUser(provider, userInfo, context);

      // Link OAuth account to user
      await this.linkOAuthAccount(user.id, provider, userInfo, oauthTokens);

      // Generate our application tokens
      const accessToken = await this.tokenService.generateAccessToken(user);
      const refreshToken = await this.tokenService.generateRefreshToken(user);

      // Log successful OAuth login
      await this.auditService.logEvent({
        userId: user.id,
        action: 'oauth_login_success',
        details: {
          provider,
          isNewUser,
          oauthId: userInfo.id
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        },
        isNewUser
      };
    } catch (error) {
      // Log failed OAuth callback
      await this.auditService.logEvent({
        action: 'oauth_callback_failed',
        details: {
          provider,
          error: error.message
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'error'
      });

      throw error;
    }
  }

  async linkAccount(
    userId: string,
    provider: OAuthProvider,
    authCode: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {
    try {
      // Exchange code for tokens
      const oauthTokens = await this.exchangeCodeForTokens(provider, authCode);

      // Get user info
      const userInfo = await this.getUserInfo(provider, oauthTokens.access_token);

      // Check if this OAuth account is already linked to another user
      const existingLink = await this.getOAuthAccountByProviderAndId(provider, userInfo.id);
      if (existingLink && existingLink.user_id !== userId) {
        throw new Error('This account is already linked to another user');
      }

      // Link the account
      await this.linkOAuthAccount(userId, provider, userInfo, oauthTokens);

      // Log account linking
      await this.auditService.logEvent({
        userId,
        action: 'oauth_account_linked',
        details: {
          provider,
          oauthId: userInfo.id
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });
    } catch (error) {
      await this.auditService.logEvent({
        userId,
        action: 'oauth_account_linking_failed',
        details: {
          provider,
          error: error.message
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'error'
      });

      throw error;
    }
  }

  async unlinkAccount(
    userId: string,
    provider: OAuthProvider,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {
    try {
      // Check if user has a password or other OAuth accounts
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const oauthAccounts = await this.getUserOAuthAccounts(userId);
      const hasPassword = user.passwordHash !== null;
      const hasOtherOAuthAccounts = oauthAccounts.filter(acc => acc.provider !== provider).length > 0;

      if (!hasPassword && !hasOtherOAuthAccounts) {
        throw new Error('Cannot unlink the only authentication method. Please set a password first.');
      }

      // Remove OAuth account link
      await this.dbService.query(`
        DELETE FROM oauth_accounts 
        WHERE user_id = $1 AND provider = $2
      `, [userId, provider]);

      // Log account unlinking
      await this.auditService.logEvent({
        userId,
        action: 'oauth_account_unlinked',
        details: { provider },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });
    } catch (error) {
      await this.auditService.logEvent({
        userId,
        action: 'oauth_account_unlinking_failed',
        details: {
          provider,
          error: error.message
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'error'
      });

      throw error;
    }
  }

  async getUserOAuthAccounts(userId: string): Promise<any[]> {
    const result = await this.dbService.query(`
      SELECT provider, oauth_id, email, name, picture, created_at, updated_at
      FROM oauth_accounts
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows;
  }

  private async exchangeCodeForTokens(provider: OAuthProvider, code: string): Promise<OAuthTokenResponse> {
    const providerConfig = this.providerConfigs.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      client_secret: providerConfig.clientSecret,
      code,
      redirect_uri: providerConfig.redirectUri
    });

    // Provider-specific parameters
    if (provider === 'google' || provider === 'microsoft') {
      params.append('grant_type', 'authorization_code');
    }

    const response = await this.pinnedFetch(providerConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token exchange failed: ${error}`);
    }

    return await response.json();
  }

  private async getUserInfo(provider: OAuthProvider, accessToken: string): Promise<OAuthUserInfo> {
    const providerConfig = this.providerConfigs.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    const response = await this.pinnedFetch(providerConfig.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth user info fetch failed: ${error}`);
    }

    const rawUserInfo = await response.json();
    const mapping = providerConfig.userInfoMapping;

    // Map provider-specific fields to our standard format
    return {
      id: rawUserInfo[mapping.id],
      email: rawUserInfo[mapping.email],
      name: rawUserInfo[mapping.name],
      picture: mapping.picture ? rawUserInfo[mapping.picture] : undefined,
      verified: mapping.verified ? rawUserInfo[mapping.verified] : true
    };
  }

  private async findOrCreateUser(
    provider: OAuthProvider,
    userInfo: OAuthUserInfo,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ user: any; isNewUser: boolean }> {
    // First, check if this OAuth account already exists
    const existingOAuthAccount = await this.getOAuthAccountByProviderAndId(provider, userInfo.id);
    if (existingOAuthAccount) {
      const user = await this.userService.getUserById(existingOAuthAccount.user_id);
      if (user) {
        return { user, isNewUser: false };
      }
    }

    // Check if user exists by email
    const existingUser = await this.userService.getUserByEmail(userInfo.email);
    if (existingUser) {
      return { user: existingUser, isNewUser: false };
    }

    // Create new user
    const user = await this.userService.createUser({
      email: userInfo.email,
      password: null, // OAuth users don't have passwords initially
      firstName: userInfo.name?.split(' ')[0] || '',
      lastName: userInfo.name?.split(' ').slice(1).join(' ') || '',
      emailVerified: userInfo.verified,
      registrationSource: provider
    });

    return { user, isNewUser: true };
  }

  private async linkOAuthAccount(
    userId: string,
    provider: OAuthProvider,
    userInfo: OAuthUserInfo,
    tokens: OAuthTokenResponse
  ): Promise<void> {
    // Check if account is already linked
    const existing = await this.getOAuthAccountByProviderAndId(provider, userInfo.id);
    
    if (existing) {
      // Update existing account
      await this.dbService.query(`
        UPDATE oauth_accounts 
        SET email = $1, name = $2, picture = $3, access_token = $4, refresh_token = $5, 
            token_expires_at = $6, updated_at = NOW()
        WHERE user_id = $7 AND provider = $8
      `, [
        userInfo.email,
        userInfo.name,
        userInfo.picture,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        userId,
        provider
      ]);
    } else {
      // Create new account link
      await this.dbService.query(`
        INSERT INTO oauth_accounts (
          user_id, provider, oauth_id, email, name, picture, 
          access_token, refresh_token, token_expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        userId,
        provider,
        userInfo.id,
        userInfo.email,
        userInfo.name,
        userInfo.picture,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
      ]);
    }
  }

  private async getOAuthAccountByProviderAndId(provider: OAuthProvider, oauthId: string): Promise<any> {
    const result = await this.dbService.query(`
      SELECT * FROM oauth_accounts 
      WHERE provider = $1 AND oauth_id = $2
    `, [provider, oauthId]);

    return result.rows[0];
  }

  private async generateOAuthState(
    provider: OAuthProvider,
    returnUrl?: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<string> {
    const crypto = require('crypto');
    const state = crypto.randomBytes(32).toString('hex');
    
    const stateData: OAuthStateData = {
      provider,
      returnUrl,
      sessionId: crypto.randomUUID(),
      createdAt: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    };

    // Store state in Redis with 10-minute expiration
    await this.dbService.query(`
      INSERT INTO oauth_states (state, data, expires_at)
      VALUES ($1, $2, $3)
    `, [
      state,
      JSON.stringify(stateData),
      new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    ]);

    return state;
  }

  private async validateOAuthState(state: string): Promise<OAuthStateData> {
    const result = await this.dbService.query(`
      SELECT data FROM oauth_states 
      WHERE state = $1 AND expires_at > NOW()
    `, [state]);

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Delete used state
    await this.dbService.query(`
      DELETE FROM oauth_states WHERE state = $1
    `, [state]);

    return JSON.parse(result.rows[0].data);
  }

  /**
   * Get certificate pinning status and statistics
   */
  getCertificatePinningStatus(): {
    enabled: boolean;
    statistics: any;
    pinnedDomains: string[];
    } {
    return {
      enabled: this.certificatePinningManager.getConfig().enabled,
      statistics: this.certificatePinningManager.getStatistics(),
      pinnedDomains: this.certificatePinningManager.getConfig().pinnedDomains
    };
  }

  /**
   * Validate all OAuth provider certificate pins
   */
  async validateOAuthCertificatePins(): Promise<{ valid: boolean; results: Record<string, any> }> {
    return await this.certificatePinningManager.validateAllPins();
  }
}