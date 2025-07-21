/**
 * k6 Authentication Load Test
 *
 * Tests authentication endpoints under load including JWT token
 * management, OAuth flows, and session handling. Critical for
 * Epic 20 enterprise scaling with thousands of concurrent users.
 *
 * Covers:
 * - Login/logout cycles
 * - JWT token refresh patterns
 * - OAuth provider integration
 * - Session management under load
 * - Rate limiting behavior
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for authentication monitoring
const authErrors = new Counter('auth_errors');
const authLatency = new Trend('auth_latency');
const tokenRefreshRate = new Rate('token_refresh_success_rate');
const sessionValidationRate = new Rate('session_validation_success_rate');
const rateLimitViolations = new Counter('rate_limit_violations');

// Test configuration for authentication scalability
export const options = {
  stages: [
    // Simulate realistic authentication patterns
    { duration: '2m', target: 30 }, // Morning login rush
    { duration: '3m', target: 100 }, // Peak authentication load
    { duration: '5m', target: 200 }, // Enterprise scale authentication
    { duration: '3m', target: 300 }, // Stress test auth infrastructure
    { duration: '2m', target: 0 }, // Logout patterns
  ],

  // Authentication performance thresholds
  thresholds: {
    auth_errors: ['count<20'], // Less than 20 auth errors
    auth_latency: ['p(95)<1000'], // 95% of auth requests under 1s
    token_refresh_success_rate: ['rate>0.98'], // 98% token refresh success
    session_validation_success_rate: ['rate>0.99'], // 99% session validation
    rate_limit_violations: ['count<10'], // Minimal rate limiting issues

    // Standard HTTP performance
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.03'], // Less than 3% failure rate
  },
};

// Test user data for realistic authentication testing
const testUsers = [
  { username: 'testuser1@example.com', password: 'SecurePass123!' },
  { username: 'testuser2@example.com', password: 'SecurePass123!' },
  { username: 'testuser3@example.com', password: 'SecurePass123!' },
  { username: 'testuser4@example.com', password: 'SecurePass123!' },
  { username: 'testuser5@example.com', password: 'SecurePass123!' },
];

// OAuth provider configurations for testing
const oauthProviders = ['google', 'github', 'microsoft'];

// Simulate different user authentication patterns
function getAuthenticationPattern(userId) {
  const patterns = {
    frequent: {
      loginFrequency: 'high',
      sessionDuration: 'short', // 5-15 minutes
      tokenRefreshPattern: 'aggressive',
    },

    normal: {
      loginFrequency: 'medium',
      sessionDuration: 'medium', // 30-60 minutes
      tokenRefreshPattern: 'standard',
    },

    enterprise: {
      loginFrequency: 'low',
      sessionDuration: 'long', // 2-8 hours
      tokenRefreshPattern: 'conservative',
    },
  };

  if (userId % 5 === 0) return patterns.frequent;
  if (userId % 5 === 1 || userId % 5 === 2) return patterns.normal;
  return patterns.enterprise;
}

// Perform user login
function performLogin(user) {
  const startTime = Date.now();

  const loginResponse = http.post(
    'http://localhost:8000/auth/login',
    JSON.stringify({
      email: user.username,
      password: user.password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
      tags: { auth_action: 'login' },
    },
  );

  const loginTime = Date.now() - startTime;
  authLatency.add(loginTime);

  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token && body.refreshToken;
      } catch {
        return false;
      }
    },
    'login response time < 2s': (r) => r.timings.duration < 2000,
  });

  if (!loginSuccess) {
    authErrors.add(1);
    return null;
  }

  try {
    const loginData = JSON.parse(loginResponse.body);
    return {
      token: loginData.token,
      refreshToken: loginData.refreshToken,
      userId: loginData.userId,
    };
  } catch {
    authErrors.add(1);
    return null;
  }
}

// Validate session with current token
function validateSession(authData) {
  const startTime = Date.now();

  const validationResponse = http.get('http://localhost:8000/auth/validate', {
    headers: {
      Authorization: `Bearer ${authData.token}`,
      'Content-Type': 'application/json',
    },
    timeout: '5s',
    tags: { auth_action: 'validate' },
  });

  const validationTime = Date.now() - startTime;
  authLatency.add(validationTime);

  const isValid = validationResponse.status === 200;
  sessionValidationRate.add(isValid);

  if (!isValid && validationResponse.status === 429) {
    rateLimitViolations.add(1);
  }

  return isValid;
}

// Refresh JWT token
function refreshToken(authData) {
  const startTime = Date.now();

  const refreshResponse = http.post(
    'http://localhost:8000/auth/refresh',
    JSON.stringify({
      refreshToken: authData.refreshToken,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
      tags: { auth_action: 'refresh' },
    },
  );

  const refreshTime = Date.now() - startTime;
  authLatency.add(refreshTime);

  const refreshSuccess = refreshResponse.status === 200;
  tokenRefreshRate.add(refreshSuccess);

  if (!refreshSuccess) {
    if (refreshResponse.status === 429) {
      rateLimitViolations.add(1);
    }
    return null;
  }

  try {
    const refreshData = JSON.parse(refreshResponse.body);
    return {
      ...authData,
      token: refreshData.token,
      refreshToken: refreshData.refreshToken || authData.refreshToken,
    };
  } catch {
    return null;
  }
}

// Perform logout
function performLogout(authData) {
  const startTime = Date.now();

  const logoutResponse = http.post(
    'http://localhost:8000/auth/logout',
    JSON.stringify({
      refreshToken: authData.refreshToken,
    }),
    {
      headers: {
        Authorization: `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
      },
      timeout: '5s',
      tags: { auth_action: 'logout' },
    },
  );

  const logoutTime = Date.now() - startTime;
  authLatency.add(logoutTime);

  return logoutResponse.status === 200;
}

// Test OAuth flow initiation
function testOAuthFlow() {
  const provider = oauthProviders[Math.floor(Math.random() * oauthProviders.length)];

  const oauthResponse = http.get(`http://localhost:8000/auth/oauth/${provider}`, {
    timeout: '5s',
    tags: { auth_action: 'oauth_init', provider: provider },
  });

  // Should redirect to OAuth provider
  return check(oauthResponse, {
    'oauth redirect received': (r) => r.status === 302 || r.status === 200,
    'oauth response time < 1s': (r) => r.timings.duration < 1000,
  });
}

// Main authentication test function
export default function () {
  const userId = __VU;
  const user = testUsers[userId % testUsers.length];
  const pattern = getAuthenticationPattern(userId);

  console.log(
    `User ${userId} starting authentication test with ${pattern.loginFrequency} frequency pattern`,
  );

  // 1. Perform Login
  const authData = performLogin(user);
  if (!authData) {
    console.log(`Login failed for user ${userId}`);
    sleep(5); // Back off on login failure
    return;
  }

  console.log(`User ${userId} logged in successfully`);

  // 2. Simulate session activity with validation
  const sessionDuration =
    pattern.sessionDuration === 'short' ? 15 : pattern.sessionDuration === 'medium' ? 45 : 120; // seconds

  const sessionStart = Date.now();
  let currentAuthData = authData;

  while ((Date.now() - sessionStart) / 1000 < sessionDuration) {
    // Validate current session
    const isValid = validateSession(currentAuthData);

    if (!isValid) {
      console.log(`Session validation failed for user ${userId}, attempting token refresh`);

      // Attempt token refresh
      const refreshedData = refreshToken(currentAuthData);
      if (refreshedData) {
        currentAuthData = refreshedData;
        console.log(`Token refreshed successfully for user ${userId}`);
      } else {
        console.log(`Token refresh failed for user ${userId}, ending session`);
        break;
      }
    }

    // Simulate realistic user activity intervals
    sleep(Math.random() * 10 + 5); // 5-15 second intervals

    // Periodic token refresh based on pattern
    if (pattern.tokenRefreshPattern === 'aggressive' && Math.random() < 0.3) {
      const refreshedData = refreshToken(currentAuthData);
      if (refreshedData) {
        currentAuthData = refreshedData;
      }
    }
  }

  // 3. Test OAuth flow periodically (10% of users)
  if (userId % 10 === 0) {
    testOAuthFlow();
  }

  // 4. Perform Logout
  const logoutSuccess = performLogout(currentAuthData);
  if (logoutSuccess) {
    console.log(`User ${userId} logged out successfully`);
  } else {
    console.log(`Logout failed for user ${userId}`);
    authErrors.add(1);
  }

  // Brief pause between test cycles
  sleep(Math.random() * 3 + 1);
}

// Setup function
export function setup() {
  console.log('🔐 Starting Authentication Load Test');
  console.log('👤 Target: 300 concurrent authentication sessions');
  console.log('🎫 Testing: Login, logout, token refresh, OAuth flows');
  console.log('🏢 Epic 20: Enterprise authentication scalability');

  // Verify auth endpoints are accessible
  const healthResponse = http.get('http://localhost:8000/health');
  if (healthResponse.status !== 200) {
    console.error('❌ Server health check failed');
    throw new Error('Authentication server not accessible');
  }

  console.log('✅ Authentication server accessible');

  // Pre-create test users if needed (in real implementation)
  console.log('🔧 Using pre-configured test users for load testing');

  return { startTime: Date.now() };
}

// Teardown function
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🏁 Authentication load test completed in ${duration} seconds`);
  console.log('📊 Authentication metrics collected:');
  console.log('   - Login/logout performance');
  console.log('   - Token refresh reliability');
  console.log('   - Session validation success rates');
  console.log('   - OAuth flow performance');
  console.log('   - Rate limiting behavior');
  console.log('💡 Review thresholds for enterprise authentication readiness');
}
