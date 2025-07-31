/**
 * Input component tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, TextArea } from '../../src/components/Input';
import { ThemeProvider } from '../../src/components/ThemeProvider';

const renderInput = (Component = Input, props = {}) => {
  return render(
    <ThemeProvider>
      <Component {...props} />
    </ThemeProvider>
  );
};

describe('Input', () => {
  it('renders correctly', () => {
    renderInput(Input, { label: 'Test Input' });
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = jest.fn();
    renderInput(Input, { label: 'Test Input', onChange: handleChange });

    const input = screen.getByLabelText('Test Input');
    await userEvent.type(input, 'test value');

    expect(handleChange).toHaveBeenCalledWith('test value');
  });

  it('supports controlled input', () => {
    renderInput(Input, { label: 'Test Input', value: 'controlled value' });
    const input = screen.getByDisplayValue('controlled value');
    expect(input).toBeInTheDocument();
  });

  it('supports different input types', () => {
    const { rerender } = renderInput(Input, { type: 'email' });
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(
      <ThemeProvider>
        <Input type="password" />
      </ThemeProvider>
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
  });

  it('shows validation errors', () => {
    renderInput(Input, {
      label: 'Test Input',
      error: 'This field is required',
      invalid: true,
    });

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports different sizes', () => {
    renderInput(Input, { size: 'sm' });
    expect(screen.getByRole('textbox')).toHaveClass('ui-input--sm');
  });

  it('can be disabled', () => {
    renderInput(Input, { disabled: true });
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('can be readonly', () => {
    renderInput(Input, { readOnly: true });
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('supports icons', () => {
    renderInput(Input, { icon: '🔍', iconPosition: 'left' });
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('supports hints', () => {
    renderInput(Input, { hint: 'Enter your email address' });
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('handles focus and blur events', async () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    renderInput(Input, { onFocus: handleFocus, onBlur: handleBlur });

    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    expect(handleFocus).toHaveBeenCalled();

    await userEvent.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <ThemeProvider>
        <Input ref={ref} />
      </ThemeProvider>
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('TextArea', () => {
  it('renders correctly', () => {
    renderInput(TextArea, { label: 'Test TextArea' });
    expect(screen.getByLabelText('Test TextArea')).toBeInTheDocument();
  });

  it('handles multiline input', async () => {
    const handleChange = jest.fn();
    renderInput(TextArea, { label: 'Test TextArea', onChange: handleChange });

    const textarea = screen.getByLabelText('Test TextArea');
    await userEvent.type(textarea, 'Line 1\nLine 2');

    expect(handleChange).toHaveBeenCalledWith('Line 1\nLine 2');
  });

  it('supports rows configuration', () => {
    renderInput(TextArea, { rows: 5 });
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('supports resize control', () => {
    renderInput(TextArea, { resize: 'vertical' });
    expect(screen.getByRole('textbox')).toHaveClass('ui-textarea--resize-vertical');
  });

  it('supports auto-resize', async () => {
    renderInput(TextArea, { autoResize: true });
    const textarea = screen.getByRole('textbox');

    // Auto-resize functionality would need to be tested with actual DOM manipulation
    expect(textarea).toHaveClass('ui-textarea--auto-resize');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(
      <ThemeProvider>
        <TextArea ref={ref} />
      </ThemeProvider>
    );

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
