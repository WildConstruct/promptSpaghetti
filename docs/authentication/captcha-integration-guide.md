# CAPTCHA Integration Guide

## Overview

This guide covers the integration of CAPTCHA and challenge systems into the PromptScape authentication framework. The system supports multiple CAPTCHA providers (reCAPTCHA, hCaptcha) as well as custom challenge types.

## Features

- **Multiple Challenge Types**: Math puzzles, text CAPTCHAs, pattern recognition, reCAPTCHA v2/v3, hCaptcha
- **Progressive Difficulty**: Challenges escalate based on risk score and failed attempts
- **Provider Integration**: Seamless integration with Google reCAPTCHA and hCaptcha
- **Risk-Based Activation**: Challenges are triggered based on calculated risk scores
- **Middleware Protection**: Automatic challenge enforcement on protected routes

## Configuration

### Environment Variables

```bash
# reCAPTCHA Configuration
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_V2_ENABLED=true
RECAPTCHA_V3_ENABLED=true
RECAPTCHA_V3_THRESHOLD=0.5

# hCaptcha Configuration
HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret-key
HCAPTCHA_ENABLED=true

# Challenge Settings
CHALLENGE_MAX_ATTEMPTS=3
CHALLENGE_EXPIRY_MINUTES=10
CHALLENGE_ESCALATION_ENABLED=true
CHALLENGE_ESCALATION_ATTEMPTS=3
CHALLENGE_ESCALATION_WINDOW=300
CHALLENGE_ESCALATE_AFTER=5
CHALLENGE_PROGRESSIVE_ENABLED=true

# Bypass Tokens (comma-separated, for testing)
CHALLENGE_BYPASS_TOKENS=test-token-1,test-token-2

# Admin Token
ADMIN_TOKEN=your-admin-token

# Trust Proxy (for proper IP detection)
TRUST_PROXY=true
```

## Server-Side Integration

### 1. Register Challenge Routes

Add the challenge routes to your Fastify server:

```typescript
import { challengeRoutes } from './auth/routes/challenge';

// Register challenge routes
await fastify.register(challengeRoutes, { prefix: '/auth' });
```

### 2. Configure Protected Routes

The middleware automatically protects configured routes:

```typescript
const challengeMiddleware = new ChallengeMiddleware({
  challengeService,
  rules: [
    {
      path: '/auth/login',
      method: 'POST',
      challengeType: ChallengeType.MATH_PUZZLE,
      riskThreshold: 0.3,
      conditions: [
        {
          type: 'failedAttempts',
          threshold: 3,
        },
      ],
    },
    {
      path: '/auth/register',
      method: 'POST',
      challengeType: ChallengeType.TEXT_CAPTCHA,
      difficulty: ChallengeDifficulty.MEDIUM,
      riskThreshold: 0.2,
    },
    {
      path: '/auth/password-reset',
      method: 'POST',
      challengeType: ChallengeType.RECAPTCHA_V2,
      riskThreshold: 0.1,
    },
  ],
});
```

### 3. Risk Score Calculation

The system calculates risk scores based on:

- Failed login attempts
- Request rate
- Time between requests
- Missing headers
- IP reputation (extensible)

## Client-Side Integration

### 1. React Component Usage

```tsx
import { ChallengeComponent } from './components/auth/ChallengeComponent';

function LoginForm() {
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const handleChallengeSuccess = (token: string) => {
    setChallengeToken(token);
    // Include token in login request
  };

  const handleChallengeError = (error: string) => {
    console.error('Challenge error:', error);
  };

  return (
    <div>
      {/* Your login form */}

      <ChallengeComponent
        onSuccess={handleChallengeSuccess}
        onError={handleChallengeError}
        challengeEndpoint="/auth/challenge"
        autoGenerate={true}
        theme="light"
      />
    </div>
  );
}
```

### 2. Manual Challenge Integration

For custom implementations:

```typescript
// Generate a challenge
const response = await fetch('/auth/challenge/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'text_captcha',
    difficulty: 'medium',
  }),
});

const { challenge } = await response.json();

// Validate the solution
const validateResponse = await fetch('/auth/challenge/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    challengeId: challenge.id,
    solution: userInput,
  }),
});

const { valid, token } = await validateResponse.json();
```

### 3. Including Challenge in Protected Requests

When a challenge is required, include the solution in your request:

```typescript
// Option 1: In request body
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    challengeId: 'ch_xxx',
    challengeSolution: 'solution',
  }),
});

// Option 2: In headers
const apiResponse = await fetch('/api/protected', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer xxx',
    'X-Challenge-Id': 'ch_xxx',
    'X-Challenge-Token': 'solution',
  },
});
```

## Challenge Types

### 1. Math Puzzle

Simple arithmetic problems with difficulty-based complexity:

- **Easy**: Basic addition/subtraction (1-20)
- **Medium**: Multiplication/division included
- **Hard**: Multi-step calculations with parentheses

### 2. Text CAPTCHA

Character recognition with noise:

- **Easy**: 4 characters, no noise
- **Medium**: 6 characters, minimal noise
- **Hard**: 8 characters with noise characters

### 3. Pattern Recognition

Complete the sequence challenges:

- Number sequences
- Letter patterns
- Mathematical progressions

### 4. reCAPTCHA v2

Traditional "I'm not a robot" checkbox with image challenges.

### 5. reCAPTCHA v3

Invisible risk analysis with score-based validation.

### 6. hCaptcha

Privacy-focused alternative to reCAPTCHA.

## API Endpoints

### Generate Challenge

```http
POST /auth/challenge/generate
Content-Type: application/json

{
  "type": "text_captcha",
  "difficulty": "medium",
  "context": {
    "action": "login",
    "resource": "user"
  }
}

Response:
{
  "success": true,
  "challenge": {
    "id": "ch_1234567890abcdef",
    "type": "text_captcha",
    "data": {
      "text": "Enter the characters: ABCD1234",
      "metadata": { "displayText": "ABCD1234" }
    },
    "expiresAt": "2024-01-20T15:30:00Z",
    "maxAttempts": 3
  }
}
```

### Validate Challenge

```http
POST /auth/challenge/validate
Content-Type: application/json

{
  "challengeId": "ch_1234567890abcdef",
  "solution": "ABCD1234"
}

Response (Success):
{
  "success": true,
  "valid": true,
  "token": "eyJjaGFsbGVuZ2VJZCI6...",
  "message": "Challenge completed successfully"
}

Response (Failure):
{
  "success": false,
  "valid": false,
  "error": "Incorrect solution",
  "remainingAttempts": 2,
  "escalationRequired": false
}
```

### Refresh Challenge

```http
POST /auth/challenge/refresh
Content-Type: application/json

{
  "challengeId": "ch_1234567890abcdef"
}

Response:
{
  "success": true,
  "challenge": {
    "id": "ch_0987654321fedcba",
    "type": "text_captcha",
    "data": { ... },
    "expiresAt": "2024-01-20T15:35:00Z",
    "maxAttempts": 3
  }
}
```

### Get Configuration

```http
GET /auth/challenge/config

Response:
{
  "success": true,
  "config": {
    "providers": {
      "recaptcha": {
        "v2Enabled": true,
        "v3Enabled": true,
        "siteKey": "6Lc..."
      },
      "hcaptcha": {
        "enabled": true,
        "siteKey": "10000000-ffff-ffff-ffff-000000000001"
      }
    },
    "types": ["math_puzzle", "text_captcha", ...],
    "difficulties": ["easy", "medium", "hard", "adaptive"]
  }
}
```

### Get Statistics (Admin)

```http
GET /auth/challenge/stats
X-Admin-Token: your-admin-token

Response:
{
  "success": true,
  "stats": {
    "totalChallenges": 1234,
    "successfulChallenges": 1100,
    "failedChallenges": 134,
    "averageCompletionTime": 15.7,
    "typeBreakdown": {
      "math_puzzle": 456,
      "text_captcha": 678,
      ...
    },
    "difficultyBreakdown": {
      "easy": 300,
      "medium": 700,
      "hard": 234
    },
    "suspiciousActivity": 23
  }
}
```

## Progressive Challenge System

The system can progressively increase challenge difficulty based on failed attempts:

```typescript
progressive: {
  enabled: true,
  stages: [
    {
      stage: 1,
      challengeType: ChallengeType.MATH_PUZZLE,
      difficulty: ChallengeDifficulty.EASY,
      triggerConditions: {
        failedAttempts: 1,
        timeWindow: 300 // 5 minutes
      },
      escalationDelay: 0
    },
    {
      stage: 2,
      challengeType: ChallengeType.TEXT_CAPTCHA,
      difficulty: ChallengeDifficulty.MEDIUM,
      triggerConditions: {
        failedAttempts: 3,
        timeWindow: 600 // 10 minutes
      },
      escalationDelay: 60 // 1 minute delay
    },
    {
      stage: 3,
      challengeType: ChallengeType.RECAPTCHA_V2,
      difficulty: ChallengeDifficulty.HARD,
      triggerConditions: {
        failedAttempts: 5,
        timeWindow: 900 // 15 minutes
      },
      escalationDelay: 300 // 5 minute delay
    }
  ]
}
```

## Testing

### Using Bypass Tokens

For testing environments, you can bypass challenges using special tokens:

```typescript
// Include bypass token in header
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Challenge-Bypass': 'test-token-1'
  },
  body: JSON.stringify({ ... })
});
```

### Test Challenge Solutions

For development/testing, here are some example solutions:

- **Math Puzzles**: Calculate the correct answer
- **Text CAPTCHA**: Read the displayed characters (excluding noise)
- **Pattern Recognition**: Complete the logical sequence

## Security Considerations

1. **Rate Limiting**: Combine with rate limiting for defense in depth
2. **IP Tracking**: The system tracks failed attempts by IP
3. **Token Security**: Challenge tokens are single-use and time-limited
4. **SSL/TLS**: Always use HTTPS in production
5. **Secret Keys**: Keep provider secret keys secure and rotate regularly

## Troubleshooting

### Common Issues

1. **"Challenge not found or expired"**
   - Challenges expire after the configured time (default: 10 minutes)
   - Ensure you're validating within the time window

2. **"Maximum attempts exceeded"**
   - Each challenge has limited attempts (default: 3)
   - Generate a new challenge after exhausting attempts

3. **External CAPTCHA not loading**
   - Check that site keys are correctly configured
   - Ensure CSP headers allow external scripts
   - Verify domain is registered with the provider

4. **High risk scores for legitimate users**
   - Adjust risk thresholds in configuration
   - Check if proxy/VPN detection is too aggressive
   - Review failed attempt tracking window

## Monitoring

Monitor challenge metrics for security insights:

- Success/failure rates by challenge type
- Average completion times
- Suspicious activity patterns
- Geographic distribution of challenges

Use the `/auth/challenge/stats` endpoint to retrieve these metrics.
