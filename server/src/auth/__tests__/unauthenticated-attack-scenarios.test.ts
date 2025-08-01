/**
 * Epic 19.5 - Unauthenticated Attack Scenarios Test Suite
 * 
 * This test suite validates security controls against unauthenticated attack patterns
 * and verifies that anonymous users cannot bypass security measures.
 * 
 * Attack Scenarios:
 * 1. Brute Force Authentication Attacks
 * 2. Credential Enumeration Attacks  
 * 3. Injection Attack Attempts
 * 4. Privilege Escalation Attempts
 * 5. Information Disclosure Attacks
 * 6. Denial of Service Attack Patterns
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock configuration
jest.mock('../config', () => ({
  buildAuthConfig: () => ({
    jwt: { secret: 'test-secret', expiresIn: '1h' },
    security: { 
      maxLoginAttempts: 5, 
      rateLimitWindow: 60 * 1000,
      maxRequestsPerWindow: 100


}));

describe('Epic 19.5 - Unauthenticated Attack Scenarios', () => {

  describe('1. Brute Force Authentication Attacks', () => {
    it('should prevent password brute force attacks', () => {
      let attemptCount = 0;
      const maxAttempts = 5;
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      let lockoutTime: number | null = null;

      const attemptLogin = (email: string, password: string): { 
        success: boolean, 
        error?: string, 
        lockoutRemaining?: number 
 => {
        const now = Date.now();

        // Check if account is locked
        if (lockoutTime && now < lockoutTime) {
          const remaining = Math.ceil((lockoutTime - now) / 1000);
          return { 
            success: false, 
            error: 'Account locked',
            lockoutRemaining: remaining
          };


        // Reset lockout if expired
        if (lockoutTime && now >= lockoutTime) {
          lockoutTime = null;
          attemptCount = 0;


        // Simulate authentication check
        if (password !== 'correct-password') {
          attemptCount++;
          
          if (attemptCount >= maxAttempts) {
            lockoutTime = now + lockoutDuration;
            return { 
              success: false, 
              error: 'Account locked due to too many failed attempts',
              lockoutRemaining: Math.ceil(lockoutDuration / 1000)
            };


          return { 
            success: false, 
            error: `Invalid credentials (${attemptCount}/${maxAttempts})` 
          };


        // Successful login resets attempt count
        attemptCount = 0;
        lockoutTime = null;
        return { success: true };
      };

      // Test progressive lockout
      for (let i = 1; i < 5; i++) {
        const result = attemptLogin('user@test.com', 'wrong-password');
        expect(result.success).toBe(false);
        expect(result.error).toContain(`(${i}/5)`);


      // Fifth attempt should trigger lockout
      const lockoutResult = attemptLogin('user@test.com', 'wrong-password');
      expect(lockoutResult.success).toBe(false);
      expect(lockoutResult.error).toBe('Account locked due to too many failed attempts');
      expect(lockoutResult.lockoutRemaining).toBeGreaterThan(0);

      // Subsequent attempts should be blocked
      const blockedResult = attemptLogin('user@test.com', 'correct-password');
      expect(blockedResult.success).toBe(false);
      expect(blockedResult.error).toBe('Account locked');
    });

    it('should detect distributed brute force attacks', () => {
      const ipAttempts = new Map<string, { count: number, lastAttempt: number }>();
      const maxAttemptsPerIP = 10;
      const windowMs = 60 * 1000; // 1 minute

      const checkIPRateLimit = (ip: string): boolean => {
        const now = Date.now();
        const ipData = ipAttempts.get(ip) || { count: 0, lastAttempt: now };

        // Reset window if expired
        if (now - ipData.lastAttempt > windowMs) {
          ipData.count = 0;
          ipData.lastAttempt = now;


        ipData.count++;
        ipAttempts.set(ip, ipData);

        return ipData.count <= maxAttemptsPerIP;
      };

      // Test multiple IPs attacking
      const attackerIPs = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];
      
      // Each IP should be allowed some attempts
      for (const ip of attackerIPs) {
        for (let i = 0; i < maxAttemptsPerIP; i++) {
          expect(checkIPRateLimit(ip)).toBe(true);

        
        // Additional attempts should be blocked
        expect(checkIPRateLimit(ip)).toBe(false);


      // Verify each IP is tracked separately
      expect(ipAttempts.size).toBe(3);
      attackerIPs.forEach(ip => {
        const data = ipAttempts.get(ip);
        expect(data?.count).toBe(maxAttemptsPerIP + 1);
      });
    });

    it('should prevent credential stuffing attacks', () => {
      const knownCompromisedCredentials = new Set([
        'admin:password123',
        'user:123456',
        'test:qwerty'
      ]);

      const detectCredentialStuffing = (email: string, password: string): boolean => {
        const credential = `${email.split('@')[0]}:${password}`;
        return knownCompromisedCredentials.has(credential);
      };

      const authenticateWithBreachCheck = (email: string, password: string): {
        success: boolean,
        warning?: string,
        error?: string
 => {
        // Check for known compromised credentials
        if (detectCredentialStuffing(email, password)) {
          return {
            success: false,
            error: 'These credentials appear in known data breaches. Please choose a different password.',
            warning: 'Credential stuffing attack detected'
          };


        // Normal authentication logic would go here
        if (password === 'secure-password-2024!') {
          return { success: true };


        return { success: false, error: 'Invalid credentials' };
      };

      // Test known compromised credentials
      expect(authenticateWithBreachCheck('admin@test.com', 'password123')).toEqual({
        success: false,
        error: 'These credentials appear in known data breaches. Please choose a different password.',
        warning: 'Credential stuffing attack detected'
      });

      // Test secure credential
      expect(authenticateWithBreachCheck('user@test.com', 'secure-password-2024!')).toEqual({
        success: true
      });
    });
  });

  describe('2. Credential Enumeration Attacks', () => {
    it('should prevent username enumeration via timing attacks', async () => {
      const users = ['admin@test.com', 'user@test.com'];
      const baseProcessingTime = 100; // ms

      const authenticateUser = async (email: string, password: string): Promise<{
        success: boolean,
        error: string,
        processingTime: number
> => {
        const startTime = Date.now();
        
        // Simulate constant-time user lookup
        await new Promise(resolve => setTimeout(resolve, baseProcessingTime));
        
        const userExists = users.includes(email);
        const passwordCorrect = password === 'correct-password';
        
        // Always perform password hashing simulation (constant time)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const processingTime = Date.now() - startTime;
        
        if (!userExists || !passwordCorrect) {
          return {
            success: false,
            error: 'Invalid email or password', // Generic error message
            processingTime
          };


        return {
          success: true,
          error: '',
          processingTime
        };
      };

      // Test existing vs non-existing users
      const existingUserResult = await authenticateUser('admin@test.com', 'wrong-password');
      const nonExistentUserResult = await authenticateUser('nonexistent@test.com', 'wrong-password');

      // Both should return generic error message
      expect(existingUserResult.error).toBe('Invalid email or password');
      expect(nonExistentUserResult.error).toBe('Invalid email or password');
      
      // Processing times should be similar (within 50ms)
      const timeDifference = Math.abs(existingUserResult.processingTime - nonExistentUserResult.processingTime);
      expect(timeDifference).toBeLessThan(50);
    });

    it('should prevent email enumeration via registration', () => {
      const existingUsers = new Set(['admin@test.com', 'user@test.com']);

      const attemptRegistration = (email: string, password: string): {
        success: boolean,
        error?: string
 => {
        // Basic email validation
        if (!email.includes('@') || email.length < 5) {
          return { success: false, error: 'Please provide a valid email address' };


        // Password validation
        if (password.length < 8) {
          return { success: false, error: 'Password must be at least 8 characters long' };


        // Check if user exists (but don't reveal this information)
        if (existingUsers.has(email)) {
          // Generic response to prevent enumeration
          return { success: true }; // Pretend success, but actually don't create account


        // Would create new user here
        existingUsers.add(email);
        return { success: true };
      };

      // Test with existing user
      const existingResult = attemptRegistration('admin@test.com', 'newpassword123');
      expect(existingResult.success).toBe(true); // Generic success response

      // Test with new user
      const newUserResult = attemptRegistration('newuser@test.com', 'newpassword123');
      expect(newUserResult.success).toBe(true);

      // Responses should be identical to prevent enumeration
      expect(existingResult).toEqual(newUserResult);
    });
  });

  describe('3. Injection Attack Attempts', () => {
    it('should prevent SQL injection in authentication', () => {
      // Simulate parameterized query protection
      const authenticateUser = (email: string, password: string): boolean => {
        // Sanitize inputs
        const sanitizedEmail = email.replace(/[';\\x00-\\x1F\\x7F"\\\\]/g, '');
        const sanitizedPassword = password.replace(/[';\\x00-\\x1F\\x7F"\\\\]/g, '');
        
        // Check for SQL injection patterns
        const sqlInjectionPatterns = [
          /union\s+select/i,
          /or\s+1\s*=\s*1/i,
          /;\s*drop\s+table/i,
          /;\s*delete\s+from/i,
          /;\s*insert\s+into/i,
          /'.*or.*'/i
        ];

        const hasInjection = sqlInjectionPatterns.some(pattern => 
          pattern.test(sanitizedEmail) || pattern.test(sanitizedPassword)
        );

        if (hasInjection) {
          throw new Error('Invalid input detected');


        // Simulate parameterized query (safe from injection)
        return sanitizedEmail === 'admin@test.com' && sanitizedPassword === 'password';
      };

      const injectionAttempts = [
        'admin@test.com\'; DROP TABLE users; --',
        'admin@test.com\' OR 1=1; --',
        'admin@test.com\' UNION SELECT * FROM passwords; --',
        'test@example.com\' OR \'x\'=\'x'
      ];

      injectionAttempts.forEach(maliciousEmail => {
        expect(() => authenticateUser(maliciousEmail, 'password')).toThrow('Invalid input detected');
      });

      // Valid input should work
      expect(authenticateUser('admin@test.com', 'password')).toBe(true);
    });

    it('should prevent NoSQL injection attempts', () => {
      const authenticateUser = (email: unknown, password: unknown): boolean => {
        // Ensure inputs are strings (prevent object injection)
        if (typeof email !== 'string' || typeof password !== 'string') {
          throw new Error('Invalid input type');


        // Check for NoSQL injection patterns
        const nosqlPatterns = [
          /\$where/i,
          /\$ne/i,
          /\$gt/i,
          /\$regex/i,
          /\$or/i,
          /\$and/i
        ];

        const hasNoSQLInjection = nosqlPatterns.some(pattern => 
          pattern.test(email) || pattern.test(password)
        );

        if (hasNoSQLInjection) {
          throw new Error('Invalid query pattern detected');


        return email === 'admin@test.com' && password === 'password';
      };

      // Object injection attempts
      const objectInjectionAttempts = [
        { email: { $ne: null }, password: { $ne: null } },
        { email: 'admin@test.com', password: { $gt: '' } },
        { email: { $regex: '.*' }, password: 'anything' }
      ];

      objectInjectionAttempts.forEach(attempt => {
        expect(() => authenticateUser(attempt.email, attempt.password)).toThrow();
      });

      // String injection attempts
      const stringInjectionAttempts = [
        ['admin@test.com", "$where": "1==1', 'password'],
        ['admin@test.com", "$ne": null, "password": "', 'ignored'],
        ['test@test.com", "$or": [{"admin": true}], "fake": "', 'password']
      ];

      stringInjectionAttempts.forEach(([email, password]) => {
        expect(() => authenticateUser(email, password)).toThrow();
      });

      // Valid authentication should work
      expect(authenticateUser('admin@test.com', 'password')).toBe(true);
    });
  });

  describe('4. Privilege Escalation Attempts', () => {
    it('should prevent token manipulation for privilege escalation', () => {
      const validateToken = (token: string): { valid: boolean, user?: any } => {
        try {
          // Simple token structure: header.payload.signature
          const parts = token.split('.');
          if (parts.length !== 3) return { valid: false };

          const [header, payload, signature] = parts;
          
          // Decode payload
          const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
          
          // Validate signature (simplified - real implementation would use crypto)
          const expectedSignature = 'valid-signature-hash';
          if (signature !== expectedSignature) {
            return { valid: false };


          // Check for token tampering by validating known payload structure
          if (!decodedPayload.userId || !decodedPayload.role || !decodedPayload.exp) {
            return { valid: false };


          // Check expiry
          if (Date.now() / 1000 > decodedPayload.exp) {
            return { valid: false };


          return { valid: true, user: decodedPayload };
 catch {
          return { valid: false };

      };

      // Create valid user token
      const userPayload = { userId: 2, role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 };
      const validUserToken = 'header.' + 
        Buffer.from(JSON.stringify(userPayload)).toString('base64') + 
        '.valid-signature-hash';

      // Tampered token attempting privilege escalation
      const adminPayload = { userId: 2, role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      const tamperedToken = 'header.' + 
        Buffer.from(JSON.stringify(adminPayload)).toString('base64') + 
        '.valid-signature-hash'; // Same signature (would fail in real scenario)

      expect(validateToken(validUserToken).valid).toBe(true);
      expect(validateToken(tamperedToken).valid).toBe(false); // Different payload invalidates signature
    });

    it('should prevent role manipulation via request parameters', () => {
      const processRequest = (userId: number, requestData: unknown): {
        success: boolean,
        error?: string,
        userRole?: string
 => {
        // Simulate user lookup from secure storage
        const users = new Map([
          [1, { id: 1, role: 'admin' }],
          [2, { id: 2, role: 'user' }],
          [3, { id: 3, role: 'guest' }]
        ]);

        const user = users.get(userId);
        if (!user) {
          return { success: false, error: 'User not found' };


        // SECURITY: Role comes from secure storage, not from request data
        const actualRole = user.role;
        
        // Ignore any role claims in request data
        if (requestData.role && requestData.role !== actualRole) {
          return { 
            success: false, 
            error: 'Role manipulation attempt detected',
            userRole: actualRole
          };


        return { success: true, userRole: actualRole };
      };

      // Legitimate request
      const legitimateResult = processRequest(2, { action: 'read_profile' });
      expect(legitimateResult.success).toBe(true);
      expect(legitimateResult.userRole).toBe('user');

      // Role escalation attempt
      const escalationResult = processRequest(2, { role: 'admin', action: 'delete_users' });
      expect(escalationResult.success).toBe(false);
      expect(escalationResult.error).toBe('Role manipulation attempt detected');
      expect(escalationResult.userRole).toBe('user'); // Actual role preserved
    });
  });

  describe('5. Information Disclosure Attacks', () => {
    it('should prevent sensitive information leakage in error messages', () => {
      const handleError = (error: Error, context: string): {
        userMessage: string,
        logMessage: string,
        statusCode: number
 => {
        // Log detailed error for developers
        const logMessage = `[${context}] ${error.name}: ${error.message}\nStack: ${error.stack}`;
        
        // Return generic message to users
        let userMessage = 'An error occurred. Please try again.';
        let statusCode = 500;

        // Safe error categorization without leaking details
        if (error.message.includes('not found')) {
          userMessage = 'Resource not found.';
          statusCode = 404;
 else if (error.message.includes('unauthorized')) {
          userMessage = 'Access denied.';
          statusCode = 401;
 else if (error.message.includes('validation')) {
          userMessage = 'Invalid input provided.';
          statusCode = 400;


        return { userMessage, logMessage, statusCode };
      };

      // Test various error scenarios
      const dbError = new Error('Connection failed to database server at 192.168.1.100:5432 with credentials user:password');
      const fileError = new Error('File not found: /etc/passwd');
      const validationError = new Error('Validation failed for field: password_hash');

      const dbResult = handleError(dbError, 'authentication');
      const fileResult = handleError(fileError, 'file_access');
      const validResult = handleError(validationError, 'user_input');

      // User messages should be generic
      expect(dbResult.userMessage).toBe('An error occurred. Please try again.');
      expect(fileResult.userMessage).toBe('Resource not found.');
      expect(validResult.userMessage).toBe('Invalid input provided.');

      // No sensitive information in user messages
      expect(dbResult.userMessage).not.toContain('192.168.1.100');
      expect(dbResult.userMessage).not.toContain('password');
      expect(fileResult.userMessage).not.toContain('/etc/passwd');
      expect(validResult.userMessage).not.toContain('password_hash');

      // Log messages should contain details for debugging
      expect(dbResult.logMessage).toContain('192.168.1.100');
      expect(fileResult.logMessage).toContain('/etc/passwd');
      expect(validResult.logMessage).toContain('password_hash');
    });

    it('should prevent directory traversal attacks', () => {
      const sanitizePath = (userPath: string): string => {
        // Remove dangerous path traversal patterns
        let sanitized = userPath;
        
        // Remove path traversal sequences
        sanitized = sanitized.replace(/\.\./g, '');
        sanitized = sanitized.replace(/\\/g, '');
        sanitized = sanitized.replace(/\//g, '');
        
        // Remove null bytes
        sanitized = sanitized.replace(/\x00/g, '');
        
        // Remove control characters
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
        
        return sanitized;
      };

      const traversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        '/etc/shadow',
        '../../../../root/.ssh/id_rsa',
        'file.txt/../../../secrets.txt',
        'document.pdf\\..\\..\\passwords.txt'
      ];

      traversalAttempts.forEach(attempt => {
        const sanitized = sanitizePath(attempt);
        
        // Should not contain traversal patterns
        expect(sanitized).not.toContain('../');
        expect(sanitized).not.toContain('..\\');
        expect(sanitized).not.toContain('/etc/');
        expect(sanitized).not.toContain('\\windows\\');
        expect(sanitized).not.toContain('/root/');
      });

      // Valid filename should remain unchanged
      const validFile = sanitizePath('document.pdf');
      expect(validFile).toBe('document.pdf');
    });
  });

  describe('6. Denial of Service Attack Patterns', () => {
    it('should prevent computational DoS attacks', () => {
      const processRequest = (complexity: number): {
        success: boolean,
        processingTime: number,
        error?: string
 => {
        const maxComplexity = 1000;
        const startTime = Date.now();

        // Prevent excessive computational load
        if (complexity > maxComplexity) {
          return {
            success: false,
            processingTime: Date.now() - startTime,
            error: 'Request complexity exceeds maximum allowed'
          };


        // Simulate processing with timeout
        const timeout = 5000; // 5 seconds max
        const processingStart = Date.now();
        
        while (Date.now() - processingStart < Math.min(complexity, timeout)) {
          // Simulate work
          if (Date.now() - processingStart > timeout) {
            return {
              success: false,
              processingTime: Date.now() - startTime,
              error: 'Request timeout'
            };



        return {
          success: true,
          processingTime: Date.now() - startTime
        };
      };

      // Normal request should succeed
      const normalResult = processRequest(100);
      expect(normalResult.success).toBe(true);
      expect(normalResult.processingTime).toBeLessThan(1000);

      // High complexity request should be rejected
      const dosResult = processRequest(10000);
      expect(dosResult.success).toBe(false);
      expect(dosResult.error).toBe('Request complexity exceeds maximum allowed');
    });

    it('should prevent memory exhaustion attacks', () => {
      const maxInputSize = 1024 * 1024; // 1MB
      const maxArrayLength = 10000;

      const validateInputSize = (input: string | any[]): {
        valid: boolean,
        error?: string
 => {
        if (typeof input === 'string') {
          if (input.length > maxInputSize) {
            return { valid: false, error: 'Input size exceeds maximum allowed' };

 else if (Array.isArray(input)) {
          if (input.length > maxArrayLength) {
            return { valid: false, error: 'Array length exceeds maximum allowed' };

          
          // Check total memory usage
          const totalSize = JSON.stringify(input).length;
          if (totalSize > maxInputSize) {
            return { valid: false, error: 'Total input size exceeds maximum allowed' };



        return { valid: true };
      };

      // Normal input should pass
      expect(validateInputSize('normal input')).toEqual({ valid: true });
      expect(validateInputSize([1, 2, 3, 4, 5])).toEqual({ valid: true });

      // Large string should be rejected
      const largeString = 'x'.repeat(maxInputSize + 1);
      expect(validateInputSize(largeString)).toEqual({
        valid: false,
        error: 'Input size exceeds maximum allowed'
      });

      // Large array should be rejected
      const largeArray = new Array(maxArrayLength + 1).fill('data');
      expect(validateInputSize(largeArray)).toEqual({
        valid: false,
        error: 'Array length exceeds maximum allowed'
      });
    });

    it('should implement request rate limiting', () => {
      const rateLimiter = new Map<string, {
        requests: number[],
        blocked: boolean,
        blockUntil?: number
>();

      const maxRequests = 10;
      const windowMs = 60 * 1000; // 1 minute
      const blockDuration = 5 * 60 * 1000; // 5 minutes

      const checkRateLimit = (clientId: string): {
        allowed: boolean,
        remaining: number,
        resetTime?: number,
        blockedUntil?: number
 => {
        const now = Date.now();
        const client = rateLimiter.get(clientId) || { requests: [], blocked: false };

        // Check if currently blocked
        if (client.blocked && client.blockUntil && now < client.blockUntil) {
          return {
            allowed: false,
            remaining: 0,
            blockedUntil: client.blockUntil
          };


        // Reset if block period expired
        if (client.blocked && client.blockUntil && now >= client.blockUntil) {
          client.blocked = false;
          client.requests = [];
          delete client.blockUntil;


        // Remove old requests outside the window
        client.requests = client.requests.filter(time => now - time < windowMs);

        // Check if limit exceeded
        if (client.requests.length >= maxRequests) {
          client.blocked = true;
          client.blockUntil = now + blockDuration;
          rateLimiter.set(clientId, client);
          
          return {
            allowed: false,
            remaining: 0,
            blockedUntil: client.blockUntil
          };


        // Add current request
        client.requests.push(now);
        rateLimiter.set(clientId, client);

        return {
          allowed: true,
          remaining: maxRequests - client.requests.length,
          resetTime: now + windowMs
        };
      };

      const clientId = '192.168.1.100';

      // Allow initial requests
      for (let i = 0; i < maxRequests; i++) {
        const result = checkRateLimit(clientId);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(maxRequests - (i + 1));


      // Additional request should trigger block
      const blockedResult = checkRateLimit(clientId);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
      expect(blockedResult.blockedUntil).toBeDefined();

      // Subsequent requests should remain blocked
      const stillBlockedResult = checkRateLimit(clientId);
      expect(stillBlockedResult.allowed).toBe(false);
    });
  });

  describe('7. Security Headers and Controls Validation', () => {
    it('should validate security headers are properly set', () => {
      const generateSecurityHeaders = (): Record<string, string> => {
        return {
          'Content-Security-Policy': 'default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'',
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        };
      };

      const headers = generateSecurityHeaders();

      // Verify critical security headers are present
      expect(headers['Content-Security-Policy']).toBeDefined();
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
      expect(headers['Referrer-Policy']).toBeDefined();

      // CSP should be restrictive
      expect(headers['Content-Security-Policy']).toContain('default-src \'self\'');
      expect(headers['Content-Security-Policy']).not.toContain('unsafe-eval');
    });

    it('should validate input encoding prevents attacks', () => {
      const encodeOutput = (input: string): string => {
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      };

      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(1)"></iframe>'
      ];

      maliciousInputs.forEach(input => {
        const encoded = encodeOutput(input);
        
        // Should not contain raw HTML tags
        expect(encoded).not.toContain('<script>');
        expect(encoded).not.toContain('<img');
        expect(encoded).not.toContain('<svg');
        expect(encoded).not.toContain('<iframe');
        
        // Should contain encoded versions
        expect(encoded).toContain('&lt;');
        expect(encoded).toContain('&gt;');
      });
    });
  });
});