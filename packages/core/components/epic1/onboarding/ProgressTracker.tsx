/**
 * Progress Tracker - Shows tutorial and feature discovery progress
 */

import React from 'react';
import { useTutorial } from './TutorialContext';

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  label, 
  current, 
  total, 
  color = '#6366f1' 
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: '14px',
        }}
      >
        <span style={{ color: '#4a4a4a' }}>{label}</span>
        <span style={{ color: '#666' }}>{percentage}%</span>
      </div>
      <div
        style={{
          height: '8px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
};

export const ProgressTracker: React.FC = () => {
  const { onboardingState, tutorialSteps } = useTutorial();

  const achievements = [
    { id: 'tutorial_complete', name: 'Tutorial Master', icon: '🎓' },
    { id: 'first_edit', name: 'First Edit', icon: '✏️' },
    { id: 'graph_master', name: 'Graph Master', icon: '🕸️' },
    { id: 'speed_demon', name: 'Speed Demon', icon: '⚡' },
    { id: 'explorer', name: 'Feature Explorer', icon: '🔍' },
    { id: 'power_user', name: 'Power User', icon: '💪' },
  ];

  const helpSections = [
    { id: 'keyboard_shortcuts', name: 'Keyboard Shortcuts' },
    { id: 'node_types', name: 'Node Types' },
    { id: 'advanced_features', name: 'Advanced Features' },
    { id: 'tips_tricks', name: 'Tips & Tricks' },
  ];

  const unlockedCount = onboardingState.achievementsUnlocked.length;
  const viewedHelpCount = Object.keys(onboardingState.helpViewed).length;

  return (
    <div
      className="progress-tracker"
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '20px',
          color: '#1a1a1a',
        }}
      >
        Your Progress
      </h3>

      {/* Tutorial Progress */}
      <ProgressBar
        label="Tutorial Progress"
        current={onboardingState.completedSteps.length}
        total={tutorialSteps.length}
        color="#6366f1"
      />

      {/* Achievements */}
      <ProgressBar
        label="Achievements Unlocked"
        current={unlockedCount}
        total={achievements.length}
        color="#10b981"
      />

      {/* Help Sections Viewed */}
      <ProgressBar
        label="Help Topics Explored"
        current={viewedHelpCount}
        total={helpSections.length}
        color="#f59e0b"
      />

      {/* Achievement List */}
      <div style={{ marginTop: '24px' }}>
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#1a1a1a',
          }}
        >
          Achievements
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {achievements.map((achievement) => {
            const isUnlocked = onboardingState.achievementsUnlocked.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: isUnlocked ? '#f0fdf4' : '#f9fafb',
                  border: `1px solid ${isUnlocked ? '#86efac' : '#e5e7eb'}`,
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                title={achievement.name}
              >
                <div
                  style={{
                    fontSize: '24px',
                    marginBottom: '4px',
                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                    opacity: isUnlocked ? 1 : 0.5,
                  }}
                >
                  {achievement.icon}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: isUnlocked ? '#059669' : '#9ca3af',
                    textAlign: 'center',
                  }}
                >
                  {achievement.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones */}
      <div style={{ marginTop: '24px' }}>
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#1a1a1a',
          }}
        >
          Next Milestones
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            color: '#4a4a4a',
          }}
        >
          {!onboardingState.achievementsUnlocked.includes('tutorial_complete') && (
            <li style={{ marginBottom: '8px' }}>Complete the tutorial</li>
          )}
          {!onboardingState.achievementsUnlocked.includes('graph_master') && (
            <li style={{ marginBottom: '8px' }}>Create your first graph</li>
          )}
          {viewedHelpCount < helpSections.length && (
            <li style={{ marginBottom: '8px' }}>Explore all help topics</li>
          )}
          {unlockedCount < achievements.length && (
            <li>Unlock all achievements</li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Mini progress widget for header
export const ProgressWidget: React.FC = () => {
  const { onboardingState } = useTutorial();
  const sequenceProgress = onboardingState.sequenceProgress ?? { basic: 0, advanced: 0 };
  const items = [
    { id: 'basic', label: 'Basic', progress: sequenceProgress.basic ?? 0, color: '#22c55e' },
    { id: 'advanced', label: 'Advanced', progress: sequenceProgress.advanced ?? 0, color: '#38bdf8' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gap: '8px',
        width: '220px',
        padding: '10px 12px',
        backgroundColor: 'rgba(24, 25, 25, 0.94)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '8px',
        color: '#e5e7eb',
        fontSize: '12px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28)',
      }}
    >
      <span style={{ color: '#a3a3a3', fontSize: '11px' }}>Tutorial progress</span>
      {items.map(item => (
        <div key={item.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{item.label}</span>
            <span>{Math.round(item.progress)}%</span>
          </div>
          <div
            style={{
              height: '4px',
              backgroundColor: 'rgba(229, 231, 235, 0.14)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.max(0, Math.min(item.progress, 100))}%`,
                backgroundColor: item.color,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
