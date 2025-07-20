// Epic 16.1.5 - Checkout Flow Component
import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { BillingAddress, PaymentIntent } from '../../types/marketplace';
import { useMarketplace } from '../../hooks/useMarketplace';
import { PriceDisplay } from './PriceDisplay';
import './CheckoutFlow.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFlowProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ onBack, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<'billing' | 'payment' | 'confirmation'>('billing');
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    name: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const { cart } = useMarketplace();

  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6'
      }
    }
  };

  const steps = [
    { id: 'billing', title: 'Billing Address', completed: currentStep !== 'billing' },
    { id: 'payment', title: 'Payment', completed: currentStep === 'confirmation' },
    { id: 'confirmation', title: 'Confirmation', completed: false }
  ];

  return (
    <div className="checkout-flow">
      {/* Header */}
      <div className="checkout-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Cart
        </button>
        
        <h1>Checkout</h1>
        
        <div className="checkout-security">
          <LockClosedIcon className="w-4 h-4" />
          <span>Secure Checkout</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="checkout-steps">
        {steps.map((step, index) => (
          <div key={step.id} className={`step ${step.completed ? 'completed' : ''} ${currentStep === step.id ? 'active' : ''}`}>
            <div className="step-indicator">
              {step.completed ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="checkout-content">
        <div className="checkout-main">
          {currentStep === 'billing' && (
            <BillingAddressForm
              address={billingAddress}
              onChange={setBillingAddress}
              errors={errors}
              onNext={() => setCurrentStep('payment')}
            />
          )}
          
          {currentStep === 'payment' && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm
                billingAddress={billingAddress}
                paymentIntent={paymentIntent}
                onPaymentIntentCreated={setPaymentIntent}
                onBack={() => setCurrentStep('billing')}
                onNext={() => setCurrentStep('confirmation')}
                onSuccess={onSuccess}
                processing={processing}
                setProcessing={setProcessing}
              />
            </Elements>
          )}
          
          {currentStep === 'confirmation' && (
            <ConfirmationStep
              paymentIntent={paymentIntent}
              onBack={() => setCurrentStep('payment')}
              onSuccess={onSuccess}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <OrderSummary cart={cart} />
      </div>
    </div>
  );
};

// Billing Address Form Component
interface BillingAddressFormProps {
  address: BillingAddress;
  onChange: (address: BillingAddress) => void;
  errors: Record<string, string>;
  onNext: () => void;
}

const BillingAddressForm: React.FC<BillingAddressFormProps> = ({
  address,
  onChange,
  errors,
  onNext
}) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof BillingAddress, value: string) => {
    onChange({ ...address, [field]: value });
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!address.name.trim()) newErrors.name = 'Name is required';
    if (!address.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(address.email)) newErrors.email = 'Email is invalid';
    if (!address.line1.trim()) newErrors.line1 = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    if (!address.country) newErrors.country = 'Country is required';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="billing-form">
      <h2>Billing Address</h2>
      <p className="form-description">
        We'll use this information for your receipt and tax calculations.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={address.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={formErrors.name ? 'error' : ''}
              placeholder="John Doe"
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              value={address.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={formErrors.email ? 'error' : ''}
              placeholder="john@example.com"
            />
            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="line1">Address Line 1 *</label>
          <input
            type="text"
            id="line1"
            value={address.line1}
            onChange={(e) => handleChange('line1', e.target.value)}
            className={formErrors.line1 ? 'error' : ''}
            placeholder="123 Main Street"
          />
          {formErrors.line1 && <div className="error-message">{formErrors.line1}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="line2">Address Line 2</label>
          <input
            type="text"
            id="line2"
            value={address.line2 || ''}
            onChange={(e) => handleChange('line2', e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              value={address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={formErrors.city ? 'error' : ''}
              placeholder="New York"
            />
            {formErrors.city && <div className="error-message">{formErrors.city}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="state">State/Province</label>
            <input
              type="text"
              id="state"
              value={address.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="NY"
            />
          </div>

          <div className="form-group">
            <label htmlFor="postal_code">Postal Code *</label>
            <input
              type="text"
              id="postal_code"
              value={address.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              className={formErrors.postal_code ? 'error' : ''}
              placeholder="10001"
            />
            {formErrors.postal_code && <div className="error-message">{formErrors.postal_code}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <select
            id="country"
            value={address.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className={formErrors.country ? 'error' : ''}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="JP">Japan</option>
            {/* Add more countries as needed */}
          </select>
          {formErrors.country && <div className="error-message">{formErrors.country}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="tax_id">Tax ID (Optional)</label>
          <input
            type="text"
            id="tax_id"
            value={address.tax_id || ''}
            onChange={(e) => handleChange('tax_id', e.target.value)}
            placeholder="For business purchases"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

// Payment Form Component
interface PaymentFormProps {
  billingAddress: BillingAddress;
  paymentIntent: PaymentIntent | null;
  onPaymentIntentCreated: (intent: PaymentIntent) => void;
  onBack: () => void;
  onNext: () => void;
  onSuccess: (orderId: string) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  billingAddress,
  paymentIntent,
  onPaymentIntentCreated,
  onBack,
  onSuccess,
  processing,
  setProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  const { cart, createPaymentIntent, processPayment } = useMarketplace();

  useEffect(() => {
    if (!paymentIntent && cart && billingAddress.email) {
      handleCreatePaymentIntent();
    }
  }, [cart, billingAddress.email]);

  const handleCreatePaymentIntent = async () => {
    if (!cart) return;

    try {
      setProcessing(true);
      const intent = await createPaymentIntent({
        cart_id: cart.id,
        billing_address: billingAddress,
        save_payment_method: savePaymentMethod
      });
      onPaymentIntentCreated(intent);
    } catch (err: any) {
      setError(err.message || 'Failed to prepare payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !paymentIntent) {
      setError('Payment system not ready');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmCardPayment(
        paymentIntent.client_secret!,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: billingAddress.name,
              email: billingAddress.email,
              address: {
                line1: billingAddress.line1,
                line2: billingAddress.line2 || undefined,
                city: billingAddress.city,
                state: billingAddress.state || undefined,
                postal_code: billingAddress.postal_code,
                country: billingAddress.country
              }
            }
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      // Process payment on our backend
      const order = await processPayment({
        payment_intent_id: paymentIntent.id
      });

      onSuccess(order.id);

    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <h2>Payment Information</h2>
      <p className="form-description">
        Your payment is secured with 256-bit SSL encryption.
      </p>

      {error && (
        <div className="error-alert">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="card-element-container">
          <label>Card Information</label>
          <div className="card-element">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4'
                    }
                  }
                },
                hidePostalCode: true // We collect this separately
              }}
            />
          </div>
        </div>

        <div className="payment-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={savePaymentMethod}
              onChange={(e) => setSavePaymentMethod(e.target.checked)}
            />
            <span>Save payment method for future purchases</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn btn-secondary">
            Back
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!stripe || processing}
          >
            <CreditCardIcon className="w-5 h-5" />
            {processing ? 'Processing...' : `Pay ${cart ? '$' + (cart.total_cents / 100).toFixed(2) : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

// Confirmation Step Component
interface ConfirmationStepProps {
  paymentIntent: PaymentIntent | null;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  paymentIntent,
  onBack,
  onSuccess
}) => {
  return (
    <div className="confirmation-step">
      <h2>Confirm Your Order</h2>
      <p className="form-description">
        Please review your order details before completing your purchase.
      </p>

      {/* This would show order summary and final confirmation */}
      <div className="confirmation-content">
        <div className="success-icon">
          <CheckCircleIcon className="w-16 h-16" />
        </div>
        <h3>Order Confirmed!</h3>
        <p>Your purchase has been processed successfully.</p>
        
        <button 
          onClick={() => onSuccess('order-id')} 
          className="btn btn-primary"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

// Order Summary Component
interface OrderSummaryProps {
  cart: any; // ShoppingCart type
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart }) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.items.reduce((sum: number, item: any) => 
    sum + (item.unit_price_cents * item.quantity), 0
  );

  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      
      <div className="summary-items">
        {cart.items.map((item: any) => (
          <div key={item.id} className="summary-item">
            <div className="item-details">
              <div className="item-name">Template {item.template_id.slice(0, 8)}</div>
              <div className="item-license">{item.license_type}</div>
            </div>
            <div className="item-price">
              <PriceDisplay cents={item.unit_price_cents * item.quantity} />
            </div>
          </div>
        ))}
      </div>

      <div className="summary-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <PriceDisplay cents={subtotal} />
        </div>
        
        {cart.tax_cents > 0 && (
          <div className="total-row">
            <span>Tax:</span>
            <PriceDisplay cents={cart.tax_cents} />
          </div>
        )}
        
        <div className="total-row total-final">
          <span>Total:</span>
          <PriceDisplay cents={cart.total_cents || subtotal} />
        </div>
      </div>
    </div>
  );
};