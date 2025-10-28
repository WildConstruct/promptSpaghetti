# Epic 16 Referral Detection System

## Overview

The Epic 16 Referral Detection System is a comprehensive solution for tracking, analyzing, and managing referral campaigns within the marketplace platform. It provides advanced fraud detection, multi-channel attribution modeling, automated reward calculation, and real-time analytics for optimizing referral program performance.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Features](#core-features)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Fraud Detection](#fraud-detection)
- [Attribution Models](#attribution-models)
- [Campaign Management](#campaign-management)
- [Reward System](#reward-system)
- [Analytics & Reporting](#analytics--reporting)
- [Installation & Setup](#installation--setup)
- [Usage Examples](#usage-examples)
- [CLI Reference](#cli-reference)
- [Testing](#testing)
- [Performance Monitoring](#performance-monitoring)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

The Referral Detection System consists of several interconnected components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Analytics API  │    │  Admin Console  │
│   Components    │    │    Endpoints    │    │   Dashboard     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │           Referral Detection Service            │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
         │  │  Tracking   │  │   Fraud     │  │  Reward     ││
         │  │   Engine    │  │ Detection   │  │ Calculator  ││
         │  └─────────────┘  └─────────────┘  └─────────────┘│
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
         │  │ Attribution │  │  Campaign   │  │  Analytics  ││
         │  │   Models    │  │ Management  │  │   Engine    ││
         │  └─────────────┘  └─────────────┘  └─────────────┘│
         └─────────────────────┬───────────────────────────────┘
                               │
         ┌─────────────────────────────────────────────────┐
         │              Database Layer                     │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
         │  │ Referral    │  │ Campaigns   │  │  Rewards    ││
         │  │ Tracking    │  │   & Rules   │  │ & Analytics ││
         │  └─────────────┘  └─────────────┘  └─────────────┘│
         └─────────────────────────────────────────────────┘
```

### Key Components

1. **Referral Tracking Engine**: Captures and processes referral data
2. **Fraud Detection Module**: Identifies and prevents fraudulent activities
3. **Attribution Models**: Calculates conversion attribution across touchpoints
4. **Campaign Management**: Handles referral program configuration
5. **Reward Calculator**: Computes and processes referral rewards
6. **Analytics Engine**: Generates performance insights and reports

## Core Features

### Multi-Channel Referral Tracking

- Direct links, social media, email campaigns, search engines
- UTM parameter support for detailed attribution
- Device fingerprinting and session management
- Geographic tracking with timezone support

### Advanced Fraud Detection

- Real-time risk scoring with configurable thresholds
- IP velocity monitoring and anomaly detection
- Device fingerprint analysis for duplicate detection
- Geographic and temporal pattern analysis
- Machine learning-based behavioral analysis

### Attribution Modeling

- **First Touch**: Full credit to first referral interaction
- **Last Touch**: Full credit to final referral interaction
- **Linear**: Equal credit distributed across all touchpoints
- **Time Decay**: Recent interactions weighted higher
- **Position-Based**: Configurable weighting (e.g., 40% first, 40% last, 20% middle)
- **Data-Driven**: ML-based attribution using conversion patterns

### Campaign Management

- Flexible reward structures (percentage, fixed, tiered, progressive)
- Geographic and demographic targeting
- A/B testing support with performance tracking
- Automated campaign lifecycle management
- ROI calculation and optimization recommendations

### Real-Time Analytics

- Live dashboard with key performance indicators
- Conversion funnel analysis with drop-off insights
- Fraud detection metrics and alerts
- Revenue attribution and ROI tracking
- Custom report generation with multiple export formats

## Database Schema

### Core Tables

#### referral_campaigns

Stores campaign configuration and performance metrics.

```sql
CREATE TABLE referral_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- affiliate, influencer, partnership, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    reward_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, tiered, progressive
    reward_value DECIMAL(10,4) NOT NULL,
    reward_currency VARCHAR(3) DEFAULT 'USD',
    max_reward_per_referrer DECIMAL(10,2),
    total_referrals INTEGER DEFAULT 0,
    successful_conversions INTEGER DEFAULT 0,
    total_reward_paid DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### referral_tracking

Main tracking table for all referral interactions.

```sql
CREATE TABLE referral_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code VARCHAR(50) NOT NULL,
    campaign_id UUID REFERENCES referral_campaigns(id),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_user_id UUID REFERENCES users(id),
    source VARCHAR(50) NOT NULL, -- direct_link, social_media, etc.
    source_url TEXT,
    landing_page TEXT NOT NULL,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    user_agent TEXT,
    ip_address INET NOT NULL,
    device_fingerprint VARCHAR(100),
    session_id UUID NOT NULL,
    country CHAR(2),
    region VARCHAR(50),
    city VARCHAR(50),
    timezone VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    fraud_risk_level VARCHAR(20) DEFAULT 'low',
    fraud_risk_score DECIMAL(5,2) DEFAULT 0,
    fraud_indicators JSONB DEFAULT '{}',
    conversion_event VARCHAR(100),
    conversion_value DECIMAL(10,2),
    conversion_date TIMESTAMP WITH TIME ZONE,
    attribution_model VARCHAR(50) DEFAULT 'last_touch',
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### referral_rewards

Tracks reward calculations and payouts.

```sql
CREATE TABLE referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referral_tracking(id),
    campaign_id UUID NOT NULL REFERENCES referral_campaigns(id),
    referrer_id UUID NOT NULL REFERENCES users(id),
    reward_type VARCHAR(50) NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    multiplier DECIMAL(5,2) DEFAULT 1.0,
    final_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    calculation_method VARCHAR(100),
    calculation_details JSONB DEFAULT '{}',
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Analytics Tables

#### referral_daily_analytics

Daily aggregated metrics for performance monitoring.

```sql
CREATE TABLE referral_daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    campaign_id UUID REFERENCES referral_campaigns(id),
    total_clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    conversion_value DECIMAL(12,2) DEFAULT 0,
    fraud_attempts INTEGER DEFAULT 0,
    rewards_earned DECIMAL(12,2) DEFAULT 0,
    active_referrers INTEGER DEFAULT 0,
    top_countries JSONB DEFAULT '{}',
    source_breakdown JSONB DEFAULT '{}',
    utm_performance JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, campaign_id)
);
```

### Performance Indexes

```sql
-- Primary lookup indexes
CREATE INDEX CONCURRENTLY idx_referral_tracking_referrer_id ON referral_tracking(referrer_id);
CREATE INDEX CONCURRENTLY idx_referral_tracking_referral_code ON referral_tracking(referral_code);
CREATE INDEX CONCURRENTLY idx_referral_tracking_ip_address ON referral_tracking(ip_address);
CREATE INDEX CONCURRENTLY idx_referral_tracking_device_fingerprint ON referral_tracking(device_fingerprint);

-- Time-based indexes for analytics
CREATE INDEX CONCURRENTLY idx_referral_tracking_clicked_at ON referral_tracking(clicked_at);
CREATE INDEX CONCURRENTLY idx_referral_tracking_conversion_date ON referral_tracking(conversion_date);

-- Fraud detection indexes
CREATE INDEX CONCURRENTLY idx_referral_tracking_fraud_risk_level ON referral_tracking(fraud_risk_level);
CREATE INDEX CONCURRENTLY idx_referral_tracking_fraud_risk_score ON referral_tracking(fraud_risk_score);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_referral_tracking_status_created ON referral_tracking(status, clicked_at);
CREATE INDEX CONCURRENTLY idx_referral_tracking_campaign_status ON referral_tracking(campaign_id, status);
```

## API Documentation

### Core Endpoints

#### POST /api/referrals/track

Track a new referral interaction.

**Request Body:**

```json
{
  "referralCode": "REF-12345",
  "referrerId": "user-uuid",
  "campaignId": "campaign-uuid",
  "source": "social_media",
  "sourceUrl": "https://twitter.com/...",
  "landingPage": "https://marketplace.com/templates/123",
  "utmSource": "twitter",
  "utmMedium": "social",
  "utmCampaign": "summer-promo",
  "ipAddress": "192.168.1.1",
  "deviceFingerprint": "device-hash",
  "country": "US",
  "userAgent": "Mozilla/5.0...",
  "conversionValue": 150.0,
  "conversionEvent": "purchase"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "referralId": "referral-uuid",
    "status": "verified",
    "fraudRiskLevel": "low",
    "fraudRiskScore": 15.0,
    "clickedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-02-14T10:30:00Z"
  }
}
```

#### GET /api/referrals/{referralId}

Retrieve details for a specific referral.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "referral-uuid",
    "referralCode": "REF-12345",
    "campaignId": "campaign-uuid",
    "referrerId": "user-uuid",
    "status": "verified",
    "source": "social_media",
    "fraudRiskLevel": "low",
    "fraudRiskScore": 15.0,
    "conversionValue": 150.0,
    "rewardCalculated": true,
    "clickedAt": "2024-01-15T10:30:00Z",
    "conversionDate": "2024-01-15T11:45:00Z"
  }
}
```

#### POST /api/campaigns

Create a new referral campaign.

**Request Body:**

```json
{
  "name": "Summer Promotion 2024",
  "description": "Special summer referral campaign",
  "campaignType": "affiliate",
  "rewardType": "percentage",
  "rewardValue": 15.0,
  "rewardCurrency": "USD",
  "maxRewardPerReferrer": 1000.0,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "targetAudience": {
    "regions": ["US", "CA"],
    "userTypes": ["creator", "buyer"]
  }
}
```

#### GET /api/analytics/dashboard

Retrieve dashboard analytics for referral performance.

**Query Parameters:**

- `campaignId` (optional): Filter by specific campaign
- `startDate`: Start date for analytics period
- `endDate`: End date for analytics period
- `granularity`: Data granularity (daily, weekly, monthly)

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalReferrals": 1250,
      "uniqueReferrers": 850,
      "conversionRate": 12.5,
      "totalRevenue": 45750.0,
      "fraudRate": 2.1
    },
    "trends": {
      "daily": [
        {
          "date": "2024-01-15",
          "referrals": 45,
          "conversions": 6,
          "revenue": 890.0
        }
      ]
    },
    "topSources": [
      { "source": "social_media", "count": 450, "conversionRate": 15.2 },
      { "source": "email_campaign", "count": 380, "conversionRate": 18.7 }
    ],
    "fraudAnalysis": {
      "riskDistribution": {
        "low": 1100,
        "medium": 120,
        "high": 25,
        "critical": 5
      },
      "topIndicators": {
        "ipVelocity": 15,
        "deviceReuse": 8,
        "geographicAnomaly": 12
      }
    }
  }
}
```

## Fraud Detection

### Risk Scoring Algorithm

The fraud detection system uses a multi-factor risk scoring approach:

```typescript
interface FraudRiskFactors {
  ipVelocity: {
    weight: 30;
    threshold: 10; // referrals per hour
  };
  deviceReuse: {
    weight: 25;
    threshold: 5; // referrals per 24 hours
  };
  geographicAnomaly: {
    weight: 5;
    trustedCountries: ['US', 'CA', 'GB', 'DE', 'FR'];
  };
  temporalPattern: {
    weight: 5;
    suspiciousHours: [0, 1, 2, 3, 4, 5, 22, 23];
  };
  behavioralAnomaly: {
    weight: 15;
    rapidClicks: true;
    unusualUserAgent: true;
  };
}
```

### Risk Levels

- **Low (0-19)**: Normal traffic, automatic approval
- **Medium (20-39)**: Slight anomalies, monitor closely
- **High (40-69)**: Suspicious patterns, require manual review
- **Critical (70-100)**: High fraud probability, automatic rejection

### Fraud Detection Rules

#### IP Velocity Rule

```sql
-- Detect high-frequency referrals from same IP
SELECT ip_address, COUNT(*) as referral_count
FROM referral_tracking
WHERE clicked_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 10;
```

#### Device Fingerprint Rule

```sql
-- Detect device reuse across multiple referrals
SELECT device_fingerprint, COUNT(DISTINCT referrer_id) as unique_referrers
FROM referral_tracking
WHERE clicked_at > NOW() - INTERVAL '24 hours'
  AND device_fingerprint IS NOT NULL
GROUP BY device_fingerprint
HAVING COUNT(DISTINCT referrer_id) > 5;
```

#### Geographic Anomaly Rule

```sql
-- Detect referrals from unusual geographic locations
SELECT country, COUNT(*) as referral_count,
       AVG(fraud_risk_score) as avg_risk_score
FROM referral_tracking
WHERE country NOT IN ('US', 'CA', 'GB', 'DE', 'FR')
  AND clicked_at > NOW() - INTERVAL '7 days'
GROUP BY country
ORDER BY referral_count DESC;
```

## Attribution Models

### Model Implementations

#### Last Touch Attribution

```typescript
function calculateLastTouchAttribution(referral: Referral): number {
  // Last interaction gets 100% credit
  return 1.0;
}
```

#### Time Decay Attribution

```typescript
function calculateTimeDecayAttribution(
  referral: Referral,
  halfLifeDays: number = 7
): number {
  const hoursSinceClick =
    (Date.now() - referral.clickedAt.getTime()) / (1000 * 60 * 60);
  const decayFactor = Math.exp(
    (-hoursSinceClick / (halfLifeDays * 24)) * Math.LN2
  );

  return Math.max(0.1, Math.min(1.0, decayFactor));
}
```

#### Position-Based Attribution

```typescript
function calculatePositionBasedAttribution(
  touchpoints: Referral[],
  weights: { first: number; last: number; middle: number }
): number[] {
  if (touchpoints.length === 1) return [1.0];
  if (touchpoints.length === 2) return [weights.first, weights.last];

  const middleWeight = weights.middle / (touchpoints.length - 2);
  return touchpoints.map((_, index) => {
    if (index === 0) return weights.first;
    if (index === touchpoints.length - 1) return weights.last;
    return middleWeight;
  });
}
```

### Attribution Configuration

```json
{
  "attributionModels": {
    "lastTouch": {
      "type": "last_touch",
      "description": "Full credit to last referral",
      "parameters": {}
    },
    "timeDecay": {
      "type": "time_decay",
      "description": "Recent interactions weighted higher",
      "parameters": {
        "halfLifeDays": 7,
        "minimumWeight": 0.1
      }
    },
    "positionBased": {
      "type": "position_based",
      "description": "First and last weighted 40% each, middle 20%",
      "parameters": {
        "firstTouch": 0.4,
        "lastTouch": 0.4,
        "middleTouch": 0.2
      }
    }
  }
}
```

## Campaign Management

### Campaign Types

#### Affiliate Campaigns

- Commission-based rewards for marketplace sales
- Performance tracking with conversion metrics
- Automated payout processing

#### Influencer Campaigns

- Fixed fee or hybrid reward structures
- Content performance tracking
- Brand safety and compliance monitoring

#### Partnership Campaigns

- B2B referral programs with enterprise clients
- Custom reward structures and reporting
- Contract-based performance metrics

### Reward Structures

#### Percentage-Based Rewards

```json
{
  "rewardType": "percentage",
  "rewardValue": 10.0,
  "description": "10% commission on conversion value",
  "minimumConversion": 25.0,
  "maximumReward": 500.0
}
```

#### Tiered Rewards

```json
{
  "rewardType": "tiered",
  "tiers": [
    { "minValue": 0, "maxValue": 49.99, "reward": 5.0 },
    { "minValue": 50, "maxValue": 99.99, "reward": 15.0 },
    { "minValue": 100, "maxValue": null, "reward": 25.0 }
  ]
}
```

#### Progressive Rewards

```json
{
  "rewardType": "progressive",
  "baseRate": 5.0,
  "bonusThresholds": [
    { "referrals": 10, "bonusRate": 1.0 },
    { "referrals": 25, "bonusRate": 2.0 },
    { "referrals": 50, "bonusRate": 3.0 }
  ]
}
```

## Reward System

### Reward Calculation Workflow

1. **Conversion Verification**: Validate conversion event and value
2. **Campaign Eligibility**: Check campaign status and constraints
3. **Fraud Assessment**: Verify referral passes fraud checks
4. **Attribution Calculation**: Apply configured attribution model
5. **Reward Computation**: Calculate base reward amount
6. **Cap Application**: Apply per-referrer and campaign limits
7. **Approval Process**: Route through approval workflow if required
8. **Payout Processing**: Schedule and execute payment

### Reward Processing Example

```typescript
async function processReward(referralId: string): Promise<Reward> {
  const referral = await getReferral(referralId);
  const campaign = await getCampaign(referral.campaignId);

  // Verify eligibility
  if (!isEligibleForReward(referral, campaign)) {
    throw new Error('Referral not eligible for reward');
  }

  // Calculate attribution weight
  const attributionWeight = await calculateAttribution(
    referralId,
    campaign.attributionModel
  );

  // Calculate base reward
  let rewardAmount = calculateBaseReward(
    referral.conversionValue,
    campaign.rewardType,
    campaign.rewardValue
  );

  // Apply attribution weighting
  rewardAmount *= attributionWeight;

  // Apply caps and limits
  rewardAmount = applyRewardCaps(
    rewardAmount,
    referral.referrerId,
    campaign
  );

  // Create reward record
  return await createReward({
    referralId,
    campaignId: campaign.id,
    referrerId: referral.referrerId,
    baseAmount: referral.conversionValue,
    finalAmount: rewardAmount,
    calculationDetails: {
      attributionWeight,
      rewardRate: campaign.rewardValue,
      capsApplied: /* ... */
    }
  });
}
```

## Analytics & Reporting

### Dashboard Metrics

#### Key Performance Indicators (KPIs)

- **Total Referrals**: Count of all tracked referrals
- **Unique Referrers**: Number of distinct users making referrals
- **Conversion Rate**: Percentage of referrals resulting in conversions
- **Average Order Value**: Mean conversion value across referrals
- **Lifetime Value**: Projected value of referred users
- **Return on Investment**: Revenue vs. reward costs

#### Conversion Funnel

```
Referral Clicks → Unique Visitors → Signups → Conversions → Paid Rewards
     100%              85%           45%        12%           10%
```

#### Fraud Detection Metrics

- **Fraud Detection Rate**: Percentage of referrals flagged as fraudulent
- **False Positive Rate**: Incorrectly flagged legitimate referrals
- **Average Risk Score**: Mean fraud risk across all referrals
- **Manual Review Queue**: Referrals requiring human verification

### Report Generation

#### Standard Reports

**Daily Performance Report**

```json
{
  "reportType": "daily_performance",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": {
    "totalReferrals": 2450,
    "conversionRate": 14.2,
    "totalRevenue": 89750.00,
    "avgOrderValue": 125.50,
    "fraudRate": 1.8,
    "topPerformers": [...]
  }
}
```

**Campaign ROI Analysis**

```json
{
  "reportType": "campaign_roi",
  "campaignId": "campaign-uuid",
  "period": "Q1_2024",
  "metrics": {
    "totalInvestment": 15000.0,
    "totalRevenue": 89750.0,
    "rewardsPaid": 8975.0,
    "netProfit": 65775.0,
    "roi": 338.5,
    "paybackPeriod": 23
  }
}
```

**Fraud Analysis Report**

```json
{
  "reportType": "fraud_analysis",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "summary": {
    "totalAnalyzed": 2450,
    "fraudAttempts": 44,
    "fraudRate": 1.8,
    "preventedLoss": 2150.0
  },
  "patterns": {
    "ipVelocity": 18,
    "deviceReuse": 12,
    "geographicAnomaly": 8,
    "temporalPattern": 6
  }
}
```

## Installation & Setup

### Prerequisites

- Node.js 18+ or compatible runtime
- PostgreSQL 14+ database
- Redis 6+ for caching (optional but recommended)
- TypeScript 4.8+ for development

### Database Setup

1. **Create Database Schema**

   ```bash
   psql -U postgres -d marketplace -f server/database/migrations/045_epic16_referral_detection.sql
   ```

2. **Verify Installation**

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'referral_%';
   ```

3. **Create Initial Data**
   ```sql
   -- Default attribution models and fraud rules are created automatically
   -- Add any custom campaigns or configuration as needed
   ```

### Service Configuration

1. **Environment Variables**

   ```bash
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=marketplace
   DATABASE_USER=referral_service
   DATABASE_PASSWORD=secure_password

   # Referral System Configuration
   DEFAULT_CAMPAIGN_ID=default-campaign-uuid
   MAX_FRAUD_RISK_SCORE=70
   ATTRIBUTION_MODEL=last_touch
   REWARD_TYPE=percentage

   # Fraud Detection Thresholds
   IP_VELOCITY_THRESHOLD=10
   DEVICE_REUSE_THRESHOLD=5
   GEO_ANOMALY_RISK=5

   # Performance Settings
   REDIS_URL=redis://localhost:6379
   CACHE_TTL=3600
   ```

2. **Service Integration**

   ```typescript
   import { ReferralDetectionService } from './server/src/admin/ReferralDetectionService';

   const service = new ReferralDetectionService({
     enableRealtimeCollection: true,
     batchSize: 100,
     maxRetentionDays: 2555, // 7 years
     encryptionEnabled: true,
     complianceMode: 'strict',
     automaticVerification: true
   });
   ```

### Testing Setup

1. **Install Test Dependencies**

   ```bash
   npm install --save-dev jest @types/jest ts-jest
   ```

2. **Run Test Suite**

   ```bash
   npm test -- server/src/__tests__/referral-detection.test.ts
   ```

3. **Generate Coverage Report**
   ```bash
   npm test -- --coverage
   ```

## Usage Examples

### Basic Referral Tracking

```typescript
// Track a referral click
const referral = await service.trackReferral('REF-12345', userId, {
  source: 'social_media',
  utmSource: 'twitter',
  utmMedium: 'social',
  utmCampaign: 'summer-promo',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  landingPage: 'https://marketplace.com/templates/123'
});

console.log(`Referral tracked: ${referral.id}`);
console.log(
  `Fraud risk: ${referral.fraudRiskLevel} (${referral.fraudRiskScore})`
);
```

### Conversion Tracking

```typescript
// Update referral with conversion data
const conversionData = {
  conversionEvent: 'purchase',
  conversionValue: 150.0,
  conversionDate: new Date(),
  referredUserId: newUserId
};

const updatedReferral = await service.updateReferralConversion(
  referralId,
  conversionData
);

// Calculate and process reward
const reward = await service.calculateReward(referralId);
if (reward) {
  console.log(`Reward calculated: $${reward.finalAmount}`);
  await service.processRewardPayout(reward.id);
}
```

### Campaign Management

```typescript
// Create a new campaign
const campaign = await service.createCampaign({
  name: 'Black Friday 2024',
  description: 'Special promotion with increased rewards',
  campaignType: 'affiliate',
  rewardType: 'tiered',
  rewardValue: 0, // Tiered rewards don't use base value
  tiers: [
    { minValue: 0, maxValue: 49.99, reward: 10.0 },
    { minValue: 50, maxValue: 99.99, reward: 20.0 },
    { minValue: 100, maxValue: null, reward: 35.0 }
  ],
  startDate: new Date('2024-11-29'),
  endDate: new Date('2024-12-02'),
  maxRewardPerReferrer: 500.0
});

console.log(`Campaign created: ${campaign.id}`);
```

### Analytics and Reporting

```typescript
// Generate analytics for the last 30 days
const analytics = await service.generateAnalytics({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  campaignId: 'specific-campaign-uuid' // optional
});

console.log('Analytics Summary:');
console.log(`Total Referrals: ${analytics.summary.totalReferrals}`);
console.log(`Conversion Rate: ${analytics.summary.conversionRate}%`);
console.log(`Total Revenue: $${analytics.summary.totalConversionValue}`);
console.log(
  `Fraud Rate: ${(analytics.summary.fraudAttempts / analytics.summary.totalReferrals) * 100}%`
);

// Generate compliance report
const complianceReport = await service.generateComplianceReport(
  'gdpr',
  {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  },
  {
    includeUserData: false,
    anonymizeData: true,
    exportFormat: 'json'
  }
);

console.log(`Compliance report generated: ${complianceReport.reportId}`);
```

### Fraud Detection Analysis

```typescript
// Analyze fraud patterns
const fraudAnalysis = await service.analyzeFraudPatterns({
  timeRange: '24h',
  riskThreshold: 40,
  includeIndicators: true
});

console.log('Fraud Analysis:');
console.log(`High-risk referrals: ${fraudAnalysis.highRiskCount}`);
console.log(`Top fraud indicators:`, fraudAnalysis.topIndicators);

// Update fraud detection rules
await service.updateFraudRule('ip-velocity-check', {
  threshold: 15, // Increase threshold
  timeWindow: '2h', // Extend time window
  enabled: true
});
```

## CLI Reference

The referral detection system includes a comprehensive CLI tool for management and monitoring.

### Installation

```bash
# Make the CLI executable
chmod +x scripts/epic16-referral-detection.js

# Add to PATH (optional)
ln -s $(pwd)/scripts/epic16-referral-detection.js /usr/local/bin/referral-cli
```

### Commands

#### Track Referrals

```bash
# Track a single referral
node scripts/epic16-referral-detection.js track \
  --code REF-12345 \
  --referrer-id "user-uuid" \
  --source social_media \
  --utm-campaign summer-promo \
  --conversion-value 150.00

# Track multiple test referrals
node scripts/epic16-referral-detection.js track \
  --count 10 \
  --source email_campaign \
  --utm-source newsletter \
  --country US
```

#### Campaign Management

```bash
# Create a new campaign
node scripts/epic16-referral-detection.js campaign create \
  --name "Holiday Campaign 2024" \
  --description "Special holiday referral program" \
  --reward-type percentage \
  --reward-value 15.0 \
  --max-reward 1000.00

# List all campaigns
node scripts/epic16-referral-detection.js campaign list
```

#### Fraud Analysis

```bash
# Analyze fraud patterns
node scripts/epic16-referral-detection.js fraud --verbose

# Generate fraud report
node scripts/epic16-referral-detection.js fraud \
  --output fraud-report.json \
  --format json
```

#### Reward Processing

```bash
# Calculate pending rewards
node scripts/epic16-referral-detection.js rewards calculate

# List all rewards
node scripts/epic16-referral-detection.js rewards list \
  --status pending \
  --output rewards.csv \
  --format csv
```

#### Analytics

```bash
# Generate 30-day analytics report
node scripts/epic16-referral-detection.js analytics \
  --days 30 \
  --output analytics-report.html \
  --format html

# Campaign-specific analytics
node scripts/epic16-referral-detection.js analytics \
  --campaign-id "campaign-uuid" \
  --days 7 \
  --verbose
```

#### Health Monitoring

```bash
# Check system health
node scripts/epic16-referral-detection.js health

# Health check for monitoring systems
node scripts/epic16-referral-detection.js health --format json
```

### CLI Output Formats

- **Console**: Human-readable terminal output with colors
- **JSON**: Machine-readable format for automation
- **CSV**: Spreadsheet-compatible format
- **HTML**: Web-friendly report format

### Exit Codes

- `0`: Success
- `1`: Non-critical issues (degraded health)
- `2`: Critical issues (unhealthy system)
- `3`: Error during execution

## Testing

### Test Coverage

The referral detection system includes comprehensive test coverage:

- **Unit Tests**: Core functionality and business logic
- **Integration Tests**: Component interaction and workflows
- **Performance Tests**: Load testing and scalability validation
- **Security Tests**: Fraud detection and data protection
- **Compliance Tests**: GDPR, CCPA, and other regulatory requirements

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- server/src/__tests__/referral-detection.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Categories

#### Unit Tests

- Referral tracking functionality
- Fraud detection algorithms
- Attribution model calculations
- Reward computation logic
- Campaign management operations

#### Integration Tests

- End-to-end referral workflows
- Database transaction integrity
- API endpoint functionality
- Analytics report generation
- Compliance data handling

#### Performance Tests

- High-volume referral tracking
- Concurrent fraud detection
- Batch reward processing
- Real-time analytics updates
- Database query optimization

#### Security Tests

- Fraud detection effectiveness
- Data encryption validation
- Access control verification
- Input sanitization testing
- Privacy compliance checks

### Mock Data

Test suites use realistic mock data for reproducible testing:

```typescript
const mockReferralData = {
  referralCode: 'TEST-REF-001',
  referrerId: 'test-user-uuid',
  source: 'social_media',
  utmSource: 'twitter',
  utmMedium: 'social',
  utmCampaign: 'test-campaign',
  ipAddress: '192.168.1.100',
  deviceFingerprint: 'test-device-hash',
  country: 'US',
  conversionValue: 150.0,
  conversionEvent: 'purchase'
};
```

## Performance Monitoring

### Key Performance Indicators

#### System Performance

- **Referral Tracking Latency**: Average time to process referral clicks
- **Fraud Detection Speed**: Time to calculate risk scores
- **Attribution Processing**: Time to calculate attribution weights
- **Reward Calculation**: Time to compute and validate rewards
- **Database Query Performance**: Response times for common queries

#### Business Metrics

- **Referral Volume**: Number of referrals processed per time period
- **Conversion Throughput**: Rate of conversion processing
- **Fraud Detection Rate**: Percentage of fraud successfully identified
- **False Positive Rate**: Legitimate referrals incorrectly flagged
- **Revenue Attribution Accuracy**: Precision of attribution calculations

### Performance Benchmarks

#### Target Performance Metrics

```json
{
  "referralTracking": {
    "p50Latency": "< 50ms",
    "p95Latency": "< 200ms",
    "p99Latency": "< 500ms",
    "throughput": "> 1000 req/sec"
  },
  "fraudDetection": {
    "p50Latency": "< 25ms",
    "p95Latency": "< 100ms",
    "accuracy": "> 95%",
    "falsePositiveRate": "< 2%"
  },
  "rewardCalculation": {
    "p50Latency": "< 100ms",
    "p95Latency": "< 300ms",
    "batchProcessing": "> 500 rewards/sec"
  }
}
```

### Monitoring Tools

#### Database Performance

```sql
-- Monitor query performance
SELECT query, calls, total_time, mean_time, stddev_time
FROM pg_stat_statements
WHERE query LIKE '%referral_%'
ORDER BY total_time DESC;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename LIKE 'referral_%'
ORDER BY n_distinct DESC;
```

#### Application Metrics

```typescript
// Performance monitoring middleware
app.use('/api/referrals', (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metrics.recordRequestDuration('referral_api', duration);
    metrics.incrementCounter('referral_requests_total', {
      method: req.method,
      status: res.statusCode.toString()
    });
  });

  next();
});
```

### Alerting Configuration

#### Critical Alerts

- **High Fraud Rate**: > 5% fraud detection rate
- **Processing Delays**: > 1000ms p95 latency
- **Database Issues**: Connection errors or slow queries
- **Revenue Impact**: Significant drops in conversion rates

#### Warning Alerts

- **Elevated Risk Scores**: Unusual patterns in fraud detection
- **Performance Degradation**: Increasing response times
- **Queue Backlogs**: Processing delays in reward calculations
- **Data Quality Issues**: Anomalies in referral data

## Security Considerations

### Data Protection

#### Personal Information Handling

- **Data Minimization**: Collect only necessary referral data
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Access Controls**: Role-based access to referral information
- **Audit Trails**: Log all access to personal data
- **Data Retention**: Automatic cleanup based on retention policies

#### Privacy Compliance

- **GDPR Compliance**: Right to erasure, data portability, consent management
- **CCPA Compliance**: Consumer privacy rights and data deletion
- **Cookie Consent**: Proper consent for tracking cookies
- **Anonymization**: Remove personally identifiable information from analytics

### Fraud Prevention

#### Multi-Layer Security

```typescript
interface SecurityLayers {
  rateLimiting: {
    requestsPerMinute: 60;
    burstLimit: 10;
  };
  ipBlacklisting: {
    automaticBlocking: true;
    thresholdScore: 80;
    blockDuration: '24h';
  };
  deviceFingerprinting: {
    enableJavaScript: true;
    canvasFingerprinting: false; // Privacy-respectful
    trackingResistance: true;
  };
  behavioralAnalysis: {
    clickPatterns: true;
    sessionDuration: true;
    mouseMovement: false; // Optional
  };
}
```

#### Input Validation

```typescript
const referralSchema = z.object({
  referralCode: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Z0-9-]+$/),
  referrerId: z.string().uuid(),
  source: z.enum(['direct_link', 'social_media', 'email_campaign']),
  ipAddress: z.string().ip(),
  conversionValue: z.number().min(0).max(100000),
  utmSource: z.string().max(100).optional(),
  customData: z.record(z.unknown()).optional()
});
```

### Access Control

#### Role-Based Permissions

```json
{
  "roles": {
    "referral_admin": {
      "permissions": [
        "referrals:read",
        "referrals:write",
        "campaigns:manage",
        "fraud:review",
        "rewards:process",
        "analytics:full_access"
      ]
    },
    "campaign_manager": {
      "permissions": [
        "campaigns:read",
        "campaigns:write",
        "analytics:campaign_access",
        "referrals:read"
      ]
    },
    "fraud_analyst": {
      "permissions": [
        "fraud:read",
        "fraud:review",
        "referrals:read",
        "analytics:fraud_access"
      ]
    },
    "referrer": {
      "permissions": [
        "referrals:own_data",
        "rewards:own_data",
        "analytics:personal"
      ]
    }
  }
}
```

#### API Security

- **Authentication**: JWT tokens with proper expiration
- **Authorization**: Endpoint-level permission checks
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Input Sanitization**: Prevent injection attacks
- **HTTPS Only**: Encrypt all data in transit

### Compliance and Auditing

#### Audit Requirements

- **Data Access Logging**: Track all access to referral data
- **Change History**: Maintain complete audit trail of modifications
- **Compliance Reporting**: Generate reports for regulatory requirements
- **Incident Response**: Procedures for security breaches
- **Regular Reviews**: Periodic security and compliance assessments

## Troubleshooting

### Common Issues

#### High Fraud Detection Rates

**Symptoms:**

- Sudden increase in referrals marked as high-risk
- Legitimate users unable to receive rewards
- Complaints about false positives

**Diagnosis:**

```bash
# Check fraud detection metrics
node scripts/epic16-referral-detection.js fraud --verbose

# Analyze recent risk score distribution
SELECT fraud_risk_level, COUNT(*)
FROM referral_tracking
WHERE clicked_at > NOW() - INTERVAL '24 hours'
GROUP BY fraud_risk_level;
```

**Solutions:**

1. **Adjust Thresholds**: Lower fraud detection sensitivity
2. **Review Rules**: Disable problematic fraud detection rules
3. **Whitelist IPs**: Add trusted IP addresses to whitelist
4. **Manual Review**: Process flagged referrals manually

#### Performance Degradation

**Symptoms:**

- Slow API response times
- Database query timeouts
- User complaints about delayed tracking

**Diagnosis:**

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE query LIKE '%referral_%'
ORDER BY mean_time DESC;

-- Check database locks
SELECT pid, state, query_start, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

**Solutions:**

1. **Database Optimization**: Add indexes, optimize queries
2. **Caching**: Implement Redis caching for frequent queries
3. **Connection Pooling**: Optimize database connection management
4. **Scaling**: Add read replicas or increase server resources

#### Reward Calculation Errors

**Symptoms:**

- Incorrect reward amounts
- Missing rewards for verified referrals
- Calculation timeout errors

**Diagnosis:**

```bash
# Check reward calculation logs
node scripts/epic16-referral-detection.js rewards calculate --verbose

# Verify campaign configuration
SELECT * FROM referral_campaigns WHERE status = 'active';
```

**Solutions:**

1. **Campaign Validation**: Verify campaign configuration
2. **Attribution Model**: Check attribution model settings
3. **Retry Processing**: Reprocess failed reward calculations
4. **Manual Adjustment**: Correct rewards manually if needed

#### Data Inconsistencies

**Symptoms:**

- Mismatched analytics numbers
- Duplicate referral records
- Missing conversion data

**Diagnosis:**

```sql
-- Check for duplicate referrals
SELECT referral_code, COUNT(*)
FROM referral_tracking
GROUP BY referral_code
HAVING COUNT(*) > 1;

-- Verify data integrity
SELECT
  COUNT(*) as total_referrals,
  COUNT(DISTINCT referral_code) as unique_codes,
  COUNT(conversion_date) as conversions
FROM referral_tracking;
```

**Solutions:**

1. **Data Cleanup**: Remove or merge duplicate records
2. **Validation Rules**: Implement stricter data validation
3. **Backup Restore**: Restore from backup if corruption detected
4. **Process Review**: Review data ingestion processes

### Debugging Tools

#### CLI Diagnostics

```bash
# System health check
node scripts/epic16-referral-detection.js health --verbose

# Performance monitoring
node scripts/epic16-referral-detection.js analytics \
  --days 1 \
  --format json \
  --output performance.json

# Fraud analysis
node scripts/epic16-referral-detection.js fraud \
  --output fraud-analysis.json
```

#### Database Queries

```sql
-- Performance analysis
SELECT
  campaign_id,
  COUNT(*) as total_referrals,
  AVG(fraud_risk_score) as avg_risk_score,
  COUNT(*) FILTER (WHERE status = 'verified') as verified_count,
  AVG(conversion_value) FILTER (WHERE conversion_value IS NOT NULL) as avg_conversion
FROM referral_tracking
WHERE clicked_at > NOW() - INTERVAL '7 days'
GROUP BY campaign_id;

-- Fraud pattern analysis
SELECT
  DATE(clicked_at) as date,
  fraud_risk_level,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT country) as countries
FROM referral_tracking
WHERE clicked_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(clicked_at), fraud_risk_level
ORDER BY date, fraud_risk_level;
```

#### Log Analysis

```bash
# Application logs
tail -f logs/referral-service.log | grep ERROR

# Database logs
tail -f /var/log/postgresql/postgresql-14-main.log

# System resource usage
htop
iostat -x 1
```

### Support and Maintenance

#### Regular Maintenance Tasks

1. **Daily**
   - Monitor system health and performance
   - Review fraud detection alerts
   - Check processing queues for backlogs

2. **Weekly**
   - Analyze performance trends
   - Review and update fraud detection rules
   - Generate compliance reports

3. **Monthly**
   - Database maintenance and optimization
   - Security review and updates
   - Performance benchmarking

4. **Quarterly**
   - Comprehensive system audit
   - Compliance assessment
   - Disaster recovery testing

#### Emergency Procedures

**System Outage Response:**

1. Assess impact and affected components
2. Activate backup systems if available
3. Communicate with stakeholders
4. Implement temporary workarounds
5. Begin restoration procedures
6. Document incident and lessons learned

**Security Incident Response:**

1. Isolate affected systems
2. Assess scope of potential breach
3. Preserve evidence for investigation
4. Notify relevant authorities if required
5. Implement containment measures
6. Begin recovery and restoration

---

## Appendix

### Database Schema Reference

Complete SQL schema available in:
`server/database/migrations/045_epic16_referral_detection.sql`

### API Reference

Complete OpenAPI specification available in:
`docs/api/referral-detection-openapi.yaml`

### Configuration Examples

Sample configuration files available in:
`config/referral-detection/`

### Performance Benchmarks

Detailed benchmark results available in:
`docs/performance/referral-detection-benchmarks.md`

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Maintained By**: Epic 16 Development Team
