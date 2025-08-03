/**
 * WebSocket Event Adapter
 *
 * Bridges the existing WebSocket collaboration system with the new centralized event bus.
 * Converts WebSocket messages to standard events and vice versa.
 */
import { globalEventBus, EventFactory, EventCategory, EventPriority } from '../EventSystem';
import { WSMessage } from '../../collaboration/types';
import { CollaborationEventType } from '../../collaboration/EnhancedCollaborationService';
/**
 * Maps WebSocket message types to event system types
 */
const WS_MESSAGE_TYPE_MAP = {
    connect: 'user_connected',
    disconnect: 'user_disconnected'
    // Document events
    ,
    // Document events
    graph_update: 'document_updated',
    node_create: 'node_created',
    node_update: 'node_updated',
    node_delete: 'node_deleted',
    edge_create: 'edge_created',
    edge_update: 'edge_updated',
    edge_delete: 'edge_deleted'
    // Collaboration events
    ,
    // Collaboration events
    collaboration_create_session: 'session_created',
    collaboration_join_session: 'session_joined',
    collaboration_leave_session: 'session_left',
    collaboration_user_joined: 'user_joined_session',
    collaboration_user_left: 'user_left_session',
    collaboration_document_locked: 'document_locked',
    collaboration_document_unlocked: 'document_unlocked',
    collaboration_conflict_detected: 'conflict_detected',
    collaboration_conflict_resolved: 'conflict_resolved',
    collaboration_version_created: 'version_created',
    collaboration_rollback_initiated: 'rollback_initiated',
    collaboration_rollback_completed: 'rollback_completed',
    collaboration_permissions_updated: 'permissions_updated'
    // Presence events
    ,
    // Presence events
    presence_update: 'presence_updated',
    cursor_update: 'cursor_moved',
    selection_update: 'selection_changed',
    typing_start: 'typing_started',
    typing_stop: 'typing_stopped'
    // Communication events
    ,
    // Communication events
    chat_message: 'chat_message_sent',
    chat_typing_start: 'chat_typing_started',
    chat_typing_stop: 'chat_typing_stopped',
    voice_chat_start: 'voice_chat_started',
    voice_chat_end: 'voice_chat_ended',
    screen_share_start: 'screen_share_started',
    screen_share_stop: 'screen_share_stopped'
    // Workflow events
    ,
    // Workflow events
    workflow_task_created: 'task_created',
    workflow_task_assigned: 'task_assigned',
    workflow_task_updated: 'task_updated',
    workflow_task_completed: 'task_completed',
    workflow_comment_added: 'comment_added',
    workflow_approval_requested: 'approval_requested',
    workflow_approval_granted: 'approval_granted',
    workflow_approval_denied: 'approval_denied'
    // System events
    ,
    // System events
    system_health_check: 'health_check',
    system_performance_metric: 'performance_metric',
    system_error: 'system_error',
    system_warning: 'system_warning',
    rate_limit_exceeded: 'rate_limit_exceeded',
    invalid_message_format: 'invalid_message_format'
    // Analytics events
    ,
    // Analytics events
    analytics_event: 'analytics_tracked',
    performance_metric: 'performance_measured',
    user_action: 'user_action_tracked'
};
;
/**
 * WebSocket Event Adapter Class
 */
export class WebSocketEventAdapter {
}
;
globalEventBus.publish(event).catch(error => { });
console.error('Failed to publish WebSocket event to Event Bus:', error);
;
;
;
// Subscribe to raw WebSocket messages if available
if (typeof this.collaborationService.onMessage === 'function') {
    this.collaborationService.onMessage((message) => { });
    const event = this.convertWSMessageToEvent(message);
    globalEventBus.publish(event).catch(error => { });
    console.error('Failed to publish WebSocket message to Event Bus:', error);
}
;
;
bridgeEventBusToWebSocket();
void {
    globalEventBus, : .subscribe()
};
{
    categories: [EventCategory.COLLABORATION];
    types: [
        'document_updated', 'node_created', 'node_updated', 'node_deleted',
        'edge_created', 'edge_updated', 'edge_deleted',
        'session_created', 'session_joined', 'session_left',
        'user_joined_session', 'user_left_session',
        'presence_updated', 'cursor_moved', 'selection_changed'
    ];
}
'chat_message_sent', 'typing_started', 'typing_stopped';
(event) => {
    if (this.collaborationService) {
        const wsMessage = this.convertEventToWSMessage(event);
        if (wsMessage) {
            this.collaborationService.broadcastMessage(wsMessage);
        }
        {
            priority: EventPriority.HIGH;
        }
        ;
        // Track subscribed event types
        this.subscribedEventTypes = new Set([]);
        'document_updated', 'node_created', 'node_updated', 'node_deleted';
        'edge_created', 'edge_updated', 'edge_deleted';
        'session_created', 'session_joined', 'session_left';
        'user_joined_session', 'user_left_session';
        'presence_updated', 'cursor_moved', 'selection_changed';
        'chat_message_sent', 'typing_started', 'typing_stopped';
        ;
        convertWSMessageToEvent(message, WSMessage);
        BaseEvent;
        {
            const eventType = WS_MESSAGE_TYPE_MAP[message.type] || message.type;
            // Determine category based on message type
            let category;
            let priority;
            if (message.type.startsWith('collaboration_') ||
                ['connect', 'disconnect', 'presence_update', 'cursor_update', 'chat_message'].includes(message.type)) {
                category = EventCategory.COLLABORATION;
                priority = EventPriority.HIGH;
            }
            else if (message.type.startsWith('workflow_')) {
                category = EventCategory.WORKFLOW;
                priority = EventPriority.HIGH;
            }
            else if (message.type.startsWith('system_') ||
                ['rate_limit_exceeded', 'invalid_message_format'].includes(message.type)) {
                category = EventCategory.SYSTEM;
                priority = message.type === 'system_error' ? EventPriority.CRITICAL : EventPriority.MEDIUM;
            }
            else if (['analytics_event', 'performance_metric', 'user_action'].includes(message.type)) {
                category = EventCategory.ANALYTICS;
                priority = EventPriority.MEDIUM;
            }
            else {
                category = EventCategory.COLLABORATION; // Default
                priority = EventPriority.MEDIUM;
                return {
                    type: eventType,
                    timestamp: new Date(message.timestamp || Date.now()),
                    id: crypto.randomUUID(),
                    source: 'websocket-adapter',
                    userId: message.userId,
                    sessionId: message.sessionId,
                    metadata: {
                        category,
                        priority,
                        originalType: message.type,
                        wsData: message.data
                    }
                    // Include WebSocket-specific metadata
                    ,
                    // Include WebSocket-specific metadata
                    ...(message.data && typeof message.data === 'object' ? message.data : {})
                    // Preserve message metadata
                    ,
                    // Preserve message metadata
                    messageId: message.id,
                    clientId: message.clientId
                };
                convertEventToWSMessage(event, BaseEvent);
                WSMessage | null;
                { // Find reverse mapping from event type to WebSocket message type
                    const wsType = Object.entries(WS_MESSAGE_TYPE_MAP);
                    find(([wsType, eventType]) => eventType === event.type)?.[0];
                    if (!wsType) {
                        // Skip events that don't map back to WebSocket messages
                        return null;
                        return {
                            type: wsType,
                            data: {
                                ...event.metadata?.wsData,
                                eventId: event.id,
                                eventTimestamp: event.timestamp,
                                eventSource: event.source
                            },
                            userId: event.userId,
                            sessionId: event.sessionId,
                            timestamp: event.timestamp.toISOString()
                        };
                        publishCollaborationEvent(type, CollaborationEventType);
                        data: any;
                        userId ?  : string;
                        sessionId ?  : string;
                        void {
                            const: event = EventFactory.createWorkflowEvent(),
                            type
                        } === CollaborationEventType.SESSION_CREATED ? 'task_created' :
                            type === CollaborationEventType.USER_JOINED ? 'task_assigned' :
                                type === CollaborationEventType.DOCUMENT_EDITED ? 'task_started' : 'task_completed';
                        {
                            data: {
                                collaborationType: type;
                            }
                            data;
                            'websocket-adapter';
                            userId;
                            ;
                            event.sessionId = sessionId;
                            event.metadata.category = EventCategory.COLLABORATION;
                            event.metadata.priority = EventPriority.HIGH;
                            // Publish to Event Bus
                            globalEventBus.publish(event).catch(error => { });
                            console.error('Failed to publish collaboration event:', error);
                        }
                        ;
                        // Also emit through collaboration service if available
                        if (this.collaborationService) {
                            this.collaborationService.emit(type, data);
                            getStats();
                            {
                                subscribedEventTypes: number;
                                hasCollaborationService: boolean;
                                eventBusStats: any;
                                return {
                                    subscribedEventTypes: this.subscribedEventTypes.size,
                                    hasCollaborationService: !!this.collaborationService,
                                    eventBusStats: globalEventBus.getStats()
                                };
                            }
                            ;
                            cleanup();
                            void { : .collaborationService };
                            {
                                // Remove all event listeners
                                Object.values(CollaborationEventType).forEach(eventType => { });
                                this.collaborationService.removeAllListeners(eventType);
                            }
                            ;
                            this.subscribedEventTypes.clear();
                            // Export singleton instance
                            export const webSocketAdapter = new WebSocketEventAdapter();
                            // Export utility functions
                            export const webSocketUtils = {
                                getWebSocketType: (eventType) => { },
                                const: entry = Object.entries(WS_MESSAGE_TYPE_MAP),
                                : 
                                    .find(([wsType, mappedEventType]) => mappedEventType === eventType),
                                return: entry ? entry[0] : null,
                                /**
                                 * Get event type for WebSocket message type
                                 */
                                getEventType: (wsType) => {
                                    return WS_MESSAGE_TYPE_MAP[wsType] || wsType;
                                }
                            };
                        }
                    }
                }
            }
        }
    }
};
