import React from 'react';
/**
 * Encryption status types
 */
export type EncryptionStatusType = 'encrypted' | 'not_encrypted' | 'encrypting' | 'decrypting' | 'error' | 'unknown';
/**
 * Encryption algorithm types
 */
export type EncryptionAlgorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'AES-128-GCM' | 'RSA-2048' | 'RSA-4096' | 'ChaCha20-Poly1305' | 'unknown';
/**
 * Encryption state interface
 */
export interface EncryptionState {
    status: EncryptionStatusType;
    algorithm?: EncryptionAlgorithm;
    keyId?: string;
    lastEncrypted?: number;
    lastDecrypted?: number;
    error?: string;
    dataSize?: number;
    encryptionTime?: number;
    strength?: 'weak' | 'medium' | 'strong';
}
interface EncryptionStatusProps {
    encryptionState: EncryptionState;
    className?: string;
    showDetails?: boolean;
}
export declare const EncryptionStatus: React.FC<EncryptionStatusProps>;
export declare const EncryptionStatusIcon: React.FC<{
    encryptionState: EncryptionState;
    onClick?: () => void;
}>;
export declare     onDecrypt?: () => void;
    onChangeAlgorithm?: (algorithm: EncryptionAlgorithm) => void;
}>;
export {};
//# sourceMappingURL=EncryptionStatus.d.ts.map