'use strict';
// src/gateway/index.ts
// Discord Gateway - Single point of Discord communication
Object.defineProperty(exports, '__esModule', { value: true });
const discord_js_1 = require('discord.js');
const events_1 = require('../core/events');
const state_1 = require('../core/state');
const validator_1 = require('../core/validator');
const projector_1 = require('../core/projector');
// Configuration
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const BATCH_WINDOW_MS = 500;
const EVENT_CHECK_INTERVAL_MS = 1000;
if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN environment variable required');
  process.exit(1);
}
// Discord client
const client = new discord_js_1.Client({
  intents: [
    discord_js_1.GatewayIntentBits.Guilds,
    discord_js_1.GatewayIntentBits.GuildMessages,
    discord_js_1.GatewayIntentBits.MessageContent,
  ],
});
// Event batching
const eventBatch = [];
let batchTimer = null;
// Track last processed event
let lastEventId = 0;
/**
 * Initialize gateway
 */
async function init() {
  console.log('🚀 Starting Discord Gateway...');
  // Get latest event ID
  lastEventId = (0, events_1.getLatestEventId)();
  console.log(`📍 Starting from event ID: ${lastEventId}`);
  // Login to Discord
  await client.login(DISCORD_TOKEN);
}
/**
 * Discord ready handler
 */
client.once('ready', () => {
  console.log(`✅ Discord Gateway online as ${client.user?.tag}`);
  // Start event processing loop
  startEventLoop();
  // Register slash commands
  registerCommands();
});
/**
 * Process new events and project to Discord
 */
async function processEvents() {
  try {
    const newEvents = (0, events_1.fetchSince)(lastEventId, 100);
    for (const event of newEvents) {
      lastEventId = event.id;
      if ((0, projector_1.shouldBatch)(event)) {
        addToBatch(event);
      } else {
        // Send immediately
        const message = (0, projector_1.projectEvent)(event);
        if (message) {
          await sendToDiscord(message);
        }
      }
    }
  } catch (error) {
    console.error('Error processing events:', error);
  }
}
/**
 * Add event to batch
 */
function addToBatch(event) {
  eventBatch.push(event);
  // Reset timer
  if (batchTimer) {
    clearTimeout(batchTimer);
  }
  batchTimer = setTimeout(flushBatch, BATCH_WINDOW_MS);
}
/**
 * Send batched events
 */
async function flushBatch() {
  if (eventBatch.length === 0) return;
  const message = (0, projector_1.batchProject)([...eventBatch]);
  eventBatch.length = 0;
  if (message) {
    await sendToDiscord(message);
  }
}
/**
 * Send message to Discord
 */
async function sendToDiscord(message) {
  try {
    const channelName = message.channel.replace('#', '');
    const channel = client.channels.cache.find(ch => ch instanceof discord_js_1.TextChannel && ch.name === channelName);
    if (!channel) {
      console.warn(`Channel not found: ${message.channel}`);
      return;
    }
    if (message.embed) {
      const embed = new discord_js_1.EmbedBuilder()
        .setTitle(message.embed.title)
        .setDescription(message.embed.description)
        .setColor(message.embed.color || 0x3498db)
        .setTimestamp();
      if (message.embed.fields) {
        embed.addFields(message.embed.fields);
      }
      await channel.send({ embeds: [embed] });
    } else if (message.content) {
      await channel.send(message.content);
    }
  } catch (error) {
    console.error('Error sending to Discord:', error);
  }
}
/**
 * Start event processing loop
 */
function startEventLoop() {
  setInterval(processEvents, EVENT_CHECK_INTERVAL_MS);
}
/**
 * Register slash commands
 */
async function registerCommands() {
  if (!client.application) return;
  const commands = [
    {
      name: 'po-story-add',
      description: 'Create a new story',
      options: [
        {
          name: 'title',
          type: 3, // STRING
          description: 'Story title',
          required: true,
        },
        {
          name: 'why',
          type: 3,
          description: 'Why this story matters',
          required: true,
        },
        {
          name: 'accept',
          type: 3,
          description: 'Acceptance criteria (semicolon separated)',
          required: false,
        },
      ],
    },
    {
      name: 'sm-task-slice',
      description: 'Create a task from a story',
      options: [
        {
          name: 'story_id',
          type: 3,
          description: 'Story ID (e.g., S-81)',
          required: true,
        },
        {
          name: 'title',
          type: 3,
          description: 'Task title',
          required: true,
        },
        {
          name: 'estimate',
          type: 4, // INTEGER
          description: 'Hours estimate',
          required: false,
        },
      ],
    },
    {
      name: 'sm-assign',
      description: 'Assign a task to a developer',
      options: [
        {
          name: 'task_id',
          type: 3,
          description: 'Task ID (e.g., T-220)',
          required: true,
        },
        {
          name: 'developer',
          type: 3,
          description: 'Developer name (e.g., dev_A)',
          required: true,
        },
      ],
    },
    {
      name: 'dev-start',
      description: 'Start working on a task',
      options: [
        {
          name: 'task_id',
          type: 3,
          description: 'Task ID',
          required: true,
        },
      ],
    },
    {
      name: 'dev-review',
      description: 'Submit task for review',
      options: [
        {
          name: 'task_id',
          type: 3,
          description: 'Task ID',
          required: true,
        },
        {
          name: 'notes',
          type: 3,
          description: 'Review notes',
          required: false,
        },
      ],
    },
    {
      name: 'po-accept',
      description: 'Accept a reviewed task',
      options: [
        {
          name: 'task_id',
          type: 3,
          description: 'Task ID',
          required: true,
        },
      ],
    },
    {
      name: 'sm-phase',
      description: 'Change sprint phase',
      options: [
        {
          name: 'phase',
          type: 3,
          description: 'New phase',
          required: true,
          choices: [
            { name: 'PLAN', value: 'PLAN' },
            { name: 'ASSIGN', value: 'ASSIGN' },
            { name: 'BUILD', value: 'BUILD' },
            { name: 'REVIEW', value: 'REVIEW' },
            { name: 'INTEGRATE', value: 'INTEGRATE' },
          ],
        },
      ],
    },
  ];
  try {
    console.log('Registering slash commands...');
    await client.application.commands.set(commands);
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}
/**
 * Handle slash commands
 */
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const state = (0, state_1.loadState)();
  const actor = `user:${interaction.user.id}`;
  try {
    let event = null;
    switch (interaction.commandName) {
      case 'po-story-add': {
        const title = interaction.options.getString('title', true);
        const why = interaction.options.getString('why', true);
        const accept = interaction.options.getString('accept', false);
        const story = {
          id: `S-${Date.now()}`,
          goal_id: 'G-1', // TODO: Make dynamic
          title,
          acceptance: accept ? accept.split(';').map(s => s.trim()) : [],
          priority: 1,
          status: 'READY',
          tasks: [],
        };
        event = {
          type: 'STORY_CREATED',
          actor,
          payload: { story },
          version: 1,
        };
        break;
      }
      case 'sm-task-slice': {
        const story_id = interaction.options.getString('story_id', true);
        const title = interaction.options.getString('title', true);
        const estimate = interaction.options.getInteger('estimate', false) || 2;
        const task = {
          id: `T-${Date.now()}`,
          story_id,
          title,
          state: 'UNASSIGNED',
          assignee: null,
          wip_class: 'FEAT',
          est: estimate,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          dependencies: [],
          notes: [],
        };
        event = {
          type: 'TASK_CREATED',
          actor,
          payload: { task },
          version: 1,
        };
        break;
      }
      case 'sm-assign': {
        const task_id = interaction.options.getString('task_id', true);
        const assignee = interaction.options.getString('developer', true);
        event = {
          type: 'TASK_ASSIGNED',
          actor,
          payload: { task_id, assignee },
          version: 1,
        };
        break;
      }
      case 'dev-start': {
        const task_id = interaction.options.getString('task_id', true);
        event = {
          type: 'TASK_STARTED',
          actor,
          payload: { task_id },
          version: 1,
        };
        break;
      }
      case 'dev-review': {
        const task_id = interaction.options.getString('task_id', true);
        const notes = interaction.options.getString('notes', false);
        event = {
          type: 'TASK_MOVED_TO_REVIEW',
          actor,
          payload: { task_id },
          version: 1,
        };
        // Also add note if provided
        if (notes) {
          const noteEvent = {
            type: 'TASK_NOTE_ADDED',
            actor,
            payload: { task_id, note: notes },
            version: 1,
          };
          (0, events_1.append)(noteEvent);
        }
        break;
      }
      case 'po-accept': {
        const task_id = interaction.options.getString('task_id', true);
        event = {
          type: 'TASK_ACCEPTED',
          actor,
          payload: { task_id },
          version: 1,
        };
        break;
      }
      case 'sm-phase': {
        const phase = interaction.options.getString('phase', true);
        event = {
          type: 'PHASE_CHANGED',
          actor,
          payload: { phase },
          version: 1,
        };
        break;
      }
    }
    if (event) {
      // Validate payload
      const payloadErrors = (0, validator_1.validatePayload)(event);
      if (payloadErrors.length > 0) {
        await interaction.reply({
          content: `❌ Invalid command: ${payloadErrors.join(', ')}`,
          ephemeral: true,
        });
        return;
      }
      // Validate against state
      const errors = (0, validator_1.validate)(event, state);
      if (errors.length > 0) {
        await interaction.reply({
          content: `❌ Cannot execute: ${errors.join(', ')}`,
          ephemeral: true,
        });
        return;
      }
      // Append event
      const appended = (0, events_1.append)(event);
      await interaction.reply({
        content: `✅ Event created: ${appended.type} (ID: ${appended.id})`,
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error('Command error:', error);
    await interaction.reply({
      content: '❌ An error occurred',
      ephemeral: true,
    });
  }
});
// Start the gateway
init().catch(console.error);
//# sourceMappingURL=index.js.map
