import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ArrowLeft } from 'lucide-react';
const SettingsPage: React.FC = () => {
  const { user: _user } = useAuthStore(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const [settings, setSettings] = useState({)
  notifications: {
  email: true,
  browser: true,
  taskUpdates: true,
  systemAlerts: false,
},
  preferences: {
  theme: 'system',
  language: 'en',
  autoSave: true,
  showTips: true,
},
  privacy: {
  profileVisible: true,
  activityTracking: true,
  analyticsOptIn: false,
});
  const [activeSection, setActiveSection] = useState('notifications');
  const handleSettingChange = (section: string, key: string, value: Error) => {
  setSettings(prev => ({)
  ...prev,
  [section]: {
  ...prev[section as keyof typeof prev],
  [key]: value,
}));
  };
  const handleSaveSettings = () => {
  // In a real app, this would save to backend
  console.log('Saving settings:', settings);
  alert('Settings saved successfully!');
};
  const renderToggle = (checked: boolean, onChange: (checked: boolean) => void) => (;);
    <button
      onClick={() => onChange(!checked)}
      style={{
  width: '44px',
  height: '24px',
  borderRadius: '12px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: checked ? '#3b82f6' : '#d1d5db',
  position: 'relative',
  transition: 'background-color 0.2s',
}}
    >
      <div
        style={{
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  position: 'absolute',
  top: '2px',
  left: checked ? '22px' : '2px',
  transition: 'left 0.2s',
}}
      />
    </button>
  );
  const sections = [;
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '👤' }
  ];
  return;
    <div style={{
  padding: '40px',
  maxWidth: '1000px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  minHeight: '100vh',
}}>
      <div style={{
  marginBottom: '32px',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '16px',
}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
  textDecoration: 'none',
}}
          >
            <ArrowLeft size={16} />
            Back to App
          </button>
          <h1 style={{
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  margin: 0,
}}>
            Settings
          </h1>
        </div>
        <p style={{
  color: '#6b7280',
  fontSize: '14px',
  margin: 0,
}}>
          Customize your experience and manage your account preferences
        </p>
      </div>
      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Settings Navigation */}
        <div style={{ width: '200px' }}>
          <nav>
            {sections.map(section => ()
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  backgroundColor: activeSection === section.id ? '#f3f4f6' : 'transparent',
  borderRadius: '8px',
  cursor: 'pointer',
  marginBottom: '4px',
  fontSize: '14px',
  fontWeight: activeSection === section.id ? '500' : '400',
  color: activeSection === section.id ? '#111827' : '#6b7280',
  textAlign: 'left',
}}
              >
                <span>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          {activeSection === 'notifications' && ()
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Notification Settings
              </h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Email Notifications</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Receive email updates about your tasks and projects
                    </div>
                  </div>
                  {renderToggle()
                    settings.notifications.email,
                    (checked) => handleSettingChange('notifications', 'email', checked)
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Browser Notifications</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Show desktop notifications in your browser
                    </div>
                  </div>
                  {renderToggle()
                    settings.notifications.browser,
                    (checked) => handleSettingChange('notifications', 'browser', checked)
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Task Updates</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Get notified when tasks are assigned or updated
                    </div>
                  </div>
                  {renderToggle()
                    settings.notifications.taskUpdates,
                    (checked) => handleSettingChange('notifications', 'taskUpdates', checked)
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>System Alerts</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Important system maintenance and security alerts
                    </div>
                  </div>
                  {renderToggle()
                    settings.notifications.systemAlerts,
                    (checked) => handleSettingChange('notifications', 'systemAlerts', checked)
                  )}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'preferences' && ()
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                User Preferences
              </h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                    Theme
                  </label>
                  <select
                    value={settings.preferences.theme}
                    onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                    style={{
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  backgroundColor: '#ffffff',
}}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                    Language
                  </label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                    style={{
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  backgroundColor: '#ffffff',
}}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Auto-save</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Automatically save your work as you edit
                    </div>
                  </div>
                  {renderToggle()
                    settings.preferences.autoSave,
                    (checked) => handleSettingChange('preferences', 'autoSave', checked)
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Show Tips</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Display helpful tips and tutorials
                    </div>
                  </div>
                  {renderToggle()
                    settings.preferences.showTips,
                    (checked) => handleSettingChange('preferences', 'showTips', checked)
                  )}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'privacy' && ()
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Privacy Settings
              </h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Profile Visibility</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Allow others to see your profile information
                    </div>
                  </div>
                  {renderToggle()
                    settings.privacy.profileVisible,
                    (checked) => handleSettingChange('privacy', 'profileVisible', checked)
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Activity Tracking</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Track your activity for better insights
                    </div>
                  </div>
                  {renderToggle()
                    settings.privacy.activityTracking,
                    (checked) => handleSettingChange('privacy', 'activityTracking', checked)
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Analytics Opt-in</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Help improve the platform by sharing anonymous usage data
                    </div>
                  </div>
                  {renderToggle()
                    settings.privacy.analyticsOptIn,
                    (checked) => handleSettingChange('privacy', 'analyticsOptIn', checked)
                  )}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'account' && ()
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Account Settings
              </h2>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div style={{
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
}}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>
                    Change Password
                  </h3>
                  <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '12px' }}>
                    Update your account password for better security.
                  </p>
                  <button
                    style={{
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
}}
                    onClick={() => alert('Password change functionality would be implemented here')}
                  >
                    Change Password
                  </button>
                </div>
                <div style={{
  backgroundColor: '#fee2e2',
  border: '1px solid #ef4444',
  borderRadius: '8px',
  padding: '16px',
}}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                    Delete Account
                  </h3>
                  <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '12px' }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    style={{
  backgroundColor: '#ef4444',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
}}
                    onClick={() => alert('Account deletion would require additional confirmation')}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Save Button */}
          <div style={{
  marginTop: '32px',
  paddingTop: '20px',
  borderTop: '1px solid #e5e7eb',
}}>
            <button
              onClick={handleSaveSettings}
              style={{
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: '500',
}}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;