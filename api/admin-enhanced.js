/**
 * Enhanced Admin Panel for Vercel
 * Includes authentication, model selection, and prompt management
 */

// Store session tokens (in production, use a database)
const sessions = new Map();

// Default prompt templates
const DEFAULT_PROMPTS = [
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
  { id: 'qwen/qwen-262k:free', name: 'Qwen 262K (Free)', provider: 'Qwen', cost: 'Free' }
];

function getAdminHTML(authenticated = false, session = null) {
  if (!authenticated) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - PromptScape</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: #1e293b;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            width: 100%;
            max-width: 400px;
            border: 1px solid #334155;
        }
        h1 {
            color: #e2e8f0;
            margin-bottom: 30px;
            text-align: center;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #94a3b8;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #475569;
            border-radius: 6px;
            font-size: 16px;
            background: #0f172a;
            color: #e2e8f0;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        button {
            width: 100%;
            background: #667eea;
            color: white;
            border: none;
            padding: 14px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a67d8;
        }
        .error {
            background: #7f1d1d;
            color: #fca5a5;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #991b1b;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>🔐 Admin Panel Login</h1>
        <form method="POST" action="/api/admin-enhanced">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>`;
  }

  // Authenticated admin panel
  const config = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-8) : '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '***' + process.env.OPENROUTER_API_KEY.slice(-8) : '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    PRIMARY_MODEL: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
    MAX_TOKENS: process.env.MAX_TOKENS || '200',
    TEMPERATURE: process.env.TEMPERATURE || '0.7'
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - PromptScape</title>
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
            padding: 20px;
        }
        .header {
            background: #1e293b;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            border: 1px solid #334155;
        }
        h1 {
            color: #818cf8;
        }
        .logout {
            background: #dc2626;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .logout:hover {
            background: #b91c1c;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            background: #1e293b;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            border: 1px solid #334155;
        }
        .tab {
            padding: 10px 20px;
            background: #334155;
            color: #94a3b8;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .tab:hover {
            background: #475569;
            color: #cbd5e1;
        }
        .tab.active {
            background: #667eea;
            color: white;
        }
        .tab-content {
            display: none;
            background: #1e293b;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            border: 1px solid #334155;
        }
        .tab-content.active {
            display: block;
        }
        .section {
            margin-bottom: 30px;
        }
        h2 {
            color: #cbd5e1;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #334155;
        }
        h3 {
            color: #94a3b8;
            margin-bottom: 15px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #94a3b8;
        }
        input, select, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #475569;
            border-radius: 6px;
            font-size: 14px;
            background: #0f172a;
            color: #e2e8f0;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        textarea {
            min-height: 120px;
            resize: vertical;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a67d8;
        }
        .model-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .model-card {
            border: 2px solid #334155;
            background: #0f172a;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .model-card:hover {
            border-color: #475569;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .model-card.selected {
            border-color: #667eea;
            background: #1e293b;
        }
        .model-name {
            font-weight: 600;
            margin-bottom: 5px;
            color: #e2e8f0;
        }
        .model-info {
            font-size: 12px;
            color: #64748b;
        }
        .prompt-card {
            border: 1px solid #334155;
            background: #0f172a;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .prompt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .prompt-title {
            font-weight: 600;
            font-size: 18px;
            color: #e2e8f0;
        }
        .prompt-category {
            background: #334155;
            color: #94a3b8;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
        }
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 5px;
        }
        .status-indicator.configured {
            background: #10b981;
        }
        .status-indicator.not-configured {
            background: #ef4444;
        }
        .info-box {
            background: #1e293b;
            color: #60a5fa;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #334155;
        }
        p {
            color: #cbd5e1;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 PromptScape Admin Panel</h1>
        <form method="POST" action="/api/admin-logout" style="display: inline;">
            <input type="hidden" name="session" value="${session}">
            <button type="submit" class="logout">Logout</button>
        </form>
    </div>

    <div class="tabs">
        <button class="tab active" onclick="switchTab('config')">⚙️ Configuration</button>
        <button class="tab" onclick="switchTab('models')">🤖 Models</button>
        <button class="tab" onclick="switchTab('prompts')">📝 Prompts</button>
        <button class="tab" onclick="switchTab('test')">🧪 Test</button>
    </div>

    <div id="config" class="tab-content active">
        <h2>API Configuration</h2>
        
        <div class="info-box">
            <strong>ℹ️ Note:</strong> In Vercel, environment variables should be set in your Vercel dashboard under Project Settings → Environment Variables.
        </div>

        <div class="section">
            <h3>Current Configuration Status</h3>
            <p><span class="status-indicator ${config.OPENAI_API_KEY ? 'configured' : 'not-configured'}"></span> OpenAI API Key: ${config.OPENAI_API_KEY || 'Not configured'}</p>
            <p><span class="status-indicator ${config.OPENROUTER_API_KEY ? 'configured' : 'not-configured'}"></span> OpenRouter API Key: ${config.OPENROUTER_API_KEY || 'Not configured'}</p>
            <p><span class="status-indicator ${config.SUPABASE_URL ? 'configured' : 'not-configured'}"></span> Supabase URL: ${config.SUPABASE_URL || 'Not configured'}</p>
        </div>

        <div class="section">
            <h3>Update Configuration</h3>
            <form method="POST" action="/api/admin-config">
                <input type="hidden" name="session" value="${session}">
                <div class="form-group">
                    <label for="openai_key">OpenAI API Key</label>
                    <input type="password" id="openai_key" name="openai_key" placeholder="sk-...">
                </div>
                <div class="form-group">
                    <label for="openrouter_key">OpenRouter API Key</label>
                    <input type="password" id="openrouter_key" name="openrouter_key" placeholder="sk-or-...">
                </div>
                <div class="form-group">
                    <label for="supabase_url">Supabase URL</label>
                    <input type="text" id="supabase_url" name="supabase_url" placeholder="https://xxx.supabase.co" value="${config.SUPABASE_URL}">
                </div>
                <div class="form-group">
                    <label for="supabase_key">Supabase Anon Key</label>
                    <input type="password" id="supabase_key" name="supabase_key" placeholder="eyJ...">
                </div>
                <button type="submit">Save Configuration</button>
            </form>
        </div>
    </div>

    <div id="models" class="tab-content">
        <h2>Model Selection</h2>
        
        <div class="section">
            <h3>Primary Model</h3>
            <p>Current: <strong>${config.PRIMARY_MODEL}</strong></p>
            
            <div class="model-grid">
                ${AVAILABLE_MODELS.map(model => `
                    <div class="model-card ${model.id === config.PRIMARY_MODEL ? 'selected' : ''}" onclick="selectModel('${model.id}')">
                        <div class="model-name">${model.name}</div>
                        <div class="model-info">Provider: ${model.provider}</div>
                        <div class="model-info">Cost: ${model.cost}</div>
                    </div>
                `).join('')}
            </div>
            
            <form method="POST" action="/api/admin-models" style="margin-top: 20px;">
                <input type="hidden" name="session" value="${session}">
                <input type="hidden" id="selected_model" name="model" value="${config.PRIMARY_MODEL}">
                <div class="form-group">
                    <label for="max_tokens">Max Tokens</label>
                    <input type="number" id="max_tokens" name="max_tokens" value="${config.MAX_TOKENS}">
                </div>
                <div class="form-group">
                    <label for="temperature">Temperature</label>
                    <input type="number" id="temperature" name="temperature" step="0.1" min="0" max="2" value="${config.TEMPERATURE}">
                </div>
                <button type="submit">Save Model Settings</button>
            </form>
        </div>
    </div>

    <div id="prompts" class="tab-content">
        <h2>Prompt Templates</h2>
        
        ${DEFAULT_PROMPTS.map(prompt => `
            <div class="prompt-card">
                <div class="prompt-header">
                    <div class="prompt-title">${prompt.name}</div>
                    <div class="prompt-category">${prompt.category}</div>
                </div>
                <p>${prompt.description}</p>
                <form method="POST" action="/api/admin-prompts">
                    <input type="hidden" name="session" value="${session}">
                    <input type="hidden" name="prompt_id" value="${prompt.id}">
                    <div class="form-group">
                        <label>Template</label>
                        <textarea name="template">${prompt.template}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Variables: ${prompt.variables.join(', ')}</label>
                    </div>
                    <button type="submit">Update Template</button>
                </form>
            </div>
        `).join('')}
    </div>

    <div id="test" class="tab-content">
        <h2>Test LLM Connection</h2>
        
        <div class="section">
            <form onsubmit="testLLM(event); return false;">
                <div class="form-group">
                    <label for="test_prompt">Test Prompt</label>
                    <textarea id="test_prompt" name="test_prompt">Hello! Can you confirm you're working?</textarea>
                </div>
                <button type="submit">Send Test Request</button>
            </form>
            
            <div id="test_result" style="margin-top: 20px;"></div>
        </div>
    </div>

    <script>
        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }
        
        function selectModel(modelId) {
            document.getElementById('selected_model').value = modelId;
            document.querySelectorAll('.model-card').forEach(card => {
                card.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
        }
        
        async function testLLM(event) {
            event.preventDefault();
            const resultDiv = document.getElementById('test_result');
            const prompt = document.getElementById('test_prompt').value;
            
            resultDiv.innerHTML = '<p>Testing...</p>';
            
            try {
                const response = await fetch('/api/admin-test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: prompt,
                        session: '${session}'
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    resultDiv.innerHTML = '<div style="background: #065f46; padding: 15px; border-radius: 6px; border: 1px solid #10b981; color: #6ee7b7;"><strong>Success!</strong><br>' + data.response + '</div>';
                } else {
                    resultDiv.innerHTML = '<div style="background: #7f1d1d; padding: 15px; border-radius: 6px; border: 1px solid #991b1b; color: #fca5a5;"><strong>Error:</strong> ' + data.error + '</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div style="background: #7f1d1d; padding: 15px; border-radius: 6px; border: 1px solid #991b1b; color: #fca5a5;"><strong>Error:</strong> ' + error.message + '</div>';
            }
        }
    </script>
</body>
</html>`;
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse body for POST requests
  if (req.method === 'POST' && req.body) {
    const { username, password, session } = req.body;
    
    // Check if already authenticated
    if (session && sessions.has(session)) {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(getAdminHTML(true, session));
      return;
    }
    
    // Handle login
    if (username && password) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      // Log for debugging (will show in Vercel function logs)
      console.log('Login attempt:', {
        username,
        password_length: password.length,
        env_password_set: !!process.env.ADMIN_PASSWORD,
        env_password_length: process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.length : 0,
        passwords_match: password === adminPassword
      });
      
      if (username === 'admin' && password === adminPassword) {
        // Generate session token
        const sessionToken = Math.random().toString(36).substring(2);
        sessions.set(sessionToken, { username, timestamp: Date.now() });
        
        // Clean old sessions (older than 1 hour)
        const oneHour = 60 * 60 * 1000;
        sessions.forEach((value, key) => {
          if (Date.now() - value.timestamp > oneHour) {
            sessions.delete(key);
          }
        });
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(getAdminHTML(true, sessionToken));
        return;
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(getAdminHTML(false) + '<div class="error">Invalid credentials</div>');
        return;
      }
    }
  }

  // Show login page
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(getAdminHTML(false));
}