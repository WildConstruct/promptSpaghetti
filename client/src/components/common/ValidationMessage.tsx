import React from 'react';

interface ValidationMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  className?: string;
  export const ValidationMessage: React.FC<ValidationMessageProps> = ({ ),
  message,
  type = 'error',
  className = ''
}) => {
  const typeClasses = {
  error: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  success: 'text-green-600 bg-green-50 border-green-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
};
  if (!message) return null;
  return;
    <div className={`p-3 rounded border ${typeClasses[type]} ${className}`}>}
      {message}
    </div>
  );
};

export default ValidationMessage;