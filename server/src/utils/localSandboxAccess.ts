/**
 * Access controls for local-only sandbox routes
 * (`/api/local-image/*`, `/api/local-fragments/*`).
 *
 * Defaults favor a developer machine:
 * - Fastify binds to loopback unless HOST is set
 * - Local routes reject non-loopback clients unless LOCAL_SANDBOX_ALLOW_REMOTE=true
 * - Optional LOCAL_FRAGMENT_ROOTS allowlists fragment folder roots
 */

import path from 'node:path';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { parseBoolean, readEnvVar } from '../../../packages/core/utils/env';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost']);

/**
 * Listen address for the Fastify process.
 * Default is loopback so local sandbox routes are not LAN-reachable by accident.
 * Set HOST=0.0.0.0 (or a specific interface) only when intentional.
 */
export function resolveListenHost(): string {
  const host = (readEnvVar('HOST') || readEnvVar('BIND_HOST') || '127.0.0.1').trim();
  return host.length > 0 ? host : '127.0.0.1';
}

export function isLoopbackAddress(address: string | undefined | null): boolean {
  if (!address) {
    return false;
  }

  const normalized = address.trim().toLowerCase();
  if (LOOPBACK_HOSTS.has(normalized)) {
    return true;
  }

  // Strip IPv4-mapped IPv6 prefix if present
  if (normalized.startsWith('::ffff:')) {
    return isLoopbackAddress(normalized.slice('::ffff:'.length));
  }

  return false;
}

export function getRequestRemoteAddress(request: FastifyRequest): string | undefined {
  const raw =
    request.ip ||
    request.socket?.remoteAddress ||
    (request.raw as { socket?: { remoteAddress?: string } })?.socket?.remoteAddress;
  return typeof raw === 'string' ? raw : undefined;
}

export function isLocalSandboxRemoteAllowed(): boolean {
  return parseBoolean(readEnvVar('LOCAL_SANDBOX_ALLOW_REMOTE'), false);
}

/**
 * preHandler: reject non-loopback clients for local sandbox routes.
 * Override with LOCAL_SANDBOX_ALLOW_REMOTE=true (still bind carefully).
 */
export async function requireLocalSandboxAccess(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (isLocalSandboxRemoteAllowed()) {
    return;
  }

  const remote = getRequestRemoteAddress(request);
  if (isLoopbackAddress(remote)) {
    return;
  }

  await reply.status(403).send({
    error: 'Local sandbox routes are restricted to loopback clients',
    hint: 'Bind HOST=127.0.0.1 (default) or set LOCAL_SANDBOX_ALLOW_REMOTE=true only if intentional'
  });
}

/**
 * Parse LOCAL_FRAGMENT_ROOTS: path.delimiter-separated absolute roots
 * (`;` on Windows, `:` on POSIX — use path.delimiter).
 * Empty / unset = no allowlist (any absolute path, still gated by loopback).
 */
export function getLocalFragmentRoots(): string[] {
  const raw = readEnvVar('LOCAL_FRAGMENT_ROOTS');
  if (!raw || !raw.trim()) {
    return [];
  }

  return raw
    .split(path.delimiter)
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => path.resolve(entry));
}

export function isPathInsideRoot(root: string, candidate: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);

  if (relative === '') {
    return true;
  }

  return (
    !relative.startsWith(`..${path.sep}`) &&
    relative !== '..' &&
    !path.isAbsolute(relative)
  );
}

export type FragmentRootCheck =
  | { ok: true; root: string }
  | { ok: false; error: string };

/** Accept POSIX or Windows absolute paths regardless of host platform. */
export function isAbsoluteFilesystemPath(folderPath: string): boolean {
  return (
    path.isAbsolute(folderPath) ||
    path.win32.isAbsolute(folderPath) ||
    path.posix.isAbsolute(folderPath)
  );
}

/**
 * When LOCAL_FRAGMENT_ROOTS is configured, folderPath must resolve under a root.
 * When unset, any absolute path is accepted (dev convenience + existing UX).
 */
export function assertFragmentFolderAllowed(folderPath: string): FragmentRootCheck {
  if (folderPath.includes('\0')) {
    return { ok: false, error: 'Invalid folder path' };
  }

  if (!isAbsoluteFilesystemPath(folderPath)) {
    return { ok: false, error: 'Folder path must be absolute' };
  }

  const resolved = path.resolve(folderPath);

  const roots = getLocalFragmentRoots();
  if (roots.length === 0) {
    return { ok: true, root: resolved };
  }

  const matched = roots.find(root => isPathInsideRoot(root, resolved));
  if (!matched) {
    return {
      ok: false,
      error:
        'Folder path is outside LOCAL_FRAGMENT_ROOTS. Set the documents folder under an allowed root or update LOCAL_FRAGMENT_ROOTS.'
    };
  }

  return { ok: true, root: resolved };
}
