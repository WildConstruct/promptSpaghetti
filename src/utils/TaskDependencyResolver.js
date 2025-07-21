#!/usr/bin/env node

/**
 * Task Dependency Resolver
 * 
 * Automatically detects task dependencies, visualizes dependency chains,
 * identifies blockers, and suggests optimal task ordering for improved workflow.
 * 
 * Key Features:
 * - Automatic dependency detection using NLP and pattern matching
 * - Visual dependency chain mapping with D3.js/Mermaid support
 * - Blocker identification and critical path analysis
 * - Optimal task ordering recommendations using topological sorting
 * - Circular dependency detection and resolution suggestions
 * - Real-time dependency tracking and updates
 */

const fs = require('fs').promises;
const path = require('path');

class TaskDependencyResolver {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/dependencies');
    this.stateFile = path.join(__dirname, '../data/state.json');
    this.dependencyFile = path.join(this.dataDir, 'task-dependencies.json');
    this.visualizationFile = path.join(this.dataDir, 'dependency-graph.html');
    this.analysisFile = path.join(this.dataDir, 'dependency-analysis.json');
    
    // Configuration for dependency detection
    this.config = {
      detection: {
        // Keywords that indicate dependencies
        dependencyKeywords: [
          'depends on', 'requires', 'needs', 'after', 'once', 'when',
          'following', 'prerequisite', 'blocked by', 'waiting for',
          'based on', 'building on', 'extends', 'uses', 'leverages'
        ],
        
        // Task reference patterns
        taskReferencePatterns: [
          /T-\d{13}-[a-f0-9]{6}/g,           // Task IDs
          /task\s+([A-Z0-9-]+)/gi,           // "task ABC-123"
          /ticket\s+([A-Z0-9-]+)/gi,         // "ticket XYZ-456"
          /story\s+([A-Z0-9-]+)/gi,          // "story S-123"
          /epic\s+(\d+)/gi,                  // "epic 7"
          /feature\s+([A-Z][A-Z0-9-]*)/gi    // "feature AUTH"
        ],
        
        // File/component patterns
        filePatterns: [
          /src\/[a-zA-Z0-9\/.-]+\.(js|ts|jsx|tsx)/g,
          /packages\/[a-zA-Z0-9\/.-]+/g,
          /components?\/[a-zA-Z0-9\/.-]+/g
        ],
        
        // Priority for different dependency types
        dependencyWeights: {
          explicit: 1.0,        // Explicitly mentioned task IDs
          keyword: 0.8,         // Keyword-based dependencies
          file: 0.6,            // File-based dependencies
          epic: 0.7,            // Epic-level dependencies
          semantic: 0.5         // Semantic similarity
        }
      },
      
      analysis: {
        // Thresholds for analysis
        criticalPathMinLength: 3,
        maxDependencyDepth: 10,
        circularDependencyLimit: 50,
        
        // Weights for task prioritization
        priorityWeights: {
          blockerCount: 0.4,      // Number of tasks blocked by this one
          dependencyCount: 0.2,   // Number of dependencies this task has
          priority: 0.3,          // Original task priority
          effort: 0.1            // Task effort/complexity
        }
      },
      
      visualization: {
        layout: 'hierarchical',   // 'hierarchical', 'force', 'circular'
        showLabels: true,
        highlightCriticalPath: true,
        maxNodesPerGraph: 100,
        clusterByEpic: true
      }
    };
    
    this.dependencies = new Map();
    this.dependencyGraph = new Map();
    this.analysis = {
      criticalPath: [],
      blockers: [],
      cycles: [],
      recommendations: [],
      lastAnalyzed: null
    };
  }

  /**
   * Initialize the dependency resolver
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadExistingDependencies();
      
      console.log('✅ Task Dependency Resolver initialized');
      console.log(`📊 Loaded ${this.dependencies.size} existing dependency relationships`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Task Dependency Resolver:', error);
      throw error;
    }
  }

  /**
   * Analyze all tasks and detect dependencies
   */
  async analyzeAllTasks() {
    console.log('🔍 Analyzing task dependencies...\n');
    
    try {
      // Load current task state
      const tasks = await this.loadTasks();
      
      // Clear existing dependencies for fresh analysis
      this.dependencies.clear();
      this.dependencyGraph.clear();
      
      let dependenciesFound = 0;
      
      // Analyze each task for dependencies
      for (const [taskId, task] of Object.entries(tasks)) {
        const taskDependencies = await this.analyzeTaskDependencies(taskId, task, tasks);
        
        if (taskDependencies.length > 0) {
          this.dependencies.set(taskId, taskDependencies);
          dependenciesFound += taskDependencies.length;
          
          console.log(`📋 ${taskId}: Found ${taskDependencies.length} dependencies`);
          taskDependencies.forEach(dep => {
            console.log(`   └─ ${dep.type}: ${dep.targetId} (${dep.reason})`);
          });
        }
      }
      
      // Build dependency graph
      this.buildDependencyGraph();
      
      // Perform analysis
      await this.performDependencyAnalysis();
      
      // Save results
      await this.saveDependencies();
      await this.saveAnalysis();
      
      console.log('\n✅ Dependency analysis complete:');
      console.log(`📊 Found ${dependenciesFound} dependency relationships`);
      console.log(`🔗 Generated dependency graph with ${this.dependencyGraph.size} nodes`);
      console.log(`⚠️  Identified ${this.analysis.blockers.length} potential blockers`);
      console.log(`🔄 Found ${this.analysis.cycles.length} circular dependencies`);
      
      return {
        dependenciesFound,
        blockers: this.analysis.blockers.length,
        cycles: this.analysis.cycles.length,
        criticalPathLength: this.analysis.criticalPath.length
      };
      
    } catch (error) {
      console.error('❌ Dependency analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze dependencies for a specific task
   */
  async analyzeTaskDependencies(taskId, task, allTasks) {
    const dependencies = [];
    
    if (!task || !task.description) return dependencies;
    
    const text = `${task.title || ''} ${task.description || ''} ${(task.acceptanceCriteria || []).join(' ')}`.toLowerCase();
    
    // 1. Explicit task ID references
    const taskIds = this.extractTaskReferences(text);
    for (const refId of taskIds) {
      if (refId !== taskId && allTasks[refId]) {
        dependencies.push({
          type: 'explicit',
          targetId: refId,
          reason: 'Direct task reference',
          weight: this.config.detection.dependencyWeights.explicit,
          detected: 'task_reference'
        });
      }
    }
    
    // 2. Keyword-based dependency detection
    const keywordDeps = this.detectKeywordDependencies(text, taskId, allTasks);
    dependencies.push(...keywordDeps);
    
    // 3. Epic-level dependencies
    if (task.epic) {
      const epicDeps = this.detectEpicDependencies(task.epic, taskId, allTasks);
      dependencies.push(...epicDeps);
    }
    
    // 4. File-based dependencies
    const fileDeps = this.detectFileDependencies(text, taskId, allTasks);
    dependencies.push(...fileDeps);
    
    // 5. Remove duplicates and sort by weight
    return this.deduplicateDependencies(dependencies);
  }

  /**
   * Extract task references from text
   */
  extractTaskReferences(text) {
    const references = new Set();
    
    for (const pattern of this.config.detection.taskReferencePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Extract the actual task ID
          const taskId = match.match(/T-\d{13}-[a-f0-9]{6}/);
          if (taskId) {
            references.add(taskId[0]);
          }
        });
      }
    }
    
    return Array.from(references);
  }

  /**
   * Detect dependencies based on keywords
   */
  detectKeywordDependencies(text, taskId, allTasks) {
    const dependencies = [];
    
    for (const keyword of this.config.detection.dependencyKeywords) {
      const keywordIndex = text.indexOf(keyword);
      if (keywordIndex !== -1) {
        // Look for task references near the keyword
        const contextStart = Math.max(0, keywordIndex - 100);
        const contextEnd = Math.min(text.length, keywordIndex + 100);
        const context = text.slice(contextStart, contextEnd);
        
        const nearbyTasks = this.extractTaskReferences(context);
        for (const refId of nearbyTasks) {
          if (refId !== taskId && allTasks[refId]) {
            dependencies.push({
              type: 'keyword',
              targetId: refId,
              reason: `Keyword "${keyword}" suggests dependency`,
              weight: this.config.detection.dependencyWeights.keyword,
              detected: 'keyword_proximity'
            });
          }
        }
        
        // Also check for component/epic dependencies
        const relatedTasks = this.findRelatedTasks(context, taskId, allTasks);
        dependencies.push(...relatedTasks.map(dep => ({
          ...dep,
          reason: `Keyword "${keyword}" + ${dep.reason}`,
          weight: dep.weight * this.config.detection.dependencyWeights.keyword
        })));
      }
    }
    
    return dependencies;
  }

  /**
   * Detect epic-level dependencies
   */
  detectEpicDependencies(epic, taskId, allTasks) {
    const dependencies = [];
    
    // Find other tasks in the same epic that might be prerequisites
    const epicTasks = Object.entries(allTasks).filter(([id, task]) => 
      id !== taskId && task.epic === epic
    );
    
    // Simple heuristic: tasks created earlier in the epic might be dependencies
    const currentTask = allTasks[taskId];
    const currentCreated = new Date(currentTask.created || '1970-01-01');
    
    for (const [id, task] of epicTasks) {
      const taskCreated = new Date(task.created || '1970-01-01');
      
      // If this task was created before the current one and has a higher priority
      if (taskCreated < currentCreated && 
          this.getPriorityWeight(task.priority) > this.getPriorityWeight(currentTask.priority)) {
        dependencies.push({
          type: 'epic',
          targetId: id,
          reason: `Earlier task in same epic (${epic})`,
          weight: this.config.detection.dependencyWeights.epic,
          detected: 'epic_sequence'
        });
      }
    }
    
    return dependencies;
  }

  /**
   * Detect file-based dependencies
   */
  detectFileDependencies(text, taskId, allTasks) {
    const dependencies = [];
    
    // Extract file references from current task
    const currentFiles = new Set();
    for (const pattern of this.config.detection.filePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(file => currentFiles.add(file.toLowerCase()));
      }
    }
    
    if (currentFiles.size === 0) return dependencies;
    
    // Find other tasks that work on the same files
    for (const [id, task] of Object.entries(allTasks)) {
      if (id === taskId || !task.description) continue;
      
      const otherText = `${task.title || ''} ${task.description || ''}`.toLowerCase();
      const otherFiles = new Set();
      
      for (const pattern of this.config.detection.filePatterns) {
        const matches = otherText.match(pattern);
        if (matches) {
          matches.forEach(file => otherFiles.add(file.toLowerCase()));
        }
      }
      
      // Check for file overlap
      const overlap = [...currentFiles].filter(file => otherFiles.has(file));
      if (overlap.length > 0) {
        dependencies.push({
          type: 'file',
          targetId: id,
          reason: `Shared files: ${overlap.join(', ')}`,
          weight: this.config.detection.dependencyWeights.file,
          detected: 'file_overlap'
        });
      }
    }
    
    return dependencies;
  }

  /**
   * Find related tasks based on text similarity
   */
  findRelatedTasks(context, taskId, allTasks) {
    // Simple implementation - could be enhanced with NLP libraries
    const dependencies = [];
    const contextWords = context.split(/\s+/).filter(word => word.length > 3);
    
    for (const [id, task] of Object.entries(allTasks)) {
      if (id === taskId || !task.description) continue;
      
      const taskText = `${task.title || ''} ${task.description || ''}`.toLowerCase();
      const taskWords = taskText.split(/\s+/).filter(word => word.length > 3);
      
      // Calculate word overlap
      const overlap = contextWords.filter(word => taskWords.includes(word));
      const similarity = overlap.length / Math.max(contextWords.length, taskWords.length);
      
      if (similarity > 0.3) { // 30% word overlap threshold
        dependencies.push({
          type: 'semantic',
          targetId: id,
          reason: `Text similarity (${Math.round(similarity * 100)}%)`,
          weight: this.config.detection.dependencyWeights.semantic * similarity,
          detected: 'semantic_similarity'
        });
      }
    }
    
    return dependencies;
  }

  /**
   * Remove duplicate dependencies and sort by weight
   */
  deduplicateDependencies(dependencies) {
    const seen = new Map();
    
    for (const dep of dependencies) {
      const key = `${dep.targetId}-${dep.type}`;
      if (!seen.has(key) || seen.get(key).weight < dep.weight) {
        seen.set(key, dep);
      }
    }
    
    return Array.from(seen.values()).sort((a, b) => b.weight - a.weight);
  }

  /**
   * Build the dependency graph data structure
   */
  buildDependencyGraph() {
    this.dependencyGraph.clear();
    
    // Initialize nodes
    for (const taskId of this.dependencies.keys()) {
      if (!this.dependencyGraph.has(taskId)) {
        this.dependencyGraph.set(taskId, { incoming: [], outgoing: [] });
      }
      
      const deps = this.dependencies.get(taskId);
      for (const dep of deps) {
        if (!this.dependencyGraph.has(dep.targetId)) {
          this.dependencyGraph.set(dep.targetId, { incoming: [], outgoing: [] });
        }
        
        // Add edges
        this.dependencyGraph.get(taskId).outgoing.push({
          target: dep.targetId,
          ...dep
        });
        this.dependencyGraph.get(dep.targetId).incoming.push({
          source: taskId,
          ...dep
        });
      }
    }
  }

  /**
   * Perform comprehensive dependency analysis
   */
  async performDependencyAnalysis() {
    this.analysis = {
      criticalPath: this.findCriticalPath(),
      blockers: this.identifyBlockers(),
      cycles: this.detectCircularDependencies(),
      recommendations: [],
      lastAnalyzed: new Date().toISOString()
    };
    
    // Generate recommendations
    this.analysis.recommendations = this.generateRecommendations();
  }

  /**
   * Find the critical path (longest dependency chain)
   */
  findCriticalPath() {
    let longestPath = [];
    
    // Find all root nodes (no incoming dependencies)
    const rootNodes = [];
    for (const [nodeId, node] of this.dependencyGraph.entries()) {
      if (node.incoming.length === 0) {
        rootNodes.push(nodeId);
      }
    }
    
    // DFS from each root to find longest path
    for (const rootId of rootNodes) {
      const path = this.dfsLongestPath(rootId, new Set());
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    }
    
    return longestPath;
  }

  /**
   * DFS to find longest path from a node
   */
  dfsLongestPath(nodeId, visited) {
    if (visited.has(nodeId)) return []; // Avoid cycles
    
    visited.add(nodeId);
    const node = this.dependencyGraph.get(nodeId);
    
    if (!node || node.outgoing.length === 0) {
      visited.delete(nodeId);
      return [nodeId];
    }
    
    let longestSubPath = [];
    for (const edge of node.outgoing) {
      const subPath = this.dfsLongestPath(edge.target, visited);
      if (subPath.length > longestSubPath.length) {
        longestSubPath = subPath;
      }
    }
    
    visited.delete(nodeId);
    return [nodeId, ...longestSubPath];
  }

  /**
   * Identify tasks that are blocking others
   */
  identifyBlockers() {
    const blockers = [];
    
    for (const [nodeId, node] of this.dependencyGraph.entries()) {
      if (node.incoming.length > 2) { // Tasks with many dependents are potential blockers
        blockers.push({
          taskId: nodeId,
          blockingCount: node.incoming.length,
          blockedTasks: node.incoming.map(edge => edge.source),
          severity: this.calculateBlockerSeverity(node.incoming.length)
        });
      }
    }
    
    return blockers.sort((a, b) => b.blockingCount - a.blockingCount);
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies() {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    for (const nodeId of this.dependencyGraph.keys()) {
      if (!visited.has(nodeId)) {
        const cycle = this.dfsCycleDetection(nodeId, visited, recursionStack, []);
        if (cycle.length > 0) {
          cycles.push(cycle);
        }
      }
    }
    
    return cycles;
  }

  /**
   * DFS for cycle detection
   */
  dfsCycleDetection(nodeId, visited, recursionStack, path) {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);
    
    const node = this.dependencyGraph.get(nodeId);
    if (node) {
      for (const edge of node.outgoing) {
        if (!visited.has(edge.target)) {
          const cycle = this.dfsCycleDetection(edge.target, visited, recursionStack, [...path]);
          if (cycle.length > 0) return cycle;
        } else if (recursionStack.has(edge.target)) {
          // Found a cycle
          const cycleStart = path.indexOf(edge.target);
          return path.slice(cycleStart).concat([edge.target]);
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return [];
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Critical path recommendations
    if (this.analysis.criticalPath.length >= this.config.analysis.criticalPathMinLength) {
      recommendations.push({
        type: 'critical_path',
        priority: 'high',
        message: `Critical path identified with ${this.analysis.criticalPath.length} tasks. Focus on completing these sequentially.`,
        tasks: this.analysis.criticalPath,
        action: 'prioritize_sequence'
      });
    }
    
    // Blocker recommendations
    for (const blocker of this.analysis.blockers.slice(0, 3)) { // Top 3 blockers
      recommendations.push({
        type: 'blocker',
        priority: blocker.severity,
        message: `Task ${blocker.taskId} is blocking ${blocker.blockingCount} other tasks. Consider prioritizing.`,
        tasks: [blocker.taskId],
        action: 'prioritize_blocker'
      });
    }
    
    // Cycle resolution recommendations
    for (const cycle of this.analysis.cycles) {
      recommendations.push({
        type: 'circular_dependency',
        priority: 'medium',
        message: `Circular dependency detected: ${cycle.join(' → ')}. Review and break the cycle.`,
        tasks: cycle,
        action: 'resolve_cycle'
      });
    }
    
    // Parallel work opportunities
    const parallelizable = this.findParallelizableTasks();
    if (parallelizable.length > 0) {
      recommendations.push({
        type: 'parallelization',
        priority: 'low',
        message: `${parallelizable.length} tasks can be worked on in parallel to speed up delivery.`,
        tasks: parallelizable,
        action: 'parallel_execution'
      });
    }
    
    return recommendations;
  }

  /**
   * Find tasks that can be worked on in parallel
   */
  findParallelizableTasks() {
    const parallelizable = [];
    
    // Find tasks with no dependencies that aren't blockers
    for (const [nodeId, node] of this.dependencyGraph.entries()) {
      if (node.outgoing.length === 0 && node.incoming.length <= 1) {
        parallelizable.push(nodeId);
      }
    }
    
    return parallelizable;
  }

  /**
   * Get optimal task ordering
   */
  getOptimalTaskOrdering() {
    // Topological sort with priority weighting
    const inDegree = new Map();
    const queue = [];
    const result = [];
    
    // Initialize in-degree count
    for (const nodeId of this.dependencyGraph.keys()) {
      const node = this.dependencyGraph.get(nodeId);
      inDegree.set(nodeId, node.incoming.length);
      
      if (node.incoming.length === 0) {
        queue.push(nodeId);
      }
    }
    
    // Process nodes with priority weighting
    while (queue.length > 0) {
      // Sort queue by priority and blocker count
      queue.sort((a, b) => {
        const aNode = this.dependencyGraph.get(a);
        const bNode = this.dependencyGraph.get(b);
        return bNode.incoming.length - aNode.incoming.length; // Prioritize blockers
      });
      
      const nodeId = queue.shift();
      result.push(nodeId);
      
      const node = this.dependencyGraph.get(nodeId);
      for (const edge of node.outgoing) {
        const newInDegree = inDegree.get(edge.target) - 1;
        inDegree.set(edge.target, newInDegree);
        
        if (newInDegree === 0) {
          queue.push(edge.target);
        }
      }
    }
    
    return result;
  }

  /**
   * Generate visualization HTML
   */
  async generateVisualization() {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Task Dependency Graph</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .graph-container { width: 100%; height: 800px; border: 1px solid #ccc; }
        .node { cursor: pointer; }
        .node circle { fill: #69b3d9; stroke: #333; stroke-width: 2px; }
        .node.critical { fill: #ff6b6b; }
        .node.blocker { fill: #feca57; }
        .link { fill: none; stroke: #999; stroke-width: 2px; marker-end: url(#arrowhead); }
        .link.critical { stroke: #ff6b6b; stroke-width: 3px; }
        .node-label { font-size: 12px; text-anchor: middle; }
        .legend { position: absolute; top: 10px; right: 10px; background: #f9f9f9; padding: 10px; border: 1px solid #ccc; }
        .stats { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .recommendations { margin: 20px 0; }
        .recommendation { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; background: #f8f9fa; }
        .recommendation.high { border-color: #dc3545; }
        .recommendation.medium { border-color: #ffc107; }
        .recommendation.low { border-color: #28a745; }
    </style>
</head>
<body>
    <h1>Task Dependency Graph</h1>
    
    <div class="stats">
        <h3>📊 Analysis Summary</h3>
        <p><strong>Total Tasks:</strong> ${this.dependencyGraph.size}</p>
        <p><strong>Dependencies:</strong> ${Array.from(this.dependencies.values()).reduce((sum, deps) => sum + deps.length, 0)}</p>
        <p><strong>Critical Path Length:</strong> ${this.analysis.criticalPath.length}</p>
        <p><strong>Blockers Identified:</strong> ${this.analysis.blockers.length}</p>
        <p><strong>Circular Dependencies:</strong> ${this.analysis.cycles.length}</p>
        <p><strong>Last Analyzed:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="recommendations">
        <h3>💡 Recommendations</h3>
        ${this.analysis.recommendations.map(rec => `
            <div class="recommendation ${rec.priority}">
                <strong>${rec.type.replace(/_/g, ' ').toUpperCase()}:</strong> ${rec.message}
                ${rec.tasks.length > 0 ? `<br><small>Tasks: ${rec.tasks.join(', ')}</small>` : ''}
            </div>
        `).join('')}
    </div>
    
    <div class="graph-container">
        <svg id="dependency-graph"></svg>
    </div>
    
    <div class="legend">
        <h4>Legend</h4>
        <div><span style="color: #69b3d9;">●</span> Normal Task</div>
        <div><span style="color: #ff6b6b;">●</span> Critical Path</div>
        <div><span style="color: #feca57;">●</span> Blocker</div>
        <div><span style="color: #999;">→</span> Dependency</div>
    </div>

    <script>
        // D3.js visualization code
        const data = ${JSON.stringify(this.preparGraphData())};
        
        const svg = d3.select("#dependency-graph");
        const width = 1000;
        const height = 800;
        
        svg.attr("width", width).attr("height", height);
        
        // Define arrowhead marker
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 8)
            .attr("refY", 3)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0 L0,6 L9,3 z")
            .attr("fill", "#999");
        
        // Create force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));
        
        // Create links
        const link = svg.append("g")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("class", d => "link" + (d.critical ? " critical" : ""));
        
        // Create nodes
        const node = svg.append("g")
            .selectAll("g")
            .data(data.nodes)
            .enter().append("g")
            .attr("class", d => "node" + (d.critical ? " critical" : "") + (d.blocker ? " blocker" : ""))
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        
        node.append("circle")
            .attr("r", d => Math.max(8, Math.min(20, d.dependencies * 3)));
        
        node.append("text")
            .attr("class", "node-label")
            .attr("dy", 4)
            .text(d => d.id.split('-').pop().substring(0, 6));
        
        node.append("title")
            .text(d => \`\${d.id}: \${d.title || 'Unknown'}\`);
        
        // Update positions on simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            node
                .attr("transform", d => \`translate(\${d.x},\${d.y})\`);
        });
        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    </script>
</body>
</html>`;
    
    await fs.writeFile(this.visualizationFile, html);
    console.log(`📊 Dependency visualization saved to: ${this.visualizationFile}`);
  }

  /**
   * Prepare graph data for visualization
   */
  preparGraphData() {
    const nodes = [];
    const links = [];
    const criticalPathSet = new Set(this.analysis.criticalPath);
    const blockerSet = new Set(this.analysis.blockers.map(b => b.taskId));
    
    // Create nodes
    for (const [nodeId, node] of this.dependencyGraph.entries()) {
      nodes.push({
        id: nodeId,
        dependencies: node.incoming.length,
        critical: criticalPathSet.has(nodeId),
        blocker: blockerSet.has(nodeId),
        title: nodeId // Would be populated with actual task title in real implementation
      });
    }
    
    // Create links
    for (const [sourceId, node] of this.dependencyGraph.entries()) {
      for (const edge of node.outgoing) {
        links.push({
          source: sourceId,
          target: edge.target,
          type: edge.type,
          weight: edge.weight,
          critical: criticalPathSet.has(sourceId) && criticalPathSet.has(edge.target)
        });
      }
    }
    
    return { nodes, links };
  }

  // Helper methods

  async ensureDataDirectory() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async loadTasks() {
    try {
      const stateData = await fs.readFile(this.stateFile, 'utf8');
      const state = JSON.parse(stateData);
      return state.tasks || {};
    } catch (error) {
      console.warn('Could not load tasks:', error.message);
      return {};
    }
  }

  async loadExistingDependencies() {
    try {
      const data = await fs.readFile(this.dependencyFile, 'utf8');
      const dependencies = JSON.parse(data);
      
      for (const [taskId, deps] of Object.entries(dependencies)) {
        this.dependencies.set(taskId, deps);
      }
      
      this.buildDependencyGraph();
    } catch {
      // No existing dependencies
    }
  }

  async saveDependencies() {
    const data = Object.fromEntries(this.dependencies);
    await fs.writeFile(this.dependencyFile, JSON.stringify(data, null, 2));
  }

  async saveAnalysis() {
    await fs.writeFile(this.analysisFile, JSON.stringify(this.analysis, null, 2));
  }

  getPriorityWeight(priority) {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[priority] || 1;
  }

  calculateBlockerSeverity(blockingCount) {
    if (blockingCount >= 5) return 'high';
    if (blockingCount >= 3) return 'medium';
    return 'low';
  }

  /**
   * Get dependency statistics
   */
  async getStatistics() {
    return {
      totalTasks: this.dependencyGraph.size,
      totalDependencies: Array.from(this.dependencies.values()).reduce((sum, deps) => sum + deps.length, 0),
      averageDependencies: this.dependencyGraph.size > 0 
        ? Array.from(this.dependencies.values()).reduce((sum, deps) => sum + deps.length, 0) / this.dependencyGraph.size 
        : 0,
      criticalPathLength: this.analysis.criticalPath.length,
      blockerCount: this.analysis.blockers.length,
      circularDependencies: this.analysis.cycles.length,
      recommendationCount: this.analysis.recommendations.length,
      lastAnalyzed: this.analysis.lastAnalyzed
    };
  }

  /**
   * Export dependencies in various formats
   */
  async exportDependencies(format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    switch (format) {
    case 'json':
      const jsonFile = path.join(this.dataDir, `dependencies-export-${timestamp}.json`);
      await fs.writeFile(jsonFile, JSON.stringify({
        dependencies: Object.fromEntries(this.dependencies),
        analysis: this.analysis,
        statistics: await this.getStatistics()
      }, null, 2));
      return jsonFile;
        
    case 'csv':
      const csvFile = path.join(this.dataDir, `dependencies-export-${timestamp}.csv`);
      const csvContent = this.generateCSV();
      await fs.writeFile(csvFile, csvContent);
      return csvFile;
        
    case 'mermaid':
      const mermaidFile = path.join(this.dataDir, `dependencies-diagram-${timestamp}.md`);
      const mermaidContent = this.generateMermaidDiagram();
      await fs.writeFile(mermaidFile, mermaidContent);
      return mermaidFile;
        
    default:
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  generateCSV() {
    const lines = ['Source Task,Target Task,Dependency Type,Weight,Reason'];
    
    for (const [sourceId, deps] of this.dependencies.entries()) {
      for (const dep of deps) {
        lines.push(`${sourceId},${dep.targetId},${dep.type},${dep.weight},"${dep.reason}"`);
      }
    }
    
    return lines.join('\n');
  }

  generateMermaidDiagram() {
    const lines = ['```mermaid', 'graph TD'];
    
    // Add nodes
    for (const nodeId of this.dependencyGraph.keys()) {
      const shortId = nodeId.split('-').pop().substring(0, 6);
      lines.push(`    ${nodeId}[${shortId}]`);
    }
    
    // Add edges
    for (const [sourceId, deps] of this.dependencies.entries()) {
      for (const dep of deps) {
        lines.push(`    ${dep.targetId} --> ${sourceId}`);
      }
    }
    
    lines.push('```');
    return lines.join('\n');
  }
}

// CLI mode
if (require.main === module) {
  const resolver = new TaskDependencyResolver();
  
  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      await resolver.initialize();
      
      switch (command) {
      case 'analyze':
        console.log('🔍 Analyzing all task dependencies...\n');
        const result = await resolver.analyzeAllTasks();
        await resolver.generateVisualization();
        console.log(`\n✅ Analysis complete! Found ${result.dependenciesFound} dependencies`);
        break;
          
      case 'visualize':
        await resolver.generateVisualization();
        console.log('📊 Visualization generated successfully');
        break;
          
      case 'order':
        const ordering = resolver.getOptimalTaskOrdering();
        console.log('📋 Optimal task ordering:');
        ordering.forEach((taskId, index) => {
          console.log(`${index + 1}. ${taskId}`);
        });
        break;
          
      case 'stats':
        const stats = await resolver.getStatistics();
        console.log('📊 Dependency Statistics:');
        console.log(JSON.stringify(stats, null, 2));
        break;
          
      case 'export':
        const format = args[1] || 'json';
        const exportFile = await resolver.exportDependencies(format);
        console.log(`📤 Dependencies exported to: ${exportFile}`);
        break;
          
      case 'help':
      default:
        console.log(`
🔗 Task Dependency Resolver

USAGE:
  node TaskDependencyResolver.js <command> [options]

COMMANDS:
  analyze              Analyze all tasks for dependencies
  visualize            Generate dependency graph visualization
  order                Show optimal task ordering
  stats                Display dependency statistics
  export [format]      Export dependencies (json|csv|mermaid)
  help                 Show this help

EXAMPLES:
  node TaskDependencyResolver.js analyze
  node TaskDependencyResolver.js visualize
  node TaskDependencyResolver.js export csv
  node TaskDependencyResolver.js order

OUTPUT FILES:
  - task-dependencies.json     Dependency data
  - dependency-analysis.json   Analysis results  
  - dependency-graph.html      Interactive visualization
  - dependencies-export-*.csv  CSV export
`);
        break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = TaskDependencyResolver;