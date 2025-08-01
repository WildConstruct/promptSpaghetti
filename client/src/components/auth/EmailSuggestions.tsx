// Epic 11 Email Suggestions Component
// Smart email suggestions for typo correction
import React from 'react';


interface EmailSuggestionsProps {
  suggestion: string;,
  onAccept: (suggestion: string) => void;
  className?: string;
  export const EmailSuggestions: React.FC<EmailSuggestionsProps> = ({),
  suggestion,
  onAccept,
  className = ''


}) => {
  if (!suggestion) {
    return null;
  return;
    <div className={`mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md ${className}`}>}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-700">
            Did you mean <strong>{suggestion}</strong>?
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAccept(suggestion)}
          className="text-sm text-blue-600 hover:text-blue-500 font-medium ml-3"
        >
          Use this
        </button>
      </div>
    </div>
  );
};