/**
 * Vercel API function for admin panel
 * Serves the admin HTML interface
 */

export default function handler(req, res) {
  // Redirect to enhanced admin panel
  res.writeHead(302, { Location: '/api/admin-enhanced' });
  res.end();
  return;
  
  // Basic admin HTML (simplified version) - keeping for reference
  const adminHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PromptScape Admin</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f7f7f7;
            border-radius: 8px;
        }
        .config-item {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a67d8;
        }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 PromptScape Admin Panel</h1>
        
        <div class="info">
            <strong>ℹ️ Vercel Deployment</strong><br>
            This admin panel is running on Vercel Functions. API keys should be configured in your Vercel environment variables.
        </div>

        <div class="section">
            <h2>🔑 API Configuration</h2>
            <form id="configForm">
                <div class="config-item">
                    <label for="openai_key">OpenAI API Key</label>
                    <input type="password" id="openai_key" name="openai_key" placeholder="sk-...">
                </div>
                
                <div class="config-item">
                    <label for="openrouter_key">OpenRouter API Key</label>
                    <input type="password" id="openrouter_key" name="openrouter_key" placeholder="sk-or-...">
                </div>
                
                <div class="config-item">
                    <label for="supabase_url">Supabase URL</label>
                    <input type="text" id="supabase_url" name="supabase_url" placeholder="https://xxx.supabase.co">
                </div>
                
                <div class="config-item">
                    <label for="supabase_key">Supabase Anon Key</label>
                    <input type="password" id="supabase_key" name="supabase_key" placeholder="eyJ...">
                </div>
                
                <button type="submit">Save Configuration</button>
            </form>
        </div>

        <div class="section">
            <h2>📊 Status</h2>
            <div id="status">
                <p>API Endpoint: ${req.headers.host || 'Unknown'}</p>
                <p>Method: ${req.method}</p>
                <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
            </div>
        </div>

        <div class="section">
            <h2>🧪 Test API</h2>
            <button onclick="testAPI()">Test Preview Endpoint</button>
            <div id="testResult"></div>
        </div>
    </div>

    <script>
        document.getElementById('configForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const config = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/api/admin-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                
                if (response.ok) {
                    alert('Configuration saved! (Note: In Vercel, set these as environment variables)');
                } else {
                    alert('Failed to save configuration');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });

        async function testAPI() {
            const resultDiv = document.getElementById('testResult');
            resultDiv.innerHTML = '<p>Testing...</p>';
            
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(adminHTML);
}
