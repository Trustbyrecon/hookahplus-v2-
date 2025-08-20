import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Stripe with your test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

// Load products from JSON file
const productsPath = path.join(__dirname, '../products.json');
const catalog = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Helper function to create a unique price key
const pKey = p => [p.nickname || "", p.currency, p.recurring?.interval || "oneoff", p.unit_amount ?? null].join("|");

async function ensureProduct(entry) {
  try {
    // Try to retrieve existing product
    await stripe.products.retrieve(entry.id);
    // Update existing product
    await stripe.products.update(entry.id, {
      name: entry.name,
      description: entry.description,
      metadata: entry.metadata || {},
      active: true
    });
    console.log(`✔ Updated: ${entry.id}`);
  } catch (e) {
    if (e.statusCode === 404) {
      // Create new product with stable ID
      await stripe.products.create({
        id: entry.id,
        name: entry.name,
        description: entry.description,
        metadata: entry.metadata || {},
        active: true
      });
      console.log(`＋ Created: ${entry.id}`);
    } else {
      throw e;
    }
  }
}

async function ensurePrices(productId, desired) {
  const existing = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const map = new Map(existing.data.map(p => [pKey(p), p]));
  const out = [];
  
  for (const d of desired || []) {
    const key = pKey(d);
    if (map.has(key)) {
      out.push(map.get(key).id);
      continue;
    }
    
    const created = await stripe.prices.create({
      product: productId,
      currency: d.currency,
      unit_amount: d.unit_amount,
      nickname: d.nickname,
      recurring: d.recurring || undefined
    });
    out.push(created.id);
  }
  return out;
}

async function seedProducts() {
  console.log('🌱 Seeding Stripe products with ROI story specification...');
  console.log(`Found ${catalog.length} products to create/update\n`);

  const mapping = [];

  for (const entry of catalog) {
    try {
      console.log(`Processing: ${entry.name}`);
      
      // Ensure product exists/updated
      await ensureProduct(entry);
      
      // Ensure prices exist
      const priceIds = await ensurePrices(entry.id, entry.prices);
      
      mapping.push({
        product_id: entry.id,
        price_ids: priceIds,
        name: entry.name,
        metadata: entry.metadata
      });
      
      console.log(`   Prices: ${priceIds.length} configured`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error processing ${entry.name}:`, error.message);
    }
  }

  // Save the created product IDs for future use
  const outputPath = path.join(__dirname, '../stripe_ids.out.json');
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
  
  console.log('🎉 Seeding complete!');
  console.log(`📁 Product IDs saved to: ${outputPath}`);
  console.log('\n📋 Product Summary:');
  
  mapping.forEach(product => {
    console.log(`   ${product.name} (${product.product_id})`);
    console.log(`   Price IDs: ${product.price_ids.join(', ')}`);
    if (product.metadata?.tier) {
      console.log(`   Tier: ${product.metadata.tier}`);
    }
    console.log('');
  });

  console.log('💡 Next steps:');
  console.log('   1. Copy Price IDs from stripe_ids.out.json to your .env.local');
  console.log('   2. Verify products appear in your Stripe Dashboard');
  console.log('   3. Use these IDs in your checkout flow');
  console.log('   4. Test the new checkout API routes');
}

// Run the seeding
seedProducts().catch(console.error);
