import React, { useEffect, useMemo } from 'react';
import {
  TUTORIAL_SEQUENCE_META,
  tutorialSequences,
  type TutorialSequenceId
} from '@promptscape/core/components/epic1/onboarding/tutorialModel';

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersistedProgress {
  completedSequences: TutorialSequenceId[];
  sequenceProgress: Partial<Record<TutorialSequenceId, number>>;
}

// Read completion straight from the onboarding localStorage the TutorialProvider
// writes (this modal lives outside the provider, so it can't use the hook).
function readProgress(): PersistedProgress {
  try {
    const raw = localStorage.getItem('onboardingState');
    if (!raw) {
      return { completedSequences: [], sequenceProgress: {} };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    return {
      completedSequences: Array.isArray(parsed.completedSequences)
        ? parsed.completedSequences
        : [],
      sequenceProgress:
        parsed.sequenceProgress && typeof parsed.sequenceProgress === 'object'
          ? parsed.sequenceProgress
          : {}
    };
  } catch {
    return { completedSequences: [], sequenceProgress: {} };
  }
}

export const TutorialsModal: React.FC<TutorialsModalProps> = ({
  isOpen,
  onClose
}) => {
  const progress = useMemo(() => (isOpen ? readProgress() : null), [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !progress) {
    return null;
  }

  const sequences = (
    Object.keys(TUTORIAL_SEQUENCE_META) as TutorialSequenceId[]
  ).sort(
    (a, b) => TUTORIAL_SEQUENCE_META[a].order - TUTORIAL_SEQUENCE_META[b].order
  );

  const start = (id: TutorialSequenceId) => {
    onClose();
    window.dispatchEvent(
      new CustomEvent('epic1:startTutorial', { detail: { sequenceId: id } })
    );
  };

  const statusFor = (id: TutorialSequenceId) => {
    if (progress.completedSequences.includes(id)) {
      return { label: 'Completed', done: true, pct: 100 };
    }
    const pct = Math.round(progress.sequenceProgress[id] ?? 0);
    if (pct > 0 && pct < 100) {
      return { label: `${pct}% complete`, done: false, pct };
    }
    if (pct >= 100) {
      return { label: 'Completed', done: true, pct: 100 };
    }
    return { label: 'Not started', done: false, pct: 0 };
  };

  return (
    <div
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001
      }}
    >
      <div
        style={{
          background: '#15181e',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          width: 'min(560px, 92vw)',
          maxHeight: '86vh',
          overflowY: 'auto',
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.55)',
          color: '#e8edf4'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            padding: '20px 22px 12px'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#f1f6f9'
              }}
            >
              Tutorials
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '12.5px',
                color: '#9aa4ad'
              }}
            >
              Guided walkthroughs. Your progress is saved as you go.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9aa4ad',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            x
          </button>
        </div>

        <div style={{ padding: '4px 16px 18px', display: 'grid', gap: '10px' }}>
          {sequences.map(id => {
            const meta = TUTORIAL_SEQUENCE_META[id];
            const steps = tutorialSequences[id]?.length ?? 0;
            const status = statusFor(id);
            return (
              <div
                key={id}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '6px'
                  }}
                >
                  <span
                    style={{ fontSize: '14px', fontWeight: 600, color: '#f1f6f9' }}
                  >
                    {meta.title}
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      color: status.done ? '#1a1206' : '#c9d2db',
                      background: status.done
                        ? '#7ed957'
                        : status.pct > 0
                          ? 'rgba(230, 162, 60, 0.22)'
                          : 'rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    {status.label}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '11px',
                      color: '#7f8a94'
                    }}
                  >
                    {steps} steps
                  </span>
                </div>
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    color: '#c1cad3'
                  }}
                >
                  {meta.summary}
                </p>
                <button
                  onClick={() => start(id)}
                  style={{
                    padding: '7px 14px',
                    border: 'none',
                    borderRadius: '7px',
                    background: '#e6a23c',
                    color: '#1a1206',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {status.pct > 0 && !status.done
                    ? 'Restart tutorial'
                    : status.done
                      ? 'Replay tutorial'
                      : 'Start tutorial'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TutorialsModal;
