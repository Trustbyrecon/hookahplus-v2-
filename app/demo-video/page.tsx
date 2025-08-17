"use client";
import { useState, useEffect } from 'react';

export default function DemoVideoPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);

  const scenes = [
    {
      id: 0,
      title: "Opening Hook",
      duration: 5,
      description: "Hookah+ - Future of Lounge Sessions with AI-Powered Personalization",
      visual: "🌿",
      overlay: "HOOKAH+"
    },
    {
      id: 1,
      title: "QR Code Scan",
      duration: 8,
      description: "Customer scans QR code at table to start session",
      visual: "📱",
      overlay: "SCAN TO START"
    },
    {
      id: 2,
      title: "Flavor Personalization",
      duration: 12,
      description: "AI-powered flavor recommendations based on preferences",
      visual: "🍃",
      overlay: "AI RECOMMENDATIONS"
    },
    {
      id: 3,
      title: "Stripe Checkout",
      duration: 15,
      description: "Seamless payment processing with real-time confirmation",
      visual: "💳",
      overlay: "SECURE PAYMENT"
    },
    {
      id: 4,
      title: "Confirmation Ping",
      duration: 8,
      description: "Instant confirmation and lounge staff notification",
      visual: "✅",
      overlay: "PAYMENT CONFIRMED"
    },
    {
      id: 5,
      title: "Lounge Dashboard",
      duration: 15,
      description: "Real-time session monitoring and customer insights",
      visual: "📊",
      overlay: "LIVE DASHBOARD"
    },
    {
      id: 6,
      title: "Call to Action",
      duration: 7,
      description: "Start transforming your lounge today",
      visual: "🚀",
      overlay: "GET STARTED"
    }
  ];

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setVideoTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            setVideoTime(0);
            setCurrentScene(0);
            return 0;
          }
          
          // Update current scene based on time
          let accumulatedTime = 0;
          for (let i = 0; i < scenes.length; i++) {
            accumulatedTime += scenes[i].duration;
            if (newTime < accumulatedTime) {
              if (currentScene !== i) {
                setCurrentScene(i);
              }
              break;
            }
          }
          
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentScene, totalDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setVideoTime(0);
    setCurrentScene(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (videoTime / totalDuration) * 100;
  };

  const currentSceneData = scenes[currentScene];

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">Demo Video</h1>
          <p className="text-zinc-400 text-xl">90-second customer journey demonstration</p>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
          {/* Video Display */}
          <div className="relative bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-12 mb-8 min-h-[400px] flex items-center justify-center">
            {/* Scene Visual */}
            <div className="text-center">
              <div className="text-9xl mb-6 animate-pulse">{currentSceneData.visual}</div>
              <div className="text-4xl font-bold text-white mb-4">{currentSceneData.overlay}</div>
              <div className="text-xl text-zinc-300 max-w-2xl mx-auto">{currentSceneData.description}</div>
            </div>

            {/* Scene Progress Indicator */}
            <div className="absolute top-4 right-4 bg-black/50 rounded-lg px-3 py-2">
              <div className="text-sm text-white">
                Scene {currentScene + 1} of {scenes.length}
              </div>
            </div>

            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">▶️</div>
                  <div className="text-xl text-white">Click Play to Start Demo</div>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-100"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* Time and Controls */}
            <div className="flex items-center justify-between">
              <div className="text-zinc-400">
                {formatTime(videoTime)} / {formatTime(totalDuration)}
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleReset}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={handlePlayPause}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scene Breakdown */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Scene Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene, index) => (
              <div 
                key={scene.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  currentScene === index
                    ? 'border-teal-500 bg-teal-500/20'
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}
                onClick={() => {
                  setCurrentScene(index);
                  setVideoTime(scenes.slice(0, index).reduce((sum, s) => sum + s.duration, 0));
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{scene.visual}</div>
                  <div className="text-sm text-zinc-400">{scene.duration}s</div>
                </div>
                <h3 className="font-semibold text-white mb-1">{scene.title}</h3>
                <p className="text-sm text-zinc-400">{scene.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Video Script */}
        <div className="mt-12 bg-zinc-800 rounded-xl p-8 border border-zinc-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Video Script</h2>
          <div className="space-y-6">
            {scenes.map((scene, index) => (
              <div key={scene.id} className="flex gap-4">
                <div className="text-2xl font-bold text-teal-400 min-w-[60px]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{scene.title}</h3>
                    <span className="text-sm text-zinc-400">({scene.duration}s)</span>
                  </div>
                  <p className="text-zinc-300 mb-2">{scene.description}</p>
                  <div className="text-sm text-zinc-400">
                    <strong>Visual:</strong> {scene.visual} | <strong>Overlay:</strong> "{scene.overlay}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-teal-900 to-blue-900 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to See It Live?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Experience the interactive demo and see how Hookah+ transforms your lounge
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/demo-flow"
              className="bg-white text-teal-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🎯 Try Interactive Demo
            </a>
            <a
              href="/owner-cta"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-900 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🚀 Get Started
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
