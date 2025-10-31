/**
 * Tests for DiffEngine
 */

import { DiffEngine } from '../DiffEngine';

describe('DiffEngine', () => {
  let diffEngine;

  beforeEach(() => {
    diffEngine = new DiffEngine();
  });

  describe('trackChanges', () => {
    it('should detect no changes when outputs are identical', () => {
      const previous = ['Hello world', 'Test output', 'Final text'];
      const current = ['Hello world', 'Test output', 'Final text'];

      const changeSet = diffEngine.trackChanges(previous, current);

      expect(changeSet.changedIndices).toHaveLength(0);
      expect(changeSet.diffs).toHaveLength(0);
    });

    it('should detect changes at specific indices', () => {
      const previous = ['Hello world', 'Test output', 'Final text'];
      const current = ['Hello world', 'Test changed', 'Final text'];

      const changeSet = diffEngine.trackChanges(previous, current);

      expect(changeSet.changedIndices).toEqual([1]);
      expect(changeSet.diffs).toHaveLength(1);
      expect(changeSet.diffs[0].index).toBe(1);
    });

    it('should handle arrays of different lengths', () => {
      const previous = ['Hello', 'World'];
      const current = ['Hello', 'World', 'New item'];

      const changeSet = diffEngine.trackChanges(previous, current);

      expect(changeSet.changedIndices).toEqual([2]);
      expect(changeSet.diffs).toHaveLength(1);
      expect(changeSet.diffs[0].diff.hasChanges).toBe(true);
      expect(changeSet.diffs[0].diff.addedCount).toBeGreaterThan(0);
    });

    it('should track multiple changes', () => {
      const previous = ['A', 'B', 'C', 'D'];
      const current = ['X', 'B', 'Y', 'D'];

      const changeSet = diffEngine.trackChanges(previous, current);

      expect(changeSet.changedIndices).toEqual([0, 2]);
      expect(changeSet.diffs).toHaveLength(2);
    });
  });

  describe('computeDiff', () => {
    it('should handle empty strings', () => {
      const changeSet = diffEngine.trackChanges([''], ['']);
      expect(changeSet.changedIndices).toHaveLength(0);
    });

    it('should detect additions', () => {
      const previous = ['Hello'];
      const current = ['Hello world'];

      const changeSet = diffEngine.trackChanges(previous, current);
      const diff = changeSet.diffs[0].diff;

      expect(diff.hasChanges).toBe(true);
      expect(diff.addedCount).toBeGreaterThan(0);
      expect(diff.removedCount).toBe(0);
    });

    it('should detect deletions', () => {
      const previous = ['Hello world'];
      const current = ['Hello'];

      const changeSet = diffEngine.trackChanges(previous, current);
      const diff = changeSet.diffs[0].diff;

      expect(diff.hasChanges).toBe(true);
      expect(diff.removedCount).toBeGreaterThan(0);
      expect(diff.addedCount).toBe(0);
    });

    it('should detect replacements', () => {
      const previous = ['The quick brown fox'];
      const current = ['The slow brown dog'];

      const changeSet = diffEngine.trackChanges(previous, current);
      const diff = changeSet.diffs[0].diff;

      expect(diff.hasChanges).toBe(true);
      expect(diff.addedCount).toBeGreaterThan(0);
      expect(diff.removedCount).toBeGreaterThan(0);
    });

    it('should preserve whitespace in diffs', () => {
      const previous = ['Hello  world'];
      const current = ['Hello world'];

      const changeSet = diffEngine.trackChanges(previous, current);
      const diff = changeSet.diffs[0].diff;

      expect(diff.hasChanges).toBe(true);
      // Should detect the whitespace change
      expect(diff.segments.some(s => s.type === 'removed')).toBe(true);
    });
  });

  describe('summarizeChanges', () => {
    it('should return "No changes" for empty changeset', () => {
      const changeSet = {
        changedIndices: [],
        diffs: []
      };

      const summary = diffEngine.summarizeChanges(changeSet);
      expect(summary).toBe('No changes');
    });

    it('should summarize single variation change', () => {
      const changeSet = diffEngine.trackChanges(['Hello'], ['Hi']);
      const summary = diffEngine.summarizeChanges(changeSet);

      expect(summary).toMatch(/1 variation changed/);
      expect(summary).toMatch(/\+\d+ chars/);
      expect(summary).toMatch(/-\d+ chars/);
    });

    it('should summarize multiple variations', () => {
      const changeSet = diffEngine.trackChanges(
        ['A', 'B', 'C'],
        ['X', 'B', 'Y']
      );
      const summary = diffEngine.summarizeChanges(changeSet);

      expect(summary).toMatch(/2 variations changed/);
    });

    it('should only show additions when no deletions', () => {
      const changeSet = diffEngine.trackChanges([''], ['Hello']);
      const summary = diffEngine.summarizeChanges(changeSet);

      expect(summary).toMatch(/\+\d+ chars/);
      expect(summary).not.toMatch(/-\d+ chars/);
    });
  });

  describe('diff segments', () => {
    it('should create proper segments for word changes', () => {
      const changeSet = diffEngine.trackChanges(
        ['The cat sat'],
        ['The dog sat']
      );

      const segments = changeSet.diffs[0].diff.segments;

      // Should have unchanged "The ", removed "cat", added "dog", unchanged " sat"
      expect(
        segments.some(s => s.type === 'unchanged' && s.text.includes('The'))
      ).toBe(true);
      expect(
        segments.some(s => s.type === 'removed' && s.text.includes('cat'))
      ).toBe(true);
      expect(
        segments.some(s => s.type === 'added' && s.text.includes('dog'))
      ).toBe(true);
      expect(
        segments.some(s => s.type === 'unchanged' && s.text.includes('sat'))
      ).toBe(true);
    });

    it('should merge adjacent segments of same type', () => {
      const changeSet = diffEngine.trackChanges(
        ['Hello world'],
        ['Goodbye universe']
      );

      const segments = changeSet.diffs[0].diff.segments;

      // Adjacent removed or added segments should be merged
      const removedSegments = segments.filter(s => s.type === 'removed');
      const addedSegments = segments.filter(s => s.type === 'added');

      // Should have minimal segments after merging
      expect(removedSegments.length).toBeLessThanOrEqual(1);
      expect(addedSegments.length).toBeLessThanOrEqual(1);
    });
  });
});
