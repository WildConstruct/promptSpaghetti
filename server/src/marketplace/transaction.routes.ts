// Epic 16.1.5 - Transaction Routes
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { TransactionService } from './transaction.service.js';
import {
  AddToCartSchema,
  UpdateCartSchema,
  CreatePaymentIntentSchema,
  ProcessPaymentSchema,
  CreateRefundRequestSchema,
  LicenseTransferSchema
} from './transaction.types.js';

export async function transactionRoutes(fastify: FastifyInstance) {
  const transactionService = new TransactionService(fastify);

  // =============================================
  // Shopping Cart Routes
  // =============================================

  // Get current cart
  fastify.get('/cart', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: z.object({
          cart: z.any().optional() // ShoppingCart type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const cart = await transactionService.getActiveCart(request.user.id);
      reply.send({ cart });
    } catch (error) {
      fastify.log.error('Get cart error:', error);
      reply.code(500).send({ error: 'Failed to get cart' });
    }
  });

  // Add items to cart
  fastify.post('/cart/add', {
    preHandler: [fastify.authenticate],
    schema: {
      body: AddToCartSchema,
      response: {
        200: z.object({
          cart: z.any() // ShoppingCart type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const cart = await transactionService.addToCart(request.user.id, request.body);
      reply.send({ cart });
    } catch (error) {
      fastify.log.error('Add to cart error:', error);
      
      if (error.message.includes('already own') || error.message.includes('not available')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to add to cart' });
      }
    }
  });

  // Update cart item
  fastify.put('/cart/:cartId/items', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        cartId: z.string().uuid()
      }),
      body: UpdateCartSchema,
      response: {
        200: z.object({
          cart: z.any() // ShoppingCart type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { cartId } = request.params;
      const cart = await transactionService.updateCartItem(request.user.id, cartId, request.body);
      reply.send({ cart });
    } catch (error) {
      fastify.log.error('Update cart item error:', error);
      
      if (error.message.includes('not found') || error.message.includes('expired')) {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update cart item' });
      }
    }
  });

  // Clear cart
  fastify.delete('/cart/:cartId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        cartId: z.string().uuid()
      }),
      response: {
        200: z.object({
          success: z.boolean()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { cartId } = request.params;
      await transactionService.clearCart(request.user.id, cartId);
      reply.send({ success: true });
    } catch (error) {
      fastify.log.error('Clear cart error:', error);
      reply.code(500).send({ error: 'Failed to clear cart' });
    }
  });

  // =============================================
  // Payment Processing Routes
  // =============================================

  // Create payment intent
  fastify.post('/payment/intent', {
    preHandler: [fastify.authenticate],
    schema: {
      body: CreatePaymentIntentSchema,
      response: {
        200: z.object({
          payment_intent: z.any() // PaymentIntent type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const paymentIntent = await transactionService.createPaymentIntent(
        request.user.id, 
        request.body
      );
      reply.send({ payment_intent: paymentIntent });
    } catch (error) {
      fastify.log.error('Create payment intent error:', error);
      
      if (error.message.includes('Cart is empty') || error.message.includes('risk factors')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to create payment intent' });
      }
    }
  });

  // Process payment
  fastify.post('/payment/process', {
    preHandler: [fastify.authenticate],
    schema: {
      body: ProcessPaymentSchema,
      response: {
        200: z.object({
          order: z.any() // Order type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const order = await transactionService.processPayment(request.user.id, request.body);
      reply.send({ order });
    } catch (error) {
      fastify.log.error('Process payment error:', error);
      
      if (error.message.includes('not found') || 
          error.message.includes('requires authentication') ||
          error.message.includes('failed')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Payment processing failed' });
      }
    }
  });

  // Get payment intent status
  fastify.get('/payment/intent/:intentId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        intentId: z.string().uuid()
      }),
      response: {
        200: z.object({
          payment_intent: z.any() // PaymentIntent type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { intentId } = request.params;
      const paymentIntent = await transactionService.getPaymentIntent(intentId, request.user.id);
      
      if (!paymentIntent) {
        reply.code(404).send({ error: 'Payment intent not found' });
        return;
      }
      
      reply.send({ payment_intent: paymentIntent });
    } catch (error) {
      fastify.log.error('Get payment intent error:', error);
      reply.code(500).send({ error: 'Failed to get payment intent' });
    }
  });

  // =============================================
  // Order Management Routes
  // =============================================

  // Get user orders
  fastify.get('/orders', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        status: z.string().optional()
      }),
      response: {
        200: z.object({
          orders: z.array(z.any()), // Order[] type
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          has_more: z.boolean()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { page, limit, status } = request.query;
      const offset = (page - 1) * limit;
      
      let whereClause = 'user_id = ?';
      const params = [request.user.id];
      
      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      
      const orders = await fastify.db.query(
        `SELECT * FROM orders WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      const totalResult = await fastify.db.query(
        `SELECT COUNT(*) as count FROM orders WHERE ${whereClause}`,
        params
      );
      
      const total = totalResult[0].count;
      const hasMore = offset + limit < total;
      
      reply.send({
        orders,
        total,
        page,
        limit,
        has_more: hasMore
      });
    } catch (error) {
      fastify.log.error('Get orders error:', error);
      reply.code(500).send({ error: 'Failed to get orders' });
    }
  });

  // Get specific order
  fastify.get('/orders/:orderId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        orderId: z.string().uuid()
      }),
      response: {
        200: z.object({
          order: z.any() // Order type with items
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { orderId } = request.params;
      
      const orderResult = await fastify.db.query(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [orderId, request.user.id]
      );
      
      if (orderResult.length === 0) {
        reply.code(404).send({ error: 'Order not found' });
        return;
      }
      
      const order = orderResult[0];
      
      // Get order items
      const items = await fastify.db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
      
      order.items = items;
      order.billing_address = JSON.parse(order.billing_address);
      order.metadata = JSON.parse(order.metadata || '{}');
      
      reply.send({ order });
    } catch (error) {
      fastify.log.error('Get order error:', error);
      reply.code(500).send({ error: 'Failed to get order' });
    }
  });

  // =============================================
  // License Management Routes
  // =============================================

  // Get user licenses
  fastify.get('/licenses', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: z.object({
        template_id: z.string().uuid().optional(),
        status: z.string().optional(),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20)
      }),
      response: {
        200: z.object({
          licenses: z.array(z.any()), // TemplateLicense[] type
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          has_more: z.boolean()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { template_id, status, page, limit } = request.query;
      const offset = (page - 1) * limit;
      
      let whereClause = 'buyer_id = ?';
      const params = [request.user.id];
      
      if (template_id) {
        whereClause += ' AND template_id = ?';
        params.push(template_id);
      }
      
      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      
      const licenses = await fastify.db.query(
        `SELECT * FROM template_licenses WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      const totalResult = await fastify.db.query(
        `SELECT COUNT(*) as count FROM template_licenses WHERE ${whereClause}`,
        params
      );
      
      const total = totalResult[0].count;
      const hasMore = offset + limit < total;
      
      // Parse JSON fields
      licenses.forEach(license => {
        license.restrictions = JSON.parse(license.restrictions || '{}');
        license.metadata = JSON.parse(license.metadata || '{}');
      });
      
      reply.send({
        licenses,
        total,
        page,
        limit,
        has_more: hasMore
      });
    } catch (error) {
      fastify.log.error('Get licenses error:', error);
      reply.code(500).send({ error: 'Failed to get licenses' });
    }
  });

  // Validate license
  fastify.post('/licenses/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: z.object({
        license_key: z.string(),
        template_id: z.string().uuid()
      }),
      response: {
        200: z.object({
          valid: z.boolean(),
          license: z.any().optional() // TemplateLicense type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { license_key, template_id } = request.body;
      const valid = await transactionService.validateLicense(license_key, template_id, request.user.id);
      
      let license = null;
      if (valid) {
        const result = await fastify.db.query(
          'SELECT * FROM template_licenses WHERE license_key = ? AND template_id = ? AND buyer_id = ?',
          [license_key, template_id, request.user.id]
        );
        
        if (result.length > 0) {
          license = result[0];
          license.restrictions = JSON.parse(license.restrictions || '{}');
          license.metadata = JSON.parse(license.metadata || '{}');
        }
      }
      
      reply.send({ valid, license });
    } catch (error) {
      fastify.log.error('Validate license error:', error);
      reply.code(500).send({ error: 'Failed to validate license' });
    }
  });

  // Transfer license
  fastify.post('/licenses/transfer', {
    preHandler: [fastify.authenticate],
    schema: {
      body: LicenseTransferSchema,
      response: {
        200: z.object({
          transfer_request: z.any() // LicenseTransfer type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { license_id, to_user_email, reason } = request.body;
      
      // Verify license ownership
      const licenseResult = await fastify.db.query(
        'SELECT * FROM template_licenses WHERE id = ? AND buyer_id = ?',
        [license_id, request.user.id]
      );
      
      if (licenseResult.length === 0) {
        reply.code(404).send({ error: 'License not found or not owned by user' });
        return;
      }
      
      const license = licenseResult[0];
      
      // Check transfer eligibility
      if (license.transfer_count >= license.max_transfers) {
        reply.code(400).send({ error: 'Maximum transfers exceeded for this license' });
        return;
      }
      
      // Find target user
      const userResult = await fastify.db.query(
        'SELECT id FROM users WHERE email = ?',
        [to_user_email]
      );
      
      if (userResult.length === 0) {
        reply.code(400).send({ error: 'Target user not found' });
        return;
      }
      
      const toUserId = userResult[0].id;
      
      // Create transfer request
      const transferId = crypto.randomUUID();
      const transferRequest = {
        id: transferId,
        license_id,
        from_user_id: request.user.id,
        to_user_id: toUserId,
        reason,
        created_at: new Date()
      };
      
      await fastify.db.query(
        'INSERT INTO license_transfers (id, license_id, from_user_id, to_user_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [transferId, license_id, request.user.id, toUserId, reason, transferRequest.created_at]
      );
      
      reply.send({ transfer_request: transferRequest });
    } catch (error) {
      fastify.log.error('Transfer license error:', error);
      reply.code(500).send({ error: 'Failed to create license transfer request' });
    }
  });

  // =============================================
  // Refund Routes
  // =============================================

  // Create refund request
  fastify.post('/refunds/request', {
    preHandler: [fastify.authenticate],
    schema: {
      body: CreateRefundRequestSchema,
      response: {
        200: z.object({
          refund_request: z.any() // RefundRequest type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const refundRequest = await transactionService.createRefundRequest(request.user.id, request.body);
      reply.send({ refund_request: refundRequest });
    } catch (error) {
      fastify.log.error('Create refund request error:', error);
      
      if (error.message.includes('not found') || 
          error.message.includes('not eligible') ||
          error.message.includes('not owned')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to create refund request' });
      }
    }
  });

  // Get refund requests
  fastify.get('/refunds', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: z.object({
        status: z.string().optional(),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20)
      }),
      response: {
        200: z.object({
          refund_requests: z.array(z.any()), // RefundRequest[] type
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          has_more: z.boolean()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { status, page, limit } = request.query;
      const offset = (page - 1) * limit;
      
      let whereClause = 'user_id = ?';
      const params = [request.user.id];
      
      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }
      
      const refundRequests = await fastify.db.query(
        `SELECT * FROM refund_requests WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      const totalResult = await fastify.db.query(
        `SELECT COUNT(*) as count FROM refund_requests WHERE ${whereClause}`,
        params
      );
      
      const total = totalResult[0].count;
      const hasMore = offset + limit < total;
      
      reply.send({
        refund_requests: refundRequests,
        total,
        page,
        limit,
        has_more: hasMore
      });
    } catch (error) {
      fastify.log.error('Get refund requests error:', error);
      reply.code(500).send({ error: 'Failed to get refund requests' });
    }
  });

  // =============================================
  // Analytics Routes
  // =============================================

  // Get transaction analytics for user
  fastify.get('/analytics/transactions', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: z.object({
        period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
        template_id: z.string().uuid().optional()
      }),
      response: {
        200: z.object({
          analytics: z.any() // TransactionAnalytics type
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { period, template_id } = request.query;
      
      // Calculate date range
      const periodDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const daysBack = periodDays[period];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      let whereClause = 'user_id = ? AND created_at >= ?';
      const params = [request.user.id, startDate.toISOString()];
      
      if (template_id) {
        whereClause += ' AND EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = orders.id AND oi.template_id = ?)';
        params.push(template_id);
      }
      
      // Get transaction metrics
      const metricsResult = await fastify.db.query(
        `SELECT 
           COUNT(*) as total_transactions,
           SUM(total_cents) as total_revenue_cents,
           AVG(total_cents) as avg_order_value_cents
         FROM orders 
         WHERE ${whereClause} AND status = 'completed'`,
        params
      );
      
      const metrics = metricsResult[0] || {
        total_transactions: 0,
        total_revenue_cents: 0,
        avg_order_value_cents: 0
      };
      
      const analytics = {
        period_start: startDate,
        period_end: new Date(),
        metrics: {
          total_revenue_cents: metrics.total_revenue_cents || 0,
          total_transactions: metrics.total_transactions || 0,
          average_order_value_cents: Math.round(metrics.avg_order_value_cents || 0),
          conversion_rate: 0, // Would need view tracking
          refund_rate: 0, // Would calculate from refunds
          dispute_rate: 0, // Would calculate from disputes
          fraud_rate: 0 // Would calculate from fraud flags
        },
        payment_methods: [], // Would aggregate by payment method
        geography: [], // Would aggregate by country
        trends: {
          daily_revenue: [], // Would calculate daily totals
          daily_transactions: [] // Would calculate daily counts
        }
      };
      
      reply.send({ analytics });
    } catch (error) {
      fastify.log.error('Get transaction analytics error:', error);
      reply.code(500).send({ error: 'Failed to get transaction analytics' });
    }
  });
}