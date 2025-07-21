/**
 * Enhanced Server with TLS Configuration
 * Task: T-1752989143997-22 - Ensure proper TLS configuration
 * Epic 19: Authentication Enhancement & Security Hardening
 */

import Fastify, { FastifyInstance } from 'fastify';
import { fastifyHttpsRedirect } from '@fastify/https-redirect';
import https from 'https';
import http from 'http';
import { TLSConfigManager, loadTLSConfigFromEnv } from './security/tls-config';

// ========================================
// Enhanced Server with TLS Support
// ========================================

export class EnhancedServer {
  private httpServer?: FastifyInstance;
  private httpsServer?: FastifyInstance;
  private tlsManager: TLSConfigManager;
  private isStarted: boolean = false;

  constructor() {
    // Load TLS configuration from environment
    const tlsConfig = loadTLSConfigFromEnv();
    this.tlsManager = new TLSConfigManager(tlsConfig);
  }

  /**
   * Create HTTP server instance
   */
  private createHTTPServer(): FastifyInstance {
    const server = Fastify({
      logger: true
    });

    // If TLS is enabled, redirect HTTP to HTTPS
    if (this.tlsManager.getConfig().enabled) {
      server.register(fastifyHttpsRedirect, {
        port: this.tlsManager.getConfig().port
      });
    }

    return server;
  }

  /**
   * Create HTTPS server instance
   */
  private createHTTPSServer(): FastifyInstance {
    const tlsOptions = this.tlsManager.createHTTPSOptions();
    
    const server = Fastify({
      logger: true,
      https: tlsOptions
    });

    // Add security headers middleware
    server.addHook('onRequest', async (request, reply) => {
      const securityHeaders = this.tlsManager.getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([header, value]) => {
        reply.header(header, value);
      });
    });

    return server;
  }

  /**
   * Initialize server instances
   */
  async initialize(): Promise<void> {
    const config = this.tlsManager.getConfig();

    // Validate TLS configuration if enabled
    if (config.enabled) {
      const validation = this.tlsManager.validateConfiguration();
      
      if (!validation.valid) {
        throw new Error(`TLS configuration validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn('TLS configuration warnings:', validation.warnings);
      }

      // Create HTTPS server
      this.httpsServer = this.createHTTPSServer();
      console.log('HTTPS server created');

      // Watch for certificate changes
      this.tlsManager.watchCertificates((event, filename) => {
        console.log(`Certificate file changed: ${filename}, event: ${event}`);
        // TODO: Implement certificate reload logic
      });
    }

    // Always create HTTP server (for health checks or redirects)
    this.httpServer = this.createHTTPServer();
    console.log('HTTP server created');

    // Setup routes on both servers
    await this.setupRoutes();
  }

  /**
   * Setup routes on server instances
   */
  private async setupRoutes(): Promise<void> {
    // Import the existing server configuration
    const { setupRoutes } = await import('./routes/setup');
    
    if (this.httpsServer) {
      await setupRoutes(this.httpsServer);
    }
    
    if (this.httpServer) {
      // For HTTP server, only setup essential routes (health check, redirect)
      this.httpServer.get('/health', async (request, reply) => {
        return { 
          status: 'healthy',
          protocol: 'http',
          redirect: this.tlsManager.getConfig().enabled ? 'https' : 'none',
          timestamp: new Date().toISOString()
        };
      });
    }
  }

  /**
   * Start the server(s)
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      throw new Error('Server is already started');
    }

    const config = this.tlsManager.getConfig();
    const httpPort = process.env.PORT ? parseInt(process.env.PORT) : 8000;

    try {
      // Start HTTP server
      if (this.httpServer) {
        await this.httpServer.listen({ 
          port: httpPort, 
          host: '0.0.0.0' 
        });
        console.log(`HTTP server listening on port ${httpPort}`);
      }

      // Start HTTPS server if enabled
      if (this.httpsServer && config.enabled) {
        await this.httpsServer.listen({ 
          port: config.port, 
          host: '0.0.0.0' 
        });
        console.log(`HTTPS server listening on port ${config.port}`);
        
        // Test TLS connection
        try {
          const testResult = await this.tlsManager.testTLSConnection('localhost', config.port);
          if (testResult.connected) {
            console.log(`TLS test successful: ${testResult.protocol}, cipher: ${testResult.cipher?.name}`);
          } else {
            console.warn(`TLS test failed: ${testResult.error}`);
          }
        } catch (error) {
          console.warn('TLS connection test failed:', error);
        }
      }

      this.isStarted = true;
      console.log('Server startup complete');

    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the server(s)
   */
  async stop(): Promise<void> {
    if (!this.isStarted) {
      return;
    }

    console.log('Stopping servers...');

    try {
      // Stop certificate watching
      this.tlsManager.stopWatchingCertificates();

      // Stop HTTPS server
      if (this.httpsServer) {
        await this.httpsServer.close();
        console.log('HTTPS server stopped');
      }

      // Stop HTTP server
      if (this.httpServer) {
        await this.httpServer.close();
        console.log('HTTP server stopped');
      }

      this.isStarted = false;
      console.log('All servers stopped');

    } catch (error) {
      console.error('Error during server shutdown:', error);
      throw error;
    }
  }

  /**
   * Get server status information
   */
  getStatus(): {
    http: { running: boolean; port?: number };
    https: { running: boolean; port?: number; tls?: any };
    config: any;
    } {
    const config = this.tlsManager.getConfig();
    
    return {
      http: {
        running: !!this.httpServer && this.isStarted,
        port: process.env.PORT ? parseInt(process.env.PORT) : 8000
      },
      https: {
        running: !!this.httpsServer && this.isStarted && config.enabled,
        port: config.port,
        tls: config.enabled ? {
          minVersion: config.options.minVersion,
          maxVersion: config.options.maxVersion,
          hsts: config.hsts
        } : undefined
      },
      config: {
        tlsEnabled: config.enabled,
        environment: process.env.NODE_ENV,
        validation: this.tlsManager.validateConfiguration()
      }
    };
  }

  /**
   * Reload TLS certificates
   */
  async reloadCertificates(): Promise<void> {
    if (!this.tlsManager.getConfig().enabled || !this.httpsServer) {
      throw new Error('TLS is not enabled or HTTPS server is not running');
    }

    console.log('Reloading TLS certificates...');

    try {
      // Validate new certificates
      const validation = this.tlsManager.validateConfiguration();
      if (!validation.valid) {
        throw new Error(`Certificate validation failed: ${validation.errors.join(', ')}`);
      }

      // Create new HTTPS options
      const newTLSOptions = this.tlsManager.createHTTPSOptions();
      
      // TODO: Implement graceful certificate reload
      // This would require stopping and restarting the HTTPS server
      // or using a more advanced technique like SNI callback updates
      
      console.log('Certificate reload would require server restart');
      console.log('Consider implementing graceful certificate reload for production');

    } catch (error) {
      console.error('Failed to reload certificates:', error);
      throw error;
    }
  }

  /**
   * Get TLS manager for advanced operations
   */
  getTLSManager(): TLSConfigManager {
    return this.tlsManager;
  }

  /**
   * Get server instances for testing or advanced configuration
   */
  getServers(): { http?: FastifyInstance; https?: FastifyInstance } {
    return {
      http: this.httpServer,
      https: this.httpsServer
    };
  }
}

// ========================================
// Server Bootstrap Function
// ========================================

export async function startEnhancedServer(): Promise<EnhancedServer> {
  const server = new EnhancedServer();
  
  try {
    await server.initialize();
    await server.start();
    
    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, shutting down gracefully`);
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('Failed to start enhanced server:', error);
    throw error;
  }
}

// ========================================
// Default Export
// ========================================

export default EnhancedServer;