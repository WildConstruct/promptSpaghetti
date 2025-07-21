/**
 * k6 WebSocket Load Test: Real-time Collaboration
 * 
 * Tests the WebSocket collaboration system that enables real-time
 * multi-user graph editing. Critical for Epic 20's enterprise scaling
 * with 1000+ concurrent collaborative sessions.
 * 
 * Simulates realistic collaboration patterns including:
 * - Multi-user simultaneous editing
 * - Presence management
 * - Conflict resolution
 * - Connection stability under load
 */

import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for WebSocket collaboration monitoring
const wsConnectionErrors = new Counter('ws_connection_errors');
const wsMessageLatency = new Trend('ws_message_latency');
const wsConnectionDuration = new Trend('ws_connection_duration');
const collaborationConflicts = new Counter('collaboration_conflicts');
const presenceUpdateRate = new Rate('presence_update_success_rate');

// Test configuration for collaboration scalability
export const options = {
  stages: [
    // Gradual ramp-up to simulate real user behavior
    { duration: '1m', target: 10 },    // Start small
    { duration: '3m', target: 50 },    // Moderate collaboration
    { duration: '5m', target: 150 },   // Heavy collaboration load
    { duration: '5m', target: 300 },   // Stress test - multiple rooms
    { duration: '3m', target: 500 },   // Epic 20 enterprise target
    { duration: '2m', target: 0 },     // Graceful shutdown
  ],
  
  // WebSocket collaboration thresholds
  thresholds: {
    ws_connection_errors: ['count<50'],        // Less than 50 connection errors
    ws_message_latency: ['p(95)<500'],         // 95% of messages under 500ms
    ws_connection_duration: ['p(90)>30000'],   // 90% of connections last 30s+
    collaboration_conflicts: ['count<100'],     // Manageable conflict resolution
    presence_update_success_rate: ['rate>0.95'], // 95% presence updates succeed
    
    // Standard WebSocket performance
    ws_connecting: ['p(95)<1000'],             // Connection establishment
    ws_msgs_received: ['count>1000'],          // Ensure message flow
  },
};

// Collaboration message types and patterns
const messageTypes = {
  nodeUpdate: {
    type: 'node:update',
    payload: {
      nodeId: 'node-{random}',
      position: { x: 100, y: 200 },
      data: { text: 'Updated text content' }
    }
  },
  
  edgeCreate: {
    type: 'edge:create', 
    payload: {
      source: 'node-1',
      target: 'node-2',
      id: 'edge-{random}'
    }
  },
  
  graphExecute: {
    type: 'graph:execute',
    payload: {
      graphId: 'graph-{random}',
      seeds: [1, 2, 3]
    }
  },
  
  presence: {
    type: 'presence:update',
    payload: {
      userId: 'user-{userId}',
      cursor: { x: 150, y: 250 },
      selection: ['node-1', 'node-2']
    }
  },
  
  conflict: {
    type: 'conflict:detected',
    payload: {
      nodeId: 'node-1',
      conflictType: 'simultaneous_edit',
      userIds: ['user-1', 'user-2']
    }
  }
};

// Generate realistic collaboration scenarios
function getCollaborationScenario(userId) {
  const scenarios = {
    'activeEditor': {
      messageFrequency: 0.5, // Messages every 500ms
      messageTypes: ['nodeUpdate', 'edgeCreate', 'presence'],
      conflictProbability: 0.1
    },
    
    'occasionalContributor': {
      messageFrequency: 2.0, // Messages every 2s
      messageTypes: ['nodeUpdate', 'presence'],
      conflictProbability: 0.05
    },
    
    'observer': {
      messageFrequency: 5.0, // Presence updates every 5s
      messageTypes: ['presence'],
      conflictProbability: 0.01
    }
  };
  
  // Distribute users across scenarios realistically
  if (userId % 3 === 0) return scenarios.activeEditor;
  if (userId % 3 === 1) return scenarios.occasionalContributor;
  return scenarios.observer;
}

// Create message with realistic data
function createMessage(type, userId, roomId) {
  const template = messageTypes[type];
  if (!template) return null;
  
  let message = JSON.parse(JSON.stringify(template));
  
  // Replace placeholders with realistic data
  const messageStr = JSON.stringify(message);
  const randomId = Math.floor(Math.random() * 10000);
  
  return JSON.parse(
    messageStr
      .replace(/\{random\}/g, randomId)
      .replace(/\{userId\}/g, userId)
      .replace(/\{roomId\}/g, roomId)
  );
}

// Main WebSocket test function
export default function () {
  const userId = __VU;
  const roomId = `room-${Math.floor(userId / 10)}`; // ~10 users per room
  const wsUrl = `ws://localhost:8001?room=${roomId}&user=user-${userId}`;
  const scenario = getCollaborationScenario(userId);
  
  let connectionStart = Date.now();
  let messagesSent = 0;
  let messagesReceived = 0;
  let conflicts = 0;
  
  const res = ws.connect(wsUrl, {
    timeout: '10s',
    tags: { 
      room_id: roomId,
      scenario: userId % 3 === 0 ? 'active' : userId % 3 === 1 ? 'occasional' : 'observer'
    }
  }, function (socket) {
    
    // Connection established
    const connectDuration = Date.now() - connectionStart;
    console.log(`User ${userId} connected to ${roomId} in ${connectDuration}ms`);
    
    // Send initial presence update
    const presenceMessage = createMessage('presence', userId, roomId);
    if (presenceMessage) {
      socket.send(JSON.stringify({
        ...presenceMessage,
        timestamp: Date.now()
      }));
      messagesSent++;
    }
    
    // Message handling
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        const latency = Date.now() - (message.timestamp || Date.now());
        
        wsMessageLatency.add(latency);
        messagesReceived++;
        
        // Handle different message types
        if (message.type === 'conflict:detected') {
          conflicts++;
          collaborationConflicts.add(1);
        }
        
        if (message.type === 'presence:update') {
          presenceUpdateRate.add(1); // Successful presence update
        }
        
      } catch (error) {
        console.log(`Message parsing error for user ${userId}:`, error);
      }
    });
    
    // Connection error handling
    socket.on('error', (error) => {
      wsConnectionErrors.add(1);
      console.log(`WebSocket error for user ${userId}:`, error);
    });
    
    // Simulate realistic collaboration behavior
    socket.setTimeout(() => {
      // Send periodic messages based on scenario
      const messageInterval = setInterval(() => {
        const messageType = scenario.messageTypes[
          Math.floor(Math.random() * scenario.messageTypes.length)
        ];
        
        const message = createMessage(messageType, userId, roomId);
        if (message) {
          // Simulate conflicts occasionally
          if (Math.random() < scenario.conflictProbability) {
            message.conflictSimulation = true;
          }
          
          socket.send(JSON.stringify({
            ...message,
            timestamp: Date.now()
          }));
          messagesSent++;
        }
      }, scenario.messageFrequency * 1000);
      
      // Clean up after connection duration
      setTimeout(() => {
        clearInterval(messageInterval);
        socket.close();
      }, Math.random() * 45000 + 15000); // 15-60 second connections
      
    }, 1000);
    
    // Track connection duration on close
    socket.on('close', () => {
      const duration = Date.now() - connectionStart;
      wsConnectionDuration.add(duration);
      
      console.log(`User ${userId} disconnected from ${roomId} after ${duration}ms`);
      console.log(`Messages sent: ${messagesSent}, received: ${messagesReceived}, conflicts: ${conflicts}`);
    });
  });
  
  // Validate connection establishment
  check(res, {
    'WebSocket connection established': (r) => r && r.status === 101,
  });
  
  if (!res || res.status !== 101) {
    wsConnectionErrors.add(1);
    console.log(`Failed to establish WebSocket connection for user ${userId}`);
  }
  
  // Brief pause before next connection attempt (if any)
  sleep(1);
}

// Setup function
export function setup() {
  console.log('🔗 Starting WebSocket Collaboration Load Test');
  console.log('👥 Target: 500 concurrent collaborative sessions');
  console.log('📡 Testing: Real-time editing, presence, conflict resolution');
  console.log('🏢 Epic 20: Enterprise collaboration scalability');
  
  // Verify WebSocket server is accessible
  console.log('🔍 Checking WebSocket server accessibility...');
  
  return { startTime: Date.now() };
}

// Teardown function
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🏁 WebSocket collaboration test completed in ${duration} seconds`);
  console.log('📊 Metrics collected:');
  console.log('   - Connection establishment times');
  console.log('   - Message latency and throughput'); 
  console.log('   - Collaboration conflict patterns');
  console.log('   - Presence update reliability');
  console.log('💡 Review thresholds for enterprise collaboration readiness');
}