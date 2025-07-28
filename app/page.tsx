import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 py-8">
      <h1 className="text-5xl font-bold mb-6">Hookah<span className="text-purple-400">+</span></h1>
      <p className="text-lg text-center mb-8 max-w-xl">
        Select your operational mode. Each route is empowered by Reflex Agents, Memory Logs, Trust Bloom layers, and Portal UI/UX intelligence.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <Link href="/dashboard">
          <a className="block bg-purple-600 hover:bg-purple-800 text-white font-semibold py-3 px-4 rounded text-center">
            Lounge Dashboard
          </a>
        </Link>
        <Link href="/preorder">
          <a className="block bg-green-600 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded text-center">
            QR Pre-Order Gateway
          </a>
        </Link>
        <Link href="/admin">
          <a className="block bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded text-center">
            Admin Intelligence Hub
          </a>
        </Link>
        <Link href="/operator">
          <a className="block bg-pink-600 hover:bg-pink-800 text-white font-semibold py-3 px-4 rounded text-center">
            Main Operator Panel
          </a>
        </Link>
      </div>
    </main>
  );
}
