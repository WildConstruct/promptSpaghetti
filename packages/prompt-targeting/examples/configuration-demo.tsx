/**
 * Configuration system demonstration
 * Epic 10.2.2 - Configuration System Demo
 */

import React, { useState } from 'react';
import {
  ConfigurationManager,
  ConfigurationPanel,
  useConfiguration,
  ConfigurationProvider
} from '../index';

// Mock React DOM for demo purposes
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      button: any;
      h1: any;
      h2: any;
      p: any;
      pre: any;
      code: any;
    }
  }
}

/**
 * Main demo component
 */
const ConfigurationDemo: React.FC = () => {
  const [configManager] = useState(() => new ConfigurationManager({
    qualityPreference: 0.7,
    stylePreference: 'default',
    enableOptimizations: true
  }));

  return (
    <ConfigurationProvider configManager={configManager}>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Prompt Targeting Configuration Demo</h1>
        
        <DemoTabs />
      </div>
    </ConfigurationProvider>
  );
};

/**
 * Demo tabs component
 */
const DemoTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'panel' | 'hooks' | 'examples'>('panel');

  return (
    <div>
      {/* Tab navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        <button
          onClick={() => setActiveTab('panel')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            background: activeTab === 'panel' ? '#007bff' : 'transparent',
            color: activeTab === 'panel' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Configuration Panel
        </button>
        <button
          onClick={() => setActiveTab('hooks')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            background: activeTab === 'hooks' ? '#007bff' : 'transparent',
            color: activeTab === 'hooks' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          React Hooks
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            background: activeTab === 'examples' ? '#007bff' : 'transparent',
            color: activeTab === 'examples' ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          Code Examples
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'panel' && <ConfigurationPanelDemo />}
      {activeTab === 'hooks' && <ReactHooksDemo />}
      {activeTab === 'examples' && <CodeExamplesDemo />}
    </div>
  );
};

/**
 * Configuration panel demo
 */
const ConfigurationPanelDemo: React.FC = () => {
  const [configManager] = useState(() => new ConfigurationManager());

  return (
    <div>
      <h2>Interactive Configuration Panel</h2>
      <p>This is the full configuration UI that can be embedded in any React application:</p>
      
      <ConfigurationPanel
        configManager={configManager}
        onConfigChanged={(config) => {
          console.log('Configuration changed:', config);
        }}
        onValidationResult={(result) => {
          console.log('Validation result:', result);
        }}
      />
    </div>
  );
};

/**
 * React hooks demo
 */
const ReactHooksDemo: React.FC = () => {
  const { configHook } = useConfigurationContext();
  const [output, setOutput] = useState<string>('');

  const runHookExample = (example: string) => {
    let result = '';
    
    switch (example) {
    case 'getConfig':
      result = JSON.stringify(configHook.config, null, 2);
      break;
        
    case 'updateConfig':
      const updateResult = configHook.updateConfig({
        qualityPreference: 0.9,
        stylePreference: 'photorealistic'
      });
      result = `Update result: ${updateResult.valid ? 'Success' : 'Failed'}\n` +
                 `Errors: ${updateResult.errors.length}\n` +
                 `Warnings: ${updateResult.warnings.length}`;
      break;
        
    case 'setConfigValue':
      const setResult = configHook.setConfigValue('platformOverrides.openai.temperature', 0.2);
      result = 'Set temperature to 0.2\n' +
                 `Result: ${setResult.valid ? 'Success' : 'Failed'}\n` +
                 `Current value: ${configHook.getConfigValue('platformOverrides.openai.temperature')}`;
      break;
        
    case 'presets':
      result = 'Available presets:\n' +
                 configHook.presets.map(p => `- ${p.name}: ${p.description}`).join('\n');
      break;
        
    case 'summary':
      const summary = configHook.getConfigSummary();
      result = JSON.stringify(summary, null, 2);
      break;
        
    case 'export':
      result = configHook.exportConfig('json');
      break;
    }
    
    setOutput(result);
  };

  return (
    <div>
      <h2>React Hooks API</h2>
      <p>Demonstration of the useConfiguration hook:</p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Available Methods:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => runHookExample('getConfig')}>
              Get Current Config
            </button>
            <button onClick={() => runHookExample('updateConfig')}>
              Update Config (High Quality)
            </button>
            <button onClick={() => runHookExample('setConfigValue')}>
              Set OpenAI Temperature
            </button>
            <button onClick={() => runHookExample('presets')}>
              List Presets
            </button>
            <button onClick={() => runHookExample('summary')}>
              Get Config Summary
            </button>
            <button onClick={() => runHookExample('export')}>
              Export as JSON
            </button>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>State:</h3>
            <p>Is Dirty: {configHook.isDirty ? 'Yes' : 'No'}</p>
            <p>Is Loading: {configHook.isLoading ? 'Yes' : 'No'}</p>
            <p>Validation: {configHook.validationResult?.valid ? 'Valid' : 'Invalid'}</p>
            <p>Presets: {configHook.presets.length}</p>
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>Output:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '12px'
          }}>
            {output || 'Click a button to see output...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

/**
 * Code examples demo
 */
const CodeExamplesDemo: React.FC = () => {
  return (
    <div>
      <h2>Code Examples</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>1. Basic Configuration Manager Usage</h3>
        <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          {`import { ConfigurationManager } from '@prompt-graph/targeting';

// Create configuration manager
const configManager = new ConfigurationManager({
  qualityPreference: 0.8,
  stylePreference: 'photorealistic',
  enableOptimizations: true,
});

// Update configuration
const result = configManager.updateConfig({
  platformOverrides: {
    openai: {
      model: 'gpt-4',
      temperature: 0.2,
    },
  },
});

if (result.valid) {
  console.log('Configuration updated successfully');
} else {
  console.error('Validation errors:', result.errors);
}`}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>2. React Component with Configuration</h3>
        <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          {`import React from 'react';
import { 
  ConfigurationProvider, 
  useConfiguration,
  ConfigurationPanel 
} from '@prompt-graph/targeting';

function MyApp() {
  const configManager = new ConfigurationManager();
  
  return (
    <ConfigurationProvider configManager={configManager}>
      <MyComponent />
    </ConfigurationProvider>
  );
}

function MyComponent() {
  const { config, setConfigValue, isDirty } = useConfiguration();
  
  const handleQualityChange = (quality: number) => {
    setConfigValue('qualityPreference', quality);
  };
  
  return (
    <div>
      <h3>Quality: {config.qualityPreference}</h3>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1"
        value={config.qualityPreference}
        onChange={(e) => handleQualityChange(Number(e.target.value))}
      />
      {isDirty && <p>⚠️ Unsaved changes</p>}
    </div>
  );
}`}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>3. Configuration Presets</h3>
        <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          {`// Create custom preset
configManager.createPreset(
  'my-preset',
  'My custom configuration for creative work',
  {
    qualityPreference: 0.6,
    stylePreference: 'artistic',
    platformOverrides: {
      openai: { temperature: 0.8 },
      midjourney: { defaultChaos: 30 }
    }
  },
  ['creative', 'experimental']
);

// Apply preset
const result = configManager.applyPreset('my-preset');

// List available presets
const presets = configManager.listPresets(['creative']);
presets.forEach(preset => {
  console.log(\`\${preset.name}: \${preset.description}\`);
});`}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>4. Configuration Import/Export</h3>
        <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          {`// Export configuration
const jsonConfig = configManager.exportConfig('json');
const yamlConfig = configManager.exportConfig('yaml');

// Import configuration
const importResult = configManager.importConfig(jsonConfig, 'json');
if (importResult.valid) {
  console.log('Configuration imported successfully');
}

// Save to file (browser)
const blob = new Blob([jsonConfig], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'config.json';
a.click();`}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>5. Real-time Validation</h3>
        <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          {`// Subscribe to validation events
configManager.on('config:validated', (result) => {
  if (!result.valid) {
    console.error('Validation failed:', result.errors);
    
    // Show user-friendly error messages
    result.errors.forEach(error => {
      showToast(\`\${error.path}: \${error.message}\`, 'error');
    });
  }
  
  // Show warnings
  result.warnings.forEach(warning => {
    showToast(\`\${warning.path}: \${warning.message}\`, 'warning');
  });
});

// Manual validation
const validationResult = configManager.validateConfig();
console.log('Compatibility score:', validationResult.compatibilityScore);`}
        </pre>
      </div>
    </div>
  );
};

/**
 * Demo context provider
 */
const useConfigurationContext = () => {
  // Mock implementation for demo
  return {
    configHook: {
      config: {
        qualityPreference: 0.7,
        stylePreference: 'default' as const,
        enableOptimizations: true,
        platformOverrides: {},
        pipeline: {
          skipValidation: false,
          skipOptimization: false,
          stageTimeouts: {},
          retries: {
            maxAttempts: 3,
            backoffMs: 100,
            retryableErrors: []
          }
        },
        monitoring: {
          enableTiming: true,
          enableMemoryTracking: false,
          enableEvents: true,
          enableLogging: true
        },
        customMappings: {}
      },
      isLoading: false,
      isDirty: false,
      validationResult: { valid: true, errors: [], warnings: [] },
      presets: [
        { name: 'high-quality', description: 'High quality preset', tags: ['quality'], isBuiltIn: true, created: new Date(), updated: new Date(), config: {} as any },
        { name: 'creative', description: 'Creative preset', tags: ['creative'], isBuiltIn: true, created: new Date(), updated: new Date(), config: {} as any }
      ],
      updateConfig: () => ({ valid: true, errors: [], warnings: [] }),
      setConfigValue: () => ({ valid: true, errors: [], warnings: [] }),
      getConfigValue: () => undefined,
      resetToDefaults: () => ({ valid: true, errors: [], warnings: [] }),
      applyPreset: () => ({ valid: true, errors: [], warnings: [] }),
      createPreset: () => {},
      deletePreset: () => true,
      exportConfig: () => '{}',
      importConfig: () => ({ valid: true, errors: [], warnings: [] }),
      validateConfig: () => ({ valid: true, errors: [], warnings: [] }),
      getConfigSummary: () => ({
        platforms: ['openai'],
        qualityLevel: 'Medium',
        optimizationsEnabled: true,
        presetCount: 3,
        lastUpdated: new Date()
      }),
      getConfigHistory: () => []
    }
  };
};

export default ConfigurationDemo;