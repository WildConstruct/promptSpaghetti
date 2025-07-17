-- Epic 16.1.5 - Transaction System Database Schema
-- Migration 009: Create transaction-related tables

-- Shopping Carts table
CREATE TABLE IF NOT EXISTS shopping_carts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    items TEXT NOT NULL DEFAULT '[]', -- JSON array of cart items
    discount_codes TEXT NOT NULL DEFAULT '[]', -- JSON array of discount codes
    total_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER NOT NULL DEFAULT 0,
    shipping_cents INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX idx_shopping_carts_expires_at ON shopping_carts(expires_at);

-- Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL, -- stripe, paypal, etc.
    type TEXT NOT NULL, -- card, bank_transfer, digital_wallet, crypto
    last_four TEXT,
    brand TEXT,
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    provider_method_id TEXT, -- External provider's method ID
    metadata TEXT DEFAULT '{}', -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_provider ON payment_methods(provider);

-- Payment Intents table
CREATE TABLE IF NOT EXISTS payment_intents (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    provider TEXT NOT NULL, -- stripe, paypal, etc.
    provider_intent_id TEXT NOT NULL, -- External provider's intent ID
    payment_method_id TEXT,
    status TEXT NOT NULL, -- requires_payment_method, requires_confirmation, requires_action, processing, succeeded, canceled
    client_secret TEXT,
    last_payment_error TEXT,
    metadata TEXT DEFAULT '{}', -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

CREATE INDEX idx_payment_intents_cart_id ON payment_intents(cart_id);
CREATE INDEX idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_provider_intent_id ON payment_intents(provider_intent_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    payment_intent_id TEXT NOT NULL,
    cart_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- purchase, refund, partial_refund, subscription, subscription_renewal
    amount_cents INTEGER NOT NULL,
    fee_cents INTEGER NOT NULL DEFAULT 0,
    net_amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    provider TEXT NOT NULL,
    provider_transaction_id TEXT NOT NULL,
    status TEXT NOT NULL, -- pending, processing, succeeded, failed, disputed, refunded
    escrow_status TEXT NOT NULL DEFAULT 'held', -- held, released, disputed, expired
    escrow_release_date DATETIME,
    risk_score INTEGER DEFAULT 0,
    fraud_flags TEXT DEFAULT '[]', -- JSON array of fraud flags
    metadata TEXT DEFAULT '{}', -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id),
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_payment_intent_id ON transactions(payment_intent_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider_transaction_id ON transactions(provider_transaction_id);
CREATE INDEX idx_transactions_escrow_status ON transactions(escrow_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    cart_id TEXT NOT NULL,
    payment_intent_id TEXT NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL, -- pending, processing, completed, failed, refunded, disputed
    subtotal_cents INTEGER NOT NULL,
    tax_cents INTEGER NOT NULL DEFAULT 0,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    billing_address TEXT NOT NULL, -- JSON billing address
    invoice_pdf_url TEXT,
    fulfillment_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, fulfilled, failed
    notes TEXT,
    metadata TEXT DEFAULT '{}', -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(id),
    FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    license_type TEXT NOT NULL, -- personal, commercial, enterprise, educational, unlimited
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL,
    total_price_cents INTEGER NOT NULL,
    license_id TEXT, -- Reference to generated license
    fulfillment_status TEXT NOT NULL DEFAULT 'pending', -- pending, fulfilled, failed
    metadata TEXT DEFAULT '{}', -- JSON metadata
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES marketplace_templates(id),
    FOREIGN KEY (version_id) REFERENCES template_versions(id)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_template_id ON order_items(template_id);
CREATE INDEX idx_order_items_license_id ON order_items(license_id);

-- Template Licenses table
CREATE TABLE IF NOT EXISTS template_licenses (
    id TEXT PRIMARY KEY,
    purchase_id TEXT NOT NULL, -- Reference to order
    template_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    license_type TEXT NOT NULL, -- personal, commercial, enterprise, educational, unlimited
    license_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active', -- active, suspended, expired, revoked, transferred
    usage_limit INTEGER, -- NULL for unlimited
    usage_count INTEGER DEFAULT 0,
    valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_until DATETIME, -- NULL for perpetual licenses
    transfer_count INTEGER DEFAULT 0,
    max_transfers INTEGER DEFAULT 1,
    restrictions TEXT DEFAULT '{}', -- JSON restrictions object
    metadata TEXT DEFAULT '{}', -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    FOREIGN KEY (purchase_id) REFERENCES orders(id),
    FOREIGN KEY (template_id) REFERENCES marketplace_templates(id),
    FOREIGN KEY (version_id) REFERENCES template_versions(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_template_licenses_purchase_id ON template_licenses(purchase_id);
CREATE INDEX idx_template_licenses_template_id ON template_licenses(template_id);
CREATE INDEX idx_template_licenses_buyer_id ON template_licenses(buyer_id);
CREATE INDEX idx_template_licenses_license_key ON template_licenses(license_key);
CREATE INDEX idx_template_licenses_status ON template_licenses(status);
CREATE INDEX idx_template_licenses_valid_until ON template_licenses(valid_until);

-- License Transfers table
CREATE TABLE IF NOT EXISTS license_transfers (
    id TEXT PRIMARY KEY,
    license_id TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    approved_by TEXT, -- Admin user ID who approved
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (license_id) REFERENCES template_licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_license_transfers_license_id ON license_transfers(license_id);
CREATE INDEX idx_license_transfers_from_user_id ON license_transfers(from_user_id);
CREATE INDEX idx_license_transfers_to_user_id ON license_transfers(to_user_id);

-- Refund Requests table
CREATE TABLE IF NOT EXISTS refund_requests (
    id TEXT PRIMARY KEY,
    purchase_id TEXT NOT NULL, -- Reference to order
    order_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied, processed
    admin_notes TEXT,
    processed_by TEXT, -- Admin user ID
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
CREATE INDEX idx_refund_requests_created_at ON refund_requests(created_at);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    refund_request_id TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    provider_refund_id TEXT NOT NULL,
    status TEXT NOT NULL, -- pending, succeeded, failed
    failure_reason TEXT,
    metadata TEXT DEFAULT '{}', -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (refund_request_id) REFERENCES refund_requests(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE INDEX idx_refunds_refund_request_id ON refunds(refund_request_id);
CREATE INDEX idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX idx_refunds_provider_refund_id ON refunds(provider_refund_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Risk Assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id TEXT PRIMARY KEY,
    payment_intent_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    risk_score INTEGER NOT NULL,
    risk_factors TEXT DEFAULT '[]', -- JSON array of risk factors
    geo_location TEXT DEFAULT '{}', -- JSON geo data
    device_fingerprint TEXT,
    velocity_checks TEXT DEFAULT '{}', -- JSON velocity check data
    recommendation TEXT NOT NULL, -- approve, review, decline
    automated_decision BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_risk_assessments_payment_intent_id ON risk_assessments(payment_intent_id);
CREATE INDEX idx_risk_assessments_user_id ON risk_assessments(user_id);
CREATE INDEX idx_risk_assessments_risk_score ON risk_assessments(risk_score);
CREATE INDEX idx_risk_assessments_recommendation ON risk_assessments(recommendation);

-- Tax Calculations table
CREATE TABLE IF NOT EXISTS tax_calculations (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    billing_address TEXT NOT NULL, -- JSON billing address
    subtotal_cents INTEGER NOT NULL,
    tax_cents INTEGER NOT NULL,
    tax_rate REAL NOT NULL,
    tax_jurisdiction TEXT NOT NULL,
    tax_breakdown TEXT DEFAULT '[]', -- JSON array of tax breakdown
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tax_calculations_cart_id ON tax_calculations(cart_id);
CREATE INDEX idx_tax_calculations_user_id ON tax_calculations(user_id);
CREATE INDEX idx_tax_calculations_calculated_at ON tax_calculations(calculated_at);

-- Discount Codes table (for future use)
CREATE TABLE IF NOT EXISTS discount_codes (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- percentage, fixed_amount, free_shipping
    value INTEGER NOT NULL, -- percentage or cents
    minimum_amount_cents INTEGER DEFAULT 0,
    maximum_discount_cents INTEGER,
    usage_limit INTEGER, -- NULL for unlimited
    usage_count INTEGER DEFAULT 0,
    valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_until DATETIME,
    applicable_templates TEXT DEFAULT '[]', -- JSON array of template IDs, empty for all
    applicable_categories TEXT DEFAULT '[]', -- JSON array of category IDs, empty for all
    first_time_users_only BOOLEAN DEFAULT FALSE,
    created_by TEXT, -- Admin user ID
    metadata TEXT DEFAULT '{}', -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_valid_from ON discount_codes(valid_from);
CREATE INDEX idx_discount_codes_valid_until ON discount_codes(valid_until);

-- Discount Code Usage table
CREATE TABLE IF NOT EXISTS discount_code_usage (
    id TEXT PRIMARY KEY,
    discount_code_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    discount_amount_cents INTEGER NOT NULL,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    UNIQUE(discount_code_id, user_id, order_id)
);

CREATE INDEX idx_discount_code_usage_discount_code_id ON discount_code_usage(discount_code_id);
CREATE INDEX idx_discount_code_usage_user_id ON discount_code_usage(user_id);
CREATE INDEX idx_discount_code_usage_order_id ON discount_code_usage(order_id);

-- Update existing marketplace_purchases table to reference orders
-- This maintains backwards compatibility while linking to the new order system
ALTER TABLE marketplace_purchases ADD COLUMN order_id TEXT;
CREATE INDEX idx_marketplace_purchases_order_id ON marketplace_purchases(order_id);

-- Create triggers to automatically clean up expired carts
CREATE TRIGGER IF NOT EXISTS cleanup_expired_carts
AFTER INSERT ON shopping_carts
BEGIN
    DELETE FROM shopping_carts WHERE expires_at < datetime('now', '-1 day');
END;

-- Create trigger to update marketplace_purchases when order is completed
CREATE TRIGGER IF NOT EXISTS sync_marketplace_purchases
AFTER UPDATE OF status ON orders
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
    INSERT OR REPLACE INTO marketplace_purchases (
        id, buyer_id, template_id, version_id, stripe_payment_intent_id,
        amount_cents, status, refund_reason, refund_amount_cents,
        escrow_released_at, created_at, updated_at, order_id
    )
    SELECT 
        COALESCE(mp.id, 'purchase_' || NEW.id),
        NEW.user_id,
        oi.template_id,
        oi.version_id,
        pi.provider_intent_id,
        NEW.total_cents,
        'succeeded',
        mp.refund_reason,
        COALESCE(mp.refund_amount_cents, 0),
        mp.escrow_released_at,
        NEW.created_at,
        NEW.updated_at,
        NEW.id
    FROM order_items oi
    JOIN payment_intents pi ON pi.id = NEW.payment_intent_id
    LEFT JOIN marketplace_purchases mp ON mp.order_id = NEW.id
    WHERE oi.order_id = NEW.id;
END;