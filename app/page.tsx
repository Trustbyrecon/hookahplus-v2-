// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Hookah+ Operator Gateway</h1>
      <p className="text-lg text-gray-300 mb-10">Welcome to the launchpad. Choose your portal.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        <Link href="/dashboard">
          <div className="bg-zinc-900 rounded-2xl p-6 hover:bg-zinc-800 transition cursor-pointer shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">📊 Dashboard</h2>
            <p className="text-sm text-gray-400">View session analytics, loyalty insights, and reflex heatmaps.</p>
          </div>
        </Link>
        <Link href="/pre-order">
          <div className="bg-zinc-900 rounded-2xl p-6 hover:bg-zinc-800 transition cursor-pointer shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">🧾 Pre-Order</h2>
            <p className="text-sm text-gray-400">Allow guests to pre-select flavors, session time, and QR pay.</p>
          </div>
        </Link>
        <Link href="/admin">
          <div className="bg-zinc-900 rounded-2xl p-6 hover:bg-zinc-800 transition cursor-pointer shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">🛠️ Admin</h2>
            <p className="text-sm text-gray-400">Set up lounge zones, pricing tiers, staff roles and timing.</p>
          </div>
        </Link>
        <Link href="/operator">
          <div className="bg-zinc-900 rounded-2xl p-6 hover:bg-zinc-800 transition cursor-pointer shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">🔥 Operator</h2>
            <p className="text-sm text-gray-400">Live session manager for staff. Vibe logs, SessionNotes, timer.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
