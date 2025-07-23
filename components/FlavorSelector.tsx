import { useState } from 'react';

const flavors = ['Mint', 'Grape', 'Watermelon', 'Blueberry'];

export default function FlavorSelector() {
  const [selected, setSelected] = useState('');

  return (
    <div>
      <select onChange={(e) => setSelected(e.target.value)}>
        <option value="">Choose a flavor</option>
        {flavors.map((flavor) => (
          <option key={flavor} value={flavor}>
            {flavor}
          </option>
        ))}
      </select>
      {selected && <p>You selected: {selected}</p>}
    </div>
  );
}
