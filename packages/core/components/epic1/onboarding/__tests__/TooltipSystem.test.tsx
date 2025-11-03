/**
 * Tests for Contextual Tooltip System
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  TutorialProvider,
  TooltipManagerProvider,
  ContextualTooltips,
  SmartTooltip,
  TooltipWrapper,
  useTooltipManager,
  tooltipPresets,
} from '../index';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Contextual Tooltip System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('ContextualTooltips', () => {
    test('shows tooltip on hover after delay', async () => {
      render(
        <TutorialProvider>
          <div>
            <button id="test-button" className="test-button">Hover me</button>
            <ContextualTooltips 
              additionalTooltips={[{
                id: 'test-tooltip',
                target: '.test-button',
                title: 'Test Tooltip',
                content: 'This is a test tooltip',
                delay: 100,
              }]}
            />
          </div>
        </TutorialProvider>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      // Should not show immediately
      expect(screen.queryByText('Test Tooltip')).not.toBeInTheDocument();

      // Should show after delay
      await waitFor(() => {
        expect(screen.getByText('Test Tooltip')).toBeInTheDocument();
        expect(screen.getByText('This is a test tooltip')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    test('hides tooltip on mouse leave', async () => {
      render(
        <TutorialProvider>
          <div>
            <button id="test-button" className="test-button">Hover me</button>
            <ContextualTooltips 
              additionalTooltips={[{
                id: 'test-tooltip',
                target: '.test-button',
                title: 'Test Tooltip',
                content: 'Test content',
                delay: 0,
              }]}
            />
          </div>
        </TutorialProvider>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Test Tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(screen.queryByText('Test Tooltip')).not.toBeInTheDocument();
      });
    });

    test('respects showOnce flag', async () => {
      render(
        <TutorialProvider>
          <div>
            <button id="test-button" className="test-button">Hover me</button>
            <ContextualTooltips 
              additionalTooltips={[{
                id: 'once-tooltip',
                target: '.test-button',
                title: 'Once Only',
                content: 'Shows only once',
                delay: 0,
                showOnce: true,
              }]}
            />
          </div>
        </TutorialProvider>
      );

      const button = screen.getByText('Hover me');
      
      // First hover
      fireEvent.mouseEnter(button);
      await waitFor(() => {
        expect(screen.getByText('Once Only')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(button);
      await waitFor(() => {
        expect(screen.queryByText('Once Only')).not.toBeInTheDocument();
      });

      // Second hover - should not show
      fireEvent.mouseEnter(button);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.queryByText('Once Only')).not.toBeInTheDocument();
    });

    test('dismiss functionality', async () => {
      render(
        <TutorialProvider>
          <div>
            <button id="test-button" className="test-button">Hover me</button>
            <ContextualTooltips 
              additionalTooltips={[{
                id: 'dismiss-test',
                target: '.test-button',
                title: 'Dismissible',
                content: 'Can be dismissed',
                delay: 0,
              }]}
            />
          </div>
        </TutorialProvider>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Dismissible')).toBeInTheDocument();
      });

      // Click dismiss button
      const dismissButton = screen.getByLabelText('Close tooltip');
      fireEvent.click(dismissButton);

      expect(screen.queryByText('Dismissible')).not.toBeInTheDocument();
    });

    test('priority indicator', async () => {
      render(
        <TutorialProvider>
          <div>
            <button id="test-button" className="test-button">Hover me</button>
            <ContextualTooltips 
              additionalTooltips={[{
                id: 'priority-test',
                target: '.test-button',
                title: 'Important',
                content: 'High priority tooltip',
                delay: 0,
                priority: 'high',
              }]}
            />
          </div>
        </TutorialProvider>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('TIP')).toBeInTheDocument();
      });
    });
  });

  describe('SmartTooltip', () => {
    test('positions tooltip correctly', () => {
      const targetElement = document.createElement('div');
      targetElement.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        width: 100,
        height: 50,
      }));
      document.body.appendChild(targetElement);

      render(
        <SmartTooltip
          target={targetElement}
          visible={true}
          position="bottom"
        >
          <div>Tooltip content</div>
        </SmartTooltip>
      );

      const tooltip = screen.getByText('Tooltip content').parentElement;
      expect(tooltip).toHaveStyle({ position: 'fixed' });
    });

    test('auto-positioning selects best position', () => {
      const targetElement = document.createElement('div');
      targetElement.getBoundingClientRect = jest.fn(() => ({
        top: 10,
        left: 10,
        bottom: 60,
        right: 110,
        width: 100,
        height: 50,
      }));
      document.body.appendChild(targetElement);

      render(
        <SmartTooltip
          target={targetElement}
          visible={true}
          position="auto"
        >
          <div>Auto positioned</div>
        </SmartTooltip>
      );

      // Should position below since top space is limited
      expect(screen.getByText('Auto positioned')).toBeInTheDocument();
    });

    test('arrow rendering', () => {
      const targetElement = document.createElement('div');
      targetElement.getBoundingClientRect = jest.fn(() => ({
        top: 100,
        left: 100,
        bottom: 150,
        right: 200,
        width: 100,
        height: 50,
      }));
      document.body.appendChild(targetElement);

      render(
        <SmartTooltip
          target={targetElement}
          visible={true}
          arrow={true}
        >
          <div>With arrow</div>
        </SmartTooltip>
      );

      const arrow = document.querySelector('.tooltip-arrow');
      expect(arrow).toBeInTheDocument();
    });
  });

  describe('TooltipWrapper', () => {
    test('shows tooltip on hover with delay', async () => {
      render(
        <TooltipWrapper
          content="Wrapped tooltip content"
          delay={100}
        >
          <button>Wrapped button</button>
        </TooltipWrapper>
      );

      const button = screen.getByText('Wrapped button');
      fireEvent.mouseEnter(button);

      // Not visible immediately
      expect(screen.queryByText('Wrapped tooltip content')).not.toBeInTheDocument();

      // Visible after delay
      await waitFor(() => {
        expect(screen.getByText('Wrapped tooltip content')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    test('disabled prop prevents tooltip', async () => {
      render(
        <TooltipWrapper
          content="Should not show"
          delay={0}
          disabled={true}
        >
          <button>Disabled tooltip</button>
        </TooltipWrapper>
      );

      const button = screen.getByText('Disabled tooltip');
      fireEvent.mouseEnter(button);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });
  });

  describe('TooltipManager', () => {
    test('manages multiple tooltips', () => {
      const TestComponent = () => {
        const { showTooltip, activeTooltips } = useTooltipManager();
        
        return (
          <div>
            <button onClick={() => showTooltip({
              id: 'tooltip1',
              target: '.target1',
              title: 'Tooltip 1',
              content: 'Content 1',
            })}>
              Show Tooltip 1
            </button>
            <button onClick={() => showTooltip({
              id: 'tooltip2',
              target: '.target2',
              title: 'Tooltip 2',
              content: 'Content 2',
            })}>
              Show Tooltip 2
            </button>
            <div>Active: {activeTooltips.length}</div>
          </div>
        );
      };

      render(
        <TutorialProvider>
          <TooltipManagerProvider>
            <TestComponent />
          </TooltipManagerProvider>
        </TutorialProvider>
      );

      fireEvent.click(screen.getByText('Show Tooltip 1'));
      expect(screen.getByText('Active: 1')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Show Tooltip 2'));
      expect(screen.getByText('Active: 2')).toBeInTheDocument();
    });

    test('tooltip queue functionality', async () => {
      const TestComponent = () => {
        const { queueTooltips, nextInQueue, queue } = useTooltipManager();
        
        return (
          <div>
            <button onClick={() => queueTooltips([
              { id: 'q1', target: '.t1', title: 'First', content: 'First tooltip' },
              { id: 'q2', target: '.t2', title: 'Second', content: 'Second tooltip' },
              { id: 'q3', target: '.t3', title: 'Third', content: 'Third tooltip' },
            ])}>
              Start Queue
            </button>
            <button onClick={nextInQueue}>Next</button>
            <div>Queue position: {queue.currentIndex + 1}/{queue.tooltips.length}</div>
          </div>
        );
      };

      render(
        <TutorialProvider>
          <TooltipManagerProvider>
            <TestComponent />
          </TooltipManagerProvider>
        </TutorialProvider>
      );

      fireEvent.click(screen.getByText('Start Queue'));
      expect(screen.getByText('Queue position: 1/3')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Next'));
      await waitFor(() => {
        expect(screen.getByText('Queue position: 2/3')).toBeInTheDocument();
      });
    });

    test('respects tooltip preferences', () => {
      const savedState = {
        preferences: {
          showTooltips: false,
        },
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

      const TestComponent = () => {
        const { showTooltip, activeTooltips } = useTooltipManager();
        
        return (
          <div>
            <button onClick={() => showTooltip({
              id: 'test',
              target: '.test',
              title: 'Test',
              content: 'Should not show',
            })}>
              Show Tooltip
            </button>
            <div>Active: {activeTooltips.length}</div>
          </div>
        );
      };

      render(
        <TutorialProvider>
          <TooltipManagerProvider>
            <TestComponent />
          </TooltipManagerProvider>
        </TutorialProvider>
      );

      fireEvent.click(screen.getByText('Show Tooltip'));
      expect(screen.getByText('Active: 0')).toBeInTheDocument();
    });
  });
});
