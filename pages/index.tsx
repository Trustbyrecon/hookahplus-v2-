import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Hookah+</h1>
      <p>This is your placeholder home page.</p>
      <Link href="/flavors">Try the Flavor Selector</Link>
    </div>
  );
}
