import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { users, subscriptions as subscriptionsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const PLANS = {
  starter: {
    name: 'Starter Plan',
    credits: 500,
    price: 900, // $9.00 in cents
  },
  pro: {
    name: 'Pro Plan',
    credits: 2000,
    price: 2900, // $29.00 in cents
  },
  enterprise: {
    name: 'Enterprise Plan',
    credits: 10000,
    price: 9900, // $99.00 in cents
  },
};

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe Checkout session
 */
router.post('/create-checkout-session', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { planType } = req.body;
    const userId = req.user!.id;

    if (!planType || !PLANS[planType as keyof typeof PLANS]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `${plan.credits} generation credits`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}?payment=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        userId,
        planType,
        credits: plan.credits.toString(),
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[Stripe] Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Stripe Webhook] Checkout session completed:', session.id);

        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        const credits = parseInt(session.metadata?.credits || '0');

        if (!userId || !planType) {
          console.error('[Stripe Webhook] Missing metadata');
          break;
        }

        // Get user
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!user) {
          console.error('[Stripe Webhook] User not found:', userId);
          break;
        }

        // Update user
        const endsAt = new Date();
        endsAt.setDate(endsAt.getDate() + 30);

        await db.update(users)
          .set({
            credits: user.credits + credits,
            hasPaid: true,
            subscriptionStatus: 'active',
            subscriptionTier: planType,
            subscriptionEndsAt: endsAt,
            onboardingCompleted: true,
          })
          .where(eq(users.id, userId));

        // Create subscription record
        const plan = PLANS[planType as keyof typeof PLANS];
        await db.insert(subscriptionsTable).values({
          userId,
          planType,
          creditsIncluded: credits,
          amountPaid: plan.price,
          status: 'active',
          endsAt,
        });

        console.log('[Stripe Webhook] User updated successfully:', userId);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe Webhook] PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('[Stripe Webhook] PaymentIntent failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stripe/config
 * Get Stripe publishable key
 */
router.get('/config', (req: Request, res: Response) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

export default router;
