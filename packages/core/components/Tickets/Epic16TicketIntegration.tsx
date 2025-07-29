/**
 * Epic 16 Ticket Integration - Main Component
 * 
 * Main integration component that brings together all Epic 16 ticket
 * management functionality including dashboard, details view, and service integration.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  MarketplaceTicket,
  Epic16TicketIntegrationService,
  TicketIntegrationConfig
} from '../../services/Epic16TicketIntegrationService';
import TicketManagementDashboard from './TicketManagementDashboard';
import TicketDetailsView from './TicketDetailsView';
interface Epic16TicketIntegrationProps {
  userId: string;
  userRole: 'user' | 'agent' | 'admin';
  config?: Partial<TicketIntegrationConfig>;
  onConfigChange?: (config: TicketIntegrationConfig) => void;
  export const Epic16TicketIntegration: React.FC<Epic16TicketIntegrationProps> = ({,)
  userId,
  userRole,
  config,
  onConfigChange
}) => {
  // Service instance
  const ticketService = useMemo(() => {
    return new Epic16TicketIntegrationService(config);
  }, [config]);
  // State management
  const [selectedTicket, setSelectedTicket] = useState<MarketplaceTicket | null>(null);
  const [view, setView] = useState<'dashboard' | 'details' | 'settings'>('dashboard');
  const [notifications, setNotifications] = useState<Array<{
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}>>([]);
  // Set up event listeners for service events
  useEffect(() => {
    const handleTicketCreated = (data: { ticket: MarketplaceTicket }) => {
      setNotifications(prev => [...prev, {)
  id: `created-${data.ticket.id}`}
},
  type: 'success',
        message: `Ticket ${data.ticket.id} has been created`}
},
  timestamp: new Date();
  }]);
    };
    const handleTicketStatusChanged = (data: { ),
  ticket: MarketplaceTicket; 
      oldStatus: string; ,
  newStatus: string; 
    }) => {
      setNotifications(prev => [...prev, {)
  id: `status-${data.ticket.id}-${Date.now()}`}
},
  type: 'info',
        message: `Ticket ${data.ticket.id} status changed from ${data.oldStatus} to ${data.newStatus}`}
},
  timestamp: new Date();
  }]);
    };
    const handleTicketEscalated = (data: { ),
  ticket: MarketplaceTicket; 
      reason: string; 
    }) => {
      setNotifications(prev => [...prev, {)
  id: `escalated-${data.ticket.id}`}
},
  type: 'warning',
        message: `Ticket ${data.ticket.id} has been escalated: ${data.reason}`}
},
  timestamp: new Date();
  }]);
    };
    const handleCommentAdded = (data: { ),
  ticket: MarketplaceTicket; 
    }) => {
      setNotifications(prev => [...prev, {)
  id: `comment-${data.ticket.id}-${Date.now()}`}
},
  type: 'info',
        message: `New comment added to ticket ${data.ticket.id}`}
},
  timestamp: new Date();
  }]);
    };
    // Subscribe to events
    ticketService.on('ticket_created', handleTicketCreated);
    ticketService.on('ticket_status_changed', handleTicketStatusChanged);
    ticketService.on('ticket_escalated', handleTicketEscalated);
    ticketService.on('comment_added', handleCommentAdded);
    return () => {
      // Cleanup listeners
      ticketService.off('ticket_created', handleTicketCreated);
      ticketService.off('ticket_status_changed', handleTicketStatusChanged);
      ticketService.off('ticket_escalated', handleTicketEscalated);
      ticketService.off('comment_added', handleCommentAdded);
    };
  }, [ticketService]);
  // Auto-dismiss notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [notifications]);
  // Handle ticket selection
  const handleTicketSelect = (ticket: MarketplaceTicket) => {
    setSelectedTicket(ticket);
    setView('details');
  };
  // Handle ticket update
  const handleTicketUpdate = (updatedTicket: MarketplaceTicket) => {
    setSelectedTicket(updatedTicket);
  };
  // Handle view navigation
  const handleViewChange = (newView: 'dashboard' | 'details' | 'settings') => {
    setView(newView);
    if (newView === 'dashboard') {
      setSelectedTicket(null);
  };
  return;
    <div className="epic16-ticket-integration h-full flex flex-col relative">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleViewChange('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
  view === 'dashboard'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
            >
              Dashboard
            </button>
            {selectedTicket && ()
              <button
                onClick={() => handleViewChange('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
  view === 'details'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
              >
                Ticket Details
              </button>
            )}
            {userRole === 'admin' && ()
              <button
                onClick={() => handleViewChange('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
  view === 'settings'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
              >
                Settings
              </button>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              User: <span className="font-medium">{userId}</span>
            </div>
            <div className="text-sm text-gray-600">
              Role: <span className="font-medium capitalize">{userRole}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === 'dashboard' && ()
          <TicketManagementDashboard
            ticketService={ticketService}
            userId={userId}
            userRole={userRole}
            onTicketSelect={handleTicketSelect}
          />
        )}
        {view === 'details' && selectedTicket && ()
          <TicketDetailsView
            ticket={selectedTicket}
            ticketService={ticketService}
            userId={userId}
            userRole={userRole}
            onClose={() => handleViewChange('dashboard')}
            onTicketUpdate={handleTicketUpdate}
          />
        )}
        {view === 'settings' && userRole === 'admin' && ()
          <IntegrationSettings
            ticketService={ticketService}
            onConfigChange={onConfigChange}
          />
        )}
      </div>
      {/* Notifications */}
      <NotificationSystem notifications={notifications} />
      {/* Help & Documentation */}
      <HelpSystem />
    </div>
  );
};

// Settings Component
interface IntegrationSettingsProps {
  ticketService: Epic16TicketIntegrationService;
  onConfigChange?: (config: TicketIntegrationConfig) => void;
  const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({,)
  ticketService,
  onConfigChange
}) => {
  return;
  <div className="p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration Settings</h2>
  <div className="bg-white border border-gray-200 rounded-lg p-6">
  <h3 className="text-lg font-medium text-gray-900 mb-4">Epic 16 Configuration</h3>
  <div className="space-y-4">
  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
  <div className="flex">
  <div className="flex-shrink-0">
  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
  </div>
  <div className="ml-3">
  <p className="text-sm text-blue-700">
  Epic 16 ticket integration is now active. This system provides comprehensive
  marketplace and community support ticket management with:,
  </p>
  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
  <li>12 marketplace ticket types with specialized workflows</li>
  <li>SLA tracking and automated escalation</li>
  <li>External system integrations (GitHub, Jira, Slack, Discord)</li>
  <li>Advanced comment system with visibility controls</li>
  <li>Real-time metrics and analytics</li>
  <li>Attachment management with security scanning</li>
  </ul>
  </div>
  </div>
  </div>
  <div className="grid grid-cols-2 gap-6">
  <div>
  <h4 className="text-sm font-medium text-gray-900 mb-2">Service Status</h4>
  <div className="bg-green-50 border border-green-200 rounded-md p-3">
  <div className="flex items-center">
  <svg className="h-4 w-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
  <span className="text-sm font-medium text-green-800">Active</span>
  </div>
  </div>
  </div>
  <div>
  <h4 className="text-sm font-medium text-gray-900 mb-2">Integrations</h4>
  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
  <div className="flex items-center">
  <svg className="h-4 w-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
  <span className="text-sm font-medium text-yellow-800">Configuration Required</span>
  </div>
  </div>
  </div>
  </div>
  <div>
  <h4 className="text-sm font-medium text-gray-900 mb-2">Features Overview</h4>
  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
  <div className="grid grid-cols-3 gap-4 text-sm">
  <div>
  <div className="font-medium text-gray-900">Ticket Types</div>
  <div className="text-gray-600 mt-1">Template Submission, Billing Disputes, Community Support, Technical Issues</div>
  </div>
  <div>
  <div className="font-medium text-gray-900">Workflow Automation</div>
  <div className="text-gray-600 mt-1">Auto-assignment, SLA tracking, Escalation rules</div>
  </div>
  <div>
  <div className="font-medium text-gray-900">External Systems</div>
  <div className="text-gray-600 mt-1">GitHub, Jira, Zendesk, Slack, Discord integrations</div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  );
};

// Notification System Component
interface NotificationSystemProps {
  notifications: Array<{,
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}>;
const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications }) => {
  if (notifications.length === 0) return null;
  return;
  <div className="fixed top-4 right-4 z-50 space-y-2">
  {notifications.slice(-3).map((notification) => {
  const colors = {
  success: 'bg-green-50 border-green-200 text-green-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};
        return;
          <div
            key={notification.id}
            className={`max-w-sm w-full border rounded-md p-4 shadow-lg ${colors[notification.type]}`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' && ()
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && ()
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && ()
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'warning' && ()
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Help System Component
const HelpSystem: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  return;
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        title="Help & Documentation"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {showHelp && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Epic 16 Ticket Integration Help</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Getting Started</h4>
                <p className="text-sm text-gray-600">
                  The Epic 16 ticket integration provides comprehensive support for marketplace and 
                  community tickets. Use the dashboard to view and manage tickets, apply filters 
                  to find specific issues, and drill into ticket details for full management.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>Dashboard:</strong> Overview of all tickets with filtering and search</li>
                  <li><strong>Ticket Details:</strong> Full ticket view with comments and attachments</li>
                  <li><strong>Status Management:</strong> Update ticket status and assign to agents</li>
                  <li><strong>SLA Tracking:</strong> Monitor response and resolution times</li>
                  <li><strong>Escalation:</strong> Escalate tickets when needed</li>
                  <li><strong>Comments:</strong> Public, internal, and private communication</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ticket Types</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>• Template Submission</div>
                  <div>• Billing Dispute</div>
                  <div>• Community Support</div>
                  <div>• Technical Support</div>
                  <div>• Content Moderation</div>
                  <div>• Feature Request</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>User:</strong> Can view own tickets and add public comments</li>
                  <li><strong>Agent:</strong> Can manage assigned tickets and view internal comments</li>
                  <li><strong>Admin:</strong> Full access to all tickets and system settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Epic16TicketIntegration;