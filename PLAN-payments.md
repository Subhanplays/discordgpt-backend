# DiscordGPT — Stripe Payments & Usage-Based Credits Plan

## Overview
Add Stripe-based usage pricing with 3 plan tiers (Free, Pro, Enterprise). Users buy credits; each AI message costs credits. Features are gated by plan.

---

## Plan Tiers

| Feature | Free | Pro | Enterprise |
|---|---|---|---|
| **Credits/month** | 50 | 500 | 5000 |
| **AI Providers** | Basic (OpenAI GPT-4o-mini) | All providers | All providers |
| **Servers/Blueprints** | 3 | 25 | Unlimited |
| **Priority Support** | No | Yes | Yes (dedicated) |
| **Credit Price** | $0 (free) | $0.02/credit | $0.015/credit |

Users can purchase credit packs (e.g., 100 credits for $2) via Stripe Checkout. Unused credits roll over within the subscription period.

---

## Database Changes

### New Tables

```sql
-- Plan definitions
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- 'free', 'pro', 'enterprise'
  display_name TEXT NOT NULL,            -- 'Free', 'Pro', 'Enterprise'
  credits_per_month INTEGER NOT NULL,    -- 50, 500, 5000
  credit_price_cents INTEGER NOT NULL,   -- 0, 200, 150 (cents per credit)
  max_servers INTEGER NOT NULL,          -- 3, 25, -1 (unlimited)
  ai_access_level TEXT NOT NULL,         -- 'basic', 'all', 'all'
  priority_support BOOLEAN DEFAULT false,
  stripe_price_id TEXT,                  -- Stripe Price ID for subscriptions
  created_at TEXT DEFAULT (now()::text)
);

-- User subscriptions
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trialing'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  credits_used_this_period INTEGER DEFAULT 0,
  current_period_start TEXT,
  current_period_end TEXT,
  created_at TEXT DEFAULT (now()::text)
);

-- Credit transactions (audit log)
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,              -- negative = spent, positive = granted
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL,                    -- 'grant', 'usage', 'refund', 'purchase', 'admin_adjust'
  description TEXT,
  created_at TEXT DEFAULT (now()::text)
);

-- Credit purchases (Stripe checkout records)
CREATE TABLE credit_purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  created_at TEXT DEFAULT (now()::text)
);
```

### User Table Changes
```sql
ALTER TABLE users ADD COLUMN plan_id TEXT DEFAULT 'free' REFERENCES plans(id);
ALTER TABLE users ADD COLUMN credits_balance INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN credits_used_this_month INTEGER DEFAULT 0;
```

---

## Backend Changes

### 1. New Dependency
```
npm install stripe
```

### 2. New Files
| File | Purpose |
|---|---|
| `server/routes/billing.js` | Stripe checkout, webhooks, credit purchase, subscription mgmt |
| `server/middleware/creditCheck.js` | Pre-call credit balance check (replaces usageLimitMiddleware) |

### 3. Modified Files

#### `server/database.js`
- Add `plans` table init + seed 3 default plans
- Add CRUD: `getPlan(id)`, `getAllPlans()`, `createPlan()`, `updatePlan()`
- Add: `getUserSubscription(userId)`, `createSubscription()`, `updateSubscription()`
- Add: `getUserCredits(userId)`, `deductCredits(userId, amount)`, `addCredits(userId, amount)`
- Add: `logCreditTransaction(userId, amount, balanceAfter, type, description)`
- Add: `getUserServersCount(userId)` (for server creation limit)
- Add: `createCreditPurchase()`, `updateCreditPurchase()`

#### `server/middleware/creditCheck.js` (NEW — replaces usageLimit.js for chat routes)
- Load user's plan + credit balance
- Load cost per message from plan (1 credit per message by default)
- If `balance < 1`: return 403 `{ error: 'Insufficient credits', balance, plan }`
- Set `req.creditCost = 1` (or variable based on AI provider)
- Add response headers: `X-Credits-Balance`, `X-Credits-Cost`

#### `server/routes/chat.js`
- Add `router.use(creditCheckMiddleware)` at line 78 (before route handlers)
- In both `/send` and `/:id/messages` handlers, AFTER successful AI response:
  ```js
  const balance = await db.deductCredits(req.user.id, req.creditCost);
  await db.logCreditTransaction(req.user.id, -req.creditCost, balance, 'usage', 'AI message');
  ```

#### `server/index.js`
- Mount billing routes: `app.use('/api/billing', billingRoutes)`
- Add Stripe webhook endpoint: `app.use('/api/webhooks/stripe', express.raw({type:'application/json'}), billingRoutes)`
- Remove dead `usageLimitMiddleware` mount (lines 57-58)

#### `server/routes/usage.js`
- Return credit balance + plan info instead of just daily count

### 4. Stripe Integration Flow

#### Purchase Credits (Stripe Checkout)
```
Client -> POST /api/billing/checkout { planId, credits }
Server -> Creates Stripe Checkout Session with line item
Server -> Returns { sessionId, url }
Client -> Redirects to Stripe Checkout
Stripe -> Webhook: checkout.session.completed
Server -> Credits added to user account, subscription created
```

#### Webhook Events to Handle
- `checkout.session.completed` — Grant credits, activate subscription
- `invoice.payment_succeeded` — Monthly credit refresh
- `invoice.payment_failed` — Mark subscription past_due
- `customer.subscription.deleted` — Downgrade to free

---

## Frontend Changes

### New Files
| File | Purpose |
|---|---|
| `src/pages/PricingPage.jsx` | Plan comparison cards with Buy buttons |
| `src/pages/BillingPage.jsx` | Current plan, credit balance, usage chart, purchase history |
| `src/components/CreditBalance.jsx` | Header widget showing credits remaining |
| `src/components/PlanBadge.jsx` | Shows current plan badge (Free/Pro/Enterprise) |

### Modified Files

#### `src/App.jsx`
- Add routes: `/pricing`, `/billing`

#### `src/contexts/AuthContext.jsx`
- Store `plan_id`, `credits_balance` on user object

#### `src/pages/ChatPage.jsx`
- Show `CreditBalance` in header
- Show warning when credits are low

#### `src/components/MessageComposer.jsx`
- Disable send when credits = 0 (show upgrade prompt)

#### `src/components/WelcomeScreen.jsx`
- Show credit balance and plan info

#### `src/components/AdminPanel.jsx`
- Add "Plans" tab to manage plan configs
- Add credit grant/reset to user management
- Show subscription status in user list

#### `src/components/Sidebar.jsx`
- Add "Pricing" and "Billing" nav items

---

## Credit Cost Logic

Each AI message costs **1 credit** by default. Optional variable pricing (future enhancement):
- Basic models (GPT-4o-mini): 0.5 credits
- Standard models (GPT-4o, Claude): 1 credit
- Premium models (GPT-4, Claude Opus): 2 credits

For now, keep it simple: 1 credit = 1 message.

---

## Implementation Order

1. **Database**: Add tables, columns, seed plans
2. **Backend middleware**: `creditCheck.js` 
3. **Backend routes**: `billing.js` (Stripe checkout + webhooks)
4. **Backend chat routes**: Add credit deduction hooks
5. **Backend usage**: Update to return credit info
6. **Frontend**: PricingPage, BillingPage, CreditBalance
7. **Frontend integration**: Wire up chat, admin panel
8. **Deploy**: Push backend to GitHub (Render), frontend to Vercel

---

## Testing Checklist
- [ ] Free user gets 50 credits on signup
- [ ] Credits deducted on each AI message
- [ ] 403 when credits = 0
- [ ] Stripe checkout flow works
- [ ] Webhook grants credits after payment
- [ ] Plan upgrade/downgrade changes limits
- [ ] Admin can grant credits manually
- [ ] Credit transaction history visible in billing page
