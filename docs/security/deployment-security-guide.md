# Security Deployment Guide

## Overview

This guide provides detailed instructions for deploying Wild Construct with comprehensive security controls. It covers infrastructure security, application security configurations, monitoring setup, and operational security procedures.

## 🚀 Secure Deployment Checklist

### Pre-Deployment Security Requirements

#### Infrastructure Security ✅
- [ ] Network segmentation configured (DMZ, App, DB zones)
- [ ] Firewall rules implemented and tested
- [ ] Load balancer with SSL termination configured
- [ ] DDoS protection enabled
- [ ] VPN access configured for administrative tasks
- [ ] Security groups/NACLs configured with least privilege

#### Application Security ✅
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] Database encryption enabled (TDE)
- [ ] Redis encryption and authentication configured
- [ ] File storage encryption enabled
- [ ] API rate limiting configured
- [ ] CORS policies implemented
- [ ] Security headers configured

#### Certificate Management ✅
- [ ] SSL/TLS certificates installed and valid
- [ ] Certificate auto-renewal configured
- [ ] Certificate monitoring and alerting setup
- [ ] Certificate backup and recovery tested
- [ ] HSTS headers configured
- [ ] Certificate pinning implemented (mobile/desktop)

## 🏗️ Infrastructure Deployment

### Network Architecture Setup

#### AWS VPC Configuration
```terraform
# Main VPC with security-first design
resource "aws_vpc" "wild_construct" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "wild-construct-vpc"
    Environment = var.environment
    Security    = "high-security"
    Purpose     = "content-creation-platform"
  }
}

# DMZ Subnet (Public)
resource "aws_subnet" "dmz" {
  count             = 2
  vpc_id            = aws_vpc.wild_construct.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "wild-construct-dmz-${count.index + 1}"
    Tier = "dmz"
    Type = "public"
  }
}

# Application Subnet (Private)
resource "aws_subnet" "app" {
  count             = 2
  vpc_id            = aws_vpc.wild_construct.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "wild-construct-app-${count.index + 1}"
    Tier = "application"
    Type = "private"
  }
}

# Database Subnet (Private)
resource "aws_subnet" "db" {
  count             = 2
  vpc_id            = aws_vpc.wild_construct.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "wild-construct-db-${count.index + 1}"
    Tier = "database"
    Type = "private"
  }
}
```

#### Security Groups Configuration
```terraform
# DMZ Security Group - Load Balancer
resource "aws_security_group" "dmz_lb" {
  name_prefix = "wild-construct-dmz-lb-"
  vpc_id      = aws_vpc.wild_construct.id
  
  # HTTPS only
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }
  
  # HTTP redirect to HTTPS
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP redirect to HTTPS"
  }
  
  # Outbound to app servers only
  egress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.app_servers.id]
    description     = "To app servers"
  }
  
  tags = {
    Name = "wild-construct-dmz-lb"
    Tier = "dmz"
  }
}

# Application Security Group
resource "aws_security_group" "app_servers" {
  name_prefix = "wild-construct-app-"
  vpc_id      = aws_vpc.wild_construct.id
  
  # From load balancer only
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.dmz_lb.id]
    description     = "From load balancer"
  }
  
  # SSH from bastion host only
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
    description     = "SSH from bastion"
  }
  
  # To database
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.database.id]
    description     = "To PostgreSQL"
  }
  
  # To Redis
  egress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.redis.id]
    description     = "To Redis cache"
  }
  
  # HTTPS for external APIs
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS for external APIs"
  }
  
  tags = {
    Name = "wild-construct-app-servers"
    Tier = "application"
  }
}

# Database Security Group
resource "aws_security_group" "database" {
  name_prefix = "wild-construct-db-"
  vpc_id      = aws_vpc.wild_construct.id
  
  # From app servers only
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_servers.id]
    description     = "From app servers"
  }
  
  # From bastion for administration
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
    description     = "Admin access from bastion"
  }
  
  tags = {
    Name = "wild-construct-database"
    Tier = "database"
  }
}
```

### Container Security Configuration

#### Docker Security Best Practices
```dockerfile
# Multi-stage build for smaller attack surface
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Production image
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Security hardening
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Set security headers
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1024"

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app ./

# Remove unnecessary files
RUN rm -rf .next/cache

# Run as non-root user
USER nextjs

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["npm", "start"]
```

#### Kubernetes Security Configuration
```yaml
# Security-hardened Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wild-construct-app
  namespace: production
  labels:
    app: wild-construct
    tier: application
    security-level: high
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: wild-construct
  template:
    metadata:
      labels:
        app: wild-construct
        tier: application
    spec:
      # Security Context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      
      # Service Account with minimal permissions
      serviceAccountName: wild-construct-app
      automountServiceAccountToken: false
      
      containers:
      - name: app
        image: wild-construct:latest
        imagePullPolicy: Always
        
        # Container Security Context
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL
        
        # Resource limits
        resources:
          limits:
            memory: "1Gi"
            cpu: "500m"
            ephemeral-storage: "1Gi"
          requests:
            memory: "512Mi"
            cpu: "250m"
            ephemeral-storage: "512Mi"
        
        # Environment variables from secrets
        envFrom:
        - secretRef:
            name: wild-construct-secrets
        - configMapRef:
            name: wild-construct-config
            
        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # Writable volumes for temporary data
        volumeMounts:
        - name: tmp-volume
          mountPath: /tmp
        - name: cache-volume
          mountPath: /app/.next/cache
          
      volumes:
      - name: tmp-volume
        emptyDir:
          sizeLimit: "1Gi"
      - name: cache-volume
        emptyDir:
          sizeLimit: "512Mi"
      
      # Pod Security
      hostNetwork: false
      hostPID: false
      hostIPC: false
      
      # Node selection
      nodeSelector:
        node-type: "application"
      
      # Pod anti-affinity for availability
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - wild-construct
              topologyKey: kubernetes.io/hostname
```

## 🔐 Application Security Configuration

### Environment Variables Security
```bash
#!/bin/bash
# secure-env-setup.sh - Secure environment variable management

# Database encryption key (generated uniquely per environment)
export DATABASE_ENCRYPTION_KEY=$(openssl rand -base64 32)

# JWT secrets (RS256 key pair)
openssl genpkey -algorithm RSA -out jwt-private.key -pkcs8 -aes256
openssl pkey -in jwt-private.key -pubout -out jwt-public.key

export JWT_PRIVATE_KEY=$(cat jwt-private.key | base64 -w 0)
export JWT_PUBLIC_KEY=$(cat jwt-public.key | base64 -w 0)

# Session encryption key
export SESSION_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Redis password
export REDIS_PASSWORD=$(openssl rand -base64 24)

# Database connection with encryption
export DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require&sslrootcert=ca-certificate.crt"

# API keys (use external key management service in production)
export EXTERNAL_API_KEYS=$(vault kv get -field=keys secret/wild-construct/api)

# Security configuration
export SECURITY_CONFIG=$(cat <<EOF
{
  "encryption": {
    "algorithm": "AES-256-GCM",
    "keyRotationDays": 90,
    "backupEncryption": true
  },
  "authentication": {
    "mfaRequired": true,
    "sessionTimeoutMinutes": 30,
    "maxLoginAttempts": 5
  },
  "monitoring": {
    "auditLogging": true,
    "securityEvents": true,
    "performanceMetrics": true
  }
}
EOF
)

# Remove temporary key files
rm -f jwt-private.key jwt-public.key

echo "✅ Security environment configured"
```

### Application Security Headers
```typescript
// security-middleware.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = [
  // Helmet for security headers
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-eval'", // Required for React
          "https://cdn.jsdelivr.net"
        ],
        imgSrc: [
          "'self'", 
          "data:", 
          "https:",
          "blob:"
        ],
        connectSrc: [
          "'self'",
          "wss:",
          "https://api.wildConstruct.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        childSrc: ["'none'"],
        workerSrc: ["'self'"]
      }
    },
    
    // Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    // Expect Certificate Transparency
    expectCt: {
      maxAge: 30,
      enforce: true
    },
    
    // Referrer Policy
    referrerPolicy: {
      policy: ["strict-origin-when-cross-origin"]
    },
    
    // Permissions Policy
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
        notifications: ["'self'"]
      }
    }
  }),
  
  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    
    // Custom key generator for authenticated users
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    
    // Skip successful requests for authenticated users
    skip: (req) => {
      return req.user && req.rateLimit.remaining > 10;
    }
  }),
  
  // Custom security headers
  (req: Request, res: Response, next: NextFunction) => {
    // Server information hiding
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'Wild Construct');
    
    // Custom security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Cache control for sensitive pages
    if (req.path.includes('/api/') || req.path.includes('/dashboard/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  }
];
```

### Database Security Configuration
```sql
-- PostgreSQL security configuration

-- Create encrypted database
CREATE DATABASE wild_construct WITH
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  TEMPLATE = template0;

-- Enable row level security
ALTER DATABASE wild_construct SET row_security = on;

-- Create security roles
CREATE ROLE wild_construct_app WITH
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  NOREPLICATION
  CONNECTION LIMIT 50;

CREATE ROLE wild_construct_readonly WITH
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  NOREPLICATION
  CONNECTION LIMIT 10;

-- Set secure password policy
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Grant minimal permissions
GRANT CONNECT ON DATABASE wild_construct TO wild_construct_app;
GRANT USAGE ON SCHEMA public TO wild_construct_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO wild_construct_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO wild_construct_app;

-- Read-only access
GRANT CONNECT ON DATABASE wild_construct TO wild_construct_readonly;
GRANT USAGE ON SCHEMA public TO wild_construct_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO wild_construct_readonly;

-- Enable audit logging
CREATE EXTENSION IF NOT EXISTS pgaudit;
ALTER DATABASE wild_construct SET pgaudit.log = 'all';
ALTER DATABASE wild_construct SET pgaudit.log_catalog = off;

-- Enable SSL/TLS
ALTER SYSTEM SET ssl = 'on';
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';
ALTER SYSTEM SET ssl_ca_file = 'ca.crt';
ALTER SYSTEM SET ssl_min_protocol_version = 'TLSv1.2';

-- Security settings
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = 'on';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_hostname = 'on';

-- Restart required for SSL changes
SELECT pg_reload_conf();
```

## 📊 Security Monitoring Deployment

### SIEM Configuration
```yaml
# ELK Stack for security monitoring
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - xpack.security.http.ssl.enabled=true
      - xpack.security.transport.ssl.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
      - ./certs:/usr/share/elasticsearch/config/certs
    ports:
      - "9200:9200"
    networks:
      - elk
    
  kibana:
    image: kibana:8.8.0
    environment:
      - ELASTICSEARCH_HOSTS=https://elasticsearch:9200
      - ELASTICSEARCH_USERNAME=kibana_system
      - ELASTICSEARCH_PASSWORD=${KIBANA_PASSWORD}
      - ELASTICSEARCH_SSL_CERTIFICATEAUTHORITIES=/usr/share/kibana/config/certs/ca.crt
    volumes:
      - ./certs:/usr/share/kibana/config/certs
    ports:
      - "5601:5601"
    networks:
      - elk
    depends_on:
      - elasticsearch
  
  logstash:
    image: logstash:8.8.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml
      - ./certs:/usr/share/logstash/config/certs
    environment:
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
    ports:
      - "5044:5044"
      - "9600:9600"
    networks:
      - elk
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:

networks:
  elk:
```

### Security Monitoring Configuration
```ruby
# logstash/pipeline/security.conf
input {
  beats {
    port => 5044
    ssl => true
    ssl_certificate => "/usr/share/logstash/config/certs/logstash.crt"
    ssl_key => "/usr/share/logstash/config/certs/logstash.key"
  }
  
  http {
    port => 8080
    codec => "json"
    ssl => true
    ssl_certificate => "/usr/share/logstash/config/certs/logstash.crt"
    ssl_key => "/usr/share/logstash/config/certs/logstash.key"
  }
}

filter {
  # Parse application logs
  if [fields][logtype] == "application" {
    grok {
      match => { 
        "message" => "\[%{TIMESTAMP_ISO8601:timestamp}\] %{LOGLEVEL:level}: %{GREEDYDATA:msg}"
      }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
  
  # Security event enrichment
  if [fields][logtype] == "security" {
    mutate {
      add_field => { "event_category" => "security" }
    }
    
    # Detect brute force attacks
    if [event_type] == "login_failed" {
      aggregate {
        task_id => "%{client_ip}"
        code => "
          map['failed_attempts'] ||= 0
          map['failed_attempts'] += 1
          if map['failed_attempts'] >= 5
            event.set('security_alert', 'brute_force_detected')
            event.set('alert_severity', 'high')
          end
        "
        map_action => "update"
        timeout => 300
      }
    }
    
    # Detect privilege escalation
    if [event_type] == "permission_change" {
      if [details][permission_level] == "admin" {
        mutate {
          add_field => { "security_alert" => "privilege_escalation_detected" }
          add_field => { "alert_severity" => "critical" }
        }
      }
    }
  }
  
  # GeoIP enrichment
  geoip {
    source => "client_ip"
    target => "geoip"
  }
}

output {
  # Send to Elasticsearch
  elasticsearch {
    hosts => ["https://elasticsearch:9200"]
    user => "elastic"
    password => "${ELASTIC_PASSWORD}"
    cacert => "/usr/share/logstash/config/certs/ca.crt"
    index => "security-logs-%{+YYYY.MM.dd}"
  }
  
  # Send security alerts to dedicated index
  if [security_alert] {
    elasticsearch {
      hosts => ["https://elasticsearch:9200"]
      user => "elastic"
      password => "${ELASTIC_PASSWORD}"
      cacert => "/usr/share/logstash/config/certs/ca.crt"
      index => "security-alerts-%{+YYYY.MM.dd}"
    }
  }
  
  # Send to stdout for debugging
  stdout {
    codec => rubydebug
  }
}
```

## 🚨 Security Alerting Configuration

### Prometheus Security Metrics
```yaml
# prometheus.yml - Security monitoring configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "security_rules.yml"
  - "application_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Application metrics
  - job_name: 'wild-construct-app'
    static_configs:
      - targets: ['app:3000']
    scrape_interval: 10s
    metrics_path: '/metrics'
    
  # Node exporter for system metrics
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
    
  # Database metrics
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
  
  # Security-specific metrics
  - job_name: 'security-metrics'
    static_configs:
      - targets: ['app:3001'] # Dedicated security metrics endpoint
    scrape_interval: 5s # More frequent for security
```

### Security Alert Rules
```yaml
# security_rules.yml
groups:
  - name: security_alerts
    rules:
      # High failed login rate
      - alert: HighFailedLoginRate
        expr: rate(auth_login_failed_total[5m]) > 0.5
        for: 2m
        labels:
          severity: warning
          category: security
        annotations:
          summary: "High failed login rate detected"
          description: "Failed login rate is {{ $value }} per second over the last 5 minutes"
          
      # Brute force attack detection
      - alert: BruteForceAttack
        expr: increase(auth_login_failed_total[1m]) > 10
        for: 0m
        labels:
          severity: critical
          category: security
        annotations:
          summary: "Potential brute force attack detected"
          description: "{{ $value }} failed login attempts in the last minute"
          
      # Unusual data access patterns
      - alert: UnusualDataAccess
        expr: rate(data_access_bytes_total[10m]) > 100000000 # 100MB/sec
        for: 5m
        labels:
          severity: warning
          category: security
        annotations:
          summary: "Unusual data access pattern detected"
          description: "Data access rate is {{ $value }} bytes/sec, which is unusually high"
          
      # SSL certificate expiration
      - alert: SSLCertificateExpiring
        expr: probe_ssl_earliest_cert_expiry - time() < 86400 * 7 # 7 days
        for: 0m
        labels:
          severity: warning
          category: infrastructure
        annotations:
          summary: "SSL certificate expiring soon"
          description: "SSL certificate for {{ $labels.instance }} expires in {{ $value }} seconds"
          
      # Database connection anomalies
      - alert: DatabaseConnectionSpike
        expr: rate(database_connections_total[5m]) > 50
        for: 2m
        labels:
          severity: warning
          category: infrastructure
        annotations:
          summary: "Database connection spike detected"
          description: "Database connection rate is {{ $value }} per second"
```

## 🔧 Operational Security Procedures

### Security Incident Response Runbook
```bash
#!/bin/bash
# security-incident-response.sh

set -euo pipefail

# Configuration
INCIDENT_ID="${1:-$(date +%s)}"
SEVERITY="${2:-medium}"  # low, medium, high, critical
INCIDENT_TYPE="${3:-unknown}"
LOG_FILE="/var/log/security/incident-${INCIDENT_ID}.log"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

alert() {
    local message="$1"
    log "ALERT: ${message}"
    
    if [[ -n "${ALERT_WEBHOOK}" ]]; then
        curl -X POST "${ALERT_WEBHOOK}" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"Security Incident ${INCIDENT_ID}: ${message}\"}"
    fi
}

# Phase 1: Immediate Response
immediate_response() {
    log "=== PHASE 1: IMMEDIATE RESPONSE ==="
    
    case "${SEVERITY}" in
        critical)
            log "CRITICAL incident detected. Initiating emergency procedures."
            # Activate incident response team
            alert "CRITICAL SECURITY INCIDENT - All hands on deck"
            
            # Consider temporary service shutdown
            read -p "Shutdown service temporarily? (y/N): " -n 1 -r
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log "Initiating service shutdown..."
                systemctl stop wild-construct
                systemctl stop nginx
            fi
            ;;
            
        high)
            log "HIGH severity incident. Escalating to security team."
            alert "HIGH PRIORITY: Security incident requires immediate attention"
            ;;
            
        medium)
            log "MEDIUM severity incident. Standard response procedures."
            ;;
            
        low)
            log "LOW severity incident. Monitoring and documentation."
            ;;
    esac
}

# Phase 2: Assessment and Containment
assess_and_contain() {
    log "=== PHASE 2: ASSESSMENT AND CONTAINMENT ==="
    
    # Collect system state
    log "Collecting system state..."
    {
        echo "=== SYSTEM INFO ==="
        uname -a
        date
        uptime
        
        echo "=== PROCESS LIST ==="
        ps auxf
        
        echo "=== NETWORK CONNECTIONS ==="
        netstat -tulpn
        
        echo "=== RECENT LOGINS ==="
        last -n 20
        
        echo "=== FAILED LOGINS ==="
        grep "Failed password" /var/log/auth.log | tail -20
        
        echo "=== DISK USAGE ==="
        df -h
        
        echo "=== MEMORY USAGE ==="
        free -h
        
    } > "/tmp/system-state-${INCIDENT_ID}.txt"
    
    # Check for specific incident types
    case "${INCIDENT_TYPE}" in
        brute_force)
            log "Analyzing brute force attack..."
            # Block offending IPs
            grep "Failed password" /var/log/auth.log | \
                awk '{print $11}' | sort | uniq -c | sort -nr | \
                head -10 | while read count ip; do
                    if [[ $count -gt 10 ]]; then
                        log "Blocking IP ${ip} (${count} failed attempts)"
                        iptables -A INPUT -s "${ip}" -j DROP
                    fi
                done
            ;;
            
        data_breach)
            log "Potential data breach detected. Preserving evidence..."
            # Create memory dump
            if command -v gcore >/dev/null; then
                gcore -o "/tmp/memory-dump-${INCIDENT_ID}" "$(pgrep -f wild-construct)"
            fi
            
            # Preserve logs
            cp -r /var/log/wild-construct "/tmp/logs-backup-${INCIDENT_ID}"
            ;;
            
        malware)
            log "Malware detection. Isolating system..."
            # Disconnect from network
            for interface in $(ip link show | grep -E '^[0-9]+:' | cut -d: -f2 | grep -v lo); do
                ip link set "${interface}" down
            done
            ;;
    esac
}

# Phase 3: Evidence Collection
collect_evidence() {
    log "=== PHASE 3: EVIDENCE COLLECTION ==="
    
    local evidence_dir="/tmp/evidence-${INCIDENT_ID}"
    mkdir -p "${evidence_dir}"
    
    # Application logs
    log "Collecting application logs..."
    cp -r /var/log/wild-construct "${evidence_dir}/app-logs" 2>/dev/null || true
    
    # System logs
    log "Collecting system logs..."
    journalctl --since "1 hour ago" > "${evidence_dir}/system-journal.log"
    cp /var/log/auth.log "${evidence_dir}/" 2>/dev/null || true
    cp /var/log/syslog "${evidence_dir}/" 2>/dev/null || true
    
    # Database logs (if accessible)
    log "Collecting database logs..."
    sudo -u postgres psql -c "\copy (SELECT * FROM audit_log WHERE created_at >= NOW() - INTERVAL '1 hour') TO '${evidence_dir}/database-audit.csv' CSV HEADER" wild_construct 2>/dev/null || true
    
    # Network captures
    if command -v tcpdump >/dev/null; then
        log "Starting network capture..."
        timeout 60 tcpdump -i any -w "${evidence_dir}/network-capture.pcap" 2>/dev/null &
    fi
    
    # File system integrity
    log "Checking file integrity..."
    find /etc/wild-construct -type f -exec sha256sum {} \; > "${evidence_dir}/file-checksums.txt"
    
    # Create evidence archive
    tar -czf "/tmp/evidence-${INCIDENT_ID}.tar.gz" "${evidence_dir}"
    log "Evidence collected: /tmp/evidence-${INCIDENT_ID}.tar.gz"
}

# Phase 4: Recovery
recovery() {
    log "=== PHASE 4: RECOVERY ==="
    
    # Restore from clean backup if necessary
    if [[ "${SEVERITY}" == "critical" ]]; then
        log "Considering system restore from clean backup..."
        # Implementation depends on backup strategy
    fi
    
    # Restart services if they were stopped
    if ! systemctl is-active --quiet wild-construct; then
        log "Restarting Wild Construct services..."
        systemctl start wild-construct
        systemctl start nginx
    fi
    
    # Update security configurations
    log "Updating security configurations..."
    # Force password resets for affected users
    # Update firewall rules
    # Rotate API keys if compromised
}

# Phase 5: Post-Incident
post_incident() {
    log "=== PHASE 5: POST-INCIDENT ==="
    
    # Generate incident report
    cat > "/tmp/incident-report-${INCIDENT_ID}.md" <<EOF
# Security Incident Report

**Incident ID:** ${INCIDENT_ID}
**Date/Time:** $(date)
**Severity:** ${SEVERITY}
**Type:** ${INCIDENT_TYPE}

## Summary
[Brief description of the incident]

## Timeline
$(grep -E '\[(.*)\]' "${LOG_FILE}" | head -20)

## Impact Assessment
[Description of impact to systems, data, users]

## Root Cause Analysis
[Analysis of how the incident occurred]

## Actions Taken
[List of immediate and remedial actions]

## Lessons Learned
[What we learned and how to prevent future incidents]

## Recommendations
[Specific recommendations for improvement]
EOF

    log "Incident report generated: /tmp/incident-report-${INCIDENT_ID}.md"
    alert "Incident ${INCIDENT_ID} response completed. Report available."
}

# Main execution
main() {
    log "Starting security incident response for ID: ${INCIDENT_ID}"
    log "Severity: ${SEVERITY}, Type: ${INCIDENT_TYPE}"
    
    immediate_response
    assess_and_contain
    collect_evidence
    recovery
    post_incident
    
    log "Security incident response completed for ID: ${INCIDENT_ID}"
}

# Handle script interruption
trap 'log "Script interrupted. Incident response may be incomplete."' INT TERM

# Execute main function
main "$@"
```

### Backup and Recovery Security
```bash
#!/bin/bash
# secure-backup.sh

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/wild-construct}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"
GPG_RECIPIENT="${GPG_RECIPIENT:-backup@wildConstruct.com}"
S3_BUCKET="${S3_BUCKET:-wild-construct-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Database backup with encryption
backup_database() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/database_${timestamp}.sql.gz.gpg"
    
    log "Starting encrypted database backup..."
    
    # Create encrypted database dump
    pg_dump wild_construct | \
        gzip | \
        gpg --trust-model always --encrypt --recipient "${GPG_RECIPIENT}" \
        > "${backup_file}"
    
    # Verify backup integrity
    if gpg --quiet --decrypt "${backup_file}" | gunzip | head -10 >/dev/null 2>&1; then
        log "Database backup verified: ${backup_file}"
    else
        log "ERROR: Database backup verification failed!"
        return 1
    fi
    
    # Upload to secure cloud storage
    aws s3 cp "${backup_file}" "s3://${S3_BUCKET}/database/" \
        --server-side-encryption AES256 \
        --storage-class STANDARD_IA
    
    log "Database backup completed and uploaded"
}

# Application data backup
backup_application() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/application_${timestamp}.tar.gz.gpg"
    
    log "Starting application data backup..."
    
    # Create encrypted application backup
    tar -czf - \
        /opt/wild-construct/data \
        /etc/wild-construct \
        --exclude="*.tmp" \
        --exclude="*.log" | \
    gpg --trust-model always --encrypt --recipient "${GPG_RECIPIENT}" \
        > "${backup_file}"
    
    # Upload to cloud storage
    aws s3 cp "${backup_file}" "s3://${S3_BUCKET}/application/" \
        --server-side-encryption AES256 \
        --storage-class STANDARD_IA
    
    log "Application backup completed and uploaded"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    # Local cleanup
    find "${BACKUP_DIR}" -type f -mtime +${RETENTION_DAYS} -delete
    
    # S3 cleanup (relies on lifecycle policies)
    log "Local backup cleanup completed"
}

# Verify backup integrity
verify_backups() {
    log "Verifying backup integrity..."
    
    # Check latest database backup
    latest_db_backup=$(ls -t "${BACKUP_DIR}"/database_*.sql.gz.gpg 2>/dev/null | head -1)
    if [[ -n "${latest_db_backup}" ]]; then
        if gpg --quiet --decrypt "${latest_db_backup}" | gunzip | head -10 >/dev/null 2>&1; then
            log "✅ Latest database backup integrity verified"
        else
            log "❌ Database backup integrity check failed"
        fi
    fi
    
    # Check S3 backups
    if aws s3 ls "s3://${S3_BUCKET}/" >/dev/null 2>&1; then
        log "✅ S3 backup access verified"
    else
        log "❌ S3 backup access failed"
    fi
}

# Main execution
main() {
    # Ensure backup directory exists
    mkdir -p "${BACKUP_DIR}"
    
    # Check prerequisites
    command -v pg_dump >/dev/null || { log "ERROR: pg_dump not found"; exit 1; }
    command -v gpg >/dev/null || { log "ERROR: gpg not found"; exit 1; }
    command -v aws >/dev/null || { log "ERROR: aws cli not found"; exit 1; }
    
    # Perform backups
    backup_database
    backup_application
    
    # Verify backups
    verify_backups
    
    # Cleanup
    cleanup_old_backups
    
    log "Secure backup process completed successfully"
}

# Execute main function
main "$@"
```

## 📋 Security Deployment Validation

### Security Testing Checklist
- [ ] Vulnerability scanning completed (OWASP ZAP, Nessus)
- [ ] Penetration testing performed
- [ ] SSL/TLS configuration validated (SSLLabs A+ rating)
- [ ] Security headers verified
- [ ] Authentication flows tested
- [ ] Authorization controls validated
- [ ] Encryption implementation verified
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting validated
- [ ] Incident response procedures rehearsed

### Production Security Sign-off
```yaml
# security-signoff.yml
security_review:
  date: "2025-07-22"
  reviewer: "Chief Information Security Officer"
  version: "v1.0.0"
  
  checklist:
    infrastructure_security: ✅
    application_security: ✅
    data_protection: ✅
    monitoring_alerting: ✅
    incident_response: ✅
    backup_recovery: ✅
    compliance_review: ✅
    penetration_testing: ✅
    
  approval: "APPROVED FOR PRODUCTION DEPLOYMENT"
  conditions:
    - "Security monitoring must be active before deployment"
    - "Incident response team must be on standby"
    - "Backup procedures must be verified"
    - "SSL certificates must be monitored"
    
  next_review: "2025-10-22"
```

---

**Document Control**:
- Version: 1.0
- Classification: Internal - Technical
- Last Updated: July 2025
- Owner: DevOps Security Team
- Review Frequency: Quarterly