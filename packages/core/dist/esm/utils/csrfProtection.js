/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 */
/**
 * Generate a CSRF token
 */
export function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token) {
    sessionStorage.setItem('csrf_token', token);
}
/**
 * Get CSRF token from session storage
 */
export function getCSRFToken() {
    return sessionStorage.getItem('csrf_token');
}
/**
 * Validate CSRF token
 */
export function validateCSRFToken(token) {
    const storedToken = getCSRFToken();
    return storedToken !== null && storedToken === token;
}
/**
 * CSRF token manager
 */
export class CSRFTokenManager {
    token = null;
    tokenExpiry = 0;
    tokenLifetime = 30 * 60 * 1000; // 30 minutes
    /**
     * Get or generate a CSRF token
     */
    getToken() {
        const now = Date.now();
        // Generate new token if expired or doesn't exist
        if (!this.token || now >= this.tokenExpiry) {
            this.token = generateCSRFToken();
            this.tokenExpiry = now + this.tokenLifetime;
            storeCSRFToken(this.token);
        }
        return this.token;
    }
    /**
     * Validate a token
     */
    validateToken(token) {
        return this.token !== null && this.token === token;
    }
    /**
     * Refresh the token
     */
    refreshToken() {
        this.token = generateCSRFToken();
        this.tokenExpiry = Date.now() + this.tokenLifetime;
        storeCSRFToken(this.token);
        return this.token;
    }
    /**
     * Clear the token
     */
    clearToken() {
        this.token = null;
        this.tokenExpiry = 0;
        sessionStorage.removeItem('csrf_token');
    }
}
/**
 * Singleton instance
 */
export const csrfManager = new CSRFTokenManager();
/**
 * Hook for CSRF protection
 */
export function useCSRFProtection() {
    const [token, setToken] = useState('');
    useEffect(() => {
        const newToken = csrfManager.getToken();
        setToken(newToken);
        // Refresh token periodically
        const interval = setInterval(() => {
            const refreshedToken = csrfManager.refreshToken();
            setToken(refreshedToken);
        }, 25 * 60 * 1000); // Refresh 5 minutes before expiry
        return () => clearInterval(interval);
    }, []);
    const validateToken = useCallback((tokenToValidate) => {
        return csrfManager.validateToken(tokenToValidate);
    }, []);
    return {
        token,
        validateToken,
        refreshToken: () => {
            const newToken = csrfManager.refreshToken();
            setToken(newToken);
            return newToken;
        }
    };
}
// Import React hooks
import { useState, useEffect, useCallback } from 'react';
/**
 * Add CSRF token to request headers
 */
export function addCSRFHeader(headers = {}) {
    const token = csrfManager.getToken();
    return {
        ...headers,
        'X-CSRF-Token': token
    };
}
