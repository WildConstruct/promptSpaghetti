export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Test Tab Switching</title>
    <style>
        .tab { padding: 10px; background: #333; color: white; margin: 5px; cursor: pointer; display: inline-block; }
        .tab.active { background: #666; }
        .tab-content { display: none; padding: 20px; border: 1px solid #333; }
        .tab-content.active { display: block; }
    </style>
</head>
<body>
    <h1>Tab Test</h1>
    
    <div>
        <button class="tab active" onclick="switchTab(event, 'config')">Configuration</button>
        <button class="tab" onclick="switchTab(event, 'models')">Models</button>
        <button class="tab" onclick="switchTab(event, 'theme')">Theme</button>
    </div>
    
    <div id="config" class="tab-content active">
        <h2>Configuration Content</h2>
        <p>This is the configuration tab.</p>
    </div>
    
    <div id="models" class="tab-content">
        <h2>Models Content</h2>
        <p>This is the models tab.</p>
    </div>
    
    <div id="theme" class="tab-content">
        <h2>Theme Content</h2>
        <p>This is the theme tab.</p>
    </div>
    
    <script>
        function switchTab(event, tabName) {
            console.log('switchTab called with:', tabName);
            
            // Prevent default
            if (event) {
                event.preventDefault();
            }
            
            // Hide all tabs
            var contents = document.getElementsByClassName('tab-content');
            for (var i = 0; i < contents.length; i++) {
                contents[i].className = 'tab-content';
            }
            
            // Remove active from all buttons
            var tabs = document.getElementsByClassName('tab');
            for (var j = 0; j < tabs.length; j++) {
                tabs[j].className = 'tab';
            }
            
            // Show selected tab
            document.getElementById(tabName).className = 'tab-content active';
            
            // Mark button as active
            if (event && event.target) {
                event.target.className = 'tab active';
            }
        }
        
        console.log('Script loaded successfully');
    </script>
</body>
</html>
  `);
}
