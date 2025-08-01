// Epic 16.1.5 - Transaction System Integration Tests
import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { TransactionService } from '../transaction.service.js';
import { LicenseService } from '../license.service.js';
import { 
  LicenseType, 
  PaymentProvider, 
  TransactionType,
  LicenseStatus 
 from '../transaction.types.js';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_confirmation',
        client_secret: 'pi_test_123_secret'
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded'


  }));
});

describe('Transaction System Integration Tests', () => {
  let fastify: FastifyInstance;
  let transactionService: TransactionService;
  let licenseService: LicenseService;
  
  const testUser = {
    id: 'user-test-123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const testTemplate = {
    id: 'template-test-123',
    title: 'Test Template',
    price_cents: 1999, // $19.99
    status: 'listed',
    owner_id: 'creator-123',
    current_version_id: 'version-123'
  };

  beforeAll(async () => {
    // Set up test environment
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    
    // Mock fastify instance
    fastify = {
      db: {
        query: jest.fn()

      log: {
        info: jest.fn(),
        error: jest.fn()

      authenticate: jest.fn()
 as any;

    transactionService = new TransactionService(fastify);
    licenseService = new LicenseService(fastify);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default database mock responses
    (fastify.db.query as jest.Mock).mockImplementation((query: string, params: any[]) => {
      // Mock user queries
      if (query.includes('SELECT * FROM users')) {
        return Promise.resolve([testUser]);

      
      // Mock template queries
      if (query.includes('SELECT * FROM marketplace_templates')) {
        return Promise.resolve([testTemplate]);

      
      // Mock version queries
      if (query.includes('SELECT * FROM template_versions')) {
        return Promise.resolve([{
          id: 'version-123',
          template_id: testTemplate.id,
          version_number: 1
]);

      
      // Mock existing purchase check
      if (query.includes('SELECT 1 FROM marketplace_purchases')) {
        return Promise.resolve([]); // No existing purchases

      
      // Mock user age
      if (query.includes('SELECT created_at FROM users')) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return Promise.resolve([{ created_at: weekAgo.toISOString() }]);

      
      // Mock recent transactions
      if (query.includes('SELECT COUNT(*) as count FROM transactions')) {
        return Promise.resolve([{ count: 0 }]);

      
      // Mock cart operations
      if (query.includes('INSERT INTO shopping_carts')) {
        return Promise.resolve({ changes: 1 });

      
      if (query.includes('SELECT * FROM shopping_carts')) {
        return Promise.resolve([{
          id: 'cart-123',
          user_id: testUser.id,
          items: JSON.stringify([]),
          discount_codes: JSON.stringify([]),
          total_cents: 0,
          tax_cents: 0,
          shipping_cents: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
]);

      
      // Default success response for other queries
      return Promise.resolve([]);
    });
  });

  describe('Shopping Cart Workflow', () => {
    it('should create a new cart for user', async () => {
      const cart = await transactionService.createCart(testUser.id);
      
      expect(cart).toMatchObject({
        user_id: testUser.id,
        items: [],
        discount_codes: [],
        total_cents: 0,
        tax_cents: 0,
        shipping_cents: 0
      });
      
      expect(fastify.db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO shopping_carts'),
        expect.arrayContaining([expect.any(String), testUser.id])
      );
    });

    it('should add items to cart with license calculation', async () => {
      // Mock existing cart
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([{
          id: 'cart-123',
          user_id: testUser.id,
          items: JSON.stringify([]),
          total_cents: 0,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
])
      );

      const cartData = {
        items: [{
          template_id: testTemplate.id,
          license_type: LicenseType.COMMERCIAL,
          quantity: 1
]
      };

      const cart = await transactionService.addToCart(testUser.id, cartData);
      
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]).toMatchObject({
        template_id: testTemplate.id,
        license_type: LicenseType.COMMERCIAL,
        quantity: 1,
        unit_price_cents: 3998 // Commercial license = 2x base price
      });
    });

    it('should prevent adding already owned templates', async () => {
      // Mock existing purchase
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([{ id: 'existing-purchase' }])
      );

      const cartData = {
        items: [{
          template_id: testTemplate.id,
          license_type: LicenseType.PERSONAL,
          quantity: 1
]
      };

      await expect(transactionService.addToCart(testUser.id, cartData))
        .rejects.toThrow('You already own template');
    });
  });

  describe('Payment Processing Workflow', () => {
    it('should create payment intent with risk assessment', async () => {
      const mockCart = {
        id: 'cart-123',
        user_id: testUser.id,
        items: [{
          id: 'item-123',
          template_id: testTemplate.id,
          license_type: LicenseType.PERSONAL,
          quantity: 1,
          unit_price_cents: 1999
],
        total_cents: 2159, // Including tax
        tax_cents: 160
      };

      // Mock cart retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([{
          ...mockCart,
          items: JSON.stringify(mockCart.items)
])
      );

      const paymentData = {
        cart_id: mockCart.id,
        payment_method_id: 'pm_test_123',
        billing_address: {
          name: testUser.name,
          email: testUser.email,
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US'

      };

      const paymentIntent = await transactionService.createPaymentIntent(
        testUser.id, 
        paymentData
      );

      expect(paymentIntent).toMatchObject({
        cart_id: mockCart.id,
        user_id: testUser.id,
        amount_cents: mockCart.total_cents,
        currency: 'usd',
        provider: PaymentProvider.STRIPE,
        status: 'requires_confirmation'
      });
    });

    it('should process successful payment and create order', async () => {
      const mockPaymentIntent = {
        id: 'intent-123',
        cart_id: 'cart-123',
        user_id: testUser.id,
        amount_cents: 2159,
        currency: 'usd',
        provider: PaymentProvider.STRIPE,
        provider_intent_id: 'pi_test_123',
        payment_method_id: 'pm_test_123',
        status: 'requires_confirmation',
        client_secret: 'pi_test_123_secret',
        metadata: {
          billing_address: {
            name: testUser.name,
            email: testUser.email,
            line1: '123 Test St',
            city: 'Test City',
            postal_code: '12345',
            country: 'US'


      };

      const mockCart = {
        id: 'cart-123',
        user_id: testUser.id,
        items: [{
          id: 'item-123',
          template_id: testTemplate.id,
          version_id: 'version-123',
          license_type: LicenseType.PERSONAL,
          quantity: 1,
          unit_price_cents: 1999
],
        total_cents: 2159,
        tax_cents: 160
      };

      // Mock payment intent retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([{
          ...mockPaymentIntent,
          metadata: JSON.stringify(mockPaymentIntent.metadata)
])
      );

      // Mock cart retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([{
          ...mockCart,
          items: JSON.stringify(mockCart.items)
])
      );

      const paymentData = {
        payment_intent_id: mockPaymentIntent.id
      };

      const order = await transactionService.processPayment(testUser.id, paymentData);

      expect(order).toMatchObject({
        user_id: testUser.id,
        cart_id: mockCart.id,
        payment_intent_id: mockPaymentIntent.id,
        status: 'processing',
        total_cents: mockCart.total_cents
      });

      // Verify order creation queries
      expect(fastify.db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO orders'),
        expect.any(Array)
      );
    });
  });

  describe('License Management Workflow', () => {
    it('should generate license after successful order', async () => {
      const mockOrder = {
        id: 'order-123',
        user_id: testUser.id,
        total_cents: 1999
      };

      const mockOrderItem = {
        id: 'item-123',
        order_id: mockOrder.id,
        template_id: testTemplate.id,
        version_id: 'version-123',
        license_type: LicenseType.PERSONAL,
        quantity: 1
      };

      const license = await transactionService.generateLicense(mockOrder, mockOrderItem);

      expect(license).toMatchObject({
        purchase_id: mockOrder.id,
        template_id: mockOrderItem.template_id,
        version_id: mockOrderItem.version_id,
        buyer_id: testUser.id,
        license_type: LicenseType.PERSONAL,
        status: LicenseStatus.ACTIVE,
        usage_limit: 100, // Personal license limit
        usage_count: 0,
        transfer_count: 0,
        max_transfers: 1
      });

      expect(license.license_key).toMatch(/^[A-Z0-9-]+$/);
    });

    it('should validate license usage and increment count', async () => {
      const mockLicense = {
        id: 'license-123',
        license_key: 'TEST-KEY-123',
        template_id: testTemplate.id,
        buyer_id: testUser.id,
        status: 'active',
        usage_limit: 100,
        usage_count: 5,
        valid_until: null
      };

      // Mock license retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([mockLicense])
      );

      const isValid = await transactionService.validateLicense(
        mockLicense.license_key,
        testTemplate.id,
        testUser.id
      );

      expect(isValid).toBe(true);

      // Verify usage increment
      expect(fastify.db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE template_licenses SET usage_count = usage_count + 1'),
        [mockLicense.id]
      );
    });

    it('should reject expired license', async () => {
      const mockLicense = {
        id: 'license-123',
        license_key: 'TEST-KEY-123',
        template_id: testTemplate.id,
        buyer_id: testUser.id,
        status: 'active',
        usage_limit: 100,
        usage_count: 5,
        valid_until: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Expired yesterday
      };

      // Mock license retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([mockLicense])
      );

      const isValid = await transactionService.validateLicense(
        mockLicense.license_key,
        testTemplate.id,
        testUser.id
      );

      expect(isValid).toBe(false);
    });

    it('should handle license transfer request', async () => {
      const mockLicense = {
        id: 'license-123',
        buyer_id: testUser.id,
        transfer_count: 0,
        max_transfers: 1,
        status: 'active'
      };

      const targetUser = {
        id: 'user-456',
        email: 'target@example.com',
        name: 'Target User'
      };

      // Mock license retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([mockLicense])
      );

      // Mock target user retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([targetUser])
      );

      const transferRequest = await licenseService.createTransferRequest(
        mockLicense.id,
        testUser.id,
        targetUser.email,
        'Transferring to team member'
      );

      expect(transferRequest).toMatchObject({
        license_id: mockLicense.id,
        from_user_id: testUser.id,
        to_user_id: targetUser.id,
        reason: 'Transferring to team member'
      });

      expect(fastify.db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO license_transfers'),
        expect.any(Array)
      );
    });
  });

  describe('Refund Processing Workflow', () => {
    it('should create refund request for eligible purchase', async () => {
      const mockPurchase = {
        id: 'order-123',
        total_cents: 1999,
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      };

      // Mock purchase retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([mockPurchase])
      );

      const refundData = {
        purchase_id: mockPurchase.id,
        reason: 'Template not as described'
      };

      const refundRequest = await transactionService.createRefundRequest(
        testUser.id,
        refundData
      );

      expect(refundRequest).toMatchObject({
        purchase_id: mockPurchase.id,
        order_id: mockPurchase.id,
        user_id: testUser.id,
        reason: refundData.reason,
        amount_cents: mockPurchase.total_cents,
        status: 'pending'
      });
    });

    it('should reject refund for ineligible purchase', async () => {
      const mockPurchase = {
        id: 'order-123',
        total_cents: 1999,
        status: 'completed',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
      };

      // Mock purchase retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([mockPurchase])
      );

      const refundData = {
        purchase_id: mockPurchase.id,
        reason: 'Changed my mind'
      };

      await expect(transactionService.createRefundRequest(testUser.id, refundData))
        .rejects.toThrow('not eligible for refund');
    });
  });

  describe('Integration Error Handling', () => {
    it('should handle Stripe payment failures gracefully', async () => {
      // Mock Stripe failure
      const mockStripe = require('stripe');
      mockStripe().paymentIntents.confirm.mockRejectedValueOnce(
        new Error('Your card was declined.')
      );

      const paymentData = {
        payment_intent_id: 'intent-123'
      };

      // Mock payment intent retrieval
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([{
          id: 'intent-123',
          provider_intent_id: 'pi_test_123',
          client_secret: 'pi_test_123_secret',
          user_id: testUser.id
])
      );

      await expect(transactionService.processPayment(testUser.id, paymentData))
        .rejects.toThrow('Your card was declined.');
    });

    it('should handle database transaction failures', async () => {
      // Mock database failure
      (fastify.db.query as jest.Mock).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      await expect(transactionService.createCart(testUser.id))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('Security and Compliance', () => {
    it('should assess risk for high-value transactions', async () => {
      const mockCart = {
        id: 'cart-123',
        user_id: testUser.id,
        items: [{
          template_id: testTemplate.id,
          license_type: LicenseType.ENTERPRISE,
          quantity: 10,
          unit_price_cents: 9995 // $99.95 each
],
        total_cents: 99950 // $999.50 - High value
      };

      // Mock recent transactions for velocity check
      (fastify.db.query as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve([{ count: 3 }]) // 3 recent transactions
      );

      const billingAddress = {
        name: testUser.name,
        email: testUser.email,
        line1: '123 Test St',
        city: 'Test City',
        postal_code: '12345',
        country: 'US'
      };

      // This would normally be called internally during payment intent creation
      const riskAssessment = await (transactionService as any).assessRisk(
        testUser.id,
        mockCart,
        billingAddress
      );

      expect(riskAssessment.risk_score).toBeGreaterThan(30); // High value flag
      expect(riskAssessment.risk_factors).toContain('high_value_transaction');
      expect(riskAssessment.recommendation).toBe('review'); // Should require review
    });

    it('should sanitize sensitive data in logs', async () => {
      const paymentData = {
        cart_id: 'cart-123',
        payment_method_id: 'pm_test_123',
        billing_address: {
          name: testUser.name,
          email: testUser.email,
          line1: '123 Test St',
          city: 'Test City',
          postal_code: '12345',
          country: 'US'

      };

      try {
        await transactionService.createPaymentIntent(testUser.id, paymentData);
 catch (error) {
        // Error expected due to mocks


      // Verify no sensitive data in logs
      const logCalls = (fastify.log.error as jest.Mock).mock.calls;
      logCalls.forEach(call => {
        const logMessage = JSON.stringify(call);
        expect(logMessage).not.toContain(paymentData.payment_method_id);
        expect(logMessage).not.toContain('pm_test_123');
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});