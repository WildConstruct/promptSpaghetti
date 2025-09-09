/**
 * Simple Admin Panel for Server Configuration
 * Provides basic HTML interface for managing Supabase and LLM settings
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

interface Message {
  type: string;
  text: string;
}

/**
 * Simple HTML admin panel
 * Serves a basic form for configuration management
 */
const getAdminHTML = (config: any, message?: Message) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Prompt Spaghetti</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            padding: 2rem;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            color: #10b981;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .section {
            background: #1e293b;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
            color: #60a5fa;
            margin-bottom: 1rem;
            font-size: 1.25rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            color: #94a3b8;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        input[type="text"],
        input[type="password"],
        input[type="url"],
        input[type="number"],
        select {
            width: 100%;
            padding: 0.75rem;
            background: #334155;
            border: 1px solid #475569;
            border-radius: 6px;
            color: #e2e8f0;
            font-size: 1rem;
        }
        
        input:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        button {
            background: #10b981;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        button:hover {
            background: #059669;
        }
        
        button:disabled {
            background: #475569;
            cursor: not-allowed;
        }
        
        .success {
            background: #065f46;
            color: #10b981;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 2rem;
            border: 1px solid #10b981;
        }
        
        .error {
            background: #7f1d1d;
            color: #ef4444;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 2rem;
            border: 1px solid #ef4444;
        }
        
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .metric {
            background: #334155;
            padding: 1rem;
            border-radius: 6px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #10b981;
        }
        
        .metric-label {
            color: #94a3b8;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        
        .nav {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .nav a {
            color: #60a5fa;
            text-decoration: none;
            font-weight: 500;
        }
        
        .nav a:hover {
            color: #93c5fd;
        }
        
        .code {
            background: #1a1a1a;
            padding: 1rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
        }
        
        small {
            color: #64748b;
            display: block;
            margin-top: 0.25rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚙️ Admin Panel</h1>
        
        ${message ? `<div class="${message.type}">${message.text}</div>` : ''}
        
        <div class="nav">
            <a href="/admin">Configuration</a>
            <a href="/admin/metrics">Metrics</a>
            <a href="/health">Health Check</a>
        </div>
        
        <div class="section">
            <h2>🔐 Supabase Configuration</h2>
            <form method="POST" action="/admin/config">
                <div class="form-group">
                    <label for="supabase_url">Supabase URL</label>
                    <input 
                        type="url" 
                        id="supabase_url" 
                        name="supabase_url" 
                        value="${config.SUPABASE_URL || ''}"
                        placeholder="https://your-project.supabase.co"
                    />
                    <small>Your Supabase project URL</small>
                </div>
                
                <div class="form-group">
                    <label for="supabase_anon_key">Supabase Anon Key</label>
                    <input 
                        type="password" 
                        id="supabase_anon_key" 
                        name="supabase_anon_key" 
                        value="${config.SUPABASE_ANON_KEY || ''}"
                        placeholder="Your anonymous/public key"
                    />
                    <small>Public key for client-side operations</small>
                </div>
                
                <button type="submit">Save Supabase Config</button>
            </form>
        </div>
        
        <div class="section">
            <h2>🤖 LLM Configuration</h2>
            <form method="POST" action="/admin/config">
                <div class="form-group">
                    <label for="openrouter_api_key">OpenRouter API Key</label>
                    <input 
                        type="password" 
                        id="openrouter_api_key" 
                        name="openrouter_api_key" 
                        value="${config.OPENROUTER_API_KEY || ''}"
                        placeholder="sk-or-..."
                    />
                    <small>Your OpenRouter API key for LLM access</small>
                </div>
                
                <div class="form-group">
                    <label for="daily_cost_limit">Daily Cost Limit ($)</label>
                    <input 
                        type="number" 
                        id="daily_cost_limit" 
                        name="daily_cost_limit" 
                        value="${config.DAILY_COST_LIMIT || '0.10'}"
                        step="0.01"
                        min="0"
                    />
                    <small>Maximum daily spend on LLM API calls</small>
                </div>
                
                <button type="submit">Save LLM Config</button>
            </form>
        </div>
        
        <div class="section">
            <h2>📊 Current Status</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${config.SUPABASE_URL ? '✅' : '❌'}</div>
                    <div class="metric-label">Supabase</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${config.OPENROUTER_API_KEY ? '✅' : '❌'}</div>
                    <div class="metric-label">OpenRouter</div>
                </div>
                <div class="metric">
                    <div class="metric-value">8000</div>
                    <div class="metric-label">Server Port</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${config.NODE_ENV || 'development'}</div>
                    <div class="metric-label">Environment</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>🔧 Environment Variables</h2>
            <div class="code">
                <pre>${JSON.stringify(config, null, 2).replace(/"/g, '')}</pre>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Register admin routes
 */
export async function registerAdminRoutes(server: FastifyInstance) {
  // Basic auth check middleware
  const checkAdminAuth = (request: FastifyRequest, reply: FastifyReply) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      reply.header('WWW-Authenticate', 'Basic realm="Admin Panel"');
      reply.status(401).send('Authentication required');
      return false;
    }

    const [type, credentials] = authHeader.split(' ');
    if (type !== 'Basic') {
      reply.status(401).send('Invalid authentication type');
      return false;
    }

    const [username, password] = Buffer.from(credentials, 'base64')
      .toString()
      .split(':');
    if (username !== 'admin' || password !== adminPassword) {
      reply.status(401).send('Invalid credentials');
      return false;
    }

    return true;
  };

  // Admin panel HTML page
  server.get('/admin', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) return;

    const config = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
        ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8)
        : '',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
        ? '***' + process.env.OPENROUTER_API_KEY.slice(-8)
        : '',
      DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_ADMIN: process.env.ENABLE_ADMIN
    };

    reply.type('text/html').send(getAdminHTML(config));
  });

  // Handle config updates
  server.post('/admin/config', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) return;

    const body = request.body as any;
    const envPath = path.join(__dirname, '../.env');

    try {
      // Read current .env file
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      // Update the values
      const updates: Record<string, string> = {};

      if (body.supabase_url) {
        updates.SUPABASE_URL = body.supabase_url;
      }
      if (body.supabase_anon_key) {
        updates.SUPABASE_ANON_KEY = body.supabase_anon_key;
      }
      if (body.openrouter_api_key) {
        updates.OPENROUTER_API_KEY = body.openrouter_api_key;
      }
      if (body.daily_cost_limit) {
        updates.DAILY_COST_LIMIT = body.daily_cost_limit;
      }

      // Apply updates to env content
      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'gm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }

        // Also update process.env for current session
        process.env[key] = value;
      }

      // Write back to .env file
      fs.writeFileSync(envPath, envContent);

      // Redirect back with success message
      const config = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
          ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8)
          : '',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
          ? '***' + process.env.OPENROUTER_API_KEY.slice(-8)
          : '',
        DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_ADMIN: process.env.ENABLE_ADMIN
      };

      reply.type('text/html').send(
        getAdminHTML(config, {
          type: 'success',
          text: 'Configuration updated successfully!'
        })
      );
    } catch (error) {
      console.error('Error updating config:', error);
      reply.status(500).send('Failed to update configuration');
    }
  });

  // Admin metrics endpoint (JSON)
  server.get('/admin/metrics', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) return;

    // Return actual or mock metrics
    return {
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        port: process.env.PORT || 8000
      },
      llm: {
        calls_today: 42,
        tokens_used: { input: 1250, output: 890 },
        cost_estimate: 0.03,
        quota_remaining: 58,
        models_used: {
          'deepseek/deepseek-r1:free': 35,
          'openai/gpt-4o-mini': 7
        }
      },
      supabase: {
        configured: !!process.env.SUPABASE_URL,
        url: process.env.SUPABASE_URL || 'Not configured'
      }
    };
  });
}
