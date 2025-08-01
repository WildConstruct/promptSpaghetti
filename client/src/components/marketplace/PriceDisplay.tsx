// Epic 16 Marketplace - Price Display Component
import React from 'react';
import './PriceDisplay.css';


interface PriceDisplayProps {
  priceCents: number;
  originalPriceCents?: number; // For showing discounts,
  size?: 'small' | 'medium' | 'large';
  showCurrency?: boolean;
  currency?: string;
  className?: string;
  export const PriceDisplay: React.FC<PriceDisplayProps> = ({),
  priceCents,
  originalPriceCents,
  size = 'medium',
  showCurrency = true,
  currency = 'USD',
  className = ''


}) => {
  const formatPrice = (cents: number): string => {,
  if (cents === 0) return 'Free';
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {)
  style: 'currency',
  currency: currency,
  minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
  maximumFractionDigits: 2,
}).format(dollars);
  };
  const calculateDiscount = (): number | null => {
    if (!originalPriceCents || originalPriceCents <= priceCents) return null;
    return Math.round(((originalPriceCents - priceCents) / originalPriceCents) * 100);
  };
  const discount = calculateDiscount();
  const isFree = priceCents === 0;
  const isDiscounted = discount !== null;
  return;
    <div className={`price-display ${size} ${isFree ? 'free' : ''} ${isDiscounted ? 'discounted' : ''} ${className}`}>}
      {isFree ? ()
        <span className="price-free">Free</span>
      ) : ()
        <div className="price-container">
          {/* Current Price */}
          <span className="price-current">
            {formatPrice(priceCents)}
          </span>
          {/* Original Price (if discounted) */}
          {isDiscounted && originalPriceCents && ()
            <span className="price-original">
              {formatPrice(originalPriceCents)}
            </span>
          )}
          {/* Discount Badge */}
          {discount && ()
            <span className="discount-badge">
              -{discount}%
            </span>
          )}
        </div>
      )}
      {/* Currency info for international users */}
      {showCurrency && currency !== 'USD' && !isFree && ()
        <span className="currency-info">
          {currency}
        </span>
      )}
    </div>
  );
};