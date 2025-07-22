import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <img
        src="/logo.png"
        alt="Hookah+ Logo"
        className="w-28 h-28 mb-6"
      />
      <h1 className="text-3xl sm:text-4xl font-bold text-center">
        The Future of Lounge Management Starts Here
      </h1>
      <button className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-300 transition">
        Launch Dashboard
      </button>
    </div>
  );
}

export default App;
