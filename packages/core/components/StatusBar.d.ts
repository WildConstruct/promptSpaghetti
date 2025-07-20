import React from "react";
import { ValidationError } from "../validation";
import { ConnectionState } from "../websocket/WebSocketClient";
interface StatusBarProps {
    statusMessage: string;
    errors: ValidationError[];
    onPreview: () => void;
    onSaveJson: () => void;
    onCorrections?: () => void;
    correctionsEnabled?: boolean;
    correctionsOpen?: boolean;
    onStats?: () => void;
    statsOpen?: boolean;
    onExtensions?: () => void;
    extensionsOpen?: boolean;
    connectionState?: ConnectionState;
    queuedMessages?: number;
    onClearQueue?: () => void;
    onReconnect?: () => void;
    onDisconnect?: () => void;
}
export declare const StatusBar: React.FC<StatusBarProps>;
export {};
//# sourceMappingURL=StatusBar.d.ts.map