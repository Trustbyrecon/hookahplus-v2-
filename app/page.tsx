'use client';

import { useState } from 'react';

export default function ThemeSelector() {
  const [loungeName, setLoungeName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f27c38');
  const [flavorTheme, setFlavorTheme] = useState('mint');

  const previewTheme = () => {
    // This function is now handled by React state
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      background: '#0e0e0e',
      color: '#fff',
      padding: '20px',
      minHeight: '100vh'
    }}>
      <h1>🎨 Customize Your Lounge Experience</h1>
      
      <form id="themeForm">
        <label htmlFor="lounge_name" style={{
          fontWeight: 'bold',
          display: 'block',
          marginTop: '20px'
        }}>
          Lounge Name
        </label>
        <input 
          type="text" 
          id="lounge_name" 
          placeholder="e.g. Cloud Nine Lounge"
          value={loungeName}
          onChange={(e) => setLoungeName(e.target.value)}
          style={{
            padding: '10px',
            margin: '10px 0',
            width: '100%'
          }}
        />

        <label htmlFor="primary_color" style={{
          fontWeight: 'bold',
          display: 'block',
          marginTop: '20px'
        }}>
          Primary Color
        </label>
        <input 
          type="color" 
          id="primary_color" 
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          style={{
            padding: '10px',
            margin: '10px 0',
            width: '100%'
          }}
        />

        <label htmlFor="flavor_theme" style={{
          fontWeight: 'bold',
          display: 'block',
          marginTop: '20px'
        }}>
          Flavor Theme
        </label>
        <select 
          id="flavor_theme"
          value={flavorTheme}
          onChange={(e) => setFlavorTheme(e.target.value)}
          style={{
            padding: '10px',
            margin: '10px 0',
            width: '100%'
          }}
        >
          <option value="mint">Mint</option>
          <option value="cherry">Cherry</option>
          <option value="dark">Luxe Dark</option>
        </select>

        <button 
          type="button" 
          onClick={previewTheme}
          style={{
            background: '#f27c38',
            border: 'none',
            padding: '12px 20px',
            color: '#fff',
            fontSize: '1em',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Preview Theme
        </button>
      </form>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        border: '1px solid #444'
      }} id="previewBox">
        <h2>{loungeName || '[Lounge Name]'}</h2>
        <p>
          Primary color preview: 
          <span 
            style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              background: primaryColor,
              marginLeft: '10px'
            }}
          />
        </p>
        <p>Selected Theme: {flavorTheme}</p>
      </div>
    </div>
  );
}
