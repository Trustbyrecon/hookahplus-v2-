import React from 'react';
import { useSession } from './SessionContext';

export default function SessionNotes() {
  const { session, setSession } = useSession();

  return (
    <div className="mt-4">
      <label className="block mb-1 font-semibold">Session Notes:</label>
      <textarea
        value={session.notes}
        onChange={(e) => setSession(prev => ({
          ...prev,
          notes: e.target.value
        }))}
        className="w-full h-24 p-2 bg-gray-900 text-white rounded"
        placeholder="Private staff-only notes..."
      />
    </div>
  );
}
