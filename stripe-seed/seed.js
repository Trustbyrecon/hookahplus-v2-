#!/usr/bin/env node
const fs = require('fs');
require('dotenv').config();
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) { 
  console.error('Missing STRIPE_SECRET_KEY'); 
  process.exit(1); 
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const src = JSON.parse(fs.readFileSync('./products.json','utf8'));

(async () => {
  const out = { products:{}, prices:{} };
  
  for (const p of src.products) {
    const product = await stripe.products.create({ 
      name: p.name, 
      default_price_data: p.type==='recurring' ? {
        currency: src.currency, 
        unit_amount: p.unit_amount, 
        recurring: { interval: p.interval || 'month' }
      } : undefined 
    });
    
    let price;
    if (p.type==='one_time') {
      price = await stripe.prices.create({ 
        product: product.id, 
        currency: src.currency, 
        unit_amount: p.unit_amount 
      });
    } else {
      price = await stripe.prices.retrieve(product.default_price);
    }
    
    await stripe.products.update(product.id, { metadata: { lookup_key: p.lookup_key }});
    await stripe.prices.update(price.id, { lookup_key: p.lookup_key });
    
    out.products[p.lookup_key] = product.id;
    out.prices[p.lookup_key] = price.id;
    console.log(`${p.name}: ${product.id} / ${price.id}`);
  }
  
  fs.writeFileSync('../stripe_ids.out.json', JSON.stringify(out, null, 2));
  console.log('Wrote ../stripe_ids.out.json');
})();
