# MFA Status Indicators & UI Components

## Executive Summary

This document defines the visual design system for Multi-Factor Authentication (MFA) status indicators and user interface components. The design prioritizes clarity, accessibility, and user comprehension while maintaining consistency with modern security dashboard patterns for 2025.

## Design System Foundation

### Visual Hierarchy Principles
1. **Immediate Recognition**: Critical security states must be instantly recognizable
2. **Progressive Disclosure**: Detailed information available on demand
3. **Consistent Patterns**: Uniform visual language across all components
4. **Accessibility First**: WCAG 2.1 AA compliance with color, contrast, and screen reader support

### Color Palette for Security States
```css
:root {
  /* Security Status Colors */
  --security-success: #10B981;    /* Green - Secure/Protected */
  --security-warning: #F59E0B;    /* Amber - Attention Required */
  --security-danger: #EF4444;     /* Red - Critical/Vulnerable */
  --security-info: #3B82F6;       /* Blue - Informational */
  --security-neutral: #6B7280;    /* Gray - Inactive/Disabled */
  
  /* Status Backgrounds */
  --success-bg: #D1FAE5;          /* Light green background */
  --warning-bg: #FEF3C7;          /* Light amber background */
  --danger-bg: #FEE2E2;           /* Light red background */
  --info-bg: #DBEAFE;             /* Light blue background */
  --neutral-bg: #F3F4F6;          /* Light gray background */
  
  /* Interactive States */
  --hover-opacity: 0.8;
  --focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.5);
  --transition-speed: 0.2s;
}
```

### Typography Scale
```css
/* Typography for Status Components */
.status-label-large {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.status-label-medium {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.status-label-small {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
}

.status-description {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--security-neutral);
}
```

## Core Status Indicator Components

### 1. MFA Status Badge
```html
<div class="mfa-status-badge" data-status="active">
  <div class="status-indicator">
    <div class="status-icon">🔒</div>
    <div class="status-pulse"></div>
  </div>
  <div class="status-content">
    <span class="status-label">MFA Active</span>
    <span class="status-description">2 methods configured</span>
  </div>
</div>
```

```css
.mfa-status-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid;
  transition: all var(--transition-speed) ease;
  cursor: pointer;
}

.mfa-status-badge[data-status="active"] {
  background: var(--success-bg);
  border-color: var(--security-success);
  color: var(--security-success);
}

.mfa-status-badge[data-status="warning"] {
  background: var(--warning-bg);
  border-color: var(--security-warning);
  color: var(--security-warning);
}

.mfa-status-badge[data-status="danger"] {
  background: var(--danger-bg);
  border-color: var(--security-danger);
  color: var(--security-danger);
}

.mfa-status-badge[data-status="inactive"] {
  background: var(--neutral-bg);
  border-color: var(--security-neutral);
  color: var(--security-neutral);
}

.status-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: currentColor;
}

.status-icon {
  font-size: 16px;
  color: white;
  z-index: 2;
}

.status-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.1; }
  100% { transform: scale(1); opacity: 0.3; }
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-weight: 600;
  font-size: 14px;
  color: inherit;
}

.status-description {
  font-size: 12px;
  color: var(--security-neutral);
}

/* Hover and Focus States */
.mfa-status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mfa-status-badge:focus {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

### 2. Security Status Grid
```html
<div class="security-status-grid">
  <div class="status-card" data-method="totp">
    <div class="card-header">
      <div class="method-icon">📱</div>
      <div class="status-dot" data-status="active"></div>
    </div>
    <div class="card-content">
      <h3 class="method-name">Authenticator App</h3>
      <p class="method-status">Active - Microsoft Authenticator</p>
      <div class="last-used">Last used: 2 hours ago</div>
    </div>
    <div class="card-actions">
      <button class="btn-manage">Manage</button>
    </div>
  </div>
  
  <div class="status-card" data-method="sms">
    <div class="card-header">
      <div class="method-icon">📲</div>
      <div class="status-dot" data-status="warning"></div>
    </div>
    <div class="card-content">
      <h3 class="method-name">SMS Verification</h3>
      <p class="method-status">Setup Required</p>
      <div class="setup-prompt">Add phone number</div>
    </div>
    <div class="card-actions">
      <button class="btn-setup">Set Up</button>
    </div>
  </div>
  
  <div class="status-card" data-method="recovery">
    <div class="card-header">
      <div class="method-icon">🎫</div>
      <div class="status-dot" data-status="info"></div>
    </div>
    <div class="card-content">
      <h3 class="method-name">Recovery Codes</h3>
      <p class="method-status">8 of 10 remaining</p>
      <div class="regenerate-prompt">Consider regenerating</div>
    </div>
    <div class="card-actions">
      <button class="btn-regenerate">Regenerate</button>
    </div>
  </div>
</div>
```

```css
.security-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.status-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  transition: all var(--transition-speed) ease;
  position: relative;
  overflow: hidden;
}

.status-card:hover {
  border-color: var(--security-info);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.method-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--info-bg);
  border-radius: 12px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.status-dot::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

.status-dot[data-status="active"] {
  background: var(--security-success);
  color: var(--security-success);
}

.status-dot[data-status="warning"] {
  background: var(--security-warning);
  color: var(--security-warning);
}

.status-dot[data-status="danger"] {
  background: var(--security-danger);
  color: var(--security-danger);
}

.status-dot[data-status="info"] {
  background: var(--security-info);
  color: var(--security-info);
}

.card-content {
  margin-bottom: 16px;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.method-status {
  font-size: 14px;
  color: #4B5563;
  margin: 0 0 4px 0;
}

.last-used,
.setup-prompt,
.regenerate-prompt {
  font-size: 12px;
  color: #6B7280;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-manage,
.btn-setup,
.btn-regenerate {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.btn-manage {
  background: white;
  color: var(--security-info);
  border-color: var(--security-info);
}

.btn-setup {
  background: var(--security-warning);
  color: white;
  border-color: var(--security-warning);
}

.btn-regenerate {
  background: white;
  color: var(--security-neutral);
  border-color: var(--security-neutral);
}

.btn-manage:hover {
  background: var(--security-info);
  color: white;
}

.btn-setup:hover {
  background: #D97706;
}

.btn-regenerate:hover {
  background: var(--security-neutral);
  color: white;
}
```

### 3. Inline Status Indicators
```html
<!-- Table Row Status -->
<tr class="user-row">
  <td class="user-info">
    <div class="user-avatar">JD</div>
    <div class="user-details">
      <span class="user-name">John Doe</span>
      <span class="user-email">john@example.com</span>
    </div>
  </td>
  <td class="mfa-status">
    <div class="inline-status" data-status="active">
      <span class="status-icon">✅</span>
      <span class="status-text">Enabled</span>
    </div>
  </td>
  <td class="method-count">
    <div class="method-badges">
      <span class="method-badge totp">📱</span>
      <span class="method-badge recovery">🎫</span>
      <span class="method-count-text">+2 methods</span>
    </div>
  </td>
  <td class="last-login">2 hours ago</td>
</tr>

<!-- Form Field Status -->
<div class="form-field">
  <label for="phone-number">Phone Number</label>
  <div class="input-group">
    <input type="tel" id="phone-number" class="form-input">
    <div class="field-status" data-status="verified">
      <span class="status-icon">✅</span>
      <span class="status-tooltip">Verified for MFA</span>
    </div>
  </div>
</div>
```

```css
/* Table Row Status */
.inline-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.inline-status[data-status="active"] {
  background: var(--success-bg);
  color: var(--security-success);
}

.inline-status[data-status="warning"] {
  background: var(--warning-bg);
  color: var(--security-warning);
}

.inline-status[data-status="danger"] {
  background: var(--danger-bg);
  color: var(--security-danger);
}

.inline-status[data-status="inactive"] {
  background: var(--neutral-bg);
  color: var(--security-neutral);
}

.status-icon {
  font-size: 10px;
}

.method-badges {
  display: flex;
  align-items: center;
  gap: 4px;
}

.method-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: var(--info-bg);
  font-size: 10px;
}

.method-count-text {
  font-size: 11px;
  color: var(--security-neutral);
  margin-left: 4px;
}

/* Form Field Status */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.field-status {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: help;
}

.field-status[data-status="verified"] .status-icon {
  color: var(--security-success);
}

.field-status[data-status="pending"] .status-icon {
  color: var(--security-warning);
}

.field-status[data-status="error"] .status-icon {
  color: var(--security-danger);
}

.status-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: #1F2937;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-speed) ease;
  margin-bottom: 4px;
}

.field-status:hover .status-tooltip {
  opacity: 1;
}
```

### 4. Security Dashboard Overview
```html
<div class="security-dashboard">
  <div class="dashboard-header">
    <h2 class="dashboard-title">Account Security</h2>
    <div class="security-score">
      <div class="score-circle" data-score="85">
        <svg class="progress-ring" width="60" height="60">
          <circle class="progress-ring-background" cx="30" cy="30" r="25"/>
          <circle class="progress-ring-progress" cx="30" cy="30" r="25" 
                  stroke-dasharray="157" stroke-dashoffset="24"/>
        </svg>
        <div class="score-text">85%</div>
      </div>
      <div class="score-label">Security Score</div>
    </div>
  </div>
  
  <div class="security-summary">
    <div class="summary-item secure">
      <div class="summary-icon">🛡️</div>
      <div class="summary-content">
        <span class="summary-count">3</span>
        <span class="summary-label">Active Methods</span>
      </div>
    </div>
    
    <div class="summary-item warning">
      <div class="summary-icon">⚠️</div>
      <div class="summary-content">
        <span class="summary-count">1</span>
        <span class="summary-label">Needs Attention</span>
      </div>
    </div>
    
    <div class="summary-item info">
      <div class="summary-icon">📊</div>
      <div class="summary-content">
        <span class="summary-count">7</span>
        <span class="summary-label">Days Since Review</span>
      </div>
    </div>
  </div>
  
  <div class="quick-actions">
    <h3 class="section-title">Quick Actions</h3>
    <div class="action-buttons">
      <button class="action-btn primary">
        <span class="btn-icon">📱</span>
        <span class="btn-text">Add Method</span>
      </button>
      <button class="action-btn secondary">
        <span class="btn-icon">🎫</span>
        <span class="btn-text">Get Recovery Codes</span>
      </button>
      <button class="action-btn secondary">
        <span class="btn-icon">🔍</span>
        <span class="btn-text">Review Activity</span>
      </button>
    </div>
  </div>
</div>
```

```css
.security-dashboard {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.security-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.score-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-background {
  fill: none;
  stroke: #E5E7EB;
  stroke-width: 4;
}

.progress-ring-progress {
  fill: none;
  stroke: var(--security-success);
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.score-text {
  position: absolute;
  font-size: 14px;
  font-weight: 600;
  color: var(--security-success);
}

.score-label {
  font-size: 12px;
  color: var(--security-neutral);
}

.security-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.summary-item.secure {
  border-color: var(--security-success);
  background: var(--success-bg);
}

.summary-item.warning {
  border-color: var(--security-warning);
  background: var(--warning-bg);
}

.summary-item.info {
  border-color: var(--security-info);
  background: var(--info-bg);
}

.summary-icon {
  font-size: 20px;
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-count {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
}

.summary-label {
  font-size: 12px;
  color: var(--security-neutral);
}

.quick-actions {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 16px 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  font-size: 14px;
  font-weight: 500;
}

.action-btn.primary {
  background: var(--security-info);
  color: white;
  border-color: var(--security-info);
}

.action-btn.secondary {
  background: white;
  color: var(--security-neutral);
  border-color: var(--security-neutral);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.primary:hover {
  background: #2563EB;
}

.action-btn.secondary:hover {
  background: var(--security-neutral);
  color: white;
}

.btn-icon {
  font-size: 16px;
}
```

### 5. Toast Notifications for MFA Events
```html
<div class="toast-container">
  <div class="toast toast-success" data-type="mfa-success">
    <div class="toast-icon">✅</div>
    <div class="toast-content">
      <div class="toast-title">MFA Setup Complete</div>
      <div class="toast-message">Your account is now protected with multi-factor authentication.</div>
    </div>
    <button class="toast-close">×</button>
  </div>
  
  <div class="toast toast-warning" data-type="mfa-warning">
    <div class="toast-icon">⚠️</div>
    <div class="toast-content">
      <div class="toast-title">Backup Recommended</div>
      <div class="toast-message">Consider adding a backup authentication method.</div>
    </div>
    <div class="toast-actions">
      <button class="toast-action">Add Backup</button>
    </div>
    <button class="toast-close">×</button>
  </div>
</div>
```

```css
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  position: relative;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-success {
  background: var(--success-bg);
  border: 1px solid var(--security-success);
}

.toast-warning {
  background: var(--warning-bg);
  border: 1px solid var(--security-warning);
}

.toast-danger {
  background: var(--danger-bg);
  border: 1px solid var(--security-danger);
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.4;
}

.toast-actions {
  margin-top: 8px;
}

.toast-action {
  background: none;
  border: none;
  color: var(--security-info);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  color: var(--security-neutral);
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
}
```

## Mobile-Responsive Adaptations

### Breakpoint Adjustments
```css
/* Mobile First Responsive Design */
@media (max-width: 768px) {
  .security-status-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .security-summary {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .toast-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }
  
  .mfa-status-badge {
    padding: 16px;
  }
}

/* Tablet Adjustments */
@media (min-width: 769px) and (max-width: 1024px) {
  .security-status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .security-summary {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Touch-friendly interactions */
@media (hover: none) and (pointer: coarse) {
  .status-card:hover {
    transform: none;
  }
  
  .action-btn {
    min-height: 44px;
  }
  
  .toast-close {
    min-width: 44px;
    min-height: 44px;
  }
}
```

## Accessibility Features

### Screen Reader Support
```html
<!-- Semantic markup for screen readers -->
<div class="mfa-status-badge" 
     data-status="active"
     role="status"
     aria-label="MFA Status: Active with 2 methods configured">
  
  <div class="status-indicator" aria-hidden="true">
    <div class="status-icon">🔒</div>
    <div class="status-pulse"></div>
  </div>
  
  <div class="status-content">
    <span class="status-label" aria-describedby="status-description">
      MFA Active
    </span>
    <span id="status-description" class="status-description">
      2 methods configured
    </span>
  </div>
</div>

<!-- Live region for dynamic updates -->
<div id="mfa-announcements" 
     class="sr-only" 
     aria-live="polite" 
     aria-atomic="true">
  <!-- Dynamic status updates announced here -->
</div>
```

### High Contrast Mode Support
```css
@media (prefers-contrast: high) {
  .status-card {
    border-width: 2px;
    border-color: currentColor;
  }
  
  .mfa-status-badge {
    border-width: 2px;
  }
  
  .status-indicator {
    border: 2px solid currentColor;
  }
  
  .action-btn {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .status-pulse,
  .progress-ring-progress {
    animation: none;
  }
  
  .toast {
    animation: none;
  }
  
  * {
    transition: none !important;
  }
}
```

### Focus Management
```css
/* Enhanced focus indicators */
.focusable:focus {
  outline: 3px solid var(--security-info);
  outline-offset: 2px;
}

.status-card:focus-within {
  outline: 2px solid var(--security-info);
  outline-offset: 2px;
}

/* Skip navigation for complex interfaces */
.skip-nav {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--security-info);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1001;
  border-radius: 4px;
}

.skip-nav:focus {
  top: 6px;
}
```

## Interactive Behaviors

### JavaScript Enhancements
```javascript
// MFA Status Component Controller
class MFAStatusController {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateStatus();
    this.startPeriodicUpdates();
  }
  
  bindEvents() {
    // Click handlers for status cards
    this.element.querySelectorAll('.status-card').forEach(card => {
      card.addEventListener('click', this.handleCardClick.bind(this));
      card.addEventListener('keydown', this.handleCardKeydown.bind(this));
    });
    
    // Toast close handlers
    this.element.querySelectorAll('.toast-close').forEach(btn => {
      btn.addEventListener('click', this.closeToast.bind(this));
    });
  }
  
  handleCardClick(event) {
    const card = event.currentTarget;
    const method = card.dataset.method;
    this.openMethodDetails(method);
  }
  
  handleCardKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleCardClick(event);
    }
  }
  
  updateStatus() {
    fetch('/api/mfa/status')
      .then(response => response.json())
      .then(data => this.renderStatus(data))
      .catch(error => this.handleError(error));
  }
  
  renderStatus(data) {
    // Update status indicators
    data.methods.forEach(method => {
      const card = this.element.querySelector(`[data-method="${method.type}"]`);
      if (card) {
        this.updateCard(card, method);
      }
    });
    
    // Update security score
    this.updateSecurityScore(data.securityScore);
    
    // Announce changes to screen readers
    this.announceChanges(data);
  }
  
  updateCard(card, method) {
    const statusDot = card.querySelector('.status-dot');
    const methodStatus = card.querySelector('.method-status');
    const lastUsed = card.querySelector('.last-used');
    
    statusDot.dataset.status = method.status;
    methodStatus.textContent = method.statusText;
    
    if (lastUsed && method.lastUsed) {
      lastUsed.textContent = `Last used: ${method.lastUsed}`;
    }
  }
  
  updateSecurityScore(score) {
    const scoreText = this.element.querySelector('.score-text');
    const progressRing = this.element.querySelector('.progress-ring-progress');
    
    if (scoreText) {
      scoreText.textContent = `${score}%`;
    }
    
    if (progressRing) {
      const circumference = 2 * Math.PI * 25; // radius = 25
      const offset = circumference - (score / 100) * circumference;
      progressRing.style.strokeDashoffset = offset;
    }
  }
  
  announceChanges(data) {
    const announcer = document.getElementById('mfa-announcements');
    if (announcer && data.announcements) {
      announcer.textContent = data.announcements.join('. ');
    }
  }
  
  showToast(type, title, message, actions = []) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${this.getToastIcon(type)}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
        ${actions.length ? this.renderToastActions(actions) : ''}
      </div>
      <button class="toast-close">×</button>
    `;
    
    const container = document.querySelector('.toast-container');
    container.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.closeToast({ currentTarget: toast.querySelector('.toast-close') });
    }, 5000);
    
    // Bind close event
    toast.querySelector('.toast-close').addEventListener('click', this.closeToast.bind(this));
  }
  
  closeToast(event) {
    const toast = event.currentTarget.closest('.toast');
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }
  
  getToastIcon(type) {
    const icons = {
      success: '✅',
      warning: '⚠️',
      danger: '❌',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
  
  startPeriodicUpdates() {
    // Update status every 30 seconds
    setInterval(() => {
      this.updateStatus();
    }, 30000);
  }
}

// Initialize MFA status components
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.security-dashboard').forEach(dashboard => {
    new MFAStatusController(dashboard);
  });
});
```

## Component Usage Guidelines

### When to Use Each Component

1. **MFA Status Badge**: User profiles, account headers, navigation areas
2. **Security Status Grid**: Settings pages, security dashboards, admin panels
3. **Inline Status Indicators**: Data tables, form fields, list items
4. **Security Dashboard Overview**: Main security pages, account summaries
5. **Toast Notifications**: Real-time feedback, error states, success confirmations

### Customization Parameters
```javascript
// Component configuration options
const mfaComponentConfig = {
  statusBadge: {
    size: 'small' | 'medium' | 'large',
    showPulse: boolean,
    clickable: boolean,
    showDescription: boolean
  },
  
  statusGrid: {
    columns: 'auto' | number,
    compactMode: boolean,
    showActions: boolean,
    sortable: boolean
  },
  
  dashboard: {
    showSecurityScore: boolean,
    showQuickActions: boolean,
    updateInterval: number,
    theme: 'light' | 'dark'
  }
};
```

## Performance Considerations

### Optimization Strategies
```css
/* GPU acceleration for animations */
.status-pulse,
.progress-ring-progress {
  will-change: transform, opacity;
}

/* Efficient repaints */
.status-card {
  contain: layout style paint;
}

/* Reduced layout thrashing */
.toast {
  position: fixed;
  contain: layout;
}
```

### Loading States
```html
<div class="status-card loading">
  <div class="card-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-icon"></div>
      <div class="skeleton-dot"></div>
    </div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  </div>
</div>
```

## Conclusion

This comprehensive MFA UI component system provides a consistent, accessible, and user-friendly interface for displaying authentication status across all application touchpoints. The design prioritizes clarity and immediate comprehension while maintaining flexibility for various implementation contexts.

### Key Benefits
- 🎯 **Instant Recognition**: Clear visual hierarchy for security states
- ♿ **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- 📱 **Responsive**: Mobile-first design with touch-friendly interactions
- ⚡ **Performance**: Optimized animations and efficient rendering
- 🔧 **Flexible**: Configurable components for various use cases