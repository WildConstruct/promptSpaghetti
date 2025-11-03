/**
 * Integration tests for core onboarding utilities working together.
 */

import { act } from '@testing-library/react';
import type { Edge, Node } from '@reactflow/core';
import {
  renderTutorialHook,
  resetOnboardingStorage,
} from './testUtils';
import { useTutorial } from '../TutorialContext';
import { PromptParser } from '../../utils/promptParser';
import { TutorialStepValidator } from '../TutorialStepValidator';
import { ElementDetector } from '../ElementDetector';

describe('Tutorial system integration', () => {
  beforeEach(() => {
    resetOnboardingStorage();
    jest.restoreAllMocks();
  });

  it('validates parsed prompt output across tutorial steps', () => {
    const prompt =
      'A {brave|cunning|wise} hero enters the {ancient|forgotten} ruins to find the {sword|amulet}.';
    const parsed = PromptParser.parse(prompt);

    expect(parsed.choiceCount).toBe(3);
    expect(parsed.textCount).toBeGreaterThan(0);

    const nodes: Node<{ nodeType?: string }>[] = parsed.segments.map((segment, index) => ({
      id: `tutorial-node-${index}`,
      type: segment.type === 'choice' ? 'weightedChoice' : 'textBlock',
      position: { x: index * 100, y: 0 },
      data: {
        nodeType: segment.type === 'choice' ? 'weightedChoice' : 'textBlock',
      },
    }));

    const edges: Edge[] = nodes.slice(1).map((node, index) => ({
      id: `tutorial-edge-${index}`,
      source: nodes[index].id,
      target: node.id,
    }));

    const nodesCreated = TutorialStepValidator.validateStep('nodes-created', { nodes });
    expect(nodesCreated.isValid).toBe(true);

    const inlineEdit = TutorialStepValidator.validateStep('inline-edit', { nodes });
    expect(inlineEdit.isValid).toBe(true);

    const previewReady = TutorialStepValidator.validateStep('preview-update', { nodes, edges });
    expect(previewReady.isValid).toBe(true);

    const missingEdges = TutorialStepValidator.validateStep('preview-update', { nodes, edges: [] });
    expect(missingEdges.isValid).toBe(false);
    expect(missingEdges.recoveryMessage).toContain('connecting');

    const { result } = renderTutorialHook(() => useTutorial());

    act(() => {
      result.current.startTutorial();
    });

    act(() => {
      result.current.nextStep(); // empty canvas
      result.current.nextStep(); // open wizard
      result.current.nextStep(); // enter prompt
      result.current.nextStep({ nodes }); // see nodes
    });

    expect(result.current.currentStep).toBeGreaterThan(0);
    expect(result.current.onboardingState.completedSteps.length).toBeGreaterThan(0);
  });

  it('detects dynamically inserted tutorial targets', async () => {
    const detectionPromise = ElementDetector.findElement({
      selector: '.tutorial-target',
      retryDelay: 10,
      maxRetries: 15,
      timeout: 500,
    });

    const target = document.createElement('div');
    target.className = 'tutorial-target';

    setTimeout(() => {
      document.body.appendChild(target);
    }, 30);

    const result = await detectionPromise;
    expect(result.found).toBe(true);
    expect(result.element).toBe(target);

    document.body.removeChild(target);
  });

  it('persists onboarding state across provider remounts', () => {
    const firstRender = renderTutorialHook(() => useTutorial());

    act(() => {
      firstRender.result.current.startTutorial();
      firstRender.result.current.nextStep();
    });

    const progressAfterStep = firstRender.result.current.onboardingState.tutorialProgress;
    expect(progressAfterStep).toBeGreaterThan(0);

    firstRender.unmount();

    const secondRender = renderTutorialHook(() => useTutorial());
    expect(secondRender.result.current.onboardingState.tutorialProgress).toBe(progressAfterStep);
  });
});
