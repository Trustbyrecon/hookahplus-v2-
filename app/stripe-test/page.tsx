import StripeCheckout from '../../components/StripeCheckout';

export default function StripeTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Stripe Integration Test
          </h1>
          <p className="text-xl text-gray-600">
            Test your Stripe checkout flow with the seeded products
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stripe Checkout Component */}
          <div>
            <StripeCheckout />
          </div>

          {/* Setup Instructions */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🛠️ Setup Instructions
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Environment Setup</h3>
                <p className="text-gray-600 mb-2">
                  Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root:
                </p>
                                 <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here`}
                 </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Seed Products</h3>
                <p className="text-gray-600 mb-2">
                  Run the seeding script to create products in Stripe:
                </p>
                <pre className="bg-gray-100 p-3 rounded text-xs">
npm run seed:stripe
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Update Price IDs</h3>
                <p className="text-gray-600 mb-2">
                  After seeding, copy the price IDs from the output and update the StripeCheckout component.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Test Checkout</h3>
                <p className="text-gray-600">
                  Use Stripe's test card numbers:
                </p>
                <ul className="list-disc list-inside mt-1 text-gray-600">
                  <li>Success: 4242 4242 4242 4242</li>
                  <li>Decline: 4000 0000 0000 0002</li>
                  <li>Expiry: Any future date</li>
                  <li>CVC: Any 3 digits</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is using your Stripe test environment. 
                No real charges will be made.
              </p>
            </div>
          </div>
        </div>

        {/* Product Catalog Display */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📦 Product Catalog
          </h2>
          <p className="text-gray-600 mb-4">
            These products will be created in your Stripe dashboard when you run the seeding script.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900">Hookah Session</h3>
              <p className="text-sm text-gray-600 mb-2">Standard hookah session with 1 flavor included.</p>
              <p className="text-lg font-bold text-green-600">$15.00 USD</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900">Flavor Add-On</h3>
              <p className="text-sm text-gray-600 mb-2">Additional flavor shot for your hookah session.</p>
              <p className="text-lg font-bold text-green-600">$2.00 USD</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900">VIP Monthly</h3>
              <p className="text-sm text-gray-600 mb-2">Unlimited premium lounge access with perks.</p>
              <p className="text-lg font-bold text-green-600">$50.00 USD/month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
