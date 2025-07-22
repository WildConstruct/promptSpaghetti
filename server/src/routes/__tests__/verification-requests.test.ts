/**
 * Verification Request API Tests - E17-1753114397395-B624E7
 */

import { FastifyInstance } from 'fastify';
import { build } from '../../test-utils/app';
import { registerVerificationRoutes } from '../verification-requests';

describe('Verification Request API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = build();
    registerVerificationRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/verification/submit', () => {
    const validRequestBody = {
      userId: 'user-123',
      verificationType: 'email_verification',
      data: { email: 'test@example.com' },
      metadata: {
        requestSource: 'manual_request'
      }
    };

    test('successfully submits email verification request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: validRequestBody
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        requestId: expect.any(String),
        status: 'pending',
        verificationType: 'email_verification',
        submittedAt: expect.any(String)
      });
      expect(result.message).toBe('Verification request submitted successfully');
    });

    test('validates required fields', async () => {
      const invalidRequest = {
        userId: 'user-123'
        // Missing verificationType and data
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: invalidRequest
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('Missing required fields');
      expect(result.message).toBe('userId, verificationType, and data are required');
    });

    test('handles phone verification request', async () => {
      const phoneRequest = {
        userId: 'user-123',
        verificationType: 'phone_verification',
        data: { phoneNumber: '+1234567890' }
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: phoneRequest
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.data.verificationType).toBe('phone_verification');
    });

    test('handles government ID verification request', async () => {
      const idRequest = {
        userId: 'user-123',
        verificationType: 'government_id',
        data: {
          governmentId: {
            type: 'passport',
            number: 'AB123456',
            expirationDate: '2025-12-31',
            issuingAuthority: 'US State Department',
            documentImages: ['base64-image-data']
          }
        }
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: idRequest
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.data.verificationType).toBe('government_id');
    });

    test('includes metadata in request', async () => {
      const requestWithMetadata = {
        ...validRequestBody,
        metadata: {
          ipAddress: '192.168.1.1',
          userAgent: 'TestAgent/1.0',
          sessionId: 'session-abc',
          requestSource: 'profile_setup'
        }
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: requestWithMetadata,
        headers: {
          'user-agent': 'TestAgent/1.0'
        }
      });

      expect(response.statusCode).toBe(201);
    });

    test('handles server errors gracefully', async () => {
      // Mock a scenario that would cause an error
      const invalidRequest = {
        userId: null, // Invalid userId
        verificationType: 'email_verification',
        data: { email: 'test@example.com' }
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: invalidRequest
      });

      expect(response.statusCode).toBe(500);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('GET /api/verification/status/:userId', () => {
    beforeEach(async () => {
      // Submit a test verification request
      await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: {
          userId: 'user-status-test',
          verificationType: 'email_verification',
          data: { email: 'status-test@example.com' }
        }
      });
    });

    test('returns user verification summary', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/status/user-status-test'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('summary');
      expect(result.data).toHaveProperty('requests');
      expect(result.data.summary).toMatchObject({
        totalRequests: expect.any(Number),
        approvedCount: expect.any(Number),
        pendingCount: expect.any(Number),
        rejectedCount: expect.any(Number)
      });
    });

    test('validates userId parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/status/'
      });

      expect(response.statusCode).toBe(404); // Route not found for empty userId
    });

    test('returns empty data for user with no verifications', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/status/nonexistent-user'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.data.summary.totalRequests).toBe(0);
      expect(result.data.requests).toHaveLength(0);
    });
  });

  describe('GET /api/verification/status/:userId/:requestId', () => {
    let requestId: string;

    beforeEach(async () => {
      // Submit a test verification request and capture the ID
      const submitResponse = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: {
          userId: 'user-specific-test',
          verificationType: 'email_verification',
          data: { email: 'specific-test@example.com' }
        }
      });

      const submitResult = JSON.parse(submitResponse.payload);
      requestId = submitResult.data.requestId;
    });

    test('returns specific request details', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/verification/status/user-specific-test/${requestId}`
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('request');
      expect(result.data.request.requestId).toBe(requestId);
    });

    test('returns 404 for nonexistent request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/status/user-specific-test/nonexistent-request'
      });

      expect(response.statusCode).toBe(404);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('Verification request not found');
    });
  });

  describe('GET /api/verification/trust-score/:userId', () => {
    test('returns 404 for user with no trust score', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/trust-score/new-user'
      });

      expect(response.statusCode).toBe(404);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('Trust score not found');
    });

    test('validates userId parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/trust-score/'
      });

      expect(response.statusCode).toBe(404); // Route not found
    });
  });

  describe('GET /api/verification/result/:requestId', () => {
    test('returns 404 for nonexistent validation result', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/result/nonexistent-request'
      });

      expect(response.statusCode).toBe(404);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('Validation result not found');
    });

    test('validates requestId parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/result/'
      });

      expect(response.statusCode).toBe(404); // Route not found
    });
  });

  describe('GET /api/verification/types', () => {
    test('returns available verification types', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/types'
      });

      expect(response.statusCode).toBe(200);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      
      // Check structure of verification type data
      const emailVerification = result.data.find(type => type.type === 'email_verification');
      expect(emailVerification).toMatchObject({
        type: 'email_verification',
        title: 'Email Verification',
        description: expect.any(String),
        required: true,
        estimatedTime: expect.any(String),
        requirements: expect.any(Array),
        fields: expect.any(Array)
      });
    });

    test('includes all expected verification types', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/types'
      });

      const result = JSON.parse(response.payload);
      const typeNames = result.data.map(type => type.type);
      
      expect(typeNames).toContain('email_verification');
      expect(typeNames).toContain('phone_verification');
      expect(typeNames).toContain('government_id');
      expect(typeNames).toContain('professional_credentials');
      expect(typeNames).toContain('social_media_verification');
    });
  });

  describe('POST /api/verification/upload/:requestId', () => {
    let requestId: string;

    beforeEach(async () => {
      // Create a verification request first
      const submitResponse = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: {
          userId: 'user-upload-test',
          verificationType: 'government_id',
          data: {
            governmentId: {
              type: 'passport',
              number: 'AB123456',
              expirationDate: '2025-12-31',
              issuingAuthority: 'US State Department',
              documentImages: []
            }
          }
        }
      });

      const submitResult = JSON.parse(submitResponse.payload);
      requestId = submitResult.data.requestId;
    });

    test('successfully uploads documents', async () => {
      const uploadData = {
        files: [
          {
            name: 'passport.jpg',
            type: 'image/jpeg',
            data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD' // Mock base64 data
          }
        ]
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/verification/upload/${requestId}`,
        payload: uploadData
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.data.requestId).toBe(requestId);
      expect(result.data.uploadedFiles).toHaveLength(1);
      expect(result.data.uploadedFiles[0]).toMatchObject({
        id: expect.any(String),
        name: 'passport.jpg',
        type: 'image/jpeg',
        size: expect.any(Number),
        url: expect.any(String),
        uploadedAt: expect.any(String)
      });
    });

    test('validates file types', async () => {
      const uploadData = {
        files: [
          {
            name: 'document.txt',
            type: 'text/plain',
            data: 'data:text/plain;base64,dGVzdA=='
          }
        ]
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/verification/upload/${requestId}`,
        payload: uploadData
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('File type text/plain is not allowed');
      expect(result.allowedTypes).toContain('image/jpeg');
      expect(result.allowedTypes).toContain('application/pdf');
    });

    test('validates file sizes', async () => {
      // Create a large base64 string (simulating > 10MB)
      const largeData = 'data:image/jpeg;base64,' + 'A'.repeat(15 * 1024 * 1024);
      
      const uploadData = {
        files: [
          {
            name: 'large-image.jpg',
            type: 'image/jpeg',
            data: largeData
          }
        ]
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/verification/upload/${requestId}`,
        payload: uploadData
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toContain('exceeds maximum size of 10MB');
    });

    test('validates requestId parameter', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/upload/',
        payload: { files: [] }
      });

      expect(response.statusCode).toBe(404); // Route not found
    });

    test('requires files in request body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/verification/upload/${requestId}`,
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('No files provided');
    });

    test('handles multiple file uploads', async () => {
      const uploadData = {
        files: [
          {
            name: 'front.jpg',
            type: 'image/jpeg',
            data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'
          },
          {
            name: 'back.jpg',
            type: 'image/jpeg',
            data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'
          }
        ]
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/verification/upload/${requestId}`,
        payload: uploadData
      });

      expect(response.statusCode).toBe(201);
      
      const result = JSON.parse(response.payload);
      expect(result.data.uploadedFiles).toHaveLength(2);
      expect(result.data.message).toBe('Successfully uploaded 2 document(s)');
    });
  });

  describe('Error Handling', () => {
    test('handles malformed JSON requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: 'invalid json'
      });

      expect(response.statusCode).toBe(400);
    });

    test('handles requests with missing content-type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/verification/submit',
        payload: JSON.stringify({
          userId: 'test',
          verificationType: 'email_verification',
          data: { email: 'test@example.com' }
        }),
        headers: {
          // No content-type header
        }
      });

      // Should still work with Fastify's auto-parsing
      expect([200, 201, 400]).toContain(response.statusCode);
    });
  });

  describe('Rate Limiting and Security', () => {
    test('handles rapid successive requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        app.inject({
          method: 'POST',
          url: '/api/verification/submit',
          payload: {
            userId: `rapid-user-${i}`,
            verificationType: 'email_verification',
            data: { email: `rapid${i}@example.com` }
          }
        })
      );

      const responses = await Promise.all(requests);
      
      // All requests should be handled (no rate limiting in this basic implementation)
      responses.forEach(response => {
        expect([201, 429]).toContain(response.statusCode); // 201 success or 429 rate limited
      });
    });

    test('sanitizes error messages to prevent information leakage', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/verification/status/../../etc/passwd' // Path traversal attempt
      });

      const result = JSON.parse(response.payload);
      
      // Should not leak system information
      if (result.error) {
        expect(result.error).not.toContain('/etc/passwd');
        expect(result.error).not.toContain('../../');
      }
    });
  });
});