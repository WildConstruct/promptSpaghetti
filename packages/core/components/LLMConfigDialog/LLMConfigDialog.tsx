import React, { useState, useCallback } from 'react';
import { getLLMService } from '../../services/SimpleLLMService';

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  dialog: {
    background: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  body: {
    padding: '20px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    background: '#fff'
  },
  apiKeyInput: {
    display: 'flex',
    gap: '8px'
  },
  toggleButton: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer'
  },
  small: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: '#888'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  btnPrimary: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontWeight: '500',
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: '#fff',
    color: '#333',
    fontWeight: '500',
    cursor: 'pointer'
  },
  costInfo: {
    background: '#f8f9fa',
    padding: '12px',
    borderRadius: '6px'
  },
  costItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  costValue: {
    fontWeight: '600',
    color: '#667eea'
  }
};

type LLMProvider = 'openrouter' | 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: LLMConfig) => void;
}

export const LLMConfigDialog: React.FC<LLMConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [provider, setProvider] = useState<LLMProvider>('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleProviderChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextProvider = event.target.value as LLMProvider;
      setProvider(nextProvider);
    },
    []
  );

  const handleSave = useCallback(() => {
    const config: LLMConfig = {
      provider,
      apiKey,
      model,
      temperature,
      maxTokens
    };

    // Update the service
    const llmService = getLLMService();
    llmService.updateConfig(config);

    // Save to localStorage for persistence
    localStorage.setItem('llm-config', JSON.stringify(config));

    onSave?.(config);
    onClose();
  }, [provider, apiKey, model, temperature, maxTokens, onSave, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>AI Parser Configuration</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Provider Settings</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Provider</label>
              <select
                style={styles.select}
                value={provider}
                onChange={handleProviderChange}
              >
                <option value="openrouter">OpenRouter</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>API Key</label>
              <div style={styles.apiKeyInput}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <button
                  style={styles.toggleButton}
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <small style={styles.small}>
                Your API key is stored locally and never sent to our servers
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Model</label>
              <select
                style={styles.select}
                value={model}
                onChange={e => setModel(e.target.value)}
              >
                {provider === 'openrouter' && (
                  <>
                    <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="openai/gpt-4">GPT-4</option>
                    <option value="anthropic/claude-2">Claude 2</option>
                    <option value="google/palm-2">PaLM 2</option>
                  </>
                )}
                {provider === 'openai' && (
                  <>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </>
                )}
                {provider === 'anthropic' && (
                  <>
                    <option value="claude-2">Claude 2</option>
                    <option value="claude-instant">Claude Instant</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Generation Settings</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Temperature: {temperature.toFixed(1)}
              </label>
              <input
                style={{ ...styles.input, cursor: 'pointer' }}
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
              />
              <small style={styles.small}>
                Higher values make output more creative
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Max Tokens</label>
              <input
                style={styles.input}
                type="number"
                min="50"
                max="2000"
                value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))}
              />
              <small style={styles.small}>
                Maximum length of generated content
              </small>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Cost Estimation</h3>
            <div style={styles.costInfo}>
              <div style={styles.costItem}>
                <span>Estimated cost per parse:</span>
                <span style={styles.costValue}>$0.0001 - $0.001</span>
              </div>
              <div style={{ ...styles.costItem, marginBottom: 0 }}>
                <span>Monthly estimate (1000 parses):</span>
                <span style={styles.costValue}>$0.10 - $1.00</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.btnPrimary} onClick={handleSave}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMConfigDialog;
