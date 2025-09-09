/**
 * Accessibility testing setup using jest-axe.
 * - Extends Jest with toHaveNoViolations matcher
 * - Exports a preconfigured axe instance for use in tests
 */
import { configureAxe, toHaveNoViolations } from 'jest-axe';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Configure axe. Some rules are noisy in JSDOM; disable as needed.
export const axe = configureAxe({
  rules: {
    // Color contrast requires real rendering context; often noisy under JSDOM
    'color-contrast': { enabled: false }
  }
});

// Optional: make available globally for convenience in some tests
// (Tests can still import { axe } from '@tests/utils/axeSetup')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).axe = axe;

export default axe;
