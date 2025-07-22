/**
 * Extension Install Dialog - Epic 8.4 Story 8.4.5
 * Dialog for installing extensions from files or URLs
 */

import React, { useState, useRef } from 'react';
import { ExtensionManifest, parseExtensionManifest } from '../../extensions/ExtensionManifest-simple';
import { extensionCompatibilityChecker } from '../../extensions/ExtensionCompatibilityChecker';

export interface ExtensionInstallDialogProps {
  onInstall: (extension: ExtensionManifest) => Promise<void>;
  onCancel: () => void;
}

export const ExtensionInstallDialog: React.FC<ExtensionInstallDialogProps> = ({
  onInstall,
  onCancel
}) => {
  const [installMethod, setInstallMethod] = useState<'file' | 'url' | 'dev'>('file');
  const [manifestUrl, setManifestUrl] = useState('');
  const [devPath, setDevPath] = useState('');
  const [manifestContent, setManifestContent] = useState<string>('');
  const [parsedManifest, setParsedManifest] = useState<ExtensionManifest | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'validate' | 'confirm'>('select');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    try {
      if (file.name.endsWith('.json')) {
        // Direct manifest file
        const content = await file.text();
        setManifestContent(content);
        await validateManifest(content);
      } else if (file.name.endsWith('.zip') || file.name.endsWith('.tar.gz')) {
        // Extension package
        setError('Extension packages are not yet supported. Please select a manifest.json file.');
      } else {
        setError('Please select a valid manifest.json file or extension package.');
      }
    } catch (err) {
      setError(`Failed to read file: ${err}`);
    }
  };

  const handleUrlInstall = async () => {
    if (!manifestUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setError(null);
    setIsValidating(true);

    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      setManifestContent(content);
      await validateManifest(content);
    } catch (err) {
      setError(`Failed to fetch manifest: ${err}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDevInstall = async () => {
    if (!devPath.trim()) {
      setError('Please enter a valid path');
      return;
    }

    setError(null);
    setIsValidating(true);

    try {
      // In a real implementation, this would use a file system API
      // For now, simulate loading a development extension
      const mockManifest = {
        manifest_version: '1.0',
        id: 'dev-extension',
        name: 'Development Extension',
        version: '0.1.0',
        description: 'Development extension loaded from local path',
        author: 'Developer',
        extension_type: 'node' as const,
        capabilities: {
          provides: ['test-functionality'],
          requires: ['runtime-nodes']
        },
        dependencies: {
          system_version: '^1.0.0'
        },
        permissions: ['data-processing'],
        runtime: {
          entry_point: 'dist/index',
          node_types: ['TestNode']
        },
        development: {
          path: devPath,
          auto_reload: true
        }
      };

      const content = JSON.stringify(mockManifest, null, 2);
      setManifestContent(content);
      await validateManifest(content);
    } catch (err) {
      setError(`Failed to load development extension: ${err}`);
    } finally {
      setIsValidating(false);
    }
  };

  const validateManifest = async (content: string) => {
    setIsValidating(true);
    setError(null);

    try {
      // Parse and validate manifest
      const manifest = parseExtensionManifest(content);
      setParsedManifest(manifest);

      // Check compatibility
      const compatibility = extensionCompatibilityChecker.checkExtensionCompatibility(
        manifest,
        {
          systemVersion: '1.0.0',
          platform: 'web',
          availableExtensions: new Map(),
          grantedPermissions: ['data-processing', 'ui-components']
        }
      );
      
      setCompatibilityResult(compatibility);
      setStep('validate');
    } catch (err) {
      setError(`Invalid manifest: ${err}`);
      setParsedManifest(null);
      setCompatibilityResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInstall = async () => {
    if (!parsedManifest) return;

    try {
      await onInstall(parsedManifest);
    } catch (err) {
      setError(`Installation failed: ${err}`);
    }
  };

  const renderSelectStep = () => (
    <div className="install-step select-step">
      <h3>Choose Installation Method</h3>
      
      <div className="install-methods">
        <div 
          className={`install-method ${installMethod === 'file' ? 'active' : ''}`}
          onClick={() => setInstallMethod('file')}
        >
          <div className="method-icon">📁</div>
          <div className="method-info">
            <h4>From File</h4>
            <p>Install from a local manifest.json or extension package</p>
          </div>
        </div>

        <div 
          className={`install-method ${installMethod === 'url' ? 'active' : ''}`}
          onClick={() => setInstallMethod('url')}
        >
          <div className="method-icon">🌐</div>
          <div className="method-info">
            <h4>From URL</h4>
            <p>Install directly from a manifest URL</p>
          </div>
        </div>

        <div 
          className={`install-method ${installMethod === 'dev' ? 'active' : ''}`}
          onClick={() => setInstallMethod('dev')}
        >
          <div className="method-icon">🛠️</div>
          <div className="method-info">
            <h4>Development Mode</h4>
            <p>Load an extension from a local development path</p>
          </div>
        </div>
      </div>

      <div className="install-input-section">
        {installMethod === 'file' && (
          <div className="file-input-section">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.zip,.tar.gz"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              className="file-select-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Select File
            </button>
            <p className="input-help">
              Select a manifest.json file or extension package (.zip, .tar.gz)
            </p>
          </div>
        )}

        {installMethod === 'url' && (
          <div className="url-input-section">
            <input
              type="url"
              className="url-input"
              placeholder="https://example.com/extension/manifest.json"
              value={manifestUrl}
              onChange={(e) => setManifestUrl(e.target.value)}
            />
            <button 
              className="url-install-btn"
              onClick={handleUrlInstall}
              disabled={!manifestUrl.trim() || isValidating}
            >
              {isValidating ? '⏳ Loading...' : '📥 Load Manifest'}
            </button>
            <p className="input-help">
              Enter the URL to an extension manifest.json file
            </p>
          </div>
        )}

        {installMethod === 'dev' && (
          <div className="dev-input-section">
            <input
              type="text"
              className="path-input"
              placeholder="/path/to/extension/directory"
              value={devPath}
              onChange={(e) => setDevPath(e.target.value)}
            />
            <button 
              className="dev-install-btn"
              onClick={handleDevInstall}
              disabled={!devPath.trim() || isValidating}
            >
              {isValidating ? '⏳ Loading...' : '🛠️ Load Extension'}
            </button>
            <p className="input-help">
              Enter the path to your development extension directory
            </p>
            <div className="dev-warning">
              ⚠️ Development extensions run with elevated privileges
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderValidateStep = () => (
    <div className="install-step validate-step">
      <h3>Extension Validation</h3>
      
      {parsedManifest && (
        <div className="extension-preview">
          <div className="extension-header">
            <h4>{parsedManifest.name}</h4>
            <span className="version">v{parsedManifest.version}</span>
          </div>
          <p className="description">{parsedManifest.description}</p>
          <div className="extension-meta">
            <span>by {parsedManifest.author}</span>
            <span>•</span>
            <span>{parsedManifest.extension_type} extension</span>
          </div>
        </div>
      )}

      {compatibilityResult && (
        <div className="compatibility-results">
          <h4>Compatibility Check</h4>
          
          <div className={`compatibility-status ${compatibilityResult.compatible ? 'compatible' : 'incompatible'}`}>
            <span className="status-icon">
              {compatibilityResult.compatible ? '✅' : '❌'}
            </span>
            <span className="status-text">
              {compatibilityResult.compatible ? 'Compatible' : 'Incompatible'}
            </span>
          </div>

          {compatibilityResult.issues.length > 0 && (
            <div className="compatibility-issues">
              <h5>Issues:</h5>
              {compatibilityResult.issues.map((issue: any, index: number) => (
                <div key={index} className={`issue ${issue.severity}`}>
                  <span className="issue-icon">
                    {issue.severity === 'error' ? '❌' : '⚠️'}
                  </span>
                  <span className="issue-message">{issue.message}</span>
                </div>
              ))}
            </div>
          )}

          {compatibilityResult.warnings.length > 0 && (
            <div className="compatibility-warnings">
              <h5>Warnings:</h5>
              {compatibilityResult.warnings.map((warning: string, index: number) => (
                <div key={index} className="warning">
                  <span className="warning-icon">⚠️</span>
                  <span className="warning-message">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {compatibilityResult.recommendations.length > 0 && (
            <div className="compatibility-recommendations">
              <h5>Recommendations:</h5>
              {compatibilityResult.recommendations.map((rec: string, index: number) => (
                <div key={index} className="recommendation">
                  <span className="rec-icon">💡</span>
                  <span className="rec-message">{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="permissions-section">
        <h4>Requested Permissions</h4>
        {parsedManifest?.permissions && parsedManifest.permissions.length > 0 ? (
          <ul className="permissions-list">
            {parsedManifest.permissions.map((permission, index) => (
              <li key={index} className="permission-item">
                <span className="permission-name">{permission}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>This extension does not request any permissions.</p>
        )}
      </div>

      <div className="validate-actions">
        <button className="back-btn" onClick={() => setStep('select')}>
          ← Back
        </button>
        <button 
          className="continue-btn"
          onClick={() => setStep('confirm')}
          disabled={!compatibilityResult?.compatible}
        >
          Continue →
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="install-step confirm-step">
      <h3>Confirm Installation</h3>
      
      {parsedManifest && (
        <div className="installation-summary">
          <div className="summary-header">
            <h4>Ready to install {parsedManifest.name}</h4>
            <p>Please review the installation details below:</p>
          </div>

          <div className="summary-details">
            <div className="detail-row">
              <span className="label">Extension Name:</span>
              <span className="value">{parsedManifest.name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Version:</span>
              <span className="value">{parsedManifest.version}</span>
            </div>
            <div className="detail-row">
              <span className="label">Author:</span>
              <span className="value">{parsedManifest.author}</span>
            </div>
            <div className="detail-row">
              <span className="label">Type:</span>
              <span className="value">{parsedManifest.extension_type}</span>
            </div>
            {installMethod === 'dev' && (
              <div className="detail-row">
                <span className="label">Development Mode:</span>
                <span className="value warning">⚠️ Enabled</span>
              </div>
            )}
          </div>

          <div className="installation-warnings">
            {installMethod === 'dev' && (
              <div className="warning-box">
                <span className="warning-icon">⚠️</span>
                <div className="warning-content">
                  <strong>Development Mode Warning</strong>
                  <p>This extension will run in development mode with elevated privileges. Only install extensions from trusted sources.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="confirm-actions">
        <button className="back-btn" onClick={() => setStep('validate')}>
          ← Back
        </button>
        <button className="install-btn" onClick={handleInstall}>
          Install Extension
        </button>
      </div>
    </div>
  );

  return (
    <div className="extension-install-dialog-overlay">
      <div className="extension-install-dialog">
        <div className="dialog-header">
          <h2>Install Extension</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="dialog-content">
          {error && (
            <div className="error-banner">
              <span className="error-icon">❌</span>
              <span className="error-message">{error}</span>
              <button className="dismiss-btn" onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {step === 'select' && renderSelectStep()}
          {step === 'validate' && renderValidateStep()}
          {step === 'confirm' && renderConfirmStep()}
        </div>

        <div className="dialog-footer">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionInstallDialog;