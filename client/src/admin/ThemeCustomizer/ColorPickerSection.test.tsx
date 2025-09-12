import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColorPickerSection from './ColorPickerSection';

describe('ColorPickerSection', () => {
  const defaultColors = {
    primary: '#000000',
    secondary: '#ffffff',
    background: '#f0f0f0',
    text: '#333333'
  };

  test('renders color picker section with heading', () => {
    const mockOnChange = jest.fn();
    render(
      <ColorPickerSection colors={defaultColors} onChange={mockOnChange} />
    );
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  test('displays all color inputs', () => {
    const mockOnChange = jest.fn();
    render(
      <ColorPickerSection colors={defaultColors} onChange={mockOnChange} />
    );

    // Check for color labels
    expect(screen.getByText('primary')).toBeInTheDocument();
    expect(screen.getByText('secondary')).toBeInTheDocument();
    expect(screen.getByText('background')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  test('displays correct initial color values', () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <ColorPickerSection colors={defaultColors} onChange={mockOnChange} />
    );

    // Check input values
    const inputs = container.querySelectorAll('input[type="color"]');
    expect(inputs).toHaveLength(4);
    expect(inputs[0]).toHaveAttribute('value', '#000000');
    expect(inputs[1]).toHaveAttribute('value', '#ffffff');
    expect(inputs[2]).toHaveAttribute('value', '#f0f0f0');
    expect(inputs[3]).toHaveAttribute('value', '#333333');
  });

  test('calls onChange when color is modified', async () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <ColorPickerSection colors={defaultColors} onChange={mockOnChange} />
    );

    const primaryInput = container.querySelector('input[type="color"]');
    if (primaryInput) {
      fireEvent.change(primaryInput, { target: { value: '#ff0000' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          ...defaultColors,
          primary: '#ff0000'
        });
      });
    }
  });

  test('handles empty colors object gracefully', () => {
    const mockOnChange = jest.fn();
    render(<ColorPickerSection colors={{}} onChange={mockOnChange} />);
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  test('preserves other colors when one is changed', async () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <ColorPickerSection colors={defaultColors} onChange={mockOnChange} />
    );

    const inputs = container.querySelectorAll('input[type="color"]');
    const secondaryInput = inputs[1];

    if (secondaryInput) {
      fireEvent.change(secondaryInput, { target: { value: '#00ff00' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          primary: '#000000',
          secondary: '#00ff00',
          background: '#f0f0f0',
          text: '#333333'
        });
      });
    }
  });

  test('handles rapid color changes', async () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <ColorPickerSection colors={defaultColors} onChange={mockOnChange} />
    );

    const primaryInput = container.querySelector('input[type="color"]');
    if (primaryInput) {
      fireEvent.change(primaryInput, { target: { value: '#ff0000' } });
      fireEvent.change(primaryInput, { target: { value: '#00ff00' } });
      fireEvent.change(primaryInput, { target: { value: '#0000ff' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(3);
        expect(mockOnChange).toHaveBeenLastCalledWith({
          ...defaultColors,
          primary: '#0000ff'
        });
      });
    }
  });
});
