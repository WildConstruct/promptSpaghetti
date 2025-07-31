# Security Tool Integration Guide

**Version:** 1.0  
**Document Owner:** Security Engineering Team  
**Last Updated:** July 2025  
**Review Cycle:** Semi-Annual

## Table of Contents

1. [Integration Architecture Overview](#integration-architecture-overview)
2. [SIEM Platform Integration](#siem-platform-integration)
3. [Security Alert API Configuration](#security-alert-api-configuration)
4. [Webhook Integration Standards](#webhook-integration-standards)
5. [Third-Party Tool Connectors](#third-party-tool-connectors)
6. [Dashboard Integration Procedures](#dashboard-integration-procedures)
7. [Alert Correlation Configuration](#alert-correlation-configuration)
8. [Monitoring & Health Checks](#monitoring--health-checks)
9. [Troubleshooting & Support](#troubleshooting--support)

## Integration Architecture Overview

### 🏗️ PromptScape Security Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   PromptScape   │    │   Response      │
│   Security      │───▶│   Security      │───▶│   Systems       │
│   Tools         │    │   Hub           │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • SIEM          │    │ • Alert Engine  │    │ • IP Blocking   │
│ • EDR/XDR       │    │ • Policy Engine │    │ • Account Lock  │
│ • Network IDS   │    │ • Correlation   │    │ • Notifications │
│ • WAF           │    │ • Analytics     │    │ • Escalation    │
│ • Cloud Security│    │ • Dashboard     │    │ • Documentation │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 Integration Methods

| Method           | Use Case            | Complexity | Real-time      | Authentication    |
| ---------------- | ------------------- | ---------- | -------------- | ----------------- |
| **REST API**     | Custom integrations | Medium     | Yes            | Bearer Token      |
| **Webhooks**     | Event-driven alerts | Low        | Yes            | Signature/Token   |
| **Log Shipping** | SIEM integration    | Low        | Near real-time | TLS/API Key       |
| **SNMP/Syslog**  | Network devices     | Low        | Yes            | Community/TLS     |
| **Database**     | Data warehouse      | High       | No             | Connection String |

### 📊 Supported Integration Patterns

#### **Push Integration (Recommended)**

- External tools push alerts to PromptScape
- Real-time alert processing
- Automatic correlation and response
- Lower system overhead

#### **Pull Integration**

- PromptScape polls external systems
- Suitable for batch processing
- Higher latency but more reliable
- Used for reporting integrations

#### **Bidirectional Integration**

- Two-way communication
- Status updates and acknowledgments
- Complex but provides full visibility
- Used for enterprise SIEM platforms

## SIEM Platform Integration

### 🎯 Splunk Integration

#### **Configuration Steps:**

1. **Install PromptScape Security App:**

   ```bash
   # Download and install the custom Splunk app
   cd $SPLUNK_HOME/etc/apps/
   wget https://releases.promptscape.com/splunk-security-app-v1.0.tgz
   tar -xzf splunk-security-app-v1.0.tgz
   /opt/splunk/bin/splunk restart
   ```

2. **Configure Data Inputs:**

   ```conf
   # inputs.conf
   [http://promptscape_security_events]
   token = YOUR_HEC_TOKEN
   index = security_events
   source = promptscape
   sourcetype = promptscape:security:json
   ```

3. **Alert Forwarding Configuration:**

   ```python
   # alert_forwarder.py
   import splunklib.client as client

   def send_to_splunk(alert_data):
       service = client.connect(
           host='splunk.company.com',
           port=8089,
           username='promptscape_svc',
           password='[SERVICE_PASSWORD]'
       )

       index = service.indexes['security_events']
       index.submit(json.dumps(alert_data))
   ```

#### **Custom Splunk Searches:**

```spl
# High-severity security events
index=security_events sourcetype=promptscape:security:json severity=critical OR severity=high
| stats count by event_type, severity, source_ip
| sort -count

# Authentication failure patterns
index=security_events event_type="AUTHENTICATION_FAILURE"
| bucket _time span=5m
| stats count by _time, source_ip
| where count > 10

# Data breach detection
index=security_events event_type="*BREACH*" OR tags="data_exposure"
| eval risk_score=case(
    severity="critical", 10,
    severity="high", 7,
    severity="medium", 5,
    1
)
| sort -risk_score
```

### 🔍 QRadar Integration

#### **DSM Configuration:**

```xml
<!-- QRadar Device Support Module (DSM) -->
<device-extension-properties>
    <pattern id="PromptScapeSecurityPattern" xmlns="dsm_pattern">
        <event-match-single>
            <event-regex>.*PromptScape.*Security.*Alert.*</event-regex>
        </event-match-single>
    </pattern>
</device-extension-properties>
```

#### **Log Source Configuration:**

- **Log Source Type:** PromptScape Security
- **Protocol:** Syslog
- **Port:** 514 (or custom)
- **Parse Order:** 10
- **Store Event Payload:** Yes

#### **Custom Properties Mapping:**

```json
{
  "event_mappings": {
    "AlertSeverity": "severity",
    "EventType": "event_type",
    "SourceIP": "source_ip",
    "TargetSystem": "system_component",
    "ThreatLevel": "threat_level",
    "ComplianceImpact": "compliance_frameworks"
  }
}
```

### 📈 Elastic Security (ELK) Integration

#### **Logstash Configuration:**

```ruby
# logstash.conf
input {
  http {
    port => 8080
    codec => json
    type => "promptscape_security"
  }
}

filter {
  if [type] == "promptscape_security" {
    mutate {
      add_field => { "[@metadata][index]" => "security-events-%{+YYYY.MM}" }
    }

    date {
      match => [ "timestamp", "ISO8601" ]
    }

    if [source_ip] {
      geoip {
        source => "source_ip"
        target => "geo"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index]}"
    template_name => "promptscape_security"
    template_pattern => "security-events-*"
  }
}
```

#### **Elasticsearch Index Template:**

```json
{
  "template": "security-events-*",
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "event_type": { "type": "keyword" },
      "severity": { "type": "keyword" },
      "source_ip": { "type": "ip" },
      "threat_level": { "type": "integer" },
      "description": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "indicators": {
        "type": "nested",
        "properties": {
          "type": { "type": "keyword" },
          "value": { "type": "keyword" }
        }
      }
    }
  }
}
```

## Security Alert API Configuration

### 🔌 REST API Endpoints

#### **Alert Ingestion Endpoint:**

```http
POST /api/v1/security/alerts
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN

{
  "event_id": "unique-event-identifier",
  "event_type": "AUTHENTICATION_FAILURE",
  "severity": "high",
  "timestamp": "2025-07-22T10:30:00Z",
  "source_system": "external_system_name",
  "source_ip": "192.168.1.100",
  "user_id": "user123",
  "description": "Multiple failed login attempts detected",
  "indicators": [
    {
      "type": "ip",
      "value": "192.168.1.100"
    },
    {
      "type": "user",
      "value": "user123"
    }
  ],
  "metadata": {
    "system_component": "authentication_service",
    "threat_level": 7,
    "confidence_score": 85
  }
}
```

#### **Response Format:**

```json
{
  "status": "accepted",
  "alert_id": "AL-2025072210300001",
  "correlation_id": "CORR-001234",
  "actions_triggered": ["ip_block", "notification_sent", "escalation_created"],
  "processing_time_ms": 150
}
```

### 🔑 API Authentication

#### **Bearer Token Authentication:**

```bash
# Generate API token
curl -X POST https://security.promptscape.com/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "scope": "security:alerts:write"
  }'
```

#### **Token Usage:**

```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}

alert_data = {
    'event_type': 'NETWORK_INTRUSION_ATTEMPT',
    'severity': 'critical',
    # ... other fields
}

response = requests.post(
    'https://security.promptscape.com/api/v1/security/alerts',
    headers=headers,
    json=alert_data
)
```

### 📊 Bulk Alert Submission

#### **Batch Endpoint:**

```http
POST /api/v1/security/alerts/batch
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN

{
  "alerts": [
    {
      "event_id": "event-001",
      "event_type": "AUTHENTICATION_FAILURE",
      "severity": "medium",
      // ... alert data
    },
    {
      "event_id": "event-002",
      "event_type": "CODE_INJECTION_ATTEMPT",
      "severity": "high",
      // ... alert data
    }
  ]
}
```

#### **Batch Processing Rules:**

- Maximum 100 alerts per batch request
- Request timeout: 30 seconds
- Rate limit: 1000 requests per hour
- Duplicate detection within 5-minute window

## Webhook Integration Standards

### 🔗 Webhook Configuration

#### **Webhook Registration:**

```json
{
  "webhook_url": "https://external-system.com/security/webhook",
  "authentication": {
    "type": "hmac_sha256",
    "secret": "webhook_secret_key"
  },
  "events": ["alert.created", "alert.escalated", "incident.resolved"],
  "filters": {
    "severity": ["critical", "high"],
    "event_types": ["AUTHENTICATION_FAILURE", "CODE_INJECTION_ATTEMPT"]
  },
  "retry_policy": {
    "max_retries": 3,
    "retry_delays": [1, 5, 15] // minutes
  }
}
```

#### **Webhook Payload Format:**

```json
{
  "event": "alert.created",
  "timestamp": "2025-07-22T10:30:00Z",
  "alert": {
    "id": "AL-2025072210300001",
    "event_type": "AUTHENTICATION_FAILURE",
    "severity": "high",
    "source_ip": "192.168.1.100",
    "description": "Brute force attack detected",
    "actions_triggered": ["ip_block"],
    "compliance_impact": ["sox", "gdpr"]
  },
  "signature": "sha256=abc123..."
}
```

### 🔒 Webhook Security

#### **HMAC Signature Validation:**

```python
import hmac
import hashlib
import json

def validate_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(
        f"sha256={expected_signature}",
        signature
    )

# Usage
if validate_webhook(request.body, request.headers['X-Signature'], webhook_secret):
    # Process webhook
    alert_data = json.loads(request.body)
    process_security_alert(alert_data)
else:
    # Invalid signature
    return 401
```

#### **IP Whitelist Configuration:**

```bash
# Webhook source IP addresses
WEBHOOK_ALLOWED_IPS="
10.0.1.0/24
192.168.100.0/24
172.16.50.10
"
```

### 🔄 Webhook Retry Logic

#### **Retry Configuration:**

- **Initial Retry:** 1 minute after failure
- **Second Retry:** 5 minutes after failure
- **Final Retry:** 15 minutes after failure
- **Failure Actions:** Log failure, create support ticket

#### **Webhook Health Monitoring:**

```python
def monitor_webhook_health():
    webhook_stats = {
        'total_sent': get_webhook_count(),
        'success_rate': get_success_rate(),
        'avg_response_time': get_avg_response_time(),
        'failed_endpoints': get_failed_endpoints()
    }

    if webhook_stats['success_rate'] < 0.95:
        send_alert('webhook_degraded', webhook_stats)
```

## Third-Party Tool Connectors

### 🛡️ CrowdStrike Falcon Integration

#### **API Configuration:**

```python
from falconpy import Hosts

# CrowdStrike API client
falcon = Hosts(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET"
)

def get_crowdstrike_alerts():
    response = falcon.QueryDevicesByFilterScroll(
        filter="status:'contained'+severity:'high'"
    )

    for device_id in response['body']['resources']:
        device_info = falcon.GetDeviceDetails(ids=device_id)

        # Convert to PromptScape format
        alert = {
            'event_type': 'ENDPOINT_THREAT_DETECTED',
            'severity': 'high',
            'source_ip': device_info['local_ip'],
            'system_component': device_info['hostname'],
            'description': f"CrowdStrike threat detected on {device_info['hostname']}"
        }

        send_to_promptscape(alert)
```

### 🌐 AWS Security Hub Integration

#### **CloudFormation Template:**

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'PromptScape Security Hub Integration'

Resources:
  SecurityHubCustomAction:
    Type: AWS::SecurityHub::CustomAction
    Properties:
      Name: 'Send to PromptScape'
      Description: 'Forward finding to PromptScape Security Platform'
      Id: 'promptscape-forward'

  EventBridgeRule:
    Type: AWS::Events::Rule
    Properties:
      EventPattern:
        source: ['aws.securityhub']
        detail-type: ['Security Hub Findings - Custom Action']
      Targets:
        - Arn: !GetAtt ForwardingFunction.Arn
          Id: 'PromptScapeForwarder'

  ForwardingFunction:
    Type: AWS::Lambda::Function
    Properties:
      Runtime: python3.9
      Handler: index.lambda_handler
      Code:
        ZipFile: |
          import json
          import requests

          def lambda_handler(event, context):
              # Transform Security Hub finding to PromptScape format
              finding = event['detail']['findings'][0]
              
              alert = {
                  'event_type': 'CLOUD_SECURITY_VIOLATION',
                  'severity': finding['Severity']['Label'].lower(),
                  'source_ip': finding.get('Resources', [{}])[0].get('Id', ''),
                  'description': finding['Title'],
                  'metadata': {
                      'aws_account': finding['AwsAccountId'],
                      'region': finding['Region'],
                      'compliance': finding.get('Compliance', {})
                  }
              }
              
              # Send to PromptScape
              response = requests.post(
                  'https://security.promptscape.com/api/v1/security/alerts',
                  headers={'Authorization': 'Bearer YOUR_TOKEN'},
                  json=alert
              )
              
              return {'statusCode': 200}
```

### 🔍 Qualys VMDR Integration

#### **API Integration Script:**

```python
import requests
from xml.etree import ElementTree as ET

def get_qualys_vulnerabilities():
    auth = ('username', 'password')

    # Get scan results
    response = requests.post(
        'https://qualysapi.qualys.com/api/2.0/fo/scan/',
        auth=auth,
        data={'action': 'list', 'state': 'Finished'}
    )

    # Parse XML response
    root = ET.fromstring(response.content)

    for scan in root.findall('.//SCAN'):
        scan_id = scan.find('ID').text

        # Get scan details
        details_response = requests.post(
            'https://qualysapi.qualys.com/api/2.0/fo/scan/',
            auth=auth,
            data={'action': 'fetch', 'scan_ref': scan_id}
        )

        # Convert high/critical vulnerabilities to alerts
        convert_vulnerabilities_to_alerts(details_response.content)

def convert_vulnerabilities_to_alerts(scan_data):
    # Parse scan results and create PromptScape alerts
    for vuln in parse_critical_vulnerabilities(scan_data):
        alert = {
            'event_type': 'VULNERABILITY_DETECTED',
            'severity': 'high' if vuln['severity'] >= 4 else 'medium',
            'source_ip': vuln['ip_address'],
            'description': f"Critical vulnerability: {vuln['title']}",
            'metadata': {
                'cve_id': vuln['cve'],
                'cvss_score': vuln['cvss'],
                'patch_available': vuln['solution_available']
            }
        }

        send_to_promptscape(alert)
```

## Dashboard Integration Procedures

### 📊 Grafana Integration

#### **Data Source Configuration:**

```yaml
# grafana/provisioning/datasources/promptscape.yaml
apiVersion: 1

datasources:
  - name: PromptScape Security
    type: prometheus
    url: https://security.promptscape.com/api/v1/metrics
    access: proxy
    basicAuth: true
    basicAuthUser: monitoring
    secureJsonData:
      basicAuthPassword: YOUR_PASSWORD
    jsonData:
      timeInterval: 15s
```

#### **Security Metrics Dashboard:**

```json
{
  "dashboard": {
    "title": "PromptScape Security Metrics",
    "panels": [
      {
        "title": "Alert Volume by Severity",
        "type": "stat",
        "targets": [
          {
            "expr": "sum by (severity) (promptscape_alerts_total)"
          }
        ]
      },
      {
        "title": "Response Time Trends",
        "type": "timeseries",
        "targets": [
          {
            "expr": "avg(promptscape_response_time_seconds)"
          }
        ]
      },
      {
        "title": "Top Attack Sources",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, sum by (source_ip) (promptscape_attacks_total))"
          }
        ]
      }
    ]
  }
}
```

### 📈 Custom Dashboard API

#### **Dashboard Data Endpoint:**

```http
GET /api/v1/security/dashboard/metrics
Authorization: Bearer YOUR_API_TOKEN

{
  "timerange": {
    "start": "2025-07-22T00:00:00Z",
    "end": "2025-07-22T23:59:59Z"
  },
  "metrics": [
    "alert_volume",
    "response_times",
    "false_positive_rate",
    "compliance_violations"
  ]
}
```

#### **Response Format:**

```json
{
  "metrics": {
    "alert_volume": {
      "total": 1250,
      "by_severity": {
        "critical": 15,
        "high": 87,
        "medium": 432,
        "low": 716
      }
    },
    "response_times": {
      "avg_seconds": 45.2,
      "p95_seconds": 120.5,
      "sla_compliance": 0.96
    },
    "compliance_violations": {
      "sox": 3,
      "gdpr": 1,
      "pci_dss": 0
    }
  }
}
```

## Alert Correlation Configuration

### 🔗 Correlation Rules Engine

#### **Rule Definition Format:**

```json
{
  "rule_id": "CORR_001",
  "name": "Coordinated Brute Force Attack",
  "description": "Detect distributed brute force attacks",
  "conditions": {
    "time_window": "5m",
    "threshold": 3,
    "group_by": ["target_user"],
    "filters": [
      {
        "field": "event_type",
        "operator": "equals",
        "value": "AUTHENTICATION_FAILURE"
      },
      {
        "field": "source_ip",
        "operator": "distinct_count",
        "threshold": 3
      }
    ]
  },
  "actions": [
    {
      "type": "create_alert",
      "severity": "high",
      "title": "Distributed brute force attack detected"
    },
    {
      "type": "block_ips",
      "duration": "1h"
    }
  ]
}
```

#### **Custom Correlation Logic:**

```python
class SecurityEventCorrelator:
    def __init__(self):
        self.event_window = {}
        self.correlation_rules = load_correlation_rules()

    def process_event(self, event):
        # Add to time window
        self.add_to_window(event)

        # Check correlation rules
        for rule in self.correlation_rules:
            if self.evaluate_rule(rule, event):
                self.trigger_correlation(rule, event)

    def evaluate_rule(self, rule, event):
        # Get events in time window
        window_events = self.get_window_events(
            rule['conditions']['time_window']
        )

        # Apply filters
        filtered_events = self.apply_filters(
            window_events,
            rule['conditions']['filters']
        )

        # Check threshold
        return len(filtered_events) >= rule['conditions']['threshold']

    def trigger_correlation(self, rule, triggering_event):
        correlation_alert = {
            'event_type': 'CORRELATED_ATTACK',
            'severity': rule['actions'][0]['severity'],
            'description': rule['actions'][0]['title'],
            'correlation_rule': rule['rule_id'],
            'triggering_events': self.get_related_events(rule, triggering_event)
        }

        self.create_alert(correlation_alert)
```

### 📊 Correlation Analytics

#### **Pattern Detection Queries:**

```sql
-- Detect potential lateral movement
SELECT
    source_ip,
    COUNT(DISTINCT system_component) as systems_accessed,
    COUNT(*) as total_events,
    MIN(timestamp) as first_seen,
    MAX(timestamp) as last_seen
FROM security_events
WHERE event_type IN ('AUTHENTICATION_SUCCESS', 'PRIVILEGE_ESCALATION')
    AND timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY source_ip
HAVING COUNT(DISTINCT system_component) > 3
ORDER BY systems_accessed DESC;

-- Identify coordinated attacks
SELECT
    target_user,
    COUNT(DISTINCT source_ip) as attack_sources,
    COUNT(*) as attack_attempts,
    STRING_AGG(DISTINCT source_ip, ', ') as source_ips
FROM security_events
WHERE event_type = 'AUTHENTICATION_FAILURE'
    AND timestamp >= NOW() - INTERVAL '10 minutes'
GROUP BY target_user
HAVING COUNT(DISTINCT source_ip) >= 3
ORDER BY attack_attempts DESC;
```

## Monitoring & Health Checks

### 🏥 Integration Health Monitoring

#### **Health Check Endpoints:**

```http
GET /api/v1/integrations/health

{
  "overall_status": "healthy",
  "integrations": {
    "siem_splunk": {
      "status": "healthy",
      "last_event_received": "2025-07-22T10:29:45Z",
      "events_per_minute": 127,
      "error_rate": 0.02
    },
    "webhook_endpoints": {
      "status": "degraded",
      "active_endpoints": 8,
      "failed_endpoints": 2,
      "avg_response_time": "1.2s"
    },
    "api_integrations": {
      "status": "healthy",
      "requests_per_minute": 45,
      "success_rate": 0.998
    }
  }
}
```

#### **Automated Health Checks:**

```python
def perform_health_checks():
    checks = {
        'siem_connectivity': check_siem_connection(),
        'webhook_endpoints': check_webhook_health(),
        'api_availability': check_api_endpoints(),
        'alert_processing': check_alert_pipeline(),
        'correlation_engine': check_correlation_health()
    }

    overall_health = all(check['status'] == 'healthy' for check in checks.values())

    if not overall_health:
        send_health_alert(checks)

    return {
        'overall_status': 'healthy' if overall_health else 'degraded',
        'checks': checks,
        'timestamp': datetime.utcnow()
    }
```

### 📈 Performance Monitoring

#### **Key Performance Indicators:**

```python
INTEGRATION_KPIS = {
    'event_ingestion_rate': {
        'target': '> 1000 events/minute',
        'critical_threshold': '< 100 events/minute'
    },
    'api_response_time': {
        'target': '< 200ms',
        'critical_threshold': '> 2000ms'
    },
    'webhook_success_rate': {
        'target': '> 99%',
        'critical_threshold': '< 95%'
    },
    'correlation_processing_time': {
        'target': '< 5 seconds',
        'critical_threshold': '> 30 seconds'
    }
}
```

#### **Performance Alert Rules:**

```yaml
# Prometheus alerting rules
groups:
  - name: integration_performance
    rules:
      - alert: HighAPILatency
        expr: avg(http_request_duration_seconds{job="security-api"}) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High API latency detected'

      - alert: WebhookFailureRate
        expr: rate(webhook_failures_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: 'High webhook failure rate'
```

### 🔍 Integration Logging

#### **Structured Logging Format:**

```json
{
  "timestamp": "2025-07-22T10:30:00Z",
  "level": "INFO",
  "component": "webhook_processor",
  "integration": "crowdstrike_falcon",
  "event": "alert_processed",
  "duration_ms": 150,
  "details": {
    "alert_id": "AL-2025072210300001",
    "source_system": "crowdstrike",
    "actions_triggered": ["ip_block", "notification"],
    "correlation_matches": 2
  }
}
```

#### **Log Aggregation Configuration:**

```bash
# Fluentd configuration for integration logs
<source>
  @type tail
  path /var/log/security-integrations/*.log
  pos_file /var/log/fluentd/integrations.log.pos
  tag security.integrations
  format json
</source>

<filter security.integrations>
  @type parser
  key_name message
  format json
  reserve_data true
</filter>

<match security.integrations>
  @type elasticsearch
  host elasticsearch.company.com
  port 9200
  index_name security-integrations
</match>
```

## Troubleshooting & Support

### 🔧 Common Integration Issues

#### **Authentication Failures:**

```bash
# Check API token validity
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://security.promptscape.com/api/v1/auth/validate

# Expected response: {"valid": true, "expires": "2025-08-22T10:30:00Z"}
```

#### **Webhook Delivery Failures:**

```python
# Webhook troubleshooting checklist
def troubleshoot_webhook(webhook_url):
    checks = {
        'dns_resolution': check_dns(webhook_url),
        'network_connectivity': check_connectivity(webhook_url),
        'ssl_certificate': check_ssl_cert(webhook_url),
        'response_time': measure_response_time(webhook_url),
        'authentication': test_webhook_auth(webhook_url)
    }

    return checks
```

#### **SIEM Integration Issues:**

```bash
# Splunk troubleshooting
# Check HEC token status
curl -k https://splunk:8088/services/collector/health \
  -H "Authorization: Splunk YOUR_HEC_TOKEN"

# Verify index permissions
./splunk search "index=security_events | head 10"

# Check parsing issues
./splunk search "index=security_events sourcetype=promptscape:security:json | head 10"
```

### 📞 Support Escalation

#### **Support Tiers:**

| Issue Severity | Response Time     | Escalation Path                |
| -------------- | ----------------- | ------------------------------ |
| **Critical**   | 15 minutes        | On-call → Manager → Director   |
| **High**       | 1 hour            | Support Team → Senior Engineer |
| **Medium**     | 4 hours           | Support Queue → Assignment     |
| **Low**        | Next business day | Standard Support Process       |

#### **Issue Reporting Template:**

```markdown
## Integration Support Request

**Integration:** [Tool/Platform Name]
**Severity:** [Critical/High/Medium/Low]
**Issue Type:** [Authentication/Connectivity/Performance/Data]

### Problem Description

[Detailed description of the issue]

### Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Result]

### Expected Behavior

[What should happen]

### Current Behavior

[What actually happens]

### Environment Information

- Integration Type: [API/Webhook/Log Shipping]
- Tool Version: [Version number]
- Last Working: [Date/time when it worked]
- Error Messages: [Exact error messages]

### Troubleshooting Attempted

- [ ] Checked authentication
- [ ] Verified network connectivity
- [ ] Reviewed logs
- [ ] Tested with curl/postman
- [ ] Checked rate limits

### Log Excerpts
```

[Relevant log entries]

```

### Additional Context
[Any other relevant information]
```

### 🔄 Integration Maintenance

#### **Regular Maintenance Tasks:**

```bash
#!/bin/bash
# Weekly integration maintenance script

# Rotate API tokens
echo "Rotating API tokens..."
./rotate-api-tokens.sh

# Check webhook endpoints
echo "Validating webhook endpoints..."
./validate-webhooks.sh

# Update correlation rules
echo "Updating correlation rules..."
./update-correlation-rules.sh

# Performance cleanup
echo "Cleaning up old correlation data..."
./cleanup-correlation-cache.sh

# Health check report
echo "Generating health report..."
./generate-health-report.sh
```

#### **Quarterly Reviews:**

- Integration performance analysis
- Security tool effectiveness assessment
- Cost optimization review
- New integration opportunity evaluation
- Documentation updates

---

## Version Control

**Version History:**

- v1.0 (July 2025): Initial document creation
- Next Review: January 2026

**Approval:**

- **Document Owner:** Security Engineering Team
- **Technical Review:** CISO Office
- **Operations Review:** SOC Team
- **Final Approval:** Chief Information Security Officer

---

_This document contains technical configuration details for security integrations. Access is restricted to authorized security and engineering personnel only._
