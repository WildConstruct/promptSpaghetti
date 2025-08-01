/**
 * OpenID Connect API Routes - Epic 19.5
 * 
 * Implements OIDC 1.0 specification endpoints:
 * - Discovery endpoint (/.well-known/openid-configuration)
 * - UserInfo endpoint (/userinfo)
 * - JWKS endpoint (/jwks)
 * 
 * Task: T-1752989143998-191 - Implement OAuth 2.0/OpenID Connect
 * Part of Epic 19.5 - OAuth Implementation & Framework
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OpenIDConnectService } from '../services/OpenIDConnectService';
import { TokenService } from '../auth/services/TokenService';
import { OAuthService } from '../auth/services/OAuthService';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

interface UserInfoRequest extends FastifyRequest {
  headers: {
    authorization?: string;
  };


interface TokenIntrospectionRequest extends FastifyRequest {
  body: {
    token: string;
    token_type_hint?: 'access_token' | 'refresh_token';
    client_id?: string;
    client_secret?: string;
  };


export default async function openidConnectRoutes(fastify: FastifyInstance) {
  // Initialize OIDC service
  const tokenService = new TokenService(fastify.config.auth, fastify.redis, fastify.db);
  const oauthService = new OAuthService(fastify.config.auth, fastify.redis, fastify.db, fastify.audit);
  const oidcService = new OpenIDConnectService(
    tokenService,
    oauthService,
    fastify.audit,
    fastify.db,
    fastify.redis,
    {
      baseUrl: process.env.BASE_URL || 'http://localhost:8000',
      issuer: process.env.OIDC_ISSUER || process.env.JWT_ISSUER || 'promptscape-auth'
    }
  );

  /**
   * OpenID Connect Discovery Document
   * GET /.well-known/openid-configuration
   * 
   * Returns OIDC configuration metadata for discovery
   */
  fastify.get('/.well-known/openid-configuration', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const discoveryDocument = oidcService.generateDiscoveryDocument();

      await fastify.audit.logEvent({
        eventType: 'OIDC_DISCOVERY_ACCESSED',
        details: {
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
          timestamp: new Date()

        riskLevel: 'LOW',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['discovery_endpoint'],
          evidenceLevel: 'STANDARD'

      });

      return reply
        .header('Content-Type', 'application/json')
        .header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
        .status(200)
        .send(discoveryDocument);
 catch (error) {
      await fastify.audit.logEvent({
        eventType: 'OIDC_DISCOVERY_ERROR',
        details: {
          error: error.message,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip

        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'

      });

      return reply.status(500).send({
        error: 'server_error',
        error_description: 'Unable to generate discovery document'
      });

  });

  /**
   * OIDC UserInfo Endpoint
   * GET /userinfo
   * POST /userinfo (alternative method)
   * 
   * Returns user claims based on access token scopes
   */
  async function handleUserInfoRequest(request: UserInfoRequest, reply: FastifyReply) {
    try {
      // Extract access token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'invalid_token',
          error_description: 'Missing or invalid Authorization header'
        });


      const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Get user info claims
      const userInfo = await oidcService.getUserInfo(accessToken);

      await fastify.audit.logEvent({
        eventType: 'OIDC_USERINFO_SUCCESS',
        details: {
          userId: userInfo.sub,
          claimsCount: Object.keys(userInfo).length,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip

        riskLevel: 'LOW',
        compliance: {
          frameworks: ['OIDC1.0', 'GDPR'],
          requirements: ['userinfo_endpoint', 'data_access'],
          evidenceLevel: 'STANDARD'

      });

      return reply
        .header('Content-Type', 'application/json')
        .header('Cache-Control', 'no-store')
        .header('Pragma', 'no-cache')
        .status(200)
        .send(userInfo);
 catch (error) {
      await fastify.audit.logEvent({
        eventType: 'OIDC_USERINFO_ERROR',
        details: {
          error: error.message,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip

        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['security'],
          evidenceLevel: 'ENHANCED'

      });

      // Determine appropriate error response
      if (error.message.includes('Invalid token') || error.message.includes('expired')) {
        return reply.status(401).send({
          error: 'invalid_token',
          error_description: 'The access token is invalid or expired'
        });


      if (error.message.includes('insufficient_scope')) {
        return reply.status(403).send({
          error: 'insufficient_scope',
          error_description: 'The request requires higher privileges than provided'
        });


      return reply.status(500).send({
        error: 'server_error',
        error_description: 'Unable to process UserInfo request'
      });



  // Register both GET and POST handlers for UserInfo endpoint
  fastify.get('/userinfo', handleUserInfoRequest);
  fastify.post('/userinfo', handleUserInfoRequest);

  /**
   * JWKS (JSON Web Key Set) Endpoint
   * GET /jwks
   * 
   * Returns public keys for ID token verification
   */
  fastify.get('/jwks', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const jwks = await oidcService.generateJWKS();

      await fastify.audit.logEvent({
        eventType: 'OIDC_JWKS_SUCCESS',
        details: {
          keyCount: jwks.keys.length,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip

        riskLevel: 'LOW',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['jwks_endpoint'],
          evidenceLevel: 'STANDARD'

      });

      return reply
        .header('Content-Type', 'application/json')
        .header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
        .status(200)
        .send(jwks);
 catch (error) {
      await fastify.audit.logEvent({
        eventType: 'OIDC_JWKS_ERROR',
        details: {
          error: error.message,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip

        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['OIDC1.0'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'

      });

      return reply.status(500).send({
        error: 'server_error',
        error_description: 'Unable to generate JWKS'
      });

  });

  /**
   * Token Introspection Endpoint (RFC 7662)
   * POST /introspect
   * 
   * Allows clients to determine the active state and metadata of a token
   */
  fastify.post('/introspect', async (request: TokenIntrospectionRequest, reply: FastifyReply) => {
    try {
      const { token, token_type_hint } = request.body;

      if (!token) {
        return reply.status(400).send({
          error: 'invalid_request',
          error_description: 'Token parameter is required'
        });


      // Verify client authentication for introspection
      // (Implementation would depend on client authentication method)
      
      try {
        // Attempt to verify the token
        const tokenPayload = await tokenService.verifyAccessToken(token);
        
        const introspectionResponse = {
          active: true,
          client_id: tokenPayload.aud,
          username: tokenPayload.email,
          scope: (tokenPayload as any).scopes ? (tokenPayload as any).scopes.join(' ') : 'openid',
          token_type: 'Bearer',
          exp: tokenPayload.exp,
          iat: tokenPayload.iat,
          sub: tokenPayload.sub,
          aud: tokenPayload.aud,
          iss: tokenPayload.iss
        };

        await fastify.audit.logEvent({
          eventType: 'OIDC_TOKEN_INTROSPECTION_SUCCESS',
          details: {
            tokenActive: true,
            clientId: tokenPayload.aud,
            tokenType: token_type_hint || 'access_token'

          riskLevel: 'LOW',
          compliance: {
            frameworks: ['RFC7662', 'OIDC1.0'],
            requirements: ['token_introspection'],
            evidenceLevel: 'STANDARD'

        });

        return reply.status(200).send(introspectionResponse);
 catch (tokenError) {
        // Token is invalid or expired
        const introspectionResponse = {
          active: false
        };

        await fastify.audit.logEvent({
          eventType: 'OIDC_TOKEN_INTROSPECTION_INACTIVE',
          details: {
            tokenActive: false,
            tokenError: tokenError.message,
            tokenType: token_type_hint || 'access_token'

          riskLevel: 'LOW',
          compliance: {
            frameworks: ['RFC7662', 'OIDC1.0'],
            requirements: ['token_introspection'],
            evidenceLevel: 'STANDARD'

        });

        return reply.status(200).send(introspectionResponse);

 catch (error) {
      await fastify.audit.logEvent({
        eventType: 'OIDC_TOKEN_INTROSPECTION_ERROR',
        details: {
          error: error.message,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip

        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['RFC7662'],
          requirements: ['error_handling'],
          evidenceLevel: 'ENHANCED'

      });

      return reply.status(500).send({
        error: 'server_error',
        error_description: 'Unable to process introspection request'
      });

  });

  /**
   * Health Check for OIDC Service
   * GET /health
   * 
   * Verifies OIDC service health and key availability
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const isHealthy = await oidcService.healthCheck();
      
      if (isHealthy) {
        return reply.status(200).send({
          status: 'healthy',
          service: 'openid-connect',
          timestamp: new Date().toISOString(),
          checks: {
            keys: 'ok',
            jwt_signing: 'ok',
            dependencies: 'ok'

        });
 else {
        return reply.status(503).send({
          status: 'unhealthy',
          service: 'openid-connect',
          timestamp: new Date().toISOString(),
          error: 'OIDC service health check failed'
        });

 catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        service: 'openid-connect',
        timestamp: new Date().toISOString(),
        error: error.message
      });

  });

  // Error handler for OIDC routes
  fastify.setErrorHandler(async (error, request, reply) => {
    await fastify.audit.logEvent({
      eventType: 'OIDC_ROUTE_ERROR',
      details: {
        error: error.message,
        stack: error.stack,
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip

      riskLevel: 'HIGH',
      compliance: {
        frameworks: ['OIDC1.0'],
        requirements: ['error_handling'],
        evidenceLevel: 'ENHANCED'

    });

    // Return standardized OIDC error response
    return reply.status(500).send({
      error: 'server_error',
      error_description: 'An internal server error occurred'
    });
  });
