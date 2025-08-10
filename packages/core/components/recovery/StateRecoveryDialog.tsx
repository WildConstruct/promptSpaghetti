/**
 * State recovery dialog for handling corrupted or partial state restoration
 */

import React from 'react';
import { RecoveryReport } from '../../utils/stateRestoration';

interface StateRecoveryDialogProps {
  report: RecoveryReport;
  onAttemptRecovery: () => void;
  onStartFresh: () => void;
  onLoadFromFile: () => void;
  onClose?: () => void;
}

export function StateRecoveryDialog({
  report,
  onAttemptRecovery,
  onStartFresh,
  onLoadFromFile,
  onClose
}: StateRecoveryDialogProps) {
  const totalRecoverable = report.recoverable.nodes + report.recoverable.edges;
  const totalCorrupted = report.corrupted.nodes.length + report.corrupted.edges.length;
  const total = totalRecoverable + totalCorrupted;
  const recoveryPercentage = total > 0 ? Math.round((totalRecoverable / total) * 100) : 0;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      role="dialog"
      aria-labelledby="recovery-title"
      aria-describedby="recovery-description"
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
        }}
      >
        <h2
          id="recovery-title"
          style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '28px' }}>⚠️</span>
          State Recovery Needed
        </h2>
        
        <p
          id="recovery-description"
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6'
          }}
        >
          {report.details || 'We detected issues with your saved work. Choose how to proceed:'}
        </p>
        
        {/* Recovery Statistics */}
        <div
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            border: '1px solid #dee2e6'
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#495057'
            }}
          >
            Recovery Analysis
          </h3>
          
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
            <RecoveryStatRow
              label="Nodes"
              recoverable={report.recoverable.nodes}
              corrupted={report.corrupted.nodes.length}
            />
            <RecoveryStatRow
              label="Edges"
              recoverable={report.recoverable.edges}
              corrupted={report.corrupted.edges.length}
            />
            {report.recoverable.viewport && (
              <div style={{ color: '#28a745' }}>
                ✓ Viewport position recoverable
              </div>
            )}
            {report.recoverable.selection && (
              <div style={{ color: '#28a745' }}>
                ✓ Selection state recoverable
              </div>
            )}
          </div>
          
          {recoveryPercentage > 0 && (
            <div
              style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #dee2e6'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}
              >
                <span style={{ fontSize: '12px', color: '#6c757d' }}>
                  Recovery Rate
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#495057' }}>
                  {recoveryPercentage}%
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${recoveryPercentage}%`,
                    backgroundColor: recoveryPercentage > 80 ? '#28a745' : 
                                     recoveryPercentage > 50 ? '#ffc107' : '#dc3545',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Error Messages */}
        {report.errors.length > 0 && (
          <div
            style={{
              backgroundColor: '#f8d7da',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              border: '1px solid #f5c6cb'
            }}
          >
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                fontWeight: '600',
                color: '#721c24'
              }}
            >
              Errors Detected:
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '12px',
                color: '#721c24'
              }}
            >
              {report.errors.slice(0, 3).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {report.errors.length > 3 && (
                <li>...and {report.errors.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {report.recommendation !== 'reset' && (
            <button
              onClick={onAttemptRecovery}
              style={{
                padding: '12px 20px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#007bff',
                color: 'white',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              <span>🔧</span>
              Attempt Recovery
              {recoveryPercentage > 0 && (
                <span style={{ opacity: 0.9, fontSize: '13px' }}>
                  ({recoveryPercentage}% recoverable)
                </span>
              )}
            </button>
          )}
          
          <button
            onClick={onStartFresh}
            style={{
              padding: '12px 20px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              backgroundColor: report.recommendation === 'reset' ? '#28a745' : '#f8f9fa',
              color: report.recommendation === 'reset' ? 'white' : '#495057',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (report.recommendation === 'reset') {
                e.currentTarget.style.backgroundColor = '#218838';
              } else {
                e.currentTarget.style.backgroundColor = '#e9ecef';
              }
            }}
            onMouseLeave={(e) => {
              if (report.recommendation === 'reset') {
                e.currentTarget.style.backgroundColor = '#28a745';
              } else {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }
            }}
          >
            <span>🆕</span>
            Start Fresh
            {report.recommendation === 'reset' && (
              <span style={{ opacity: 0.9, fontSize: '13px' }}>
                (Recommended)
              </span>
            )}
          </button>
          
          <button
            onClick={onLoadFromFile}
            style={{
              padding: '12px 20px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa',
              color: '#495057',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
          >
            <span>📁</span>
            Load from File
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6c757d',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#495057';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6c757d';
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Recovery statistics row component
 */
function RecoveryStatRow({
  label,
  recoverable,
  corrupted
}: {
  label: string;
  recoverable: number;
  corrupted: number;
}) {
  const total = recoverable + corrupted;
  
  if (total === 0) {
    return (
      <div style={{ color: '#6c757d' }}>
        {label}: None found
      </div>
    );
  }
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span style={{ color: '#495057' }}>{label}:</span>
      <span>
        <span style={{ color: '#28a745', fontWeight: '500' }}>
          {recoverable}
        </span>
        {corrupted > 0 && (
          <>
            {' / '}
            <span style={{ color: '#dc3545', fontWeight: '500' }}>
              {corrupted} corrupted
            </span>
          </>
        )}
        <span style={{ color: '#6c757d', fontSize: '12px', marginLeft: '4px' }}>
          (of {total})
        </span>
      </span>
    </div>
  );
}