/**
 * Pure status formatting for G3 fragment-load feedback.
 * Mirrors GraphModals toastFromFragmentStatus rules.
 */

type Status = {
  attempted: number;
  expandedCount: number;
  failedPaths: string[];
};

function toastKind(
  status: Status
): 'success' | 'warning' | 'error' | 'info' {
  if (status.attempted === 0) return 'success';
  if (status.expandedCount > 0 && status.failedPaths.length === 0) {
    return 'success';
  }
  if (status.expandedCount > 0 && status.failedPaths.length > 0) {
    return 'warning';
  }
  return 'error';
}

describe('wizard fragment load status (G3)', () => {
  it('is success when no fragments were selected', () => {
    expect(
      toastKind({ attempted: 0, expandedCount: 0, failedPaths: [] })
    ).toBe('success');
  });

  it('is success when all selected fragments expand', () => {
    expect(
      toastKind({
        attempted: 2,
        expandedCount: 2,
        failedPaths: []
      })
    ).toBe('success');
  });

  it('is warning on partial expand', () => {
    expect(
      toastKind({
        attempted: 2,
        expandedCount: 1,
        failedPaths: ['/assets/library/missing.psg']
      })
    ).toBe('warning');
  });

  it('is error when all selected fragments fail', () => {
    expect(
      toastKind({
        attempted: 1,
        expandedCount: 0,
        failedPaths: ['/assets/library/missing.psg']
      })
    ).toBe('error');
  });
});
