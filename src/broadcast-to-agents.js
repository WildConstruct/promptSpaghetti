#!/usr/bin/env node

/**
 * Agent Broadcasting System
 *
 * Allows posting broadcast messages that all connected Claude Code agents can check.
 * Messages are stored in a shared file that agents can periodically check.
 */

const fs = require('fs');
const path = require('path');

const BROADCAST_FILE = path.join(__dirname, 'data', 'agent-broadcast.json');
const message = process.argv[2];
const command = process.argv[3] || 'check';

// Initialize broadcast file if it doesn't exist
function initializeBroadcastFile() {
  if (!fs.existsSync(BROADCAST_FILE)) {
    const initialData = {
      messages: [],
      lastUpdate: new Date().toISOString()
    };
    fs.writeFileSync(BROADCAST_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Post a broadcast message
function postBroadcast(message) {
  initializeBroadcastFile();

  const data = JSON.parse(fs.readFileSync(BROADCAST_FILE, 'utf8'));

  const newMessage = {
    id: `broadcast-${Date.now()}`,
    message: message,
    timestamp: new Date().toISOString(),
    priority: 'normal',
    acknowledged: []
  };

  data.messages.unshift(newMessage);
  data.lastUpdate = new Date().toISOString();

  // Keep only last 10 messages
  data.messages = data.messages.slice(0, 10);

  fs.writeFileSync(BROADCAST_FILE, JSON.stringify(data, null, 2));

  console.log('📢 Broadcast sent to all agents:');
  console.log(`   Message: ${message}`);
  console.log(`   Time: ${newMessage.timestamp}`);
  console.log(`   ID: ${newMessage.id}`);
  console.log('\nAgents can check with: node src/broadcast-to-agents.js check');
}

// Check for broadcast messages
function checkBroadcasts() {
  initializeBroadcastFile();

  const data = JSON.parse(fs.readFileSync(BROADCAST_FILE, 'utf8'));

  if (data.messages.length === 0) {
    console.log('📭 No broadcast messages');
    return;
  }

  console.log(`📢 Agent Broadcast Messages (${data.messages.length}):`);
  console.log('='.repeat(50));

  data.messages.forEach((msg, index) => {
    const age = Math.round(
      (new Date() - new Date(msg.timestamp)) / (1000 * 60)
    );
    console.log(`${index + 1}. [${msg.id}] (${age}m ago)`);
    console.log(`   📝 ${msg.message}`);
    console.log(`   🕐 ${msg.timestamp}`);
    console.log('');
  });
}

// Acknowledge a message
function acknowledgeBroadcast(messageId, agentId = 'claude-agent') {
  initializeBroadcastFile();

  const data = JSON.parse(fs.readFileSync(BROADCAST_FILE, 'utf8'));
  const message = data.messages.find(m => m.id === messageId);

  if (message && !message.acknowledged.includes(agentId)) {
    message.acknowledged.push(agentId);
    fs.writeFileSync(BROADCAST_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Message ${messageId} acknowledged by ${agentId}`);
  }
}

// Clear old messages
function clearBroadcasts() {
  const data = {
    messages: [],
    lastUpdate: new Date().toISOString()
  };
  fs.writeFileSync(BROADCAST_FILE, JSON.stringify(data, null, 2));
  console.log('🗑️  All broadcast messages cleared');
}

// Main execution
if (command === 'check') {
  checkBroadcasts();
} else if (command === 'clear') {
  clearBroadcasts();
} else if (command === 'ack' && message) {
  const agentId = process.argv[4] || 'claude-agent';
  acknowledgeBroadcast(message, agentId);
} else if (message) {
  postBroadcast(message);
} else {
  console.log(`📢 Agent Broadcasting System

Usage:
  node src/broadcast-to-agents.js "message"     # Send broadcast to all agents
  node src/broadcast-to-agents.js check         # Check for broadcasts  
  node src/broadcast-to-agents.js clear         # Clear all messages
  node src/broadcast-to-agents.js msg-id ack    # Acknowledge a message

Examples:
  node src/broadcast-to-agents.js "All agents: Please run QA pipeline now"
  node src/broadcast-to-agents.js "Priority shift: Focus on Epic 8 tasks only"
  node src/broadcast-to-agents.js "System maintenance in 30 minutes - finish current tasks"
`);
}
