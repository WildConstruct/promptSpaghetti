/**
 * OpenID Connect Service - Epic 19.5
 * 
 * Implements OpenID Connect 1.0 specification on top of existing OAuth 2.0 infrastructure.
 * Provides ID tokens, UserInfo endpoint, Discovery document, and JWKS endpoint for 
 * full OIDC compliance while maintaining enterprise security standards.
 * 
 * Task: T-1752989143998-191 - Implement OAuth 2.0/OpenID Connect
 * Part of Epic 19.5 - OAuth Implementation & Framework
 */

import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { TokenService } from '../auth/services/TokenService';
import { OAuthService } from '../auth/services/OAuthService';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

// OpenID Connect Types and Interfaces
}
}
export interface OpenIDConnectConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  registration_endpoint?: string;
  scopes_supported: string[];
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  acr_values_supported?: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  id_token_encryption_alg_values_supported?: string[];
  userinfo_signing_alg_values_supported: string[];
  request_object_signing_alg_values_supported?: string[];
  token_endpoint_auth_methods_supported: string[];
  display_values_supported?: string[];
  claim_types_supported?: string[];
  claims_supported: string[];
  service_documentation?: string;
  claims_locales_supported?: string[];
  ui_locales_supported?: string[];
  claims_parameter_supported: boolean;
  request_parameter_supported: boolean;
  request_uri_parameter_supported: boolean;
  require_request_uri_registration: boolean;
  op_policy_uri?: string;
  op_tos_uri?: string;
  code_challenge_methods_supported: string[];
}
}
}

}
}
export interface IDTokenClaims {
  iss: string;           // Issuer identifier
  sub: string;           // Subject identifier  
  aud: string | string[]; // Audience
  exp: number;           // Expiration time
  iat: number;           // Issued at time
  auth_time?: number;    // Authentication time
  nonce?: string;        // Nonce value
  at_hash?: string;      // Access token hash
  c_hash?: string;       // Authorization code hash
  acr?: string;          // Authentication context class reference
  amr?: string[];        // Authentication methods references
  azp?: string;          // Authorized party
  // Standard claims
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: AddressClaim;
  updated_at?: number;
}
}
}

}
}
export interface AddressClaim {
  formatted?: string;
  street_address?: string;
  locality?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}
}
}

}
}
export interface UserInfoClaims {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: AddressClaim;
  updated_at?: number;
}
}
}

}
}
export interface JWKSKey {
  kty: string;           // Key type
  use: string;           // Public key use
  key_ops?: string[];    // Key operations
  alg: string;           // Algorithm
  kid: string;           // Key ID
  x5u?: string;          // X.509 URL
  x5c?: string[];        // X.509 certificate chain
  x5t?: string;          // X.509 thumbprint
  x5t_S256?: string;     // X.509 thumbprint (SHA-256)
  n: string;             // RSA modulus
  e: string;             // RSA exponent
}
}
}

}
}
export interface JWKSDocument {
  keys: JWKSKey[];
}
}
}

}
}
export interface OIDCAuthenticationContext {
  userId: string;
  sessionId: string;
  authTime: Date;
  acr?: string;
  amr?: string[];
  clientId: string;
  scopes: string[];
  nonce?: string;
  maxAge?: number;
}
}
}

/**
 * OpenID Connect Service
 * 
 * Implements OpenID Connect 1.0 specification features:
 * - Discovery document generation
 * - ID token creation and validation
 * - UserInfo endpoint functionality
 * - JWKS endpoint for public key distribution
 * - OIDC-compliant claim processing
 */
export class OpenIDConnectService {
  private tokenService: TokenService;
  private oauthService: OAuthService;
  private auditService: AuditService;
  private db: DatabaseService;
  private redis: RedisService;
  private baseUrl: string;
  private issuer: string;
  private privateKey?: string;
  private publicKey?: string;
  private keyId: string;

  constructor(
    tokenService: TokenService,
    oauthService: OAuthService,
    auditService: AuditService,
    db: DatabaseService,
    redis: RedisService,
    config: { baseUrl: string; issuer: string }
  ) {
    this.tokenService = tokenService;
    this.oauthService = oauthService;
    this.auditService = auditService;
    this.db = db;
    this.redis = redis;
    this.baseUrl = config.baseUrl;
    this.issuer = config.issuer;
    this.keyId = 'oidc-signing-key-1';
    this.loadKeys();
  }

  /**
   * Generate OpenID Connect Discovery Document
   * Implements /.well-known/openid-configuration endpoint
   */
  generateDiscoveryDocument(): OpenIDConnectConfiguration {
    return {
      issuer: this.issuer,
      authorization_endpoint: `${this.baseUrl}/auth/oauth/authorize`,
      token_endpoint: `${this.baseUrl}/auth/oauth/token`,
      userinfo_endpoint: `${this.baseUrl}/auth/oidc/userinfo`,
      jwks_uri: `${this.baseUrl}/auth/oidc/jwks`,
      registration_endpoint: `${this.baseUrl}/auth/oidc/register`,
      scopes_supported: [
        'openid',
        'profile',
        'email',
        'address',
        'phone',
        'offline_access'
      ],
      response_types_supported: [
        'code',
        'id_token',
        'code id_token',
        'token',
        'token id_token',
        'code token',
        'code token id_token'
      ],
      response_modes_supported: [
        'query',
        'fragment',
        'form_post'
      ],
      grant_types_supported: [
        'authorization_code',
        'refresh_token',
        'client_credentials'
      ],
      acr_values_supported: [
        'urn:mace:incommon:iap:silver',
        'urn:mace:incommon:iap:bronze'
      ],
      subject_types_supported: ['public', 'pairwise'],
      id_token_signing_alg_values_supported: ['RS256', 'HS256'],
      id_token_encryption_alg_values_supported: ['RSA-OAEP', 'A256KW'],
      userinfo_signing_alg_values_supported: ['RS256', 'HS256'],
      request_object_signing_alg_values_supported: ['RS256', 'HS256'],
      token_endpoint_auth_methods_supported: [
        'client_secret_basic',
        'client_secret_post',
        'private_key_jwt',
        'client_secret_jwt',
        'none'
      ],
      display_values_supported: ['page', 'popup', 'touch', 'wap'],
      claim_types_supported: ['normal', 'aggregated', 'distributed'],
      claims_supported: [
        'iss',
        'sub',
        'aud',
        'exp',
        'iat',
        'auth_time',
        'nonce',
        'at_hash',
        'c_hash',
        'acr',
        'amr',
        'azp',
        'name',
        'given_name',
        'family_name',
        'middle_name',
        'nickname',
        'preferred_username',
        'profile',
        'picture',
        'website',
        'email',
        'email_verified',
        'gender',
        'birthdate',
        'zoneinfo',
        'locale',
        'phone_number',
        'phone_number_verified',
        'address',
        'updated_at'
      ],
      service_documentation: `${this.baseUrl}/docs/oidc`,
      claims_locales_supported: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
      ui_locales_supported: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
      claims_parameter_supported: true,
      request_parameter_supported: true,
      request_uri_parameter_supported: true,
      require_request_uri_registration: false,
      op_policy_uri: `${this.baseUrl}/policy`,
      op_tos_uri: `${this.baseUrl}/terms`,
      code_challenge_methods_supported: ['S256', 'plain']
    };
  }

  /**
   * Generate ID Token for OpenID Connect
   * Creates JWT ID token with OIDC-compliant claims
   */
  async generateIDToken(
    authContext: OIDCAuthenticationContext,
    accessToken?: string
  ): Promise<string> {

    try {
      // Get user information
      const user = await this.getUserById(authContext.userId);
      if (!user) {
        throw new Error('User not found for ID token generation');
      }

      // Build ID token claims
      const now = Math.floor(Date.now() / 1000);
      const authTime = Math.floor(authContext.authTime.getTime() / 1000);

      const claims: IDTokenClaims = {
        iss: this.issuer,
        sub: this.generateSubjectIdentifier(authContext.userId, authContext.clientId),
        aud: authContext.clientId,
        exp: now + 3600, // 1 hour
        iat: now,
        auth_time: authTime
      };

      // Add nonce if provided (prevents replay attacks)
      if (authContext.nonce) {
        claims.nonce = authContext.nonce;
      }

      // Add access token hash if access token provided
      if (accessToken) {
        claims.at_hash = this.generateTokenHash(accessToken);
      }

      // Add ACR (Authentication Context Class Reference)
      if (authContext.acr) {
        claims.acr = authContext.acr;
      }

      // Add AMR (Authentication Methods References)
      if (authContext.amr && authContext.amr.length > 0) {
        claims.amr = authContext.amr;
      }

      // Add standard claims based on requested scopes
      await this.addStandardClaims(claims, user, authContext.scopes);

      // Sign ID token
      const idToken = jwt.sign(claims, this.privateKey!, {
        algorithm: 'RS256',
        keyid: this.keyId
      });

      // Log ID token generation
      await this.auditService.logEvent({
        eventType: 'OIDC_ID_TOKEN_GENERATED',
        details: {
          userId: authContext.userId,
          clientId: authContext.clientId,
          scopes: authContext.scopes,
          hasNonce: !!authContext.nonce,
          tokenLength: idToken.length
  }
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['id_token_generation'],
          evidenceLevel: 'STANDARD'
        }
      });

      return idToken;

    } catch (error) {
      await this.auditService.logEvent({
        eventType: 'OIDC_ID_TOKEN_GENERATION_FAILED',
        details: {
          userId: authContext.userId,
          clientId: authContext.clientId,
          error: error.message
  }
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'
        }
      });

      throw new Error(`ID token generation failed: ${error.message}`);
    }
  }

  /**
   * Validate ID Token
   * Verifies JWT ID token according to OIDC specification
   */
  async validateIDToken(idToken: string, clientId: string, nonce?: string): Promise<IDTokenClaims> {

    try {
      // Verify JWT signature and standard claims
      const decoded = jwt.verify(idToken, this.publicKey!, {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: clientId
      }) as IDTokenClaims;

      // Verify nonce if provided
      if (nonce && decoded.nonce !== nonce) {
        throw new Error('Invalid nonce in ID token');
      }

      // Verify auth_time if max_age was specified
      const now = Math.floor(Date.now() / 1000);
      if (decoded.auth_time && (now - decoded.auth_time) > 3600) {
        throw new Error('ID token auth_time too old');
      }

      await this.auditService.logEvent({
        eventType: 'OIDC_ID_TOKEN_VALIDATED',
        details: {
          clientId,
          sub: decoded.sub,
          hasNonce: !!decoded.nonce,
          authTime: decoded.auth_time
  }
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['id_token_validation'],
          evidenceLevel: 'STANDARD'
        }
      });

      return decoded;

    } catch (error) {
      await this.auditService.logEvent({
        eventType: 'OIDC_ID_TOKEN_VALIDATION_FAILED',
        details: {
          clientId,
          error: error.message,
          hasNonce: !!nonce
  }
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['security'],
          evidenceLevel: 'ENHANCED'
        }
      });

      throw new Error(`ID token validation failed: ${error.message}`);
    }
  }

  /**
   * Get UserInfo Claims
   * Implements OIDC UserInfo endpoint functionality
   */
  async getUserInfo(accessToken: string, requestedScopes?: string[]): Promise<UserInfoClaims> {

    try {
      // Validate access token
      const tokenPayload = await this.tokenService.verifyAccessToken(accessToken);
      
      // Get user data
      const user = await this.getUserById(tokenPayload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      // Build UserInfo claims based on scopes
      const scopes = requestedScopes || tokenPayload.scopes || [];
      const userInfo: UserInfoClaims = {
        sub: this.generateSubjectIdentifier(tokenPayload.sub, tokenPayload.aud as string)
      };

      // Add claims based on scopes
      await this.addStandardClaims(userInfo, user, scopes);

      await this.auditService.logEvent({
        eventType: 'OIDC_USERINFO_ACCESSED',
        details: {
          userId: tokenPayload.sub,
          clientId: tokenPayload.aud,
          scopes,
          claimsReturned: Object.keys(userInfo).length
  }
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['OIDC1.0', 'GDPR'],
          requirements: ['userinfo_endpoint', 'data_access'],
          evidenceLevel: 'STANDARD'
        }
      });

      return userInfo;

    } catch (error) {
      await this.auditService.logEvent({
        eventType: 'OIDC_USERINFO_ACCESS_FAILED',
        details: {
          error: error.message,
          tokenProvided: !!accessToken
  }
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['security'],
          evidenceLevel: 'ENHANCED'
        }
      });

      throw new Error(`UserInfo access failed: ${error.message}`);
    }
  }

  /**
   * Generate JWKS Document
   * Provides public keys for ID token verification
   */
  async generateJWKS(): Promise<JWKSDocument> {

    try {
      if (!this.publicKey) {
        throw new Error('Public key not available for JWKS generation');
      }

      // Extract RSA components from public key
      const publicKeyObject = crypto.createPublicKey(this.publicKey);
      const keyDetails = publicKeyObject.asymmetricKeyDetails as any;
      
      // Create JWK from RSA public key
      const jwk: JWKSKey = {
        kty: 'RSA',
        use: 'sig',
        key_ops: ['verify'],
        alg: 'RS256',
        kid: this.keyId,
        n: keyDetails.mgf.toString('base64url'),
        e: keyDetails.saltLength.toString('base64url')
      };

      const jwks: JWKSDocument = {
        keys: [jwk]
      };

      await this.auditService.logEvent({
        eventType: 'OIDC_JWKS_ACCESSED',
        details: {
          keyId: this.keyId,
          algorithm: 'RS256',
          keyCount: jwks.keys.length
  }
        riskLevel: 'LOW',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['jwks_endpoint'],
          evidenceLevel: 'STANDARD'
        }
      });

      return jwks;

    } catch (error) {
      await this.auditService.logEvent({
        eventType: 'OIDC_JWKS_GENERATION_FAILED',
        details: {
          error: error.message,
          keyId: this.keyId
  }
        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'
        }
      });

      throw new Error(`JWKS generation failed: ${error.message}`);
    }
  }

  /**
   * Generate Subject Identifier
   * Creates pairwise or public subject identifiers
   */
  private generateSubjectIdentifier(userId: string, clientId: string, type: 'public' | 'pairwise' = 'public'): string {
    if (type === 'pairwise') {
      // Generate pairwise subject identifier
      const hash = crypto.createHash('sha256');
      hash.update(`${userId}:${clientId}:${this.issuer}`);
      return hash.digest('hex');
    }
    
    // Return public subject identifier (same across all clients)
    return userId;
  }

  /**
   * Generate Token Hash
   * Creates at_hash for ID tokens according to OIDC spec
   */
  private generateTokenHash(token: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(token);
    const digest = hash.digest();
    // Use left-most half of hash
    const leftHalf = digest.slice(0, digest.length / 2);
    return leftHalf.toString('base64url');
  }

  /**
   * Add Standard Claims to Token
   * Maps user data to OIDC standard claims based on scopes
   */
  private async addStandardClaims(
    claims: IDTokenClaims | UserInfoClaims,
    user: unknown,
    scopes: string[]
  ): Promise<void> {

    // Profile scope claims
    if (scopes.includes('profile')) {
      if (user.name) claims.name = user.name;
      if (user.given_name) claims.given_name = user.given_name;
      if (user.family_name) claims.family_name = user.family_name;
      if (user.middle_name) claims.middle_name = user.middle_name;
      if (user.nickname) claims.nickname = user.nickname;
      if (user.preferred_username) claims.preferred_username = user.preferred_username;
      if (user.profile) claims.profile = user.profile;
      if (user.picture) claims.picture = user.picture;
      if (user.website) claims.website = user.website;
      if (user.gender) claims.gender = user.gender;
      if (user.birthdate) claims.birthdate = user.birthdate;
      if (user.zoneinfo) claims.zoneinfo = user.zoneinfo;
      if (user.locale) claims.locale = user.locale;
      if (user.updated_at) claims.updated_at = Math.floor(user.updated_at.getTime() / 1000);
    }

    // Email scope claims
    if (scopes.includes('email')) {
      if (user.email) {
        claims.email = user.email;
        claims.email_verified = user.email_verified || false;
      }
    }

    // Address scope claims
    if (scopes.includes('address') && user.address) {
      claims.address = {
        formatted: user.address.formatted,
        street_address: user.address.street_address,
        locality: user.address.locality,
        region: user.address.region,
        postal_code: user.address.postal_code,
        country: user.address.country
      };
    }

    // Phone scope claims
    if (scopes.includes('phone')) {
      if (user.phone_number) {
        claims.phone_number = user.phone_number;
        claims.phone_number_verified = user.phone_number_verified || false;
      }
    }
  }

  /**
   * Get User by ID
   * Retrieves user data for claim generation
   */
  private async getUserById(userId: string): Promise<unknown> {

    try {
      const result = await this.db.query(`
        SELECT 
          id,
          email,
          email_verified,
          name,
          given_name,
          family_name,
          middle_name,
          nickname,
          preferred_username,
          profile,
          picture,
          website,
          gender,
          birthdate,
          zoneinfo,
          locale,
          phone_number,
          phone_number_verified,
          address,
          updated_at
        FROM users 
        WHERE id = $1 AND deleted_at IS NULL
      `, [userId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      return null;
    }
  }

  /**
   * Load Signing Keys
   * Loads RSA key pair for ID token signing
   */
  private loadKeys(): void {
    try {
      // Use same keys as TokenService for consistency
      if (process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY) {
        this.privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8');
        this.publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf8');
      } else {
        const keyPath = process.env.JWT_KEYS_PATH || './keys';
        const fs = require('fs');
        const path = require('path');
        
        this.privateKey = fs.readFileSync(path.join(keyPath, 'private.pem'), 'utf8');
        this.publicKey = fs.readFileSync(path.join(keyPath, 'public.pem'), 'utf8');
      }
    } catch (error) {
      console.error('Failed to load OIDC signing keys:', error);
      throw new Error('OIDC signing keys not configured properly');
    }
  }

  /**
   * Health Check
   * Verifies OIDC service functionality
   */
  async healthCheck(): Promise<boolean> {

    try {
      // Verify keys are loaded
      if (!this.privateKey || !this.publicKey) {
        return false;
      }

      // Test JWT signing/verification
      const testPayload = { sub: 'test', aud: 'test', exp: Math.floor(Date.now() / 1000) + 60 };
      const testToken = jwt.sign(testPayload, this.privateKey, { algorithm: 'RS256', keyid: this.keyId });
      jwt.verify(testToken, this.publicKey, { algorithms: ['RS256'] });

      return true;
    } catch (error) {
      console.error('OIDC health check failed:', error);
      return false;
    }
  }
}

export default OpenIDConnectService;