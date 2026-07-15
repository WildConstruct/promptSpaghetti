import path from 'node:path';
import {
  assertFragmentFolderAllowed,
  isLoopbackAddress,
  isPathInsideRoot,
  resolveListenHost
} from '../src/utils/localSandboxAccess';

describe('localSandboxAccess', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    delete process.env.HOST;
    delete process.env.BIND_HOST;
    delete process.env.LOCAL_FRAGMENT_ROOTS;
    delete process.env.LOCAL_SANDBOX_ALLOW_REMOTE;
    // Restore originals that tests may have cleared
    Object.assign(process.env, originalEnv);
  });

  describe('resolveListenHost', () => {
    it('defaults to loopback', () => {
      delete process.env.HOST;
      delete process.env.BIND_HOST;
      expect(resolveListenHost()).toBe('127.0.0.1');
    });

    it('honors HOST override', () => {
      process.env.HOST = '0.0.0.0';
      expect(resolveListenHost()).toBe('0.0.0.0');
    });
  });

  describe('isLoopbackAddress', () => {
    it('accepts common loopback forms', () => {
      expect(isLoopbackAddress('127.0.0.1')).toBe(true);
      expect(isLoopbackAddress('::1')).toBe(true);
      expect(isLoopbackAddress('::ffff:127.0.0.1')).toBe(true);
      expect(isLoopbackAddress('localhost')).toBe(true);
    });

    it('rejects LAN addresses', () => {
      expect(isLoopbackAddress('10.0.0.5')).toBe(false);
      expect(isLoopbackAddress('192.168.1.10')).toBe(false);
    });
  });

  describe('assertFragmentFolderAllowed', () => {
    it('requires an absolute path', () => {
      expect(assertFragmentFolderAllowed('relative/folder')).toEqual({
        ok: false,
        error: 'Folder path must be absolute'
      });
    });

    it('allows any absolute path when LOCAL_FRAGMENT_ROOTS is unset', () => {
      delete process.env.LOCAL_FRAGMENT_ROOTS;
      const folder = path.join(path.resolve('/tmp'), 'docs');
      const result = assertFragmentFolderAllowed(folder);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.root).toBe(path.resolve(folder));
      }
    });

    it('enforces LOCAL_FRAGMENT_ROOTS when set', () => {
      const allowedRoot = path.resolve('/allowed-docs');
      process.env.LOCAL_FRAGMENT_ROOTS = allowedRoot;

      const inside = path.join(allowedRoot, 'project-a');
      const outside = path.resolve('/other-place');

      expect(assertFragmentFolderAllowed(inside).ok).toBe(true);
      expect(assertFragmentFolderAllowed(outside).ok).toBe(false);
    });
  });

  describe('isPathInsideRoot', () => {
    it('accepts the root itself and nested paths', () => {
      const root = path.resolve('/sandbox');
      expect(isPathInsideRoot(root, root)).toBe(true);
      expect(isPathInsideRoot(root, path.join(root, 'a', 'b'))).toBe(true);
    });

    it('rejects escape attempts', () => {
      const root = path.resolve('/sandbox');
      expect(isPathInsideRoot(root, path.resolve('/sandbox-other'))).toBe(
        false
      );
      expect(isPathInsideRoot(root, path.resolve('/tmp'))).toBe(false);
    });
  });
});
