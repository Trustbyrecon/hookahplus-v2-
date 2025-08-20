import React, { useMemo, useState, useEffect } from "react";

// Drop this file at: app/roi-calculator/page.tsx (Next.js App Router)
// Tailwind required. Optional: add your analytics to the handleCtaClick().
export default function RoiCalculatorPage() {
  const [sessionPrice, setSessionPrice] = useState<number>(30);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(8);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(26);
  const [uplift, setUplift] = useState<number>(1.2); // 20% uplift
  const [tier, setTier] = useState<"starter" | "pro" | "trust">("pro");

  const tierCost = useMemo(() => ({ starter: 99, pro: 249, trust: 499 }[tier]), [tier]);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const fmt2 = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const baseSessions = useMemo(() => sessionsPerDay * daysPerMonth, [sessionsPerDay, daysPerMonth]);
  const baseRevenue = useMemo(() => baseSessions * sessionPrice, [baseSessions, sessionPrice]);
  const revenueWithTrust = useMemo(() => baseRevenue * uplift, [baseRevenue, uplift]);
  const netGain = useMemo(() => revenueWithTrust - baseRevenue, [revenueWithTrust, baseRevenue]);
  const netAfterSub = useMemo(() => revenueWithTrust - tierCost, [revenueWithTrust, tierCost]);
  const roiMultiple = useMemo(() => (tierCost > 0 ? (netAfterSub - baseRevenue) / tierCost + 1 : 0), [netAfterSub, baseRevenue, tierCost]);
  const roiPctOfSub = useMemo(() => (tierCost > 0 ? ((revenueWithTrust - baseRevenue - tierCost) / tierCost) * 100 : 0), [revenueWithTrust, baseRevenue, tierCost]);

  const handleCtaClick = (label: string) => {
    // TODO: replace with Plausible/GA/Segment. Example GA4 event:
    // window.gtag?.("event", "cta_click", { label, page: "roi_calculator" });
    try {
      const evt = new CustomEvent("hp_roi_cta", { detail: { label, tier } });
      window.dispatchEvent(evt);
    } catch {}
    console.log("CTA:", label, { tier });
  };

  useEffect(() => {
    // Basic pageview hook for your analytics (replace with your provider)
    console.log("ROI Calculator Viewed", { tierDefault: tier });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500" />
            <span className="font-semibold tracking-tight">HookahPlus</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
            <a href="/" className="hover:text-white">Home</a>
            <a href="/pricing" className="hover:text-white">Pricing</a>
            <a href="#calc" className="hover:text-white">ROI Calculator</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(16,185,129,0.25),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
              See the ROI of
              <span className="block bg-gradient-to-br from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Hookah+ in Your Lounge</span>
            </h1>
            <p className="mt-5 text-neutral-300 max-w-xl">
              With Trust Core features, lounges typically see a <span className="text-emerald-400 font-medium">20% revenue uplift</span> in the first month.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#calc"
                onClick={() => handleCtaClick("hero_calculate")}
                className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-neutral-950 hover:bg-emerald-400"
              >
                Calculate Your ROI
              </a>
              <a
                href="/pricing"
                onClick={() => handleCtaClick("hero_pricing")}
                className="rounded-xl border border-neutral-700 px-5 py-3 font-medium hover:border-emerald-500/70"
              >
                See Pricing
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="rounded-xl bg-neutral-950 p-6 border border-neutral-800">
              <div className="text-sm text-neutral-300">ROI Snapshot (using defaults)</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                  <div className="text-xs text-neutral-400">Base Monthly</div>
                  <div className="text-lg font-semibold">{fmt(baseRevenue)}</div>
                </div>
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                  <div className="text-xs text-neutral-400">With Trust Core</div>
                  <div className="text-lg font-semibold">{fmt(revenueWithTrust)}</div>
                </div>
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                  <div className="text-xs text-neutral-400">Net Gain</div>
                  <div className="text-lg font-semibold text-emerald-400">{fmt(netGain)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calc" className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">Your Inputs</h2>
            <p className="text-sm text-neutral-400 mt-1">Adjust the numbers to match your lounge.</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-400">Session Price ($)</span>
                <input
                  type="number"
                  min={5}
                  className="rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-400">Sessions / Day</span>
                <input
                  type="number"
                  min={1}
                  className="rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none"
                  value={sessionsPerDay}
                  onChange={(e) => setSessionsPerDay(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-400">Days / Month</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  className="rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none"
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-neutral-400">Uplift Multiplier</span>
                <input
                  type="number"
                  step={0.01}
                  min={1}
                  className="rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none"
                  value={uplift}
                  onChange={(e) => setUplift(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="mt-6">
              <span className="text-xs text-neutral-400">Plan Tier</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {([
                  { key: "starter", label: "Starter", cost: 99 },
                  { key: "pro", label: "Pro", cost: 249 },
                  { key: "trust", label: "Trust+", cost: 499 },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTier(t.key)}
                    className={`rounded-xl px-4 py-2 border text-sm ${
                      tier === t.key
                        ? "border-emerald-500/70 bg-emerald-500/10"
                        : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                    }`}
                    aria-pressed={tier === t.key}
                  >
                    {t.label} · {fmt2(t.cost)} / mo
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-xs text-neutral-500">
              * Uplift reflects Reflex Scoring + Loyalty tools impact. Actuals vary by venue.
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">Projected Results</h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                <div className="text-xs text-neutral-400">Base Monthly Revenue</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(baseRevenue)}</div>
                <div className="text-xs text-neutral-500">{sessionsPerDay} × {daysPerMonth} × {fmt2(sessionPrice)}</div>
              </div>
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                <div className="text-xs text-neutral-400">Revenue w/ Trust Core</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(revenueWithTrust)}</div>
                <div className="text-xs text-neutral-500">Uplift ×{uplift.toFixed(2)}</div>
              </div>
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                <div className="text-xs text-neutral-400">Monthly Net Gain (Uplift)</div>
                <div className="mt-1 text-2xl font-semibold text-emerald-400">{fmt(netGain)}</div>
              </div>
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                <div className="text-xs text-neutral-400">After Subscription ({fmt2(tierCost)}/mo)</div>
                <div className="mt-1 text-2xl font-semibold">{fmt(netAfterSub)}</div>
                <div className="text-xs text-neutral-500">ROI vs. sub: {roiPctOfSub.toFixed(0)}%</div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
              <a
                href="/signup"
                onClick={() => handleCtaClick("roi_signup")}
                className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-neutral-950 text-center hover:bg-emerald-400"
              >
                Get Started
              </a>
              <a
                href="/pricing"
                onClick={() => handleCtaClick("roi_pricing")}
                className="rounded-xl border border-neutral-700 px-5 py-3 font-medium text-center hover:border-emerald-500/70"
              >
                See Pricing
              </a>
              <a
                href="/contact"
                onClick={() => handleCtaClick("roi_contact")}
                className="rounded-xl border border-neutral-700 px-5 py-3 font-medium text-center hover:border-emerald-500/70"
              >
                Talk to Sales
              </a>
            </div>

            <div className="mt-8 text-xs text-neutral-500">
              Note: This calculator is illustrative and not a guarantee of revenue. Your results may vary based on hours, staffing, and locale.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
