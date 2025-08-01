// packages/core/settings/__tests__/SettingsManager.test.ts
// Comprehensive tests for SettingsManager
import { SettingsManager, getSettingsManager } from '../SettingsManager';
import { AdvancedSettings, SettingsChangeEvent } from '../types';

// Mock localStorage
const localStorageMock = {};

// Setup mocks
Object.defineProperty(window, 'localStorage', { )
  value: localStorageMock
  writable: true }
});
const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation();

// Mock timers
jest.useFakeTimers();
describe('SettingsManager', () => { let settingsManager: SettingsManager;
  beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null as unknown);
  // Reset singleton instance
  (SettingsManager as any).instance = undefined;
  // Create fresh instance
  settingsManager = SettingsManager.getInstance() });
  afterEach(() => { jest.clearAllTimers() });
  describe('Singleton Pattern', () => { test('should return the same instance', () => {
      const instance1 = SettingsManager.getInstance();
      const instance2 = SettingsManager.getInstance();
      const instance3 = getSettingsManager();
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(instance3) });
    test('should setup beforeunload handler', () => { expect(addEventListenerSpy).toHaveBeenCalledWith()
        'beforeunload' }
        expect.any(Function)
      );
    });
  });
  describe('Default Settings', () => { test('should start with default settings', () => {
      const settings = settingsManager.getSettings();
      expect(settings.seed.enabled).toBe(false);
      expect(settings.seed.autoGenerate).toBe(true);
      expect(settings.temperature.enabled).toBe(false);
      expect(settings.temperature.value).toBe(1.0);
      expect(settings.runCount.value).toBe(5);
      expect(settings.batch.batchSize).toBe(5);
      expect(settings.performance.enableCaching).toBe(true);
      expect(settings.ui.theme).toBe('auto') });
    test('should have valid version info', () => { const settings = settingsManager.getSettings();
      expect(settings.version).toBe('1.0.0');
      expect(typeof settings.lastModified).toBe('string') });
  });
  describe('Settings Updates', () => { test('should update individual settings', () => {
  const result = settingsManager.updateSetting('runCount', { )
  value: 10
  showPerformanceWarning: false
  presets: [1, 3, 5, 10, 20] }
});
      expect(result.valid).toBe(true);
      expect(settingsManager.getSetting('runCount').value).toBe(10);
    });
    test('should update multiple settings', () => {
      const updates = {
        seed: { enabled: true, value: 12345, history: [], autoGenerate: false }
        temperature: { enabled: true, value: 1.5, showIndicator: true, presets: [] }
      };
      const result = settingsManager.updateSettings(updates);
      expect(result.valid).toBe(true);
      expect(settingsManager.getSetting('seed').enabled).toBe(true);
      expect(settingsManager.getSetting('seed').value).toBe(12345);
      expect(settingsManager.getSetting('temperature').enabled).toBe(true);
      expect(settingsManager.getSetting('temperature').value).toBe(1.5);
    });
    test('should validate settings updates', () => {
      const invalidUpdates = {
        runCount: { value: -1 } // Invalid: negative value;
  };
      const result = settingsManager.updateSettings(invalidUpdates as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    test('should update lastModified timestamp', () => { const beforeUpdate = settingsManager.getSettings().lastModified;
  // Wait a bit to ensure timestamp difference
  setTimeout(() => {
  settingsManager.updateSetting('runCount', { )
  value: 8
  showPerformanceWarning: true
  presets: [1, 3, 5, 10, 20] }
});
        const afterUpdate = settingsManager.getSettings().lastModified;
        expect(afterUpdate).not.toBe(beforeUpdate);
      }, 10);
      jest.advanceTimersByTime(10);
    });
    test('should reject invalid setting keys', () => { const result = settingsManager.updateSettings({ )
  invalidKey: 'invalid' }
 as any);
      expect(result.valid).toBe(false);
    });
  });
  describe('Change Listeners', () => { test('should notify listeners on changes', () => {
  const listener = jest.fn<unknown, unknown>();
  const unsubscribe = settingsManager.addChangeListener(listener);
  settingsManager.updateSetting('runCount', { )
  value: 7
  showPerformanceWarning: true
  presets: [1, 3, 5, 10, 20] }
});
      expect(listener).toHaveBeenCalledWith()
        expect.objectContaining({ key: 'runCount' }
          value: expect.objectContaining({ value: 7 })
          source: 'user';

      );
      unsubscribe();
      settingsManager.updateSetting('runCount', { )
        value: 9
        showPerformanceWarning: true }
        presets: [1, 3, 5, 10, 20] 
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
    test('should handle multiple listeners', () => { const listener1 = jest.fn<unknown, unknown>();
  const listener2 = jest.fn<unknown, unknown>();
  settingsManager.addChangeListener(listener1);
  settingsManager.addChangeListener(listener2);
  settingsManager.updateSetting('runCount', { )
  value: 6
  showPerformanceWarning: true
  presets: [1, 3, 5, 10, 20] }
});
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
    test('should handle listener errors gracefully', () => { const errorListener = jest.fn(() => {
        throw new Error('Listener error') });
      const normalListener = jest.fn<unknown, unknown>();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      settingsManager.addChangeListener(errorListener);
      settingsManager.addChangeListener(normalListener);
      settingsManager.updateSetting('runCount', { )
        value: 4
        showPerformanceWarning: true }
        presets: [1, 3, 5, 10, 20] 
      });
      expect(consoleSpy).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
    test('should clear all listeners', () => { const listener1 = jest.fn<unknown, unknown>();
  const listener2 = jest.fn<unknown, unknown>();
  settingsManager.addChangeListener(listener1);
  settingsManager.addChangeListener(listener2);
  settingsManager.clearListeners();
  settingsManager.updateSetting('runCount', { )
  value: 3
  showPerformanceWarning: true
  presets: [1, 3, 5, 10, 20] }
});
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });
  describe('Settings Reset', () => { test('should reset to default settings', () => {
  // Modify some settings first
  settingsManager.updateSetting('seed', { )
  enabled: true
  value: 12345
  history: []
  autoGenerate: false }
});
      settingsManager.updateSetting('runCount', { )
        value: 10
        showPerformanceWarning: false }
        presets: [1, 3, 5, 10, 20] 
      });
      const result = settingsManager.resetSettings();
      expect(result.valid).toBe(true);
      expect(settingsManager.getSetting('seed').enabled).toBe(false);
      expect(settingsManager.getSetting('runCount').value).toBe(5);
    });
    test('should notify listeners on reset', () => { const listener = jest.fn<unknown, unknown>();
      settingsManager.addChangeListener(listener);
      settingsManager.resetSettings();
      // Should receive multiple notifications for each setting being reset
      expect(listener).toHaveBeenCalled() });
  });
  describe('Persistence', () => { test('should save to localStorage on changes', () => {
  settingsManager.updateSetting('runCount', { )
  value: 8
  showPerformanceWarning: true
  presets: [1, 3, 5, 10, 20] }
});
      // Advance timers to trigger debounced save
      jest.advanceTimersByTime(1000);
      expect(localStorageMock.setItem).toHaveBeenCalledWith()
        'prompt-spaghetti-advanced-settings'
        expect.stringContaining('"value":8')
      );
    });
    test('should load from localStorage on initialization', () => { const savedSettings = {
        settings: { }
  seed: { enabled: true, value: 54321, history: [], autoGenerate: false }
          temperature: { enabled: false, value: 1.0, showIndicator: true, presets: [] }
          runCount: { value: 15, showPerformanceWarning: true, presets: [1, 3, 5, 10, 20] }
          batch: { batchSize: 8, outputFormat: 'json', namingPattern: 'test-{seed}', includeMetadata: true, autoDownload: false }
          performance: { showExecutionTimes: true, enableCaching: true, showMemoryUsage: false, logExecutionSteps: false }
          ui: { theme: 'dark', showTooltips: true, enableKeyboardShortcuts: true, reduceAnimations: false, highContrast: false }
          version: '1.0.0'

  timestamp: new Date().toISOString()
        version: '1.0.0';
  };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings as unknown));
      // Reset singleton and create new instance
      (SettingsManager as any).instance = undefined;
      const newManager = SettingsManager.getInstance();
      expect(newManager.getSetting('seed').enabled).toBe(true);
      expect(newManager.getSetting('seed').value).toBe(54321);
      expect(newManager.getSetting('runCount').value).toBe(15);
    });
    test('should handle corrupted localStorage data', () => { localStorageMock.getItem.mockReturnValue('invalid json' as unknown);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      // Reset singleton and create new instance
      (SettingsManager as any).instance = undefined;
      const newManager = SettingsManager.getInstance();
      // Should fall back to defaults
      expect(newManager.getSetting('runCount').value).toBe(5);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore() });
    test('should debounce save operations', () => { settingsManager.updateSetting('runCount', { )
  value: 6
  showPerformanceWarning: true
  presets: [1, 3, 5, 10, 20] }
});
      settingsManager.updateSetting('runCount', { )
        value: 7
        showPerformanceWarning: true }
        presets: [1, 3, 5, 10, 20] 
      });
      settingsManager.updateSetting('runCount', { )
        value: 8
        showPerformanceWarning: true }
        presets: [1, 3, 5, 10, 20] 
      });
      // Should not save immediately
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      // Should save after debounce timeout
      jest.advanceTimersByTime(1000);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    });
    test('should save immediately on beforeunload', () => { settingsManager.updateSetting('runCount', { )
  value: 9
  showPerformanceWarning: true
  presets: [1, 3, 5, 10, 20] }
});
      // Simulate beforeunload event
      const beforeUnloadHandler = addEventListenerSpy.mock.calls;
        .find(call => call[0] === 'beforeunload')?.[1];
      if (beforeUnloadHandler) { beforeUnloadHandler();
      expect(localStorageMock.setItem).toHaveBeenCalled() });
  });
  describe('Import/Export', () => { test('should export settings', () => {
      const exportData = settingsManager.exportSettings();
      expect(exportData.settings).toBeDefined();
      expect(exportData.metadata).toBeDefined();
      expect(exportData.metadata.exportedAt).toBeTruthy();
      expect(exportData.metadata.version).toBe('1.0.0') });
    test('should import valid settings', () => { const importData = {
        settings: { }
  seed: { enabled: true, value: 99999, history: [], autoGenerate: false }
          temperature: { enabled: true, value: 1.8, showIndicator: true, presets: [] }
          runCount: { value: 25, showPerformanceWarning: false, presets: [1, 3, 5, 10, 20] }
          batch: { batchSize: 10, outputFormat: 'csv', namingPattern: 'import-{seed}', includeMetadata: false, autoDownload: true }
          performance: { showExecutionTimes: false, enableCaching: false, showMemoryUsage: true, logExecutionSteps: true }
          ui: { theme: 'light', showTooltips: false, enableKeyboardShortcuts: false, reduceAnimations: true, highContrast: true }
          version: '1.0.0'

  metadata: { 
  exportedAt: new Date().toISOString()
  version: '1.0.0'
  appVersion: '1.0.0' }
};
      const result = settingsManager.importSettings(importData);
      expect(result.valid).toBe(true);
      expect(settingsManager.getSetting('seed').enabled).toBe(true);
      expect(settingsManager.getSetting('seed').value).toBe(99999);
      expect(settingsManager.getSetting('runCount').value).toBe(25);
    });
    test('should reject invalid import data', () => { const invalidData = {
        settings: { }
  runCount: { value: -5 } // Invalid

  metadata: {}
      };
      const result = settingsManager.importSettings(invalidData as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    test('should handle version mismatches', () => { const oldVersionData = {
        settings: { }
  seed: { enabled: false, value: undefined, history: [], autoGenerate: true }
          temperature: { enabled: false, value: 1.0, showIndicator: true, presets: [] }
          runCount: { value: 5, showPerformanceWarning: true, presets: [1, 3, 5, 10, 20] }
          batch: { batchSize: 5, outputFormat: 'individual', namingPattern: 'result-{seed}-{timestamp}', includeMetadata: true, autoDownload: false }
          performance: { showExecutionTimes: false, enableCaching: true, showMemoryUsage: false, logExecutionSteps: false }
          ui: { theme: 'auto', showTooltips: true, enableKeyboardShortcuts: true, reduceAnimations: false, highContrast: false }
          version: '1.0.0'

  metadata: { 
  exportedAt: new Date().toISOString()
  version: '0.9.0', // Old version
  appVersion: '0.9.0' }
};
      const result = settingsManager.importSettings(oldVersionData);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('version mismatch'))).toBe(true);
    });
    test('should handle malformed export data', () => {
      const result = settingsManager.importSettings({} as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid export format');
    });
  });
  describe('Utility Methods', () => { test('should get executor settings', () => {
  settingsManager.updateSetting('seed', { )
  enabled: true
  value: 12345
  history: []
  autoGenerate: false }
});
      settingsManager.updateSetting('temperature', { )
        enabled: true
        value: 1.2
        showIndicator: true }
        presets: [] ;
  });
      const executorSettings = settingsManager.getExecutorSettings();
      expect(executorSettings.seed).toBe(12345);
      expect(executorSettings.temperature).toBe(1.2);
      expect(executorSettings.runCount).toBe(5);
      expect(executorSettings.batchSize).toBe(5);
      expect(executorSettings.enableCaching).toBe(true);
    });
    test('should get UI settings', () => { settingsManager.updateSetting('ui', { )
  theme: 'dark'
  showTooltips: false
  enableKeyboardShortcuts: false
  reduceAnimations: true
  highContrast: true }
});
      const uiSettings = settingsManager.getUISettings();
      expect(uiSettings.theme).toBe('dark');
      expect(uiSettings.showTooltips).toBe(false);
      expect(uiSettings.reduceAnimations).toBe(true);
      expect(uiSettings.highContrast).toBe(true);
    });
    test('should check performance monitoring status', () => { expect(settingsManager.isPerformanceMonitoringEnabled()).toBe(false);
  settingsManager.updateSetting('performance', { )
  showExecutionTimes: true
  enableCaching: true
  showMemoryUsage: false
  logExecutionSteps: false }
});
      expect(settingsManager.isPerformanceMonitoringEnabled()).toBe(true);
    });
    test('should get performance configuration', () => { settingsManager.updateSetting('performance', { )
  showExecutionTimes: true
  enableCaching: false
  showMemoryUsage: true
  logExecutionSteps: true }
});
      const perfConfig = settingsManager.getPerformanceConfig();
      expect(perfConfig.monitoring).toBe(true);
      expect(perfConfig.executionTimes).toBe(true);
      expect(perfConfig.memoryUsage).toBe(true);
      expect(perfConfig.detailedLogging).toBe(true);
      expect(perfConfig.caching).toBe(false);
    });
  });
  describe('Seed Management', () => { test('should add seed to history', () => {
      settingsManager.addSeedToHistory(12345);
      const seedSettings = settingsManager.getSetting('seed');
      expect(seedSettings.history).toContain(12345) });
    test('should limit seed history to 10 items', () => {
      // Add 15 seeds
      for (let i = 1; i <= 15; i++) {
        settingsManager.addSeedToHistory(i);
      const seedSettings = settingsManager.getSetting('seed');
      expect(seedSettings.history.length).toBe(10);
      expect(seedSettings.history[0]).toBe(15); // Most recent first
      expect(seedSettings.history[9]).toBe(6); // Oldest kept
    });
    test('should remove duplicates from history', () => { settingsManager.addSeedToHistory(12345);
      settingsManager.addSeedToHistory(67890);
      settingsManager.addSeedToHistory(12345); // Duplicate
      const seedSettings = settingsManager.getSetting('seed');
      expect(seedSettings.history).toEqual([12345, 67890]) });
    test('should generate random seed', () => { const seed = settingsManager.generateRandomSeed();
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThan(0);
      expect(seed).toBeLessThan(Number.MAX_SAFE_INTEGER);
      const seedSettings = settingsManager.getSetting('seed');
      expect(seedSettings.history).toContain(seed) });
  });
  describe('Auto-save Control', () => { test('should enable/disable auto-save', () => {
  settingsManager.setAutoSave(false);
  settingsManager.updateSetting('runCount', { )
  value: 12,
  showPerformanceWarning: true,
  presets: [1, 3, 5, 10, 20] }
});
      jest.advanceTimersByTime(1000);
      // Should not auto-save when disabled
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      // Re-enable auto-save
      settingsManager.setAutoSave(true);
      settingsManager.updateSetting('runCount', { )
        value: 13, 
        showPerformanceWarning: true }
        presets: [1, 3, 5, 10, 20] 
      });
      jest.advanceTimersByTime(1000);
      // Should auto-save when enabled
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    test('should still import when auto-save is disabled', () => { settingsManager.setAutoSave(false);
      const importData = {
        settings: { }
  seed: { enabled: false, value: undefined, history: [], autoGenerate: true },
          temperature: { enabled: false, value: 1.0, showIndicator: true, presets: [] },
          runCount: { value: 20, showPerformanceWarning: true, presets: [1, 3, 5, 10, 20] },
          batch: { batchSize: 5, outputFormat: 'individual', namingPattern: 'result-{seed}-{timestamp}', includeMetadata: true, autoDownload: false },
          performance: { showExecutionTimes: false, enableCaching: true, showMemoryUsage: false, logExecutionSteps: false },
          ui: { theme: 'auto', showTooltips: true, enableKeyboardShortcuts: true, reduceAnimations: false, highContrast: false },
          version: '1.0.0'

  metadata: { ,
  exportedAt: new Date().toISOString(),
  version: '1.0.0',
  appVersion: '1.0.0' }
};
      const result = settingsManager.importSettings(importData);
      expect(result.valid).toBe(true);
      expect(settingsManager.getSetting('runCount').value).toBe(20);
      // Should not auto-save on import
      jest.advanceTimersByTime(1000);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });
});