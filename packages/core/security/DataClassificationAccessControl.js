/**
 * Data Classification Access Control Model
 *
 * Implements a comprehensive access control framework that combines:
 * - Role-Based Access Control (RBAC)
 * - Attribute-Based Access Control (ABAC)
 * - Data Classification-Aware Access Policies
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
/**
 * Standard Classification Roles
 */
export const STANDARD_CLASSIFICATION_ROLES = {
    // System Roles
    SYSTEM_ADMIN: {
        name: 'System Administrator',
        maxClassification: 'RESTRICTED',
        category: 'SYSTEM',
        riskLevel: 'CRITICAL'
    },
    SECURITY_OFFICER: {
        name: 'Security Officer',
        maxClassification: 'RESTRICTED',
        category: 'ADMINISTRATIVE',
        riskLevel: 'HIGH'
    },
    COMPLIANCE_OFFICER: {
        name: 'Compliance Officer',
        maxClassification: 'CONFIDENTIAL',
        category: 'ADMINISTRATIVE',
        riskLevel: 'MEDIUM'
    },
    // Data Roles
    DATA_OWNER: {
        name: 'Data Owner',
        maxClassification: 'RESTRICTED',
        category: 'DATA_OWNER',
        riskLevel: 'HIGH'
    },
    DATA_STEWARD: {
        name: 'Data Steward',
        maxClassification: 'CONFIDENTIAL',
        category: 'DATA_OWNER',
        riskLevel: 'MEDIUM'
    },
    DATA_CUSTODIAN: {
        name: 'Data Custodian',
        maxClassification: 'INTERNAL',
        category: 'FUNCTIONAL',
        riskLevel: 'MEDIUM'
    },
    // Functional Roles
    ANALYST: {
        name: 'Data Analyst',
        maxClassification: 'CONFIDENTIAL',
        category: 'FUNCTIONAL',
        riskLevel: 'MEDIUM'
    },
    DEVELOPER: {
        name: 'Developer',
        maxClassification: 'INTERNAL',
        category: 'FUNCTIONAL',
        riskLevel: 'LOW'
    },
    USER: {
        name: 'Standard User',
        maxClassification: 'INTERNAL',
        category: 'FUNCTIONAL',
        riskLevel: 'LOW'
    },
    VIEWER: {
        name: 'Read-Only User',
        maxClassification: 'PUBLIC',
        category: 'FUNCTIONAL',
        riskLevel: 'LOW'
    }
};
/**
 * Standard Access Control Matrix
 */
export const ACCESS_CONTROL_MATRIX = {
    PUBLIC: {
        READ: ['VIEWER', 'USER', 'DEVELOPER', 'ANALYST', 'DATA_CUSTODIAN', 'DATA_STEWARD', 'DATA_OWNER'],
        WRITE: ['USER', 'DEVELOPER', 'DATA_CUSTODIAN', 'DATA_STEWARD', 'DATA_OWNER'],
        DELETE: ['DATA_STEWARD', 'DATA_OWNER'],
        EXPORT: ['USER', 'DEVELOPER', 'ANALYST', 'DATA_CUSTODIAN', 'DATA_STEWARD', 'DATA_OWNER'],
        SHARE: ['USER', 'DEVELOPER', 'ANALYST', 'DATA_CUSTODIAN', 'DATA_STEWARD', 'DATA_OWNER']
    },
    INTERNAL: {
        READ: ['USER', 'DEVELOPER', 'ANALYST', 'DATA_CUSTODIAN', 'DATA_STEWARD', 'DATA_OWNER'],
        WRITE: ['DEVELOPER', 'DATA_CUSTODIAN', 'DATA_STEWARD', 'DATA_OWNER'],
        DELETE: ['DATA_STEWARD', 'DATA_OWNER'],
        EXPORT: ['ANALYST', 'DATA_STEWARD', 'DATA_OWNER'],
        SHARE: ['DATA_STEWARD', 'DATA_OWNER']
    },
    CONFIDENTIAL: {
        READ: ['ANALYST', 'DATA_STEWARD', 'DATA_OWNER', 'COMPLIANCE_OFFICER'],
        WRITE: ['DATA_STEWARD', 'DATA_OWNER'],
        DELETE: ['DATA_OWNER'],
        EXPORT: ['DATA_OWNER'], // Requires approval
        SHARE: ['DATA_OWNER'] // Requires approval
    },
    RESTRICTED: {
        READ: ['DATA_OWNER', 'SECURITY_OFFICER', 'SYSTEM_ADMIN'], // Requires approval
        WRITE: ['DATA_OWNER'], // Requires approval
        DELETE: ['DATA_OWNER', 'SYSTEM_ADMIN'], // Requires approval
        EXPORT: [], // Prohibited or requires exceptional approval
        SHARE: [] // Prohibited
    }
};
