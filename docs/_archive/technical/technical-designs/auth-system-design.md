# Technical Design: Authentication System Architecture

## Overview
This document provides the complete technical design for the authentication system, including UI components, Supabase integration, session management, and progressive enhancement for anonymous users.

## System Architecture

### 1. Authentication State Machine

```typescript
// packages/core/auth/AuthStateMachine.ts
type AuthState = 
  | { type: 'anonymous' }
  | { type: 'authenticating'; method: 'signin' | 'signup' }
  | { type: 'authenticated'; user: User; session: Session }
  | { type: 'refreshing'; user: User; session: Session }
  | { type: 'error'; error: AuthError; previousState: AuthState }
  | { type: 'signing_out' }

type AuthEvent =
  | { type: 'SIGN_IN'; email: string; password: string }
  | { type: 'SIGN_UP'; email: string; password: string }
  | { type: 'SIGN_OUT' }
  | { type: 'SESSION_RESTORED'; session: Session }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'AUTH_ERROR'; error: AuthError }
  | { type: 'RETRY' }

export class AuthStateMachine {
  private state: AuthState = { type: 'anonymous' }
  private subscribers = new Set<(state: AuthState) => void>()
  
  transition(event: AuthEvent): void {
    const nextState = this.getNextState(this.state, event)
    
    if (nextState !== this.state) {
      console.log(`Auth transition: ${this.state.type} -> ${nextState.type}`)
      this.state = nextState
      this.notify()
      
      // Handle side effects
      this.handleSideEffects(nextState, event)
    }
  }
  
  private getNextState(current: AuthState, event: AuthEvent): AuthState {
    switch (current.type) {
      case 'anonymous':
        switch (event.type) {
          case 'SIGN_IN':
            return { type: 'authenticating', method: 'signin' }
          case 'SIGN_UP':
            return { type: 'authenticating', method: 'signup' }
          case 'SESSION_RESTORED':
            return { 
              type: 'authenticated', 
              user: event.session.user,
              session: event.session 
            }
          default:
            return current
        }
        
      case 'authenticated':
        switch (event.type) {
          case 'SIGN_OUT':
            return { type: 'signing_out' }
          case 'SESSION_EXPIRED':
            return { type: 'refreshing', ...current }
          case 'REFRESH_TOKEN':
            return { type: 'refreshing', ...current }
          default:
            return current
        }
        
      case 'authenticating':
        switch (event.type) {
          case 'SESSION_RESTORED':
            return {
              type: 'authenticated',
              user: event.session.user,
              session: event.session
            }
          case 'AUTH_ERROR':
            return {
              type: 'error',
              error: event.error,
              previousState: current
            }
          default:
            return current
        }
        
      // ... other state transitions
      
      default:
        return current
    }
  }
  
  private async handleSideEffects(state: AuthState, event: AuthEvent): Promise<void> {
    switch (state.type) {
      case 'authenticating':
        if (event.type === 'SIGN_IN') {
          await this.performSignIn(event.email, event.password)
        } else if (event.type === 'SIGN_UP') {
          await this.performSignUp(event.email, event.password)
        }
        break
        
      case 'refreshing':
        await this.performTokenRefresh(state.session)
        break
        
      case 'signing_out':
        await this.performSignOut()
        this.transition({ type: 'SIGN_OUT_COMPLETE' })
        break
    }
  }
}
```

### 2. Enhanced UserProvider

```typescript
// packages/asset-browser/src/user/UserProvider.tsx
import { createContext, useContext, useEffect, useReducer } from 'react'
import { SupabaseClient, Session, User } from '@supabase/supabase-js'
import { AuthStateMachine } from '@prompt/core/auth/AuthStateMachine'

interface UserContextValue {
  // State
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: ProfileUpdate) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  
  // Session management
  refreshSession: () => Promise<void>
  getAccessToken: () => Promise<string | null>
  
  // Feature gates
  canAccessFeature: (feature: string) => boolean
}

interface UserProviderProps {
  children: React.ReactNode
  supabase?: SupabaseClient | null
  features?: FeatureConfig
  onAuthStateChange?: (event: AuthEvent, session: Session | null) => void
}

export function UserProvider({ 
  children, 
  supabase, 
  features,
  onAuthStateChange 
}: UserProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  const stateMachine = useRef(new AuthStateMachine())
  
  // Session restoration on mount
  useEffect(() => {
    if (!supabase) return
    
    const restoreSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          dispatch({ type: 'SESSION_RESTORED', session })
          scheduleTokenRefresh(session)
        } else {
          dispatch({ type: 'NO_SESSION' })
        }
      } catch (error) {
        console.error('Session restoration failed:', error)
        dispatch({ type: 'AUTH_ERROR', error })
      }
    }
    
    restoreSession()
  }, [supabase])
  
  // Auth state change subscription
  useEffect(() => {
    if (!supabase) return
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)
        
        // Notify external handler
        onAuthStateChange?.(event, session)
        
        // Update internal state
        switch (event) {
          case 'SIGNED_IN':
            dispatch({ type: 'SIGNED_IN', session })
            scheduleTokenRefresh(session!)
            await syncUserProfile(session!.user)
            break
            
          case 'SIGNED_OUT':
            dispatch({ type: 'SIGNED_OUT' })
            cancelTokenRefresh()
            clearLocalData()
            break
            
          case 'TOKEN_REFRESHED':
            dispatch({ type: 'TOKEN_REFRESHED', session })
            scheduleTokenRefresh(session!)
            break
            
          case 'USER_UPDATED':
            dispatch({ type: 'USER_UPDATED', user: session!.user })
            break
            
          case 'PASSWORD_RECOVERY':
            dispatch({ type: 'PASSWORD_RECOVERY', session })
            break
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [supabase, onAuthStateChange])
  
  // Token refresh scheduling
  const scheduleTokenRefresh = useCallback((session: Session) => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
    }
    
    const expiresAt = session.expires_at
    if (!expiresAt) return
    
    const expiresIn = expiresAt * 1000 - Date.now()
    const refreshIn = Math.max(0, expiresIn - 60000) // 1 min before expiry
    
    console.log(`Scheduling token refresh in ${refreshIn}ms`)
    
    refreshTimer.current = setTimeout(async () => {
      try {
        const { data: { session: newSession }, error } = 
          await supabase!.auth.refreshSession()
          
        if (error) throw error
        
        if (newSession) {
          dispatch({ type: 'TOKEN_REFRESHED', session: newSession })
          scheduleTokenRefresh(newSession)
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        dispatch({ type: 'SESSION_EXPIRED' })
      }
    }, refreshIn)
  }, [supabase])
  
  // Action implementations
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication not configured')
    }
    
    dispatch({ type: 'AUTH_START' })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Success handled by onAuthStateChange
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', error: transformAuthError(error) })
      throw error
    }
  }, [supabase])
  
  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication not configured')
    }
    
    dispatch({ type: 'AUTH_START' })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      // Check if email confirmation required
      if (data.user && !data.session) {
        dispatch({ 
          type: 'SIGNUP_NEEDS_VERIFICATION', 
          email 
        })
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', error: transformAuthError(error) })
      throw error
    }
  }, [supabase])
  
  const value: UserContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    verifyEmail,
    refreshSession,
    getAccessToken,
    canAccessFeature
  }
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
```

### 3. Authentication UI Components

```typescript
// packages/core/components/auth/AuthModal.tsx
import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { PasswordResetForm } from './PasswordResetForm'
import { useUser } from '../../hooks/useUser'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'login' | 'signup'
  onSuccess?: () => void
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  initialTab = 'login',
  onSuccess 
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showReset, setShowReset] = useState(false)
  const { isLoading } = useUser()
  
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }
  
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
              {showReset ? (
                <PasswordResetForm
                  onBack={() => setShowReset(false)}
                  onSuccess={handleSuccess}
                />
              ) : (
                <>
                  <div className="flex border-b">
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`flex-1 py-3 px-4 font-medium transition-colors ${
                        activeTab === 'login'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      disabled={isLoading}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 py-3 px-4 font-medium transition-colors ${
                        activeTab === 'signup'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      disabled={isLoading}
                    >
                      Sign Up
                    </button>
                  </div>
                  
                  <div className="p-6">
                    {activeTab === 'login' ? (
                      <LoginForm
                        onSuccess={handleSuccess}
                        onForgotPassword={() => setShowReset(true)}
                      />
                    ) : (
                      <SignupForm
                        onSuccess={handleSuccess}
                      />
                    )}
                  </div>
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
```

### 4. Form Validation System

```typescript
// packages/core/components/auth/validation.ts
interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

interface FieldValidator {
  validate(value: string): ValidationResult
  getStrength?(value: string): PasswordStrength
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'
  color: string
  feedback: string[]
}

export class EmailValidator implements FieldValidator {
  private rules: ValidationRule[] = [
    {
      test: (v) => v.length > 0,
      message: 'Email is required'
    },
    {
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Please enter a valid email address'
    },
    {
      test: (v) => v.length <= 255,
      message: 'Email is too long'
    }
  ]
  
  validate(value: string): ValidationResult {
    const errors: string[] = []
    
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        errors.push(rule.message)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

export class PasswordValidator implements FieldValidator {
  private rules: ValidationRule[] = [
    {
      test: (v) => v.length >= 8,
      message: 'Password must be at least 8 characters'
    },
    {
      test: (v) => /[A-Z]/.test(v),
      message: 'Password must contain an uppercase letter'
    },
    {
      test: (v) => /[a-z]/.test(v),
      message: 'Password must contain a lowercase letter'
    },
    {
      test: (v) => /\d/.test(v),
      message: 'Password must contain a number'
    }
  ]
  
  validate(value: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        errors.push(rule.message)
      }
    }
    
    // Additional warnings for better passwords
    if (!/[^a-zA-Z0-9]/.test(value)) {
      warnings.push('Consider adding special characters for extra security')
    }
    
    if (value.length < 12) {
      warnings.push('Longer passwords are more secure')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  getStrength(password: string): PasswordStrength {
    let score = 0
    const feedback: string[] = []
    
    // Length scoring
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (password.length >= 16) score++
    
    // Complexity scoring
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score++
    } else {
      feedback.push('Mix uppercase and lowercase letters')
    }
    
    if (/\d/.test(password)) {
      score++
    } else {
      feedback.push('Add numbers')
    }
    
    if (/[^a-zA-Z0-9]/.test(password)) {
      score++
    } else {
      feedback.push('Add special characters')
    }
    
    // Pattern detection
    if (this.hasRepeatingPatterns(password)) {
      score = Math.max(0, score - 1)
      feedback.push('Avoid repeating patterns')
    }
    
    if (this.isCommonPassword(password)) {
      score = 0
      feedback.push('This password is too common')
    }
    
    // Normalize to 0-4 scale
    score = Math.min(4, Math.floor(score * 4 / 6))
    
    const labels: PasswordStrength['label'][] = [
      'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'
    ]
    
    const colors = [
      '#ef4444', // red
      '#f97316', // orange  
      '#eab308', // yellow
      '#84cc16', // lime
      '#22c55e'  // green
    ]
    
    return {
      score: score as 0 | 1 | 2 | 3 | 4,
      label: labels[score],
      color: colors[score],
      feedback
    }
  }
  
  private hasRepeatingPatterns(password: string): boolean {
    // Check for repeated characters (aaa, 111)
    if (/(.)\1{2,}/.test(password)) return true
    
    // Check for sequences (abc, 123)
    for (let i = 0; i < password.length - 2; i++) {
      const c1 = password.charCodeAt(i)
      const c2 = password.charCodeAt(i + 1)
      const c3 = password.charCodeAt(i + 2)
      
      if (c2 - c1 === 1 && c3 - c2 === 1) return true
      if (c1 - c2 === 1 && c2 - c3 === 1) return true
    }
    
    return false
  }
  
  private isCommonPassword(password: string): boolean {
    const common = [
      'password', '12345678', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein'
    ]
    
    const lower = password.toLowerCase()
    return common.some(c => lower.includes(c))
  }
}
```

### 5. Feature Gating System

```typescript
// packages/core/auth/FeatureGates.ts
interface FeatureConfig {
  auth: {
    enabled: boolean
    required: boolean
    optional: boolean
  }
  supabase: {
    enabled: boolean
  }
  features: {
    cloudSave: boolean
    collaboration: boolean
    versionHistory: boolean
    advancedExport: boolean
  }
}

interface GateConfig {
  requireAuth?: boolean
  requirePlan?: 'free' | 'pro' | 'enterprise'
  requireFeature?: keyof FeatureConfig['features']
  fallback?: React.ReactNode
  showUpgrade?: boolean
}

export function useFeatureGate(config: GateConfig) {
  const { user, isAuthenticated } = useUser()
  const features = useFeatures()
  
  const checkAccess = useCallback(() => {
    // Check authentication requirement
    if (config.requireAuth && !isAuthenticated) {
      return { 
        allowed: false, 
        reason: 'authentication_required' 
      }
    }
    
    // Check plan requirement
    if (config.requirePlan) {
      const userPlan = user?.plan || 'free'
      const planHierarchy = ['free', 'pro', 'enterprise']
      const requiredIndex = planHierarchy.indexOf(config.requirePlan)
      const userIndex = planHierarchy.indexOf(userPlan)
      
      if (userIndex < requiredIndex) {
        return { 
          allowed: false, 
          reason: 'upgrade_required',
          requiredPlan: config.requirePlan
        }
      }
    }
    
    // Check feature flag
    if (config.requireFeature && !features[config.requireFeature]) {
      return { 
        allowed: false, 
        reason: 'feature_disabled' 
      }
    }
    
    return { allowed: true }
  }, [isAuthenticated, user, features, config])
  
  const access = checkAccess()
  
  return {
    allowed: access.allowed,
    reason: access.reason,
    Gate: ({ children }: { children: React.ReactNode }) => {
      if (access.allowed) {
        return <>{children}</>
      }
      
      if (config.showUpgrade && access.reason === 'authentication_required') {
        return (
          <UpgradePrompt
            feature={config.requireFeature}
            onUpgrade={() => openAuthModal()}
          />
        )
      }
      
      return <>{config.fallback}</>
    }
  }
}

// Usage example
function CloudSaveButton() {
  const { allowed, Gate } = useFeatureGate({
    requireAuth: true,
    requireFeature: 'cloudSave',
    showUpgrade: true,
    fallback: (
      <Tooltip content="Sign in to save to cloud">
        <Button disabled>Save to Cloud</Button>
      </Tooltip>
    )
  })
  
  return (
    <Gate>
      <Button onClick={handleCloudSave}>
        Save to Cloud
      </Button>
    </Gate>
  )
}
```

### 6. Session Security

```typescript
// packages/core/auth/SessionSecurity.ts
interface SessionConfig {
  maxAge: number // seconds
  refreshThreshold: number // seconds before expiry
  activityTimeout: number // seconds of inactivity
  rememberMe: boolean
}

export class SecureSessionManager {
  private config: SessionConfig
  private activityTimer: NodeJS.Timeout | null = null
  private refreshTimer: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  
  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      maxAge: 3600, // 1 hour
      refreshThreshold: 300, // 5 minutes
      activityTimeout: 1800, // 30 minutes
      rememberMe: false,
      ...config
    }
  }
  
  startSession(session: Session): void {
    this.scheduleRefresh(session)
    this.startActivityMonitoring()
    this.storeSession(session)
  }
  
  private scheduleRefresh(session: Session): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    const expiresAt = session.expires_at * 1000
    const refreshAt = expiresAt - (this.config.refreshThreshold * 1000)
    const timeUntilRefresh = refreshAt - Date.now()
    
    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshSession()
      }, timeUntilRefresh)
    }
  }
  
  private startActivityMonitoring(): void {
    // Monitor user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const updateActivity = () => {
      this.lastActivity = Date.now()
      this.resetActivityTimer()
    }
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })
    
    this.resetActivityTimer()
  }
  
  private resetActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }
    
    this.activityTimer = setTimeout(() => {
      this.handleInactivity()
    }, this.config.activityTimeout * 1000)
  }
  
  private handleInactivity(): void {
    console.log('User inactive, showing warning')
    
    // Show warning dialog
    const continueSession = confirm(
      'Your session will expire due to inactivity. Continue?'
    )
    
    if (continueSession) {
      this.refreshSession()
      this.resetActivityTimer()
    } else {
      this.endSession()
    }
  }
  
  private storeSession(session: Session): void {
    if (this.config.rememberMe) {
      // Store in localStorage for persistence
      localStorage.setItem('auth_session', JSON.stringify({
        session,
        timestamp: Date.now()
      }))
    } else {
      // Store in sessionStorage for current tab only
      sessionStorage.setItem('auth_session', JSON.stringify({
        session,
        timestamp: Date.now()
      }))
    }
  }
  
  async validateSession(): Promise<boolean> {
    const stored = this.getStoredSession()
    
    if (!stored) return false
    
    // Check if session expired
    const age = Date.now() - stored.timestamp
    if (age > this.config.maxAge * 1000) {
      this.clearStoredSession()
      return false
    }
    
    // Verify with server
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return !error && !!user
    } catch {
      return false
    }
  }
  
  private getStoredSession(): { session: Session; timestamp: number } | null {
    const stored = 
      localStorage.getItem('auth_session') ||
      sessionStorage.getItem('auth_session')
      
    if (!stored) return null
    
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  
  private clearStoredSession(): void {
    localStorage.removeItem('auth_session')
    sessionStorage.removeItem('auth_session')
  }
}
```

## Security Considerations

### 1. CSRF Protection
```typescript
class CSRFProtection {
  private token: string
  
  constructor() {
    this.token = this.generateToken()
    this.attachToRequests()
  }
  
  private generateToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  }
  
  private attachToRequests(): void {
    // Attach to all Supabase requests
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        supabase.rest.headers['X-CSRF-Token'] = this.token
      }
    })
  }
}
```

### 2. Rate Limiting
```typescript
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  checkLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Remove old attempts
    const validAttempts = attempts.filter(
      time => now - time < this.windowMs
    )
    
    if (validAttempts.length >= this.maxAttempts) {
      const oldestAttempt = validAttempts[0]
      const retryAfter = Math.ceil(
        (oldestAttempt + this.windowMs - now) / 1000
      )
      
      return { allowed: false, retryAfter }
    }
    
    // Record new attempt
    validAttempts.push(now)
    this.attempts.set(identifier, validAttempts)
    
    return { allowed: true }
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('Authentication', () => {
  describe('EmailValidator', () => {
    it('validates email format', () => {
      const validator = new EmailValidator()
      
      expect(validator.validate('test@example.com').isValid).toBe(true)
      expect(validator.validate('invalid').isValid).toBe(false)
      expect(validator.validate('').errors).toContain('Email is required')
    })
  })
  
  describe('PasswordValidator', () => {
    it('enforces password requirements', () => {
      const validator = new PasswordValidator()
      
      expect(validator.validate('weak').isValid).toBe(false)
      expect(validator.validate('StrongP@ss1').isValid).toBe(true)
    })
    
    it('calculates password strength', () => {
      const validator = new PasswordValidator()
      
      expect(validator.getStrength('weak').score).toBe(0)
      expect(validator.getStrength('Medium123').score).toBeGreaterThan(1)
      expect(validator.getStrength('V3ry$tr0ng!').score).toBe(4)
    })
  })
})
```

### Integration Tests
```typescript
describe('Auth Flow', () => {
  it('completes signup flow', async () => {
    const { result } = renderHook(() => useUser())
    
    await act(async () => {
      await result.current.signUp('test@example.com', 'Password123!')
    })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.needsEmailVerification).toBe(true)
  })
  
  it('handles session restoration', async () => {
    // Mock stored session
    localStorage.setItem('auth_session', JSON.stringify({
      session: mockSession,
      timestamp: Date.now()
    }))
    
    const { result } = renderHook(() => useUser())
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })
  })
})
```

## Implementation Checklist

- [ ] Auth state machine implementation
- [ ] Enhanced UserProvider with full auth methods
- [ ] Session management with auto-refresh
- [ ] Auth UI components (modal, forms)
- [ ] Form validation system
- [ ] Password strength calculator
- [ ] Feature gating hooks and components
- [ ] Cross-tab session synchronization
- [ ] Security measures (CSRF, rate limiting)
- [ ] Anonymous mode support
- [ ] Work preservation during auth
- [ ] Comprehensive test suite
- [ ] Documentation and examples