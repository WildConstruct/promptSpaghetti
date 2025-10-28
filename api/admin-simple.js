export default function handler(req, res) {
  const session = req.body?.session || req.query?.session || 'test';

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel - Simplified</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
        .header { background: #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .tab { background: #334155; color: #cbd5e1; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px; }
        .tab.active { background: #4f46e5; color: white; }
        .tab-content { display: none; background: #1e293b; border-radius: 8px; padding: 20px; }
        .tab-content.active { display: block; }
        .section { background: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        h2 { color: #f1f5f9; margin-top: 0; }
        h3 { color: #cbd5e1; margin-top: 0; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #94a3b8; font-size: 14px; }
        input[type="text"], input[type="color"], textarea, select { width: 100%; padding: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #e2e8f0; }
        button { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        button:hover { background: #4338ca; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛠️ Admin Panel</h1>
        <form method="POST" action="/api/admin-logout" style="display: inline;">
            <button type="submit">Logout</button>
        </form>
    </div>

    <div class="tabs">
        <button class="tab active" id="tab-config" onclick="showTab('config')">Configuration</button>
        <button class="tab" id="tab-models" onclick="showTab('models')">Models</button>
        <button class="tab" id="tab-theme" onclick="showTab('theme')">Theme Customizer</button>
    </div>

    <div id="config" class="tab-content active">
        <h2>Configuration</h2>
        <div class="section">
            <h3>API Keys</h3>
            <p>Configure your API keys here.</p>
        </div>
    </div>

    <div id="models" class="tab-content">
        <h2>Model Settings</h2>
        <div class="section">
            <h3>Primary Model</h3>
            <p>Select your primary model.</p>
        </div>
    </div>

    <div id="theme" class="tab-content">
        <h2>Theme Customizer</h2>
        <div class="section">
            <h3>Colors</h3>
            <div class="form-group">
                <label>Primary Color</label>
                <input type="color" id="primary_color" value="#4f46e5" onchange="updateColor('primary', this.value)">
            </div>
            <div class="form-group">
                <label>Background Color</label>
                <input type="color" id="bg_color" value="#0f172a" onchange="updateColor('background', this.value)">
            </div>
            <button onclick="saveTheme()">Save Theme</button>
        </div>
        
        <div class="section">
            <h3>Typography</h3>
            <div class="form-group">
                <label>Font Family</label>
                <select id="fontFamily">
                    <option value="system-ui, -apple-system, sans-serif">System Font</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                </select>
            </div>
        </div>
        
        <div class="section">
            <h3>Upload Fonts</h3>
            <input type="file" id="font_file" accept=".woff,.woff2,.ttf,.otf" multiple>
            <button onclick="uploadFonts()">Upload</button>
            <div id="uploaded_fonts"></div>
        </div>
    </div>

    <script type="text/javascript">
        // Simple tab switching
        function showTab(tabName) {
            console.log('Showing tab:', tabName);
            
            // Hide all content
            var contents = document.getElementsByClassName('tab-content');
            for (var i = 0; i < contents.length; i++) {
                contents[i].className = 'tab-content';
            }
            
            // Remove active from tabs
            var tabs = document.getElementsByClassName('tab');
            for (var j = 0; j < tabs.length; j++) {
                tabs[j].className = 'tab';
            }
            
            // Show selected
            document.getElementById(tabName).className = 'tab-content active';
            document.getElementById('tab-' + tabName).className = 'tab active';
        }
        
        // Theme functions
        var currentTheme = {};
        
        function updateColor(name, value) {
            if (!currentTheme.colors) currentTheme.colors = {};
            currentTheme.colors[name] = value;
            document.documentElement.style.setProperty('--' + name, value);
        }
        
        function saveTheme() {
            console.log('Saving theme:', currentTheme);
            fetch('/api/admin/theme', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(currentTheme)
            }).then(function(response) {
                if (response.ok) {
                    alert('Theme saved!');
                } else {
                    alert('Failed to save theme');
                }
            }).catch(function(error) {
                alert('Error: ' + error.message);
            });
        }
        
        function uploadFonts() {
            var fileInput = document.getElementById('font_file');
            var files = fileInput.files;
            
            if (!files || files.length === 0) {
                alert('Please select files');
                return;
            }
            
            var uploaded = 0;
            for (var i = 0; i < files.length; i++) {
                var formData = new FormData();
                formData.append('file', files[i]);
                
                fetch('/api/admin/fonts', {
                    method: 'POST',
                    body: formData
                }).then(function(response) {
                    if (response.ok) {
                        uploaded++;
                        if (uploaded === files.length) {
                            alert('All fonts uploaded!');
                            loadFonts();
                        }
                    }
                }).catch(function(error) {
                    console.error('Upload error:', error);
                });
            }
        }
        
        function loadFonts() {
            fetch('/api/admin/fonts')
                .then(function(response) { return response.json(); })
                .then(function(data) {
                    var div = document.getElementById('uploaded_fonts');
                    if (data.fonts && data.fonts.length > 0) {
                        var html = '<h4>Uploaded Fonts:</h4><ul>';
                        for (var i = 0; i < data.fonts.length; i++) {
                            html += '<li>' + data.fonts[i].fontFamily + '</li>';
                        }
                        html += '</ul>';
                        div.innerHTML = html;
                    }
                })
                .catch(function(error) {
                    console.error('Load fonts error:', error);
                });
        }
        
        // Load fonts on start
        loadFonts();
    </script>
</body>
</html>
  `);
}
