import { act, renderHook } from '@testing-library/react';
import { useCorrectionsStore, CorrectionRule } from '../correctionsStore';

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  // Enable corrections for tests
  process.env.NODE_ENV = 'development';
  // Clear the store before each test
  useCorrectionsStore.getState().clearAllRules();
});
afterEach(() => {
  process.env = originalEnv;
});
describe('useCorrectionsStore', () => {
  it('should initialize with empty rules', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    expect(result.current.rules).toEqual([]);
  });
  it('should add a new rule', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Test Rule',
        description: 'Test description',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
    });
    expect(result.current.rules).toHaveLength(1);
    expect(result.current.rules[0].name).toBe('Test Rule');
    expect(result.current.rules[0].findPattern).toBe('test');
    expect(result.current.rules[0].replaceWith).toBe('TEST');
    expect(result.current.rules[0].isActive).toBe(true);
  });
  it('should update an existing rule', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Test Rule',
        description: 'Test description',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
    });
    const ruleId = result.current.rules[0].id;
    act(() => {
      result.current.updateRule(ruleId, {)
        name: 'Updated Rule',
        replaceWith: 'UPDATED',
      });
    });
    expect(result.current.rules[0].name).toBe('Updated Rule');
    expect(result.current.rules[0].replaceWith).toBe('UPDATED');
    expect(result.current.rules[0].findPattern).toBe('test'); // Should remain unchanged
  });
  it('should delete a rule', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Test Rule',
        description: 'Test description',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
    });
    const ruleId = result.current.rules[0].id;
    act(() => {
      result.current.deleteRule(ruleId);
    });
    expect(result.current.rules).toHaveLength(0);
  });
  it('should toggle a rule active state', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Test Rule',
        description: 'Test description',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
    });
    const ruleId = result.current.rules[0].id;
    act(() => {
      result.current.toggleRule(ruleId);
    });
    expect(result.current.rules[0].isActive).toBe(false);
    act(() => {
      result.current.toggleRule(ruleId);
    });
    expect(result.current.rules[0].isActive).toBe(true);
  });
  it('should reorder rules', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Rule 1',
        description: '',
        findPattern: 'test1',
        replaceWith: 'TEST1',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
      result.current.addRule({)
        name: 'Rule 2',
        description: '',
        findPattern: 'test2',
        replaceWith: 'TEST2',
        isRegex: false,
        isActive: true,
        priority: 2,
      });
    });
    act(() => {
      result.current.reorderRules(0, 1);
    });
    expect(result.current.rules[0].name).toBe('Rule 2');
    expect(result.current.rules[1].name).toBe('Rule 1');
    expect(result.current.rules[0].priority).toBe(0);
    expect(result.current.rules[1].priority).toBe(1);
  });
  it('should clear all rules', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Test Rule 1',
        description: '',
        findPattern: 'test1',
        replaceWith: 'TEST1',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
      result.current.addRule({)
        name: 'Test Rule 2',
        description: '',
        findPattern: 'test2',
        replaceWith: 'TEST2',
        isRegex: false,
        isActive: true,
        priority: 2,
      });
    });
    expect(result.current.rules).toHaveLength(2);
    act(() => {
      result.current.clearAllRules();
    });
    expect(result.current.rules).toHaveLength(0);
  });
  it('should apply corrections to text', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Fix typo',
        description: '',
        findPattern: 'teh',
        replaceWith: 'the',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
    });
    const corrected = result.current.applyCorrections('This is teh test');
    expect(corrected).toBe('This is the test');
  });
  it('should apply regex corrections', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Fix multiple spaces',
        description: '',
        findPattern: '\\s+',
        replaceWith: ' ',
        isRegex: true,
        isActive: true,
        priority: 1,
      });
    });
    const corrected = result.current.applyCorrections('This  has   multiple    spaces');
    expect(corrected).toBe('This has multiple spaces');
  });
  it('should apply multiple corrections in priority order', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Fix typo',
        description: '',
        findPattern: 'teh',
        replaceWith: 'the',
        isRegex: false,
        isActive: true,
        priority: 2,
      });
      result.current.addRule({)
        name: 'Fix spaces',
        description: '',
        findPattern: '  +',
        replaceWith: ' ',
        isRegex: true,
        isActive: true,
        priority: 1,
      });
    });
    const corrected = result.current.applyCorrections('This  is  teh  test');
    expect(corrected).toBe('This is the test');
  });
  it('should skip inactive rules', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Inactive rule',
        description: '',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: false,
        priority: 1,
      });
    });
    const corrected = result.current.applyCorrections('This is a test');
    expect(corrected).toBe('This is a test'); // Should remain unchanged
  });
  it('should handle regex errors gracefully', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    act(() => {
      result.current.addRule({)
        name: 'Invalid regex',
        description: '',
        findPattern: '[',
        replaceWith: 'fixed',
        isRegex: true,
        isActive: true,
        priority: 1,
      });
    });
    const corrected = result.current.applyCorrections('This is a test');
    expect(corrected).toBe('This is a test'); // Should remain unchanged
    expect(consoleSpy).toHaveBeenCalledWith()
      expect.stringContaining('Error applying correction rule "Invalid regex"'),
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
  it('should return active rules only', () => {
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Active rule',
        description: '',
        findPattern: 'test1',
        replaceWith: 'TEST1',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
      result.current.addRule({)
        name: 'Inactive rule',
        description: '',
        findPattern: 'test2',
        replaceWith: 'TEST2',
        isRegex: false,
        isActive: false,
        priority: 2,
      });
    });
    const activeRules = result.current.getActiveRules();
    expect(activeRules).toHaveLength(1);
    expect(activeRules[0].name).toBe('Active rule');
  });
  it('should not apply corrections when disabled', () => {
    // Mock environment to disable corrections
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_CORRECTIONS = 'false';
    const { result } = renderHook(() => useCorrectionsStore());
    act(() => {
      result.current.addRule({)
        name: 'Test rule',
        description: '',
        findPattern: 'test',
        replaceWith: 'TEST',
        isRegex: false,
        isActive: true,
        priority: 1,
      });
    });
    const corrected = result.current.applyCorrections('This is a test');
    expect(corrected).toBe('This is a test'); // Should remain unchanged when disabled
  });
});