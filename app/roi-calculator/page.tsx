"use client";
import { useState, useEffect } from "react";
import { track } from "@/lib/analytics";

export default function ROICalculatorPage() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [sessionPrice, setSessionPrice] = useState(30);
  const [sessionsPerDay, setSessionsPerDay] = useState(20);
  const [operatingCosts, setOperatingCosts] = useState(8000);
  const [roi, setRoi] = useState(0);

  useEffect(() => {
    track("roi_view");
  }, []);

  const calculateROI = () => {
    const monthlySessions = sessionsPerDay * 30;
    const totalRevenue = monthlySessions * sessionPrice;
    const profit = totalRevenue - operatingCosts;
    const roiPercentage = ((profit / operatingCosts) * 100);
    setRoi(roiPercentage);
    
    track("roi_calculate_click", { 
      monthlyRevenue: totalRevenue,
      sessionsPerDay,
      sessionPrice 
    });
  };

  const handlePricingClick = () => {
    track("roi_pricing_click");
  };

  const handleSignupClick = () => {
    track("roi_signup_click");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hookah+ ROI Calculator
          </h1>
          <p className="text-xl text-gray-300">
            Calculate your potential return on investment with Trust Core
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Business Metrics</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Monthly Revenue
                </label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Price ($)
                </label>
                <input
                  type="number"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sessions per Day
                </label>
                <input
                  type="number"
                  value={sessionsPerDay}
                  onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Operating Costs
                </label>
                <input
                  type="number"
                  value={operatingCosts}
                  onChange={(e) => setOperatingCosts(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="8000"
                />
              </div>

              <button
                onClick={calculateROI}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                Calculate ROI
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Results</h2>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-400 mb-2">
                  {roi > 0 ? `+${roi.toFixed(1)}%` : `${roi.toFixed(1)}%`}
                </div>
                <p className="text-gray-300">Return on Investment</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Trust Core Benefits</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Automated session tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Real-time analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Customer loyalty management
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Inventory optimization
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePricingClick}
                  className="w-full bg-white/20 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/30 transition-colors"
                >
                  View Pricing Plans
                </button>
                <button
                  onClick={handleSignupClick}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            * ROI calculations are estimates based on industry averages. Actual results may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
