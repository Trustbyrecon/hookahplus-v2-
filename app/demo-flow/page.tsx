"use client";
import { useState } from 'react';

type DemoStep = 'qr-scan' | 'flavor-selection' | 'checkout' | 'confirmation' | 'dashboard';

export default function DemoFlowPage() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('qr-scan');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const flavors = [
    'Double Apple',
    'Mint',
    'Strawberry',
    'Grape',
    'Rose',
    'Vanilla',
    'Coconut',
    'Pineapple'
  ];

  const handleFlavorToggle = (flavor: string) => {
    setSelectedFlavors(prev => 
      prev.includes(flavor) 
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 'qr-scan') {
      setCurrentStep('flavor-selection');
    } else if (currentStep === 'flavor-selection') {
      setCurrentStep('checkout');
    } else if (currentStep === 'checkout') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep('confirmation');
      }, 2000);
    } else if (currentStep === 'confirmation') {
      setCurrentStep('dashboard');
    }
  };

  const resetDemo = () => {
    setCurrentStep('qr-scan');
    setSelectedFlavors([]);
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Hookah+ Demo Flow</h1>
          <p className="text-zinc-400">Experience the customer journey from start to finish</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          {(['qr-scan', 'flavor-selection', 'checkout', 'confirmation', 'dashboard'] as DemoStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === step 
                  ? 'bg-teal-500 text-white' 
                  : index < ['qr-scan', 'flavor-selection', 'checkout', 'confirmation', 'dashboard'].indexOf(currentStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-zinc-700 text-zinc-400'
              }`}>
                {index + 1}
              </div>
              {index < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < ['qr-scan', 'flavor-selection', 'checkout', 'confirmation', 'dashboard'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-zinc-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Step 1: QR Scan */}
        {currentStep === 'qr-scan' && (
          <div className="text-center">
            <div className="bg-zinc-800 rounded-xl p-12 mb-8">
              <div className="text-8xl mb-6">📱</div>
              <h2 className="text-3xl font-bold text-white mb-4">Step 1: Customer Scans QR Code</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Customer scans the QR code at their table to start their session
              </p>
              <div className="bg-white rounded-lg p-8 inline-block">
                <div className="text-6xl mb-4">📱</div>
                <div className="text-black font-bold text-lg">QR Code Scanner</div>
                <div className="text-gray-600 text-sm">Point camera at table QR code</div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              Continue to Flavor Selection →
            </button>
          </div>
        )}

        {/* Step 2: Flavor Selection */}
        {currentStep === 'flavor-selection' && (
          <div className="text-center">
            <div className="bg-zinc-800 rounded-xl p-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Step 2: Flavor Personalization</h2>
              <p className="text-zinc-400 text-lg mb-8">
                AI-powered flavor recommendations based on customer preferences
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {flavors.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => handleFlavorToggle(flavor)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFlavors.includes(flavor)
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                        : 'border-zinc-600 bg-zinc-700 text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
              {selectedFlavors.length > 0 && (
                <div className="mt-6 text-teal-300">
                  Selected: {selectedFlavors.join(', ')}
                </div>
              )}
            </div>
            <button
              onClick={handleNextStep}
              disabled={selectedFlavors.length === 0}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              Continue to Checkout →
            </button>
          </div>
        )}

        {/* Step 3: Stripe Checkout */}
        {currentStep === 'checkout' && (
          <div className="text-center">
            <div className="bg-zinc-800 rounded-xl p-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Step 3: Seamless Stripe Checkout</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Secure payment processing with real-time confirmation
              </p>
              <div className="bg-white rounded-lg p-8 inline-block text-left">
                <div className="text-black">
                  <div className="text-2xl font-bold mb-4">Stripe Checkout</div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Session:</span>
                      <span>$15.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flavors ({selectedFlavors.length}):</span>
                      <span>${(selectedFlavors.length * 2).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${(15 + selectedFlavors.length * 2).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="bg-gray-100 p-3 rounded text-sm">
                      💳 Card: **** **** **** 4242
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              Process Payment →
            </button>
          </div>
        )}

        {/* Step 4: Payment Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="text-center">
            <div className="bg-zinc-800 rounded-xl p-12 mb-8">
              <div className="text-8xl mb-6 text-green-400">✅</div>
              <h2 className="text-3xl font-bold text-white mb-4">Step 4: Payment Confirmed!</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Customer receives instant confirmation and lounge staff is notified
              </p>
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 inline-block">
                <div className="text-green-400 font-bold text-xl mb-2">Payment Successful!</div>
                <div className="text-green-300">
                  Amount: ${(15 + selectedFlavors.length * 2).toFixed(2)}<br/>
                  Transaction ID: txn_123456789<br/>
                  Status: Confirmed
                </div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              View Lounge Dashboard →
            </button>
          </div>
        )}

        {/* Step 5: Dashboard Overview */}
        {currentStep === 'dashboard' && (
          <div className="text-center">
            <div className="bg-zinc-800 rounded-xl p-12 mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Step 5: Lounge Dashboard Overview</h2>
              <p className="text-zinc-400 text-lg mb-8">
                Real-time session monitoring and customer insights
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-zinc-700 rounded-lg p-6">
                  <div className="text-3xl mb-2">🟢</div>
                  <div className="text-2xl font-bold text-green-400">3</div>
                  <div className="text-zinc-400">Active Sessions</div>
                </div>
                <div className="bg-zinc-700 rounded-lg p-6">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-blue-400">$47.00</div>
                  <div className="text-zinc-400">Today's Revenue</div>
                </div>
                <div className="bg-zinc-700 rounded-lg p-6">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-purple-400">12</div>
                  <div className="text-zinc-400">Customers Served</div>
                </div>
              </div>
              <div className="mt-8 bg-zinc-700 rounded-lg p-6 text-left">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Table 3 - Payment confirmed</span>
                    <span className="text-green-400">+$23.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Table 1 - Session started</span>
                    <span className="text-blue-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Table 5 - Flavor added</span>
                    <span className="text-purple-400">+$2.00</span>
                  </div>
                </div>
              </div>
            </div>
                                 <div className="flex gap-4 justify-center">
                       <button
                         onClick={resetDemo}
                         className="bg-zinc-600 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                       >
                         🔄 Restart Demo
                       </button>
                       <a
                         href="/sessions"
                         className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                       >
                         🚀 Try Live System
                       </a>
                       <a
                         href="/owner-cta?form=preorder"
                         className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                       >
                         💳 Start Preorders
                       </a>
                     </div>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4 animate-spin">💳</div>
              <div className="text-xl text-white mb-2">Processing Payment...</div>
              <div className="text-zinc-400">Please wait while we confirm your transaction</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
