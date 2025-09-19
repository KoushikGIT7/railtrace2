import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        {/* Indian Railways Logo */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl p-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/8/83/Indian_Railways.svg" 
              alt="Indian Railways Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <div className="hidden text-blue-800 font-bold text-sm text-center">
              <div>INDIAN</div>
              <div>RAILWAYS</div>
            </div>
          </div>
          
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-40 h-40 border-2 border-white/20 rounded-full animate-pulse ${loading ? 'animate-ping' : ''}`} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-48 h-48 border border-white/10 rounded-full ${loading ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Rail<span className="text-orange-400">Trace</span>
          </h1>
          <p className="text-xl text-blue-100 font-medium">
            Digital Identity for Track Fittings
          </p>
          <p className="text-sm text-blue-200 opacity-75">
            Indian Railways • Ministry of Railways
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mt-12">
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-blue-200 text-sm mt-4 opacity-75">
            {loading ? 'Initializing System...' : 'Ready'}
          </p>
        </div>
      </div>
    </div>
  );
}