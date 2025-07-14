import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';
import { InspectorSidebar } from '../packages/core/InspectorSidebar';
import { z } from 'zod';

describe('InspectorSidebar', () => {
  const schema = z.object({
    label: z.string(),
    weight: z.number().min(0).max(1)
  });
  const node = {
    id: 'WeightedChoice-1',
    type: 'WeightedChoice',
    data: { label: 'Choice', weight: 0.5 }
  } as any;

  it('renders fields from schema', () => {
    render(<InspectorSidebar node={node} schema={schema} onChange={() => {}} />);
    expect(screen.getByLabelText('label')).toBeTruthy();
    expect(screen.getByLabelText('weight')).toBeTruthy();
  });

  it('calls onChange when field updates', () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    render(<InspectorSidebar node={node} schema={schema} onChange={onChange} />);
    const input = screen.getByLabelText('label') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Updated' } });
    // debounce 300ms
    jest.advanceTimersByTime(350);
    expect(onChange).toHaveBeenCalledWith({ label: 'Updated' });
    jest.useRealTimers();
  });

  it('shows validation error', () => {
    jest.useFakeTimers();
    render(<InspectorSidebar node={node} schema={schema} onChange={() => {}} />);
    const weightInput = screen.getByLabelText('weight') as HTMLInputElement;
    fireEvent.change(weightInput, { target: { value: '2' } });
    jest.advanceTimersByTime(350);
    expect(screen.getByText(/invalid/i)).toBeTruthy();
    jest.useRealTimers();
  });
});
