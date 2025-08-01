/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Epic 16.1.5 - Shopping Cart Component
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  XMarkIcon
 from '@heroicons/react/24/outline';
import { CartItem, LicenseType } from '../../types/marketplace';
import { useMarketplace } from '../../hooks/useMarketplace';
import { PriceDisplay } from './PriceDisplay';
import { Badge } from './Badge';
import './ShoppingCart.css';


interface ShoppingCartProps {
  isOpen: boolean;,
  onClose: () => void;,
  onCheckout: () => void;
  export const ShoppingCart: React.FC<ShoppingCartProps> = ({),
  isOpen,
  onClose,
  onCheckout


}) => {
  const { cart, updateCartItem, removeFromCart, clearCart, loading } = useMarketplace();
  const [isClearing, setIsClearing] = useState(false);
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeFromCart(itemId);
 else {
      await updateCartItem(itemId, { quantity: newQuantity });
  };
  const handleLicenseChange = async (itemId: string, licenseType: LicenseType) => {
    await updateCartItem(itemId, { license_type: licenseType });
  };
  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
 finally {
      setIsClearing(false);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _formatLicenseType = (licenseType: LicenseType): string => {
    return licenseType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const subtotal = cart?.items.reduce((sum, item) => ;
    sum + (item.unit_price_cents * item.quantity), 0
  ) || 0;
  if (!isOpen) return null;
  return;
    <div className="shopping-cart-overlay">
      <div className="shopping-cart-panel">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingCartIcon className="cart-icon" />
            <h2>Shopping Cart</h2>
            {cart?.items && cart.items.length > 0 && ()
              <Badge variant="primary" size="sm">
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </div>
          <button 
            onClick={onClose}
            className="cart-close-btn"
            aria-label="Close cart"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        {/* Content */}
        <div className="cart-content">
          {!cart?.items || cart.items.length === 0 ? ()
            <div className="cart-empty">
              <ShoppingCartIcon className="empty-cart-icon" />
              <h3>Your cart is empty</h3>
              <p>Browse our marketplace to find templates for your projects.</p>
            </div>
          ) : ()
            <>
              {/* Cart Items */}
              <div className="cart-items">
                {cart.items.map((item) => ()
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onLicenseChange={handleLicenseChange}
                    onRemove={() => removeFromCart(item.id)}
                    disabled={loading}
                  />
                ))}
              </div>
              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <PriceDisplay cents={subtotal} />
                </div>
                {cart.tax_cents > 0 && ()
                  <div className="summary-row">
                    <span>Tax:</span>
                    <PriceDisplay cents={cart.tax_cents} />
                  </div>
                )}
                <div className="summary-row summary-total">
                  <span>Total:</span>
                  <PriceDisplay cents={cart.total_cents || subtotal} />
                </div>
                {/* Actions */}
                <div className="cart-actions">
                  <button
                    onClick={handleClearCart}
                    className="btn btn-secondary btn-sm"
                    disabled={loading || isClearing}
                  >
                    {isClearing ? 'Clearing...' : 'Clear Cart'}
                  </button>
                  <button
                    onClick={onCheckout}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


interface CartItemComponentProps {
  item: CartItem;,
  onQuantityChange: (itemId: string, quantity: number) => void;,
  onLicenseChange: (itemId: string, licenseType: LicenseType) => void;,
  onRemove: () => void;,
  disabled: boolean;
  const CartItemComponent: React.FC<CartItemComponentProps> = ({),
  item,
  onQuantityChange,
  onLicenseChange,
  onRemove,
  disabled


}) => {
  const [template, setTemplate] = useState<unknown>(null);
  useEffect(() => {
    // Fetch template details - in a real app, this would come from a context or service
    // For now, we'll use placeholder data
    setTemplate({)
  id: item.template_id,
      title: `Template ${item.template_id.slice(0, 8)}`}
},
  description: 'A powerful prompt template for various use cases',
      owner: { name: 'Creator Name' }
    });
  }, [item.template_id]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _formatLicenseType = (licenseType: LicenseType): string => {
    return licenseType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const getLicenseOptions = (): { value: LicenseType; label: string; description: string }[] => [
    {
  value: LicenseType.PERSONAL,
  label: 'Personal',
  description: 'For personal use only',

    {
  value: LicenseType.COMMERCIAL,
  label: 'Commercial',
  description: 'For commercial projects',

    {
  value: LicenseType.ENTERPRISE,
  label: 'Enterprise',
  description: 'For large organizations',

    {
  value: LicenseType.EDUCATIONAL,
  label: 'Educational',
  description: 'For educational institutions',

    { 
      value: LicenseType.UNLIMITED, 
      label: 'Unlimited', 
      description: 'No usage restrictions' ];
  return;
    <div className="cart-item">
      <div className="item-info">
        <h4 className="item-title">
          {template?.title || 'Loading...'}
        </h4>
        <p className="item-creator">
          by {template?.owner?.name || 'Unknown'}
        </p>
        {/* License Selection */}
        <div className="license-selection">
          <label htmlFor={`license-${item.id}`} className="license-label">}
            License Type:
          </label>
          <select
            id={`license-${item.id}`}
            value={item.license_type}
            onChange={(e) => onLicenseChange(item.id, e.target.value as LicenseType)}
            className="license-select"
            disabled={disabled}
          >
            {getLicenseOptions().map((option) => ()
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="item-controls">
        <div className="quantity-controls">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="quantity-btn"
            disabled={disabled || item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <span className="quantity-display">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="quantity-btn"
            disabled={disabled}
            aria-label="Increase quantity"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="item-price">
          <PriceDisplay cents={item.unit_price_cents * item.quantity} />
          {item.quantity > 1 && ()
            <div className="unit-price">
              <PriceDisplay cents={item.unit_price_cents} /> each
            </div>
          )}
        </div>
        <button
          onClick={onRemove}
          className="remove-btn"
          disabled={disabled}
          aria-label="Remove item"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
export default ShoppingCart;