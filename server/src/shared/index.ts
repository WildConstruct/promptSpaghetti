/**
 * Shared module that provides common imports and utilities
 * to reduce duplication across the codebase
 */

// Base classes and interfaces
export { BaseService, Singleton, type SingletonService } from './BaseService';

// Re-export commonly used services
export { DatabaseService } from '../auth/database/DatabaseService';
export { RedisService } from '../auth/database/RedisService';
export { AuditService } from '../auth/services/AuditService';

// Common types
export interface ServiceConfig {
  enabled: boolean;
  options?: Record<string, any>;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

// Common utilities
export const createServiceResponse = <T>(
  data?: T,
  error?: string
): ServiceResponse<T> => ({
  success: !error,
  data,
  error,
  metadata: {
    timestamp: new Date().toISOString()
  }
});

// Service registry for dependency injection
export class ServiceRegistry {
  private static services = new Map<string, any>();

  static register(name: string, service: any): void {
    this.services.set(name, service);
  }

  static get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in registry`);
    }
    return service;
  }

  static has(name: string): boolean {
    return this.services.has(name);
  }

  static clear(): void {
    this.services.clear();
  }
}