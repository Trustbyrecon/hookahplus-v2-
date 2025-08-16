# Hookah+ MVP Launch 🚀

**Status: MVP Launch Execution Complete** ✅  
**Cycle: 09 → Launch**  
**Deployment: Netlify + Stripe + Trust-Lock**

## 🎯 MVP Features

### 🔧 Economic Pathways (EP)
- ✅ Live Stripe payments from QR → Stripe → dashboard
- ✅ App Router only (pages/ removed)
- ✅ Server routes: `/api/checkout-session`, `/api/webhooks/stripe`, `/api/orders`
- ✅ Trust-Lock HMAC binding for every order
- ✅ Rate limiting (3 requests per IP per 30s)

### 🔵 Navigator (UX & Flow)
- ✅ Landing CTAs: "Start preorders" → `/preorder/T-001`
- ✅ "See demo" → `/demo` (static HTML)
- ✅ "POS waitlist" → `/onboarding#waitlist`
- ✅ Dynamic preorder page with flavor/duration selection
- ✅ Smooth path: Landing → Preorder → Checkout → Dashboard
- ✅ Dashboard polling `/api/orders` every 5s

### 🔴 Sentinel (Security & Trust)
- ✅ HMAC binding: `signTrust(orderId)` stored in metadata.trustSig
- ✅ Webhook verification: `verifyTrust(orderId, trustSig)` before markPaid
- ✅ Audit logging: `audit.order.created`, `audit.order.paid`
- ✅ Orders without valid trust sig are rejected

### 🟣 Aliethia (Memory & Flavor Logs)
- ✅ Flavor intent capture in preorder submission
- ✅ Ephemeral order storage in `/lib/orders.ts`
- ✅ Dashboard widget: "Top 3 Mixes Today" (after 3+ paid orders)
- ✅ "Returning Customers %" calculation

### 🎬 Demo Video Agent
- ✅ Async demo page loading
- ✅ Static HTML demo at `/demo`
- ✅ No LCP regression

### 📊 Analytics Agent
- ✅ GA4 events: Hero_StartPreorders, Hero_ViewDemo, Preorder_Submit, Checkout_Pay, Order_Confirmed, Dashboard_View
- ✅ Return-from-Stripe toast with "Trust-Lock: Verified"
- ✅ Events fire end-to-end through the funnel

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Fill in your values:
# - Stripe keys (test mode for MVP)
# - TrustLock secret (32+ chars)
# - Google Analytics ID
# - Site URL
```

### 2. Local Development
```bash
npm install
npm run dev
```

### 3. Netlify Deployment
```bash
# Push to main branch (auto-deploys)
git push origin main

# Or manual deploy
netlify deploy --prod
```

## 🔧 Netlify Configuration

### Environment Variables (Site Settings → Build & Deploy → Environment)
```
NODE_VERSION=20.19.0
NEXT_PUBLIC_SITE_URL=https://hookahplus.net
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
TRUSTLOCK_SECRET=super-long-random-string
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Stripe Webhook Setup
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://hookahplus.net/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy secret → `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing MVP

### 1. Test Card Flow
```
Card: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits
```

### 2. End-to-End Test
1. Visit `/preorder/T-001`
2. Select flavor + duration
3. Submit → redirects to `/checkout`
4. Pay with test card
5. Return → shows "Trust-Lock: Verified"
6. Check `/dashboard` for order status transition

### 3. Trust-Lock Verification
- Check browser console for audit logs
- Verify webhook processes only orders with valid trust sig
- Dashboard shows real-time updates

## 📁 Project Structure

```
app/
├── api/
│   ├── checkout-session/route.ts    # Stripe session creation
│   ├── webhooks/stripe/route.ts     # Payment confirmation
│   └── orders/route.ts              # Order listing
├── checkout/page.tsx                # Stripe checkout
├── dashboard/page.tsx               # Live order tracking
├── preorder/[tableId]/page.tsx     # Dynamic preorder
└── page.tsx                         # Landing with CTAs

lib/
├── trustlock.ts                     # HMAC signing/verification
└── orders.ts                        # Order management + analytics

public/
└── demo.html                        # Static demo page
```

## 🔒 Security Features

- **Trust-Lock**: HMAC-SHA256 cryptographic verification
- **Rate Limiting**: 3 requests per IP per 30 seconds
- **Audit Logging**: Every state change logged with timestamp
- **Webhook Verification**: Stripe signature validation
- **Order Binding**: Each order cryptographically bound to session

## 📊 Analytics Events

| Event | Trigger | Data |
|-------|---------|------|
| `Hero_StartPreorders` | Click "Start Preorders" | tableId: "T-001" |
| `Hero_ViewDemo` | Click "See Demo" | - |
| `Preorder_Submit` | Submit preorder form | tableId, flavor, amount |
| `Checkout_Pay` | Click "Pay with Stripe" | tableId, amount |
| `Order_Confirmed` | Return from Stripe | orderId, amount |
| `Dashboard_View` | Load dashboard | - |

## 🚨 Rollback Plan

If issues arise:
1. **Fast Rollback**: Revert to last green Netlify deploy
2. **Git Rollback**: `git revert <last-commit>` + push
3. **Stripe Pause**: Disable webhook in Stripe Dashboard
4. **Environment Reset**: Clear Netlify env vars if needed

## 🎉 MVP Launch Checklist

- [x] Remove pages/ directory (App Router only)
- [x] Node 20.19.0 set on Netlify
- [x] Environment variables configured
- [x] API routes implemented and tested
- [x] Preorder → Checkout → Stripe → Return happy path
- [x] Webhook marks orders paid
- [x] Dashboard shows real-time transitions
- [x] GA4 events fire end-to-end
- [x] Demo page async loaded
- [x] LCP stays green
- [x] Trust-Lock verification working
- [x] Rate limiting active
- [x] Audit logging enabled

**MVP Launch Status: READY FOR PRODUCTION** 🚀

---

*Built with Next.js 14, Stripe, and Trust-Lock security. Powered by Reflex Intelligence.*
