/**
 * Storage Extension Interface - Epic 8.4 Story 8.4.2
 * Defines interfaces for extending the storage and persistence system
 */
import { z } from 'zod';
// Storage Types
export var StorageType;
(function (StorageType) {
  StorageType['MEMORY'] = 'memory';
  StorageType['FILE'] = 'file';
  StorageType['DATABASE'] = 'database';
  StorageType['CACHE'] = 'cache';
  StorageType['OBJECT_STORE'] = 'object_store';
  StorageType['KEY_VALUE'] = 'key_value';
  StorageType['DOCUMENT'] = 'document';
  StorageType['GRAPH'] = 'graph';
  StorageType['TIME_SERIES'] = 'time_series';
  StorageType['SEARCH'] = 'search';
  StorageType['CUSTOM'] = 'custom';
})(StorageType || (StorageType = {}));
// Storage Extension Helper Functions
export var StorageExtensionHelpers;
(function (StorageExtensionHelpers) {
  function createStorageProvider(config) {
    return {
      id: config.id || 'custom-storage',
      name: config.name || 'Custom Storage',
      description: config.description || 'A custom storage provider',
      version: config.version || '1.0.0',
      type: config.type || StorageType.CUSTOM,
      providerClass:
        config.providerClass ||
        class {
          constructor() {
            this.id = config.id || 'custom-storage';
            this.name = config.name || 'Custom Storage';
            this.type = config.type || StorageType.CUSTOM;
            this.version = config.version || '1.0.0';
          }
          async connect() {}
          async disconnect() {}
          isConnected() {
            return true;
          }
          async get() {
            return undefined;
          }
          async set() {}
          async delete() {}
          async exists() {
            return false;
          }
          async clear() {}
          async getMany() {
            return [];
          }
          async setMany() {}
          async deleteMany() {}
          async keys() {
            return [];
          }
          async count() {
            return 0;
          }
          async increment() {
            return 0;
          }
          async decrement() {
            return 0;
          }
          async expire() {}
          async ttl() {
            return -1;
          }
          supportsCollections() {
            return false;
          }
          supportsTransactions() {
            return false;
          }
          supportsQueries() {
            return false;
          }
          supportsStreaming() {
            return false;
          }
          async getStats() {
            return {};
          }
          async healthCheck() {
            return { status: 'healthy', lastChecked: new Date() };
          }
          getConfiguration() {
            return {};
          }
          setConfiguration() {}
          getMetadata() {
            return { author: 'Unknown', license: 'MIT' };
          }
          async initialize() {}
          async dispose() {}
        },
      configSchema: config.configSchema || z.object({}),
      ui: config.ui || {},
      runtime: config.runtime || {},
      capabilities: config.capabilities || {
        get: true,
        set: true,
        delete: true,
        exists: true,
        clear: true,
        batchGet: false,
        batchSet: false,
        batchDelete: false,
        keys: true,
        count: true,
        pattern: false,
        increment: false,
        decrement: false,
        expire: false,
        ttl: false,
        collections: false,
        transactions: false,
        queries: false,
        streaming: false,
        backup: false,
        restore: false,
      },
      metadata: config.metadata || {
        author: 'Unknown',
        license: 'MIT',
      },
    };
  }
  StorageExtensionHelpers.createStorageProvider = createStorageProvider;
})(StorageExtensionHelpers || (StorageExtensionHelpers = {}));
