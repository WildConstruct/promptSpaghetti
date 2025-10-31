# False Positive Handling Quick Reference

## Emergency Response (Use Immediately)

### 🚨 Critical False Positive Incident

If users are being blocked from critical business operations:

```bash
# 1. Enable emergency bypass mode (temporary relief)
curl -X POST /api/security/emergency-bypass \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"mode": "enable", "duration": 3600, "reason": "Critical FP incident"}'

# 2. Check affected systems
./scripts/fp-incident-check.sh

# 3. Notify security team
./scripts/notify-security-team.sh "Critical FP incident - bypass enabled"
```

### ⚡ Quick Threshold Adjustment

For immediate relief from specific false positives:

```bash
# Temporarily reduce threshold for specific system
curl -X PATCH /api/security/thresholds/$SYSTEM_NAME \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"threshold": 0.5, "duration": 1800, "reason": "FP mitigation"}'
```

## Daily Operations

### 📊 Check False Positive Metrics

**Morning routine - Run these commands:**

```bash
# Overall FP health check
./scripts/fp-health-check.sh

# Yesterday's FP summary
./scripts/fp-daily-summary.sh $(date -d yesterday +%Y-%m-%d)

# Current top FP sources
./scripts/fp-top-sources.sh --limit=5
```

**Expected outputs:**

- FP rate should be <2%
- No single system >5% FP rate
- User complaints <10/day

### 🔍 Investigate User Reports

When users report false positives:

```bash
# Get details about specific alert
./scripts/get-alert-details.sh $ALERT_ID

# Check user's recent security activity
./scripts/user-security-history.sh $USER_ID --days=7

# Analyze similar patterns
./scripts/analyze-similar-alerts.sh $ALERT_ID --count=10
```

### 📈 Weekly FP Review

Every Monday morning:

```bash
# Generate weekly FP report
./scripts/fp-weekly-report.sh

# Check ML model performance
./scripts/check-ml-performance.sh

# Review pending appeals
./scripts/review-pending-appeals.sh
```

## Common False Positive Patterns

### 🔑 Authentication Issues

**Pattern**: Legitimate users blocked at login

```bash
# Quick fixes:
# 1. Check if user is traveling
./scripts/check-user-travel.sh $USER_ID

# 2. Verify device registration
./scripts/verify-device.sh $DEVICE_ID

# 3. Temporarily whitelist IP
./scripts/whitelist-ip.sh $IP_ADDRESS --duration=24h
```

### 📝 Input Validation Issues

**Pattern**: Valid content flagged as malicious

```bash
# Quick analysis:
./scripts/analyze-input-fp.sh "$INPUT_CONTENT"

# Common fixes:
# 1. Add to content whitelist
./scripts/add-content-whitelist.sh "$PATTERN" --category=legitimate

# 2. Adjust content validation threshold
./scripts/adjust-content-threshold.sh --increase=0.1
```

### 🚀 Rate Limiting Issues

**Pattern**: Legitimate high-frequency usage blocked

```bash
# Quick relief:
# 1. Grant burst allowance
./scripts/grant-burst-allowance.sh $USER_ID --operations=100 --duration=1h

# 2. Upgrade user tier temporarily
./scripts/temp-tier-upgrade.sh $USER_ID --tier=premium --duration=24h
```

## API Quick Reference

### Emergency Bypass

```bash
# Request bypass
POST /api/security/bypass/request
{
  "userId": "user123",
  "operation": "bulk_export",
  "urgency": "high",
  "duration": 30,
  "justification": "Monthly compliance report deadline"
}

# Use bypass token
GET /api/data/export?bypass_token=$TOKEN
```

### Report False Positive

```bash
# User report
POST /api/security/feedback/false-positive
{
  "alertId": "alert123",
  "userId": "user123",
  "reason": "Legitimate business operation",
  "evidence": "link-to-documentation"
}

# Admin review
PUT /api/security/feedback/$FEEDBACK_ID/review
{
  "decision": "confirmed_false_positive",
  "action": "adjust_threshold",
  "notes": "Pattern added to whitelist"
}
```

### Threshold Management

```bash
# Get current thresholds
GET /api/security/thresholds?system=auth

# Adjust threshold
PATCH /api/security/thresholds/auth/login_attempts
{
  "threshold": 8,
  "reason": "Reducing FP for mobile users",
  "duration": 86400
}
```

## Monitoring Commands

### Real-time Monitoring

```bash
# Watch FP rate in real-time
watch -n 30 './scripts/current-fp-rate.sh'

# Monitor user complaints
tail -f /var/log/security/user-complaints.log | grep false_positive

# System health dashboard
./scripts/fp-dashboard.sh --refresh=60
```

### Alert Investigation

```bash
# When you get a FP rate spike alert:

# 1. Identify the source
./scripts/fp-spike-analysis.sh --timeframe=1h

# 2. Check recent changes
./scripts/recent-changes.sh --component=security --hours=4

# 3. Get impact assessment
./scripts/fp-impact-assessment.sh --timeframe=1h

# 4. Generate incident report
./scripts/generate-incident-report.sh --auto-fill
```

## Configuration Files

### Key Configuration Locations

```bash
# Main FP configuration
/etc/security/false-positive-config.yaml

# Threshold overrides
/etc/security/threshold-overrides.yaml

# Whitelist patterns
/etc/security/whitelists/
├── content-patterns.yaml
├── ip-addresses.yaml
├── user-agents.yaml
└── api-endpoints.yaml

# Emergency contacts
/etc/security/emergency-contacts.yaml
```

### Quick Config Changes

```bash
# Temporarily reduce global sensitivity
sed -i 's/sensitivity: 0.8/sensitivity: 0.6/' /etc/security/false-positive-config.yaml
systemctl reload security-service

# Add emergency contact
echo "  - name: John Doe\n    phone: +1234567890\n    role: security_lead" >> /etc/security/emergency-contacts.yaml
```

## Escalation Procedures

### Level 1: Support Team (0-15 minutes)

- ✅ Apply emergency bypass if needed
- ✅ Gather basic information
- ✅ Check known issues list
- ✅ Provide user workaround

### Level 2: Security Team (15-60 minutes)

- ✅ Analyze root cause
- ✅ Implement temporary fix
- ✅ Assess broader impact
- ✅ Update monitoring

### Level 3: Engineering Team (60+ minutes)

- ✅ Implement permanent fix
- ✅ Update ML models if needed
- ✅ Modify core algorithms
- ✅ Plan prevention measures

## Contact Information

### Emergency Escalation

- **Critical FP Issues**: `security-emergency@company.com`
- **After Hours**: `+1-555-SECURITY`
- **Slack**: `#security-incidents`

### Team Contacts

- **Security Team**: `security@company.com`
- **DevOps Team**: `devops@company.com`
- **Support Team**: `support@company.com`

## Common Commands Reference Card

```bash
# Daily checks
./scripts/fp-health-check.sh
./scripts/fp-daily-summary.sh

# Emergency response
./scripts/enable-emergency-bypass.sh
./scripts/notify-security-team.sh

# Investigation
./scripts/analyze-alert.sh $ALERT_ID
./scripts/user-activity.sh $USER_ID

# Threshold management
./scripts/adjust-threshold.sh $SYSTEM $VALUE
./scripts/whitelist-pattern.sh "$PATTERN"

# Monitoring
./scripts/fp-dashboard.sh
./scripts/current-fp-rate.sh
```

## Troubleshooting Checklist

When investigating false positives:

- [ ] Check if it's a known pattern
- [ ] Verify user legitimacy and context
- [ ] Review recent system changes
- [ ] Check ML model confidence scores
- [ ] Validate threshold configurations
- [ ] Review similar recent cases
- [ ] Consider broader impact
- [ ] Document findings for future reference

## Success Metrics

**Target Metrics (check weekly):**

- False Positive Rate: <2%
- User Satisfaction: >95%
- Resolution Time: <1 hour (critical), <4 hours (normal)
- Appeal Success Rate: >80%
- ML Model Accuracy: >95%

**Red Flags (immediate attention needed):**

- FP Rate >5% for any system
- User complaints >20/day
- Resolution time >4 hours average
- Multiple escalations per day
- ML model accuracy <90%

---

_Keep this reference handy and update it based on your experience and system changes._
