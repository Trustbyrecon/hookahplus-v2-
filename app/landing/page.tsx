"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Simulate video loading
    setTimeout(() => setIsVideoLoaded(true), 1000);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Video/Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          {isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">🌿</div>
                <div className="text-2xl text-purple-300 font-light">AI-Powered Lounge Management</div>
              </div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                HOOKAH+
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-zinc-300 mb-8 font-light">
              Future of Lounge Sessions with AI-Powered Personalization
            </h2>
            <p className="text-xl text-zinc-400 mb-12 max-w-3xl mx-auto">
              Transform your hookah lounge with intelligent session management, 
              personalized customer experiences, and seamless payment processing.
            </p>
            
            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                                         <Link
                             href="/owner-cta?form=preorder"
                             className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl"
                           >
                             🚀 Start Preorders
                           </Link>
                           <Link
                             href="/demo-video"
                             className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl text-xl font-medium transition-colors border border-zinc-600"
                           >
                             🎯 See Demo
                           </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-lg font-semibold text-teal-300 mb-2">AI-Powered</h3>
                <p className="text-zinc-400 text-sm">Intelligent flavor recommendations and customer insights</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Secure Payments</h3>
                <p className="text-zinc-400 text-sm">Stripe integration with real-time transaction processing</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="text-lg font-semibold text-purple-300 mb-2">QR Experience</h3>
                <p className="text-zinc-400 text-sm">Seamless customer journey from scan to session</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            Why Lounge Owners Choose Hookah+
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-teal-500 transition-colors">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Customer Personalization</h3>
              <p className="text-zinc-400">AI learns preferences and suggests perfect flavor combinations for returning customers.</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-blue-500 transition-colors">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-Time Analytics</h3>
              <p className="text-zinc-400">Monitor session performance, popular flavors, and customer behavior in real-time.</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-purple-500 transition-colors">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-3">Revenue Optimization</h3>
              <p className="text-zinc-400">Increase average order value with intelligent upselling and flavor recommendations.</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-green-500 transition-colors">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Transactions</h3>
              <p className="text-zinc-400">Enterprise-grade security with Stripe integration and fraud protection.</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-yellow-500 transition-colors">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-white mb-3">Mobile-First Design</h3>
              <p className="text-zinc-400">Optimized for mobile devices with intuitive touch interfaces.</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-pink-500 transition-colors">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">Quick Setup</h3>
              <p className="text-zinc-400">Get started in minutes with our plug-and-play QR system and dashboard.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-gradient-to-r from-teal-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Lounge?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join the future of hookah lounge management with AI-powered personalization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                     <Link
                           href="/demo-video"
                           className="bg-white text-teal-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
                         >
                           🎯 Experience the Demo
                         </Link>
                         <Link
                           href="/owner-cta?form=preorder"
                           className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-900 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
                         >
                           🚀 Start Preorders
                         </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
