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
    const stateFile = path.join(__dirname, '../data/state.json');
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
  // Serve the restored standalone HTML dashboard file
  const dashboardPath = path.join(__dirname, 'complete-dashboard.html');
  try {
    const html = fs.readFileSync(dashboardPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return; // Skip legacy inline template below
  } catch (err) {
    console.error('❌ Failed to read complete-dashboard.html', err);
    // Fallback to legacy template if file read fails
  }
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

        /* Task Management Styles */
        .task-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .task-stat {
            background: #252538;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            border: 1px solid #2d2d44;
        }

        .task-stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .task-stat-number.pending { color: #fbbf24; }
        .task-stat-number.in-progress { color: #10b981; }
        .task-stat-number.completed { color: #34d399; }

        .task-stat-label {
            color: #9ca3af;
            font-size: 0.9rem;
        }

        .epic8-header {
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }

        .epic8-header h2 {
            font-size: 2rem;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .epic8-header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }

        .story-card {
            background: #252538;
            border-radius: 12px;
            padding: 25px;
            border: 1px solid #2d2d44;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .story-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .story-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .story-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #e1e5e9;
            margin-bottom: 5px;
        }

        .story-subtitle {
            font-size: 0.9rem;
            color: #9ca3af;
        }

        .story-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .story-status.pending {
            background: #451a03;
            color: #fbbf24;
            border: 1px solid #92400e;
        }

        .story-status.in-progress {
            background: #064e3b;
            color: #10b981;
            border: 1px solid #059669;
        }

        .story-status.completed {
            background: #14532d;
            color: #34d399;
            border: 1px solid #16a34a;
        }

        .story-status.assigned {
            background: #0f172a;
            color: #74c0fc;
            border: 1px solid #1e40af;
        }

        .story-status.review {
            background: #581c87;
            color: #c084fc;
            border: 1px solid #7c3aed;
        }

        .story-priority {
            margin-bottom: 15px;
        }

        .priority-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .priority-badge.high {
            background: #7f1d1d;
            color: #fca5a5;
        }

        .priority-badge.medium {
            background: #78350f;
            color: #fbbf24;
        }

        .priority-badge.low {
            background: #1e3a8a;
            color: #93c5fd;
        }

        .story-description {
            color: #d1d5db;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 15px;
        }

        .story-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            color: #9ca3af;
            padding-top: 15px;
            border-top: 1px solid #374151;
        }

        .agent-assignment {
            font-weight: 500;
        }

        .task-actions {
            margin-top: 30px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .action-button {
            padding: 10px 20px;
            background: #3730a3;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.2s;
        }

        .action-button:hover {
            background: #4338ca;
        }

        .action-button.secondary {
            background: #374151;
        }

        .action-button.secondary:hover {
            background: #4b5563;
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
            
            .task-overview {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .stories-grid {
                grid-template-columns: 1fr;
            }
            
            .task-actions {
                flex-direction: column;
            }
            
            .story-header {
                flex-direction: column;
                gap: 10px;
            }
            
            .story-meta {
                flex-direction: column;
                gap: 8px;
                align-items: flex-start;
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
            <div class="loading" id="tasks-loading">Loading Epic 8 task data...</div>
            <div id="tasks-content" style="display: none;">
                <!-- Epic 8 Header -->
                <div class="epic8-header">
                    <h2>🎬 Epic 8: Demo-Ready Proof of Concept</h2>
                    <p>Wild Construct Film Industry Integration - Professional demo-ready interface and features</p>
                </div>

                <!-- Task Overview -->
                <div class="task-overview" id="task-overview">
                    <!-- Overview stats will be populated by JavaScript -->
                </div>

                <!-- Epic 8 Stories Grid -->
                <div class="stories-grid" id="stories-grid">
                    <!-- Story cards will be populated by JavaScript -->
                </div>

                <!-- Task Actions -->
                <div class="task-actions">
                    <button class="action-button" onclick="refreshTaskData()">
                        🔄 Refresh Data
                    </button>
                    <button class="action-button secondary" onclick="showTaskDetails()">
                        📋 View All Tasks
                    </button>
                    <button class="action-button secondary" onclick="exportTaskReport()">
                        📊 Export Report
                    </button>
                </div>
            </div>
            <div id="tasks-error" class="error" style="display: none;">
                Failed to load Epic 8 task data. Please check the server connection.
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

        // Epic 8 story definitions
        const epic8Stories = {
            '8.1': {
                title: 'Professional Interface Polish',
                description: 'Cinema 4D/Substance Designer quality UI with professional animations and responsive interactions'
            },
            '8.2': {
                title: 'Director-Friendly Variable System',
                description: 'Natural language template system with {variable} syntax for creative professionals'
            },
            '8.3': {
                title: 'Visual Weight Controls',
                description: 'Intuitive weight adjustment through visual controls without numerical complexity'
            },
            '8.4': {
                title: 'Progressive Disclosure Architecture',
                description: 'Three-tier complexity system (Basic/Advanced/Debug) for different user expertise levels'
            },
            '8.5': {
                title: 'Real-Time Multi-Seed Preview',
                description: 'Sub-second preview generation with variance analysis for demo validation'
            },
            '8.6': {
                title: 'Structured Pipeline Export',
                description: 'VFX-ready JSON export with ControlNet compatibility for production workflows'
            },
            '8.7': {
                title: 'Collaboration & Documentation Tools',
                description: 'Team workflow features with sticky notes, region grouping, and template library'
            },
            '8.8': {
                title: 'Historical Data Integration Foundation',
                description: 'UTDG integration foundation for authentic historical settings and medieval demo'
            }
        };

        let taskData = {};

        // Load Epic 8 task data
        async function loadTaskData() {
            try {
                document.getElementById('tasks-loading').style.display = 'block';
                document.getElementById('tasks-content').style.display = 'none';
                document.getElementById('tasks-error').style.display = 'none';

                const response = await fetch('/api/tasks');
                if (!response.ok) {
                    throw new Error('Failed to fetch task data');
                }
                
                const data = await response.json();
                taskData = data.tasks;
                
                // Filter Epic 8 tasks
                const epic8Tasks = Object.values(taskData).filter(task => task.epic === 'Epic 8');
                
                renderTaskOverview(epic8Tasks);
                renderStoriesGrid(epic8Tasks);
                
                document.getElementById('tasks-loading').style.display = 'none';
                document.getElementById('tasks-content').style.display = 'block';
                
            } catch (error) {
                console.error('Error loading task data:', error);
                document.getElementById('tasks-loading').style.display = 'none';
                document.getElementById('tasks-error').style.display = 'block';
            }
        }

        // Render task overview statistics
        function renderTaskOverview(epic8Tasks) {
            const statusCounts = {
                UNASSIGNED: 0,
                IN_PROGRESS: 0,
                REVIEW: 0,
                COMPLETED: 0
            };

            const priorityCounts = {
                high: 0,
                medium: 0,
                low: 0
            };

            epic8Tasks.forEach(task => {
                // Use 'state' field (which is what Epic 8 tasks use) or fallback to 'status'
                const status = task.state || task.status || 'UNASSIGNED';
                const priority = task.priority || 'medium';
                
                statusCounts[status] = (statusCounts[status] || 0) + 1;
                priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
            });

            const assignedTasks = epic8Tasks.filter(task => task.assignee && task.assignee !== 'null').length;
            const totalTasks = epic8Tasks.length;
            const totalEstimatedHours = epic8Tasks.reduce((sum, task) => sum + (task.est || 0), 0);

            document.getElementById('task-overview').innerHTML = \`
                <div class="task-stat">
                    <div class="task-stat-number pending">\${statusCounts.UNASSIGNED || 0}</div>
                    <div class="task-stat-label">Unassigned</div>
                </div>
                <div class="task-stat">
                    <div class="task-stat-number in-progress">\${statusCounts.IN_PROGRESS || 0}</div>
                    <div class="task-stat-label">In Progress</div>
                </div>
                <div class="task-stat">
                    <div class="task-stat-number" style="color: #8b5cf6;">\${statusCounts.REVIEW || 0}</div>
                    <div class="task-stat-label">In Review</div>
                </div>
                <div class="task-stat">
                    <div class="task-stat-number completed">\${statusCounts.COMPLETED || 0}</div>
                    <div class="task-stat-label">Completed</div>
                </div>
                <div class="task-stat">
                    <div class="task-stat-number" style="color: #74c0fc;">\${totalTasks}</div>
                    <div class="task-stat-label">Total Tasks</div>
                </div>
                <div class="task-stat">
                    <div class="task-stat-number" style="color: #10b981;">\${assignedTasks}</div>
                    <div class="task-stat-label">Assigned</div>
                </div>
            \`;
        }

        // Render Epic 8 stories grid
        function renderStoriesGrid(epic8Tasks) {
            const storiesGrid = document.getElementById('stories-grid');
            
            storiesGrid.innerHTML = Object.entries(epic8Stories).map(([storyId, storyInfo]) => {
                // Get all tasks for this story
                const storyTasks = epic8Tasks.filter(t => t.story === storyId || t.story_id === storyId);
                const taskCount = storyTasks.length;
                
                // Calculate story progress
                const completedTasks = storyTasks.filter(t => (t.state || t.status) === 'COMPLETED').length;
                const reviewTasks = storyTasks.filter(t => (t.state || t.status) === 'REVIEW').length;
                const inProgressTasks = storyTasks.filter(t => (t.state || t.status) === 'IN_PROGRESS').length;
                const unassignedTasks = storyTasks.filter(t => (t.state || t.status) === 'UNASSIGNED').length;
                const assignedTasks = storyTasks.filter(t => t.assignee && t.assignee !== 'null').length;
                
                // Determine overall story status
                let status = 'UNASSIGNED';
                if (completedTasks === taskCount && taskCount > 0) {
                    status = 'COMPLETED';
                } else if (reviewTasks > 0) {
                    status = 'REVIEW';
                } else if (inProgressTasks > 0) {
                    status = 'IN_PROGRESS';
                } else if (assignedTasks > 0) {
                    status = 'ASSIGNED';
                }
                
                // Get highest priority from tasks
                const priorities = storyTasks.map(t => t.priority || 'medium');
                const priority = priorities.includes('high') ? 'high' : 
                               priorities.includes('medium') ? 'medium' : 'low';
                
                // Get assigned agents
                const agents = [...new Set(storyTasks
                    .filter(t => t.assignee && t.assignee !== 'null')
                    .map(t => t.assignee))];
                const agentList = agents.length > 0 ? agents.join(', ') : 'Not assigned';
                
                // Calculate progress percentage (completed + in review as partial progress)
                const progressPercent = taskCount > 0 ? 
                    Math.round(((completedTasks + reviewTasks * 0.8 + inProgressTasks * 0.5) / taskCount) * 100) : 0;

                return \`
                    <div class="story-card" data-story="\${storyId}">
                        <div class="story-header">
                            <div>
                                <div class="story-title">\${storyId}: \${storyInfo.title}</div>
                                <div class="story-subtitle">\${taskCount} tasks total</div>
                            </div>
                            <div class="story-status \${status.toLowerCase().replace('_', '-')}">\${status.replace('_', ' ')}</div>
                        </div>
                        
                        <div class="story-priority">
                            <span class="priority-badge \${priority}">\${priority} Priority</span>
                        </div>
                        
                        <div class="story-description">
                            \${storyInfo.description}
                        </div>
                        
                        <div class="story-progress" style="margin: 15px 0;">
                            <div class="epic-progress-label">
                                <span>Progress</span>
                                <span>\${progressPercent}%</span>
                            </div>
                            <div class="epic-progress-bar">
                                <div class="epic-progress-fill" style="width: \${progressPercent}%"></div>
                            </div>
                        </div>
                        
                        <div class="story-tasks" style="margin: 10px 0; font-size: 0.85rem; color: #9ca3af;">
                            ✅ \${completedTasks} completed &nbsp; 
                            👀 \${reviewTasks} in review &nbsp; 
                            🔄 \${inProgressTasks} in progress &nbsp; 
                            📋 \${unassignedTasks} unassigned
                        </div>
                        
                        <div class="story-meta">
                            <span class="agent-assignment">
                                Agents: \${agentList}
                            </span>
                            <span class="task-count">
                                \${taskCount} tasks
                            </span>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        // Refresh task data
        function refreshTaskData() {
            loadTaskData();
        }

        // Show task details (placeholder)
        function showTaskDetails() {
            alert('Task details view will open the CLI tool. Use: node src/monitor-available-tasks.js');
        }

        // Export task report (placeholder)
        function exportTaskReport() {
            const epic8Tasks = Object.values(taskData).filter(task => task.epic === 'Epic 8');
            const report = {
                timestamp: new Date().toISOString(),
                epic: 'Epic 8: Demo-Ready Proof of Concept',
                totalTasks: epic8Tasks.length,
                stories: Object.entries(epic8Stories).map(([storyId, storyInfo]) => {
                    const task = epic8Tasks.find(t => t.story === storyId);
                    return {
                        storyId,
                        title: storyInfo.title,
                        description: storyInfo.description,
                        status: task ? (task.status || 'PENDING') : 'PENDING',
                        priority: task ? (task.priority || 'medium') : 'medium',
                        assignedAgent: task ? task.assignedAgent : null,
                        taskId: task ? task.id : null
                    };
                })
            };
            
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`epic8-task-report-\${new Date().toISOString().split('T')[0]}.json\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Initialize the dashboard
        document.addEventListener('DOMContentLoaded', () => {
            // Load Epic Status tab by default
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
  console.log('🎯 Ticketing System Dashboard running at:');
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
