import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Live Chat Widget
 *
 * Real-time chat widget for marketplace and community interaction
 * with message history, typing indicators, file uploads, and moderation.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { InteractionType } from '../../services/Epic16InteractiveElementsService';
{
    // State management
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [typingUsers, ___setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [uploading, setUploading] = useState(false);
    // Refs
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef();
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
            const welcomeMessage = {
                id: 'welcome-1',
                userId: 'system',
                userName: 'System',
                message: `Welcome to the chat, ${userName}! Feel free to ask questions or share your thoughts.` };
        }, timestamp, new Date(), type, 'system');
    });
    setMessages([welcomeMessage]);
    // Simulate other users online
    setOnlineUsers(['user-1', 'user-2', userId]);
}
1000;
;
return () => clearTimeout(connectTimeout);
[userName, userId];
;
// Handle typing indicators
const handleTypingStart = useCallback(() => {
    if (!isTyping) {
        setIsTyping(true);
        // In real implementation, would emit typing event via WebSocket
        // Reset typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
            }, 3000);
        }
        [isTyping];
    }
});
// Handle message input
const handleMessageChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= maxMessageLength) {
        setCurrentMessage(value);
        handleTypingStart();
    }
    [maxMessageLength, handleTypingStart];
});
// Send message
const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !isConnected)
        return;
    const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
}, userId, userName, userAvatar, message, currentMessage.trim(), timestamp, new Date(), type, 'text');
;
setMessages(prev => [...prev, newMessage]);
setCurrentMessage('');
setIsTyping(false);
// Track interaction
await interactiveService.trackInteraction(element.id, {});
type: InteractionType.CUSTOM,
    user_id;
userId,
    timestamp;
new Date(),
    context;
{
    page_url: window.location.href,
        referrer;
    document.referrer,
        user_agent;
    navigator.userAgent,
        screen_resolution;
    `${screen.width}x${screen.height}`;
}
viewport_size: `${window.innerWidth}x${window.innerHeight}`;
device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    session_id;
'session-' + Date.now(),
    ab_test_variant;
null;
data: {
    action: 'message_sent',
        message_length;
    currentMessage.length,
        message_type;
    'text',
    ;
}
result: {
    success: true,
        conversion;
    false,
        data;
    {
        message_id: newMessage.id;
    }
}
duration: 0;
;
// Simulate response (in real app, this would come via WebSocket)
if (Math.random() > 0.7) {
    setTimeout(() => {
        const responses = [];
        'That\'s a great question! Let me help you with that.',
            'Thanks for sharing! The community really appreciates your input.',
            'I see what you mean. Have you tried checking the documentation?',
            'Welcome to our marketplace! Feel free to browse our templates.',
            'That\'s an interesting perspective. What do you think about...?';
        ;
        const responseMessage = {
            id: `response-${Date.now()}` };
    }, userId, 'support-bot', userName, 'Support Assistant', userAvatar, '/avatars/support-bot.png', message, responses[Math.floor(Math.random() * responses.length)], timestamp, new Date(), type, 'text');
}
;
setMessages(prev => [...prev, responseMessage]);
1000 + Math.random() * 2000;
;
[currentMessage, isConnected, userId, userName, userAvatar, element.id, interactiveService];
;
// Handle file upload
const handleFileUpload = useCallback(async (files) => {
    if (!chatConfig.file_uploads)
        return;
    setUploading(true);
    try {
        for (const file of Array.from(files)) {
            // Validate file
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File too large. Maximum size is 10MB.');
                continue;
                // Create attachment
                const attachment = {
                    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
            }
            name: file.name,
                size;
            file.size,
                type;
            file.type,
                url;
            URL.createObjectURL(file), // In real app, upload to server
                thumbnail;
            file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        }
        ;
        const fileMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    }
    finally {
    }
    userId,
        userName,
        userAvatar,
        message;
    `Shared a file: ${file.name}`;
});
timestamp: new Date(),
    type;
'file',
    attachments;
[attachment];
;
setMessages(prev => [...prev, fileMessage]);
try { }
catch (error) {
    console.error('File upload failed:', error);
    alert('Failed to upload file. Please try again.');
}
finally {
    setUploading(false);
}
[chatConfig.file_uploads, userId, userName, userAvatar];
;
// Handle key press
const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
    [handleSendMessage];
});
// Format message timestamp
const formatTimestamp = useCallback((timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    }
    else if (diff < 3600000) { // Less than 1 hour
        return `${Math.floor(diff / 60000)}m ago`;
    }
});
if (diff < 86400000) { // Less than 1 day
    return `${Math.floor(diff / 3600000)}h ago`;
}
{
    return timestamp.toLocaleDateString();
}
[];
;
// Render message
const renderMessage = useCallback((message) => {
    const isOwn = message.userId === userId;
    const isSystem = message.userId === 'system';
    return;
    _jsxs("div", { className: `flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`, children: ["}", !isOwn && !isSystem && ()
                < div, " className=\"flex-shrink-0 mr-3\">", message.userAvatar ? ()
                < img
                :
            , "src=", message.userAvatar, "alt=", message.userName, "className=\"w-8 h-8 rounded-full\" /> ) : ()", _jsx("div", { className: "w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-xs font-medium text-gray-600", children: message.userName.charAt(0).toUpperCase() }) }), ")}"] }, message.id);
});
_jsxs("div", { className: `max-w-xs lg:max-w-md ${isOwn ? 'order-first' : ''}`, children: ["}", !isOwn && !isSystem && ()
            < div, " className=\"text-xs text-gray-500 mb-1\">", message.userName] });
_jsxs("div", { className: `rounded-lg px-4 py-2 ${isSystem
        ? 'bg-gray-100 text-gray-700 text-center text-sm'
        : isOwn,
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900',
    }`, children: [message.type === 'file' && message.attachments ? ()
            < div >
            _jsx("div", { className: "mb-2", children: message.message })
            :
        , message.attachments.map(attachment => ()
            < div, key = { attachment, : .id }, className = "border border-gray-200 rounded p-2 bg-white" >
            _jsxs("div", { className: "flex items-center space-x-2", children: [attachment.thumbnail ? ()
                        < img : , " src=", attachment.thumbnail, " alt=", attachment.name, " className=\"w-8 h-8 rounded\" /> ) : ()", _jsx("div", { className: "w-8 h-8 bg-gray-200 rounded flex items-center justify-center", children: _jsx("svg", { className: "w-4 h-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }) }), ")}", _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium text-gray-900 truncate", children: attachment.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [(attachment.size / 1024).toFixed(1), " KB"] })] }), _jsx("a", { href: attachment.url, download: attachment.name, className: "text-blue-600 hover:text-blue-800 text-sm", children: "Download" })] }))] });
div >
;
()
    < div;
className = "whitespace-pre-wrap" > { message, : .message };
div >
;
div >
    _jsxs("div", { className: `text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`, children: ["}", formatTimestamp(message.timestamp), message.edited && _jsx("span", { className: "ml-1", children: "(edited)" })] });
div >
    { isOwn } && ()
    < div;
className = "flex-shrink-0 ml-3" >
    {}
    < img;
src = { userAvatar };
alt = { userName };
className = "w-8 h-8 rounded-full"
    /  >
;
()
    < div;
className = "w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center" >
    _jsx("span", { className: "text-xs font-medium text-white", children: userName.charAt(0).toUpperCase() });
div >
;
div >
;
div >
;
;
[userId, userName, userAvatar, formatTimestamp];
;
// Render typing indicator
const renderTypingIndicator = () => {
    if (typingUsers.length === 0)
        return null;
    return;
    _jsx("div", { className: "flex justify-start mb-4", children: _jsxs("div", { className: "flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2", children: [_jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0ms' } }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '150ms' } }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '300ms' } })] }), _jsxs("span", { className: "text-sm text-gray-600", children: [typingUsers.map(u => u.userName).join(', '), " ", typingUsers.length === 1 ? 'is' : 'are', " typing..."] })] }) });
};
;
;
if (isMinimized) {
    return;
    _jsx("div", { className: "fixed bottom-4 right-4 z-50", children: _jsxs("button", { onClick: onMinimize, className: "bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors", children: [_jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }), messages.length > 1 && ()
                    < div, " className=\"absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center\">", messages.length - 1] }) });
}
button >
;
div >
;
;
return;
_jsxs("div", { className: "fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}` }), "}", _jsx("h3", { className: "font-medium", children: "Community Chat" }), _jsxs("span", { className: "text-xs opacity-75", children: ["(", onlineUsers.length, " online)"] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: onMinimize, className: "p-1 hover:bg-blue-700 rounded", title: "Minimize", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 12H4" }) }) }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-blue-700 rounded", title: "Close", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [!isConnected ? ()
                    < div : , " className=\"text-center text-gray-500 py-8\">", _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" }), _jsx("div", { children: "Connecting to chat..." })] }), ") : ()", _jsxs(_Fragment, { children: [messages.map(renderMessage), renderTypingIndicator(), _jsx("div", { ref: messagesEndRef })] }), ")}"] });
{ /* Input */ }
{
    isConnected && ()
        < div;
    className = "border-t border-gray-200 p-4" >
        (_jsx("div", { className: "flex items-end space-x-2", children: _jsxs("div", { className: "flex-1", children: [_jsx("textarea", { value: currentMessage, onChange: handleMessageChange, onKeyPress: handleKeyPress, placeholder: "Type your message...", className: "w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", rows: 2, disabled: !isConnected }), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsxs("span", { className: "text-xs text-gray-500", children: [currentMessage.length, "/", maxMessageLength] }), chatConfig.file_uploads && ()
                                < button, "onClick=", () => fileInputRef.current?.click(), "disabled=", uploading, "className=\"text-gray-400 hover:text-gray-600 disabled:opacity-50\" title=\"Attach file\" >", _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" }) })] }), ")}"] }) })
            ,
                _jsxs("button", { onClick: handleSendMessage, disabled: !currentMessage.trim() || !isConnected || uploading, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: [uploading ? ()
                            < svg : , " className=\"w-4 h-4 animate-spin\" fill=\"none\" viewBox=\"0 0 24 24\">", _jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }));
    ()
        < svg;
    className = "w-4 h-4";
    fill = "none";
    stroke = "currentColor";
    viewBox = "0 0 24 24" >
        _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" });
    svg >
    ;
}
button >
;
div >
;
div >
;
{ /* Hidden file input */ }
_jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/*,text/*,.pdf,.doc,.docx", onChange: (e) => e.target.files && handleFileUpload(e.target.files), className: "hidden" });
div >
;
;
;
export default LiveChatWidget;
