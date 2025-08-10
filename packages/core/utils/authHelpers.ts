/**
 * Authentication helper utilities for Supabase integration
 */

import type { AuthError, Session } from '@supabase/supabase-js';

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on auth errors (wrong password, etc)
      if (error && typeof error === 'object' && 'status' in error) {
        const authError = error as AuthError;
        if (authError.status && authError.status >= 400 && authError.status < 500) {
          throw error;
        }
      }
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Token refresh scheduler
 */
export class TokenRefreshScheduler {
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshCallback: () => Promise<void>;
  
  constructor(refreshCallback: () => Promise<void>) {
    this.refreshCallback = refreshCallback;
  }
  
  schedule(session: Session) {
    this.cancel();
    
    if (!session.expires_at) return;
    
    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const expiresIn = expiresAt - Date.now();
    const refreshIn = Math.max(0, expiresIn - 60000); // Refresh 1 min before expiry
    
    if (refreshIn > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshCallback();
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, refreshIn);
    }
  }
  
  cancel() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

/**
 * Cross-tab synchronization for auth state
 */
export class AuthStateBroadcaster {
  private channel: BroadcastChannel | null = null;
  private storageKey = 'psg_auth_sync';
  
  constructor() {
    // Use BroadcastChannel if available, otherwise fall back to storage events
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('psg_auth_channel');
      } catch (error) {
        console.warn('BroadcastChannel not available:', error);
      }
    }
  }
  
  broadcast(event: 'signin' | 'signout' | 'session_refresh', data?: any) {
    const message = { event, data, timestamp: Date.now() };
    
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback to localStorage for cross-tab communication
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(message));
        // Immediately remove to trigger storage event
        setTimeout(() => localStorage.removeItem(this.storageKey), 100);
      } catch (error) {
        console.warn('Failed to broadcast auth event:', error);
      }
    }
  }
  
  subscribe(callback: (event: string, data?: any) => void) {
    if (this.channel) {
      this.channel.onmessage = (e) => {
        callback(e.data.event, e.data.data);
      };
    } else {
      // Fallback to storage events
      const handleStorage = (e: StorageEvent) => {
        if (e.key === this.storageKey && e.newValue) {
          try {
            const message = JSON.parse(e.newValue);
            callback(message.event, message.data);
          } catch (error) {
            console.warn('Failed to parse auth sync message:', error);
          }
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }
  
  close() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

/**
 * Offline queue for auth operations
 */
export class OfflineAuthQueue {
  private queue: Array<{
    operation: () => Promise<void>;
    resolve: (value: void) => void;
    reject: (error: Error) => void;
  }> = [];
  private onlineHandler: (() => void) | null = null;
  
  constructor() {
    // Process queue when coming back online
    this.onlineHandler = () => this.processQueue();
    window.addEventListener('online', this.onlineHandler);
  }
  
  async enqueue(operation: () => Promise<void>): Promise<void> {
    if (!navigator.onLine) {
      return new Promise((resolve, reject) => {
        this.queue.push({ operation, resolve, reject });
      });
    }
    
    return operation();
  }
  
  private async processQueue() {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      try {
        await item.operation();
        item.resolve();
      } catch (error) {
        item.reject(error as Error);
      }
    }
  }
  
  clear() {
    // Reject all pending operations
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    
    // Remove event listener
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
    }
  }
}

/**
 * Transform Supabase auth errors to user-friendly messages
 */
export function transformAuthError(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;
    
    // Map common Supabase errors to friendly messages
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email or password is incorrect',
      'Email not confirmed': 'Please check your email to confirm your account',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password is too short',
      'Rate limit exceeded': 'Too many attempts. Please try again later',
      'Network request failed': 'Connection error. Please check your internet',
      'Failed to fetch': 'Connection error. Please try again',
    };
    
    for (const [key, value] of Object.entries(errorMap)) {
      if (message.includes(key)) {
        return value;
      }
    }
    
    return message;
  }
  
  return 'An error occurred. Please try again';
}

/**
 * Debug logger for auth events (dev mode only)
 */
export class AuthDebugLogger {
  private enabled: boolean;
  
  constructor() {
    // More strict check to prevent logging in production
    this.enabled = process.env.NODE_ENV === 'development' && 
                   !process.env.NEXT_PUBLIC_PRODUCTION &&
                   !process.env.VITE_PRODUCTION;
  }
  
  log(event: string, data?: any) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.group(`[Auth] ${event} - ${timestamp}`);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }
  
  error(event: string, error: unknown) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    console.group(`[Auth Error] ${event} - ${timestamp}`);
    console.error('Error:', error);
    console.groupEnd();
  }
}