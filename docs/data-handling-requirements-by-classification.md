# Data Handling Requirements by Classification

## Overview

This document defines specific handling, storage, transmission, and processing requirements for each data classification level within the Prompt Spaghetti application. These requirements ensure appropriate security controls are applied based on data sensitivity.

## Classification-Based Requirements Matrix

### PUBLIC Data Handling

**Characteristics**: Information that can be freely shared without restriction

#### Storage Requirements
- **Encryption**: Not required, but recommended for consistency
- **Access Controls**: Read access for all users, write access by role
- **Backup**: Standard backup procedures sufficient
- **Retention**: Follow standard business retention policies
- **Location**: Any approved storage location

#### Transmission Requirements
- **Encryption in Transit**: Not required but recommended (TLS 1.2+)
- **Network Restrictions**: None
- **Logging**: Standard access logging
- **Compression**: Allowed without restrictions

#### Processing Requirements
- **Environment**: Any approved environment (dev, staging, prod)
- **Logging**: Standard application logging
- **Caching**: Unrestricted caching allowed
- **Third-party Processing**: Allowed with standard vendor agreements

#### Access Control Requirements
- **Authentication**: Standard user authentication
- **Authorization**: Role-based access sufficient
- **Audit Logging**: Standard access logging
- **Data Export**: Unrestricted export allowed

### INTERNAL Data Handling

**Characteristics**: Information for internal use only, not for external distribution

#### Storage Requirements
- **Encryption**: AES-256 at rest encryption required
- **Access Controls**: Internal users only, role-based restrictions
- **Backup**: Encrypted backups required
- **Retention**: Follow data retention policies with secure deletion
- **Location**: Internal infrastructure only, approved cloud regions

#### Transmission Requirements
- **Encryption in Transit**: TLS 1.3 required for all transmissions
- **Network Restrictions**: Internal networks only, VPN required for remote access
- **Logging**: Enhanced logging with user identification
- **Compression**: Allowed with encrypted channels only

#### Processing Requirements
- **Environment**: Production and staging only (dev with approval)
- **Logging**: Detailed processing logs with data access tracking
- **Caching**: Encrypted caching only, limited duration
- **Third-party Processing**: Requires explicit approval and DPA

#### Access Control Requirements
- **Authentication**: Multi-factor authentication required
- **Authorization**: Role-based with principle of least privilege
- **Audit Logging**: Comprehensive audit trail required
- **Data Export**: Controlled export with approval workflow

### CONFIDENTIAL Data Handling

**Characteristics**: Sensitive information requiring strict access controls

#### Storage Requirements
- **Encryption**: AES-256 at rest with key rotation every 90 days
- **Access Controls**: Need-to-know basis only, manager approval required
- **Backup**: Encrypted backups with separate key management
- **Retention**: Automated deletion based on data lifecycle policies
- **Location**: Hardened infrastructure, specific approved regions only

#### Transmission Requirements
- **Encryption in Transit**: TLS 1.3 with certificate pinning
- **Network Restrictions**: Secured networks only, no public internet transmission
- **Logging**: Full transmission logging with data classification tagging
- **Compression**: Encrypted compression only, approved algorithms

#### Processing Requirements
- **Environment**: Production only, isolated processing environments
- **Logging**: Detailed audit logs with data lineage tracking
- **Caching**: Encrypted caching with TTL limits, secure cache eviction
- **Third-party Processing**: Prohibited without explicit security assessment

#### Access Control Requirements
- **Authentication**: Strong MFA required (hardware tokens preferred)
- **Authorization**: Explicit approval required, time-limited access
- **Audit Logging**: Real-time audit logging with anomaly detection
- **Data Export**: Requires security team approval and DLP controls

### RESTRICTED Data Handling

**Characteristics**: Highly sensitive information with severe restrictions

#### Storage Requirements
- **Encryption**: AES-256 with hardware security modules (HSM)
- **Access Controls**: Named individuals only, security clearance required
- **Backup**: Air-gapped encrypted backups with dual control
- **Retention**: Immediate secure deletion when no longer needed
- **Location**: Dedicated secure infrastructure, on-premises preferred

#### Transmission Requirements
- **Encryption in Transit**: End-to-end encryption with perfect forward secrecy
- **Network Restrictions**: Dedicated secure channels only, no shared networks
- **Logging**: Real-time monitoring with immediate alerting
- **Compression**: Prohibited to prevent information leakage

#### Processing Requirements
- **Environment**: Dedicated secure environments only
- **Logging**: Complete audit trail with cryptographic integrity
- **Caching**: Prohibited unless in secure, isolated cache
- **Third-party Processing**: Prohibited without regulatory approval

#### Access Control Requirements
- **Authentication**: Multi-layered authentication with biometrics
- **Authorization**: Dual approval required, time and purpose limited
- **Audit Logging**: Real-time logging with tamper detection
- **Data Export**: Prohibited except for legal/regulatory requirements

## Technical Implementation Requirements

### Database Schema Requirements

```sql
-- Classification metadata table
CREATE TABLE data_classification (
    id UUID PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255),
    classification ENUM('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED') NOT NULL,
    handling_requirements JSONB NOT NULL,
    effective_date TIMESTAMP NOT NULL,
    review_date TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255) NOT NULL
);

-- Handling requirements structure
CREATE TYPE handling_requirements AS (
    encryption_required BOOLEAN,
    encryption_algorithm VARCHAR(50),
    key_rotation_days INTEGER,
    access_logging_level VARCHAR(20),
    retention_days INTEGER,
    backup_encryption BOOLEAN,
    network_restrictions TEXT[],
    processing_environments TEXT[],
    approval_required BOOLEAN,
    audit_requirements TEXT[]
);
```

### Application Code Integration

```typescript
// Handling requirements interface
interface HandlingRequirements {
  storage: StorageRequirements;
  transmission: TransmissionRequirements;
  processing: ProcessingRequirements;
  access: AccessRequirements;
}

interface StorageRequirements {
  encryptionRequired: boolean;
  encryptionAlgorithm: string;
  keyRotationDays: number;
  accessControls: string[];
  backupEncryption: boolean;
  retentionDays: number;
  approvedLocations: string[];
}

interface TransmissionRequirements {
  tlsVersion: string;
  certificatePinning: boolean;
  networkRestrictions: string[];
  loggingLevel: 'STANDARD' | 'ENHANCED' | 'COMPREHENSIVE';
  compressionAllowed: boolean;
}

interface ProcessingRequirements {
  approvedEnvironments: string[];
  loggingRequired: boolean;
  cachingRestrictions: CachingRestrictions;
  thirdPartyProcessing: boolean;
}

interface AccessRequirements {
  authenticationLevel: 'STANDARD' | 'MFA' | 'STRONG_MFA' | 'BIOMETRIC';
  authorizationRequired: boolean;
  auditLogging: 'STANDARD' | 'ENHANCED' | 'REALTIME';
  exportRestrictions: boolean;
}

// Implementation service
class DataHandlingService {
  getHandlingRequirements(classification: string): HandlingRequirements {
    const requirements = this.requirementsMatrix[classification];
    if (!requirements) {
      throw new Error(`Unknown classification: ${classification}`);
    }
    return requirements;
  }
  
  validateHandling(data: any, classification: string, operation: string): ValidationResult {
    const requirements = this.getHandlingRequirements(classification);
    return this.validateOperation(data, requirements, operation);
  }
  
  enforceHandling(data: any, classification: string, context: OperationContext): Promise<void> {
    const requirements = this.getHandlingRequirements(classification);
    return this.applyRequirements(data, requirements, context);
  }
}
```

### Encryption Implementation

```typescript
// Classification-based encryption service
class ClassificationEncryptionService {
  async encryptData(data: any, classification: string): Promise<EncryptedData> {
    const requirements = this.getEncryptionRequirements(classification);
    
    switch (classification) {
      case 'PUBLIC':
        return data; // No encryption required
        
      case 'INTERNAL':
        return this.aes256Encrypt(data, await this.getInternalKey());
        
      case 'CONFIDENTIAL':
        return this.aes256EncryptWithRotation(data, await this.getConfidentialKey());
        
      case 'RESTRICTED':
        return this.hsmEncrypt(data, await this.getRestrictedKey());
        
      default:
        throw new Error(`Unknown classification: ${classification}`);
    }
  }
  
  async decryptData(encryptedData: EncryptedData, classification: string): Promise<any> {
    // Implementation with appropriate decryption based on classification
  }
  
  private getEncryptionRequirements(classification: string): EncryptionRequirements {
    return {
      'PUBLIC': { required: false },
      'INTERNAL': { required: true, algorithm: 'AES-256-GCM', keyRotation: 365 },
      'CONFIDENTIAL': { required: true, algorithm: 'AES-256-GCM', keyRotation: 90 },
      'RESTRICTED': { required: true, algorithm: 'AES-256-GCM', keyRotation: 30, hsm: true }
    }[classification];
  }
}
```

### Access Control Integration

```typescript
// Classification-based access control
class ClassificationAccessControl {
  async validateAccess(userId: string, dataId: string, operation: string): Promise<boolean> {
    const classification = await this.getDataClassification(dataId);
    const userPermissions = await this.getUserPermissions(userId);
    const requirements = this.getAccessRequirements(classification);
    
    // Check authentication level
    if (!this.validateAuthenticationLevel(userPermissions.authLevel, requirements.authenticationLevel)) {
      return false;
    }
    
    // Check authorization
    if (requirements.authorizationRequired && !await this.checkApproval(userId, dataId, operation)) {
      return false;
    }
    
    // Check time restrictions
    if (!this.validateTimeRestrictions(userPermissions, requirements)) {
      return false;
    }
    
    // Log access attempt
    await this.logAccess(userId, dataId, operation, classification, true);
    return true;
  }
  
  private getAccessRequirements(classification: string): AccessRequirements {
    return {
      'PUBLIC': {
        authenticationLevel: 'STANDARD',
        authorizationRequired: false,
        auditLogging: 'STANDARD',
        exportRestrictions: false
      },
      'INTERNAL': {
        authenticationLevel: 'MFA',
        authorizationRequired: false,
        auditLogging: 'ENHANCED',
        exportRestrictions: false
      },
      'CONFIDENTIAL': {
        authenticationLevel: 'STRONG_MFA',
        authorizationRequired: true,
        auditLogging: 'REALTIME',
        exportRestrictions: true
      },
      'RESTRICTED': {
        authenticationLevel: 'BIOMETRIC',
        authorizationRequired: true,
        auditLogging: 'REALTIME',
        exportRestrictions: true
      }
    }[classification];
  }
}
```

## Compliance Mapping

### GDPR Compliance
- **Personal Data**: Automatically classified as CONFIDENTIAL minimum
- **Special Categories**: Classified as RESTRICTED
- **Right to be Forgotten**: Automated deletion capabilities
- **Data Portability**: Controlled export mechanisms

### HIPAA Compliance
- **PHI**: Classified as RESTRICTED
- **Minimum Necessary**: Access controls enforce need-to-know
- **Audit Trail**: Comprehensive logging for all access
- **Encryption**: End-to-end encryption required

### PCI DSS Compliance
- **CHD**: Classified as RESTRICTED
- **Network Segmentation**: Dedicated secure environments
- **Access Controls**: Strong authentication and authorization
- **Key Management**: HSM-based key protection

### SOC 2 Compliance
- **Type II Controls**: Automated control implementation
- **Change Management**: Classification change approval workflows
- **Monitoring**: Real-time compliance monitoring
- **Incident Response**: Automated breach detection

## Monitoring and Alerting

### Real-time Monitoring

```typescript
// Classification monitoring service
class ClassificationMonitoringService {
  async monitorDataAccess(event: DataAccessEvent): Promise<void> {
    const classification = await this.getDataClassification(event.dataId);
    const requirements = this.getMonitoringRequirements(classification);
    
    // Check for anomalous access patterns
    if (await this.detectAnomalousAccess(event, classification)) {
      await this.triggerSecurityAlert(event, 'ANOMALOUS_ACCESS');
    }
    
    // Check compliance with handling requirements
    if (!await this.validateHandlingCompliance(event, requirements)) {
      await this.triggerComplianceAlert(event, 'HANDLING_VIOLATION');
    }
    
    // Log for audit trail
    await this.logEvent(event, classification, requirements);
  }
  
  private getMonitoringRequirements(classification: string) {
    return {
      'PUBLIC': { alerting: false, anomalyDetection: false },
      'INTERNAL': { alerting: true, anomalyDetection: true, threshold: 'LOW' },
      'CONFIDENTIAL': { alerting: true, anomalyDetection: true, threshold: 'MEDIUM' },
      'RESTRICTED': { alerting: true, anomalyDetection: true, threshold: 'HIGH', realtime: true }
    }[classification];
  }
}
```

### Compliance Reporting

```typescript
// Automated compliance reporting
class ClassificationComplianceReporter {
  async generateComplianceReport(period: DateRange): Promise<ComplianceReport> {
    const classifications = await this.getAllClassifications();
    const violations = await this.getViolations(period);
    const accessPatterns = await this.getAccessPatterns(period);
    
    return {
      period,
      summary: {
        totalDataElements: classifications.length,
        violationCount: violations.length,
        complianceScore: this.calculateComplianceScore(violations, classifications)
      },
      byClassification: this.groupByClassification(classifications, violations),
      recommendations: this.generateRecommendations(violations),
      trends: this.analyzeTrends(accessPatterns)
    };
  }
}
```

## Implementation Checklist

### Development Phase
- [ ] Database schema for classification metadata
- [ ] Classification service implementation
- [ ] Encryption service with classification support
- [ ] Access control integration
- [ ] Monitoring and alerting setup
- [ ] API integration for handling requirements

### Testing Phase
- [ ] Unit tests for classification logic
- [ ] Integration tests for access controls
- [ ] Security tests for encryption
- [ ] Compliance validation tests
- [ ] Performance tests for overhead
- [ ] Penetration testing for bypass attempts

### Deployment Phase
- [ ] Production infrastructure hardening
- [ ] Key management system setup
- [ ] Monitoring dashboard configuration
- [ ] Alerting rule configuration
- [ ] Backup and recovery testing
- [ ] Incident response procedures

### Operational Phase
- [ ] Staff training on classification requirements
- [ ] Regular compliance audits
- [ ] Classification review processes
- [ ] Incident response exercises
- [ ] Vendor assessment for third-party data
- [ ] Continuous monitoring optimization

## Metrics and KPIs

### Security Metrics
- Classification compliance rate
- Unauthorized access attempts
- Encryption coverage percentage
- Key rotation compliance
- Security incident frequency

### Operational Metrics  
- Classification accuracy rate
- Access request processing time
- System performance impact
- User productivity impact
- Cost of compliance implementation

### Compliance Metrics
- Regulatory audit findings
- Violation remediation time
- Training completion rates
- Policy update frequency
- Third-party compliance status

This comprehensive handling requirements framework ensures that data at each classification level receives appropriate protection while maintaining operational efficiency and regulatory compliance.