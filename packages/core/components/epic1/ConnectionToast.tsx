import React, { useEffect, useState } from 'react';
import './ConnectionToast.css';

export interface ToastMessage {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  duration?: number;
}

interface ConnectionToastProps {
  message: ToastMessage | null;
  onDismiss: () => void;
}

/**
 * Toast notification component for connection validation feedback
 */
export const ConnectionToast: React.FC<ConnectionToastProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation to complete
      }, message.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={`epic1-toast epic1-toast-${message.type} ${isVisible ? 'visible' : ''}`}>
      <div className="epic1-toast-icon">
        {message.type === 'error' && '❌'}
        {message.type === 'warning' && '⚠️'}
        {message.type === 'success' && '✅'}
        {message.type === 'info' && 'ℹ️'}
      </div>
      <div className="epic1-toast-message">{message.message}</div>
      <button 
        className="epic1-toast-close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

/**
 * Hook to manage toast messages
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastMessage['type'], message: string, duration?: number) => {
    const id = Date.now().toString();
    const toast: ToastMessage = { id, type, message, duration };
    setToasts(prev => [...prev, toast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, dismissToast };
};
