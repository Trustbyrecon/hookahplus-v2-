import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Hookah+</h1>
      <p className="mb-6">Your command center for flavor, flow, and loyalty intelligence.</p>
      <div className="space-x-4">
        <Link href="/onboarding" className="bg-green-600 px-4 py-2 rounded">Start Onboarding</Link>
        <Link href="/demo" className="bg-blue-500 px-4 py-2 rounded">See a Demo</Link>
        <Link href="/live-session" className="bg-red-500 px-4 py-2 rounded">Join Live Session</Link>
      </div>
    </main>
  );
}
