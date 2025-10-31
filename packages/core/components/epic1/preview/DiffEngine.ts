/**
 * Diff Engine for Epic 1 Preview System
 * Tracks changes between preview outputs and provides visualization data
 */

export interface DiffSegment {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface DiffResult {
  segments: DiffSegment[];
  hasChanges: boolean;
  addedCount: number;
  removedCount: number;
}

export interface ChangeSet {
  changedIndices: number[];
  diffs: Array<{
    index: number;
    diff: DiffResult;
  }>;
}

export class DiffEngine {
  /**
   * Track changes between previous and new outputs
   */
  trackChanges(previousOutputs: string[], newOutputs: string[]): ChangeSet {
    const changedIndices: number[] = [];
    const diffs: Array<{ index: number; diff: DiffResult }> = [];

    // Compare each output
    const maxLength = Math.max(previousOutputs.length, newOutputs.length);

    for (let i = 0; i < maxLength; i++) {
      const prev = previousOutputs[i] || '';
      const next = newOutputs[i] || '';

      if (prev !== next) {
        changedIndices.push(i);
        const diff = this.computeDiff(prev, next);
        diffs.push({ index: i, diff });
      }
    }

    return { changedIndices, diffs };
  }

  /**
   * Compute diff between two strings using a simple LCS-based algorithm
   * For production, consider using Myers' algorithm or similar
   */
  private computeDiff(oldText: string, newText: string): DiffResult {
    const segments: DiffSegment[] = [];
    let addedCount = 0;
    let removedCount = 0;

    // Handle edge cases
    if (!oldText && !newText) {
      return {
        segments: [],
        hasChanges: false,
        addedCount: 0,
        removedCount: 0
      };
    }

    if (!oldText) {
      // Everything is added
      segments.push({
        type: 'added',
        text: newText,
        startIndex: 0,
        endIndex: newText.length
      });
      return {
        segments,
        hasChanges: true,
        addedCount: newText.length,
        removedCount: 0
      };
    }

    if (!newText) {
      // Everything is removed
      segments.push({
        type: 'removed',
        text: oldText,
        startIndex: 0,
        endIndex: oldText.length
      });
      return {
        segments,
        hasChanges: true,
        addedCount: 0,
        removedCount: oldText.length
      };
    }

    // Simple word-based diff for MVP
    const oldWords = this.tokenize(oldText);
    const newWords = this.tokenize(newText);
    const lcs = this.findLCS(oldWords, newWords);

    let oldIndex = 0;
    let newIndex = 0;
    let currentPosition = 0;

    for (const { oldIdx, newIdx, word } of lcs) {
      // Add removed words before this match
      while (oldIndex < oldIdx) {
        const removedWord = oldWords[oldIndex];
        segments.push({
          type: 'removed',
          text: removedWord,
          startIndex: currentPosition,
          endIndex: currentPosition + removedWord.length
        });
        removedCount += removedWord.length;
        currentPosition += removedWord.length;
        oldIndex++;
      }

      // Add inserted words before this match
      while (newIndex < newIdx) {
        const addedWord = newWords[newIndex];
        segments.push({
          type: 'added',
          text: addedWord,
          startIndex: currentPosition,
          endIndex: currentPosition + addedWord.length
        });
        addedCount += addedWord.length;
        currentPosition += addedWord.length;
        newIndex++;
      }

      // Add the matching word
      segments.push({
        type: 'unchanged',
        text: word,
        startIndex: currentPosition,
        endIndex: currentPosition + word.length
      });
      currentPosition += word.length;
      oldIndex++;
      newIndex++;
    }

    // Handle remaining words
    while (oldIndex < oldWords.length) {
      const removedWord = oldWords[oldIndex];
      segments.push({
        type: 'removed',
        text: removedWord,
        startIndex: currentPosition,
        endIndex: currentPosition + removedWord.length
      });
      removedCount += removedWord.length;
      currentPosition += removedWord.length;
      oldIndex++;
    }

    while (newIndex < newWords.length) {
      const addedWord = newWords[newIndex];
      segments.push({
        type: 'added',
        text: addedWord,
        startIndex: currentPosition,
        endIndex: currentPosition + addedWord.length
      });
      addedCount += addedWord.length;
      currentPosition += addedWord.length;
      newIndex++;
    }

    return {
      segments: this.mergeSegments(segments),
      hasChanges: addedCount > 0 || removedCount > 0,
      addedCount,
      removedCount
    };
  }

  /**
   * Tokenize text into words while preserving whitespace
   */
  private tokenize(text: string): string[] {
    // Split on word boundaries but keep the delimiters
    const tokens: string[] = [];
    let current = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isWordChar = /\w/.test(char);
      const wasWordChar =
        current.length > 0 && /\w/.test(current[current.length - 1]);

      if (current.length > 0 && isWordChar !== wasWordChar) {
        tokens.push(current);
        current = char;
      } else {
        current += char;
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Find Longest Common Subsequence using dynamic programming
   */
  private findLCS(
    oldWords: string[],
    newWords: string[]
  ): Array<{ oldIdx: number; newIdx: number; word: string }> {
    const m = oldWords.length;
    const n = newWords.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Build the LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldWords[i - 1] === newWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to find the actual LCS
    const lcs: Array<{ oldIdx: number; newIdx: number; word: string }> = [];
    let i = m;
    let j = n;

    while (i > 0 && j > 0) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        lcs.unshift({ oldIdx: i - 1, newIdx: j - 1, word: oldWords[i - 1] });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  /**
   * Merge adjacent segments of the same type
   */
  private mergeSegments(segments: DiffSegment[]): DiffSegment[] {
    if (segments.length === 0) {return segments;}

    const merged: DiffSegment[] = [];
    let current = segments[0];

    for (let i = 1; i < segments.length; i++) {
      const next = segments[i];
      if (next.type === current.type) {
        // Merge adjacent segments of same type
        current = {
          type: current.type,
          text: current.text + next.text,
          startIndex: current.startIndex,
          endIndex: next.endIndex
        };
      } else {
        merged.push(current);
        current = next;
      }
    }

    merged.push(current);
    return merged;
  }

  /**
   * Generate a summary of changes
   */
  summarizeChanges(changeSet: ChangeSet): string {
    const totalChanged = changeSet.changedIndices.length;
    if (totalChanged === 0) {return 'No changes';}

    const additions = changeSet.diffs.reduce(
      (sum, { diff }) => sum + diff.addedCount,
      0
    );
    const deletions = changeSet.diffs.reduce(
      (sum, { diff }) => sum + diff.removedCount,
      0
    );

    const parts: string[] = [];
    if (totalChanged === 1) {
      parts.push('1 variation changed');
    } else {
      parts.push(`${totalChanged} variations changed`);
    }

    if (additions > 0) {
      parts.push(`+${additions} chars`);
    }
    if (deletions > 0) {
      parts.push(`-${deletions} chars`);
    }

    return parts.join(', ');
  }
}
