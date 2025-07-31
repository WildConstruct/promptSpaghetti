# Third-Party Integration Security Guidelines

**Document Version**: 1.0  
**Last Updated**: 2025-07-22  
**Epic**: 19 - Security & Compliance Framework  
**Target Audience**: Developers, Security Engineers, DevOps

---

## 1. Overview

This document provides practical guidelines for securely implementing third-party integrations within the PromptScape system. These guidelines ensure that external services are integrated safely while maintaining system security and compliance standards.

---

## 2. Pre-Integration Security Assessment

### 2.1 Vendor Security Evaluation

#### 2.1.1 Security Questionnaire

**REQUIREMENT**: Before integrating any third-party service, complete this security assessment:

```typescript
interface VendorSecurityAssessment {
  vendor: {
    name: string;
    website: string;
    primaryContact: string;
    supportContact: string;
  };

  securityCertifications: {
    soc2Type2: boolean;
    iso27001: boolean;
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    pciCompliant: boolean;
  };

  dataHandling: {
    dataTypes: string[]; // What data will be shared
    dataLocation: string[]; // Where data will be stored
    dataRetention: string; // How long data is retained
    dataEncryption: {
      inTransit: boolean;
      atRest: boolean;
      keyManagement: string;
    };
  };

  technicalSecurity: {
    apiAuthentication: 'oauth' | 'api-key' | 'jwt' | 'basic';
    rateLimiting: boolean;
    webhookSecurity: boolean;
    tlsVersion: string; // Minimum TLS 1.2
    ipWhitelisting: boolean;
  };
}
```

#### 2.1.2 Risk Classification

**REQUIREMENT**: Classify each integration by risk level:

| Risk Level   | Data Access        | Examples                   | Approval Required |
| ------------ | ------------------ | -------------------------- | ----------------- |
| **LOW**      | Public data only   | Weather API, Public maps   | Team Lead         |
| **MEDIUM**   | Internal data      | Analytics, Monitoring      | Security Team     |
| **HIGH**     | User data          | Authentication, Payment    | Security + Legal  |
| **CRITICAL** | Sensitive/PII data | Healthcare data, Financial | C-Suite + Legal   |

---

## 3. OAuth 2.0 Integration Guidelines

### 3.1 Supported OAuth Providers

#### 3.1.1 Pre-Approved Providers

**APPROVED**: These providers have been security-reviewed:

1. **Google OAuth 2.0**

   ```typescript
   const googleOAuthConfig = {
     provider: 'google',
     authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
     tokenURL: 'https://oauth2.googleapis.com/token',
     userInfoURL: 'https://www.googleapis.com/oauth2/v2/userinfo',
     scopes: ['openid', 'email', 'profile'], // Minimal scopes only
     pkceRequired: true,
     stateValidation: true,
   };
   ```

2. **GitHub OAuth**

   ```typescript
   const githubOAuthConfig = {
     provider: 'github',
     authorizationURL: 'https://github.com/login/oauth/authorize',
     tokenURL: 'https://github.com/login/oauth/access_token',
     userInfoURL: 'https://api.github.com/user',
     scopes: ['user:email'], // No repo access
     pkceRequired: true,
     stateValidation: true,
   };
   ```

3. **Microsoft OAuth 2.0**
   ```typescript
   const microsoftOAuthConfig = {
     provider: 'microsoft',
     authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
     tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
     userInfoURL: 'https://graph.microsoft.com/v1.0/me',
     scopes: ['openid', 'email', 'profile'],
     pkceRequired: true,
     stateValidation: true,
     tenantValidation: true, // For enterprise customers
   };
   ```

#### 3.1.2 OAuth Implementation Template

**REQUIREMENT**: Use this secure OAuth implementation pattern:

```typescript
class SecureOAuthHandler {
  private readonly config: OAuthConfig;
  private readonly stateStore: StateStore;
  private readonly tokenEncryption: TokenEncryption;

  async initiateOAuth(userId: string): Promise<AuthorizationURL> {
    // Generate cryptographically secure state
    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    // Store state and PKCE verifier
    await this.stateStore.store(state, {
      userId,
      codeVerifier,
      timestamp: Date.now(),
      expiresIn: 600000, // 10 minutes
    });

    // Build authorization URL
    const authURL = new URL(this.config.authorizationURL);
    authURL.searchParams.set('client_id', this.config.clientId);
    authURL.searchParams.set('response_type', 'code');
    authURL.searchParams.set('scope', this.config.scopes.join(' '));
    authURL.searchParams.set('redirect_uri', this.config.redirectUri);
    authURL.searchParams.set('state', state);
    authURL.searchParams.set('code_challenge', codeChallenge);
    authURL.searchParams.set('code_challenge_method', 'S256');

    return { url: authURL.toString(), state };
  }

  async handleCallback(code: string, state: string): Promise<TokenResponse> {
    // Validate state parameter
    const stateData = await this.stateStore.retrieve(state);
    if (!stateData || stateData.timestamp + stateData.expiresIn < Date.now()) {
      throw new SecurityError('Invalid or expired OAuth state');
    }

    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(code, stateData.codeVerifier);

    // Encrypt and store refresh token
    if (tokenResponse.refresh_token) {
      const encryptedToken = await this.tokenEncryption.encrypt(tokenResponse.refresh_token);
      await this.storeRefreshToken(stateData.userId, encryptedToken);
    }

    // Clean up state
    await this.stateStore.delete(state);

    return {
      access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in,
      token_type: tokenResponse.token_type,
      // Don't return refresh token in response
      user_info: await this.fetchUserInfo(tokenResponse.access_token),
    };
  }
}
```

### 3.2 OAuth Security Requirements

#### 3.2.1 State Parameter Security

**REQUIREMENT**: All OAuth flows MUST implement CSRF protection:

```typescript
class OAuthStateManager {
  private readonly redis: Redis;

  async generateState(userId: string, provider: string): Promise<string> {
    const state = crypto.randomBytes(32).toString('hex');
    const stateData = {
      userId,
      provider,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    // Store with 10-minute expiration
    await this.redis.setex(`oauth:state:${state}`, 600, JSON.stringify(stateData));

    return state;
  }

  async validateState(state: string, expectedUserId: string): Promise<boolean> {
    const stateData = await this.redis.get(`oauth:state:${state}`);
    if (!stateData) return false;

    const parsed = JSON.parse(stateData);

    // Verify state hasn't expired and belongs to correct user
    const isValid = parsed.userId === expectedUserId && parsed.timestamp + 600000 > Date.now();

    // Delete state after validation (one-time use)
    await this.redis.del(`oauth:state:${state}`);

    return isValid;
  }
}
```

#### 3.2.2 Token Security

**REQUIREMENT**: OAuth tokens MUST be handled securely:

```typescript
class OAuthTokenManager {
  private readonly encryption: AES256GCM;

  async storeTokens(userId: string, tokens: OAuthTokens): Promise<void> {
    // Never store access tokens (short-lived)
    if (tokens.refresh_token) {
      const encryptedRefreshToken = await this.encryption.encrypt(tokens.refresh_token);

      await this.db.query(
        `
        INSERT INTO oauth_tokens (user_id, provider, refresh_token_encrypted, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, provider) 
        DO UPDATE SET refresh_token_encrypted = $3, expires_at = $4
      `,
        [userId, tokens.provider, encryptedRefreshToken, new Date(Date.now() + 86400000 * 7)]
      );
    }
  }

  async refreshAccessToken(userId: string, provider: string): Promise<string> {
    const tokenRecord = await this.db.query(
      `
      SELECT refresh_token_encrypted FROM oauth_tokens 
      WHERE user_id = $1 AND provider = $2 AND expires_at > NOW()
    `,
      [userId, provider]
    );

    if (!tokenRecord.rows[0]) {
      throw new Error('No valid refresh token found');
    }

    const refreshToken = await this.encryption.decrypt(tokenRecord.rows[0].refresh_token_encrypted);

    // Exchange refresh token for new access token
    const newTokens = await this.exchangeRefreshToken(refreshToken, provider);

    // Store new refresh token if provided (token rotation)
    if (newTokens.refresh_token) {
      await this.storeTokens(userId, { ...newTokens, provider });
    }

    return newTokens.access_token;
  }
}
```

---

## 4. API Integration Guidelines

### 4.1 REST API Integration

#### 4.1.1 Secure HTTP Client Configuration

**REQUIREMENT**: All external API calls MUST use this configuration:

```typescript
class SecureHttpClient {
  private readonly axios: AxiosInstance;
  private readonly rateLimiter: RateLimiter;

  constructor(baseURL: string, options: SecureHttpOptions) {
    this.axios = axios.create({
      baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': `PromptScape/1.0 (+https://promptscape.app)`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: true, // Validate SSL certificates
        minVersion: 'TLSv1.2', // Minimum TLS 1.2
        ciphers: 'ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM', // Secure ciphers only
      }),
      maxRedirects: 3,
      validateStatus: status => status >= 200 && status < 300,
    });

    this.setupInterceptors();
    this.rateLimiter = new RateLimiter(options.rateLimit);
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      async config => {
        // Rate limiting
        await this.rateLimiter.checkLimit();

        // Add request ID for tracing
        config.headers['X-Request-ID'] = crypto.randomUUID();

        // Add timestamp
        config.headers['X-Timestamp'] = new Date().toISOString();

        // Log outgoing request
        logger.info('External API request', {
          url: config.url,
          method: config.method,
          headers: this.sanitizeHeaders(config.headers),
        });

        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      response => {
        // Log successful response
        logger.info('External API response', {
          url: response.config.url,
          status: response.status,
          duration: Date.now() - parseInt(response.config.headers['X-Timestamp']),
        });

        return response;
      },
      error => {
        // Log error response
        logger.error('External API error', {
          url: error.config?.url,
          status: error.response?.status,
          error: error.message,
        });

        return Promise.reject(new APIError(error));
      }
    );
  }
}
```

#### 4.1.2 API Authentication Patterns

**REQUIREMENT**: Use appropriate authentication based on API type:

1. **API Key Authentication**:

```typescript
class APIKeyAuth implements AuthenticationStrategy {
  constructor(
    private apiKey: string,
    private headerName: string = 'X-API-Key'
  ) {}

  authenticate(config: AxiosRequestConfig): AxiosRequestConfig {
    config.headers[this.headerName] = this.apiKey;
    return config;
  }
}
```

2. **Bearer Token Authentication**:

```typescript
class BearerTokenAuth implements AuthenticationStrategy {
  constructor(private tokenProvider: () => Promise<string>) {}

  async authenticate(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const token = await this.tokenProvider();
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  }
}
```

3. **Request Signing**:

```typescript
class RequestSigner implements AuthenticationStrategy {
  constructor(private secretKey: string) {}

  authenticate(config: AxiosRequestConfig): AxiosRequestConfig {
    const timestamp = Date.now().toString();
    const payload = `${config.method?.toUpperCase()}${config.url}${timestamp}${config.data || ''}`;
    const signature = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');

    config.headers['X-Timestamp'] = timestamp;
    config.headers['X-Signature'] = signature;

    return config;
  }
}
```

### 4.2 GraphQL API Integration

#### 4.2.1 Secure GraphQL Client

**REQUIREMENT**: GraphQL integrations MUST implement query validation:

```typescript
class SecureGraphQLClient {
  private readonly client: GraphQLClient;
  private readonly queryValidator: GraphQLQueryValidator;

  constructor(endpoint: string, auth: AuthenticationStrategy) {
    this.client = new GraphQLClient(endpoint, {
      headers: {
        'User-Agent': 'PromptScape/1.0',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.queryValidator = new GraphQLQueryValidator({
      maxDepth: 10,
      maxComplexity: 1000,
      scalarCost: 1,
      objectCost: 2,
      listFactor: 10,
      forbiddenFields: ['__schema', '__type'], // Prevent introspection
    });
  }

  async query<T>(query: string, variables?: any): Promise<T> {
    // Validate query complexity
    const validation = this.queryValidator.validate(query);
    if (!validation.isValid) {
      throw new Error(`Invalid GraphQL query: ${validation.errors.join(', ')}`);
    }

    // Execute query with error handling
    try {
      const result = await this.client.request<T>(query, variables);
      return result;
    } catch (error) {
      logger.error('GraphQL query failed', { query, variables, error });
      throw new GraphQLError(error);
    }
  }
}
```

---

## 5. Webhook Integration Guidelines

### 5.1 Inbound Webhook Security

#### 5.1.1 Webhook Signature Verification

**REQUIREMENT**: All inbound webhooks MUST verify signatures:

```typescript
class WebhookSignatureVerifier {
  private readonly secrets: Map<string, string>;

  constructor(secrets: Record<string, string>) {
    this.secrets = new Map(Object.entries(secrets));
  }

  verifySignature(
    payload: string,
    signature: string,
    provider: string,
    algorithm: 'sha1' | 'sha256' | 'sha512' = 'sha256'
  ): boolean {
    const secret = this.secrets.get(provider);
    if (!secret) {
      throw new Error(`No webhook secret configured for provider: ${provider}`);
    }

    // Calculate expected signature
    const expectedSignature = crypto.createHmac(algorithm, secret).update(payload, 'utf8').digest('hex');

    // Extract signature from header (remove algorithm prefix if present)
    const providedSignature = signature.replace(`${algorithm}=`, '');

    // Timing-safe comparison
    try {
      return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(providedSignature, 'hex'));
    } catch (error) {
      return false;
    }
  }

  verifyTimestamp(timestamp: string, tolerance: number = 300000): boolean {
    const webhookTime = parseInt(timestamp) * 1000; // Convert to milliseconds
    const now = Date.now();
    return Math.abs(now - webhookTime) <= tolerance; // 5 minute tolerance
  }
}
```

#### 5.1.2 Webhook Handler Template

**REQUIREMENT**: Use this secure webhook handler pattern:

```typescript
class SecureWebhookHandler {
  private readonly verifier: WebhookSignatureVerifier;
  private readonly rateLimiter: RateLimiter;

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Rate limiting by IP
      await this.rateLimiter.checkLimit(req.ip);

      // Extract webhook data
      const payload = JSON.stringify(req.body);
      const signature = req.get('X-Hub-Signature-256') || req.get('X-Signature');
      const timestamp = req.get('X-Timestamp');
      const provider = this.identifyProvider(req);

      // Validate required headers
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature header' });
      }

      // Verify signature
      if (!this.verifier.verifySignature(payload, signature, provider)) {
        logger.warn('Invalid webhook signature', { provider, ip: req.ip });
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Verify timestamp if provided
      if (timestamp && !this.verifier.verifyTimestamp(timestamp)) {
        logger.warn('Webhook timestamp too old', { provider, timestamp, ip: req.ip });
        return res.status(400).json({ error: 'Request too old' });
      }

      // Validate payload schema
      const validatedPayload = await this.validatePayload(req.body, provider);

      // Process webhook
      await this.processWebhook(validatedPayload, provider);

      // Log successful webhook
      logger.info('Webhook processed successfully', { provider, type: validatedPayload.type });

      res.status(200).json({ status: 'success' });
    } catch (error) {
      logger.error('Webhook processing failed', { error: error.message, provider });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### 5.2 Outbound Webhook Security

#### 5.2.1 Secure Webhook Delivery

**REQUIREMENT**: Outbound webhooks MUST implement secure delivery:

```typescript
class SecureWebhookDelivery {
  private readonly httpClient: SecureHttpClient;
  private readonly signer: RequestSigner;

  async deliverWebhook(url: string, payload: any, options: WebhookDeliveryOptions): Promise<WebhookDeliveryResult> {
    const deliveryId = crypto.randomUUID();

    try {
      // Validate webhook URL
      this.validateWebhookURL(url);

      // Prepare payload
      const webhookPayload = {
        id: deliveryId,
        timestamp: Date.now(),
        data: payload,
        version: '1.0',
      };

      // Sign request
      const signedConfig = await this.signer.authenticate({
        method: 'POST',
        url,
        data: JSON.stringify(webhookPayload),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PromptScape-Webhooks/1.0',
          'X-Webhook-ID': deliveryId,
          'X-Webhook-Timestamp': webhookPayload.timestamp.toString(),
        },
      });

      // Deliver with retry logic
      const result = await this.deliverWithRetry(signedConfig, options.retryOptions);

      // Log delivery
      logger.info('Webhook delivered successfully', {
        id: deliveryId,
        url: this.sanitizeURL(url),
        status: result.status,
        duration: result.duration,
      });

      return {
        id: deliveryId,
        status: 'delivered',
        httpStatus: result.status,
        duration: result.duration,
      };
    } catch (error) {
      logger.error('Webhook delivery failed', {
        id: deliveryId,
        url: this.sanitizeURL(url),
        error: error.message,
      });

      return {
        id: deliveryId,
        status: 'failed',
        error: error.message,
        retryCount: error.retryCount || 0,
      };
    }
  }

  private async deliverWithRetry(config: AxiosRequestConfig, retryOptions: RetryOptions): Promise<DeliveryResult> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await this.httpClient.request(config);

        return {
          status: response.status,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error;

        if (attempt < retryOptions.maxRetries) {
          const delay = this.calculateRetryDelay(attempt, retryOptions.backoffStrategy);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
```

---

## 6. Database Integration Guidelines

### 6.1 Connection Security

#### 6.1.1 PostgreSQL Secure Connection

**REQUIREMENT**: PostgreSQL connections MUST use secure configuration:

```typescript
class SecurePostgreSQLConnection {
  private readonly pool: Pool;

  constructor(config: PostgreSQLConfig) {
    // Validate configuration
    this.validateConfig(config);

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,

      // SSL Configuration
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: config.sslCA,
        key: config.sslKey,
        cert: config.sslCert,
      },

      // Connection Pool Security
      max: 20, // Maximum connections
      min: 5, // Minimum connections
      idleTimeoutMillis: 600000, // 10 minutes
      connectionTimeoutMillis: 10000, // 10 seconds

      // Query Configuration
      statement_timeout: 30000, // 30 seconds
      query_timeout: 30000,

      // Application Name for Monitoring
      application_name: 'promptscape-app',
    });

    this.setupEventHandlers();
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    const startTime = Date.now();

    try {
      // Log query (sanitized)
      logger.debug('Database query', {
        query: this.sanitizeQuery(text),
        duration: Date.now() - startTime,
      });

      const result = await client.query(text, params);

      return result;
    } catch (error) {
      logger.error('Database query failed', {
        error: error.message,
        query: this.sanitizeQuery(text),
        duration: Date.now() - startTime,
      });
      throw error;
    } finally {
      client.release();
    }
  }
}
```

#### 6.1.2 Redis Secure Connection

**REQUIREMENT**: Redis connections MUST implement authentication and encryption:

```typescript
class SecureRedisConnection {
  private readonly redis: Redis;

  constructor(config: RedisConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,

      // TLS Configuration
      tls: config.tls
        ? {
            servername: config.host,
            rejectUnauthorized: true,
          }
        : undefined,

      // Connection Configuration
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,

      // Connection Pool
      family: 4,
      keepAlive: 30000,

      // Error Handling
      lazyConnect: true,
      maxLoadingTimeout: 5000,
    });

    this.setupEventHandlers();
  }

  async setSecure(key: string, value: string, ttl?: number): Promise<void> {
    // Encrypt sensitive data before storing
    const encryptedValue = await this.encrypt(value);

    if (ttl) {
      await this.redis.setex(key, ttl, encryptedValue);
    } else {
      await this.redis.set(key, encryptedValue);
    }
  }

  async getSecure(key: string): Promise<string | null> {
    const encryptedValue = await this.redis.get(key);
    if (!encryptedValue) return null;

    // Decrypt sensitive data after retrieval
    return await this.decrypt(encryptedValue);
  }
}
```

---

## 7. File Upload/Download Security

### 7.1 File Upload Security

#### 7.1.1 Secure File Upload Handler

**REQUIREMENT**: File uploads MUST implement comprehensive security:

```typescript
class SecureFileUploadHandler {
  private readonly allowedTypes: Set<string>;
  private readonly maxFileSize: number;
  private readonly virusScanner: VirusScanner;

  constructor(config: FileUploadConfig) {
    this.allowedTypes = new Set(config.allowedMimeTypes);
    this.maxFileSize = config.maxFileSize;
    this.virusScanner = new VirusScanner(config.scannerConfig);
  }

  async handleUpload(file: UploadedFile, userId: string): Promise<FileUploadResult> {
    const uploadId = crypto.randomUUID();

    try {
      // File validation
      await this.validateFile(file);

      // Virus scanning
      await this.virusScanner.scan(file.buffer);

      // Content inspection
      await this.inspectFileContent(file);

      // Generate secure filename
      const secureFilename = this.generateSecureFilename(file.originalname);

      // Upload to secure storage
      const storageResult = await this.uploadToSecureStorage(file, secureFilename, userId);

      // Log successful upload
      logger.info('File uploaded successfully', {
        uploadId,
        filename: secureFilename,
        size: file.size,
        userId,
      });

      return {
        id: uploadId,
        filename: secureFilename,
        size: file.size,
        url: storageResult.url,
        contentType: file.mimetype,
      };
    } catch (error) {
      logger.error('File upload failed', {
        uploadId,
        error: error.message,
        userId,
      });

      throw new FileUploadError(error.message);
    }
  }

  private async validateFile(file: UploadedFile): Promise<void> {
    // Size validation
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    // MIME type validation
    if (!this.allowedTypes.has(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    // Magic number validation (verify actual file type)
    const actualType = await this.detectFileType(file.buffer);
    if (actualType !== file.mimetype) {
      throw new Error('File type mismatch detected');
    }

    // Filename validation
    if (this.hasUnsafeFilename(file.originalname)) {
      throw new Error('Unsafe filename detected');
    }
  }

  private generateSecureFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');

    return `${timestamp}-${random}${ext}`;
  }
}
```

---

## 8. Monitoring & Alerting

### 8.1 Integration Monitoring

#### 8.1.1 Health Check Implementation

**REQUIREMENT**: All integrations MUST implement health checks:

```typescript
class IntegrationHealthChecker {
  private readonly integrations: Map<string, HealthCheckable>;
  private readonly alertManager: AlertManager;

  async performHealthChecks(): Promise<HealthCheckResults> {
    const results = new Map<string, HealthCheckResult>();

    for (const [name, integration] of this.integrations) {
      try {
        const startTime = Date.now();
        const result = await integration.healthCheck();
        const duration = Date.now() - startTime;

        results.set(name, {
          name,
          status: result.isHealthy ? 'healthy' : 'unhealthy',
          responseTime: duration,
          details: result.details,
          timestamp: new Date().toISOString(),
        });

        // Alert on unhealthy integrations
        if (!result.isHealthy) {
          await this.alertManager.sendAlert({
            level: 'warning',
            service: name,
            message: `Integration ${name} is unhealthy: ${result.details}`,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        results.set(name, {
          name,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        });

        // Alert on integration errors
        await this.alertManager.sendAlert({
          level: 'critical',
          service: name,
          message: `Integration ${name} health check failed: ${error.message}`,
          timestamp: new Date(),
        });
      }
    }

    return {
      overall: this.calculateOverallHealth(results),
      services: Object.fromEntries(results),
      timestamp: new Date().toISOString(),
    };
  }
}
```

#### 8.1.2 Performance Monitoring

**REQUIREMENT**: Monitor integration performance metrics:

```typescript
class IntegrationPerformanceMonitor {
  private readonly metrics: MetricsCollector;

  recordAPICall(service: string, endpoint: string, duration: number, status: number): void {
    // Record response time
    this.metrics.histogram('integration_response_time', duration, {
      service,
      endpoint,
      status_code: status.toString(),
    });

    // Record request count
    this.metrics.counter('integration_requests_total', 1, {
      service,
      endpoint,
      status_code: status.toString(),
    });

    // Record error rate
    if (status >= 400) {
      this.metrics.counter('integration_errors_total', 1, {
        service,
        endpoint,
        status_code: status.toString(),
      });
    }
  }

  recordWebhookDelivery(url: string, status: 'success' | 'failed', duration?: number): void {
    this.metrics.counter('webhook_deliveries_total', 1, { status });

    if (duration) {
      this.metrics.histogram('webhook_delivery_duration', duration, { status });
    }
  }
}
```

---

## 9. Testing Guidelines

### 9.1 Integration Testing

#### 9.1.1 Security Testing Framework

**REQUIREMENT**: All integrations MUST pass security tests:

```typescript
describe('Integration Security Tests', () => {
  describe('OAuth Integration', () => {
    it('should validate state parameter', async () => {
      const handler = new OAuthHandler();

      // Test with invalid state
      await expect(handler.handleCallback('valid-code', 'invalid-state')).rejects.toThrow('Invalid OAuth state');
    });

    it('should implement PKCE', async () => {
      const handler = new OAuthHandler();
      const authUrl = await handler.initiateOAuth('user123');

      // Verify PKCE parameters are present
      expect(authUrl).toMatch(/code_challenge=/);
      expect(authUrl).toMatch(/code_challenge_method=S256/);
    });
  });

  describe('API Integration', () => {
    it('should handle API errors securely', async () => {
      const client = new SecureHttpClient('https://api.example.com');

      // Mock error response
      nock('https://api.example.com').get('/test').reply(500, { error: 'Internal server error' });

      await expect(client.get('/test')).rejects.toThrow(APIError);
    });

    it('should implement rate limiting', async () => {
      const client = new SecureHttpClient('https://api.example.com', {
        rateLimit: { requests: 1, window: 1000 },
      });

      // First request should succeed
      nock('https://api.example.com').get('/test').reply(200, 'OK');
      await client.get('/test');

      // Second request should be rate limited
      await expect(client.get('/test')).rejects.toThrow('Rate limit exceeded');
    });
  });
});
```

---

## 10. Emergency Procedures

### 10.1 Integration Incident Response

#### 10.1.1 Incident Classification

**REQUIREMENT**: Classify integration incidents by severity:

| Severity          | Description              | Response Time | Action Required      |
| ----------------- | ------------------------ | ------------- | -------------------- |
| **P0 - Critical** | Complete service outage  | 15 minutes    | Immediate escalation |
| **P1 - High**     | Major feature impacted   | 1 hour        | On-call engineer     |
| **P2 - Medium**   | Minor feature impacted   | 4 hours       | Next business day    |
| **P3 - Low**      | Monitoring/logging issue | 24 hours      | Planned fix          |

#### 10.1.2 Emergency Response Playbook

**REQUIREMENT**: Follow this incident response procedure:

```typescript
class IntegrationIncidentResponse {
  async handleIncident(incident: SecurityIncident): Promise<void> {
    // Step 1: Assess and classify
    const severity = this.classifyIncident(incident);

    // Step 2: Immediate containment
    if (severity === 'P0' || severity === 'P1') {
      await this.containThreat(incident);
    }

    // Step 3: Notify stakeholders
    await this.notifyStakeholders(incident, severity);

    // Step 4: Begin remediation
    await this.startRemediation(incident);

    // Step 5: Document incident
    await this.documentIncident(incident);
  }

  private async containThreat(incident: SecurityIncident): Promise<void> {
    switch (incident.type) {
      case 'COMPROMISED_CREDENTIALS':
        await this.revokeCredentials(incident.details.service);
        break;

      case 'UNAUTHORIZED_ACCESS':
        await this.blockSuspiciousIPs(incident.details.ips);
        break;

      case 'DATA_BREACH':
        await this.isolateAffectedSystems(incident.details.systems);
        break;

      default:
        await this.enableDefensiveMode();
    }
  }
}
```

---

## 11. Compliance Considerations

### 11.1 GDPR Compliance

**REQUIREMENT**: All integrations with EU user data MUST comply with GDPR:

- **Data Processing Basis**: Document legal basis for each integration
- **Data Minimization**: Only share necessary data with third parties
- **User Consent**: Obtain explicit consent for data sharing
- **Data Subject Rights**: Support access, rectification, erasure, portability
- **Data Protection Impact Assessment**: Required for high-risk integrations

### 11.2 SOC 2 Compliance

**REQUIREMENT**: Integrations MUST demonstrate SOC 2 controls:

- **Security**: Access controls, encryption, monitoring
- **Availability**: Uptime monitoring, disaster recovery
- **Processing Integrity**: Data validation, error handling
- **Confidentiality**: Data classification, access logging
- **Privacy**: Data minimization, consent management

---

## Contact Information

### Security Team

- **Security Lead**: security-lead@promptscape.app
- **Integration Security**: integration-security@promptscape.app
- **Incident Response**: security-incident@promptscape.app

### Emergency Contacts

- **Critical Security Issue**: Slack #security-critical
- **Integration Outage**: Slack #integration-alerts
- **Emergency Phone**: +1-XXX-XXX-XXXX (24/7)

---

**Document Owner**: Security Team  
**Review Schedule**: Quarterly  
**Next Review**: 2025-10-22
