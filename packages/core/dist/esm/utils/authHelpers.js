/**
 * Authentication helper utilities for Supabase integration
 */
/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            // Don't retry on auth errors (wrong password, etc)
            if (error && typeof error === 'object' && 'status' in error) {
                const authError = error;
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
    throw lastError;
}
/**
 * Token refresh scheduler
 */
export class TokenRefreshScheduler {
    refreshTimer = null;
    refreshCallback;
    constructor(refreshCallback) {
        this.refreshCallback = refreshCallback;
    }
    schedule(session) {
        this.cancel();
        if (!session.expires_at)
            return;
        const expiresAt = session.expires_at * 1000; // Convert to milliseconds
        const expiresIn = expiresAt - Date.now();
        const refreshIn = Math.max(0, expiresIn - 60000); // Refresh 1 min before expiry
        if (refreshIn > 0) {
            this.refreshTimer = setTimeout(async () => {
                try {
                    await this.refreshCallback();
                }
                catch (error) {
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
    channel = null;
    storageKey = 'psg_auth_sync';
    constructor() {
        // Use BroadcastChannel if available, otherwise fall back to storage events
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.channel = new BroadcastChannel('psg_auth_channel');
            }
            catch (error) {
                console.warn('BroadcastChannel not available:', error);
            }
        }
    }
    broadcast(event, data) {
        const message = { event, data, timestamp: Date.now() };
        if (this.channel) {
            this.channel.postMessage(message);
        }
        else {
            // Fallback to localStorage for cross-tab communication
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(message));
                // Immediately remove to trigger storage event
                setTimeout(() => localStorage.removeItem(this.storageKey), 100);
            }
            catch (error) {
                console.warn('Failed to broadcast auth event:', error);
            }
        }
    }
    subscribe(callback) {
        if (this.channel) {
            this.channel.onmessage = (e) => {
                callback(e.data.event, e.data.data);
            };
        }
        else {
            // Fallback to storage events
            const handleStorage = (e) => {
                if (e.key === this.storageKey && e.newValue) {
                    try {
                        const message = JSON.parse(e.newValue);
                        callback(message.event, message.data);
                    }
                    catch (error) {
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
    queue = [];
    onlineHandler = null;
    constructor() {
        // Process queue when coming back online
        this.onlineHandler = () => this.processQueue();
        window.addEventListener('online', this.onlineHandler);
    }
    async enqueue(operation) {
        if (!navigator.onLine) {
            return new Promise((resolve, reject) => {
                this.queue.push({ operation, resolve, reject });
            });
        }
        return operation();
    }
    async processQueue() {
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            try {
                await item.operation();
                item.resolve();
            }
            catch (error) {
                item.reject(error);
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
export function transformAuthError(error) {
    if (!error)
        return 'An unknown error occurred';
    if (typeof error === 'string')
        return error;
    if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message;
        // Map common Supabase errors to friendly messages
        const errorMap = {
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
    enabled;
    constructor() {
        // More strict check to prevent logging in production
        this.enabled = process.env.NODE_ENV === 'development' &&
            !process.env.NEXT_PUBLIC_PRODUCTION &&
            !process.env.VITE_PRODUCTION;
    }
    log(event, data) {
        if (!this.enabled)
            return;
        const timestamp = new Date().toISOString();
        console.group(`[Auth] ${event} - ${timestamp}`);
        if (data) {
            console.log('Data:', data);
        }
        console.groupEnd();
    }
    error(event, error) {
        if (!this.enabled)
            return;
        const timestamp = new Date().toISOString();
        console.group(`[Auth Error] ${event} - ${timestamp}`);
        console.error('Error:', error);
        console.groupEnd();
    }
}
