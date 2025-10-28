/**
 * Update Notifications System
 * Epic 8.3 Story 8.3.5 - Version Control and Updates
 *
 * Handles update notifications, version checking, and user alerts
 */

class UpdateNotifier {
  constructor() {
    this.currentVersion = this.getCurrentVersion();
    this.notificationContainer = null;
    this.checkInterval = 30 * 60 * 1000; // 30 minutes
    this.lastCheck = 0;
    this.settings = this.loadSettings();

    this.init();
  }

  /**
   * Initialize the notification system
   */
  init() {
    this.createNotificationContainer();
    this.setupEventListeners();
    this.scheduleChecks();

    // Check for updates on page load
    setTimeout(() => this.checkForUpdates(), 2000);
  }

  /**
   * Get current version from meta tag or API
   */
  getCurrentVersion() {
    const meta = document.querySelector('meta[name="handbook-version"]');
    return meta ? meta.content : '1.0.0';
  }

  /**
   * Load user settings for notifications
   */
  loadSettings() {
    try {
      const settings = localStorage.getItem('handbook-notification-settings');
      return settings
        ? JSON.parse(settings)
        : {
            enabled: true,
            frequency: 'normal', // 'off', 'minimal', 'normal', 'all'
            autoUpdate: false,
            showChangelog: true
          };
    } catch (error) {
      return {
        enabled: true,
        frequency: 'normal',
        autoUpdate: false,
        showChangelog: true
      };
    }
  }

  /**
   * Save user settings
   */
  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem(
      'handbook-notification-settings',
      JSON.stringify(this.settings)
    );
  }

  /**
   * Create notification container
   */
  createNotificationContainer() {
    if (this.notificationContainer) return;

    this.notificationContainer = document.createElement('div');
    this.notificationContainer.className = 'update-notifications';
    this.notificationContainer.innerHTML = `
      <style>
        .update-notifications {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          max-width: 400px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .update-notification {
          background: #fff;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-bottom: 12px;
          padding: 16px;
          animation: slideIn 0.3s ease-out;
          position: relative;
        }
        
        .update-notification.success {
          border-left: 4px solid #28a745;
        }
        
        .update-notification.info {
          border-left: 4px solid #007bff;
        }
        
        .update-notification.warning {
          border-left: 4px solid #ffc107;
        }
        
        .update-notification.error {
          border-left: 4px solid #dc3545;
        }
        
        .update-notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .update-notification-title {
          font-weight: 600;
          font-size: 14px;
          color: #1d2329;
        }
        
        .update-notification-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          color: #6c757d;
        }
        
        .update-notification-close:hover {
          color: #495057;
        }
        
        .update-notification-content {
          font-size: 13px;
          color: #495057;
          line-height: 1.4;
          margin-bottom: 12px;
        }
        
        .update-notification-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .update-notification-button {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        
        .update-notification-button:hover {
          background: #0056b3;
        }
        
        .update-notification-button.secondary {
          background: #6c757d;
        }
        
        .update-notification-button.secondary:hover {
          background: #5a6268;
        }
        
        .update-notification-version {
          font-family: monospace;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
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
        
        @media (max-width: 480px) {
          .update-notifications {
            left: 20px;
            right: 20px;
            top: 10px;
            max-width: none;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .update-notification {
            background: #2d3748;
            border-color: #4a5568;
            color: #e2e8f0;
          }
          
          .update-notification-title {
            color: #f7fafc;
          }
          
          .update-notification-content {
            color: #cbd5e0;
          }
          
          .update-notification-close {
            color: #a0aec0;
          }
          
          .update-notification-close:hover {
            color: #e2e8f0;
          }
          
          .update-notification-version {
            background: #4a5568;
            color: #e2e8f0;
          }
        }
      </style>
    `;

    document.body.appendChild(this.notificationContainer);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for visibility changes to pause checks when not visible
    document.addEventListener('visibilitychange', () => {
      if (
        !document.hidden &&
        Date.now() - this.lastCheck > this.checkInterval
      ) {
        this.checkForUpdates();
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.checkForUpdates();
    });
  }

  /**
   * Schedule periodic update checks
   */
  scheduleChecks() {
    if (this.settings.enabled && this.settings.frequency !== 'off') {
      setInterval(() => {
        if (!document.hidden) {
          this.checkForUpdates();
        }
      }, this.checkInterval);
    }
  }

  /**
   * Check for handbook updates
   */
  async checkForUpdates() {
    if (!this.settings.enabled || this.settings.frequency === 'off') {
      return;
    }

    this.lastCheck = Date.now();

    try {
      // Check multiple sources for update information
      const sources = [
        this.checkVersionAPI(),
        this.checkGitHubReleases(),
        this.checkMetadata()
      ];

      const results = await Promise.allSettled(sources);
      const updates = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      if (updates.length > 0) {
        this.handleUpdates(updates);
      }
    } catch (error) {
      console.warn('Update check failed:', error);
    }
  }

  /**
   * Check version via API endpoint
   */
  async checkVersionAPI() {
    try {
      const response = await fetch('/api/version-check', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      if (this.isNewerVersion(data.version, this.currentVersion)) {
        return {
          type: 'version',
          version: data.version,
          changes: data.changes,
          releaseDate: data.releaseDate,
          source: 'api'
        };
      }
    } catch (error) {
      // API not available, try other sources
      return null;
    }
  }

  /**
   * Check GitHub releases
   */
  async checkGitHubReleases() {
    try {
      const response = await fetch(
        'https://api.github.com/repos/your-org/prompt-spaghetti/releases/latest'
      );
      if (!response.ok) throw new Error('GitHub API request failed');

      const release = await response.json();
      const version = release.tag_name.replace(/^handbook-v/, '');

      if (this.isNewerVersion(version, this.currentVersion)) {
        return {
          type: 'release',
          version: version,
          changes: release.body,
          releaseDate: release.published_at,
          downloadUrl: release.html_url,
          source: 'github'
        };
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Check local metadata for updates
   */
  async checkMetadata() {
    try {
      const response = await fetch(
        '/assets/data/version-metadata.json?t=' + Date.now()
      );
      if (!response.ok) throw new Error('Metadata request failed');

      const metadata = await response.json();

      // Check if content has been updated recently
      const lastUpdated = new Date(metadata.lastUpdated);
      const lastNotified = new Date(
        localStorage.getItem('handbook-last-notified') || '2000-01-01'
      );

      if (lastUpdated > lastNotified && metadata.recentChanges.length > 0) {
        return {
          type: 'content',
          version: metadata.version,
          changes: metadata.recentChanges,
          lastUpdated: metadata.lastUpdated,
          source: 'metadata'
        };
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Compare version strings
   */
  isNewerVersion(newVersion, currentVersion) {
    const parseVersion = v => v.split('.').map(Number);
    const [newMajor, newMinor, newPatch] = parseVersion(newVersion);
    const [currentMajor, currentMinor, currentPatch] =
      parseVersion(currentVersion);

    return (
      newMajor > currentMajor ||
      (newMajor === currentMajor && newMinor > currentMinor) ||
      (newMajor === currentMajor &&
        newMinor === currentMinor &&
        newPatch > currentPatch)
    );
  }

  /**
   * Handle update notifications
   */
  handleUpdates(updates) {
    updates.forEach(update => {
      if (this.shouldShowNotification(update)) {
        this.showUpdateNotification(update);
      }
    });
  }

  /**
   * Check if notification should be shown
   */
  shouldShowNotification(update) {
    const frequency = this.settings.frequency;

    if (frequency === 'off') return false;
    if (frequency === 'minimal' && update.type === 'content') return false;
    if (
      frequency === 'normal' &&
      update.type === 'content' &&
      update.changes.length < 3
    )
      return false;

    return true;
  }

  /**
   * Show update notification
   */
  showUpdateNotification(update) {
    const notification = document.createElement('div');
    notification.className = `update-notification ${this.getNotificationType(update)}`;

    notification.innerHTML = `
      <div class="update-notification-header">
        <div class="update-notification-title">
          ${this.getNotificationTitle(update)}
        </div>
        <button class="update-notification-close" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
      <div class="update-notification-content">
        ${this.getNotificationContent(update)}
      </div>
      <div class="update-notification-actions">
        ${this.getNotificationActions(update)}
      </div>
    `;

    this.notificationContainer.appendChild(notification);

    // Auto-dismiss after 10 seconds for content updates
    if (update.type === 'content') {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 10000);
    }

    // Update last notified timestamp
    localStorage.setItem('handbook-last-notified', new Date().toISOString());
  }

  /**
   * Get notification type class
   */
  getNotificationType(update) {
    switch (update.type) {
      case 'version':
      case 'release':
        return 'info';
      case 'content':
        return 'success';
      default:
        return 'info';
    }
  }

  /**
   * Get notification title
   */
  getNotificationTitle(update) {
    switch (update.type) {
      case 'version':
      case 'release':
        return `Handbook Updated to <span class="update-notification-version">v${update.version}</span>`;
      case 'content':
        return 'New Content Available';
      default:
        return 'Handbook Update';
    }
  }

  /**
   * Get notification content
   */
  getNotificationContent(update) {
    switch (update.type) {
      case 'version':
      case 'release':
        return 'A new version of the handbook is available with improvements and new content.';
      case 'content':
        const changeCount = update.changes.length;
        const recentChange = update.changes[0];
        return `${changeCount} recent ${changeCount === 1 ? 'change' : 'changes'} including: ${recentChange.description}`;
      default:
        return 'The handbook has been updated with new content.';
    }
  }

  /**
   * Get notification actions
   */
  getNotificationActions(update) {
    let actions = [];

    switch (update.type) {
      case 'version':
      case 'release':
        actions.push(
          '<button class="update-notification-button" onclick="location.reload()">Refresh Page</button>'
        );
        if (update.downloadUrl) {
          actions.push(
            `<a href="${update.downloadUrl}" class="update-notification-button secondary" target="_blank">View Release</a>`
          );
        }
        break;
      case 'content':
        actions.push(
          '<button class="update-notification-button" onclick="location.reload()">Refresh Page</button>'
        );
        if (this.settings.showChangelog) {
          actions.push(
            '<a href="/CHANGELOG.md" class="update-notification-button secondary" target="_blank">View Changes</a>'
          );
        }
        break;
    }

    return actions.join('');
  }

  /**
   * Show settings modal
   */
  showSettings() {
    const modal = document.createElement('div');
    modal.className = 'update-settings-modal';
    modal.innerHTML = `
      <div class="update-settings-overlay" onclick="this.parentElement.remove()"></div>
      <div class="update-settings-content">
        <h3>Notification Settings</h3>
        <label>
          <input type="checkbox" ${this.settings.enabled ? 'checked' : ''} onchange="updateNotifier.updateSetting('enabled', this.checked)">
          Enable update notifications
        </label>
        <label>
          Notification frequency:
          <select onchange="updateNotifier.updateSetting('frequency', this.value)">
            <option value="off" ${this.settings.frequency === 'off' ? 'selected' : ''}>Off</option>
            <option value="minimal" ${this.settings.frequency === 'minimal' ? 'selected' : ''}>Minimal</option>
            <option value="normal" ${this.settings.frequency === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="all" ${this.settings.frequency === 'all' ? 'selected' : ''}>All updates</option>
          </select>
        </label>
        <label>
          <input type="checkbox" ${this.settings.showChangelog ? 'checked' : ''} onchange="updateNotifier.updateSetting('showChangelog', this.checked)">
          Show changelog links
        </label>
        <div class="update-settings-actions">
          <button onclick="this.closest('.update-settings-modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Update individual setting
   */
  updateSetting(key, value) {
    this.saveSettings({ [key]: value });
  }

  /**
   * Manual update check
   */
  manualCheck() {
    this.showUpdateNotification({
      type: 'info',
      version: this.currentVersion,
      changes: [],
      message: 'Checking for updates...'
    });

    this.checkForUpdates();
  }
}

// Initialize the update notifier
const updateNotifier = new UpdateNotifier();

// Expose global methods
window.updateNotifier = updateNotifier;
