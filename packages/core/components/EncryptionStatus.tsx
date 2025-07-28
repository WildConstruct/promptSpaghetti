import React from 'react';
/**
 * Encryption status types
 */
export type EncryptionStatusType = 
  | 'encrypted'          // Data is encrypted
  | 'not_encrypted'      // Data is not encrypted
  | 'encrypting'         // Encryption in progress
  | 'decrypting'         // Decryption in progress
  | 'error'              // Encryption/decryption error
  | 'unknown';           // Status unknown
/**
 * Encryption algorithm types
 */
export type EncryptionAlgorithm = 
  | 'AES-256-GCM'
  | 'AES-256-CBC'
  | 'AES-128-GCM'
  | 'RSA-2048'
  | 'RSA-4096'
  | 'ChaCha20-Poly1305'
  | 'unknown';
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
  encryptionTime?: number; // milliseconds
  strength?: 'weak' | 'medium' | 'strong';
}
interface EncryptionStatusProps {
  encryptionState: EncryptionState;
  className?: string;
  showDetails?: boolean;
}

export const EncryptionStatus: React.FC<EncryptionStatusProps> = ({)
  encryptionState,
  className = '',
  showDetails = false
}) => {
  const getStatusColor = (status: EncryptionStatusType): string => {
    switch (status) {
    case 'encrypted':
      return 'text-green-500';
    case 'encrypting':
    case 'decrypting':
      return 'text-yellow-500';
    case 'not_encrypted':
      return 'text-orange-500';
    case 'error':
      return 'text-red-500';
    case 'unknown':
    default:
      return 'text-gray-500';
    }
  };
  const getStatusIcon = (status: EncryptionStatusType): string => {
    switch (status) {
    case 'encrypted':
      return '🔒';
    case 'encrypting':
    case 'decrypting':
      return '🔄';
    case 'not_encrypted':
      return '🔓';
    case 'error':
      return '⚠️';
    case 'unknown':
    default:
      return '❓';
    }
  };
  const getStatusText = (status: EncryptionStatusType): string => {
    switch (status) {
    case 'encrypted':
      return 'Encrypted';
    case 'encrypting':
      return 'Encrypting...';
    case 'decrypting':
      return 'Decrypting...';
    case 'not_encrypted':
      return 'Not Encrypted';
    case 'error':
      return 'Encryption Error';
    case 'unknown':
    default:
      return 'Unknown';
    }
  };
  const getStrengthColor = (strength?: string): string => {
    switch (strength) {
    case 'strong':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'weak':
      return 'text-red-600';
    default:
      return 'text-gray-600';
    }
  };
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  const formatDataSize = (size?: number): string => {
    if (!size) return 'Unknown';
    if (size < 1024) return `${size} B`;}
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;}
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;}
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;}
  };
  return ();
    <div className={`flex items-center space-x-2 ${className}`}>}
      <span 
        className={`text-sm ${getStatusColor(encryptionState.status)}`}
        title={`Encryption: ${getStatusText(encryptionState.status)}`}
      >
        {getStatusIcon(encryptionState.status)}
      </span>
      <span className="text-sm text-gray-600">
        {getStatusText(encryptionState.status)}
      </span>
      {encryptionState.algorithm && ()
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {encryptionState.algorithm}
        </span>
      )}
      {encryptionState.strength && ()
        <span 
          className={`text-xs font-semibold ${getStrengthColor(encryptionState.strength)}`}
          title={`Encryption strength: ${encryptionState.strength}`}
        >
          {encryptionState.strength.toUpperCase()}
        </span>
      )}
      {encryptionState.error && ()
        <span 
          className="text-xs text-red-600 cursor-help" 
          title={encryptionState.error}
        >
          ⚠
        </span>
      )}
      {showDetails && ()
        <div className="text-xs text-gray-500 space-x-2">
          {encryptionState.lastEncrypted && ()
            <span>
              Last encrypted: {formatTime(encryptionState.lastEncrypted)}
            </span>
          )}
          {encryptionState.dataSize && ()
            <span>
              Size: {formatDataSize(encryptionState.dataSize)}
            </span>
          )}
          {encryptionState.encryptionTime && ()
            <span>
              ({encryptionState.encryptionTime}ms)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for status bars
export const EncryptionStatusIcon: React.FC<{
  encryptionState: EncryptionState;
  onClick?: () => void;
}> = ({ encryptionState, onClick }) => {
  const statusColor = {
    encrypted: '#10b981',     // green
    encrypting: '#f59e0b',    // yellow
    decrypting: '#f59e0b',    // yellow
    not_encrypted: '#f97316', // orange
    error: '#ef4444',         // red
    unknown: '#6b7280'        // gray,
  }[encryptionState.status];
  const statusIcon = {
    encrypted: '🔒',
    encrypting: '🔄',
    decrypting: '🔄',
    not_encrypted: '🔓',
    error: '⚠️',
    unknown: '❓',
  }[encryptionState.status];
  return ();
    <div 
      className="cursor-pointer flex items-center space-x-1" 
      onClick={onClick}
      title={`Encryption: ${encryptionState.status}${encryptionState.algorithm ? ` (${encryptionState.algorithm})` : ''}${encryptionState.error ? ` - ${encryptionState.error}` : ''}`}
    >
      <span className="text-sm">{statusIcon}</span>
      <svg 
        width="8" 
        height="8" 
        viewBox="0 0 8 8" 
        fill={statusColor}
        className={encryptionState.status === 'encrypting' || encryptionState.status === 'decrypting' ? 'animate-pulse' : ''}
      >
        <circle cx="4" cy="4" r="3" />
      </svg>
    </div>
  );
};

// Encryption details modal/dropdown content
export const EncryptionDetails: React.FC<{
  encryptionState: EncryptionState;
  onEncrypt?: () => void;
  onDecrypt?: () => void;
  onChangeAlgorithm?: (algorithm: EncryptionAlgorithm) => void;
}> = ({ )
  encryptionState, 
  onEncrypt, 
  onDecrypt, 
  onChangeAlgorithm 
}) => {
  const isEncrypted = encryptionState.status === 'encrypted';
  const isProcessing = encryptionState.status === 'encrypting' || encryptionState.status === 'decrypting';
  const canEncrypt = encryptionState.status === 'not_encrypted' && !isProcessing;
  const canDecrypt = encryptionState.status === 'encrypted' && !isProcessing;
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  const formatDataSize = (size?: number): string => {
    if (!size) return 'Unknown';
    if (size < 1024) return `${size} B`;}
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;}
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;}
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;}
  };
  const getStrengthDetails = (algorithm?: EncryptionAlgorithm): string => {
    switch (algorithm) {
    case 'AES-256-GCM':
    case 'AES-256-CBC':
    case 'ChaCha20-Poly1305':
      return 'Strong encryption (256-bit)';
    case 'AES-128-GCM':
      return 'Medium encryption (128-bit)';
    case 'RSA-2048':
      return 'Medium encryption (RSA 2048-bit)';
    case 'RSA-4096':
      return 'Strong encryption (RSA 4096-bit)';
    default:
      return 'Unknown encryption strength';
    }
  };
  return ();
    <div className="p-4 bg-white rounded-lg shadow-lg border w-80">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Encryption Status</h3>
          <EncryptionStatusIcon encryptionState={encryptionState} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${
              isEncrypted ? 'text-green-600' : 
                encryptionState.status === 'error' ? 'text-red-600' : 
                  encryptionState.status === 'not_encrypted' ? 'text-orange-600' :
                    'text-gray-600'
            }`}>
              {encryptionState.status.replace('_', ' ')}
            </span>
          </div>
          {encryptionState.algorithm && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Algorithm:</span>
              <span className="text-gray-900 font-mono text-xs">
                {encryptionState.algorithm}
              </span>
            </div>
          )}
          {encryptionState.strength && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Strength:</span>
              <span className={`font-medium ${
                encryptionState.strength === 'strong' ? 'text-green-600' :
                  encryptionState.strength === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
              }`}>
                {encryptionState.strength}
              </span>
            </div>
          )}
          {encryptionState.keyId && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Key ID:</span>
              <span className="text-gray-900 font-mono text-xs">
                {encryptionState.keyId.substring(0, 8)}...
              </span>
            </div>
          )}
          {encryptionState.lastEncrypted && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Last Encrypted:</span>
              <span className="text-gray-900 text-xs">
                {formatTime(encryptionState.lastEncrypted)}
              </span>
            </div>
          )}
          {encryptionState.lastDecrypted && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Last Decrypted:</span>
              <span className="text-gray-900 text-xs">
                {formatTime(encryptionState.lastDecrypted)}
              </span>
            </div>
          )}
          {encryptionState.dataSize && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Data Size:</span>
              <span className="text-gray-900">{formatDataSize(encryptionState.dataSize)}</span>
            </div>
          )}
          {encryptionState.encryptionTime && ()
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Time:</span>
              <span className="text-gray-900">{encryptionState.encryptionTime}ms</span>
            </div>
          )}
          {encryptionState.algorithm && ()
            <div className="flex flex-col">
              <span className="text-gray-600 mb-1">Security Details:</span>
              <span className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                {getStrengthDetails(encryptionState.algorithm)}
              </span>
            </div>
          )}
          {encryptionState.error && ()
            <div className="flex flex-col">
              <span className="text-gray-600 mb-1">Error:</span>
              <span className="text-red-600 text-xs bg-red-50 p-2 rounded">
                {encryptionState.error}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2 pt-2 border-t">
          {canEncrypt && onEncrypt && ()
            <button
              onClick={onEncrypt}
              className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center justify-center"
            >
              🔒 Encrypt
            </button>
          )}
          {canDecrypt && onDecrypt && ()
            <button
              onClick={onDecrypt}
              className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center justify-center"
            >
              🔓 Decrypt
            </button>
          )}
          {isProcessing && ()
            <div className="flex-1 px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm text-center">
              Processing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};