// test-demo-data.js
// Simple test script to verify demo data generation

const BASE_URL = 'http://localhost:3000';

async function testDemoData() {
  console.log('🧪 Testing Demo Data Generation...\n');

  try {
    // Step 1: Check initial orders
    console.log('1️⃣ Checking initial orders...');
    const initialResponse = await fetch(`${BASE_URL}/api/orders`);
    const initialData = await initialResponse.json();
    console.log('   Initial orders:', initialData.orders.length);
    console.log('   Sample:', initialData.orders.slice(0, 2));

    // Step 2: Generate demo data
    console.log('\n2️⃣ Generating demo data...');
    const generateResponse = await fetch(`${BASE_URL}/api/demo-data`, {
      method: 'POST'
    });
    const generateData = await generateResponse.json();
    console.log('   Generation result:', generateData);

    // Step 3: Wait a moment for processing
    console.log('\n3️⃣ Waiting for data processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Check orders after generation
    console.log('\n4️⃣ Checking orders after generation...');
    const finalResponse = await fetch(`${BASE_URL}/api/orders`);
    const finalData = await finalResponse.json();
    console.log('   Final orders:', finalData.orders.length);
    console.log('   Sample orders:', finalData.orders.slice(0, 3));

    // Step 5: Summary
    console.log('\n📊 Summary:');
    console.log(`   Orders before: ${initialData.orders.length}`);
    console.log(`   Orders after: ${finalData.orders.length}`);
    console.log(`   Demo generated: ${generateData.orders}`);
    console.log(`   Success: ${generateData.success ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDemoData();
