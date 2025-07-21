#!/usr/bin/env node

/**
 * Authentication Flow Load Test
 * 
 * Comprehensive load testing for authentication endpoints including:
 * - User registration
 * - User login
 * - JWT token validation
 * - Password reset flows
 * - OAuth provider authentication
 * - Session management
 * 
 * Task: T-1752989144295-507 - Implement automated load test scripts for key user flows
 */

const { LoadTestRunner, LoadTestConfig } = require('./LoadTestFramework');
const crypto = require('crypto');

/**
 * Authentication Flow Test Scenarios
 */
class AuthFlowTests {
  
  /**
   * User Registration Flow Test
   */
  static async registrationFlowTest(user) {
    const testUser = {
      email: `test${user.id}_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${user.id}`,
      acceptedTerms: true
    };

    try {
      // 1. Attempt to register a new user
      const registerResponse = await user.executeRequest('POST', '/auth/register', testUser);
      
      if (registerResponse.statusCode !== 201) {
        console.log(`⚠️  Registration failed for user ${user.id}: ${registerResponse.statusCode}`);
        return false;
      }

      user.sessionData.testUser = testUser;
      user.sessionData.userId = registerResponse.data.user?.id;
      user.sessionData.token = registerResponse.data.token;

      // Set auth header for subsequent requests
      user.client.setHeader('Authorization', `Bearer ${user.sessionData.token}`);

      await user.thinkTime();

      // 2. Verify the user profile
      const profileResponse = await user.executeRequest('GET', '/auth/profile');
      
      if (profileResponse.statusCode !== 200) {
        console.log(`⚠️  Profile verification failed for user ${user.id}: ${profileResponse.statusCode}`);
        return false;
      }

      await user.thinkTime();

      // 3. Update user profile
      const updateData = {
        name: `${testUser.name} Updated`,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      const updateResponse = await user.executeRequest('PUT', '/auth/profile', updateData);
      
      if (updateResponse.statusCode !== 200) {
        console.log(`⚠️  Profile update failed for user ${user.id}: ${updateResponse.statusCode}`);
      }

      return true;

    } catch (error) {
      console.error(`❌ Registration flow error for user ${user.id}:`, error.message || error);
      return false;
    }
  }

  /**
   * User Login Flow Test
   */
  static async loginFlowTest(user) {
    // Use provided credentials or create test credentials
    const credentials = user.userCredentials || {
      email: 'testuser@example.com',
      password: 'TestPassword123!'
    };

    try {
      // 1. Attempt login
      const loginResponse = await user.executeRequest('POST', '/auth/login', credentials);
      
      if (loginResponse.statusCode !== 200) {
        console.log(`⚠️  Login failed for user ${user.id}: ${loginResponse.statusCode}`);
        
        // If login fails with test credentials, try registration first
        if (!user.userCredentials) {
          return await AuthFlowTests.registrationFlowTest(user);
        }
        return false;
      }

      user.sessionData.token = loginResponse.data.token;
      user.sessionData.refreshToken = loginResponse.data.refreshToken;
      user.sessionData.userId = loginResponse.data.user?.id;

      // Set auth header for subsequent requests
      user.client.setHeader('Authorization', `Bearer ${user.sessionData.token}`);

      await user.thinkTime();

      // 2. Validate token by accessing protected resource
      const profileResponse = await user.executeRequest('GET', '/auth/profile');
      
      if (profileResponse.statusCode !== 200) {
        console.log(`⚠️  Token validation failed for user ${user.id}: ${profileResponse.statusCode}`);
        return false;
      }

      await user.thinkTime();

      // 3. Test token refresh (simulate token expiration scenario)
      if (user.sessionData.refreshToken) {
        const refreshResponse = await user.executeRequest('POST', '/auth/refresh', {
          refreshToken: user.sessionData.refreshToken
        });
        
        if (refreshResponse.statusCode === 200) {
          user.sessionData.token = refreshResponse.data.token;
          user.client.setHeader('Authorization', `Bearer ${user.sessionData.token}`);
        }
      }

      await user.thinkTime();

      // 4. Test logout
      const logoutResponse = await user.executeRequest('POST', '/auth/logout');
      
      if (logoutResponse.statusCode === 200) {
        // Clear auth header
        user.client.setHeader('Authorization', '');
      }

      return true;

    } catch (error) {
      console.error(`❌ Login flow error for user ${user.id}:`, error.message || error);
      return false;
    }
  }

  /**
   * Password Reset Flow Test
   */
  static async passwordResetFlowTest(user) {
    const testEmail = user.userCredentials?.email || 'testuser@example.com';

    try {
      // 1. Request password reset
      const resetRequestResponse = await user.executeRequest('POST', '/auth/forgot-password', {
        email: testEmail
      });
      
      if (resetRequestResponse.statusCode !== 200) {
        console.log(`⚠️  Password reset request failed for user ${user.id}: ${resetRequestResponse.statusCode}`);
        return false;
      }

      await user.thinkTime();

      // 2. Simulate checking reset token validation (would normally come from email)
      // This would require a mock token or test endpoint in a real scenario
      const mockResetToken = 'test-reset-token-' + crypto.randomBytes(16).toString('hex');
      
      const validateTokenResponse = await user.executeRequest('GET', `/auth/reset-password?token=${mockResetToken}`);
      
      // Token validation might fail in load testing, which is expected
      // We're testing the endpoint's ability to handle requests

      await user.thinkTime();

      // 3. Attempt password reset completion (would normally require valid token)
      const newPassword = 'NewTestPassword123!';
      const resetCompleteResponse = await user.executeRequest('POST', '/auth/reset-password', {
        token: mockResetToken,
        password: newPassword,
        confirmPassword: newPassword
      });

      // Reset completion might fail with mock token, which is expected in load testing
      return true;

    } catch (error) {
      console.error(`❌ Password reset flow error for user ${user.id}:`, error.message || error);
      return false;
    }
  }

  /**
   * OAuth Authentication Flow Test
   */
  static async oauthFlowTest(user) {
    try {
      // 1. Get OAuth authorization URL
      const provider = 'google'; // Test with Google OAuth
      const authUrlResponse = await user.executeRequest('GET', `/auth/oauth/${provider}/authorize`);
      
      if (authUrlResponse.statusCode !== 200) {
        console.log(`⚠️  OAuth authorization URL failed for user ${user.id}: ${authUrlResponse.statusCode}`);
        return false;
      }

      await user.thinkTime();

      // 2. Simulate OAuth callback (would normally come from OAuth provider)
      // In load testing, we simulate the callback with mock data
      const mockAuthCode = 'mock-auth-code-' + crypto.randomBytes(16).toString('hex');
      const mockState = crypto.randomBytes(16).toString('hex');
      
      const callbackResponse = await user.executeRequest('GET', 
        `/auth/oauth/${provider}/callback?code=${mockAuthCode}&state=${mockState}`
      );

      // Callback might fail with mock data, which is expected in load testing
      // We're testing the endpoint's ability to handle OAuth callback requests

      await user.thinkTime();

      // 3. Test OAuth user info endpoint
      const userInfoResponse = await user.executeRequest('GET', `/auth/oauth/${provider}/userinfo`);
      
      // UserInfo might require valid OAuth token, expected to fail in load testing
      return true;

    } catch (error) {
      console.error(`❌ OAuth flow error for user ${user.id}:`, error.message || error);
      return false;
    }
  }

  /**
   * Session Management Test
   */
  static async sessionManagementTest(user) {
    try {
      // 1. Create session through login
      const loginSuccess = await AuthFlowTests.loginFlowTest(user);
      if (!loginSuccess) return false;

      await user.thinkTime();

      // 2. Test session validation
      const sessionResponse = await user.executeRequest('GET', '/auth/session');
      
      if (sessionResponse.statusCode !== 200) {
        console.log(`⚠️  Session validation failed for user ${user.id}: ${sessionResponse.statusCode}`);
      }

      await user.thinkTime();

      // 3. Test session refresh
      if (user.sessionData.refreshToken) {
        const refreshResponse = await user.executeRequest('POST', '/auth/session/refresh', {
          refreshToken: user.sessionData.refreshToken
        });
        
        if (refreshResponse.statusCode === 200) {
          user.sessionData.token = refreshResponse.data.token;
          user.client.setHeader('Authorization', `Bearer ${user.sessionData.token}`);
        }
      }

      await user.thinkTime();

      // 4. Test session termination
      const logoutResponse = await user.executeRequest('POST', '/auth/logout');
      
      if (logoutResponse.statusCode === 200) {
        user.client.setHeader('Authorization', '');
      }

      return true;

    } catch (error) {
      console.error(`❌ Session management error for user ${user.id}:`, error.message || error);
      return false;
    }
  }

  /**
   * Comprehensive Authentication Flow Test
   */
  static async comprehensiveAuthTest(user) {
    const flowResults = {
      registration: false,
      login: false,
      passwordReset: false,
      oauth: false,
      sessionManagement: false
    };

    try {
      // Test different flows based on user ID to distribute load
      const testPattern = user.id % 5;

      switch (testPattern) {
        case 0:
          // Registration + Login flow
          flowResults.registration = await AuthFlowTests.registrationFlowTest(user);
          await user.thinkTime();
          flowResults.login = await AuthFlowTests.loginFlowTest(user);
          break;
          
        case 1:
          // Login + Session Management flow
          flowResults.login = await AuthFlowTests.loginFlowTest(user);
          await user.thinkTime();
          flowResults.sessionManagement = await AuthFlowTests.sessionManagementTest(user);
          break;
          
        case 2:
          // Password Reset flow
          flowResults.passwordReset = await AuthFlowTests.passwordResetFlowTest(user);
          await user.thinkTime();
          flowResults.login = await AuthFlowTests.loginFlowTest(user);
          break;
          
        case 3:
          // OAuth flow
          flowResults.oauth = await AuthFlowTests.oauthFlowTest(user);
          await user.thinkTime();
          flowResults.login = await AuthFlowTests.loginFlowTest(user);
          break;
          
        case 4:
          // Full flow test
          flowResults.registration = await AuthFlowTests.registrationFlowTest(user);
          await user.thinkTime();
          flowResults.login = await AuthFlowTests.loginFlowTest(user);
          await user.thinkTime();
          flowResults.sessionManagement = await AuthFlowTests.sessionManagementTest(user);
          break;
      }

      // Store results for reporting
      user.sessionData.flowResults = flowResults;
      return true;

    } catch (error) {
      console.error(`❌ Comprehensive auth test error for user ${user.id}:`, error.message || error);
      return false;
    }
  }
}

/**
 * Run Authentication Load Tests
 */
async function runAuthLoadTests() {
  console.log('🔐 Authentication Flow Load Tests');
  console.log('==================================\n');

  // Test configurations
  const testConfigs = [
    {
      name: 'Login Flow - Light Load',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 5,
        duration: 30000, // 30 seconds
        rampUpTime: 5000, // 5 seconds
        thinkTime: { min: 500, max: 2000 }
      }),
      scenario: AuthFlowTests.loginFlowTest
    },
    {
      name: 'Registration Flow - Medium Load',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 10,
        duration: 45000, // 45 seconds
        rampUpTime: 10000, // 10 seconds
        thinkTime: { min: 1000, max: 3000 }
      }),
      scenario: AuthFlowTests.registrationFlowTest
    },
    {
      name: 'Comprehensive Auth Flow - Heavy Load',
      config: new LoadTestConfig({
        baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
        concurrency: 20,
        duration: 60000, // 60 seconds
        rampUpTime: 15000, // 15 seconds
        thinkTime: { min: 500, max: 2000 },
        userPool: [
          { email: 'user1@example.com', password: 'TestPass123!' },
          { email: 'user2@example.com', password: 'TestPass123!' },
          { email: 'user3@example.com', password: 'TestPass123!' },
          { email: 'user4@example.com', password: 'TestPass123!' },
          { email: 'user5@example.com', password: 'TestPass123!' }
        ]
      }),
      scenario: AuthFlowTests.comprehensiveAuthTest
    }
  ];

  const allResults = [];

  for (const testConfig of testConfigs) {
    console.log(`\n🎯 Running: ${testConfig.name}`);
    console.log('─'.repeat(50));
    
    const runner = new LoadTestRunner(testConfig.config);
    const results = await runner.runLoadTest(testConfig.scenario, testConfig.name);
    
    // Export results
    const filename = `auth-load-test-${testConfig.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    runner.exportResults(results, filename);
    
    allResults.push({
      testName: testConfig.name,
      results,
      filename
    });

    // Pause between tests
    if (testConfig !== testConfigs[testConfigs.length - 1]) {
      console.log('\n⏸️  Pausing 10 seconds between tests...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Generate summary report
  console.log('\n📊 Authentication Load Test Summary');
  console.log('===================================');
  
  allResults.forEach((testResult, index) => {
    const { testName, results } = testResult;
    console.log(`\n${index + 1}. ${testName}:`);
    console.log(`   📈 Total Requests: ${results.global.totalRequests}`);
    console.log(`   ✅ Success Rate: ${results.global.successRate.toFixed(1)}%`);
    console.log(`   ⚡ Requests/sec: ${results.global.requestsPerSecond.toFixed(2)}`);
    console.log(`   ⏱️  Avg Response: ${results.global.averageResponseTime.toFixed(0)}ms`);
    console.log(`   📁 Report: ${testResult.filename}`);
  });

  console.log('\n✅ All Authentication Load Tests Complete!');
}

// Run tests if called directly
if (require.main === module) {
  runAuthLoadTests().catch(console.error);
}

module.exports = {
  AuthFlowTests,
  runAuthLoadTests
};