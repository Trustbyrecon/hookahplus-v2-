import React from 'react';
import { useSession } from './SessionContext';

export default function FlavorSelector() {
  const { session, setSession } = useSession();

  const flavors = ['Mint', 'Watermelon', 'Blueberry', 'Peach', 'Double Apple'];

  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">Flavor:</label>
      <select
        value={session.flavor}
        onChange={(e) => setSession(prev => ({
          ...prev,
          flavor: e.target.value
        }))}
        className="p-2 bg-gray-800 text-white rounded w-full"
      >
        {flavors.map((flavor) => (
          <option key={flavor} value={flavor}>
            {flavor}
          </option>
        ))}
      </select>
    </div>
  );
}
