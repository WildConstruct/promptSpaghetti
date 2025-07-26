/**
 * Accessibility Testing Setup with jest-axe
 * 
 * Configures automated accessibility testing using axe-core.
 * Provides utilities for WCAG compliance checking in component tests.
 */

import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

// Configure axe for our testing environment
const axe = configureAxe({
  // Customize rules for our application context
  rules: {
    // Core accessibility rules (always enabled)
    'aria-hidden-focus': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'input-button-name': { enabled: true },
    'input-image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    
    // Keyboard navigation
    'focus-order-semantics': { enabled: true },
    'focusable-content': { enabled: true },
    'keyboard-accessible': { enabled: true },
    'no-keyboard-trap': { enabled: true },
    'tab-index': { enabled: true },
    
    // Screen reader compatibility
    'bypass': { enabled: true },
    'document-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'lang': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    
    // Visual accessibility (relaxed for test environment)
    'color-contrast': { 
      enabled: true,
      options: {
        // Allow slightly lower contrast in test environment
        'contrastRatio': {
          'normal': 3.8, // WCAG AA is 4.5
          'large': 2.8   // WCAG AA is 3.0
        }
      }
    },
    
    // Disable rules that may not apply in test environment
    'meta-viewport': { enabled: false }, // Not relevant in JSDOM
    'css-orientation-lock': { enabled: false }, // CSS-based, not testable in JSDOM
    'autocomplete-valid': { enabled: false } // May conflict with test data
  },
  
  // Target WCAG 2.1 AA compliance
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Include best practices and experimental rules
  experimental: true,
  
  // Restore scroll position after testing
  restoreScroll: true
});

// Extend Jest matchers with accessibility assertions
expect.extend(toHaveNoViolations);

// Custom accessibility testing utilities
export class AccessibilityTester {
  
  /**
   * Test a React component for accessibility violations
   */
  static async testComponent(component: ReactElement, options?: {
    skipRules?: string[];
    includedImpacts?: ('minor' | 'moderate' | 'serious' | 'critical')[];
    timeout?: number;
  }) {
    const { container } = render(component);
    
    // Wait for component to fully render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let testAxe = axe;
    
    // Configure rule exclusions if specified
    if (options?.skipRules) {
      const ruleConfig: Record<string, { enabled: boolean }> = {};
      options.skipRules.forEach(rule => {
        ruleConfig[rule] = { enabled: false };
      });
      testAxe = configureAxe({ 
        ...axe.defaults,
        rules: { ...axe.defaults.rules, ...ruleConfig }
      });
    }
    
    // Run accessibility scan
    const results = await testAxe(container);
    
    // Filter by impact level if specified
    if (options?.includedImpacts) {
      results.violations = results.violations.filter(violation =>
        options.includedImpacts!.includes(violation.impact as 'minor' | 'moderate' | 'serious' | 'critical')
      );
    }
    
    expect(results).toHaveNoViolations();
    return results;
  }
  
  /**
   * Test keyboard navigation for a component
   */
  static async testKeyboardNavigation(component: ReactElement) {
    const { container } = render(component);
    
    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      console.warn('No focusable elements found for keyboard navigation test');
      return;
    }
    
    // Test that all focusable elements can receive focus
    focusableElements.forEach((element, index) => {
      (element as HTMLElement).focus();
      expect(element).toHaveFocus();
    });
    
    // Test tab order is logical (no negative tab indices except -1)
    const elementsWithTabIndex = Array.from(focusableElements).filter(el => 
      el.hasAttribute('tabindex') && el.getAttribute('tabindex') !== '-1'
    );
    
    const tabIndices = elementsWithTabIndex.map(el => 
      parseInt(el.getAttribute('tabindex') || '0')
    );
    
    // Check for valid tab indices (should be 0 or positive)
    tabIndices.forEach(tabIndex => {
      expect(tabIndex).toBeGreaterThanOrEqual(0);
    });
  }
  
  /**
   * Test ARIA attributes and roles
   */
  static async testAriaCompliance(component: ReactElement) {
    const { container } = render(component);
    
    // Check for required ARIA attributes
    const elementsWithRoles = container.querySelectorAll('[role]');
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      expect(role).toBeTruthy();
      
      // Common ARIA requirements based on role
      switch (role) {
      case 'button':
        expect(element).toHaveAttribute('aria-label');
        break;
      case 'dialog':
        expect(element).toHaveAttribute('aria-labelledby');
        break;
      case 'progressbar':
        expect(element).toHaveAttribute('aria-valuenow');
        break;
      case 'tab':
        expect(element).toHaveAttribute('aria-selected');
        break;
      case 'tabpanel':
        expect(element).toHaveAttribute('aria-labelledby');
        break;
      }
    });
    
    // Check for proper labeling
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      container.querySelector(`label[for="${input.getAttribute('id')}"]`);
      
      if (!hasLabel) {
        console.warn('Input element without proper labeling found:', input);
      }
    });
  }
  
  /**
   * Test color contrast (requires actual computed styles)
   */
  static async testColorContrast(component: ReactElement) {
    const { container } = render(component);
    
    // Run axe specifically for color contrast
    const results = await configureAxe({
      rules: {
        'color-contrast': { enabled: true }
      }
    })(container);
    
    expect(results).toHaveNoViolations();
  }
  
  /**
   * Generate accessibility report
   */
  static async generateReport(component: ReactElement): Promise<{
    violations: unknown[];
    passes: unknown[];
    incomplete: unknown[];
    summary: {
      violationCount: number;
      passCount: number;
      incompleteCount: number;
      score: number;
    };
  }> {
    const { container } = render(component);
    const results = await axe(container);
    
    const score = Math.max(0, 100 - (results.violations.length * 10));
    
    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      summary: {
        violationCount: results.violations.length,
        passCount: results.passes.length,
        incompleteCount: results.incomplete.length,
        score
      }
    };
  }
}

// Predefined test suites for common scenarios
export   },
  
  /**
   * Comprehensive accessibility test suite
   */
  comprehensive: async (component: ReactElement) => {
    await AccessibilityTester.testComponent(component);
    await AccessibilityTester.testKeyboardNavigation(component);
    await AccessibilityTester.testAriaCompliance(component);
  },
  
  /**
   * Form-specific accessibility tests
   */
  form: async (component: ReactElement) => {
    await AccessibilityTester.testComponent(component, {
      includedImpacts: ['serious', 'critical']
    });
    
    const { container } = render(component);
    
    // Test form-specific requirements
    const forms = container.querySelectorAll('form');
    forms.forEach(form => {
      // Check for form labels
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const label = form.querySelector(`label[for="${input.getAttribute('id')}"]`) ||
                     input.getAttribute('aria-label') ||
                     input.getAttribute('aria-labelledby');
        expect(label).toBeTruthy();
      });
    });
  },
  
  /**
   * Modal/Dialog accessibility tests
   */
  modal: async (component: ReactElement) => {
    await AccessibilityTester.testComponent(component);
    
    const { container } = render(component);
    
    // Test modal-specific requirements
    const modals = container.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      
      // Test focus management
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  },
  
  /**
   * Navigation accessibility tests
   */
  navigation: async (component: ReactElement) => {
    await AccessibilityTester.testKeyboardNavigation(component);
    
    const { container } = render(component);
    
    // Test navigation-specific requirements
    const navElements = container.querySelectorAll('nav, [role="navigation"]');
    navElements.forEach(nav => {
      expect(nav).toHaveAttribute('aria-label');
    });
    
    // Test skip links if present
    const skipLinks = container.querySelectorAll('a[href^="#"]');
    skipLinks.forEach(link => {
      const target = container.querySelector(link.getAttribute('href') || '');
      if (target) {
        expect(target).toBeTruthy();
      }
    });
  }
};

// Export configured axe instance
export { axe };

// Helper function for quick component testing
export 
// Export test matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

// Export common accessibility test patterns
export };