import type { TutorialStepDefinition } from './tutorialModel';
import { TUTORIAL_ANCHOR_SELECTORS } from './tutorialModel';

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DEFAULT_TOOLTIP_WIDTH = 400;
const DEFAULT_TOOLTIP_HEIGHT = 250;
const VIEWPORT_MARGIN = 20;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function resolveTutorialTarget(
  step: TutorialStepDefinition,
  root: ParentNode = document
): HTMLElement | null {
  const selectors = [
    ...(step.targetSelectors ?? []),
    ...(step.target ? [step.target] : []),
    ...(step.anchorId ? TUTORIAL_ANCHOR_SELECTORS[step.anchorId] ?? [] : [])
  ];

  for (const selector of selectors) {
    const element = root.querySelector(selector);
    if (element instanceof HTMLElement) {
      return element;
    }
  }

  return null;
}

export function getSpotlightRect(
  target: HTMLElement | null,
  padding = 10
): SpotlightRect | null {
  if (!target) {
    return null;
  }

  const rect = target.getBoundingClientRect();

  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  };
}

export function getSpotlightClipPath(rect: SpotlightRect | null): string {
  if (!rect) {
    return 'none';
  }

  return `polygon(
    0 0,
    0 100%,
    ${rect.left}px 100%,
    ${rect.left}px ${rect.top}px,
    ${rect.left + rect.width}px ${rect.top}px,
    ${rect.left + rect.width}px ${rect.top + rect.height}px,
    ${rect.left}px ${rect.top + rect.height}px,
    ${rect.left}px 100%,
    100% 100%,
    100% 0
  )`;
}

export function getTutorialTooltipPosition(
  step: TutorialStepDefinition,
  target: HTMLElement | null,
  viewport: { width: number; height: number },
  options: {
    tooltipWidth?: number;
    tooltipHeight?: number;
    wizardOpen?: boolean;
  } = {}
): { top: string; left: string } {
  const tooltipWidth = options.tooltipWidth ?? DEFAULT_TOOLTIP_WIDTH;
  const tooltipHeight = options.tooltipHeight ?? DEFAULT_TOOLTIP_HEIGHT;
  const wizardOpen = options.wizardOpen ?? false;

  if (step.position === 'center' || !target) {
    const top = clamp(
      viewport.height / 2 - tooltipHeight / 2,
      VIEWPORT_MARGIN,
      viewport.height - tooltipHeight - VIEWPORT_MARGIN
    );
    const left = clamp(
      viewport.width / 2 - tooltipWidth / 2,
      VIEWPORT_MARGIN,
      viewport.width - tooltipWidth - VIEWPORT_MARGIN
    );
    return { top: `${top}px`, left: `${left}px` };
  }

  if (step.position === 'top-right') {
    return {
      top: `${VIEWPORT_MARGIN}px`,
      left: `${viewport.width - tooltipWidth - VIEWPORT_MARGIN}px`
    };
  }

  const rect = target.getBoundingClientRect();
  let top = VIEWPORT_MARGIN;
  let left = VIEWPORT_MARGIN;

  if (step.anchorId === 'wizard-button' && wizardOpen) {
    top = VIEWPORT_MARGIN;
    left = viewport.width / 2 - tooltipWidth / 2;
  } else {
    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - VIEWPORT_MARGIN;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + VIEWPORT_MARGIN;
        break;
      case 'bottom':
        top = rect.bottom + VIEWPORT_MARGIN;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - VIEWPORT_MARGIN;
        break;
      default:
        top = VIEWPORT_MARGIN;
        left = viewport.width - tooltipWidth - VIEWPORT_MARGIN;
    }
  }

  return {
    top: `${clamp(top, VIEWPORT_MARGIN, viewport.height - tooltipHeight - VIEWPORT_MARGIN)}px`,
    left: `${clamp(left, VIEWPORT_MARGIN, viewport.width - tooltipWidth - VIEWPORT_MARGIN)}px`
  };
}
