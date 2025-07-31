const { describe, it, expect } = require('@jest/globals');
const { render, screen } = require('@testing-library/react');
const React = require('react');

describe('Jest DOM Matcher Test', () => {
  it('should work with jest-dom matchers', () => {
    const TestComponent = () => React.createElement('div', { 'data-testid': 'test' }, 'Hello World');
    render(React.createElement(TestComponent));

    const element = screen.getByTestId('test');

    // Test if jest-dom matchers are available
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });

  it('should work with standard Jest matchers as fallback', () => {
    const TestComponent = () => React.createElement('div', { 'data-testid': 'visible' }, 'Visible Text');
    render(React.createElement(TestComponent));

    const element = screen.getByTestId('visible');

    // Standard Jest matchers as fallback
    expect(element).toBeTruthy();
    expect(element.textContent).toBe('Visible Text');
    expect(element.tagName.toLowerCase()).toBe('div');
  });
});
