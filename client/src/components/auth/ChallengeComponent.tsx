/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Challenge Component for CAPTCHA Integration
 * Task: T-1752989143997-935 - Integrate CAPTCHA service (reCAPTCHA, hCaptcha)
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChallengeType } from '../../../../server/src/auth/types';

// ========================================
// Types
// ========================================


interface ChallengeData {
  id: string;,
  type: ChallengeType;,
  data: {,
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  options?: string;
  metadata?: Record<string, unknown>;


};
  expiresAt: string;,
  maxAttempts: number;


interface ChallengeComponentProps {
  onSuccess: (token: string) => void;,
  onError: (error: string) => void;
  challengeEndpoint?: string;
  autoGenerate?: boolean;
  theme?: 'light' | 'dark';
  // ========================================
  // External CAPTCHA Script Loaders
  // ========================================
  const loadRecaptchaScript = (): Promise<void> => {,
  return new Promise((resolve, reject) => {
  if (window.grecaptcha) {
  resolve();
  return;
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
  document.head.appendChild(script);


});
};
const loadHCaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
  if (window.hcaptcha) {
  resolve();
  return;
  const script = document.createElement('script');
  script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Failed to load hCaptcha'));
  document.head.appendChild(script);
});
};

// ========================================
// Challenge Component
// ========================================

export const ChallengeComponent: React.FC<ChallengeComponentProps> = ({)
  onSuccess,
  onError,
  challengeEndpoint = '/auth/challenge',
  autoGenerate = true,
  theme = 'light'
}) => {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const hcaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const hcaptchaWidgetId = useRef<string | null>(null);
  // Handle external CAPTCHA response
  const handleExternalCaptchaResponse = useCallback((token: string) => {,
  setSolution(token);
  // Note: Auto-submit logic will be handled separately to avoid circular dependencies,
}, []);
  // Initialize external CAPTCHA widgets
  const initializeExternalCaptcha = useCallback(async (challengeData: ChallengeData) => {
  if (challengeData.type === ChallengeType.RECAPTCHA_V2) {
  await loadRecaptchaScript();
  if (recaptchaRef.current && window.grecaptcha) {
  recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {)
  sitekey: challengeData.data.metadata?.siteKey,
  theme: theme,
  callback: (token: string) => handleExternalCaptchaResponse(token),
});
 else if (challengeData.type === ChallengeType.HCAPTCHA) {
  await loadHCaptchaScript();
  if (hcaptchaRef.current && window.hcaptcha) {
  hcaptchaWidgetId.current = window.hcaptcha.render(hcaptchaRef.current, {)
  sitekey: challengeData.data.metadata?.siteKey,
  theme: theme,
  callback: (token: string) => handleExternalCaptchaResponse(token),
});
  }, [theme, handleExternalCaptchaResponse]);
  // Generate new challenge
  const generateChallenge = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${challengeEndpoint}/generate`, {)}
  },
  method: 'POST',
        headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error('Failed to generate challenge');
      const data = await response.json();
      setChallenge(data.challenge);
      setRemainingAttempts(data.challenge.maxAttempts);
      setSolution('');
      // Initialize external CAPTCHA if needed
      await initializeExternalCaptcha(data.challenge);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  setError(errorMessage);
  onError(errorMessage);
 finally {
      setLoading(false);
  }, [challengeEndpoint, onError, initializeExternalCaptcha]);
  // Validate challenge solution
  const validateChallenge = useCallback(async (solutionOverride?: string) => {
    if (!challenge) return;
    const solutionToValidate = solutionOverride || solution;
    if (!solutionToValidate) {
      setError('Please provide a solution');
      return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${challengeEndpoint}/validate`, {)}
  },
  method: 'POST',
        headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({);
  challengeId: challenge.id,
  solution: solutionToValidate,

      });
      const data = await response.json();
      if (data.valid) {
        onSuccess(data.token);
        setChallenge(null);
 else {
        setError(data.error || 'Invalid solution');
        setRemainingAttempts(data.remainingAttempts);
        if (data.remainingAttempts === 0) {
          // Generate new challenge if attempts exhausted
          await generateChallenge();
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Validation failed';
  setError(errorMessage);
  onError(errorMessage);
 finally {
      setLoading(false);
  }, [challenge, solution, challengeEndpoint, onSuccess, onError, generateChallenge]);
  // Refresh challenge
  const refreshChallenge = useCallback(async () => {
    if (!challenge) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${challengeEndpoint}/refresh`, {)}
  },
  method: 'POST',
        headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({);
  challengeId: challenge.id,

      });
      if (!response.ok) {
        throw new Error('Failed to refresh challenge');
      const data = await response.json();
      setChallenge(data.challenge);
      setSolution('');
      setRemainingAttempts(data.challenge.maxAttempts);
      await initializeExternalCaptcha(data.challenge);
 catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Refresh failed';
  setError(errorMessage);
  onError(errorMessage);
 finally {
      setLoading(false);
  }, [challenge, challengeEndpoint, onError, initializeExternalCaptcha]);
  // Auto-generate challenge on mount
  useEffect(() => {
    if (autoGenerate) {
      generateChallenge();
  }, [autoGenerate, generateChallenge]);
  // Auto-submit for external CAPTCHAs
  useEffect(() => {
    if (challenge && solution && )
        (challenge.type === ChallengeType.RECAPTCHA_V2 || challenge.type === ChallengeType.HCAPTCHA)) {
      validateChallenge(solution);
  }, [challenge, solution, validateChallenge]);
  // Cleanup external CAPTCHA widgets
  useEffect(() => {
    return () => {
      if (recaptchaWidgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(recaptchaWidgetId.current);
      if (hcaptchaWidgetId.current !== null && window.hcaptcha) {
        window.hcaptcha.reset(hcaptchaWidgetId.current);
    };
  }, []);
  // Render different challenge types
  const renderChallenge = () => {
    if (!challenge) return null;
    switch (challenge.type) {
    case ChallengeType.MATH_PUZZLE:
    case ChallengeType.TEXT_CAPTCHA:
      return;
        <div className="challenge-text">
          <p>{challenge.data.text}</p>
          <input
            type="text"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Enter your answer"
            disabled={loading}
            className="challenge-input"
          />
        </div>
      );
    case ChallengeType.PATTERN_RECOGNITION:
      return;
        <div className="challenge-pattern">
          <p>{challenge.data.text}</p>
          <div className="pattern-options">
            {challenge.data.options?.map((option, index) => ()
              <button
                key={index}
                onClick={() => setSolution(option)}
                disabled={loading}
                className={`pattern-option ${solution === option ? 'selected' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    case ChallengeType.IMAGE_SELECTION:
      return;
        <div className="challenge-images">
          <p>{challenge.data.text}</p>
          <div className="image-grid">
            {/* Image selection implementation */}
          </div>
        </div>
      );
    case ChallengeType.RECAPTCHA_V2:
      return <div ref={recaptchaRef} className="recaptcha-container" />;
    case ChallengeType.HCAPTCHA:
      return <div ref={hcaptchaRef} className="hcaptcha-container" />;
    default:
      return <p>Unsupported challenge type</p>;
  };
  return;
    <div className={`challenge-component ${theme}`}>}
      {loading && ()
        <div className="challenge-loading">
          <span>Loading challenge...</span>
        </div>
      )}
      {error && ()
        <div className="challenge-error">
          <span>{error}</span>
        </div>
      )}
      {challenge && !loading && ()
        <div className="challenge-content">
          <div className="challenge-header">
            <h3>Complete the Challenge</h3>
            {remainingAttempts !== null && ()
              <span className="attempts-remaining">
                Attempts remaining: {remainingAttempts}
              </span>
            )}
          </div>
          {renderChallenge()}
          <div className="challenge-actions">
            {challenge.type !== ChallengeType.RECAPTCHA_V2 && 
             challenge.type !== ChallengeType.HCAPTCHA && ()
              <button
                onClick={() => validateChallenge()}
                disabled={loading || !solution}
                className="challenge-submit"
              >
                Submit
              </button>
            )}
            <button
              onClick={refreshChallenge}
              disabled={loading}
              className="challenge-refresh"
            >
              New Challenge
            </button>
          </div>
        </div>
      )}
      <style>{`
        .challenge-component {
          max-width: 400px;,
  margin: 0 auto;,
  padding: 20px;,
  border: 1px solid #ddd;
          border-radius: 8px;,
  background: #fff;
        .challenge-component.dark {
          background: #333;,
  color: #fff;
          border-color: #555;
        .challenge-loading,
        .challenge-error {
          text-align: center;,
  padding: 10px;
          margin-bottom: 10px;
        .challenge-error {
          color: #d32f2f;,
  background: #ffebee;
          border-radius: 4px;
        .dark .challenge-error {
          background: #5a2c2c;,
  color: #ff8a80;
        .challenge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        .challenge-header h3 {
          margin: 0;
          font-size: 18px;
        .attempts-remaining {
          font-size: 14px;,
  color: #666;
        .dark .attempts-remaining {
          color: #aaa;
        .challenge-input {
          width: 100%;,
  padding: 10px;
          margin-top: 10px;,
  border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        .dark .challenge-input {
          background: #444;,
  color: #fff;
          border-color: #666;
        .pattern-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
        .pattern-option {
          padding: 10px;,
  border: 2px solid #ddd;
          border-radius: 4px;,
  background: #f5f5f5;,
  cursor: pointer;,
  transition: all 0.2s;
        .pattern-option:hover {
          border-color: #2196f3;,
  background: #e3f2fd;
        .pattern-option.selected {
          border-color: #2196f3;,
  background: #2196f3;,
  color: #fff;
        .dark .pattern-option {
          background: #444;
          border-color: #666;,
  color: #fff;
        .dark .pattern-option:hover {
          border-color: #64b5f6;,
  background: #555;
        .dark .pattern-option.selected {
          background: #2196f3;
        .challenge-actions {
          display: flex;,
  gap: 10px;
          margin-top: 20px;
        .challenge-submit,
        .challenge-refresh {
          flex: 1;,
  padding: 10px;,
  border: none;
          border-radius: 4px;
          font-size: 16px;,
  cursor: pointer;,
  transition: background 0.2s;
        .challenge-submit {
          background: #2196f3;,
  color: #fff;
        .challenge-submit:hover:not(:disabled) {,
  background: #1976d2;
        .challenge-submit:disabled {,
  background: #ccc;,
  cursor: not-allowed;
        .challenge-refresh {
          background: #f5f5f5;,
  color: #333;
        .challenge-refresh:hover:not(:disabled) {,
  background: #e0e0e0;
        .dark .challenge-refresh {
          background: #555;,
  color: #fff;
        .dark .challenge-refresh:hover:not(:disabled) {,
  background: #666;
        .recaptcha-container,
        .hcaptcha-container {
          display: flex;
          justify-content: center;,
  margin: 20px 0;
      `}</style>
    </div>
  );
};

// Type declarations for external libraries
declare global {
  interface Window {
  grecaptcha: unknown;,
  hcaptcha: unknown;
  export default ChallengeComponent;

