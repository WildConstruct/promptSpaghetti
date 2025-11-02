import { ParserSecurity } from '../../services/ParserSecurity';

describe('ParserSecurity', () => {
  let security: ParserSecurity;
  let originalNodeEnv: string | undefined;
  let originalMaskSetting: string | undefined;

  beforeEach(() => {
    security = new ParserSecurity();
    originalNodeEnv = process.env.NODE_ENV;
    originalMaskSetting = process.env.MASK_PII;
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    process.env.NODE_ENV = originalNodeEnv;
    if (typeof originalMaskSetting === 'undefined') {
      delete process.env.MASK_PII;
    } else {
      process.env.MASK_PII = originalMaskSetting;
    }
  });

  it('respects localStorage flag when masking PII is disabled', () => {
    process.env.NODE_ENV = 'production';
    localStorage.setItem('maskPII', 'false');

    const sanitized = security.sanitizePrompt('Contact me at qa@example.com');

    expect(sanitized).toContain('qa@example.com');
  });

  it('masks PII when configured to do so in production', () => {
    process.env.NODE_ENV = 'production';
    localStorage.setItem('maskPII', 'true');

    const sanitized = security.sanitizePrompt('Contact me at qa@example.com');

    expect(sanitized).toContain('[EMAIL]');
    expect(sanitized).not.toContain('qa@example.com');
  });

  it('falls back to environment mask setting when no localStorage preference exists', () => {
    process.env.NODE_ENV = 'production';
    process.env.MASK_PII = 'false';

    const sanitized = security.sanitizePrompt('Call me at 555-123-4567');

    expect(sanitized).toContain('555-123-4567');
  });

  it('rejects non-graph responses and logs a warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = security.validateOutputSafety(null as unknown as Record<string, unknown>);

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('ParserSecurity: Invalid response format');
  });

  it('flags responses with dangerous patterns', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = security.validateOutputSafety({
      nodes: [{ content: '<script>alert(1)</script>' }],
      edges: []
    });

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      'Dangerous pattern detected in LLM output: <script'
    );
  });

  it('rejects responses that contain executable code in nodes', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = security.validateOutputSafety({
      nodes: [{ content: '<div onload="alert(1)"></div>' }],
      edges: []
    });

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('Executable code detected in node content');
  });

  it('warns when cycles are detected but still accepts the structure', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = security.validateOutputSafety({
      nodes: [{ content: 'node-1' }, { content: 'node-2' }],
      edges: [
        { source: 0, target: 1 },
        { source: 1, target: 0 }
      ]
    });

    expect(result).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith('Cycle detected in graph structure');
  });

  it('rejects structures with invalid edge references', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = security.validateOutputSafety({
      nodes: [{}],
      edges: [{ source: 0, target: 1 }]
    });

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('Invalid structure in LLM response');
  });

  it('stores security events, filters invalid entries, and trims history to 100 records', () => {
    process.env.NODE_ENV = 'development';
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const baseDate = Date.now();
    const existingLogs = Array.from({ length: 100 }, (_, index) => ({
      timestamp: new Date(baseDate - index * 1000).toISOString(),
      event: `existing-${index}`,
      details: { index },
      source: 'ParserSecurity'
    }));

    const rawWithInvalidEntries = JSON.stringify([
      { unexpected: 'value' },
      ...existingLogs
    ]);
    localStorage.setItem('securityLogs', rawWithInvalidEntries);

    security.logSecurityEvent('new-security-event', { ok: true });

    expect(logSpy).toHaveBeenCalledWith(
      '[Security Audit]',
      expect.objectContaining({
        event: 'new-security-event',
        source: 'ParserSecurity'
      })
    );

    const storedLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    expect(storedLogs).toHaveLength(100);
    expect(storedLogs[storedLogs.length - 1]).toEqual(
      expect.objectContaining({ event: 'new-security-event' })
    );
    expect(storedLogs[0]).toEqual(expect.objectContaining({ event: 'existing-1' }));
  });

  it('recovers from corrupt stored logs when recording a security event', () => {
    process.env.NODE_ENV = 'development';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    localStorage.setItem('securityLogs', 'not-json');

    security.logSecurityEvent('fresh-event', { meta: true });

    const storedLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    expect(storedLogs).toHaveLength(1);
    expect(storedLogs[0]).toEqual(
      expect.objectContaining({
        event: 'fresh-event',
        source: 'ParserSecurity'
      })
    );
  });
});
