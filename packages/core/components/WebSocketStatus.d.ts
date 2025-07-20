import React from 'react';
import { ConnectionState } from '../websocket/WebSocketClient';
interface WebSocketStatusProps {
    connectionState: ConnectionState;
    queuedMessages?: number;
    className?: string;
    showDetails?: boolean;
}
export declare const WebSocketStatus: React.FC<WebSocketStatusProps>;
export declare const WebSocketStatusIcon: React.FC<{
    connectionState: ConnectionState;
    onClick?: () => void;
}>;
export declare const WebSocketDetails: React.FC<{
    connectionState: ConnectionState;
    queuedMessages?: number;
    onClearQueue?: () => void;
    onReconnect?: () => void;
    onDisconnect?: () => void;
}>;
export {};
//# sourceMappingURL=WebSocketStatus.d.ts.map