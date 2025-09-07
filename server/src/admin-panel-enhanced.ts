/**
 * Enhanced Admin Panel for Server Configuration
 * Includes LLM model config, prompt management, and testing
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
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
  { id: 'openai/gpt-4o-mini', name: 'GPT-4 Mini', provider: 'OpenAI', cost: 'Low' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', cost: 'High' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', cost: 'Low' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'DeepSeek', cost: 'Free' },
  { id: 'mistral/mistral-medium-3.1:free', name: 'Mistral Medium (Free)', provider: 'Mistral', cost: 'Free' },
  { id: 'qwen/qwen-262k:free', name: 'Qwen 262K (Free)', provider: 'Qwen', cost: 'Free' },
];

/**
 * Enhanced HTML admin panel
 */
const getEnhancedAdminHTML = (config: any, prompts: PromptTemplate[], message?: Message) => {
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
            color: #e2e7eb;
            padding: 2rem;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        h1 {
            color: #10b981;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 2px solid #334155;
        }
        
        .tab {
            padding: 0.75rem 1.5rem;
            background: transparent;
            color: #94a3b8;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
        }
        
        .tab:hover {
            color: #e2e8f0;
        }
        
        .tab.active {
            color: #10b981;
            border-bottom-color: #10b981;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
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
        
        h3 {
            color: #94a3b8;
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
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
        select,
        textarea {
            width: 100%;
            padding: 0.75rem;
            background: #334155;
            border: 1px solid #475569;
            border-radius: 6px;
            color: #e2e8f0;
            font-size: 1rem;
        }
        
        textarea {
            min-height: 120px;
            font-family: 'Courier New', monospace;
            resize: vertical;
        }
        
        input:focus,
        select:focus,
        textarea:focus {
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
        
        button.secondary {
            background: #475569;
        }
        
        button.secondary:hover {
            background: #64748b;
        }
        
        button.danger {
            background: #ef4444;
        }
        
        button.danger:hover {
            background: #dc2626;
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
        
        .info {
            background: #1e3a8a;
            color: #60a5fa;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 2rem;
            border: 1px solid #60a5fa;
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
        
        .code {
            background: #1a1a1a;
            padding: 1rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        
        .prompt-card {
            background: #334155;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
        }
        
        .prompt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .prompt-title {
            font-weight: 600;
            color: #e2e8f0;
        }
        
        .prompt-category {
            background: #1e293b;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
            color: #60a5fa;
        }
        
        .prompt-description {
            color: #94a3b8;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }
        
        .prompt-variables {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
        }
        
        .variable-tag {
            background: #475569;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            color: #e2e8f0;
        }
        
        .test-result {
            background: #1a1a1a;
            padding: 1rem;
            border-radius: 6px;
            margin-top: 1rem;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .model-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .model-card {
            background: #334155;
            padding: 1rem;
            border-radius: 6px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .model-card:hover {
            border-color: #475569;
        }
        
        .model-card.selected {
            border-color: #10b981;
            background: #065f46;
        }
        
        .model-name {
            font-weight: 600;
            color: #e2e8f0;
        }
        
        .model-info {
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
            font-size: 0.875rem;
            color: #94a3b8;
        }
        
        .button-group {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        small {
            color: #64748b;
            display: block;
            margin-top: 0.25rem;
        }
    </style>
    <script>
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
            document.querySelector(\`[data-tab="\${tabName}"]\`).classList.add('active');
        }
        
        function selectModel(modelId) {
            // Update hidden input
            document.getElementById('selected_model').value = modelId;
            
            // Update visual selection
            document.querySelectorAll('.model-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(\`[data-model="\${modelId}"]\`).classList.add('selected');
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
                            ${AVAILABLE_MODELS.map(model => `
                                <div class="model-card ${config.PRIMARY_MODEL === model.id ? 'selected' : ''}" 
                                     data-model="${model.id}" 
                                     onclick="selectModel('${model.id}')">
                                    <div class="model-name">${model.name}</div>
                                    <div class="model-info">
                                        <span>${model.provider}</span>
                                        <span>${model.cost}</span>
                                    </div>
                                </div>
                            `).join('')}
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
                <p style="color: #94a3b8; margin-bottom: 1rem;">
                    These are the prompt templates used by the LLM system. Edit them to customize behavior.
                </p>
                
                ${prompts.map(prompt => `
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
                `).join('')}
            </div>
        </div>
        
        <!-- Testing Tab -->
        <div id="testing" class="tab-content">
            <div class="section">
                <h2>🧪 LLM Test Runner</h2>
                <div class="form-group">
                    <label for="test-model">Test Model</label>
                    <select id="test-model">
                        ${AVAILABLE_MODELS.map(model => `
                            <option value="${model.id}">${model.name}</option>
                        `).join('')}
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

/**
 * Register enhanced admin routes
 */
export async function registerEnhancedAdminRoutes(server: FastifyInstance) {
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
    
    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
    if (username !== 'admin' || password !== adminPassword) {
      reply.status(401).send('Invalid credentials');
      return false;
    }
    
    return true;
  };
  
  // Enhanced admin panel HTML page
  server.get('/admin', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) return;
    
    const config = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8) : '',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '***' + process.env.OPENROUTER_API_KEY.slice(-8) : '',
      OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
      PRIMARY_MODEL: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
      FALLBACK_MODELS: process.env.FALLBACK_MODELS || 'deepseek/deepseek-r1:free,mistral/mistral-medium-3.1:free',
      MAX_TOKENS: process.env.MAX_TOKENS || '200',
      TEMPERATURE: process.env.TEMPERATURE || '0.7',
      NODE_ENV: process.env.NODE_ENV,
      ENABLE_ADMIN: process.env.ENABLE_ADMIN,
    };
    
    const prompts = loadPrompts();
    
    reply.type('text/html').send(getEnhancedAdminHTML(config, prompts));
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
      
      // Collect all possible updates
      const fields = [
        'supabase_url', 'supabase_anon_key',
        'openrouter_api_key', 'openrouter_base_url', 
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
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-8) : '',
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '***' + process.env.OPENROUTER_API_KEY.slice(-8) : '',
        OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        DAILY_COST_LIMIT: process.env.DAILY_COST_LIMIT || '0.10',
        PRIMARY_MODEL: process.env.PRIMARY_MODEL,
        FALLBACK_MODELS: process.env.FALLBACK_MODELS,
        MAX_TOKENS: process.env.MAX_TOKENS,
        TEMPERATURE: process.env.TEMPERATURE,
        NODE_ENV: process.env.NODE_ENV,
        ENABLE_ADMIN: process.env.ENABLE_ADMIN,
      };
      
      const prompts = loadPrompts();
      
      reply.type('text/html').send(getEnhancedAdminHTML(config, prompts, {
        type: 'success',
        text: 'Configuration updated successfully!'
      }));
    } catch (error) {
      console.error('Error updating config:', error);
      reply.status(500).send('Failed to update configuration');
    }
  });
  
  // Handle model configuration
  server.post('/admin/models', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) return;
    
    const body = request.body as any;
    const envPath = path.join(__dirname, '../.env');
    
    try {
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      
      const updates: Record<string, string> = {};
      
      if (body.primary_model) updates.PRIMARY_MODEL = body.primary_model;
      if (body.fallback_models) updates.FALLBACK_MODELS = body.fallback_models;
      if (body.max_tokens) updates.MAX_TOKENS = body.max_tokens;
      if (body.temperature) updates.TEMPERATURE = body.temperature;
      
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
      
      reply.redirect('/admin');
    } catch (error) {
      console.error('Error updating models:', error);
      reply.status(500).send('Failed to update model configuration');
    }
  });
  
  // Handle prompt updates
  server.post('/admin/prompt/:id', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) return;
    
    const { id } = request.params as { id: string };
    const body = request.body as any;
    
    try {
      const prompts = loadPrompts();
      const promptIndex = prompts.findIndex(p => p.id === id);
      
      if (promptIndex >= 0) {
        prompts[promptIndex].template = body.template;
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
    if (!checkAdminAuth(request, reply)) return;
    
    const { prompt, model } = request.body as any;
    
    // Mock test for now - would connect to actual LLM service
    return {
      success: true,
      model: model || 'mock',
      prompt: prompt,
      response: {
        text: `Mock response for: "${prompt}"`,
        tokens: { input: 45, output: 25 },
        latency: 234,
        cost: 0.002
      },
      timestamp: new Date().toISOString()
    };
  });
  
  // Admin metrics endpoint (JSON)
  server.get('/admin/metrics', async (request, reply) => {
    if (!checkAdminAuth(request, reply)) return;
    
    return {
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        port: process.env.PORT || 8002,
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
        url: process.env.SUPABASE_URL || 'Not configured',
      }
    };
  });
}