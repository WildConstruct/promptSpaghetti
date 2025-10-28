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
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
      ? '***' + process.env.OPENAI_API_KEY.slice(-8)
      : '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
      ? '***' + process.env.OPENROUTER_API_KEY.slice(-8)
      : '',
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
        <button class="tab active" onclick="switchTab(event, 'config')">⚙️ Configuration</button>
        <button class="tab" onclick="switchTab(event, 'models')">🤖 Models</button>
        <button class="tab" onclick="switchTab(event, 'prompts')">📝 Prompts</button>
        <button class="tab" onclick="switchTab(event, 'test')">🧪 Test</button>
        <button class="tab" onclick="switchTab(event, 'theme')">🎨 Theme Customizer</button>
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
                ${AVAILABLE_MODELS.map(
                  model => `
                    <div class="model-card ${model.id === config.PRIMARY_MODEL ? 'selected' : ''}" onclick="selectModel('${model.id}')">
                        <div class="model-name">${model.name}</div>
                        <div class="model-info">Provider: ${model.provider}</div>
                        <div class="model-info">Cost: ${model.cost}</div>
                    </div>
                `
                ).join('')}
            </div>
            
            <form method="POST" action="/api/admin-models" style="margin-top: 20px;">
                <input type="hidden" name="session" value="${session}">
                <input type="hidden" id="selected_model" name="primary_model" value="${config.PRIMARY_MODEL}">
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
        
        ${DEFAULT_PROMPTS.map(
          prompt => `
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
        `
        ).join('')}
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

    <div id="theme" class="tab-content">
        <h2>🎨 Theme Customizer</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 350px; gap: 20px; margin-bottom: 20px;">
            <div>
                <div class="section">
                    <h3>🖼️ Canvas & Background</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Canvas Background</label>
                            <input type="color" id="color_canvas_bg" value="#0f172a" onchange="updateColor('canvas_bg', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Main editor background</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Grid/Dot Pattern</label>
                            <input type="color" id="color_canvas_grid" value="#1e293b" onchange="updateColor('canvas_grid', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Canvas grid dots</small>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>📦 Node Appearance</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Node Background</label>
                            <input type="color" id="color_node_bg" value="#1e293b" onchange="updateColor('node_bg', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Default node color</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Node Border</label>
                            <input type="color" id="color_node_border" value="#334155" onchange="updateColor('node_border', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Node outline</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Selected Node</label>
                            <input type="color" id="color_node_selected" value="#4f46e5" onchange="updateColor('node_selected', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Selected/active border</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Node Hover</label>
                            <input type="color" id="color_node_hover" value="#475569" onchange="updateColor('node_hover', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Mouse hover border</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Node Text</label>
                            <input type="color" id="color_node_text" value="#e2e8f0" onchange="updateColor('node_text', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Text inside nodes</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Node Label</label>
                            <input type="color" id="color_node_label" value="#94a3b8" onchange="updateColor('node_label', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Node type labels</small>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>🔗 Connections & Edges</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Edge Color</label>
                            <input type="color" id="color_edge" value="#475569" onchange="updateColor('edge', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Connection lines</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Active Edge</label>
                            <input type="color" id="color_edge_active" value="#818cf8" onchange="updateColor('edge_active', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Animated/active flow</small>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>🎯 UI Elements</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Primary Action</label>
                            <input type="color" id="color_primary" value="#818cf8" onchange="updateColor('primary', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Buttons, links</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Secondary Action</label>
                            <input type="color" id="color_secondary" value="#60a5fa" onchange="updateColor('secondary', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Secondary buttons</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Success/Valid</label>
                            <input type="color" id="color_success" value="#10b981" onchange="updateColor('success', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Valid connections</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Error/Invalid</label>
                            <input type="color" id="color_error" value="#ef4444" onchange="updateColor('error', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Errors, warnings</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Panel Background</label>
                            <input type="color" id="color_panel_bg" value="#1e293b" onchange="updateColor('panel_bg', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Side panels, modals</small>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #94a3b8;">Input Background</label>
                            <input type="color" id="color_input_bg" value="#0f172a" onchange="updateColor('input_bg', this.value)">
                            <small style="display: block; margin-top: 5px; color: #64748b;">Text inputs, selects</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="position: sticky; top: 20px;">
                <div class="section" style="background: #0f172a; border: 2px solid #334155;">
                    <h3>Live Preview</h3>
                    <div style="padding: 15px;">
                        <!-- Mini canvas preview -->
                        <div style="background: var(--canvas-bg, #0f172a); border: 1px solid var(--canvas-grid, #1e293b); padding: 20px; border-radius: 8px; position: relative;">
                            <div style="background: var(--node-bg, #1e293b); border: 2px solid var(--node-selected, #4f46e5); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                                <span style="color: var(--node-label, #94a3b8); font-size: 11px;">WEIGHTED CHOICE</span>
                                <div style="color: var(--node-text, #e2e8f0); margin-top: 5px;">Option A (70%)</div>
                            </div>
                            <div style="background: var(--node-bg, #1e293b); border: 2px solid var(--node-border, #334155); padding: 10px; border-radius: 6px;">
                                <span style="color: var(--node-label, #94a3b8); font-size: 11px;">OUTPUT</span>
                                <div style="color: var(--node-text, #e2e8f0); margin-top: 5px;">Result text...</div>
                            </div>
                            <svg style="position: absolute; top: 55px; left: 50%; width: 2px; height: 30px;">
                                <line x1="1" y1="0" x2="1" y2="30" stroke="var(--edge, #475569)" stroke-width="2"/>
                            </svg>
                        </div>
                        
                        <!-- UI elements preview -->
                        <div style="margin-top: 15px; padding: 10px; background: var(--panel-bg, #1e293b); border-radius: 6px;">
                            <button style="background: var(--primary, #818cf8); color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 10px;">Primary</button>
                            <button style="background: var(--secondary, #60a5fa); color: white; border: none; padding: 8px 16px; border-radius: 4px;">Secondary</button>
                            <input type="text" placeholder="Input field" style="background: var(--input-bg, #0f172a); color: var(--node-text, #e2e8f0); border: 1px solid var(--node-border, #334155); padding: 8px; border-radius: 4px; margin-top: 10px; width: 100%;">
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <button onclick="saveTheme()" style="width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: bold;">Save All Theme Settings</button>
                    <button onclick="exportCSS()" style="width: 100%; padding: 12px; background: #475569; color: white; border: none; border-radius: 6px; margin-top: 10px;">Export as CSS</button>
                    <button onclick="resetTheme()" style="width: 100%; padding: 12px; background: transparent; color: #94a3b8; border: 1px solid #475569; border-radius: 6px; margin-top: 10px;">Reset to Defaults</button>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>Typography</h3>
            <form id="typography_form">
                <div class="form-group">
                    <label for="fontFamily">Body Font Family</label>
                    <select id="fontFamily" name="fontFamily" onchange="updatePreview()" style="width: 100%;">
                        <option value="">-- Select a font --</option>
                        <optgroup label="System Fonts">
                            <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System Default</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                            <option value="'Courier New', Courier, monospace">Courier New</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Tahoma, sans-serif">Tahoma</option>
                        </optgroup>
                        <optgroup label="Web Fonts">
                            <option value="'Inter', sans-serif">Inter</option>
                            <option value="'Roboto', sans-serif">Roboto</option>
                            <option value="'Open Sans', sans-serif">Open Sans</option>
                            <option value="'Lato', sans-serif">Lato</option>
                            <option value="'Montserrat', sans-serif">Montserrat</option>
                            <option value="'Poppins', sans-serif">Poppins</option>
                            <option value="'Raleway', sans-serif">Raleway</option>
                            <option value="'Playfair Display', serif">Playfair Display</option>
                            <option value="'Merriweather', serif">Merriweather</option>
                            <option value="'Source Code Pro', monospace">Source Code Pro</option>
                        </optgroup>
                        <optgroup label="Uploaded Fonts" id="uploaded_fonts_options">
                            <!-- Uploaded fonts will be added here -->
                        </optgroup>
                    </select>
                    <small style="color: #94a3b8;">Or enter custom: <input type="text" id="fontFamilyCustom" placeholder="'CustomFont', fallback-font" style="margin-top: 5px;"></small>
                </div>
                <div class="form-group">
                    <label for="fontSize">Base Font Size</label>
                    <select id="fontSize" name="fontSize" onchange="updatePreview()">
                        <option value="14px">14px - Small</option>
                        <option value="16px" selected>16px - Default</option>
                        <option value="18px">18px - Large</option>
                        <option value="20px">20px - Extra Large</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="headingFamily">Heading Font Family</label>
                    <select id="headingFamily" name="headingFamily" onchange="updatePreview()" style="width: 100%;">
                        <option value="">-- Same as body font --</option>
                        <optgroup label="Serif Fonts (Good for headings)">
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Playfair Display', serif">Playfair Display</option>
                            <option value="'Merriweather', serif">Merriweather</option>
                            <option value="'Lora', serif">Lora</option>
                            <option value="'Crimson Text', serif">Crimson Text</option>
                        </optgroup>
                        <optgroup label="Sans-Serif Fonts">
                            <option value="'Montserrat', sans-serif">Montserrat</option>
                            <option value="'Raleway', sans-serif">Raleway</option>
                            <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                            <option value="'Oswald', sans-serif">Oswald</option>
                        </optgroup>
                        <optgroup label="Uploaded Fonts" id="uploaded_heading_fonts_options">
                            <!-- Uploaded fonts will be added here -->
                        </optgroup>
                    </select>
                </div>
                <div class="form-group">
                    <label for="lineHeight">Line Height</label>
                    <select id="lineHeight" name="lineHeight" onchange="updatePreview()">
                        <option value="1.4">1.4 - Compact</option>
                        <option value="1.6" selected>1.6 - Default</option>
                        <option value="1.8">1.8 - Relaxed</option>
                        <option value="2.0">2.0 - Spacious</option>
                    </select>
                </div>
            </form>
        </div>
        
        <div class="section">
            <h3>Branding</h3>
            <form id="branding_form">
                <div class="form-group">
                    <label for="brandingText">Brand Name</label>
                    <input type="text" id="brandingText" name="brandingText" placeholder="Your Brand Name">
                </div>
                <div class="form-group">
                    <label for="logoUrl">Logo URL</label>
                    <input type="text" id="logoUrl" name="logoUrl" placeholder="/logo.png">
                </div>
            </form>
        </div>
        
        <div class="section">
            <h3>Font Management</h3>
            <div class="info-box">
                Upload custom web fonts to use in your theme
            </div>
            <form id="font_upload_form" enctype="multipart/form-data">
                <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #495057;">Font File Guide</h4>
                    <p style="margin: 5px 0; font-size: 14px; color: #6c757d;">
                        <strong>What to upload:</strong>
                    </p>
                    <ul style="margin: 5px 0 10px 20px; font-size: 14px; color: #6c757d;">
                        <li><strong>.woff2</strong> - Best for web, smallest file size (recommended)</li>
                        <li><strong>.woff</strong> - Good web support, slightly larger</li>
                        <li><strong>.ttf/.otf</strong> - Desktop fonts, will be converted for web use</li>
                    </ul>
                    <p style="margin: 5px 0; font-size: 14px; color: #6c757d;">
                        <strong>Multiple font weights:</strong> Upload each weight separately (Regular, Bold, Italic, etc.)
                    </p>
                    <p style="margin: 5px 0; font-size: 14px; color: #6c757d;">
                        <strong>Tip:</strong> If you see multiple files, prioritize .woff2 for best performance.
                    </p>
                </div>
                <div class="form-group">
                    <label for="font_file">Select Font Files (multiple allowed)</label>
                    <input type="file" id="font_file" name="font_file" accept=".woff,.woff2,.ttf,.otf" multiple>
                    <small style="display: block; margin: 5px 0; color: #6c757d;">Hold Ctrl/Cmd to select multiple files</small>
                </div>
                <button type="button" onclick="uploadFonts()">Upload Font(s)</button>
            </form>
            <div id="uploaded_fonts" style="margin-top: 20px;">
                <!-- Uploaded fonts list will appear here -->
            </div>
        </div>
        
        <div class="section">
            <h3>Live Preview</h3>
            <div id="theme_preview" style="padding: 20px; border: 2px solid #334155; border-radius: 8px; background: var(--preview-bg, #1e293b);">
                <h1 style="color: var(--preview-primary, #818cf8); font-family: var(--preview-heading-family, Georgia, serif);">Preview Heading</h1>
                <p style="color: var(--preview-text, #cbd5e1); font-family: var(--preview-font-family, Inter, sans-serif); font-size: var(--preview-font-size, 16px); line-height: var(--preview-line-height, 1.6);">
                    This is a preview of your theme settings. Colors, typography, and branding will be reflected here in real-time as you make changes.
                </p>
                <button style="background: var(--preview-primary, #667eea); color: white; border: none; padding: 10px 20px; border-radius: 6px;">Sample Button</button>
                <a href="#" style="color: var(--preview-secondary, #60a5fa); text-decoration: underline;">Sample Link</a>
            </div>
        </div>
    </div>

    <script>
        function switchTab(event, tabName) {
            // Prevent default button behavior
            if (event) {
                event.preventDefault();
            }
            
            var contents = document.querySelectorAll('.tab-content');
            for (var i = 0; i < contents.length; i++) {
                contents[i].classList.remove('active');
            }
            var tabs = document.querySelectorAll('.tab');
            for (var j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('active');
            }
            
            document.getElementById(tabName).classList.add('active');
            if (event && event.target) {
                event.target.classList.add('active');
            }
            
            // Load theme status when switching to theme tab
            if (tabName === 'theme') {
                loadThemeStatus();
                loadUploadedFonts();
            }
        }
        
        let currentTheme = {};
        
        async function loadThemeStatus() {
            try {
                const response = await fetch('/api/admin/theme');
                const theme = await response.json();
                
                // Merge with defaults
                currentTheme = {
                    colors: Object.assign({
                        canvas_bg: '#0f172a',
                        canvas_grid: '#1e293b',
                        node_bg: '#1e293b',
                        node_border: '#334155',
                        node_selected: '#4f46e5',
                        node_hover: '#475569',
                        node_text: '#e2e8f0',
                        node_label: '#94a3b8',
                        edge: '#475569',
                        edge_active: '#818cf8',
                        primary: '#818cf8',
                        secondary: '#60a5fa',
                        success: '#10b981',
                        error: '#ef4444',
                        panel_bg: '#1e293b',
                        input_bg: '#0f172a'
                    }, theme.colors || {}),
                    typography: Object.assign({
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        headingFamily: 'inherit',
                        lineHeight: '1.6'
                    }, theme.typography || {})
                };
                
                // Load colors into inputs
                if (currentTheme.colors) {
                    for (var name in currentTheme.colors) {
                        if (currentTheme.colors.hasOwnProperty(name)) {
                            var input = document.getElementById('color_' + name);
                            if (input) {
                                input.value = currentTheme.colors[name];
                            }
                        }
                    }
                }
                
                // Load typography settings
                if (currentTheme.typography) {
                    if (currentTheme.typography.fontFamily) {
                        const fontSelect = document.getElementById('fontFamily');
                        if (fontSelect) fontSelect.value = currentTheme.typography.fontFamily;
                    }
                    if (currentTheme.typography.fontSize) {
                        const sizeSelect = document.getElementById('fontSize');
                        if (sizeSelect) sizeSelect.value = currentTheme.typography.fontSize;
                    }
                    if (currentTheme.typography.headingFamily) {
                        const headingSelect = document.getElementById('headingFamily');
                        if (headingSelect) headingSelect.value = currentTheme.typography.headingFamily;
                    }
                    if (currentTheme.typography.lineHeight) {
                        const lineSelect = document.getElementById('lineHeight');
                        if (lineSelect) lineSelect.value = currentTheme.typography.lineHeight;
                    }
                }
                
                // Load branding settings
                if (theme.branding) {
                    if (theme.branding.defaultText) document.getElementById('brandingText').value = theme.branding.defaultText;
                    if (theme.branding.logoUrl) document.getElementById('logoUrl').value = theme.branding.logoUrl;
                }
                
                // Update preview
                updatePreview();
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        }
        
        function updateColor(name, value) {
            if (!currentTheme.colors) currentTheme.colors = {};
            currentTheme.colors[name] = value;
            
            // Update CSS variable for live preview
            const varName = '--' + name.replace(/_/g, '-');
            document.documentElement.style.setProperty(varName, value);
            
            updatePreview();
        }
        
        function updatePreview() {
            // Apply all current theme colors to CSS variables
            if (currentTheme.colors) {
                for (var key in currentTheme.colors) {
                    if (currentTheme.colors.hasOwnProperty(key)) {
                        var varName = '--' + key.replace(/_/g, '-');
                        document.documentElement.style.setProperty(varName, currentTheme.colors[key]);
                    }
                }
            }
        }
        
        async function saveTheme() {
            // Collect all form data
            currentTheme.typography = {
                fontFamily: document.getElementById('fontFamily').value,
                fontSize: document.getElementById('fontSize').value,
                headingFamily: document.getElementById('headingFamily').value,
                lineHeight: document.getElementById('lineHeight').value
            };
            
            currentTheme.branding = {
                defaultText: document.getElementById('brandingText').value,
                logoUrl: document.getElementById('logoUrl').value
            };
            
            try {
                const response = await fetch('/api/admin/theme', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentTheme)
                });
                
                if (response.ok) {
                    alert('Theme saved successfully!');
                    loadThemeStatus();
                } else {
                    alert('Failed to save theme');
                }
            } catch (error) {
                alert('Error saving theme: ' + error.message);
            }
        }
        
        async function uploadFonts() {
            const fileInput = document.getElementById('font_file');
            const files = fileInput.files;
            
            if (!files || files.length === 0) {
                alert('Please select at least one font file');
                return;
            }
            
            let successCount = 0;
            let failCount = 0;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const response = await fetch('/api/admin/fonts', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (response.ok) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (error) {
                    failCount++;
                    console.error('Error uploading font:', file.name, error);
                }
            }
            
            if (successCount > 0) {
                var message = 'Successfully uploaded ' + successCount + ' font(s)';
                if (failCount > 0) {
                    message += ', ' + failCount + ' failed';
                }
                alert(message);
                fileInput.value = '';
                loadUploadedFonts();
            } else {
                alert('Failed to upload fonts');
            }
        }
        
        // Keep old function for backward compatibility
        async function uploadFont() {
            uploadFonts();
        }
        
        async function loadUploadedFonts() {
            const fontsDiv = document.getElementById('uploaded_fonts');
            const bodyFontOptions = document.getElementById('uploaded_fonts_options');
            const headingFontOptions = document.getElementById('uploaded_heading_fonts_options');
            
            try {
                const response = await fetch('/api/admin/fonts');
                const data = await response.json();
                
                if (data.fonts && data.fonts.length > 0) {
                    // Update the uploaded fonts list
                    let fontsHTML = '<h4>Uploaded Fonts:</h4><ul>';
                    for (var i = 0; i < data.fonts.length; i++) {
                        var font = data.fonts[i];
                        fontsHTML += '<li>' + font.fontFamily + ' - ' + font.filename;
                        fontsHTML += ' <button onclick="deleteFont(&quot;' + font.id + '&quot;)">Delete</button></li>';
                    }
                    fontsHTML += '</ul>';
                    fontsDiv.innerHTML = fontsHTML;
                    
                    // Update dropdown options for body fonts
                    if (bodyFontOptions) {
                        bodyFontOptions.innerHTML = '';
                        for (var j = 0; j < data.fonts.length; j++) {
                            var font = data.fonts[j];
                            var option = document.createElement('option');
                            option.value = "'" + font.fontFamily + "', sans-serif";
                            option.textContent = font.fontFamily;
                            bodyFontOptions.appendChild(option);
                        }
                    }
                    
                    // Update dropdown options for heading fonts
                    if (headingFontOptions) {
                        headingFontOptions.innerHTML = '';
                        for (var k = 0; k < data.fonts.length; k++) {
                            var font = data.fonts[k];
                            var option = document.createElement('option');
                            option.value = "'" + font.fontFamily + "', serif";
                            option.textContent = font.fontFamily;
                            headingFontOptions.appendChild(option);
                        }
                    }
                } else {
                    fontsDiv.innerHTML = '<p>No fonts uploaded yet</p>';
                    if (bodyFontOptions) bodyFontOptions.innerHTML = '';
                    if (headingFontOptions) headingFontOptions.innerHTML = '';
                }
            } catch (error) {
                fontsDiv.innerHTML = '<p>Failed to load fonts</p>';
                console.error('Error loading fonts:', error);
            }
        }
        
        async function deleteFont(fontId) {
            if (!confirm('Delete this font?')) return;
            
            try {
                const response = await fetch('/api/admin/fonts/' + fontId, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('Font deleted successfully!');
                    loadUploadedFonts();
                } else {
                    alert('Failed to delete font');
                }
            } catch (error) {
                alert('Error deleting font: ' + error.message);
            }
        }
        
        function exportCSS() {
            let css = '/* Prompt Spaghetti Theme Variables */\n:root {\n';
            
            // Add color variables
            if (currentTheme.colors) {
                css += '  /* Canvas & Background */\n';
                css += '  --canvas-bg: ' + (currentTheme.colors.canvas_bg || '#0f172a') + ';\n';
                css += '  --canvas-grid: ' + (currentTheme.colors.canvas_grid || '#1e293b') + ';\n';
                css += '\n  /* Node Appearance */\n';
                css += '  --node-bg: ' + (currentTheme.colors.node_bg || '#1e293b') + ';\n';
                css += '  --node-border: ' + (currentTheme.colors.node_border || '#334155') + ';\n';
                css += '  --node-selected: ' + (currentTheme.colors.node_selected || '#4f46e5') + ';\n';
                css += '  --node-hover: ' + (currentTheme.colors.node_hover || '#475569') + ';\n';
                css += '  --node-text: ' + (currentTheme.colors.node_text || '#e2e8f0') + ';\n';
                css += '  --node-label: ' + (currentTheme.colors.node_label || '#94a3b8') + ';\n';
                css += '\n  /* Connections */\n';
                css += '  --edge: ' + (currentTheme.colors.edge || '#475569') + ';\n';
                css += '  --edge-active: ' + (currentTheme.colors.edge_active || '#818cf8') + ';\n';
                css += '\n  /* UI Elements */\n';
                css += '  --primary: ' + (currentTheme.colors.primary || '#818cf8') + ';\n';
                css += '  --secondary: ' + (currentTheme.colors.secondary || '#60a5fa') + ';\n';
                css += '  --success: ' + (currentTheme.colors.success || '#10b981') + ';\n';
                css += '  --error: ' + (currentTheme.colors.error || '#ef4444') + ';\n';
                css += '  --panel-bg: ' + (currentTheme.colors.panel_bg || '#1e293b') + ';\n';
                css += '  --input-bg: ' + (currentTheme.colors.input_bg || '#0f172a') + ';\n';
            }
            
            // Add typography variables
            if (currentTheme.typography) {
                css += '\n  /* Typography */\n';
                css += '  --font-family: ' + (currentTheme.typography.fontFamily || 'Inter, sans-serif') + ';\n';
                css += '  --heading-family: ' + (currentTheme.typography.headingFamily || 'inherit') + ';\n';
                css += '  --font-size: ' + (currentTheme.typography.fontSize || '16px') + ';\n';
                css += '  --line-height: ' + (currentTheme.typography.lineHeight || '1.6') + ';\n';
            }
            
            css += '}\n';
            
            // Create download
            const blob = new Blob([css], { type: 'text/css' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'theme.css';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Theme exported as CSS file!');
        }
        
        function resetTheme() {
            if (!confirm('Reset all theme settings to defaults?')) return;
            
            currentTheme = {
                colors: {
                    canvas_bg: '#0f172a',
                    canvas_grid: '#1e293b',
                    node_bg: '#1e293b',
                    node_border: '#334155',
                    node_selected: '#4f46e5',
                    node_hover: '#475569',
                    node_text: '#e2e8f0',
                    node_label: '#94a3b8',
                    edge: '#475569',
                    edge_active: '#818cf8',
                    primary: '#818cf8',
                    secondary: '#60a5fa',
                    success: '#10b981',
                    error: '#ef4444',
                    panel_bg: '#1e293b',
                    input_bg: '#0f172a'
                },
                typography: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    headingFamily: 'inherit',
                    lineHeight: '1.6'
                }
            };
            
            // Update all color inputs
            for (var key in currentTheme.colors) {
                if (currentTheme.colors.hasOwnProperty(key)) {
                    var input = document.getElementById('color_' + key);
                    if (input) {
                        input.value = currentTheme.colors[key];
                    }
                }
            }
            
            updatePreview();
            alert('Theme reset to defaults!');
        }
        
        // Add input listeners for live preview
        document.addEventListener('DOMContentLoaded', function() {
            // Load uploaded fonts when page loads
            loadUploadedFonts();
            
            // Load theme status when on theme tab
            if (document.getElementById('theme').classList.contains('active')) {
                loadThemeStatus();
            }
            
            // Add input listeners for live preview
            ['fontFamily', 'fontSize', 'headingFamily', 'lineHeight'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', updatePreview);
                }
            });
        });
        
        function selectModel(modelId) {
            const modelInput = document.getElementById('selected_model');
            if (modelInput) {
                modelInput.value = modelId;
            }
            document.querySelectorAll('.model-card').forEach(card => {
                card.classList.remove('selected');
            });
            if (event && event.currentTarget) {
                event.currentTarget.classList.add('selected');
            }
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
                        session: ${JSON.stringify(session)}
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
        env_password_length: process.env.ADMIN_PASSWORD
          ? process.env.ADMIN_PASSWORD.length
          : 0,
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
        res
          .status(200)
          .send(
            getAdminHTML(false) + '<div class="error">Invalid credentials</div>'
          );
        return;
      }
    }
  }

  // Show login page
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(getAdminHTML(false));
}
