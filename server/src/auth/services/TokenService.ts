// Epic 11 JWT Token Service
// RS256 JWT token generation and verification with Redis-based revocation

import { readFileSync } from 'fs';
import { join } from 'path';
import * as jwt from 'jsonwebtoken';
import { ITokenService, JWTPayload, User, AuthConfig } from '../types';
import { RedisService } from '../database/RedisService';
import { DatabaseService } from '../database/DatabaseService';
import { JWT_CONFIG } from '../config';

export class TokenService implements ITokenService {
  private config: AuthConfig;
  private redis: RedisService;
  private db: DatabaseService;
  private privateKey!: string;
  private publicKey!: string;

  constructor(config: AuthConfig, redis: RedisService, db: DatabaseService) {
    this.config = config;
    this.redis = redis;
    this.db = db;
    this.loadKeys();
  }

  async generateAccessToken(user: User, scopes?: string[]): Promise<string> {

    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles: await this.getUserRoles(user.id),
      permissions: await this.getUserPermissions(user.id),
      organizationId: await this.getUserPrimaryOrganization(user.id),
      teamIds: await this.getUserTeams(user.id),
      iss: this.config.jwtIssuer,
      aud: this.config.jwtAudience
    };

    // Add scopes if provided (for API tokens)
    if (scopes && scopes.length > 0) {
      (payload as any).scopes = scopes;
    }

    const token = jwt.sign(payload, this.privateKey, {
      algorithm: JWT_CONFIG.algorithm,
      expiresIn: JWT_CONFIG.accessTokenExpiry
    } as jwt.SignOptions);

    return token;
  }

  async generateApiToken(
    user: User,
    scopes: string[],
    expiresIn: string = '90d',
    name?: string
  ): Promise<{ token: string; tokenId: string }> {

    const tokenId = require('crypto').randomUUID();
    
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'api',
      scopes,
      tokenId,
      name,
      iss: this.config.jwtIssuer,
      aud: this.config.jwtAudience
    };

    const token = jwt.sign(payload, this.privateKey, {
      algorithm: JWT_CONFIG.algorithm,
      expiresIn
    } as jwt.SignOptions);

    // Store API token in database for tracking
    await this.storeApiToken(user.id, tokenId, token, scopes, name, expiresIn);

    return { token, tokenId };
  }

  async generateRefreshToken(user: User): Promise<string> {

    const payload = {
      sub: user.id,
      type: 'refresh',
      iss: this.config.jwtIssuer,
      aud: this.config.jwtAudience
    };

    const token = jwt.sign(payload, this.privateKey, {
      algorithm: JWT_CONFIG.algorithm,
      expiresIn: JWT_CONFIG.refreshTokenExpiry
    } as jwt.SignOptions);

    // Store refresh token in database for tracking
    await this.storeRefreshToken(user.id, token);

    return token;
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {

    try {
      // Check if token is revoked
      const isRevoked = await this.isTokenRevoked(token);
      if (isRevoked) {
        throw new Error('Token has been revoked');
      }

      const payload = jwt.verify(token, this.publicKey, {
        algorithms: [JWT_CONFIG.algorithm],
        issuer: this.config.jwtIssuer,
        audience: this.config.jwtAudience
      }) as JWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid token: ${error.message}`);
      }
      throw error;
    }
  }

  async verifyRefreshToken(token: string): Promise<JWTPayload> {

    try {
      // Verify JWT signature and claims
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: [JWT_CONFIG.algorithm],
        issuer: this.config.jwtIssuer,
        audience: this.config.jwtAudience
      }) as any;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists in database
      const exists = await this.validateRefreshToken(payload.sub, token);
      if (!exists) {
        throw new Error('Refresh token not found or expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid refresh token: ${error.message}`);
      }
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {

    // Verify refresh token
    const payload = await this.verifyRefreshToken(refreshToken);
    
    // Get user data
    const user = await this.db.query('SELECT * FROM users WHERE id = $1', [payload.sub]);
    if (user.rows.length === 0) {
      throw new Error('User not found');
    }

    const userData = user.rows[0];
    
    // Generate new access token
    const newAccessToken = await this.generateAccessToken({
      id: userData.id,
      email: userData.email,
      emailVerified: userData.email_verified,
      hashedPassword: userData.hashed_password,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      lastLoginAt: userData.last_login_at,
      failedLoginAttempts: userData.failed_login_attempts,
      accountLocked: userData.account_locked,
      lockedUntil: userData.locked_until,
      passwordResetToken: userData.password_reset_token,
      passwordResetExpires: userData.password_reset_expires,
      emailVerificationToken: userData.email_verification_token,
      emailVerificationExpires: userData.email_verification_expires,
      status: userData.status,
      deletedAt: userData.deleted_at
    });

    // Generate new refresh token (rotation for security)
    await this.revokeRefreshToken(payload.sub, refreshToken);
    const newRefreshToken = await this.generateRefreshToken(userData);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async revokeToken(token: string): Promise<void> {

    try {
      // Decode token to get expiry time (don't verify - we want to revoke even invalid tokens)
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return; // Invalid token format, nothing to revoke
      }

      // Store in Redis with TTL until token expires
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const ttl = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      
      if (ttl > 0) {
        await this.redis.setex(`revoked_token:${token}`, ttl, '1');
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      // Don't throw - best effort revocation
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {

    // Remove all refresh tokens for user
    await this.db.query(`
      UPDATE user_sessions 
      SET revoked = true, revoked_at = NOW() 
      WHERE user_id = $1 AND revoked = false
    `, [userId]);

    // Revoke all API tokens for user
    await this.db.query(`
      UPDATE api_tokens 
      SET revoked = true, revoked_at = NOW() 
      WHERE user_id = $1 AND revoked = false
    `, [userId]);

    // Add user to blacklist in Redis (expires in 24 hours - longer than our longest token)
    await this.redis.setex(`user_tokens_revoked:${userId}`, 24 * 60 * 60, Date.now().toString());
  }

  async revokeSessionTokens(sessionId: string): Promise<void> {

    // Revoke session tokens
    await this.db.query(`
      UPDATE user_sessions 
      SET revoked = true, revoked_at = NOW() 
      WHERE id = $1
    `, [sessionId]);
  }

  async revokeApiToken(tokenId: string): Promise<void> {

    await this.db.query(`
      UPDATE api_tokens 
      SET revoked = true, revoked_at = NOW() 
      WHERE id = $1
    `, [tokenId]);
  }

  async getUserApiTokens(userId: string): Promise<any[]> {

    const result = await this.db.query(`
      SELECT id, name, scopes, expires_at, created_at, last_used_at, revoked
      FROM api_tokens
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      scopes: row.scopes,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
      revoked: row.revoked
    }));
  }

  async validateApiToken(token: string): Promise<boolean> {

    try {
      const payload = await this.verifyAccessToken(token);
      
      if ((payload as any).type !== 'api') {
        return false;
      }

      // Check if API token exists and is not revoked
      const result = await this.db.query(`
        SELECT id FROM api_tokens 
        WHERE id = $1 AND revoked = false AND expires_at > NOW()
      `, [(payload as any).tokenId]);

      if (result.rows.length === 0) {
        return false;
      }

      // Update last used timestamp
      await this.db.query(`
        UPDATE api_tokens 
        SET last_used_at = NOW() 
        WHERE id = $1
      `, [(payload as any).tokenId]);

      return true;
    } catch (error) {
      return false;
    }
  }

  async hasScope(token: string, requiredScope: string): Promise<boolean> {

    try {
      const payload = await this.verifyAccessToken(token);
      const scopes = (payload as any).scopes || [];
      
      // Check for exact scope match or wildcard
      return scopes.includes(requiredScope) || scopes.includes('*');
    } catch (error) {
      return false;
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {

    try {
      // Check if specific token is revoked
      const isRevoked = await this.redis.exists(`revoked_token:${token}`);
      if (isRevoked) {
        return true;
      }

      // Check if all user tokens are revoked
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.sub && decoded.iat) {
        const userRevokedTime = await this.redis.get(`user_tokens_revoked:${decoded.sub}`);
        if (userRevokedTime) {
          const revokedTimestamp = parseInt(userRevokedTime);
          const tokenIssuedTime = decoded.iat * 1000; // Convert to milliseconds
          return tokenIssuedTime < revokedTimestamp;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking token revocation:', error);
      return false; // Assume not revoked if we can't check
    }
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {

    const decoded = jwt.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    await this.db.query(`
      INSERT INTO user_sessions (user_id, refresh_token, expires_at)
      VALUES ($1, $2, $3)
    `, [userId, token, expiresAt]);
  }

  private async validateRefreshToken(userId: string, token: string): Promise<boolean> {

    const result = await this.db.query(`
      SELECT id FROM user_sessions 
      WHERE user_id = $1 AND refresh_token = $2 AND expires_at > NOW() AND revoked = false
    `, [userId, token]);

    return result.rows.length > 0;
  }

  private async revokeRefreshToken(userId: string, token: string): Promise<void> {

    await this.db.query(`
      UPDATE user_sessions 
      SET revoked = true, revoked_at = NOW() 
      WHERE user_id = $1 AND refresh_token = $2
    `, [userId, token]);
  }

  private async storeApiToken(
    userId: string,
    tokenId: string,
    token: string,
    scopes: string[],
    name?: string,
    expiresIn?: string
  ): Promise<void> {

    const decoded = jwt.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    await this.db.query(`
      INSERT INTO api_tokens (id, user_id, name, scopes, expires_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [tokenId, userId, name, JSON.stringify(scopes), expiresAt]);
  }

  private async getUserRoles(userId: string): Promise<string[]> {

    const result = await this.db.query(`
      SELECT r.name 
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `, [userId]);

    return result.rows.map(row => row.name);
  }

  private async getUserPermissions(userId: string): Promise<string[]> {

    const result = await this.db.query(`
      SELECT DISTINCT CONCAT(p.resource, ':', p.action) as permission
      FROM permissions p
      INNER JOIN roles r ON p.role_id = r.id
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `, [userId]);

    return result.rows.map(row => row.permission);
  }

  private async getUserPrimaryOrganization(userId: string): Promise<string | undefined> {

    const result = await this.db.query(`
      SELECT tm.team_id, t.organization_id
      FROM team_members tm
      INNER JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = $1
      ORDER BY tm.joined_at ASC
      LIMIT 1
    `, [userId]);

    return result.rows.length > 0 ? result.rows[0].organization_id : undefined;
  }

  private async getUserTeams(userId: string): Promise<string[]> {

    const result = await this.db.query(`
      SELECT team_id FROM team_members WHERE user_id = $1
    `, [userId]);

    return result.rows.map(row => row.team_id);
  }

  private loadKeys(): void {
    try {
      // In production, these would be loaded from secure storage (AWS Secrets Manager, etc.)
      const keyPath = process.env.JWT_KEYS_PATH || './keys';
      
      if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
        // Load from environment variables (base64 encoded)
        this.privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8');
        this.publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf8');
      } else {
        // Load from files (development)
        this.privateKey = readFileSync(join(keyPath, 'private.pem'), 'utf8');
        this.publicKey = readFileSync(join(keyPath, 'public.pem'), 'utf8');
      }
    } catch (error) {
      console.error('Failed to load JWT keys:', error);
      throw new Error('JWT keys not configured properly. Please set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY environment variables or place key files in the keys directory.');
    }
  }

  // Utility method to generate RS256 key pair (for development setup)
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const crypto = require('crypto');
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
  }
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { privateKey, publicKey };
  }
}