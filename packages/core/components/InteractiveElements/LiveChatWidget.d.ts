/**
 * Epic 16 Live Chat Widget
 *
 * Real-time chat widget for marketplace and community interaction
 * with message history, typing indicators, file uploads, and moderation.
 */
import React from 'react';
import { LiveChatElement, Epic16InteractiveElementsService } from '../../services/Epic16InteractiveElementsService';

}
}
interface LiveChatWidgetProps {
    element: LiveChatElement;
    interactiveService: Epic16InteractiveElementsService;
    userId: string;
    userName: string;
    userAvatar?: string;
    isMinimized?: boolean;
    onMinimize?: () => void;
    onClose?: () => void;

export declare const LiveChatWidget: React.FC<LiveChatWidgetProps>;
export default LiveChatWidget;
//# sourceMappingURL=LiveChatWidget.d.ts.map
}
}