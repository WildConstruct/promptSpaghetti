#!/usr/bin/env node

/**
 * Ticketing System Dashboard Server
 * 
 * Serves the Visual Ticket Dashboard with integrated Epic completion tracking
 * Access: http://localhost:8080
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { showEpicCompletion, EPIC_ANALYSIS } = require('./show-epic-completion.js');

const PORT = 8080;

// Handle HTTP requests
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle API endpoints
  if (pathname === '/api/tasks') {
    handleTasksAPI(req, res);
  } else if (pathname === '/api/epic-completion') {
    handleEpicAPI(req, res);
  } else if (pathname === '/' || pathname === '/index.html') {
    handleDashboard(req, res);
  } else {
    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// API handler for tasks
function handleTasksAPI(req, res) {
  try {
    const stateFile = path.join(__dirname, 'data/state.json');
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tasks: state.tasks || {} }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tasks: {} }));
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to load tasks' }));
  }
}

// API handler for epic completion
function handleEpicAPI(req, res) {
  try {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ epics: EPIC_ANALYSIS }));
  } catch (error) {
    console.error('Error loading epic data:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to load epic data' }));
  }
}

// Dashboard handler
function handleDashboard(req, res) {
  const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticketing System Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            padding: 20px;
            color: #e1e5e9;
        }

        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
            background: #1e1e2e;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            overflow: hidden;
            border: 1px solid #2d2d44;
        }

        .header {
            background: linear-gradient(135deg, #0f1419 0%, #1a1f29 100%);
            color: #e1e5e9;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #2d2d44;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .nav-tabs {
            display: flex;
            background: #252538;
            border-bottom: 1px solid #2d2d44;
        }

        .nav-tab {
            flex: 1;
            padding: 15px 20px;
            background: transparent;
            color: #9ca3af;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .nav-tab:hover {
            background: #2d2d44;
            color: #e1e5e9;
        }

        .nav-tab.active {
            color: #74c0fc;
            border-bottom-color: #74c0fc;
            background: #1e1e2e;
        }

        .tab-content {
            display: none;
            padding: 20px;
            min-height: 600px;
        }

        .tab-content.active {
            display: block;
        }

        /* Epic Dashboard Styles */
        .epic-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .epic-stat {
            background: #252538;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            border: 1px solid #2d2d44;
        }

        .epic-stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 8px;
        }

        .epic-stat-label {
            color: #9ca3af;
            font-size: 0.9rem;
        }

        .epic-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .epic-card {
            background: #252538;
            border-radius: 12px;
            padding: 25px;
            border: 1px solid #2d2d44;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .epic-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .epic-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #e1e5e9;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .epic-description {
            color: #9ca3af;
            font-size: 0.95rem;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .epic-progress {
            margin-bottom: 20px;
        }

        .epic-progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: #d1d5db;
            font-size: 0.9rem;
        }

        .epic-progress-bar {
            width: 100%;
            height: 10px;
            background: #374151;
            border-radius: 5px;
            overflow: hidden;
        }

        .epic-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #34d399);
            transition: width 0.5s ease-in-out;
        }

        .epic-progress-fill.critical {
            background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .epic-progress-fill.high {
            background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .epic-progress-fill.medium {
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }

        .epic-components {
            font-size: 0.85rem;
        }

        .epic-component {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            color: #9ca3af;
        }

        .epic-business-value {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #374151;
            font-size: 0.85rem;
            color: #9ca3af;
        }

        /* Loading and Error States */
        .loading {
            text-align: center;
            color: #9ca3af;
            font-size: 1.1rem;
            margin: 50px 0;
        }

        .error {
            background: #3c1f1f;
            color: #fca5a5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #7f1d1d;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .nav-tabs {
                flex-direction: column;
            }
            
            .epic-grid {
                grid-template-columns: 1fr;
            }
            
            .epic-overview {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🎯 Ticketing System Dashboard</h1>
            <p>Epic completion tracking and task management</p>
        </div>

        <div class="nav-tabs">
            <button class="nav-tab active" onclick="switchTab('epic-status')">Epic Status</button>
            <button class="nav-tab" onclick="switchTab('tasks')">Task Management</button>
        </div>

        <!-- Epic Status Tab -->
        <div id="epic-status" class="tab-content active">
            <div class="loading" id="epic-loading">Loading epic completion data...</div>
            <div id="epic-content" style="display: none;">
                <div class="epic-overview" id="epic-overview">
                    <!-- Overview stats will be populated by JavaScript -->
                </div>
                <div class="epic-grid" id="epic-grid">
                    <!-- Epic cards will be populated by JavaScript -->
                </div>
            </div>
            <div id="epic-error" class="error" style="display: none;">
                Failed to load epic data. Please check the server connection.
            </div>
        </div>

        <!-- Tasks Tab -->
        <div id="tasks" class="tab-content">
            <div class="loading" id="tasks-loading">Loading task data...</div>
            <div id="tasks-content" style="display: none;">
                <p style="color: #9ca3af; text-align: center; margin: 50px 0;">
                    Task management interface will be implemented here.
                    <br><br>
                    For now, use the CLI tools:
                    <br>
                    <code style="background: #252538; padding: 4px 8px; border-radius: 4px;">
                        node src/monitor-available-tasks.js
                    </code>
                </p>
            </div>
            <div id="tasks-error" class="error" style="display: none;">
                Failed to load task data. Please check the server connection.
            </div>
        </div>
    </div>

    <script>
        let epicData = {};

        // Tab switching functionality
        function switchTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
            
            // Load data for the active tab
            if (tabName === 'epic-status') {
                loadEpicData();
            } else if (tabName === 'tasks') {
                loadTaskData();
            }
        }

        // Load epic completion data
        async function loadEpicData() {
            try {
                document.getElementById('epic-loading').style.display = 'block';
                document.getElementById('epic-content').style.display = 'none';
                document.getElementById('epic-error').style.display = 'none';

                const response = await fetch('/api/epic-completion');
                if (!response.ok) {
                    throw new Error('Failed to fetch epic data');
                }
                
                const data = await response.json();
                epicData = data.epics;
                
                renderEpicOverview();
                renderEpicCards();
                
                document.getElementById('epic-loading').style.display = 'none';
                document.getElementById('epic-content').style.display = 'block';
                
            } catch (error) {
                console.error('Error loading epic data:', error);
                document.getElementById('epic-loading').style.display = 'none';
                document.getElementById('epic-error').style.display = 'block';
            }
        }

        // Render overview statistics
        function renderEpicOverview() {
            const epics = Object.values(epicData);
            const averageProgress = Math.round(epics.reduce((sum, epic) => sum + epic.overallProgress, 0) / epics.length);
            const criticalEpics = epics.filter(epic => epic.impact.includes('CRITICAL'));
            const criticalProgress = criticalEpics.length > 0 ? 
                Math.round(criticalEpics.reduce((sum, epic) => sum + epic.overallProgress, 0) / criticalEpics.length) : 0;
            const quickWinsCount = epics.reduce((count, epic) => {
                return count + epic.components.filter(component => 
                    component.status === 'missing' || component.status === 'partial'
                ).length;
            }, 0);

            document.getElementById('epic-overview').innerHTML = \`
                <div class="epic-stat">
                    <div class="epic-stat-number">\${averageProgress}%</div>
                    <div class="epic-stat-label">Average Epic Completion</div>
                </div>
                <div class="epic-stat">
                    <div class="epic-stat-number">\${criticalProgress}%</div>
                    <div class="epic-stat-label">Critical Systems</div>
                </div>
                <div class="epic-stat">
                    <div class="epic-stat-number">\${quickWinsCount}</div>
                    <div class="epic-stat-label">Quick Wins Available</div>
                </div>
                <div class="epic-stat">
                    <div class="epic-stat-number">6+</div>
                    <div class="epic-stat-label">Months of Work Ready</div>
                </div>
            \`;
        }

        // Render epic cards
        function renderEpicCards() {
            const epicGrid = document.getElementById('epic-grid');
            
            epicGrid.innerHTML = Object.entries(epicData).map(([key, epic]) => {
                const impactClass = epic.impact.toLowerCase().includes('critical') ? 'critical' :
                                   epic.impact.toLowerCase().includes('high') ? 'high' :
                                   epic.impact.toLowerCase().includes('medium') ? 'medium' : '';

                const componentsHtml = epic.components.map(component => {
                    const statusIcon = getStatusIcon(component.status);
                    return \`
                        <div class="epic-component">
                            <span>\${statusIcon}</span>
                            <span>\${component.name} (\${component.progress}%)</span>
                        </div>
                    \`;
                }).join('');

                return \`
                    <div class="epic-card">
                        <div class="epic-title">
                            <span>\${epic.icon}</span>
                            <span>\${epic.name}</span>
                        </div>
                        <div class="epic-description">\${epic.description}</div>
                        <div class="epic-progress">
                            <div class="epic-progress-label">
                                <span>Progress</span>
                                <span>\${epic.overallProgress}%</span>
                            </div>
                            <div class="epic-progress-bar">
                                <div class="epic-progress-fill \${impactClass}" style="width: \${epic.overallProgress}%"></div>
                            </div>
                        </div>
                        <div class="epic-components">
                            \${componentsHtml}
                        </div>
                        <div class="epic-business-value">
                            <strong>Business Value:</strong> \${epic.businessValue}
                        </div>
                    </div>
                \`;
            }).join('');
        }

        // Get status icon for components
        function getStatusIcon(status) {
            switch (status) {
                case 'complete': return '✅';
                case 'in_progress': return '🔄';
                case 'partial': return '⚡';
                case 'missing': return '❌';
                case 'exists': return '📁';
                case 'backend_ready': return '🔧';
                case 'unknown': return '❓';
                default: return '📋';
            }
        }

        // Load task data (placeholder)
        async function loadTaskData() {
            document.getElementById('tasks-loading').style.display = 'none';
            document.getElementById('tasks-content').style.display = 'block';
        }

        // Initialize the dashboard
        document.addEventListener('DOMContentLoaded', () => {
            loadEpicData();
        });
    </script>
</body>
</html>
  `;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(dashboardHTML);
}

// Start server
server.listen(PORT, () => {
  console.log(`🎯 Ticketing System Dashboard running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log('');
  console.log('Features:');
  console.log('  ✅ Epic Integration Completion Status');
  console.log('  ✅ Task Management Interface');
  console.log('  ✅ Real-time Progress Tracking');
  console.log('');
  console.log('API Endpoints:');
  console.log('  GET /api/epic-completion - Epic completion data');
  console.log('  GET /api/tasks - Task management data');
});

module.exports = server;