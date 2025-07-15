import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusBar from '../components/StatusBar';

describe('StatusBar', () => {
  it('should display "No errors" when errorCount is 0', () => {
    render(<StatusBar errorCount={0} />);
    expect(screen.getByText('No errors')).toBeInTheDocument();
  });

  it('should display the number of validation errors when errorCount > 0', () => {
    render(<StatusBar errorCount={3} />);
    expect(screen.getByText('Validation Errors: 3')).toBeInTheDocument();
  });
});
