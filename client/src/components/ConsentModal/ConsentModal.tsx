import React from 'react';
import './ConsentModal.css';

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: (consent: boolean) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onConsent }) => {
  if (!isOpen) return null;

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal">
        <h2>Enable AI-Powered Features?</h2>
        <div className="consent-content">
          <p>We can enhance your prompt building experience with AI-powered suggestions:</p>
          <ul>
            <li>✨ <strong>Smart Suggestions</strong> - Generate contextual choice options</li>
            <li>⚖️ <strong>Weight Optimization</strong> - AI-optimized probability weights</li>
            <li>💡 <strong>Creative Inspiration</strong> - Themed content suggestions</li>
            <li>📝 <strong>Text Refinement</strong> - Improve and expand your text</li>
          </ul>
          
          <div className="consent-privacy">
            <h3>Privacy & Data Usage</h3>
            <ul>
              <li>Your prompts are processed by OpenRouter AI models</li>
              <li>No personal information is stored or shared</li>
              <li>You can disable AI features anytime in settings</li>
              <li>All AI usage is logged for cost tracking only</li>
            </ul>
          </div>
        </div>

        <div className="consent-actions">
          <button 
            className="consent-accept"
            onClick={() => onConsent(true)}
          >
            Enable AI Features
          </button>
          <button 
            className="consent-decline"
            onClick={() => onConsent(false)}
          >
            Continue Without AI
          </button>
        </div>
      </div>
    </div>
  );
};