/**
 * Fastify type declarations for Epic 9.2.1
 * Extends Fastify types to include custom decorations
 */

import { Database } from 'better-sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}