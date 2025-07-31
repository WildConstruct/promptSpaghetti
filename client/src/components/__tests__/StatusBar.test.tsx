import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusBar from '../StatusBar';
describe('StatusBar Component', () => {
  /**
   * Tests if StatusBar shows 'No errors' message when errorCount is 0
   */
  test('shows no errors message when errorCount is 0', () => {
    render(<StatusBar errorCount={0} />);
    expect(screen.getByText('✅ No errors')).toBeInTheDocument();
  });
  /**
   * Tests if StatusBar shows correct error count message when errorCount > 0
   */
  test('shows correct error count when errors exist', () => {
    const errorCount = 3;
    render(<StatusBar errorCount={errorCount} />);
    expect(screen.getByText(`⚠️ Validation Errors: ${errorCount}`)).toBeInTheDocument();}
  });
  /**
   * Tests if StatusBar shows correct styling (background, border) 
   */
  test('has correct styling', () => {
    const { container } = render(<StatusBar errorCount={0} />);
    const statusBarDiv = container.firstChild as HTMLElement;
    expect(statusBarDiv).toHaveStyle({
  background: '#2a2a2a',
  borderTop: '1px solid #444',
  height: '32px'
});
  });
  /**
   * Test for snapshot comparison to detect unexpected UI changes
   */
  test('matches snapshot', () => {
    const { container } = render(<StatusBar errorCount={2} />);
    expect(container).toMatchSnapshot();
  });
});