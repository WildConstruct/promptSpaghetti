import React from 'react';
import type { TutorialSequenceId } from './tutorialModel';

const CANVAS_TIPS_DISMISSED_COOKIE = 'psg_canvas_tips_dismissed';

export interface CanvasTip {
  id: string;
  title: string;
  body: string;
}

export const canvasTips: CanvasTip[] = [
  {
    id: 'region-boxes',
    title: 'Use regions for reusable thought',
    body: 'Region Boxes are best when they name why a cluster exists, not just where it sits.',
  },
  {
    id: 'branching-grammar',
    title: 'Branch for grammar, not only variety',
    body: 'A small glue node like "with a" can keep clothing, props, and suffixes from colliding.',
  },
  {
    id: 'nested-psg',
    title: 'Nested PSG is a precomp, not a branch',
    body: 'Explore “Nested PSG Intro”: a Sub PSG runs a child composition. Double-click it or use the document tabs — undo stays per tab.',
  },
  {
    id: 'wizard-fragments',
    title: 'Wizard reviews before it swaps',
    body: 'Open Wizard, analyze a prompt, then use Fragment review: original text stays selected until you pick a library match. Create expands real .psg graphs.',
  },
  {
    id: 'notes',
    title: 'Leave notes for future you',
    body: 'Canvas notes are documentation-only: use them to explain decisions without changing output.',
  },
  {
    id: 'commands',
    title: 'Create by command',
    body: 'Press C on the canvas, type weighted or note, and spawn nodes without reaching for the palette.',
  },
];

function hasDismissalCookie() {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .map(part => part.trim())
    .includes(`${CANVAS_TIPS_DISMISSED_COOKIE}=true`);
}

function setDismissalCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAge = 60 * 60 * 24 * 90;
  document.cookie = `${CANVAS_TIPS_DISMISSED_COOKIE}=true; Max-Age=${maxAge}; path=/; SameSite=Lax`;
}

export function getCanvasTipByIndex(index: number) {
  return canvasTips[Math.abs(index) % canvasTips.length];
}

export function getDefaultCanvasTip() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return getCanvasTipByIndex(dayIndex);
}

export interface CanvasTipPanelProps {
  forceOpen?: boolean;
  onDismiss?: () => void;
  onOpenCommander: () => void;
  onStartTutorial: (sequenceId: TutorialSequenceId) => void;
  tip?: CanvasTip;
}

export const CanvasTipPanel: React.FC<CanvasTipPanelProps> = ({
  forceOpen = false,
  onDismiss,
  onOpenCommander,
  onStartTutorial,
  tip = getDefaultCanvasTip(),
}) => {
  const [isVisible, setIsVisible] = React.useState(() => forceOpen || !hasDismissalCookie());

  React.useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
    }
  }, [forceOpen]);

  if (!isVisible) {
    return null;
  }

  const dismiss = () => {
    setDismissalCookie();
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <aside
      aria-label="Canvas tip"
      style={{
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 310,
        zIndex: 130,
        padding: 14,
        borderRadius: 8,
        border: '1px solid rgba(148, 163, 184, 0.22)',
        background: 'rgba(24, 25, 25, 0.96)',
        color: '#e5e7eb',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.32)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#a3a3a3', marginBottom: 6 }}>Canvas tip</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{tip.title}</div>
        </div>
        <button
          type="button"
          aria-label="Dismiss tip"
          onClick={dismiss}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#d4d4d4',
            cursor: 'pointer',
          }}
        >
          x
        </button>
      </div>
      <p style={{ margin: '10px 0 12px', color: '#c8c8c8', fontSize: 13, lineHeight: 1.45 }}>
        {tip.body}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => onStartTutorial('basic')}>Basic</button>
        <button type="button" onClick={() => onStartTutorial('advanced')}>Advanced</button>
        <button type="button" onClick={onOpenCommander}>Commands</button>
      </div>
    </aside>
  );
};
