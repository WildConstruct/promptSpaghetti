#!/usr/bin/env node

/**
 * Agent Workload Balancer
 * 
 * Intelligently distributes tasks based on agent capacity, expertise, and load balancing
 * to optimize team productivity and ensure fair workload distribution.
 * 
 * Key Features:
 * - Capacity monitoring and load balancing
 * - Skill-based task assignment
 * - Dynamic workload distribution algorithms
 * - Agent performance tracking and optimization
 * - Overload prevention and workload alerts
 * - Integration with task management system
 * - Historical assignment analysis
 */

const fs = require('fs').promises;
const path = require('path');

class AgentWorkloadBalancer {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/workload');
    this.stateFile = path.join(__dirname, '../data/state.json');
    this.agentsFile = path.join(this.dataDir, 'agents.json');
    this.assignmentsFile = path.join(this.dataDir, 'assignments.json');
    this.metricsFile = path.join(this.dataDir, 'workload-metrics.json');
    this.historyFile = path.join(this.dataDir, 'assignment-history.json');
    
    // Configuration for workload balancing
    this.config = {
      balancing: {
        // Load balancing strategy
        strategy: 'weighted_round_robin', // round_robin, weighted_round_robin, least_loaded, skill_based
        
        // Capacity limits
        maxTasksPerAgent: 5,           // Maximum concurrent tasks
        overloadThreshold: 0.85,       // 85% capacity triggers warning
        criticalThreshold: 0.95,       // 95% capacity blocks new assignments
        
        // Skill matching
        skillMatchWeight: 0.4,         // 40% weight for skill matching
        capacityWeight: 0.3,           // 30% weight for current capacity
        performanceWeight: 0.2,        // 20% weight for past performance
        randomWeight: 0.1,             // 10% randomization for fairness
        
        // Rebalancing
        autoRebalance: true,           // Automatically rebalance workloads
        rebalanceInterval: 30 * 60 * 1000, // 30 minutes
        rebalanceThreshold: 0.3        // Rebalance if load difference > 30%
      },
      
      agents: {
        // Agent capacity calculation
        baseCapacity: 40,              // Base hours per week
        skillMultiplier: 1.2,          // Multiplier for specialized skills
        experienceBonus: 0.1,          // 10% bonus per experience level
        
        // Performance tracking
        performanceWindow: 30,         // Days to track performance
        velocityWeight: 0.5,           // Weight for task completion velocity
        qualityWeight: 0.5,            // Weight for task quality/QA pass rate
        
        // Skills and expertise
        skillLevels: {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
          expert: 4
        },
        
        skillAreas: [
          'frontend', 'backend', 'database', 'testing', 'devops',
          'security', 'performance', 'mobile', 'api', 'ui_ux'
        ]
      },
      
      tasks: {
        // Task complexity estimation
        complexityFactors: {
          linesOfCode: 0.1,            // Estimated LOC impact
          dependencies: 0.2,           // Number of dependencies
          newFeature: 1.5,             // New feature multiplier
          bugfix: 0.8,                 // Bug fix multiplier
          refactor: 1.2,               // Refactoring multiplier
          testing: 0.7                 // Testing task multiplier
        },
        
        // Priority weights for assignment
        priorityWeights: {
          critical: 5,
          high: 3,
          medium: 2,
          low: 1
        },
        
        // Effort estimation (in hours)
        defaultEffort: 4,              // Default effort if not specified
        maxEffort: 40,                 // Maximum effort for single task
        
        // Skill requirements matching
        requireExactMatch: false,      // Allow lower skill levels with guidance
        skillGapTolerance: 1           // Allow 1 skill level below requirement
      },
      
      notifications: {
        overloadAlerts: true,          // Alert when agents are overloaded
        rebalanceNotifications: true,  // Notify when rebalancing occurs
        assignmentUpdates: true,       // Notify on new assignments
        capacityWarnings: true         // Warn when approaching capacity
      }
    };
    
    this.agents = new Map();
    this.assignments = new Map();
    this.metrics = {
      totalAssignments: 0,
      averageLoadBalance: 0,
      overloadedAgents: 0,
      underutilizedAgents: 0,
      skillMatchRate: 0,
      lastRebalance: null
    };
    this.assignmentHistory = [];
  }

  /**
   * Initialize the workload balancer
   */
  async initialize() {
    try {
      await this.ensureDataDirectory();
      await this.loadConfiguration();
      await this.loadAgents();
      await this.loadAssignments();
      await this.loadMetrics();
      await this.loadHistory();
      
      // Start auto-rebalancing if enabled
      if (this.config.balancing.autoRebalance) {
        this.startAutoRebalancing();
      }
      
      console.log('✅ Agent Workload Balancer initialized');
      console.log(`👥 Managing ${this.agents.size} agents`);
      console.log(`📋 Tracking ${this.assignments.size} active assignments`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Agent Workload Balancer:', error);
      throw error;
    }
  }

  /**
   * Register or update an agent in the system
   */
  async registerAgent(agentData) {
    const agent = {
      id: agentData.id,
      name: agentData.name || agentData.id,
      capacity: agentData.capacity || this.config.agents.baseCapacity,
      skills: agentData.skills || {},
      performance: agentData.performance || { velocity: 1.0, quality: 1.0 },
      experience: agentData.experience || 'intermediate',
      availability: agentData.availability || 'available',
      timezone: agentData.timezone || 'UTC',
      preferences: agentData.preferences || {},
      
      // Calculated fields
      currentLoad: 0,
      assignedTasks: [],
      utilizationRate: 0,
      lastActivity: new Date().toISOString(),
      
      // Performance tracking
      completedTasks: 0,
      averageCompletionTime: 0,
      qualityScore: 1.0,
      overloadCount: 0,
      
      // Registration metadata
      registered: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    // Calculate effective capacity based on skills and experience
    agent.effectiveCapacity = this.calculateEffectiveCapacity(agent);
    
    this.agents.set(agent.id, agent);
    await this.saveAgents();
    
    console.log(`👤 Agent ${agent.name} registered with capacity ${agent.effectiveCapacity}h`);
    return agent;
  }

  /**
   * Assign a task to the best available agent
   */
  async assignTask(taskData) {
    console.log(`📋 Finding best agent for task: ${taskData.id}`);
    
    try {
      // Analyze task requirements
      const taskAnalysis = this.analyzeTask(taskData);
      
      // Find best agent for this task
      const bestAgent = await this.findBestAgent(taskAnalysis);
      
      if (!bestAgent) {
        throw new Error('No suitable agent available for this task');
      }
      
      // Create assignment
      const assignment = {
        id: `assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        taskId: taskData.id,
        agentId: bestAgent.id,
        assignedAt: new Date().toISOString(),
        estimatedEffort: taskAnalysis.estimatedEffort,
        priority: taskData.priority || 'medium',
        skillsRequired: taskAnalysis.skillsRequired,
        skillsMatched: this.calculateSkillMatch(bestAgent, taskAnalysis.skillsRequired),
        status: 'assigned',
        
        // Assignment reasoning
        assignmentReason: {
          strategy: this.config.balancing.strategy,
          capacityScore: this.calculateCapacityScore(bestAgent),
          skillScore: this.calculateSkillScore(bestAgent, taskAnalysis.skillsRequired),
          performanceScore: this.calculatePerformanceScore(bestAgent),
          totalScore: 0 // Will be calculated
        }
      };
      
      // Calculate total assignment score
      assignment.assignmentReason.totalScore = this.calculateTotalAssignmentScore(
        bestAgent, 
        taskAnalysis
      );
      
      // Update agent workload
      await this.updateAgentWorkload(bestAgent.id, assignment);
      
      // Store assignment
      this.assignments.set(assignment.id, assignment);
      await this.saveAssignments();
      
      // Update metrics
      await this.updateMetrics();
      
      // Record in history
      this.assignmentHistory.push({
        ...assignment,
        agentName: bestAgent.name,
        taskTitle: taskData.title
      });
      await this.saveHistory();
      
      // Send notifications if enabled
      if (this.config.notifications.assignmentUpdates) {
        await this.notifyAssignment(assignment, bestAgent, taskData);
      }
      
      console.log(`✅ Task ${taskData.id} assigned to ${bestAgent.name}`);
      console.log(`   Skill match: ${assignment.skillsMatched.toFixed(1)}%`);
      console.log(`   Agent utilization: ${bestAgent.utilizationRate.toFixed(1)}%`);
      
      return assignment;
      
    } catch (error) {
      console.error(`❌ Failed to assign task ${taskData.id}:`, error);
      throw error;
    }
  }

  /**
   * Complete a task assignment and update agent metrics
   */
  async completeTask(assignmentId, completionData = {}) {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }
    
    const agent = this.agents.get(assignment.agentId);
    if (!agent) {
      throw new Error(`Agent ${assignment.agentId} not found`);
    }
    
    // Update assignment
    assignment.status = 'completed';
    assignment.completedAt = new Date().toISOString();
    assignment.actualEffort = completionData.actualEffort || assignment.estimatedEffort;
    assignment.qualityScore = completionData.qualityScore || 1.0;
    assignment.notes = completionData.notes || '';
    
    // Calculate completion time
    const assignedTime = new Date(assignment.assignedAt);
    const completedTime = new Date(assignment.completedAt);
    assignment.completionTime = (completedTime - assignedTime) / (1000 * 60 * 60); // Hours
    
    // Update agent performance
    await this.updateAgentPerformance(agent, assignment);
    
    // Remove from active assignments and update workload
    await this.updateAgentWorkload(agent.id, assignment, 'remove');
    
    // Update metrics
    await this.updateMetrics();
    
    console.log(`✅ Task ${assignment.taskId} completed by ${agent.name}`);
    console.log(`   Completion time: ${assignment.completionTime.toFixed(1)}h`);
    console.log(`   Quality score: ${assignment.qualityScore.toFixed(2)}`);
    
    return assignment;
  }

  /**
   * Analyze task to determine requirements and complexity
   */
  analyzeTask(task) {
    const analysis = {
      id: task.id,
      title: task.title,
      complexity: 1.0,
      estimatedEffort: task.estimate || this.config.tasks.defaultEffort,
      skillsRequired: {},
      priority: task.priority || 'medium',
      urgency: this.calculateUrgency(task),
      dependencies: task.dependencies || [],
      tags: task.tags || []
    };
    
    // Extract skills from task content
    analysis.skillsRequired = this.extractRequiredSkills(task);
    
    // Calculate complexity based on various factors
    analysis.complexity = this.calculateTaskComplexity(task);
    
    // Adjust effort based on complexity
    analysis.estimatedEffort = Math.min(
      analysis.estimatedEffort * analysis.complexity,
      this.config.tasks.maxEffort
    );
    
    return analysis;
  }

  /**
   * Find the best agent for a given task
   */
  async findBestAgent(taskAnalysis) {
    const availableAgents = Array.from(this.agents.values()).filter(agent => 
      agent.availability === 'available' && 
      !this.isAgentOverloaded(agent)
    );
    
    if (availableAgents.length === 0) {
      return null;
    }
    
    // Score each agent for this task
    const agentScores = availableAgents.map(agent => ({
      agent,
      score: this.calculateTotalAssignmentScore(agent, taskAnalysis),
      breakdown: {
        capacity: this.calculateCapacityScore(agent),
        skill: this.calculateSkillScore(agent, taskAnalysis.skillsRequired),
        performance: this.calculatePerformanceScore(agent),
        availability: this.calculateAvailabilityScore(agent)
      }
    }));
    
    // Sort by score (highest first)
    agentScores.sort((a, b) => b.score - a.score);
    
    // Apply strategy-specific selection
    const selectedAgent = this.applySelectionStrategy(agentScores, taskAnalysis);
    
    return selectedAgent?.agent || null;
  }

  /**
   * Calculate total assignment score for an agent and task
   */
  calculateTotalAssignmentScore(agent, taskAnalysis) {
    const capacityScore = this.calculateCapacityScore(agent);
    const skillScore = this.calculateSkillScore(agent, taskAnalysis.skillsRequired);
    const performanceScore = this.calculatePerformanceScore(agent);
    const availabilityScore = this.calculateAvailabilityScore(agent);
    
    // Apply configured weights
    const totalScore = 
      (capacityScore * this.config.balancing.capacityWeight) +
      (skillScore * this.config.balancing.skillMatchWeight) +
      (performanceScore * this.config.balancing.performanceWeight) +
      (availabilityScore * 0.1) + // Small weight for availability
      (Math.random() * this.config.balancing.randomWeight); // Randomization
    
    return totalScore;
  }

  /**
   * Calculate capacity score (higher score = more available capacity)
   */
  calculateCapacityScore(agent) {
    const availableCapacity = agent.effectiveCapacity - agent.currentLoad;
    const utilizationRate = agent.currentLoad / agent.effectiveCapacity;
    
    // Score decreases as utilization increases
    return Math.max(0, 1 - utilizationRate);
  }

  /**
   * Calculate skill matching score
   */
  calculateSkillScore(agent, requiredSkills) {
    if (Object.keys(requiredSkills).length === 0) {
      return 0.5; // Neutral score for tasks with no specific skill requirements
    }
    
    let totalMatch = 0;
    let totalWeight = 0;
    
    for (const [skill, requiredLevel] of Object.entries(requiredSkills)) {
      const agentLevel = agent.skills[skill] || 0;
      const weight = requiredLevel; // Higher required levels have more weight
      
      // Calculate match score
      let matchScore = 0;
      if (agentLevel >= requiredLevel) {
        matchScore = 1.0; // Perfect match or better
      } else if (agentLevel >= requiredLevel - this.config.tasks.skillGapTolerance) {
        matchScore = 0.7; // Close match within tolerance
      } else {
        matchScore = agentLevel / requiredLevel; // Partial match
      }
      
      totalMatch += matchScore * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? totalMatch / totalWeight : 0.5;
  }

  /**
   * Calculate performance score based on historical data
   */
  calculatePerformanceScore(agent) {
    const velocityScore = Math.min(agent.performance.velocity / 1.0, 2.0) / 2.0;
    const qualityScore = Math.min(agent.qualityScore, 1.0);
    
    return (velocityScore * this.config.agents.velocityWeight) + 
           (qualityScore * this.config.agents.qualityWeight);
  }

  /**
   * Calculate availability score
   */
  calculateAvailabilityScore(agent) {
    if (agent.availability !== 'available') return 0;
    
    // Consider time zone if relevant
    const now = new Date();
    const agentHour = this.getAgentLocalHour(agent, now);
    
    // Score higher during typical working hours (9 AM - 6 PM)
    if (agentHour >= 9 && agentHour <= 18) {
      return 1.0;
    } else if (agentHour >= 8 && agentHour <= 20) {
      return 0.7;
    } else {
      return 0.3;
    }
  }

  /**
   * Apply selection strategy to choose from scored agents
   */
  applySelectionStrategy(agentScores, taskAnalysis) {
    switch (this.config.balancing.strategy) {
      case 'round_robin':
        return this.selectRoundRobin(agentScores);
        
      case 'weighted_round_robin':
        return this.selectWeightedRoundRobin(agentScores);
        
      case 'least_loaded':
        return this.selectLeastLoaded(agentScores);
        
      case 'skill_based':
        return this.selectSkillBased(agentScores, taskAnalysis);
        
      default:
        return agentScores[0]; // Highest score
    }
  }

  /**
   * Round-robin selection
   */
  selectRoundRobin(agentScores) {
    // Simple round-robin based on assignment count
    const sortedByAssignments = agentScores.sort((a, b) => 
      a.agent.assignedTasks.length - b.agent.assignedTasks.length
    );
    return sortedByAssignments[0];
  }

  /**
   * Weighted round-robin selection
   */
  selectWeightedRoundRobin(agentScores) {
    // Combine score and load balancing
    const weighted = agentScores.map(item => ({
      ...item,
      weightedScore: item.score * (2 - item.agent.utilizationRate)
    }));
    
    weighted.sort((a, b) => b.weightedScore - a.weightedScore);
    return weighted[0];
  }

  /**
   * Least loaded selection
   */
  selectLeastLoaded(agentScores) {
    const sortedByLoad = agentScores.sort((a, b) => 
      a.agent.utilizationRate - b.agent.utilizationRate
    );
    return sortedByLoad[0];
  }

  /**
   * Skill-based selection
   */
  selectSkillBased(agentScores, taskAnalysis) {
    // Prioritize skill match over other factors
    const skillFocused = agentScores.map(item => ({
      ...item,
      skillFocusedScore: (item.breakdown.skill * 0.7) + (item.score * 0.3)
    }));
    
    skillFocused.sort((a, b) => b.skillFocusedScore - a.skillFocusedScore);
    return skillFocused[0];
  }

  /**
   * Update agent workload after assignment/completion
   */
  async updateAgentWorkload(agentId, assignment, action = 'add') {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    if (action === 'add') {
      agent.assignedTasks.push(assignment.id);
      agent.currentLoad += assignment.estimatedEffort;
    } else if (action === 'remove') {
      const index = agent.assignedTasks.indexOf(assignment.id);
      if (index > -1) {
        agent.assignedTasks.splice(index, 1);
        agent.currentLoad -= assignment.estimatedEffort;
      }
    }
    
    // Ensure current load doesn't go negative
    agent.currentLoad = Math.max(0, agent.currentLoad);
    
    // Update utilization rate
    agent.utilizationRate = agent.currentLoad / agent.effectiveCapacity;
    
    // Update last activity
    agent.lastActivity = new Date().toISOString();
    
    // Check for overload
    if (agent.utilizationRate > this.config.balancing.overloadThreshold) {
      agent.overloadCount++;
      
      if (this.config.notifications.overloadAlerts) {
        await this.notifyOverload(agent);
      }
    }
    
    await this.saveAgents();
  }

  /**
   * Update agent performance metrics after task completion
   */
  async updateAgentPerformance(agent, assignment) {
    agent.completedTasks++;
    
    // Update average completion time
    const alpha = 0.1; // Exponential moving average factor
    agent.averageCompletionTime = agent.averageCompletionTime * (1 - alpha) + 
                                  assignment.completionTime * alpha;
    
    // Update quality score
    agent.qualityScore = agent.qualityScore * (1 - alpha) + 
                        assignment.qualityScore * alpha;
    
    // Update velocity (tasks per hour)
    const velocity = 1 / assignment.completionTime;
    agent.performance.velocity = agent.performance.velocity * (1 - alpha) + 
                                velocity * alpha;
    
    // Update quality performance
    agent.performance.quality = agent.performance.quality * (1 - alpha) + 
                               assignment.qualityScore * alpha;
    
    agent.lastUpdated = new Date().toISOString();
    await this.saveAgents();
  }

  /**
   * Check if agent is overloaded
   */
  isAgentOverloaded(agent) {
    return agent.utilizationRate >= this.config.balancing.criticalThreshold;
  }

  /**
   * Calculate effective capacity based on skills and experience
   */
  calculateEffectiveCapacity(agent) {
    let capacity = agent.capacity;
    
    // Apply experience bonus
    const experienceLevels = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
    const experienceLevel = experienceLevels[agent.experience] || 1;
    capacity *= (1 + (experienceLevel * this.config.agents.experienceBonus));
    
    // Apply skill multiplier for specialized skills
    const skillCount = Object.keys(agent.skills).length;
    const averageSkillLevel = Object.values(agent.skills).reduce((a, b) => a + b, 0) / skillCount || 1;
    
    if (averageSkillLevel >= 3) { // Advanced/Expert level
      capacity *= this.config.agents.skillMultiplier;
    }
    
    return Math.round(capacity);
  }

  /**
   * Extract required skills from task description
   */
  extractRequiredSkills(task) {
    const skills = {};
    const text = `${task.title || ''} ${task.description || ''} ${(task.tags || []).join(' ')}`.toLowerCase();
    
    // Skill keyword mapping
    const skillKeywords = {
      frontend: ['frontend', 'react', 'vue', 'angular', 'javascript', 'css', 'html', 'ui'],
      backend: ['backend', 'api', 'server', 'node', 'express', 'fastify', 'database'],
      database: ['database', 'sql', 'mongodb', 'postgres', 'mysql', 'redis'],
      testing: ['test', 'testing', 'jest', 'cypress', 'unit test', 'integration'],
      devops: ['devops', 'docker', 'kubernetes', 'ci/cd', 'deployment', 'aws'],
      security: ['security', 'auth', 'authentication', 'encryption', 'vulnerability'],
      performance: ['performance', 'optimization', 'speed', 'memory', 'cache'],
      mobile: ['mobile', 'react native', 'ios', 'android', 'app'],
      api: ['api', 'rest', 'graphql', 'endpoint', 'integration'],
      ui_ux: ['ui', 'ux', 'design', 'interface', 'user experience']
    };
    
    // Extract skill requirements and estimate levels
    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          // Estimate required skill level based on task complexity
          let level = 2; // Default intermediate level
          
          if (text.includes('complex') || text.includes('advanced') || text.includes('expert')) {
            level = 3;
          } else if (text.includes('simple') || text.includes('basic') || text.includes('beginner')) {
            level = 1;
          }
          
          skills[skill] = Math.max(skills[skill] || 0, level);
          break; // Found this skill, move to next
        }
      }
    }
    
    return skills;
  }

  /**
   * Calculate task complexity
   */
  calculateTaskComplexity(task) {
    let complexity = 1.0;
    
    const text = `${task.title || ''} ${task.description || ''}`.toLowerCase();
    
    // Apply complexity factors
    if (text.includes('new feature')) {
      complexity *= this.config.tasks.complexityFactors.newFeature;
    } else if (text.includes('bug') || text.includes('fix')) {
      complexity *= this.config.tasks.complexityFactors.bugfix;
    } else if (text.includes('refactor')) {
      complexity *= this.config.tasks.complexityFactors.refactor;
    } else if (text.includes('test')) {
      complexity *= this.config.tasks.complexityFactors.testing;
    }
    
    // Adjust for dependencies
    const dependencies = task.dependencies || [];
    complexity += dependencies.length * this.config.tasks.complexityFactors.dependencies;
    
    // Adjust for estimated lines of code (if provided)
    if (task.estimatedLOC) {
      complexity += task.estimatedLOC * this.config.tasks.complexityFactors.linesOfCode;
    }
    
    return Math.min(complexity, 3.0); // Cap at 3x complexity
  }

  /**
   * Calculate task urgency
   */
  calculateUrgency(task) {
    const priority = task.priority || 'medium';
    const priorityWeights = this.config.tasks.priorityWeights;
    
    let urgency = priorityWeights[priority] || priorityWeights.medium;
    
    // Increase urgency if task is overdue
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
      
      if (daysUntilDue < 0) {
        urgency *= 2; // Double urgency for overdue tasks
      } else if (daysUntilDue < 1) {
        urgency *= 1.5; // Increase urgency for tasks due soon
      }
    }
    
    return urgency;
  }

  /**
   * Calculate skill match percentage
   */
  calculateSkillMatch(agent, requiredSkills) {
    if (Object.keys(requiredSkills).length === 0) return 100;
    
    let totalMatch = 0;
    let totalRequired = 0;
    
    for (const [skill, requiredLevel] of Object.entries(requiredSkills)) {
      const agentLevel = agent.skills[skill] || 0;
      const matchPercentage = Math.min(agentLevel / requiredLevel, 1.0) * 100;
      
      totalMatch += matchPercentage * requiredLevel;
      totalRequired += requiredLevel * 100;
    }
    
    return totalRequired > 0 ? totalMatch / totalRequired * 100 : 100;
  }

  /**
   * Get agent's local hour
   */
  getAgentLocalHour(agent, date) {
    // Simplified timezone handling
    const utcHour = date.getUTCHours();
    const timezoneOffsets = {
      'EST': -5, 'PST': -8, 'UTC': 0, 'CET': 1, 'JST': 9
    };
    
    const offset = timezoneOffsets[agent.timezone] || 0;
    return (utcHour + offset + 24) % 24;
  }

  /**
   * Start automatic rebalancing
   */
  startAutoRebalancing() {
    setInterval(async () => {
      try {
        await this.rebalanceWorkloads();
      } catch (error) {
        console.error('Auto-rebalancing failed:', error);
      }
    }, this.config.balancing.rebalanceInterval);
    
    console.log('🔄 Auto-rebalancing started');
  }

  /**
   * Rebalance workloads across agents
   */
  async rebalanceWorkloads() {
    console.log('🔄 Checking for workload rebalancing...');
    
    const agents = Array.from(this.agents.values()).filter(agent => 
      agent.availability === 'available'
    );
    
    if (agents.length < 2) return;
    
    // Calculate load distribution
    const loads = agents.map(agent => agent.utilizationRate);
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);
    
    // Check if rebalancing is needed
    const loadDifference = maxLoad - minLoad;
    if (loadDifference < this.config.balancing.rebalanceThreshold) {
      return; // No rebalancing needed
    }
    
    console.log(`⚖️  Load imbalance detected: ${(loadDifference * 100).toFixed(1)}%`);
    
    // Find overloaded and underutilized agents
    const overloadedAgents = agents.filter(agent => 
      agent.utilizationRate > avgLoad + (loadDifference / 2)
    );
    
    const underutilizedAgents = agents.filter(agent => 
      agent.utilizationRate < avgLoad - (loadDifference / 2)
    );
    
    // Attempt to reassign tasks
    let rebalanced = 0;
    
    for (const overloadedAgent of overloadedAgents) {
      const reassignableTasks = this.findReassignableTasks(overloadedAgent);
      
      for (const taskId of reassignableTasks) {
        const assignment = this.assignments.get(taskId);
        if (!assignment) continue;
        
        // Find suitable underutilized agent
        const targetAgent = this.findBestReassignmentTarget(
          assignment, 
          underutilizedAgents
        );
        
        if (targetAgent) {
          await this.reassignTask(assignment, targetAgent);
          rebalanced++;
          break; // One task per iteration to avoid over-reassignment
        }
      }
    }
    
    if (rebalanced > 0) {
      console.log(`✅ Rebalanced ${rebalanced} tasks`);
      this.metrics.lastRebalance = new Date().toISOString();
      
      if (this.config.notifications.rebalanceNotifications) {
        await this.notifyRebalancing(rebalanced, loadDifference);
      }
    }
  }

  /**
   * Find tasks that can be reassigned from an overloaded agent
   */
  findReassignableTasks(agent) {
    // Return tasks that haven't been started yet or are low priority
    return agent.assignedTasks.filter(taskId => {
      const assignment = this.assignments.get(taskId);
      return assignment && 
             assignment.status === 'assigned' && 
             assignment.priority !== 'critical';
    });
  }

  /**
   * Find best target agent for task reassignment
   */
  findBestReassignmentTarget(assignment, candidateAgents) {
    if (candidateAgents.length === 0) return null;
    
    // Score candidates based on capacity and skill match
    const scored = candidateAgents.map(agent => ({
      agent,
      score: this.calculateCapacityScore(agent) + 
             this.calculateSkillScore(agent, assignment.skillsRequired || {})
    }));
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.agent;
  }

  /**
   * Reassign a task to a different agent
   */
  async reassignTask(assignment, newAgent) {
    const oldAgent = this.agents.get(assignment.agentId);
    
    if (oldAgent) {
      await this.updateAgentWorkload(oldAgent.id, assignment, 'remove');
    }
    
    assignment.agentId = newAgent.id;
    assignment.reassignedAt = new Date().toISOString();
    assignment.reassignmentReason = 'workload_rebalancing';
    
    await this.updateAgentWorkload(newAgent.id, assignment, 'add');
    
    console.log(`📋 Task ${assignment.taskId} reassigned from ${oldAgent?.name} to ${newAgent.name}`);
  }

  /**
   * Update system metrics
   */
  async updateMetrics() {
    const agents = Array.from(this.agents.values());
    const assignments = Array.from(this.assignments.values()).filter(a => a.status === 'assigned');
    
    // Calculate utilization statistics
    const utilizationRates = agents.map(agent => agent.utilizationRate);
    const avgUtilization = utilizationRates.reduce((a, b) => a + b, 0) / utilizationRates.length || 0;
    
    // Calculate load balance (lower is better)
    const loadVariance = utilizationRates.reduce((sum, rate) => 
      sum + Math.pow(rate - avgUtilization, 2), 0
    ) / utilizationRates.length;
    
    this.metrics = {
      totalAssignments: assignments.length,
      averageUtilization: avgUtilization,
      loadBalance: 1 - Math.sqrt(loadVariance), // Convert variance to balance score
      overloadedAgents: agents.filter(agent => 
        agent.utilizationRate > this.config.balancing.overloadThreshold
      ).length,
      underutilizedAgents: agents.filter(agent => 
        agent.utilizationRate < 0.3 && agent.availability === 'available'
      ).length,
      skillMatchRate: this.calculateAverageSkillMatch(assignments),
      lastUpdate: new Date().toISOString(),
      lastRebalance: this.metrics.lastRebalance
    };
    
    await this.saveMetrics();
  }

  /**
   * Calculate average skill match rate across assignments
   */
  calculateAverageSkillMatch(assignments) {
    if (assignments.length === 0) return 0;
    
    const matches = assignments.map(assignment => assignment.skillsMatched || 0);
    return matches.reduce((a, b) => a + b, 0) / matches.length;
  }

  // Notification methods

  async notifyAssignment(assignment, agent, task) {
    console.log(`📧 Assignment notification: ${task.title} → ${agent.name}`);
  }

  async notifyOverload(agent) {
    console.log(`⚠️  Overload alert: ${agent.name} at ${(agent.utilizationRate * 100).toFixed(1)}% capacity`);
  }

  async notifyRebalancing(taskCount, loadDifference) {
    console.log(`🔄 Rebalancing notification: ${taskCount} tasks moved, load difference reduced by ${(loadDifference * 100).toFixed(1)}%`);
  }

  // Data persistence methods

  async ensureDataDirectory() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async loadConfiguration() {
    // Load configuration if exists, otherwise use defaults
  }

  async loadAgents() {
    try {
      const data = await fs.readFile(this.agentsFile, 'utf8');
      const agentsData = JSON.parse(data);
      
      for (const [id, agent] of Object.entries(agentsData)) {
        this.agents.set(id, agent);
      }
    } catch {
      // No existing agents file
    }
  }

  async saveAgents() {
    const agentsData = Object.fromEntries(this.agents);
    await fs.writeFile(this.agentsFile, JSON.stringify(agentsData, null, 2));
  }

  async loadAssignments() {
    try {
      const data = await fs.readFile(this.assignmentsFile, 'utf8');
      const assignmentsData = JSON.parse(data);
      
      for (const [id, assignment] of Object.entries(assignmentsData)) {
        this.assignments.set(id, assignment);
      }
    } catch {
      // No existing assignments file
    }
  }

  async saveAssignments() {
    const assignmentsData = Object.fromEntries(this.assignments);
    await fs.writeFile(this.assignmentsFile, JSON.stringify(assignmentsData, null, 2));
  }

  async loadMetrics() {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf8');
      this.metrics = JSON.parse(data);
    } catch {
      // Use default metrics
    }
  }

  async saveMetrics() {
    await fs.writeFile(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  async loadHistory() {
    try {
      const data = await fs.readFile(this.historyFile, 'utf8');
      this.assignmentHistory = JSON.parse(data);
    } catch {
      // No existing history
    }
  }

  async saveHistory() {
    await fs.writeFile(this.historyFile, JSON.stringify(this.assignmentHistory, null, 2));
  }

  /**
   * Get workload statistics
   */
  async getStatistics() {
    const agents = Array.from(this.agents.values());
    const activeAssignments = Array.from(this.assignments.values()).filter(a => a.status === 'assigned');
    
    return {
      agents: {
        total: agents.length,
        available: agents.filter(a => a.availability === 'available').length,
        overloaded: this.metrics.overloadedAgents,
        underutilized: this.metrics.underutilizedAgents
      },
      
      assignments: {
        active: activeAssignments.length,
        total: this.metrics.totalAssignments,
        averageSkillMatch: this.metrics.skillMatchRate.toFixed(1) + '%'
      },
      
      performance: {
        averageUtilization: (this.metrics.averageUtilization * 100).toFixed(1) + '%',
        loadBalance: (this.metrics.loadBalance * 100).toFixed(1) + '%',
        lastRebalance: this.metrics.lastRebalance
      },
      
      history: {
        totalAssignments: this.assignmentHistory.length,
        completedTasks: this.assignmentHistory.filter(a => a.status === 'completed').length
      }
    };
  }
}

// CLI mode
if (require.main === module) {
  const balancer = new AgentWorkloadBalancer();
  
  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      await balancer.initialize();
      
      switch (command) {
        case 'register':
          const agentData = {
            id: args[1] || `agent-${Date.now()}`,
            name: args[2] || args[1],
            skills: JSON.parse(args[3] || '{}'),
            capacity: parseInt(args[4]) || 40
          };
          
          const agent = await balancer.registerAgent(agentData);
          console.log(`✅ Agent registered: ${JSON.stringify(agent, null, 2)}`);
          break;
          
        case 'assign':
          const taskData = {
            id: args[1],
            title: args[2] || 'Test Task',
            priority: args[3] || 'medium',
            estimate: parseInt(args[4]) || 4
          };
          
          const assignment = await balancer.assignTask(taskData);
          console.log(`✅ Task assigned: ${JSON.stringify(assignment, null, 2)}`);
          break;
          
        case 'complete':
          const assignmentId = args[1];
          const completionData = {
            actualEffort: parseInt(args[2]) || null,
            qualityScore: parseFloat(args[3]) || 1.0
          };
          
          const completed = await balancer.completeTask(assignmentId, completionData);
          console.log(`✅ Task completed: ${JSON.stringify(completed, null, 2)}`);
          break;
          
        case 'rebalance':
          await balancer.rebalanceWorkloads();
          console.log('✅ Workload rebalancing completed');
          break;
          
        case 'stats':
          const stats = await balancer.getStatistics();
          console.log('📊 Workload Balancer Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;
          
        case 'agents':
          const agents = Array.from(balancer.agents.values());
          console.log('👥 Registered Agents:');
          agents.forEach(agent => {
            console.log(`  ${agent.name}: ${(agent.utilizationRate * 100).toFixed(1)}% utilized`);
          });
          break;
          
        case 'help':
        default:
          console.log(`
⚖️  Agent Workload Balancer

USAGE:
  node AgentWorkloadBalancer.js <command> [options]

COMMANDS:
  register <id> [name] [skills] [capacity]    Register a new agent
  assign <taskId> [title] [priority] [effort]  Assign a task
  complete <assignmentId> [effort] [quality]   Complete a task
  rebalance                                    Manual workload rebalancing
  stats                                        Display balancer statistics
  agents                                       List all agents and utilization
  help                                         Show this help

EXAMPLES:
  node AgentWorkloadBalancer.js register agent1 "John Doe" '{"frontend":3,"testing":2}' 40
  node AgentWorkloadBalancer.js assign T-123 "Fix login bug" high 6
  node AgentWorkloadBalancer.js complete assign-123 8 0.9
  node AgentWorkloadBalancer.js stats

SKILLS:
  Skills are JSON objects with skill names and levels (1-4):
  {"frontend": 3, "backend": 2, "testing": 4}
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

module.exports = AgentWorkloadBalancer;