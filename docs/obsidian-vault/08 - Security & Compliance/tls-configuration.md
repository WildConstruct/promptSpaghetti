# TLS Configuration System

## Overview

This document describes the comprehensive TLS (Transport Layer Security) configuration system implemented for PromptScape as part of Epic 19: Authentication Enhancement & Security Hardening.

The TLS system provides secure HTTPS communication, certificate management, and security hardening features for both development and production environments.

## Architecture

### Core Components

#### 1. TLSConfigManager

The central class responsible for managing TLS configuration, validation, and security settings.

```typescript
import { TLSConfigManager, loadTLSConfigFromEnv } from './security/tls-config';

const tlsConfig = loadTLSConfigFromEnv();
const tlsManager = new TLSConfigManager(tlsConfig);
```

#### 2. CertificateManager

Handles certificate loading, validation, and information extraction.

```typescript
import { CertificateManager } from './security/tls-config';

const certificates = CertificateManager.loadCertificates(config);
const certInfo = CertificateManager.getCertificateInfo('/path/to/cert.crt');
```

#### 3. EnhancedServer

Enhanced Fastify server with built-in TLS support and HTTP/HTTPS dual-mode operation.

```typescript
import { startEnhancedServer } from './server-tls';

const server = await startEnhancedServer();
```

## Configuration

### Environment Variables

The TLS system is configured through environment variables:

```bash
# Basic TLS Configuration
TLS_ENABLED=true                    # Enable/disable TLS
HTTPS_PORT=8443                     # HTTPS port (default: 8443)
PORT=8000                          # HTTP port (default: 8000)

# Certificate Paths
TLS_CERT_PATH=/etc/ssl/certs/server.crt    # Certificate file path
TLS_KEY_PATH=/etc/ssl/private/server.key   # Private key file path
TLS_CA_PATH=/etc/ssl/certs/ca.crt          # CA certificate path (optional)
TLS_PASSPHRASE=secret                      # Private key passphrase (optional)

# TLS Protocol Configuration
TLS_MIN_VERSION=TLSv1.2            # Minimum TLS version
TLS_MAX_VERSION=TLSv1.3            # Maximum TLS version

# HSTS Configuration
HSTS_MAX_AGE=31536000              # HSTS max-age in seconds (1 year)

# Node Environment
NODE_ENV=production                 # Automatically enables TLS in production
```

### Configuration Presets

#### Development Configuration

```typescript
import { createDevelopmentTLSConfig } from './security/tls-config';

const devConfig = createDevelopmentTLSConfig();
// Features:
// - Self-signed certificates
// - HSTS disabled
// - Relaxed security settings
// - Port 8443
```

#### Production Configuration

```typescript
import { createProductionTLSConfig } from './security/tls-config';

const prodConfig = createProductionTLSConfig();
// Features:
// - Valid certificates required
// - HSTS enabled with 2-year max-age
// - Strict security settings
// - Port 443
// - OCSP stapling enabled
```

## Certificate Management

### Development Certificates

For development, use the included certificate generation script:

```bash
# Generate development certificates
./scripts/generate-dev-certs.sh

# This creates:
# - ./certs/localhost.crt (certificate)
# - ./certs/localhost.key (private key)
# - ./certs/localhost.pem (bundle)
# - ./certs/.env.development (environment config)
# - ./certs/README.md (installation instructions)
```

### Production Certificates

For production, obtain certificates from a trusted Certificate Authority (CA):

1. **Let's Encrypt (Recommended)**

   ```bash
   # Using Certbot
   certbot certonly --standalone -d yourdomain.com

   # Certificates will be in:
   # /etc/letsencrypt/live/yourdomain.com/fullchain.pem
   # /etc/letsencrypt/live/yourdomain.com/privkey.pem
   ```

2. **Commercial CA**
   - Purchase certificate from CA (DigiCert, GlobalSign, etc.)
   - Generate CSR and private key
   - Install provided certificate

3. **Internal CA**
   - Use your organization's internal Certificate Authority
   - Follow internal certificate request procedures

### Certificate Information

Get detailed certificate information:

```typescript
const certInfo = CertificateManager.getCertificateInfo('/path/to/cert.crt');

console.log('Certificate Details:');
console.log('Subject:', certInfo.subject);
console.log('Issuer:', certInfo.issuer);
console.log('Valid From:', certInfo.valid_from);
console.log('Valid To:', certInfo.valid_to);
console.log('Days Until Expiry:', certInfo.expiryDays);
console.log('Warnings:', certInfo.warnings);
```

## Server Setup

### Basic Setup

```typescript
import { EnhancedServer } from './server-tls';

const server = new EnhancedServer();

// Initialize and start
await server.initialize();
await server.start();

// Server now runs on:
// - HTTP: http://localhost:8000 (redirects to HTTPS if TLS enabled)
// - HTTPS: https://localhost:8443 (if TLS enabled)
```

### Advanced Setup

```typescript
import { TLSConfigManager, loadTLSConfigFromEnv } from './security/tls-config';
import { EnhancedServer } from './server-tls';

// Custom TLS configuration
const tlsConfig = loadTLSConfigFromEnv();
const tlsManager = new TLSConfigManager(tlsConfig);

// Validate configuration
const validation = tlsManager.validateConfiguration();
if (!validation.valid) {
  console.error('TLS configuration errors:', validation.errors);
  process.exit(1);
}

// Create and start server
const server = new EnhancedServer();
await server.initialize();
await server.start();
```

## Security Features

### HSTS (HTTP Strict Transport Security)

Automatically configured when TLS is enabled:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Security Headers

All HTTPS responses include comprehensive security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

### Cipher Suite Configuration

Modern, secure cipher suites are enforced:

- TLS 1.3: `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`
- TLS 1.2: `ECDHE-RSA-AES256-GCM-SHA384`, `ECDHE-RSA-AES128-GCM-SHA256`
- Weak ciphers (RC4, DES, etc.) are explicitly disabled

### Protocol Versions

- **Minimum**: TLS 1.2 (configurable)
- **Maximum**: TLS 1.3 (configurable)
- **Disabled**: SSL 3.0, TLS 1.0, TLS 1.1 (deprecated and insecure)

## Validation and Monitoring

### Configuration Validation

```typescript
const validation = tlsManager.validateConfiguration();

console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);
console.log('Warnings:', validation.warnings);
console.log('Recommendations:', validation.recommendations);
```

### Certificate Monitoring

```typescript
// Watch for certificate changes
tlsManager.watchCertificates((event, filename) => {
  console.log(`Certificate file changed: ${filename}`);
  // Implement certificate reload logic
});

// Get certificate information
const certInfo = validation.certificateInfo;
if (certInfo && certInfo.expiryDays < 30) {
  console.warn(`Certificate expires in ${certInfo.expiryDays} days!`);
}
```

### TLS Connection Testing

```typescript
// Test TLS connection
const testResult = await tlsManager.testTLSConnection('localhost', 8443);

if (testResult.connected) {
  console.log('TLS test successful');
  console.log('Protocol:', testResult.protocol);
  console.log('Cipher:', testResult.cipher);
} else {
  console.error('TLS test failed:', testResult.error);
}
```

## API Endpoints

### Health Checks

#### Basic Health Check

```bash
GET /health
```

Response:

```json
{
  "status": "healthy",
  "protocol": "https",
  "secure": true,
  "database": "connected",
  "websocket": {
    "status": "healthy",
    "connections": 5,
    "activeDocuments": 3,
    "uptime": 86400
  },
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

#### TLS-Specific Health Check

```bash
GET /health/tls
```

Response:

```json
{
  "status": "tls-healthy",
  "secure": true,
  "tls": {
    "protocol": "TLSv1.3",
    "cipher": {
      "name": "TLS_AES_256_GCM_SHA384",
      "version": "TLSv1.3"
    },
    "authorized": true
  },
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

## Deployment Configurations

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

# Copy certificates
COPY certs/ /etc/ssl/certs/
COPY certs/ /etc/ssl/private/

# Set permissions
RUN chmod 644 /etc/ssl/certs/*.crt
RUN chmod 600 /etc/ssl/private/*.key

# Environment configuration
ENV TLS_ENABLED=true
ENV TLS_CERT_PATH=/etc/ssl/certs/server.crt
ENV TLS_KEY_PATH=/etc/ssl/private/server.key
ENV HTTPS_PORT=8443

EXPOSE 8000 8443

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  promptscape:
    build: .
    ports:
      - '8000:8000' # HTTP
      - '8443:8443' # HTTPS
    environment:
      - NODE_ENV=production
      - TLS_ENABLED=true
      - TLS_CERT_PATH=/etc/ssl/certs/server.crt
      - TLS_KEY_PATH=/etc/ssl/private/server.key
    volumes:
      - ./certs:/etc/ssl/certs:ro
      - ./certs:/etc/ssl/private:ro
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: promptscape
spec:
  replicas: 3
  selector:
    matchLabels:
      app: promptscape
  template:
    metadata:
      labels:
        app: promptscape
    spec:
      containers:
        - name: promptscape
          image: promptscape:latest
          ports:
            - containerPort: 8000
            - containerPort: 8443
          env:
            - name: NODE_ENV
              value: 'production'
            - name: TLS_ENABLED
              value: 'true'
            - name: TLS_CERT_PATH
              value: '/etc/ssl/certs/tls.crt'
            - name: TLS_KEY_PATH
              value: '/etc/ssl/private/tls.key'
          volumeMounts:
            - name: tls-certs
              mountPath: /etc/ssl/certs
              readOnly: true
            - name: tls-keys
              mountPath: /etc/ssl/private
              readOnly: true
      volumes:
        - name: tls-certs
          secret:
            secretName: tls-certificates
        - name: tls-keys
          secret:
            secretName: tls-private-keys
---
apiVersion: v1
kind: Service
metadata:
  name: promptscape-service
spec:
  selector:
    app: promptscape
  ports:
    - name: http
      port: 80
      targetPort: 8000
    - name: https
      port: 443
      targetPort: 8443
  type: LoadBalancer
```

## Load Balancer Configuration

### Nginx Configuration

```nginx
# nginx.conf
upstream promptscape {
    server 127.0.0.1:8443;
    server 127.0.0.1:8444;  # Multiple instances
}

server {
    listen 80;
    server_name promptscape.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name promptscape.com;

    ssl_certificate /etc/ssl/certs/promptscape.crt;
    ssl_certificate_key /etc/ssl/private/promptscape.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location / {
        proxy_pass https://promptscape;
        proxy_ssl_verify off;  # Since backend uses self-signed certs
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HAProxy Configuration

```haproxy
# haproxy.cfg
global
    ssl-default-bind-ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2 no-sslv3

frontend https_frontend
    bind *:443 ssl crt /etc/ssl/certs/promptscape.pem
    redirect scheme https if !{ ssl_fc }
    default_backend promptscape_backend

backend promptscape_backend
    balance roundrobin
    option httpchk GET /health
    server app1 127.0.0.1:8443 check ssl verify none
    server app2 127.0.0.1:8444 check ssl verify none
```

## Troubleshooting

### Common Issues

#### 1. Certificate Not Trusted

```bash
# Check certificate validity
openssl x509 -in certs/localhost.crt -text -noout

# Verify certificate chain
openssl verify -CAfile ca.crt server.crt

# Test TLS connection
openssl s_client -connect localhost:8443 -servername localhost
```

#### 2. Permission Errors

```bash
# Check file permissions
ls -la certs/

# Fix permissions
chmod 644 certs/*.crt
chmod 600 certs/*.key
```

#### 3. Port Already in Use

```bash
# Check what's using the port
lsof -i :8443

# Kill process if needed
kill -9 <PID>
```

#### 4. HTTPS Redirect Loop

- Ensure HTTP server is properly configured for redirects
- Check that HTTPS server is listening on correct port
- Verify proxy configuration if using reverse proxy

### Debug Mode

Enable detailed TLS logging:

```bash
# Environment variable
export DEBUG=tls:*

# Or in Node.js
process.env.NODE_DEBUG = 'tls';
```

### Testing Commands

```bash
# Test HTTP redirect
curl -I http://localhost:8000

# Test HTTPS endpoint
curl -k https://localhost:8443/health

# Test with certificate validation
curl --cacert certs/localhost.crt https://localhost:8443/health

# Test TLS-specific endpoint
curl -k https://localhost:8443/health/tls

# Check SSL Labs rating (for public domains)
# Visit: https://www.ssllabs.com/ssltest/
```

## Security Best Practices

### Certificate Management

1. **Use strong key sizes**: Minimum 2048-bit RSA or 256-bit ECC
2. **Regular rotation**: Renew certificates before expiration
3. **Secure storage**: Protect private keys with appropriate permissions
4. **Monitor expiration**: Set up alerts for certificate expiry

### TLS Configuration

1. **Modern protocols only**: Disable TLS 1.0/1.1, prefer TLS 1.3
2. **Strong cipher suites**: Use AEAD ciphers, avoid deprecated ciphers
3. **Perfect Forward Secrecy**: Use ECDHE key exchange
4. **HSTS enabled**: Enforce HTTPS with appropriate max-age

### Operational Security

1. **Regular updates**: Keep TLS libraries and certificates current
2. **Monitoring**: Track TLS connections and certificate status
3. **Incident response**: Have procedures for certificate compromise
4. **Testing**: Regular security scans and penetration testing

## Performance Considerations

### TLS Optimization

- **Session resumption**: Enable TLS session caching
- **OCSP stapling**: Reduce client-side certificate validation overhead
- **HTTP/2**: Enable for improved performance over TLS
- **Certificate chains**: Optimize certificate chain length

### Load Balancing

- **TLS termination**: Consider terminating TLS at load balancer
- **Connection pooling**: Reuse TLS connections when possible
- **Health checks**: Monitor TLS endpoint availability

## Compliance and Standards

### Supported Standards

- **TLS 1.2/1.3**: Modern transport security
- **RFC 7525**: Recommendations for Secure Use of TLS
- **FIPS 140-2**: Federal cryptographic standards (when required)
- **Common Criteria**: Security evaluation standards

### Compliance Frameworks

- **SOC 2**: Security controls for service organizations
- **ISO 27001**: Information security management
- **PCI DSS**: Payment card industry security
- **GDPR**: Data protection regulation compliance

This TLS configuration system provides enterprise-grade security while maintaining flexibility for different deployment scenarios and security requirements.
