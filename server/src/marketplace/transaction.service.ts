// Epic 16.1.5 - Transaction Service
import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import {
  ShoppingCart,
  CartItem,
  PaymentIntent,
  Transaction,
  Order,
  OrderItem,
  TemplateLicense,
  RefundRequest,
  Refund,
  RiskAssessment,
  TaxCalculation,
  PaymentProvider,
  TransactionType,
  EscrowStatus,
  LicenseType,
  LicenseStatus,
  BillingAddress,
  AddToCartSchema,
  UpdateCartSchema,
  CreatePaymentIntentSchema,
  ProcessPaymentSchema,
  CreateRefundRequestSchema
 from './transaction.types.js';
import { MarketplaceTemplate, TemplateVersion } from './types.js';
import { DatabaseService } from '../database/database.service.js';

export class TransactionService {
  private stripe: Stripe;
  private db: DatabaseService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.db = fastify.db;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');

    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });


  // =============================================
  // Shopping Cart Management
  // =============================================

  async createCart(userId: string): Promise<ShoppingCart> {

    const cartId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const cart: ShoppingCart = {
      id: cartId,
      user_id: userId,
      items: [],
      discount_codes: [],
      total_cents: 0,
      tax_cents: 0,
      shipping_cents: 0,
      created_at: new Date(),
      updated_at: new Date(),
      expires_at: expiresAt
    };

    await this.db.query(
      `INSERT INTO shopping_carts (id, user_id, items, discount_codes, total_cents, tax_cents, shipping_cents, created_at, updated_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cartId, userId, JSON.stringify([]), JSON.stringify([]), 0, 0, 0, cart.created_at, cart.updated_at, expiresAt]
    );

    return cart;


  async getCart(cartId: string, userId: string): Promise<ShoppingCart | null> {

    const result = await this.db.query(
      'SELECT * FROM shopping_carts WHERE id = ? AND user_id = ? AND expires_at > datetime(\'now\')',
      [cartId, userId]
    );

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      user_id: row.user_id,
      items: JSON.parse(row.items),
      discount_codes: JSON.parse(row.discount_codes),
      total_cents: row.total_cents,
      tax_cents: row.tax_cents,
      shipping_cents: row.shipping_cents,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      expires_at: new Date(row.expires_at)
    };


  async addToCart(userId: string, cartData: any): Promise<ShoppingCart> {

    const validated = AddToCartSchema.parse(cartData);
    
    // Get or create cart
    let cart = await this.getActiveCart(userId);
    if (!cart) {
      cart = await this.createCart(userId);


    // Validate templates exist and are purchasable
    for (const item of validated.items) {
      const template = await this.getTemplate(item.template_id);
      if (!template || template.status !== 'listed') {
        throw new Error(`Template ${item.template_id} is not available for purchase`);


      // Check if user already owns this template
      const existingPurchase = await this.checkExistingPurchase(userId, item.template_id);
      if (existingPurchase) {
        throw new Error(`You already own template: ${template.title}`);



    // Add items to cart
    for (const itemData of validated.items) {
      const template = await this.getTemplate(itemData.template_id);
      const version = await this.getTemplateVersion(itemData.template_id, itemData.version_id);
      
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        template_id: itemData.template_id,
        version_id: version?.id || template?.current_version_id,
        license_type: itemData.license_type,
        quantity: itemData.quantity,
        unit_price_cents: this.calculateLicensePrice(template!.price_cents, itemData.license_type),
        added_at: new Date()
      };

      cart.items.push(cartItem);


    return await this.updateCartTotals(cart);


  async updateCartItem(userId: string, cartId: string, updateData: any): Promise<ShoppingCart> {

    const validated = UpdateCartSchema.parse(updateData);
    const cart = await this.getCart(cartId, userId);
    
    if (!cart) {
      throw new Error('Cart not found or expired');


    if (validated.quantity === 0) {
      // Remove item
      cart.items = cart.items.filter(item => item.id !== validated.item_id);
 else {
      // Update item
      const itemIndex = cart.items.findIndex(item => item.id === validated.item_id);
      if (itemIndex === -1) {
        throw new Error('Cart item not found');


      cart.items[itemIndex].quantity = validated.quantity;
      if (validated.license_type) {
        cart.items[itemIndex].license_type = validated.license_type;
        const template = await this.getTemplate(cart.items[itemIndex].template_id);
        cart.items[itemIndex].unit_price_cents = this.calculateLicensePrice(
          template!.price_cents, 
          validated.license_type
        );



    return await this.updateCartTotals(cart);


  async clearCart(userId: string, cartId: string): Promise<void> {

    await this.db.query(
      'DELETE FROM shopping_carts WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );


  // =============================================
  // Payment Processing
  // =============================================

  async createPaymentIntent(userId: string, paymentData: any): Promise<PaymentIntent> {

    const validated = CreatePaymentIntentSchema.parse(paymentData);
    const cart = await this.getCart(validated.cart_id, userId);
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty or not found');


    // Calculate final totals with tax
    await this.calculateTax(cart, validated.billing_address);
    const finalCart = await this.updateCartTotals(cart);

    // Perform risk assessment
    const riskAssessment = await this.assessRisk(userId, finalCart, validated.billing_address);
    
    if (riskAssessment.recommendation === 'decline') {
      throw new Error('Payment declined due to risk factors');


    // Create Stripe payment intent
    const stripeIntent = await this.stripe.paymentIntents.create({
      amount: finalCart.total_cents,
      currency: 'usd',
      payment_method: validated.payment_method_id,
      confirmation_method: 'manual',
      confirm: false,
      capture_method: 'manual', // For escrow system
      metadata: {
        cart_id: finalCart.id,
        user_id: userId,
        risk_score: riskAssessment.risk_score.toString()

    });

    const paymentIntent: PaymentIntent = {
      id: crypto.randomUUID(),
      cart_id: finalCart.id,
      user_id: userId,
      amount_cents: finalCart.total_cents,
      currency: 'usd',
      provider: PaymentProvider.STRIPE,
      provider_intent_id: stripeIntent.id,
      payment_method_id: validated.payment_method_id,
      status: stripeIntent.status as any,
      client_secret: stripeIntent.client_secret || undefined,
      metadata: {
        risk_assessment_id: riskAssessment.id,
        billing_address: validated.billing_address

      created_at: new Date(),
      updated_at: new Date()
    };

    // Save payment intent
    await this.db.query(
      `INSERT INTO payment_intents (id, cart_id, user_id, amount_cents, currency, provider, provider_intent_id, 
       payment_method_id, status, client_secret, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentIntent.id, paymentIntent.cart_id, paymentIntent.user_id, paymentIntent.amount_cents,
        paymentIntent.currency, paymentIntent.provider, paymentIntent.provider_intent_id,
        paymentIntent.payment_method_id, paymentIntent.status, paymentIntent.client_secret,
        JSON.stringify(paymentIntent.metadata), paymentIntent.created_at, paymentIntent.updated_at
      ]
    );

    return paymentIntent;


  async processPayment(userId: string, paymentData: any): Promise<Order> {

    const validated = ProcessPaymentSchema.parse(paymentData);
    const paymentIntent = await this.getPaymentIntent(validated.payment_intent_id, userId);
    
    if (!paymentIntent) {
      throw new Error('Payment intent not found');


    // Confirm payment with Stripe
    const stripeIntent = await this.stripe.paymentIntents.confirm(
      paymentIntent.provider_intent_id,
      {
        payment_method: paymentIntent.payment_method_id,
        return_url: `${process.env.CLIENT_URL}/payment/return`
      }
    );

    // Update payment intent status
    await this.updatePaymentIntentStatus(paymentIntent.id, stripeIntent.status as any);

    if (stripeIntent.status === 'succeeded') {
      // Create transaction record
      const transaction = await this.createTransaction(paymentIntent, TransactionType.PURCHASE);
      
      // Create order and fulfill
      const order = await this.createOrder(paymentIntent, transaction);
      await this.fulfillOrder(order);
      
      // Clear cart
      await this.clearCart(userId, paymentIntent.cart_id);
      
      return order;
 else if (stripeIntent.status === 'requires_action') {
      throw new Error('Payment requires additional authentication');
 else {
      throw new Error('Payment failed');



  // =============================================
  // Order Management
  // =============================================

  async createOrder(paymentIntent: PaymentIntent, transaction: Transaction): Promise<Order> {

    const cart = await this.getCart(paymentIntent.cart_id, paymentIntent.user_id);
    if (!cart) throw new Error('Cart not found');

    const orderId = crypto.randomUUID();
    const orderNumber = this.generateOrderNumber();
    const billingAddress = paymentIntent.metadata.billing_address as BillingAddress;

    const order: Order = {
      id: orderId,
      user_id: paymentIntent.user_id,
      cart_id: cart.id,
      payment_intent_id: paymentIntent.id,
      order_number: orderNumber,
      status: 'processing',
      items: [],
      subtotal_cents: cart.total_cents - cart.tax_cents,
      tax_cents: cart.tax_cents,
      discount_cents: 0,
      total_cents: cart.total_cents,
      currency: paymentIntent.currency,
      billing_address: billingAddress,
      fulfillment_status: 'pending',
      metadata: {},
      created_at: new Date(),
      updated_at: new Date()
    };

    // Create order items
    for (const cartItem of cart.items) {
      const orderItem: OrderItem = {
        id: crypto.randomUUID(),
        order_id: orderId,
        template_id: cartItem.template_id,
        version_id: cartItem.version_id!,
        license_type: cartItem.license_type,
        quantity: cartItem.quantity,
        unit_price_cents: cartItem.unit_price_cents,
        total_price_cents: cartItem.unit_price_cents * cartItem.quantity,
        fulfillment_status: 'pending',
        metadata: {}
      };
      order.items.push(orderItem);


    // Save order
    await this.db.query(
      `INSERT INTO orders (id, user_id, cart_id, payment_intent_id, order_number, status, subtotal_cents, 
       tax_cents, discount_cents, total_cents, currency, billing_address, fulfillment_status, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, order.user_id, order.cart_id, order.payment_intent_id, order.order_number,
        order.status, order.subtotal_cents, order.tax_cents, order.discount_cents, order.total_cents,
        order.currency, JSON.stringify(order.billing_address), order.fulfillment_status,
        JSON.stringify(order.metadata), order.created_at, order.updated_at
      ]
    );

    // Save order items
    for (const item of order.items) {
      await this.db.query(
        `INSERT INTO order_items (id, order_id, template_id, version_id, license_type, quantity, 
         unit_price_cents, total_price_cents, fulfillment_status, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id, item.order_id, item.template_id, item.version_id, item.license_type,
          item.quantity, item.unit_price_cents, item.total_price_cents, item.fulfillment_status,
          JSON.stringify(item.metadata)
        ]
      );


    return order;


  async fulfillOrder(order: Order): Promise<void> {

    try {
      // Generate licenses for each item
      for (const item of order.items) {
        const license = await this.generateLicense(order, item);
        
        // Update order item with license
        await this.db.query(
          'UPDATE order_items SET license_id = ?, fulfillment_status = \'fulfilled\' WHERE id = ?',
          [license.id, item.id]
        );


      // Update order status
      await this.db.query(
        'UPDATE orders SET status = \'completed\', fulfillment_status = \'fulfilled\', completed_at = datetime(\'now\') WHERE id = ?',
        [order.id]
      );

      // Generate invoice
      await this.generateInvoice(order);

      // Send confirmation email (placeholder)
      this.fastify.log.info(`Order ${order.order_number} fulfilled successfully`);
 catch (error) {
      this.fastify.log.error('Order fulfillment failed:', error);
      
      // Update order status to failed
      await this.db.query(
        'UPDATE orders SET fulfillment_status = \'failed\' WHERE id = ?',
        [order.id]
      );
      
      throw error;



  // =============================================
  // License Management
  // =============================================

  async generateLicense(order: Order, orderItem: OrderItem): Promise<TemplateLicense> {

    const licenseId = crypto.randomUUID();
    const licenseKey = this.generateLicenseKey();
    
    const license: TemplateLicense = {
      id: licenseId,
      purchase_id: order.id,
      template_id: orderItem.template_id,
      version_id: orderItem.version_id,
      buyer_id: order.user_id,
      license_type: orderItem.license_type,
      license_key: licenseKey,
      status: LicenseStatus.ACTIVE,
      usage_limit: this.getLicenseUsageLimit(orderItem.license_type),
      usage_count: 0,
      valid_from: new Date(),
      valid_until: this.getLicenseExpiration(orderItem.license_type),
      transfer_count: 0,
      max_transfers: this.getMaxTransfers(orderItem.license_type),
      restrictions: this.getLicenseRestrictions(orderItem.license_type),
      metadata: {},
      created_at: new Date(),
      updated_at: new Date()
    };

    await this.db.query(
      `INSERT INTO template_licenses (id, purchase_id, template_id, version_id, buyer_id, license_type, 
       license_key, status, usage_limit, usage_count, valid_from, valid_until, transfer_count, max_transfers, 
       restrictions, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        licenseId, license.purchase_id, license.template_id, license.version_id, license.buyer_id,
        license.license_type, license.license_key, license.status, license.usage_limit,
        license.usage_count, license.valid_from, license.valid_until, license.transfer_count,
        license.max_transfers, JSON.stringify(license.restrictions), JSON.stringify(license.metadata),
        license.created_at, license.updated_at
      ]
    );

    return license;


  async validateLicense(licenseKey: string, templateId: string, userId: string): Promise<boolean> {

    const result = await this.db.query(
      'SELECT * FROM template_licenses WHERE license_key = ? AND template_id = ? AND buyer_id = ? AND status = \'active\'',
      [licenseKey, templateId, userId]
    );

    if (result.length === 0) return false;

    const license = result[0];
    
    // Check expiration
    if (license.valid_until && new Date() > new Date(license.valid_until)) {
      return false;


    // Check usage limits
    if (license.usage_limit && license.usage_count >= license.usage_limit) {
      return false;


    // Update usage count
    await this.db.query(
      'UPDATE template_licenses SET usage_count = usage_count + 1, last_used_at = datetime(\'now\') WHERE id = ?',
      [license.id]
    );

    return true;


  // =============================================
  // Refund Processing
  // =============================================

  async createRefundRequest(userId: string, refundData: any): Promise<RefundRequest> {

    const validated = CreateRefundRequestSchema.parse(refundData);
    
    // Verify purchase ownership
    const purchase = await this.getUserPurchase(userId, validated.purchase_id);
    if (!purchase) {
      throw new Error('Purchase not found or not owned by user');


    // Check refund eligibility
    if (!this.isRefundEligible(purchase)) {
      throw new Error('Purchase is not eligible for refund');


    const refundRequestId = crypto.randomUUID();
    const refundAmount = validated.amount_cents || purchase.total_cents;

    const refundRequest: RefundRequest = {
      id: refundRequestId,
      purchase_id: validated.purchase_id,
      order_id: purchase.id,
      user_id: userId,
      reason: validated.reason,
      amount_cents: refundAmount,
      status: 'pending',
      created_at: new Date()
    };

    await this.db.query(
      `INSERT INTO refund_requests (id, purchase_id, order_id, user_id, reason, amount_cents, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [refundRequestId, refundRequest.purchase_id, refundRequest.order_id, refundRequest.user_id,
        refundRequest.reason, refundRequest.amount_cents, refundRequest.status, refundRequest.created_at]
    );

    return refundRequest;


  // =============================================
  // Helper Methods
  // =============================================

  private async getActiveCart(userId: string): Promise<ShoppingCart | null> {

    const result = await this.db.query(
      'SELECT * FROM shopping_carts WHERE user_id = ? AND expires_at > datetime(\'now\') ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      user_id: row.user_id,
      items: JSON.parse(row.items),
      discount_codes: JSON.parse(row.discount_codes),
      total_cents: row.total_cents,
      tax_cents: row.tax_cents,
      shipping_cents: row.shipping_cents,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      expires_at: new Date(row.expires_at)
    };


  private async updateCartTotals(cart: ShoppingCart): Promise<ShoppingCart> {

    const subtotal = cart.items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity), 0);
    cart.total_cents = subtotal + cart.tax_cents + cart.shipping_cents;
    cart.updated_at = new Date();

    await this.db.query(
      'UPDATE shopping_carts SET items = ?, total_cents = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(cart.items), cart.total_cents, cart.updated_at, cart.id]
    );

    return cart;


  private calculateLicensePrice(basePrice: number, licenseType: LicenseType): number {
    const multipliers = {
      [LicenseType.PERSONAL]: 1.0,
      [LicenseType.COMMERCIAL]: 2.0,
      [LicenseType.ENTERPRISE]: 5.0,
      [LicenseType.EDUCATIONAL]: 0.5,
      [LicenseType.UNLIMITED]: 10.0
    };
    return Math.round(basePrice * (multipliers[licenseType] || 1.0));


  private async calculateTax(cart: ShoppingCart, billingAddress: BillingAddress): Promise<void> {

    // Simple tax calculation - in production, use a tax service like TaxJar
    const taxRate = billingAddress.country === 'US' ? 0.08 : 0.0;
    const subtotal = cart.items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity), 0);
    cart.tax_cents = Math.round(subtotal * taxRate);


  private async assessRisk(userId: string, cart: ShoppingCart, billingAddress: BillingAddress): Promise<RiskAssessment> {

    // Simplified risk assessment - in production, use more sophisticated analysis
    let riskScore = 0;
    const riskFactors: string[] = [];

    // High value transaction
    if (cart.total_cents > 10000) { // $100+
      riskScore += 30;
      riskFactors.push('high_value_transaction');


    // New user
    const userAge = await this.getUserAge(userId);
    if (userAge < 7) { // Less than a week
      riskScore += 20;
      riskFactors.push('new_user');


    // Velocity check
    const recentTransactions = await this.getRecentTransactionCount(userId);
    if (recentTransactions > 5) {
      riskScore += 25;
      riskFactors.push('high_velocity');


    const recommendation = riskScore > 70 ? 'decline' : riskScore > 40 ? 'review' : 'approve';

    const assessment: RiskAssessment = {
      id: crypto.randomUUID(),
      payment_intent_id: '', // Will be set later
      user_id: userId,
      ip_address: '',
      user_agent: '',
      risk_score: riskScore,
      risk_factors: riskFactors,
      geo_location: { country: billingAddress.country },
      velocity_checks: { recent_transactions: recentTransactions },
      recommendation: recommendation as any,
      automated_decision: true,
      created_at: new Date(};

    return assessment;


  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();


  private generateLicenseKey(): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(Math.random().toString(36).substring(2, 8).toUpperCase());

    return segments.join('-');


  private getLicenseUsageLimit(licenseType: LicenseType): number | undefined {
    const limits = {
      [LicenseType.PERSONAL]: 100,
      [LicenseType.COMMERCIAL]: 1000,
      [LicenseType.ENTERPRISE]: 10000,
      [LicenseType.EDUCATIONAL]: 50,
      [LicenseType.UNLIMITED]: undefined
    };
    return limits[licenseType];


  private getLicenseExpiration(licenseType: LicenseType): Date | undefined {
    if (licenseType === LicenseType.UNLIMITED) return undefined;
    
    const now = new Date();
    const expiration = new Date(now);
    expiration.setFullYear(now.getFullYear() + 1); // 1 year
    return expiration;


  private getMaxTransfers(licenseType: LicenseType): number {
    const transfers = {
      [LicenseType.PERSONAL]: 1,
      [LicenseType.COMMERCIAL]: 3,
      [LicenseType.ENTERPRISE]: 10,
      [LicenseType.EDUCATIONAL]: 1,
      [LicenseType.UNLIMITED]: 5
    };
    return transfers[licenseType] || 1;


  private getLicenseRestrictions(licenseType: LicenseType): Record<string, any> {
    const restrictions = {
      [LicenseType.PERSONAL]: {
        commercial_use: false,
        redistribution: false,
        modification: true

      [LicenseType.COMMERCIAL]: {
        commercial_use: true,
        redistribution: false,
        modification: true

      [LicenseType.ENTERPRISE]: {
        commercial_use: true,
        redistribution: true,
        modification: true,
        white_label: true

      [LicenseType.EDUCATIONAL]: {
        commercial_use: false,
        redistribution: false,
        modification: true,
        educational_only: true

      [LicenseType.UNLIMITED]: {
        commercial_use: true,
        redistribution: true,
        modification: true,
        white_label: true

    };
    return restrictions[licenseType] || {};


  // Placeholder methods for database operations
  private async getTemplate(templateId: string): Promise<MarketplaceTemplate | null> {

    const result = await this.db.query('SELECT * FROM marketplace_templates WHERE id = ?', [templateId]);
    return result[0] || null;


  private async getTemplateVersion(templateId: string, versionId?: string): Promise<TemplateVersion | null> {

    if (versionId) {
      const result = await this.db.query('SELECT * FROM template_versions WHERE id = ? AND template_id = ?', [versionId, templateId]);
      return result[0] || null;

    
    const result = await this.db.query(
      'SELECT * FROM template_versions WHERE template_id = ? ORDER BY version_number DESC LIMIT 1',
      [templateId]
    );
    return result[0] || null;


  private async checkExistingPurchase(userId: string, templateId: string): Promise<boolean> {

    const result = await this.db.query(
      'SELECT 1 FROM marketplace_purchases WHERE buyer_id = ? AND template_id = ? AND status = ?',
      [userId, templateId, 'succeeded']
    );
    return result.length > 0;


  private async getPaymentIntent(intentId: string, userId: string): Promise<PaymentIntent | null> {

    const result = await this.db.query(
      'SELECT * FROM payment_intents WHERE id = ? AND user_id = ?',
      [intentId, userId]
    );
    
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      id: row.id,
      cart_id: row.cart_id,
      user_id: row.user_id,
      amount_cents: row.amount_cents,
      currency: row.currency,
      provider: row.provider,
      provider_intent_id: row.provider_intent_id,
      payment_method_id: row.payment_method_id,
      status: row.status,
      client_secret: row.client_secret,
      last_payment_error: row.last_payment_error,
      metadata: JSON.parse(row.metadata || '{}'),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };


  private async updatePaymentIntentStatus(intentId: string, status: string): Promise<void> {

    await this.db.query(
      'UPDATE payment_intents SET status = ?, updated_at = datetime("now") WHERE id = ?',
      [status, intentId]
    );


  private async createTransaction(paymentIntent: PaymentIntent, type: TransactionType): Promise<Transaction> {

    const transactionId = crypto.randomUUID();
    const fee = Math.round(paymentIntent.amount_cents * 0.029 + 30); // Stripe fee
    
    const transaction: Transaction = {
      id: transactionId,
      payment_intent_id: paymentIntent.id,
      cart_id: paymentIntent.cart_id,
      user_id: paymentIntent.user_id,
      transaction_type: type,
      amount_cents: paymentIntent.amount_cents,
      fee_cents: fee,
      net_amount_cents: paymentIntent.amount_cents - fee,
      currency: paymentIntent.currency,
      provider: paymentIntent.provider,
      provider_transaction_id: paymentIntent.provider_intent_id,
      status: 'succeeded',
      escrow_status: EscrowStatus.HELD,
      risk_score: 25, // From risk assessment
      fraud_flags: [],
      metadata: {},
      created_at: new Date(),
      updated_at: new Date()
    };

    await this.db.query(
      `INSERT INTO transactions (id, payment_intent_id, cart_id, user_id, transaction_type, amount_cents, 
       fee_cents, net_amount_cents, currency, provider, provider_transaction_id, status, escrow_status, 
       risk_score, fraud_flags, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId, transaction.payment_intent_id, transaction.cart_id, transaction.user_id,
        transaction.transaction_type, transaction.amount_cents, transaction.fee_cents, transaction.net_amount_cents,
        transaction.currency, transaction.provider, transaction.provider_transaction_id, transaction.status,
        transaction.escrow_status, transaction.risk_score, JSON.stringify(transaction.fraud_flags),
        JSON.stringify(transaction.metadata), transaction.created_at, transaction.updated_at
      ]
    );

    return transaction;


  private async generateInvoice(order: Order): Promise<void> {

    // Placeholder for invoice generation
    this.fastify.log.info(`Generating invoice for order ${order.order_number}`);


  private async getUserAge(userId: string): Promise<number> {

    // Return user age in days
    const result = await this.db.query('SELECT created_at FROM users WHERE id = ?', [userId]);
    if (result.length === 0) return 0;
    
    const createdAt = new Date(result[0].created_at);
    const now = new Date();
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));


  private async getRecentTransactionCount(userId: string): Promise<number> {

    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND created_at > datetime(\'now\', \'-24 hours\')',
      [userId]
    );
    return result[0]?.count || 0;


  private async getUserPurchase(userId: string, purchaseId: string): Promise<any> {

    const result = await this.db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [purchaseId, userId]
    );
    return result[0] || null;


  private isRefundEligible(purchase: any): boolean {
    // Check if purchase is within refund window (e.g., 30 days)
    const purchaseDate = new Date(purchase.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff <= 30 && purchase.status === 'completed';

