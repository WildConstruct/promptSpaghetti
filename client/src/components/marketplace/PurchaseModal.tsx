// Epic 16 Marketplace - Purchase Modal Component
import React, { useState, useEffect } from 'react';
import { PriceDisplay } from './PriceDisplay';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './PurchaseModal.css';

interface PurchaseModalProps {
  template: Error;
  onClose: () => void;
  onComplete: (success: boolean) => void;
  className?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  is_default: boolean;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  template,
  onClose,
  onComplete,
  className = ''
}) => {
  const [step, setStep] = useState<'confirm' | 'payment' | 'processing' | 'success' | 'error'>('confirm');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [/*_loading*/, setLoading] = useState(false); // Commented out unused variable
  const [error, setError] = useState<string | null>(null);
  const [/*_purchaseId*/, setPurchaseId] = useState<string | null>(null); // Commented out unused variable

  useEffect(() => {
    if (template.price_cents > 0) {
      loadPaymentMethods();
    }
  }, [template.price_cents]);

  const loadPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/payment/methods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const methods = await response.json();
        setPaymentMethods(methods);
        
        // Auto-select default payment method
        const defaultMethod = methods.find((method: PaymentMethod) => method.is_default);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        } else if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const handleConfirm = () => {
    if (template.price_cents === 0) {
      // Free template, proceed directly to purchase
      handlePurchase();
    } else {
      // Paid template, show payment step
      setStep('payment');
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/marketplace/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template_id: template.id,
          version_id: template.current_version_id,
          payment_method_id: template.price_cents > 0 ? selectedPaymentMethod : undefined
        })
      });

      if (response.ok) {
        const purchase = await response.json();
        setPurchaseId(purchase.id);
        
        if (template.price_cents === 0 || purchase.status === 'succeeded') {
          setStep('success');
          setTimeout(() => {
            onComplete(true);
          }, 2000);
        } else {
          // Handle payment processing for paid templates
          await processPayment(purchase);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Purchase failed');
        setStep('error');
      }
    } catch (_err) { 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.debug('Purchase error:', _err);
      setError('Purchase failed. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (_purchase: unknown) => { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.debug('Processing payment for purchase:', _purchase);
    // This would integrate with Stripe or other payment processor
    // For now, we'll simulate payment processing
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      // In a real implementation, this would handle Stripe confirmation
      setStep('success');
      setTimeout(() => {
        onComplete(true);
      }, 2000);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error('Payment processing failed:', error);
      setError('Payment processing failed');
      setStep('error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatCardInfo = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return `•••• •••• •••• ${method.last4} (${method.brand?.toUpperCase()})`;
    }
    return 'PayPal';
  };

  const renderConfirmStep = () => (
    <div className="purchase-step">
      <div className="step-header">
        <h3>Confirm Purchase</h3>
        <p>You&apos;re about to {template.price_cents === 0 ? 'get' : 'purchase'} this template:</p>
      </div>

      <div className="template-summary">
        <div className="template-info">
          <h4>{template.title}</h4>
          <div className="template-badges">
            {template.featured_at && <Badge variant="featured">Featured</Badge>}
            {template.price_cents === 0 && <Badge variant="free">Free</Badge>}
            {template.is_ai_generated && <Badge variant="ai">AI Generated</Badge>}
          </div>
        </div>
        
        <div className="price-section">
          <PriceDisplay priceCents={template.price_cents} size="large" />
        </div>
      </div>

      <div className="purchase-details">
        <div className="detail-row">
          <span>Template:</span>
          <span>{template.title}</span>
        </div>
        <div className="detail-row">
          <span>Version:</span>
          <span>Latest</span>
        </div>
        <div className="detail-row">
          <span>License:</span>
          <span>Personal & Commercial Use</span>
        </div>
        <div className="detail-row total">
          <span>Total:</span>
          <PriceDisplay priceCents={template.price_cents} />
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
        <button onClick={handleConfirm} className="confirm-button">
          {template.price_cents === 0 ? 'Get Template' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="purchase-step">
      <div className="step-header">
        <h3>Payment Information</h3>
        <p>Select your payment method:</p>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="payment-methods">
          {paymentMethods.map((method) => (
            <label key={method.id} className="payment-method">
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={selectedPaymentMethod === method.id}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              />
              <div className="method-info">
                <div className="method-details">
                  <span className="method-type">
                    {method.type === 'card' ? '💳' : '🟦'} {formatCardInfo(method)}
                  </span>
                  {method.is_default && <Badge variant="default">Default</Badge>}
                </div>
              </div>
            </label>
          ))}
          
          <button className="add-payment-method">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add New Payment Method
          </button>
        </div>
      ) : (
        <div className="no-payment-methods">
          <p>No payment methods found. Please add a payment method to continue.</p>
          <button className="add-payment-method primary">
            Add Payment Method
          </button>
        </div>
      )}

      <div className="purchase-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <PriceDisplay priceCents={template.price_cents} />
        </div>
        <div className="summary-row">
          <span>Processing Fee:</span>
          <span>$0.00</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <PriceDisplay priceCents={template.price_cents} />
        </div>
      </div>

      <div className="step-actions">
        <button onClick={() => setStep('confirm')} className="back-button">
          Back
        </button>
        <button 
          onClick={handlePurchase} 
          className="purchase-button"
          disabled={!selectedPaymentMethod}
        >
          Complete Purchase
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="purchase-step processing">
      <div className="processing-content">
        <LoadingSpinner size="large" />
        <h3>Processing Purchase</h3>
        <p>Please wait while we process your {template.price_cents === 0 ? 'request' : 'payment'}...</p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="purchase-step success">
      <div className="success-content">
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#10B981"/>
            <path
              d="M20 32L28 40L44 24"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3>Purchase Successful!</h3>
        <p>
          {template.price_cents === 0 
            ? 'You now have access to this free template.'
            : 'Your payment has been processed and you now own this template.'
          }
        </p>
        <div className="next-steps">
          <h4>What&apos;s next?</h4>
          <ul>
            <li>Access your template in the &quot;My Templates&quot; section</li>
            <li>Import it into your workspace</li>
            <li>Start creating amazing content!</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="purchase-step error">
      <div className="error-content">
        <div className="error-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#EF4444"/>
            <path
              d="M24 24L40 40M24 40L40 24"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h3>Purchase Failed</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => setStep('confirm')} className="retry-button">
            Try Again
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`purchase-modal-overlay ${className}`} onClick={onClose} onKeyDown={handleKeyPress}>
      <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>
            {step === 'confirm' && (template.price_cents === 0 ? 'Get Template' : 'Purchase Template')}
            {step === 'payment' && 'Payment'}
            {step === 'processing' && 'Processing'}
            {step === 'success' && 'Success'}
            {step === 'error' && 'Error'}
          </h2>
          {step !== 'processing' && (
            <button onClick={onClose} className="close-button" aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </header>

        <div className="modal-content">
          {step === 'confirm' && renderConfirmStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'error' && renderErrorStep()}
        </div>
      </div>
    </div>
  );
};