/**
 * Tests for breakpoint system
 */

import {
  getCurrentBreakpoint,
  matchesBreakpoint,
  createMediaQuery,
  resolveResponsiveValue,
  createResponsiveStyles,
  defaultBreakpoints,
} from '../../src/responsive/breakpoints';

describe('Breakpoint System', () => {
  describe('getCurrentBreakpoint', () => {
    it('should return correct breakpoint for viewport width', () => {
      expect(getCurrentBreakpoint(320)).toBe('xs');
      expect(getCurrentBreakpoint(576)).toBe('sm');
      expect(getCurrentBreakpoint(768)).toBe('md');
      expect(getCurrentBreakpoint(1024)).toBe('lg');
      expect(getCurrentBreakpoint(1280)).toBe('xl');
      expect(getCurrentBreakpoint(1536)).toBe('xxl');
    });

    it('should handle edge cases', () => {
      expect(getCurrentBreakpoint(0)).toBe('xs');
      expect(getCurrentBreakpoint(575)).toBe('xs');
      expect(getCurrentBreakpoint(577)).toBe('sm');
      expect(getCurrentBreakpoint(9999)).toBe('xxl');
    });
  });

  describe('matchesBreakpoint', () => {
    it('should match breakpoints correctly', () => {
      // Width 800px = md breakpoint
      expect(matchesBreakpoint(800, 'xs')).toBe(true);
      expect(matchesBreakpoint(800, 'sm')).toBe(true);
      expect(matchesBreakpoint(800, 'md')).toBe(true);
      expect(matchesBreakpoint(800, 'lg')).toBe(false);
      expect(matchesBreakpoint(800, 'xl')).toBe(false);
    });
  });

  describe('createMediaQuery', () => {
    it('should create "up" media queries', () => {
      expect(createMediaQuery('sm', 'up')).toBe('(min-width: 576px)');
      expect(createMediaQuery('md', 'up')).toBe('(min-width: 768px)');
      expect(createMediaQuery('lg', 'up')).toBe('(min-width: 1024px)');
    });

    it('should create "down" media queries', () => {
      expect(createMediaQuery('xs', 'down')).toBe('(max-width: 575px)');
      expect(createMediaQuery('sm', 'down')).toBe('(max-width: 767px)');
      expect(createMediaQuery('xxl', 'down')).toBe('(min-width: 0px)');
    });

    it('should create "only" media queries', () => {
      expect(createMediaQuery('sm', 'only')).toBe('(min-width: 576px) and (max-width: 767px)');
      expect(createMediaQuery('md', 'only')).toBe('(min-width: 768px) and (max-width: 1023px)');
      expect(createMediaQuery('xxl', 'only')).toBe('(min-width: 1536px)');
    });
  });

  describe('resolveResponsiveValue', () => {
    it('should resolve values for current breakpoint', () => {
      const values = {
        xs: 'xs-value',
        sm: 'sm-value',
        md: 'md-value',
        lg: 'lg-value',
      };

      expect(resolveResponsiveValue(values, 'xs', 'default')).toBe('xs-value');
      expect(resolveResponsiveValue(values, 'sm', 'default')).toBe('sm-value');
      expect(resolveResponsiveValue(values, 'md', 'default')).toBe('md-value');
      expect(resolveResponsiveValue(values, 'lg', 'default')).toBe('lg-value');
    });

    it('should fallback to smaller breakpoints', () => {
      const values = {
        xs: 'xs-value',
        lg: 'lg-value',
      };

      expect(resolveResponsiveValue(values, 'sm', 'default')).toBe('xs-value');
      expect(resolveResponsiveValue(values, 'md', 'default')).toBe('xs-value');
      expect(resolveResponsiveValue(values, 'xl', 'default')).toBe('lg-value');
    });

    it('should use default value when no match', () => {
      const values = { lg: 'lg-value' };
      expect(resolveResponsiveValue(values, 'sm', 'default')).toBe('default');
    });
  });

  describe('createResponsiveStyles', () => {
    it('should create responsive CSS object', () => {
      const styles = createResponsiveStyles('fontSize', {
        xs: '12px',
        md: '16px',
        lg: '20px',
      });

      expect(styles.fontSize).toBe('12px');
      expect(styles['@media (min-width: 768px)']).toEqual({ fontSize: '16px' });
      expect(styles['@media (min-width: 1024px)']).toEqual({ fontSize: '20px' });
    });

    it('should apply transform function', () => {
      const styles = createResponsiveStyles('padding', { xs: 1, md: 2, lg: 3 }, value => `${value * 8}px`);

      expect(styles.padding).toBe('8px');
      expect(styles['@media (min-width: 768px)']).toEqual({ padding: '16px' });
      expect(styles['@media (min-width: 1024px)']).toEqual({ padding: '24px' });
    });
  });
});
