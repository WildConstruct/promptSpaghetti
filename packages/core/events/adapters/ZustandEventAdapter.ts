/**
 * Zustand Event Adapter
 * 
 * Bridges Zustand state management with the centralized event bus.
 * Converts state changes to events and allows event-driven state updates.
 */
import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { globalEventBus, BaseEvent, EventFactory, EventCategory, EventPriority } from '../EventSystem';
/**
 * Zustand middleware that publishes state changes as events
 */
export interface EventableStore {
  _eventAdapter?: ZustandEventAdapter;
}
/**
 * Event metadata for state changes
 */
export interface StateChangeEvent extends BaseEvent {
  type: 'state_changed' | 'store_initialized' | 'store_reset';
  metadata: {,
    storeName: string;
    path: string;
    previousValue: unknown;
    currentValue: unknown;
    category: EventCategory;
    priority: EventPriority;
  };
}
/**
 * Configuration for Zustand event integration
 */
export interface ZustandEventConfig {
  storeName: string;
  enabledPaths?: string[]; // Only monitor specific paths
  ignoredPaths?: string[]; // Ignore specific paths
  debounceMs?: number; // Debounce rapid state changes
  priority?: EventPriority;
  category?: EventCategory;
}
/**
 * Zustand Event Adapter Class
 */
export class ZustandEventAdapter {
  private config: ZustandEventConfig;
  private subscriptions: Set<() => void> = new Set();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  constructor(config: ZustandEventConfig) {
    this.config = {
      debounceMs: 100,
      priority: EventPriority.MEDIUM,
      category: EventCategory.UI,
      ...config
    };
  }
  /**
   * Create Zustand middleware that publishes state changes as events
   */
  public middleware = <T extends object>()
    stateCreator: StateCreator<T & EventableStore, [], [], T & EventableStore>
  ): StateCreator<T & EventableStore, [], [], T & EventableStore> => {
    return (set, get, api) => {
      const store = stateCreator(;)
        (partial, replace) => {
          // Capture previous state
          const previousState = get();
          // Apply state change
          set(partial, replace);
          // Get new state
          const currentState = get();
          // Publish state change events
          this.publishStateChangeEvents(previousState, currentState);
        },
        get,
        api
      );
      // Attach adapter to store for external access
      (store as EventableStore)._eventAdapter = this;
      // Set up subscriptions for specific paths
      this.setupSubscriptions(api);
      // Publish store initialization event
      this.publishEvent({)
        type: 'store_initialized',
        timestamp: new Date(),
        id: crypto.randomUUID(),
        source: 'zustand-adapter',
        metadata: {,
          storeName: this.config.storeName,
          path: '',
          previousValue: null,
          currentValue: get(),
          category: this.config.category!,
          priority: this.config.priority!,
        }
      });
      return store;
    };
  };
  /**
   * Set up selective subscriptions using zustand's subscribeWithSelector
   */
  private setupSubscriptions(api: any): void {
    if (!this.config.enabledPaths) {
      return; // Use default state change detection
    }
    // Subscribe to specific paths
    this.config.enabledPaths.forEach(path => {)
      const unsubscribe = api.subscribe(;)
        (state: any) => this.getNestedValue(state, path),
        (currentValue: unknown, previousValue: unknown) => {
          this.publishPathChangeEvent(path, previousValue, currentValue);
        }
      );
      this.subscriptions.add(unsubscribe);
    });
  }
  /**
   * Publish state change events for all changed paths
   */
  private publishStateChangeEvents(previousState: any, currentState: any): void {
    const changedPaths = this.getChangedPaths(previousState, currentState);
    changedPaths.forEach(path => {)
      // Skip if path is ignored
      if (this.config.ignoredPaths?.includes(path)) {
        return;
      }
      // Skip if only specific paths are enabled and this isn't one
      if (this.config.enabledPaths && !this.config.enabledPaths.includes(path)) {
        return;
      }
      const previousValue = this.getNestedValue(previousState, path);
      const currentValue = this.getNestedValue(currentState, path);
      this.publishPathChangeEvent(path, previousValue, currentValue);
    });
  }
  /**
   * Publish state change event for a specific path
   */
  private publishPathChangeEvent(path: string, previousValue: unknown, currentValue: unknown): void {
    const eventId = `${this.config.storeName}-${path}`;}
    // Debounce rapid changes if configured
    if (this.config.debounceMs && this.config.debounceMs > 0) {
      const existingTimer = this.debounceTimers.get(eventId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      const timer = setTimeout(() => {
        this.publishStateEvent(path, previousValue, currentValue);
        this.debounceTimers.delete(eventId);
      }, this.config.debounceMs);
      this.debounceTimers.set(eventId, timer);
    } else {
      this.publishStateEvent(path, previousValue, currentValue);
    }
  }
  /**
   * Publish the actual state change event
   */
  private publishStateEvent(path: string, previousValue: unknown, currentValue: unknown): void {
    const event: StateChangeEvent = {
      type: 'state_changed',
      timestamp: new Date(),
      id: crypto.randomUUID(),
      source: 'zustand-adapter',
      metadata: {,
        storeName: this.config.storeName,
        path,
        previousValue,
        currentValue,
        category: this.config.category!,
        priority: this.config.priority!,
      }
    };
    this.publishEvent(event);
  }
  /**
   * Publish event through global event bus
   */
  private publishEvent(event: BaseEvent): void {
    globalEventBus.publish(event).catch(error => {)
      console.error(`Failed to publish Zustand event for store ${this.config.storeName}:`, error);}
    });
  }
  /**
   * Get all paths that changed between two state objects
   */
  private getChangedPaths(previous: any, current: any, basePath: string = ''): string[] {
    const changes: string[] = [];
    // Handle primitive values
    if (previous !== current) {
      if (typeof previous !== 'object' || typeof current !== 'object') {
        changes.push(basePath || 'root');
        return changes;
      }
    }
    // Handle objects/arrays
    const allKeys = new Set([;)
      ...Object.keys(previous || {}),
      ...Object.keys(current || {})
    ]);
    for (const key of allKeys) {
      const currentPath = basePath ? `${basePath}.${key}` : key;}
      const prevValue = previous?.[key];
      const currValue = current?.[key];
      if (prevValue !== currValue) {
        if (typeof prevValue === 'object' && typeof currValue === 'object') {
          // Recursive check for nested objects
          changes.push(...this.getChangedPaths(prevValue, currValue, currentPath));
        } else {
          changes.push(currentPath);
        }
      }
    }
    return changes;
  }
  /**
   * Get nested value from object using dot notation path
   */
  private getNestedValue(obj: any, path: string): unknown {
    if (!path) return obj;
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }
  /**
   * Subscribe to state changes from the event bus
   */
  public subscribeToStateEvents()
    storeName: string,
    handler: (event: StateChangeEvent) => void
  ): string {
    return globalEventBus.subscribe()
      {
        types: ['state_changed'],
        sources: ['zustand-adapter'],
      },
      (event: BaseEvent) => {
        const stateEvent = event as StateChangeEvent;
        if (stateEvent.metadata.storeName === storeName) {
          handler(stateEvent);
        }
      },
      { priority: EventPriority.HIGH }
    );
  }
  /**
   * Trigger state updates from events
   */
  public handleEventBasedStateUpdate()
    store: any,
    event: BaseEvent,
    updateFn: (currentState: any, event: BaseEvent) => any
  ): void {
    if (typeof store.setState === 'function') {
      const currentState = store.getState();
      const updates = updateFn(currentState, event);
      if (updates) {
        store.setState(updates);
      }
    }
  }
  /**
   * Clean up adapter resources
   */
  public cleanup(): void {
    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
  /**
   * Get adapter statistics
   */
  public getStats(): {
    storeName: string;
    subscriptions: number;
    activeDebounces: number;
    config: ZustandEventConfig;
  } {
    return {
      storeName: this.config.storeName,
      subscriptions: this.subscriptions.size,
      activeDebounces: this.debounceTimers.size,
      config: this.config,
    };
  }
}
/**
 * Factory function to create Zustand event middleware
 */
export const createZustandEventMiddleware = () => {
  const adapter = new ZustandEventAdapter();
  return adapter.middleware;
};
/**
 * Enhanced Zustand store creator with event integration
 */
export const createEventEnabledStore = <T>(stateCreator: StateCreator<T>) => {
  const adapter = new ZustandEventAdapter();
  return adapter.middleware(stateCreator);
};
/**
 * Utility functions for Zustand-Event integration
 */
export const ZustandEventUtils = {
  /**
   * Extract event adapter from a Zustand store
   */
  getEventAdapter: (store: any): ZustandEventAdapter | null => {
    const state = store.getState();
    return state._eventAdapter || null;
  },
  /**
   * Check if a store has event integration
   */
  hasEventIntegration: (store: any): boolean => {
    return !!ZustandEventUtils.getEventAdapter(store);
  },
  /**
   * Create event-driven state updater
   */
  createEventUpdater: <T>(),
    store: { getState: () => T; setState: (partial: Partial<T>) => void },
    eventTypes: string[],
  ) => {
    return globalEventBus.subscribe()
      { types: eventTypes },
      (event: BaseEvent) => {
        // Custom logic to update state based on event
        const currentState = store.getState();
        // Example: Update last event info
        if ('lastEvent' in currentState) {
          store.setState({)
            lastEvent: {,
              type: event.type,
              timestamp: event.timestamp,
              source: event.source,
            }
          } as Partial<T>);
        }
      },
      { priority: EventPriority.HIGH }
    );
  }
};
/**
 * Pre-configured adapters for common stores
 */
export const graphStoreAdapter = new ZustandEventAdapter();
export const uiStoreAdapter = new ZustandEventAdapter();
export const previewStoreAdapter = new ZustandEventAdapter();