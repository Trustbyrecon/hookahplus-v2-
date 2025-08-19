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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Load products from JSON file
const productsPath = path.join(__dirname, '../products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

async function seedProducts() {
  console.log('🌱 Seeding Stripe products...');
  console.log(`Found ${products.length} products to create\n`);

  const createdProducts = [];

  for (const product of products) {
    try {
      console.log(`Creating: ${product.name}`);
      
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        default_price_data: product.default_price_data,
      });

      console.log(`✅ Created: ${stripeProduct.name} (ID: ${stripeProduct.id})`);
      console.log(`   Price ID: ${stripeProduct.default_price}`);
      console.log('');

      createdProducts.push({
        name: stripeProduct.name,
        productId: stripeProduct.id,
        priceId: stripeProduct.default_price,
        amount: product.default_price_data.unit_amount / 100,
        currency: product.default_price_data.currency
      });

    } catch (error) {
      console.error(`❌ Error creating ${product.name}:`, error.message);
    }
  }

  // Save the created product IDs for future use
  const outputPath = path.join(__dirname, '../stripe-products-output.json');
  fs.writeFileSync(outputPath, JSON.stringify(createdProducts, null, 2));
  
  console.log('🎉 Seeding complete!');
  console.log(`📁 Product IDs saved to: ${outputPath}`);
  console.log('\n📋 Created Products:');
  
  createdProducts.forEach(product => {
    console.log(`   ${product.name}: $${product.amount} ${product.currency.toUpperCase()}`);
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Price ID: ${product.priceId}`);
    console.log('');
  });

  console.log('💡 Next steps:');
  console.log('   1. Copy these Price IDs for checkout sessions');
  console.log('   2. Verify products appear in your Stripe Dashboard');
  console.log('   3. Use these IDs in your checkout flow');
}

// Run the seeding
seedProducts().catch(console.error);
