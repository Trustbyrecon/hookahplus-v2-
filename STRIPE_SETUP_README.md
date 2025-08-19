# 🚀 Stripe Integration Setup Guide

This guide will walk you through setting up Stripe payments for your Hookah+ application.

## 📋 Prerequisites

- ✅ Stripe account with test API keys
- ✅ Node.js 20.19.0+ installed
- ✅ Your project dependencies installed (`npm install`)

## 🛠️ Step 1: Environment Setup

Create a `.env.local` file in your project root with your Stripe test keys:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51RZ0cZDuKNq0KFAAPZPxVRdQdyLUbsWwZZEdxTuObIOB9msGFgSKwdRQFEz0ecEnvLp9mfTda3JMSBYukhmMUQSl00RzwEJHfK
STRIPE_SECRET_KEY=sk_test_51RZ0cZDuKNq0KFAAPZPxVRdQdyLUbsWwZZEdxTuObIOB9msGFgSKwdRQFEz0ecEnvLp9mfTda3JMSBYukhmMUQSl00RzwEJHfK
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Trust-Lock Security
TRUSTLOCK_SECRET=your_super_long_random_string_here_minimum_32_chars

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Node Version
NODE_VERSION=20.19.0
```

## 🛠️ Step 2: Seed Your Product Catalog

Run the seeding script to create products in your Stripe dashboard:

```bash
npm run seed:stripe
```

This will:
- Create 3 products in Stripe:
  - **Hookah Session** ($15.00) - Standard session with 1 flavor
  - **Flavor Add-On** ($2.00) - Additional flavor shot
  - **VIP Monthly** ($50.00/month) - Monthly subscription
- Output the Product IDs and Price IDs
- Save them to `stripe-products-output.json`

## 🛠️ Step 3: Update Price IDs

After seeding, copy the Price IDs from the output and update the `StripeCheckout` component:

```tsx
// In components/StripeCheckout.tsx
const defaultProducts: Product[] = [
  {
    name: "Hookah Session",
    priceId: "price_actual_id_from_stripe", // Replace this
    amount: 15.00,
    currency: "usd"
  },
  {
    name: "Flavor Add-On", 
    priceId: "price_actual_id_from_stripe", // Replace this
    amount: 2.00,
    currency: "usd"
  }
];
```

## 🛠️ Step 4: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:3000/stripe-test
   ```

3. **Test with Stripe test cards:**
   - **Success:** 4242 4242 4242 4242
   - **Decline:** 4000 0000 0000 0002
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits

## 🔍 Verification Steps

### Check Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Verify your products appear:
   - Hookah Session
   - Flavor Add-On  
   - VIP Monthly

### Check API Response
The seeding script should output something like:
```
✅ Created: Hookah Session (ID: prod_xxx)
   Price ID: price_xxx
```

## 🚨 Troubleshooting

### Common Issues

**"Stripe failed to load"**
- Check your `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` in `.env.local`
- Ensure the key starts with `pk_test_`

**"Failed to create checkout session"**
- Verify your `STRIPE_SECRET_KEY` in `.env.local`
- Check the server logs for detailed error messages

**Products not appearing in Stripe**
- Ensure you're using test keys (not live keys)
- Check the seeding script output for errors
- Verify your Stripe account has API access

### Environment Variables

Make sure these are set correctly:
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Your Stripe publishable test key
- `STRIPE_SECRET_KEY` - Your Stripe secret test key
- `NEXT_PUBLIC_SITE_URL` - Your local development URL

## 🔄 Next Steps

Once the basic integration is working:

1. **Customize the checkout flow** in `StripeCheckout.tsx`
2. **Add webhook handling** for payment confirmations
3. **Integrate with your session management** system
4. **Add order tracking** and customer management
5. **Set up Square POS adapter** for in-store payments

## 📚 Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout Guide](https://stripe.com/docs/checkout)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🆘 Support

If you encounter issues:
1. Check the browser console for client-side errors
2. Check the terminal/server logs for API errors
3. Verify your Stripe dashboard for product creation
4. Ensure all environment variables are set correctly

---

**🎯 Goal:** Get a working Stripe checkout that can process test payments for your hookah lounge products.
