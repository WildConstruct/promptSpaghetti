/**
 * Enhanced Admin Panel for Server Configuration
 * Includes LLM model config, prompt management, and testing
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import {
  getConfiguredAdminPassword,
  requireAdminAuth
} from './utils/adminAuth';
import { LLMService } from './services/LLMService';

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ConnectionStatus {
  configured: boolean;
  reachable: boolean;
  status?: number | null;
  error?: string;
}

interface AdminStatus {
  supabase: ConnectionStatus;
  openrouter: ConnectionStatus;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
}

// Default prompt templates
const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'parse_prompt',
    name: 'Prompt Parser',
    description: 'Parse user prompt into graph nodes',
    template: `Analyze this prompt and identify its components:
"{prompt}"

Extract:
1. Characters/subjects
2. Actions/verbs
3. Variations/choices
4. Variables

Return as JSON with nodes and edges.`,
    variables: ['prompt'],
    category: 'parsing'
  },
  {
    id: 'populate_choices',
    name: 'Populate Choices',
    description: 'Generate weighted choice options',
    template: `Given this context: "{context}"
Generate {count} creative variations for: "{nodeText}"

Return as JSON array with text and weight for each option.`,
    variables: ['context', 'count', 'nodeText'],
    category: 'generation'
  },
  {
    id: 'optimize_weights',
    name: 'Optimize Weights',
    description: 'Optimize probability weights',
    template: `Given these choices with weights:
{choices}

Optimize the weights based on:
- Narrative importance
- User preference: "{preference}"
- Context: "{context}"

Return optimized weights as JSON.`,
    variables: ['choices', 'preference', 'context'],
    category: 'optimization'
  },
  {
    id: 'extract_metadata',
    name: 'Extract Metadata',
    description: 'Extract metadata from text',
    template: `Analyze this text:
"{text}"

Extract:
- Tags (3-5 keywords)
- Subject (main topic)
- Tone (emotional quality)
- Complexity (1-10)

Return as JSON.`,
    variables: ['text'],
    category: 'analysis'
  }
];

// Available models
const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI', cost: 'High' },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4 Mini',
    provider: 'OpenAI',
    cost: 'Low'
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    cost: 'High'
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    cost: 'Low'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    cost: 'Free'
  },
  {
    id: 'mistral/mistral-medium-3.1:free',
    name: 'Mistral Medium (Free)',
    provider: 'Mistral',
    cost: 'Free'
  },
  {
    id: 'qwen/qwen-262k:free',
    name: 'Qwen 262K (Free)',
    provider: 'Qwen',
    cost: 'Free'
  }
];

interface TestProviderRequest {
  provider: string;
}

interface UpdateEnvRequest {
  [key: string]: string;
}

interface DeleteEnvRequest {
  key_name: string;
  confirmation: string;
}

interface PromptTestRequest {
  prompt: string;
  model: string;
}

interface FeatureTestRequest extends PromptTestRequest {
  feature: 'parse' | 'choices' | 'metadata' | 'weights';
}

interface ModelConfigRequest {
  primary_model?: string;
  fallback_models?: string;
  max_tokens?: string;
  temperature?: string;
}

interface AdminConfig {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_BASE_URL?: string;
  DAILY_COST_LIMIT?: string;
  PRIMARY_MODEL?: string;
  FALLBACK_MODELS?: string;
  MAX_TOKENS?: string;
  TEMPERATURE?: string;
}

/**
 * Enhanced HTML admin panel
 */
const getEnhancedAdminHTML = (
  config: AdminConfig,
  prompts: PromptTemplate[],
  message?: Message,
  status?: AdminStatus
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Prompt Spaghetti</title>
    <link rel="stylesheet" href="/admin/assets/admin.css" />
    <script src="/admin/assets/admin.js" defer></script>
        // Auto-dismiss flash banner after save
        document.addEventListener('DOMContentLoaded', function () {
            const banner = document.querySelector('.banner');
            if (banner) {
                setTimeout(() => {
                    if (banner && banner.parentElement) {
                        banner.parentElement.removeChild(banner);
                    }
                }, 2500);
            }
        });

        function switchTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            document.querySelector('[data-tab="' + tabName + '"]').classList.add('active');
        }
        
        function selectModel(modelId) {
            // Update hidden input
            document.getElementById('selected_model').value = modelId;
            
            // Update visual selection
            document.querySelectorAll('.model-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector('[data-model="' + modelId + '"]').classList.add('selected');
        }
        
        async function testLLM() {
            const button = document.getElementById('test-button');
            const resultDiv = document.getElementById('test-result');
            
            button.disabled = true;
            button.textContent = 'Testing...';
            resultDiv.innerHTML = 'Running test...';
            
            try {
                const response = await fetch('/admin/test-llm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('admin:' + prompt('Enter admin password:'))
                    },
                    body: JSON.stringify({
                        prompt: document.getElementById('test-prompt').value,
                        model: document.getElementById('test-model').value
                    })
                });
                
                const result = await response.json();
                resultDiv.innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">Test failed: ' + error.message + '</div>';
            } finally {
                button.disabled = false;
                button.textContent = 'Run Test';
            }
        }
        
        window.onload = function() {
            // Initialize first tab
            switchTab('config');
        };
    </script>
</head>
  <body>
    <div class="container">
      ${message ? `<div class="banner ${message.type}">${message.text}</div>` : ''}
      <div class="status-panel">
        <div class="status-header">
          <div class="status-title">Connection Status</div>
          <div class="status-actions">
            <button id="reload-status" class="btn-small">Reload</button>
          </div>
        </div>
        <div class="kv">
          <span id="supabase-dot" class="status-dot ${status?.supabase?.reachable ? 'dot-ok' : 'dot-bad'}"></span>
          <span id="supabase-text">Supabase: ${status?.supabase?.configured ? 'Configured' : 'Not configured'} — ${status?.supabase?.reachable ? 'Reachable' : 'Unreachable'}${status?.supabase?.status ? ` (HTTP ${status.supabase.status})` : ''}${status?.supabase?.error ? ` — ${status.supabase.error}` : ''}</span>
          <button id="test-supabase" class="btn-small push-right">Test</button>
        </div>
        <div class="kv">
          <span id="openrouter-dot" class="status-dot ${status?.openrouter?.reachable ? 'dot-ok' : 'dot-bad'}"></span>
          <span id="openrouter-text">OpenRouter: ${status?.openrouter?.configured ? 'Configured' : 'Not configured'} — ${status?.openrouter?.reachable ? 'Reachable' : 'Unreachable'}${status?.openrouter?.status ? ` (HTTP ${status.openrouter.status})` : ''}${status?.openrouter?.error ? ` — ${status.openrouter.error}` : ''}</span>
          <button id="test-openrouter" class="btn-small push-right">Test</button>
        </div>
      </div>
        <h1>⚙️ Enhanced Admin Panel</h1>
        
        ${message ? `<div class="${message.type}">${message.text}</div>` : ''}
        
        <div class="tabs">
            <button class="tab active" data-tab="config" onclick="switchTab('config')">🔧 Configuration</button>
            <button class="tab" data-tab="models" onclick="switchTab('models')">🤖 Models</button>
            <button class="tab" data-tab="prompts" onclick="switchTab('prompts')">📝 Prompts</button>
            <button class="tab" data-tab="testing" onclick="switchTab('testing')">🧪 Testing</button>
            <button class="tab" data-tab="metrics" onclick="switchTab('metrics')">📊 Metrics</button>
        </div>
        
        <!-- Configuration Tab -->
        <div id="config" class="tab-content active">
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
                <h2>🤖 OpenRouter Configuration</h2>
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
                        <label for="openrouter_base_url">OpenRouter Base URL</label>
                        <input 
                            type="url" 
                            id="openrouter_base_url" 
                            name="openrouter_base_url" 
                            value="${config.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}"
                        />
                        <small>API endpoint URL</small>
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
                    
                    <button type="submit">Save OpenRouter Config</button>
                </form>
                <div class="delete-form">
                  <div class="danger">Delete a stored key</div>
                  <form action="/admin/delete-key" method="post" style="display: grid; gap: 8px; margin-top: 6px;">
                    <label>
                      <div>Key to delete (allowed: SUPABASE_ANON_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY)</div>
                      <input type="text" name="key_name" placeholder="e.g. OPENROUTER_API_KEY" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #334155; background: #111827; color: #e2e8f0;">
                    </label>
                    <label>
                      <div>Type exactly: <code>Yes I want to delete this key</code></div>
                      <input type="text" name="confirmation" placeholder="Yes I want to delete this key" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #334155; background: #111827; color: #e2e8f0;">
                    </label>
                    <button type="submit" class="danger btn-small">Delete Key</button>
                  </form>
                </div>
            </div>
        </div>
        
        <!-- Models Tab -->
        <div id="models" class="tab-content">
            <div class="section">
                <h2>🤖 Model Selection</h2>
                <form method="POST" action="/admin/models">
                    <div class="form-group">
                        <label>Primary Model</label>
                        <div class="model-grid">
                            ${AVAILABLE_MODELS.map(
                              model => `
                                <div class="model-card ${config.PRIMARY_MODEL === model.id ? 'selected' : ''}" 
                                     data-model="${model.id}" 
                                     onclick="selectModel('${model.id}')">
                                    <div class="model-name">${model.name}</div>
                                    <div class="model-info">
                                        <span>${model.provider}</span>
                                        <span>${model.cost}</span>
                                    </div>
                                </div>
                            `
                            ).join('')}
                        </div>
                        <input type="hidden" id="selected_model" name="primary_model" value="${config.PRIMARY_MODEL || 'openai/gpt-4o-mini'}" />
                    </div>
                    
                    <div class="form-group">
                        <label for="fallback_models">Fallback Models (comma-separated)</label>
                        <input 
                            type="text" 
                            id="fallback_models" 
                            name="fallback_models" 
                            value="${config.FALLBACK_MODELS || 'deepseek/deepseek-r1:free,mistral/mistral-medium-3.1:free'}"
                            placeholder="model1,model2,model3"
                        />
                        <small>Models to use if primary fails</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="max_tokens">Max Tokens</label>
                        <input 
                            type="number" 
                            id="max_tokens" 
                            name="max_tokens" 
                            value="${config.MAX_TOKENS || '200'}"
                            min="50"
                            max="4000"
                        />
                        <small>Maximum tokens per response</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="temperature">Temperature</label>
                        <input 
                            type="number" 
                            id="temperature" 
                            name="temperature" 
                            value="${config.TEMPERATURE || '0.7'}"
                            min="0"
                            max="2"
                            step="0.1"
                        />
                        <small>Creativity level (0=deterministic, 2=very creative)</small>
                    </div>
                    
                    <button type="submit">Save Model Configuration</button>
                </form>
            </div>
        </div>
        
        <!-- Prompts Tab -->
        <div id="prompts" class="tab-content">
            <div class="section">
                <h2>📝 Prompt Templates</h2>
                <p class="muted mb-1">
                    These are the prompt templates used by the LLM system. Edit them to customize behavior.
                </p>
                
                ${prompts
                  .map(
                    prompt => `
                    <div class="prompt-card">
                        <div class="prompt-header">
                            <span class="prompt-title">${prompt.name}</span>
                            <span class="prompt-category">${prompt.category}</span>
                        </div>
                        <div class="prompt-description">${prompt.description}</div>
                        <form method="POST" action="/admin/prompt/${prompt.id}">
                            <div class="form-group">
                                <textarea 
                                    name="template" 
                                    placeholder="Prompt template..."
                                >${prompt.template}</textarea>
                            </div>
                            <div class="prompt-variables">
                                ${prompt.variables.map(v => `<span class="variable-tag">{${v}}</span>`).join('')}
                            </div>
                            <div class="button-group">
                                <button type="submit">Save</button>
                                <button type="button" class="secondary" onclick="testPrompt('${prompt.id}')">Test</button>
                            </div>
                        </form>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
        
        <!-- Testing Tab -->
        <div id="testing" class="tab-content">
            <div class="section">
                <h2>🧪 LLM Test Runner</h2>
                <div class="form-group">
                    <label for="test-model">Test Model</label>
                    <select id="test-model">
                        ${AVAILABLE_MODELS.map(
                          model => `
                            <option value="${model.id}">${model.name}</option>
                        `
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="test-prompt">Test Prompt</label>
                    <textarea 
                        id="test-prompt" 
                        placeholder="Enter a test prompt..."
                    >A brave knight fights a dragon in the castle courtyard</textarea>
                </div>
                
                <button id="test-button" onclick="testLLM()">Run Test</button>
                
                <div id="test-result" class="test-result">
                    <!-- Test results will appear here -->
                </div>
            </div>
            
            <div class="section">
                <h2>🔄 Quick Tests</h2>
                <div class="button-group">
                    <button onclick="testFeature('parse')">Test Parser</button>
                    <button onclick="testFeature('choices')">Test Choice Generation</button>
                    <button onclick="testFeature('metadata')">Test Metadata Extraction</button>
                    <button onclick="testFeature('weights')">Test Weight Optimization</button>
                </div>
            </div>
        </div>
        
        <!-- Metrics Tab -->
        <div id="metrics" class="tab-content">
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
                        <div class="metric-value">${config.PRIMARY_MODEL ? '✅' : '❌'}</div>
                        <div class="metric-label">Model Config</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">8002</div>
                        <div class="metric-label">Server Port</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🔧 All Environment Variables</h2>
                <div class="code">
                    <pre>${JSON.stringify(config, null, 2).replace(/"/g, '')}</pre>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Load prompt templates from file or use defaults
 */
function loadPrompts(): PromptTemplate[] {
  const promptsPath = path.join(__dirname, '../prompts.json');
  if (fs.existsSync(promptsPath)) {
    try {
      return JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  }
  return DEFAULT_PROMPTS;
}

/**
 * Save prompt templates to file
 */
function savePrompts(prompts: PromptTemplate[]) {
  const promptsPath = path.join(__dirname, '../prompts.json');
  fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
}

function extractChoiceGroups(prompt: string) {
  return Array.from(prompt.matchAll(/\{([^{}]+)\}/g)).map((match, index) => {
    const options = match[1]
      .split('|')
      .map(option => option.trim())
      .filter(Boolean);

    return {
      id: `choice-${index + 1}`,
      placeholder: match[0],
      options,
      count: options.length
    };
  });
}

function inferPromptTags(prompt: string): string[] {
  const haystack = prompt.toLowerCase();
  const matchers: Array<[string, RegExp]> = [
    ['character', /\b(person|driver|mechanic|fan|spectator|hero|knight)\b/],
    ['crowd', /\b(crowd|grandstand|spectator|fans|extras)\b/],
    ['vehicle', /\b(car|race car|truck|vehicle|indy)\b/],
    ['setting', /\b(track|speedway|castle|forest|street|courtyard)\b/],
    ['wardrobe', /\b(shirt|jacket|cap|helmet|uniform|dress|gloves)\b/],
    ['action', /\b(watches|runs|fights|drives|stands|sits)\b/]
  ];

  return matchers
    .filter(([, pattern]) => pattern.test(haystack))
    .map(([tag]) => tag);
}

function runFeatureDiagnostic(feature: FeatureTestRequest['feature'], prompt: string) {
  const choiceGroups = extractChoiceGroups(prompt);
  const words = prompt.split(/\s+/).filter(Boolean);

  if (feature === 'parse') {
    return {
      mode: 'heuristic-parse-v1',
      summary: {
        characterCount: prompt.length,
        wordCount: words.length,
        choiceGroupCount: choiceGroups.length
      },
      choiceGroups,
      clauses: prompt
        .split(/[.;\n]+/)
        .map(part => part.trim())
        .filter(Boolean)
    };
  }

  if (feature === 'choices') {
    return {
      mode: 'heuristic-choice-inspection-v1',
      choiceGroups,
      recommendation:
        choiceGroups.length > 0
          ? 'Use these groups as Weighted Choice nodes.'
          : 'No {a|b|c} groups found; add explicit braces to create choice nodes.'
    };
  }

  if (feature === 'metadata') {
    return {
      mode: 'heuristic-metadata-v1',
      tags: inferPromptTags(prompt),
      estimatedComplexity:
        choiceGroups.length >= 3 || words.length > 28 ? 'high' : 'normal'
    };
  }

  return {
    mode: 'heuristic-weight-normalization-v1',
    groups: choiceGroups.map(group => {
      const weight = group.options.length > 0
        ? Math.floor(100 / group.options.length)
        : 0;

      return {
        id: group.id,
        options: group.options.map(option => ({ text: option, weight }))
      };
    }),
    recommendation:
      choiceGroups.length > 0
        ? 'Initial equal weights generated. Adjust for desired frequency.'
        : 'No choice groups found to weight.'
  };
}

/**
 * Register enhanced admin routes
 */
export async function registerEnhancedAdminRoutes(server: FastifyInstance) {
  if (!getConfiguredAdminPassword()) {
    server.log.warn(
      'Admin panel not mounted because ADMIN_PASSWORD is missing or invalid'
    );
    return;
  }

  const checkAdminAuth = (request: FastifyRequest, reply: FastifyReply) => {
    return requireAdminAuth(request, reply);
  };

  // Enhanced admin panel HTML page
  server.get('/admin', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    const config = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
        ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8)
        : '',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
        ? '***' + process.env.OPENROUTER_API_KEY.slice(-8)
        : '',
      OPENROUTER_BASE_URL:
        process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
      PRIMARY_MODEL: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
      FALLBACK_MODELS:
        process.env.FALLBACK_MODELS ||
        'deepseek/deepseek-r1:free,mistral/mistral-medium-3.1:free',
      MAX_TOKENS: process.env.MAX_TOKENS || '200',
      TEMPERATURE: process.env.TEMPERATURE || '0.7',
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_ADMIN: process.env.ENABLE_ADMIN
    };

    const prompts = loadPrompts();

    // Compute connection status
    const status = await (async (): Promise<AdminStatus> => {
      const supabaseUrl = process.env.SUPABASE_URL;
      const orBase =
        process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
      const orKey =
        process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
      // Supabase: try /auth/v1/health
      const supabase: ConnectionStatus = {
        configured: !!supabaseUrl,
        reachable: false,
        status: null
      };
      if (supabaseUrl) {
        try {
          const controller = new AbortController();
          const to = setTimeout(() => controller.abort(), 4000);
          let res = await fetch(
            `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`,
            { signal: controller.signal }
          );
          clearTimeout(to);
          if (res.status === 401 && process.env.SUPABASE_ANON_KEY) {
            const controller2 = new AbortController();
            const to2 = setTimeout(() => controller2.abort(), 4000);
            res = await fetch(
              `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`,
              {
                headers: {
                  apikey: process.env.SUPABASE_ANON_KEY,
                  Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
                },
                signal: controller2.signal
              }
            );
            clearTimeout(to2);
          }
          supabase.status = res.status;
          supabase.reachable = res.ok || res.status === 200;
        } catch (e: unknown) {
          supabase.error = (e as Error)?.message || 'request failed';
        }

        // (client-side script for status buttons is injected in HTML template <script>)
      }
      // OpenRouter: GET /models with Authorization if key present
      const openrouter: ConnectionStatus = {
        configured: !!orKey,
        reachable: false,
        status: null
      };
      if (orKey) {
        try {
          const controller = new AbortController();
          const to = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(`${orBase.replace(/\/$/, '')}/models`, {
            headers: { Authorization: `Bearer ${orKey}` },
            signal: controller.signal
          });
          clearTimeout(to);
          openrouter.status = res.status;
          openrouter.reachable = res.ok;
        } catch (e: unknown) {
          openrouter.error = (e as Error)?.message || 'request failed';
        }
      }
      return { supabase, openrouter };
    })();

    // Add stricter CSP for admin (no inline styles/scripts)
    reply.header(
      'Content-Security-Policy',
      "default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' http://ps.wildconstruct.com:8000 https://ps.wildconstruct.com; frame-ancestors 'none';"
    );
    reply
      .type('text/html')
      .send(getEnhancedAdminHTML(config, prompts, undefined, status));
  });

  // Serve admin assets (CSS/JS)
  server.get('/admin/assets/admin.css', async (_req, reply) => {
    const p = path.join(__dirname, './assets/admin.css');
    try {
      const css = fs.readFileSync(p, 'utf-8');
      reply.header('Content-Type', 'text/css; charset=utf-8');
      reply.header('Cache-Control', 'public, max-age=300');
      return reply.send(css);
    } catch {
      return reply.status(404).send('not found');
    }
  });
  server.get('/admin/assets/admin.js', async (_req, reply) => {
    const p = path.join(__dirname, './assets/admin.js');
    try {
      const js = fs.readFileSync(p, 'utf-8');
      reply.header('Content-Type', 'application/javascript; charset=utf-8');
      reply.header('Cache-Control', 'public, max-age=300');
      return reply.send(js);
    } catch {
      return reply.status(404).send('not found');
    }
  });

  // Return current connection status as JSON
  server.get('/admin/connection-status', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}
    const supabaseUrl = process.env.SUPABASE_URL;
    const orBase =
      process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    const orKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const supabase: ConnectionStatus = {
      configured: !!supabaseUrl,
      reachable: false,
      status: null
    };
    if (supabaseUrl) {
      try {
        const r = await fetch(
          `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`
        );
        supabase.status = r.status;
        supabase.reachable = r.ok;
      } catch (e: unknown) {
        supabase.error = (e as Error)?.message;
      }
    }
    const openrouter: ConnectionStatus = {
      configured: !!orKey,
      reachable: false,
      status: null
    };
    if (orKey) {
      try {
        const r = await fetch(`${orBase.replace(/\/$/, '')}/models`, {
          headers: { Authorization: `Bearer ${orKey}` }
        });
        openrouter.status = r.status;
        openrouter.reachable = r.ok;
      } catch (e: unknown) {
        openrouter.error = (e as Error)?.message;
      }
    }
    return { supabase, openrouter } as AdminStatus;
  });

  // Test connection for a single provider
  server.post('/admin/test-connection', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}
    const { provider } = (request.body as TestProviderRequest) || {};
    if (provider !== 'supabase' && provider !== 'openrouter') {
      return reply.status(400).send({ error: 'Invalid provider' });
    }
    if (provider === 'supabase') {
      const supabaseUrl = process.env.SUPABASE_URL;
      const status: ConnectionStatus = {
        configured: !!supabaseUrl,
        reachable: false,
        status: null
      };
      if (supabaseUrl) {
        try {
          const r = await fetch(
            `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`
          );
          status.status = r.status;
          status.reachable = r.ok;
        } catch (e: unknown) {
          status.error = (e as Error)?.message;
        }
      }
      return status;
    } else {
      const orBase =
        process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
      const orKey =
        process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
      const status: ConnectionStatus = {
        configured: !!orKey,
        reachable: false,
        status: null
      };
      if (orKey) {
        try {
          const r = await fetch(`${orBase.replace(/\/$/, '')}/models`, {
            headers: { Authorization: `Bearer ${orKey}` }
          });
          status.status = r.status;
          status.reachable = r.ok;
        } catch (e: unknown) {
          status.error = (e as Error)?.message;
        }
      }
      return status;
    }
  });

  // Handle config updates
  server.post('/admin/config', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    return reply
      .status(403)
      .send(
        'Runtime configuration mutation is disabled. Use operator-managed environment configuration.'
      );

    const body = request.body as UpdateEnvRequest;
    const envPath = path.join(__dirname, '../.env');

    try {
      // Read current .env file
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      // Update the values
      const updates: Record<string, string> = {};

      // Collect all possible updates
      const fields = [
        'supabase_url',
        'supabase_anon_key',
        'openrouter_api_key',
        'openrouter_base_url',
        'daily_cost_limit'
      ];

      fields.forEach(field => {
        if (body[field]) {
          const envKey = field.toUpperCase();
          updates[envKey] = body[field];
        }
      });

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
        OPENROUTER_BASE_URL:
          process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
        PRIMARY_MODEL: process.env.PRIMARY_MODEL,
        FALLBACK_MODELS: process.env.FALLBACK_MODELS,
        MAX_TOKENS: process.env.MAX_TOKENS,
        TEMPERATURE: process.env.TEMPERATURE,
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_ADMIN: process.env.ENABLE_ADMIN
      };

      const prompts = loadPrompts();
      // refresh status
      const status = await (async (): Promise<AdminStatus> => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const orBase =
          process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
        const orKey =
          process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
        const supabase: ConnectionStatus = {
          configured: !!supabaseUrl,
          reachable: false,
          status: null
        };
        if (supabaseUrl) {
          try {
            const r = await fetch(
              `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`
            );
            supabase.status = r.status;
            supabase.reachable = r.ok;
          } catch (e) {
            supabase.error = e?.message;
          }
        }
        const openrouter: ConnectionStatus = {
          configured: !!orKey,
          reachable: false,
          status: null
        };
        if (orKey) {
          try {
            const r = await fetch(`${orBase.replace(/\/$/, '')}/models`, {
              headers: { Authorization: `Bearer ${orKey}` }
            });
            openrouter.status = r.status;
            openrouter.reachable = r.ok;
          } catch (e: unknown) {
            openrouter.error = (e as Error)?.message;
          }
        }
        return { supabase, openrouter };
      })();

      reply.type('text/html').send(
        getEnhancedAdminHTML(
          config,
          prompts,
          {
            type: 'success',
            text: 'Configuration updated successfully!'
          },
          status
        )
      );
    } catch (error) {
      console.error('Error updating config:', error);
      reply.status(500).send('Failed to update configuration');
    }
  });

  // Delete a key with confirmation phrase
  server.post('/admin/delete-key', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    return reply
      .status(403)
      .send(
        'Runtime secret deletion is disabled. Use operator-managed environment configuration.'
      );

    const { key_name, confirmation } = (request.body as DeleteEnvRequest) || {};
    const allowed = new Set([
      'SUPABASE_ANON_KEY',
      'OPENROUTER_API_KEY',
      'OPENAI_API_KEY'
    ]);
    const envPath = path.join(__dirname, '../.env');

    if (!key_name || !allowed.has(key_name)) {
      return reply.status(400).send('Invalid key name');
    }
    if (confirmation !== 'Yes I want to delete this key') {
      const config = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
          ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8)
          : '',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
          ? '***' + process.env.OPENROUTER_API_KEY.slice(-8)
          : '',
        OPENROUTER_BASE_URL:
          process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
        PRIMARY_MODEL: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
        FALLBACK_MODELS:
          process.env.FALLBACK_MODELS ||
          'deepseek/deepseek-r1:free,mistral/mistral-medium-3.1:free',
        MAX_TOKENS: process.env.MAX_TOKENS || '200',
        TEMPERATURE: process.env.TEMPERATURE || '0.7',
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_ADMIN: process.env.ENABLE_ADMIN
      };
      const prompts = loadPrompts();
      const status = {
        supabase: { configured: !!process.env.SUPABASE_URL, reachable: false },
        openrouter: {
          configured: !!(
            process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
          ),
          reachable: false
        }
      } as AdminStatus;
      return reply
        .type('text/html')
        .send(
          getEnhancedAdminHTML(
            config,
            prompts,
            { type: 'error', text: 'Confirmation phrase mismatch.' },
            status
          )
        );
    }

    try {
      let envContent = '';
      if (fs.existsSync(envPath))
        {envContent = fs.readFileSync(envPath, 'utf-8');}
      const lineRegex = new RegExp(`^${key_name}=.*$\\r?\\n?`, 'gm');
      envContent = envContent.replace(lineRegex, '');
      fs.writeFileSync(envPath, envContent);
      delete (process.env as Record<string, string | undefined>)[key_name];

      const config = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
          ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8)
          : '',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
          ? '***' + process.env.OPENROUTER_API_KEY.slice(-8)
          : '',
        OPENROUTER_BASE_URL:
          process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
        PRIMARY_MODEL: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
        FALLBACK_MODELS:
          process.env.FALLBACK_MODELS ||
          'deepseek/deepseek-r1:free,mistral/mistral-medium-3.1:free',
        MAX_TOKENS: process.env.MAX_TOKENS || '200',
        TEMPERATURE: process.env.TEMPERATURE || '0.7',
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_ADMIN: process.env.ENABLE_ADMIN
      };
      const prompts = loadPrompts();
      const status = await (async (): Promise<AdminStatus> => {
        const supabase: ConnectionStatus = {
          configured: !!process.env.SUPABASE_URL,
          reachable: false
        };
        const openrouter: ConnectionStatus = {
          configured: !!(
            process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
          ),
          reachable: false
        };
        return { supabase, openrouter };
      })();
      reply
        .type('text/html')
        .send(
          getEnhancedAdminHTML(
            config,
            prompts,
            { type: 'success', text: `${key_name} deleted.` },
            status
          )
        );
    } catch (err) {
      console.error('Error deleting key:', err);
      reply.status(500).send('Failed to delete key');
    }
  });

  // Handle model configuration
  server.post('/admin/models', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    return reply
      .status(403)
      .send(
        'Runtime model configuration mutation is disabled. Use operator-managed environment configuration.'
      );

    const body = request.body as ModelConfigRequest;
    const envPath = path.join(__dirname, '../.env');

    try {
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      const updates: Record<string, string> = {};

      if (body.primary_model) {updates.PRIMARY_MODEL = body.primary_model;}
      if (body.fallback_models) {updates.FALLBACK_MODELS = body.fallback_models;}
      if (body.max_tokens) {updates.MAX_TOKENS = body.max_tokens;}
      if (body.temperature) {updates.TEMPERATURE = body.temperature;}

      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'gm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
        process.env[key] = value;
      }

      fs.writeFileSync(envPath, envContent);

      // Get updated config with new values
      const config = {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
          ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8)
          : '',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
          ? '***' + process.env.OPENROUTER_API_KEY.slice(-8)
          : '',
        OPENROUTER_BASE_URL:
          process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
        PRIMARY_MODEL: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
        FALLBACK_MODELS:
          process.env.FALLBACK_MODELS ||
          'deepseek/deepseek-r1:free,mistral/mistral-medium-3.1:free',
        MAX_TOKENS: process.env.MAX_TOKENS || '200',
        TEMPERATURE: process.env.TEMPERATURE || '0.7',
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_ADMIN: process.env.ENABLE_ADMIN
      };

      const prompts = loadPrompts();

      // Get updated status
      const status = await (async (): Promise<AdminStatus> => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const orBase =
          process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
        const orKey =
          process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
        const supabase: ConnectionStatus = {
          configured: !!supabaseUrl,
          reachable: false,
          status: null
        };
        if (supabaseUrl) {
          try {
            const controller = new AbortController();
            const to = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(
              `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`
            );
            clearTimeout(to);
            supabase.status = res.status;
            supabase.reachable = res.ok || res.status === 200;
          } catch (error: unknown) {
            supabase.error =
              error instanceof Error ? error.message : 'request failed';
          }
        }
        const openrouter: ConnectionStatus = {
          configured: !!orKey,
          reachable: false,
          status: null
        };
        if (orKey) {
          try {
            const controller = new AbortController();
            const to = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${orBase.replace(/\/$/, '')}/models`, {
              headers: { Authorization: `Bearer ${orKey}` }
            });
            clearTimeout(to);
            openrouter.status = res.status;
            openrouter.reachable = res.ok;
          } catch (error: unknown) {
            openrouter.error =
              error instanceof Error ? error.message : 'request failed';
          }
        }
        return { supabase, openrouter };
      })();

      reply.type('text/html').send(
        getEnhancedAdminHTML(
          config,
          prompts,
          {
            type: 'success',
            text: 'Model configuration updated successfully!'
          },
          status
        )
      );
    } catch (error) {
      console.error('Error updating models:', error);
      reply.status(500).send('Failed to update model configuration');
    }
  });

  // Handle prompt updates
  server.post('/admin/prompt/:id', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    const { id } = request.params as { id: string };
    const payload = request.body as { template?: unknown } | undefined;
    const template =
      typeof payload?.template === 'string' ? payload.template : undefined;

    if (!template) {
      reply.status(400).send('Invalid prompt template');
      return;
    }

    try {
      const prompts = loadPrompts();
      const promptIndex = prompts.findIndex(p => p.id === id);

      if (promptIndex >= 0) {
        prompts[promptIndex].template = template;
        savePrompts(prompts);
      }

      reply.redirect('/admin#prompts');
    } catch (error) {
      console.error('Error updating prompt:', error);
      reply.status(500).send('Failed to update prompt');
    }
  });

  // Test LLM endpoint
  server.post('/admin/test-llm', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    const { prompt, model } = request.body as PromptTestRequest;
    const llm = new LLMService({ defaultModel: model || undefined });

    if (!llm.available()) {
      return reply.status(503).send({
        success: false,
        error: 'No server-side LLM provider is configured',
        requiredEnv: ['OPENROUTER_API_KEY', 'OPENAI_API_KEY']
      });
    }

    const startedAt = Date.now();
    const completion = await llm.complete({
      prompt: prompt || 'Return a short readiness confirmation.',
      model: model || undefined,
      maxTokens: 120,
      temperature: 0.2
    });

    return {
      success: true,
      model: completion.model,
      prompt: prompt,
      response: {
        text: completion.content,
        tokens: {
          input: completion.tokensIn,
          output: completion.tokensOut
        },
        latency: Date.now() - startedAt
      },
      timestamp: new Date().toISOString()
    };
  });

  server.post('/admin/test-feature', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    const { feature, prompt } = request.body as FeatureTestRequest;
    if (!['parse', 'choices', 'metadata', 'weights'].includes(feature)) {
      return reply.status(400).send({
        success: false,
        error: 'Unknown admin feature diagnostic'
      });
    }

    const text = prompt?.trim();
    if (!text) {
      return reply.status(400).send({
        success: false,
        error: 'Prompt is required for feature diagnostics'
      });
    }

    return {
      success: true,
      feature,
      prompt: text,
      result: runFeatureDiagnostic(feature, text),
      timestamp: new Date().toISOString()
    };
  });

  // Admin metrics endpoint (JSON)
  server.get('/admin/metrics', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) {return;}

    return {
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        port: process.env.PORT || 8002
      },
      llm: {
        calls_today: 42,
        tokens_used: { input: 1250, output: 890 },
        cost_estimate: 0.03,
        quota_remaining: 58,
        models_used: {
          [process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini']: 35,
          'deepseek/deepseek-r1:free': 7
        }
      },
      supabase: {
        configured: !!process.env.SUPABASE_URL,
        url: process.env.SUPABASE_URL || 'Not configured'
      }
    };
  });
}
