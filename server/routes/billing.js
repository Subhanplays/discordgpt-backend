const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const db = require('../database');

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const CREDIT_PACKS = [
  { id: 'credits_100', credits: 100, priceCents: 200, label: '100 Credits' },
  { id: 'credits_500', credits: 500, priceCents: 900, label: '500 Credits' },
  { id: 'credits_1000', credits: 1000, priceCents: 1600, label: '1,000 Credits' }
];

// Get all plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await db.getAllPlans();
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// Get credit packs
router.get('/credit-packs', (req, res) => {
  res.json(CREDIT_PACKS);
});

// Get current user's subscription + credits
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    const subscription = await db.getUserSubscription(req.user.id);
    const purchases = await db.getCreditPurchases(req.user.id, 10);
    const transactions = await db.getCreditTransactions(req.user.id, 20);

    res.json({
      plan: subscription ? {
        id: subscription.plan_id,
        name: subscription.plan_name,
        display_name: subscription.display_name,
        credits_per_month: subscription.credits_per_month,
        credit_price_cents: subscription.credit_price_cents,
        max_servers: subscription.max_servers,
        ai_access_level: subscription.ai_access_level,
        priority_support: subscription.priority_support
      } : { id: 'free', name: 'free', display_name: 'Free', credits_per_month: 50, credit_price_cents: 0, max_servers: 3, ai_access_level: 'basic', priority_support: false },
      credits: {
        balance: user.credits_balance || 0,
        used_this_month: user.credits_used_this_month || 0
      },
      subscription: subscription ? {
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        stripe_subscription_id: subscription.stripe_subscription_id
      } : null,
      purchases,
      transactions
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Create Stripe Checkout for plan upgrade
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY.' });
    }

    const { planId } = req.body;
    const plan = await db.getPlanById(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    if (plan.name === 'free') return res.status(400).json({ error: 'Free plan requires no checkout' });

    const user = await db.getUserById(req.user.id);
    let customerId = null;

    const existingSub = await db.getUserSubscription(req.user.id);
    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${plan.display_name} Plan`, description: `${plan.credits_per_month} credits/month` },
          recurring: { interval: 'month' },
          unit_amount: Math.round(plan.credits_per_month * plan.credit_price_cents / plan.credits_per_month) || 999
        },
        quantity: 1
      }],
      success_url: `${process.env.CLIENT_URL || 'https://discordgpt1.vercel.app'}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'https://discordgpt1.vercel.app'}/pricing`,
      metadata: { userId: user.id, planId: plan.id }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

// Create Stripe Checkout for credit packs
router.post('/checkout-credits', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' });
    }

    const { packId } = req.body;
    const pack = CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) return res.status(400).json({ error: 'Invalid pack' });

    const user = await db.getUserById(req.user.id);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: pack.label, description: `${pack.credits} credits` },
          unit_amount: pack.priceCents
        },
        quantity: 1
      }],
      success_url: `${process.env.CLIENT_URL || 'https://discordgpt1.vercel.app'}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'https://discordgpt1.vercel.app'}/pricing`,
      metadata: { userId: user.id, credits: String(pack.credits), type: 'credit_pack' }
    });

    await db.createCreditPurchase(user.id, pack.credits, pack.priceCents, session.id);

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Credit checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

// Cancel subscription
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    if (!stripe) {
      await db.cancelSubscription(req.user.id);
      return res.json({ message: 'Subscription canceled' });
    }

    const sub = await db.getUserSubscription(req.user.id);
    if (!sub?.stripe_subscription_id) {
      await db.cancelSubscription(req.user.id);
      return res.json({ message: 'Downgraded to free' });
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
    await db.updateSubscriptionStatus(req.user.id, 'canceled');
    res.json({ message: 'Subscription will cancel at period end' });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel' });
  }
});

// Stripe webhook (raw body needed)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const type = session.metadata?.type;

        if (type === 'credit_pack') {
          const credits = parseInt(session.metadata?.credits || '0');
          if (userId && credits > 0) {
            const balance = await db.addCredits(userId, credits);
            await db.logCreditTransaction(userId, credits, balance, 'purchase', `Purchased ${credits} credits`);
            await db.updateCreditPurchase(session.id, 'completed', session.payment_intent);
          }
        } else if (planId && userId) {
          const plan = await db.getPlanById(planId);
          if (plan) {
            await db.createSubscription(userId, planId, session.customer, session.subscription);
            await db.setCredits(userId, plan.credits_per_month);
            await db.logCreditTransaction(userId, plan.credits_per_month, plan.credits_per_month, 'grant', `${plan.display_name} plan credits`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const sub = await db.getSubscriptionByStripeId(invoice.subscription);
          if (sub) {
            const plan = await db.getPlanById(sub.plan_id);
            if (plan) {
              const periodStart = new Date().toISOString();
              const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              await db.updateSubscriptionPeriod(sub.user_id, periodStart, periodEnd);
              await db.setCredits(sub.user_id, plan.credits_per_month);
              await db.logCreditTransaction(sub.user_id, plan.credits_per_month, plan.credits_per_month, 'grant', `Monthly ${plan.display_name} credits`);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const sub = await db.getSubscriptionByStripeId(invoice.subscription);
          if (sub) {
            await db.updateSubscriptionStatus(sub.user_id, 'past_due');
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const sub = await db.getSubscriptionByStripeId(subscription.id);
        if (sub) {
          await db.cancelSubscription(sub.user_id);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
