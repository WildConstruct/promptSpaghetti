/**
 * Example: How to integrate the onboarding system
 * 
 * This example shows how to add the interactive
 * tutorial and help system to your Epic 1 app.
 */

import React, { useState } from 'react';
import { 
  OnboardingIntegration,
  useOnboarding,
  ProgressTracker,
} from '../onboarding';
import { Epic1GraphEditor } from '../Epic1GraphEditor';

// Example graph editor with onboarding
export const OnboardingExample: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <OnboardingIntegration showProgress={true}>
      <div style={{ width: '100vw', height: '100vh' }}>
        {/* Welcome screen for tutorial */}
        <div className="tutorial-welcome" />
        
        {/* Main app */}
        <Epic1GraphEditor />
        
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '12px 24px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Settings
        </button>

        {/* Settings panel */}
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </div>
    </OnboardingIntegration>
  );
};

// Settings panel with tutorial controls
const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    resetTutorial, 
    updatePreferences, 
    onboardingState,
    celebrateAchievement,
  } = useOnboarding();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100%',
        backgroundColor: 'white',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ margin: 0 }}>Settings</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      {/* Tutorial Section */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Tutorial & Help</h3>
        
        <button
          onClick={resetTutorial}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          Restart Tutorial
        </button>

        {/* Preferences */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={onboardingState.preferences.showTooltips}
              onChange={(e) => updatePreferences({ showTooltips: e.target.checked })}
            />
            Show helpful tooltips
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={onboardingState.preferences.enableCelebrations}
              onChange={(e) => updatePreferences({ enableCelebrations: e.target.checked })}
            />
            Enable celebration animations
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={onboardingState.preferences.keyboardShortcutsOverlay}
              onChange={(e) => updatePreferences({ keyboardShortcutsOverlay: e.target.checked })}
            />
            Show keyboard shortcuts on ?
          </label>
        </div>
      </section>

      {/* Progress Section */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px' }}>Your Progress</h3>
        <ProgressTracker />
      </section>

      {/* Test Celebrations */}
      <section>
        <h3 style={{ marginBottom: '16px' }}>Test Celebrations</h3>
        <button
          onClick={() => celebrateAchievement('Test Achievement', 'This is what celebrations look like!')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Test Celebration
        </button>
      </section>
    </div>
  );
};

// Example: Triggering first edit celebration
export const FirstEditExample: React.FC = () => {
  const { triggerFirstEdit, hasCompletedTutorial } = useOnboarding();
  const [nodeText, setNodeText] = useState('Original text');

  const handleEdit = (newText: string) => {
    setNodeText(newText);
    
    // Trigger first edit celebration
    if (!hasCompletedTutorial()) {
      triggerFirstEdit();
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>First Edit Detection Example</h2>
      
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
        }}
      >
        <p>Current text: {nodeText}</p>
        
        <input
          type="text"
          value={nodeText}
          onChange={(e) => handleEdit(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
          }}
        />
        
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
          Edit the text above to trigger the first edit celebration!
        </p>
      </div>
    </div>
  );
};

// Example: Tutorial state management
export const TutorialStateExample: React.FC = () => {
  const { 
    onboardingState,
    startTutorial,
    isNewUser,
    hasCompletedTutorial,
  } = useOnboarding();

  return (
    <div style={{ padding: '40px' }}>
      <h2>Tutorial State Management</h2>
      
      <div style={{ marginTop: '24px' }}>
        <h3>Current State:</h3>
        <pre
          style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        >
          {JSON.stringify({
            isNewUser: isNewUser(),
            hasCompletedTutorial: hasCompletedTutorial(),
            tutorialProgress: onboardingState.tutorialProgress,
            completedSteps: onboardingState.completedSteps,
            achievementsUnlocked: onboardingState.achievementsUnlocked,
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          onClick={startTutorial}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Start Tutorial
        </button>
      </div>
    </div>
  );
};