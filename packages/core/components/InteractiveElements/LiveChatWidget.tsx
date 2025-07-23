/**
 * Epic 16 Live Chat Widget
 * 
 * Real-time chat widget for marketplace and community interaction
 * with message history, typing indicators, file uploads, and moderation.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LiveChatElement,
  Epic16InteractiveElementsService,
  InteractionType,
  ActivationContext
} from '../../services/Epic16InteractiveElementsService';

interface LiveChatWidgetProps {
  element: LiveChatElement;
  interactiveService: Epic16InteractiveElementsService;
  userId: string;
  userName: string;
  userAvatar?: string;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system' | 'emoji';
  attachments?: ChatAttachment[];
  edited?: boolean;
  editedAt?: Date;
}

interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: Date;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  element,
  interactiveService,
  userId,
  userName,
  userAvatar,
  isMinimized = false,
  onMinimize,
  onClose
}) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Configuration
  const chatConfig = element.config.chat_config;
  const maxMessageLength = chatConfig.rate_limiting.chars_per_message;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Simulate real-time connection
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome-1',
        userId: 'system',
        userName: 'System',
        message: `Welcome to the chat, ${userName}! Feel free to ask questions or share your thoughts.`,
        timestamp: new Date(),
        type: 'system'
      };
      setMessages([welcomeMessage]);
      
      // Simulate other users online
      setOnlineUsers(['user-1', 'user-2', userId]);
    }, 1000);

    return () => clearTimeout(connectTimeout);
  }, [userName, userId]);

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      // In real implementation, would emit typing event via WebSocket
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  }, [isTyping]);

  // Handle message input
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length <= maxMessageLength) {
      setCurrentMessage(value);
      handleTypingStart();
    }
  }, [maxMessageLength, handleTypingStart]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !isConnected) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      userAvatar,
      message: currentMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setIsTyping(false);

    // Track interaction
    await interactiveService.trackInteraction(element.id, {
      type: InteractionType.CUSTOM,
      user_id: userId,
      timestamp: new Date(),
      context: {
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        session_id: 'session-' + Date.now(),
        ab_test_variant: null
      },
      data: {
        action: 'message_sent',
        message_length: currentMessage.length,
        message_type: 'text'
      },
      result: {
        success: true,
        conversion: false,
        data: { message_id: newMessage.id }
      },
      duration: 0
    });

    // Simulate response (in real app, this would come via WebSocket)
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const responses = [
          "That's a great question! Let me help you with that.",
          "Thanks for sharing! The community really appreciates your input.",
          "I see what you mean. Have you tried checking the documentation?",
          "Welcome to our marketplace! Feel free to browse our templates.",
          "That's an interesting perspective. What do you think about...?"
        ];
        
        const responseMessage: ChatMessage = {
          id: `response-${Date.now()}`,
          userId: 'support-bot',
          userName: 'Support Assistant',
          userAvatar: '/avatars/support-bot.png',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000);
    }
  }, [currentMessage, isConnected, userId, userName, userAvatar, element.id, interactiveService]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!chatConfig.file_uploads) return;
    
    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert('File too large. Maximum size is 10MB.');
          continue;
        }
        
        // Create attachment
        const attachment: ChatAttachment = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // In real app, upload to server
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        };
        
        const fileMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          userName,
          userAvatar,
          message: `Shared a file: ${file.name}`,
          timestamp: new Date(),
          type: 'file',
          attachments: [attachment]
        };
        
        setMessages(prev => [...prev, fileMessage]);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [chatConfig.file_uploads, userId, userName, userAvatar]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Format message timestamp
  const formatTimestamp = useCallback((timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }, []);

  // Render message
  const renderMessage = useCallback((message: ChatMessage) => {
    const isOwn = message.userId === userId;
    const isSystem = message.userId === 'system';
    
    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isOwn && !isSystem && (
          <div className="flex-shrink-0 mr-3">
            {message.userAvatar ? (
              <img
                src={message.userAvatar}
                alt={message.userName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {message.userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-first' : ''}`}>
          {!isOwn && !isSystem && (
            <div className="text-xs text-gray-500 mb-1">{message.userName}</div>
          )}
          
          <div className={`rounded-lg px-4 py-2 ${
            isSystem 
              ? 'bg-gray-100 text-gray-700 text-center text-sm'
              : isOwn 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
          }`}>
            {message.type === 'file' && message.attachments ? (
              <div>
                <div className="mb-2">{message.message}</div>
                {message.attachments.map(attachment => (
                  <div key={attachment.id} className="border border-gray-200 rounded p-2 bg-white">
                    <div className="flex items-center space-x-2">
                      {attachment.thumbnail ? (
                        <img src={attachment.thumbnail} alt={attachment.name} className="w-8 h-8 rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{attachment.name}</div>
                        <div className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <a
                        href={attachment.url}
                        download={attachment.name}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.message}</div>
            )}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(message.timestamp)}
            {message.edited && <span className="ml-1">(edited)</span>}
          </div>
        </div>
        
        {isOwn && (
          <div className="flex-shrink-0 ml-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [userId, userName, userAvatar, formatTimestamp]);

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-gray-600">
            {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      </div>
    );
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onMinimize}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {messages.length > 1 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messages.length - 1}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <h3 className="font-medium">Community Chat</h3>
          <span className="text-xs opacity-75">({onlineUsers.length} online)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-blue-700 rounded"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isConnected ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div>Connecting to chat...</div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {isConnected && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                disabled={!isConnected}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {currentMessage.length}/{maxMessageLength}
                </span>
                {chatConfig.file_uploads && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Attach file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || !isConnected || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,text/*,.pdf,.doc,.docx"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default LiveChatWidget;