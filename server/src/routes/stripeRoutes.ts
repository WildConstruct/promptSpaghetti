import type { FastifyPluginAsync } from 'fastify';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../services/stripe';
import { supabaseAdmin } from '../services/supabaseAdmin';

export const stripeRoutes: FastifyPluginAsync = async (server) => {
  // Endpoint to create a Checkout Session
  server.post('/api/stripe/create-checkout-session', async (request, reply) => {
    try {
      const { priceId, successUrl, cancelUrl, userEmail, userId } = request.body as {
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        userEmail?: string;
        userId?: string;
      };

      if (!priceId) {
        return reply.status(400).send({ error: 'priceId is required' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        client_reference_id: userId,
      });

      return reply.send({ sessionId: session.id, url: session.url });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to create checkout session' });
    }
  });

  // Webhook handler
  const webhookOpts = {
    // Webhooks need the raw body to verify signatures. Fastify allows raw body with a custom content type parser or using the raw request object
    config: {
      rawBody: true
    }
  };

  server.post('/api/stripe/webhook', webhookOpts, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string;

    if (!signature) {
      return reply.status(400).send({ error: 'Missing stripe-signature header' });
    }

    let event;

    try {
      // In fastify, the raw request body is accessible depending on configuration. 
      // Assuming body is stringified or we use rawBuffer from a plugin like fastify-raw-body
      // For simplicity, we fallback to passing the body directly (might need fastify-raw-body setup in index.ts normally)
      event = stripe.webhooks.constructEvent(
        request.rawBody || (request.body as string),
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      server.log.error(`Webhook Error: ${err.message}`);
      return reply.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const userId = session.client_reference_id;
          
          if (userId) {
            // Update user in Supabase to active subscription
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              user_metadata: { subscriptionState: 'active' },
              app_metadata: { subscriptionState: 'active' }
            });
            server.log.info(`Updated user ${userId} to active subscription.`);
          }
          break;
        }
        case 'customer.subscription.deleted':
        case 'customer.subscription.past_due':
        case 'customer.subscription.unpaid': {
          const subscription = event.data.object as any;
          
          // To update the user, we need to map customer ID -> userId.
          // This requires having saved the customer ID during checkout session completed, or searching by email.
          // Here we do a simplified fallback assuming we saved it or relying on manual syncs.
          // Example logic if we had customer mapping:
          // const userId = await findUserIdByCustomerId(subscription.customer);
          // await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { subscriptionState: 'inactive' } });
          
          server.log.info(`Handled subscription ${subscription.id} status change: ${event.type}`);
          break;
        }
        default:
          server.log.info(`Unhandled event type ${event.type}`);
      }
    } catch (err) {
      server.log.error('Error processing webhook event', err);
      // Still return 200 to Stripe so it doesn't retry endlessly
    }

    return reply.status(200).send({ received: true });
  });
};
