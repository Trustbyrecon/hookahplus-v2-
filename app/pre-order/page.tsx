// app/preorder/page.tsx
"use client";

import { useEffect, useState } from "react";

function useReflexAgent(routeName: string) {
  useEffect(() => {
    const agentId = `reflex-${routeName.toLowerCase()}`;
    const trustLevel = localStorage.getItem("trust_tier") || "Tier I";
    const sessionContext = {
      timestamp: Date.now(),
      returning: localStorage.getItem("user_visited_before") === "true",
    };

    console.log(`[ReflexAgent] ${agentId} loaded`, {
      trustLevel,
      sessionContext,
    });

    window.dispatchEvent(new CustomEvent("reflex-agent-log", {
      detail: { agentId, trustLevel, routeName, sessionContext },
    }));

    localStorage.setItem("user_visited_before", "true");
  }, [routeName]);
}

// Mock flavor data - replace with your actual flavors
const mockFlavors = [
  { id: 1, name: "Mint Fusion", description: "Cool mint with herbal notes", price: 25.99 },
  { id: 2, name: "Berry Blast", description: "Mixed berries with vanilla", price: 27.99 },
  { id: 3, name: "Tropical Paradise", description: "Pineapple, mango, coconut", price: 29.99 },
  { id: 4, name: "Spice Route", description: "Cinnamon, cardamom, clove", price: 26.99 },
];

export default function PreOrder() {
  useReflexAgent("PreOrder");
  const [selectedFlavors, setSelectedFlavors] = useState<Array<{id: number, name: string, price: number, quantity: number}>>([]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get table ID from URL params (you'll need to implement this based on your routing)
  const tableId = "demo-table-001"; // Replace with actual table ID logic

  const handleFlavorToggle = (flavor: typeof mockFlavors[0]) => {
    setSelectedFlavors(prev => {
      const existing = prev.find(f => f.id === flavor.id);
      if (existing) {
        return prev.filter(f => f.id !== flavor.id);
      } else {
        return [...prev, { ...flavor, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (flavorId: number, quantity: number) => {
    setSelectedFlavors(prev => 
      prev.map(f => f.id === flavorId ? { ...f, quantity } : f)
    );
  };

  const handleCheckout = async () => {
    if (selectedFlavors.length === 0 || !customerEmail) return;

    setIsLoading(true);
    try {
      // EP: Create Stripe checkout session
      const response = await fetch('/api/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          flavorSelections: selectedFlavors,
          customerEmail,
        }),
      });

      const { sessionId } = await response.json();
      
      // Navigator: Redirect to Stripe Checkout
      if (sessionId) {
        // Emit GA event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'Checkout_Pay', {
            event_category: 'Ecommerce',
            event_label: tableId,
            value: selectedFlavors.reduce((sum, f) => sum + (f.price * f.quantity), 0),
          });
        }

        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      }
    } catch (error) {
      console.error('[EP] Checkout error:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = selectedFlavors.reduce((sum, flavor) => sum + (flavor.price * flavor.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Pre-Order Station</h1>
      <p className="mb-4 text-lg">
        Customize and reserve your Hookah+ session ahead of time. Trust tokens apply.
      </p>

      {/* Sentinel: Trust Lock Display */}
      <div className="mb-6 p-4 border border-teal-500 rounded-lg bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-green-400">🔒</span>
          <span className="text-teal-200">Trust Lock: TLH-v1::active</span>
        </div>
      </div>

      {/* Flavor Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-teal-300">Select Your Flavors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockFlavors.map((flavor) => {
            const isSelected = selectedFlavors.some(f => f.id === flavor.id);
            const selectedFlavor = selectedFlavors.find(f => f.id === flavor.id);
            
            return (
              <div key={flavor.id} className={`p-4 rounded-lg border-2 transition-all ${
                isSelected ? 'border-teal-500 bg-teal-900/20' : 'border-zinc-700 bg-zinc-800'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{flavor.name}</h3>
                  <span className="text-teal-400 font-bold">${flavor.price}</span>
                </div>
                <p className="text-zinc-300 text-sm mb-3">{flavor.description}</p>
                
                {isSelected && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-zinc-300">Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={selectedFlavor?.quantity || 1}
                      onChange={(e) => handleQuantityChange(flavor.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm"
                    />
                  </div>
                )}
                
                <button
                  onClick={() => handleFlavorToggle(flavor)}
                  className={`mt-3 w-full py-2 px-4 rounded font-medium transition-colors ${
                    isSelected 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isSelected ? 'Remove' : 'Add to Order'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Email */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Email for Order Confirmation
        </label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-teal-500 focus:outline-none"
        />
      </div>

      {/* Order Summary */}
      {selectedFlavors.length > 0 && (
        <div className="mb-6 p-4 border border-teal-500 rounded-lg bg-zinc-900">
          <h3 className="text-lg font-semibold mb-3 text-teal-300">Order Summary</h3>
          {selectedFlavors.map((flavor) => (
            <div key={flavor.id} className="flex justify-between items-center mb-2">
              <span>{flavor.name} x{flavor.quantity}</span>
              <span className="text-teal-400">${(flavor.price * flavor.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-teal-500 pt-2 mt-3">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span className="text-teal-400">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={selectedFlavors.length === 0 || !customerEmail || isLoading}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
          selectedFlavors.length === 0 || !customerEmail || isLoading
            ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isLoading ? 'Creating Checkout...' : `Proceed to Checkout - $${totalPrice.toFixed(2)}`}
      </button>

      {/* Reflex Agent Monitoring */}
      <div className="mt-8 border border-teal-500 p-6 rounded-xl bg-zinc-900 shadow-xl">
        <p className="text-teal-200">🌀 Reflex Agent Monitoring — Loyalty Sync Enabled</p>
        <p className="text-zinc-400 text-sm mt-2">EP: Payment pipeline ready | Sentinel: Trust validation active</p>
      </div>
    </div>
  );
}
