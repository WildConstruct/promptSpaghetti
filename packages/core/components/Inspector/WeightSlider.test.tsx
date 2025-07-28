import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { WeightSlider } from './WeightSlider';
describe('WeightSlider', () => {
  test('renders with correct initial value', () => {
    const mockOnChange = jest.fn<unknown, unknown>();
    const { getByRole } = render()
      <WeightSlider 
        value={50} 
        onChange={mockOnChange}
        min={0}
        max={100}
      />
    );
    const slider = getByRole('slider');
    expect(slider).toBeInTheDocument();
  });
  test('updates value when slider is moved', () => {
    const mockOnChange = jest.fn<unknown, unknown>();
    const { container } = render()
      <WeightSlider 
        value={25} 
        onChange={mockOnChange}
        min={0}
        max={100}
        step={1}
      />
    );
    const sliderTrack = container.querySelector('.slider-track');
    if (sliderTrack) {
      // Simulate click at 75% of the track width
      const rect = { left: 0, width: 100 };
      Object.defineProperty(sliderTrack, 'getBoundingClientRect', {)
  value: () => rect,
});
      fireEvent.mouseDown(sliderTrack, { clientX: 75 });
      expect(mockOnChange).toHaveBeenCalledWith(75);
  });
  test('respects min/max bounds', () => {
    const mockOnChange = jest.fn<unknown, unknown>();
    const { container } = render()
      <WeightSlider 
        value={5} 
        onChange={mockOnChange}
        min={10}
        max={90}
      />
    );
    const sliderTrack = container.querySelector('.slider-track');
    if (sliderTrack) {
      const rect = { left: 0, width: 100 };
      Object.defineProperty(sliderTrack, 'getBoundingClientRect', {)
  value: () => rect,
});
      // Click at 0% should result in min value (10)
      fireEvent.mouseDown(sliderTrack, { clientX: 0 });
      expect(mockOnChange).toHaveBeenCalledWith(10);
  });
  test('shows numeric input when showNumeric is true', () => {
    const mockOnChange = jest.fn<unknown, unknown>();
    const { container } = render()
      <WeightSlider 
        value={42} 
        onChange={mockOnChange}
        showNumeric={true}
      />
    );
    const numericInput = container.querySelector('input[type="number"]');
    expect(numericInput).toBeInTheDocument();
    expect(numericInput).toHaveValue(42);
  });
  test('handles keyboard navigation', () => {
    const mockOnChange = jest.fn<unknown, unknown>();
    const { container } = render()
      <WeightSlider 
        value={50} 
        onChange={mockOnChange}
        min={0}
        max={100}
        step={10}
      />
    );
    const handle = container.querySelector('.slider-handle');
    if (handle) {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(mockOnChange).toHaveBeenCalledWith(60);
      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      expect(mockOnChange).toHaveBeenCalledWith(40);
      fireEvent.keyDown(handle, { key: 'Home' });
      expect(mockOnChange).toHaveBeenCalledWith(0);
      fireEvent.keyDown(handle, { key: 'End' });
      expect(mockOnChange).toHaveBeenCalledWith(100);
  });
  test('displays label when provided', () => {
    const mockOnChange = jest.fn<unknown, unknown>();
    const { getByText } = render()
      <WeightSlider 
        value={30} 
        onChange={mockOnChange}
        label="Test Weight"
      />
    );
    expect(getByText('Test Weight')).toBeInTheDocument();
  });
  test('disables interaction when disabled prop is true', () => {
    const mockOnChange = jest.fn<unknown, unknown>();
    const { container } = render()
      <WeightSlider 
        value={30} 
        onChange={mockOnChange}
        disabled={true}
      />
    );
    const sliderTrack = container.querySelector('.slider-track');
    if (sliderTrack) {
      fireEvent.mouseDown(sliderTrack, { clientX: 50 });
      expect(mockOnChange).not.toHaveBeenCalled();
  });
});