/**
 * Password Strength Indicator Tests
 * Task: T-1752989143997-191 - Create visual password strength indicator
 * Comprehensive test suite for PasswordStrengthIndicator component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  PasswordStrengthIndicator, 
  usePasswordStrength 
} from '../components/PasswordStrengthIndicator';
import { 
  PasswordComplexityValidator, 
  PasswordValidationContext 
} from '../auth/PasswordComplexityValidator';

// Mock the PasswordComplexityValidator for controlled testing
jest.mock('../auth/PasswordComplexityValidator');

describe('PasswordStrengthIndicator', () => {
  let mockValidator: jest.Mocked<PasswordComplexityValidator>;

  beforeEach(() => {
    mockValidator = new PasswordComplexityValidator() as jest.Mocked<PasswordComplexityValidator>;
    
    // Default mock implementation
    mockValidator.validatePassword.mockResolvedValue({
      valid: true,
      score: 75,
      strength: 'good',
      ruleResults: [
        {
          passed: true,
          score: 8,
          message: 'Length requirement met (12 characters)'
        },
        {
          passed: true,
          score: 7,
          message: 'Uppercase requirement met (1 found)'
        },
        {
          passed: false,
          score: 0,
          message: 'Not enough special characters (0/1)',
          suggestion: 'Add 1 special character(s)'
        }
      ],
      errors: [],
      warnings: [],
      suggestions: ['Add 1 special character(s)'],
      passedRules: 2,
      totalRules: 3,
      entropy: 45.2,
      estimatedCrackTime: {
        offline: '2 hours',
        online: '3 days',
        unit: 'average time'
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('should not render when password is empty', () => {
      const { container } = render(
        <PasswordStrengthIndicator password="" />
      );
      
      expect(container.firstChild).toBeNull();
    });

    test('should render strength meter for valid password', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Password Strength')).toBeInTheDocument();
        expect(screen.getByText('Good (75/100)')).toBeInTheDocument();
      });
    });

    test('should show loading state during validation', () => {
      // Delay the mock validation
      mockValidator.validatePassword.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          valid: true,
          score: 75,
          strength: 'good',
          ruleResults: [],
          errors: [],
          warnings: [],
          suggestions: [],
          passedRules: 0,
          totalRules: 0
        }), 100))
      );

      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          debounceMs={50}
        />
      );

      expect(screen.getByText('Analyzing password...')).toBeInTheDocument();
    });
  });

  describe('Strength Visualization', () => {
    const strengthTestCases = [
      { score: 10, strength: 'very-weak', color: '#dc2626' },
      { score: 30, strength: 'weak', color: '#ea580c' },
      { score: 50, strength: 'fair', color: '#d97706' },
      { score: 70, strength: 'good', color: '#65a30d' },
      { score: 85, strength: 'strong', color: '#16a34a' },
      { score: 95, strength: 'very-strong', color: '#059669' }
    ];

    strengthTestCases.forEach(({ score, strength, color }) => {
      test(`should display correct color and label for ${strength} password`, async () => {
        mockValidator.validatePassword.mockResolvedValue({
          valid: score >= 70,
          score,
          strength: strength as any,
          ruleResults: [],
          errors: [],
          warnings: [],
          suggestions: [],
          passedRules: 0,
          totalRules: 0
        });

        render(
          <PasswordStrengthIndicator 
            password="test" 
            validator={mockValidator}
          />
        );

        await waitFor(() => {
          const strengthLabel = strength.charAt(0).toUpperCase() + strength.slice(1).replace('-', ' ');
          expect(screen.getByText(`${strengthLabel} (${score}/100)`)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Compact Mode', () => {
    test('should render in compact mode', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          compact={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Good')).toBeInTheDocument();
        // Should not show detailed requirements in compact mode
        expect(screen.queryByText('Requirements')).not.toBeInTheDocument();
      });
    });

    test('should hide details in compact mode', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          compact={true}
          showDetails={true}
          showSuggestions={true}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Requirements')).not.toBeInTheDocument();
        expect(screen.queryByText('Suggestions')).not.toBeInTheDocument();
      });
    });
  });

  describe('Detailed Display', () => {
    test('should show rule results when showDetails is true', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          showDetails={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Requirements')).toBeInTheDocument();
        expect(screen.getByText('2/3 met')).toBeInTheDocument();
        expect(screen.getByText('Length requirement met (12 characters)')).toBeInTheDocument();
        expect(screen.getByText('Uppercase requirement met (1 found)')).toBeInTheDocument();
      });
    });

    test('should show suggestions when showSuggestions is true', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          showSuggestions={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Suggestions')).toBeInTheDocument();
        expect(screen.getByText('Add 1 special character(s)')).toBeInTheDocument();
      });
    });

    test('should show entropy when showEntropy is true', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          showEntropy={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Entropy')).toBeInTheDocument();
        expect(screen.getByText('45.2 bits')).toBeInTheDocument();
      });
    });

    test('should show crack time when showCrackTime is true', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          showCrackTime={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Crack Time')).toBeInTheDocument();
        expect(screen.getByText('Online: 3 days')).toBeInTheDocument();
        expect(screen.getByText('Offline: 2 hours')).toBeInTheDocument();
      });
    });
  });

  describe('Error and Warning Display', () => {
    test('should display errors', async () => {
      mockValidator.validatePassword.mockResolvedValue({
        valid: false,
        score: 25,
        strength: 'weak',
        ruleResults: [],
        errors: ['Password too short', 'Missing special characters'],
        warnings: [],
        suggestions: [],
        passedRules: 0,
        totalRules: 2
      });

      render(
        <PasswordStrengthIndicator 
          password="weak" 
          validator={mockValidator}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Errors')).toBeInTheDocument();
        expect(screen.getByText('Password too short')).toBeInTheDocument();
        expect(screen.getByText('Missing special characters')).toBeInTheDocument();
      });
    });

    test('should display warnings', async () => {
      mockValidator.validatePassword.mockResolvedValue({
        valid: true,
        score: 75,
        strength: 'good',
        ruleResults: [],
        errors: [],
        warnings: ['Contains common sequence', 'Low entropy'],
        suggestions: [],
        passedRules: 2,
        totalRules: 2
      });

      render(
        <PasswordStrengthIndicator 
          password="Password123" 
          validator={mockValidator}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Warnings')).toBeInTheDocument();
        expect(screen.getByText('Contains common sequence')).toBeInTheDocument();
        expect(screen.getByText('Low entropy')).toBeInTheDocument();
      });
    });

    test('should not show warnings in compact mode', async () => {
      mockValidator.validatePassword.mockResolvedValue({
        valid: true,
        score: 75,
        strength: 'good',
        ruleResults: [],
        errors: [],
        warnings: ['Contains common sequence'],
        suggestions: [],
        passedRules: 2,
        totalRules: 2
      });

      render(
        <PasswordStrengthIndicator 
          password="Password123" 
          validator={mockValidator}
          compact={true}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Warnings')).not.toBeInTheDocument();
      });
    });
  });

  describe('Context-Aware Validation', () => {
    test('should pass context to validator', async () => {
      const context: PasswordValidationContext = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };

      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          context={context}
          validator={mockValidator}
        />
      );

      await waitFor(() => {
        expect(mockValidator.validatePassword).toHaveBeenCalledWith(
          'TestPassword123',
          context
        );
      });
    });
  });

  describe('Validation Change Callback', () => {
    test('should call onValidationChange when result updates', async () => {
      const onValidationChange = jest.fn();

      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          onValidationChange={onValidationChange}
        />
      );

      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalledWith(
          expect.objectContaining({
            valid: true,
            score: 75,
            strength: 'good'
          })
        );
      });
    });
  });

  describe('Theme Support', () => {
    test('should support light theme', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          theme="light"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Password Strength')).toBeInTheDocument();
      });
    });

    test('should support dark theme', async () => {
      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          theme="dark"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Password Strength')).toBeInTheDocument();
      });
    });

    test('should auto-detect theme', async () => {
      // Mock matchMedia for auto theme detection
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('dark'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn()
        }))
      });

      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          theme="auto"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Password Strength')).toBeInTheDocument();
      });
    });
  });

  describe('Debouncing', () => {
    test('should debounce validation calls', async () => {
      const { rerender } = render(
        <PasswordStrengthIndicator 
          password="a" 
          validator={mockValidator}
          debounceMs={100}
        />
      );

      // Rapidly change password
      rerender(
        <PasswordStrengthIndicator 
          password="ab" 
          validator={mockValidator}
          debounceMs={100}
        />
      );

      rerender(
        <PasswordStrengthIndicator 
          password="abc" 
          validator={mockValidator}
          debounceMs={100}
        />
      );

      // Should only call validator once after debounce period
      await waitFor(() => {
        expect(mockValidator.validatePassword).toHaveBeenCalledTimes(1);
        expect(mockValidator.validatePassword).toHaveBeenCalledWith('abc', undefined);
      }, { timeout: 200 });
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors gracefully', async () => {
      mockValidator.validatePassword.mockRejectedValue(new Error('Validation failed'));

      // Spy on console.error to suppress error logs in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Errors')).toBeInTheDocument();
        expect(screen.getByText('Validation failed')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Suggestion Limiting', () => {
    test('should limit suggestions display to 3 items', async () => {
      mockValidator.validatePassword.mockResolvedValue({
        valid: false,
        score: 25,
        strength: 'weak',
        ruleResults: [],
        errors: [],
        warnings: [],
        suggestions: [
          'Add uppercase letters',
          'Add lowercase letters', 
          'Add numbers',
          'Add special characters',
          'Increase length',
          'Remove common patterns'
        ],
        passedRules: 0,
        totalRules: 6
      });

      render(
        <PasswordStrengthIndicator 
          password="weak" 
          validator={mockValidator}
          showSuggestions={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Add uppercase letters')).toBeInTheDocument();
        expect(screen.getByText('Add lowercase letters')).toBeInTheDocument();
        expect(screen.getByText('Add numbers')).toBeInTheDocument();
        expect(screen.getByText('+3 more suggestions')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Styling', () => {
    test('should apply custom className', () => {
      const { container } = render(
        <PasswordStrengthIndicator 
          password="TestPassword123" 
          validator={mockValidator}
          className="custom-class"
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});

describe('usePasswordStrength Hook', () => {
  let mockValidator: jest.Mocked<PasswordComplexityValidator>;

  beforeEach(() => {
    mockValidator = new PasswordComplexityValidator() as jest.Mocked<PasswordComplexityValidator>;
    
    mockValidator.validatePassword.mockResolvedValue({
      valid: true,
      score: 85,
      strength: 'strong',
      ruleResults: [],
      errors: [],
      warnings: [],
      suggestions: ['Consider adding more special characters'],
      passedRules: 5,
      totalRules: 6
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return password strength data', async () => {
    const TestComponent = () => {
      const { result, isValidating, isValid, score, strength, suggestions, errors } = 
        usePasswordStrength('TestPassword123!', undefined, mockValidator);

      return (
        <div>
          <div data-testid="is-validating">{isValidating.toString()}</div>
          <div data-testid="is-valid">{isValid.toString()}</div>
          <div data-testid="score">{score}</div>
          <div data-testid="strength">{strength}</div>
          <div data-testid="suggestions">{suggestions.join(', ')}</div>
          <div data-testid="errors">{errors.join(', ')}</div>
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('is-valid')).toHaveTextContent('true');
      expect(screen.getByTestId('score')).toHaveTextContent('85');
      expect(screen.getByTestId('strength')).toHaveTextContent('strong');
      expect(screen.getByTestId('suggestions')).toHaveTextContent('Consider adding more special characters');
    });
  });

  test('should handle empty password', () => {
    const TestComponent = () => {
      const { isValid, score, strength } = usePasswordStrength('', undefined, mockValidator);

      return (
        <div>
          <div data-testid="is-valid">{isValid.toString()}</div>
          <div data-testid="score">{score}</div>
          <div data-testid="strength">{strength}</div>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('is-valid')).toHaveTextContent('false');
    expect(screen.getByTestId('score')).toHaveTextContent('0');
    expect(screen.getByTestId('strength')).toHaveTextContent('very-weak');
  });

  test('should use default validator when none provided', async () => {
    const TestComponent = () => {
      const { score } = usePasswordStrength('TestPassword123!');
      return <div data-testid="score">{score}</div>;
    };

    render(<TestComponent />);

    // Should not throw and should render some score
    await waitFor(() => {
      const scoreElement = screen.getByTestId('score');
      expect(scoreElement).toBeInTheDocument();
    });
  });
});

describe('Integration Tests', () => {
  test('should work with real validator', async () => {
    const realValidator = new PasswordComplexityValidator();
    
    render(
      <PasswordStrengthIndicator 
        password="TestPassword123!" 
        validator={realValidator}
        showDetails={true}
        showSuggestions={true}
        showEntropy={true}
        showCrackTime={true}
      />
    );

    // Should render without errors
    await waitFor(() => {
      expect(screen.getByText('Password Strength')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('should handle rapid password changes', async () => {
    const realValidator = new PasswordComplexityValidator();
    const onValidationChange = jest.fn();
    
    const { rerender } = render(
      <PasswordStrengthIndicator 
        password="a" 
        validator={realValidator}
        onValidationChange={onValidationChange}
        debounceMs={50}
      />
    );

    // Simulate rapid typing
    const passwords = ['a', 'ab', 'abc', 'Test', 'TestP', 'TestPass', 'TestPass1', 'TestPass1!'];
    
    for (const password of passwords) {
      rerender(
        <PasswordStrengthIndicator 
          password={password} 
          validator={realValidator}
          onValidationChange={onValidationChange}
          debounceMs={50}
        />
      );
    }

    // Should eventually call validation change
    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});