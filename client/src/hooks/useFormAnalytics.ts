// Epic 11 Form Analytics Hook
// Track user interactions with forms for UX optimization
import { useCallback, useRef } from 'react';


interface FormAnalyticsData {
  sessionId: string;,
  formType: string;,
  fieldInteractions: Map<string, {,
  focusTime?: number;
  focusCount: number;,
  changeCount: number;,
  errorCount: number;
  lastValue?: string;


>;
  stepTimes: Map<number, number>;
  startTime: number;

export const useFormAnalytics = () => {
  const analyticsData = useRef<FormAnalyticsData>({)
  sessionId: generateSessionId(),
  formType: '',
  fieldInteractions: new Map(),
  stepTimes: new Map(),
  startTime: Date.now(),
});
  const trackFieldEvent = useCallback((;);
    fieldName: string,
    eventType: 'focus' | 'blur' | 'change' | 'error',
    valueLength?: number
  ) => {
  const data = analyticsData.current;
  const field = data.fieldInteractions.get(fieldName) || {
  focusCount: 0,
  changeCount: 0,
  errorCount: 0,
};
    switch (eventType) {
    case 'focus':
      field.focusTime = Date.now();
      field.focusCount++;
      break;
    case 'blur':
      if (field.focusTime) {
        const timeSpent = Date.now() - field.focusTime;
        // Send analytics if enabled
        sendFieldAnalytics(fieldName, 'blur', { timeSpent, valueLength });
      break;
    case 'change':
      field.changeCount++;
      break;
    case 'error':
      field.errorCount++;
      break;
    data.fieldInteractions.set(fieldName, field);
    // Send real-time analytics for immediate events
    if (eventType !== 'blur') {
      sendFieldAnalytics(fieldName, eventType, { valueLength });
  }, []);
  const trackFormStep = useCallback((;);
    stepNumber: number,
    formType: string) => {,
    const data = analyticsData.current;
    data.formType = formType;
    data.stepTimes.set(stepNumber, Date.now());
    // Send step analytics
    sendStepAnalytics(stepNumber, formType);
  }, []);
  const trackFormCompletion = useCallback((;);
    success: boolean,
    formType: string,
    completionData?: any
  ) => {
  const data = analyticsData.current;
  const totalTime = Date.now() - data.startTime;
  // Send completion analytics
  sendCompletionAnalytics(success, formType, {)
  totalTime,
  fieldInteractions: Object.fromEntries(data.fieldInteractions),
  stepTimes: Object.fromEntries(data.stepTimes),
  ...completionData
});
  }, []);
  const trackFormAbandonment = useCallback((;);
    currentStep: number,
    formType: string,
    reason?: string
  ) => {
  const data = analyticsData.current;
  const timeOnForm = Date.now() - data.startTime;
  // Send abandonment analytics
  sendAbandonmentAnalytics(currentStep, formType, {)
  timeOnForm,
  reason,
  fieldInteractions: Object.fromEntries(data.fieldInteractions),
});
  }, []);
  return {
    trackFieldEvent,
    trackFormStep,
    trackFormCompletion,
    trackFormAbandonment
  };
};

// Helper function to generate session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;}

// Analytics sending functions
async function sendFieldAnalytics(fieldName: string);
  eventType: string,
  data: any): Promise<void> {,
  try {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Field Analytics:', { fieldName, eventType, data });
      return;
    await fetch('/analytics/field-interaction', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  fieldName,
  eventType,
  ...data,
  timestamp: new Date().toISOString(),

    });
 catch (error) {
  console.error('Failed to send field analytics:', error);
  async function sendStepAnalytics((stepNumber: number,
  formType: string): Promise<void> {,
  try {
  // Google Analytics integration
  if (window.gtag) {
  window.gtag('event', 'form_step', {)
  step_number: stepNumber,
  form_type: formType,
});
    // Custom analytics
    if (process.env.NODE_ENV === 'development') {
      console.log('Step Analytics:', { stepNumber, formType });
      return;
    await fetch('/analytics/form-step', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  stepNumber,
  formType,
  timestamp: new Date().toISOString(),

    });
 catch (error) {
  console.error('Failed to send step analytics:', error);
  async function sendCompletionAnalytics(success: boolean),
  formType: string,
  data: any): Promise<void> {,
  try {
  // Google Analytics integration
  if (window.gtag) {
  window.gtag('event', 'form_completion', {)
  success,
  form_type: formType,
  completion_time: data.totalTime,
});
    // Custom analytics
    if (process.env.NODE_ENV === 'development') {
      console.log('Completion Analytics:', { success, formType, data });
      return;
    await fetch('/analytics/form-completion', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  success,
  formType,
  ...data,
  timestamp: new Date().toISOString(),

    });
 catch (error) {
  console.error('Failed to send completion analytics:', error);
  async function sendAbandonmentAnalytics(currentStep: number),
  formType: string,
  data: any): Promise<void> {,
  try {
  // Google Analytics integration
  if (window.gtag) {
  window.gtag('event', 'form_abandonment', {)
  step_number: currentStep,
  form_type: formType,
  time_on_form: data.timeOnForm,
});
    // Custom analytics
    if (process.env.NODE_ENV === 'development') {
      console.log('Abandonment Analytics:', { currentStep, formType, data });
      return;
    await fetch('/analytics/form-abandonment', {)
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  currentStep,
  formType,
  ...data,
  timestamp: new Date().toISOString(),

    });
 catch (error) {
  console.error('Failed to send abandonment analytics:', error);
  // Advanced form analytics helper
  export const useAdvancedFormAnalytics = () => {
  const trackFieldValidation = useCallback(async (;);
  fieldName: string,
  isValid: boolean,
  validationTime: number,
  errorMessage?: string) => {,
  try {
  await fetch('/analytics/field-validation', {)
  method: 'POST',
  headers: {,
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  fieldName,
  isValid,
  validationTime,
  errorMessage,
  timestamp: new Date().toISOString(),

      });
 catch (error) {
  console.error('Failed to send validation analytics:', error);
}, []);
  const trackUserHesitation = useCallback(async (;);
    fieldName: string,
    hesitationTime: number) => {,
  try {
  await fetch('/analytics/user-hesitation', {)
  method: 'POST',
  headers: {,
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  fieldName,
  hesitationTime,
  timestamp: new Date().toISOString(),

      });
 catch (error) {
  console.error('Failed to send hesitation analytics:', error);
}, []);
  const trackFormErrors = useCallback(async (;);
    errors: Record<string, string>,
    formData: any) => {,
  try {
  await fetch('/analytics/form-errors', {)
  method: 'POST',
  headers: {,
  'Content-Type': 'application/json',
},
  body: JSON.stringify({),
  errors,
  fieldCompleteness: Object.keys(formData).reduce((acc, key) => {,
  acc[key] = !!formData[key];
  return acc;
}, {} as Record<string, boolean>),
          timestamp: new Date().toISOString();

      });
 catch (error) {
  console.error('Failed to send error analytics:', error);
}, []);
  return {
    trackFieldValidation,
    trackUserHesitation,
    trackFormErrors
  };
};

// Type definitions for window.gtag
declare global {
  interface Window {
  gtag: (),
  command: string,
  action: string,
  parameters?: Record<string, any>) => void;

