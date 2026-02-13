import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeTransition = ({ transitionTheme }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [animationType, setAnimationType] = useState(null); // 'sunset' or 'sunrise'

  useEffect(() => {
    if (!transitionTheme) {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 800);
      return () => clearTimeout(timer);
    }

    const type = transitionTheme === 'dark' ? 'sunset' : 'sunrise';
    setAnimationType(type);
    setShouldRender(true);

    // Delay kecil biar animasi terasa lebih natural
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });

    // Cleanup
    return () => {
      setIsAnimating(false);
    };
  }, [transitionTheme]);

  if (!shouldRender) return null;

  const isSunset = animationType === 'sunset';

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden
        transition-opacity duration-700 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Background Sky */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
          isSunset
            ? 'bg-gradient-to-br from-blue-600 via-orange-500 to-indigo-950'
            : 'bg-gradient-to-br from-indigo-950 via-sky-700 to-blue-400'
        }`}
      />

      {/* Glow / Atmosphere */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isAnimating ? 'opacity-30' : 'opacity-0'
        } ${isSunset ? 'bg-orange-600/20' : 'bg-blue-300/20'}`}
        style={{ filter: 'blur(120px)' }}
      />

      <div className="relative w-full h-full">
        {/* Sun */}
        <div
          className={`absolute pointer-events-none transition-all duration-[1200ms] ease-in-out transform-gpu ${
            isAnimating
              ? isSunset
                ? 'translate-x-[60%] translate-y-[60%] scale-75 opacity-0' // sunset → turun kanan bawah
                : 'translate-x-0 translate-y-0 scale-100 opacity-100'     // sunrise → ke tengah
              : isSunset
              ? 'translate-x-[-60%] translate-y-[60%] scale-75 opacity-0' // mulai dari kiri bawah
              : 'translate-x-[-60%] translate-y-[60%] scale-75 opacity-0' // mulai dari kiri bawah
          }`}
          style={{ left: '50%', top: '50%', translate: '-50% -50%' }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-[80px] opacity-70 animate-pulse-slow" />
            <div className="relative p-10 bg-gradient-to-br from-amber-50 to-amber-300 rounded-full shadow-[0_0_120px_rgba(251,191,36,0.95)] border-4 border-white/40">
              <Sun className="w-28 h-28 text-amber-700 fill-amber-500" />
            </div>
          </div>
        </div>

        {/* Moon */}
        <div
          className={`absolute pointer-events-none transition-all duration-[1200ms] ease-in-out transform-gpu ${
            isAnimating
              ? isSunset
                ? 'translate-x-0 translate-y-0 scale-100 opacity-100'     // sunset → ke tengah
                : 'translate-x-[60%] translate-y-[60%] scale-75 opacity-0' // sunrise → turun kanan bawah
              : isSunset
              ? 'translate-x-[-60%] translate-y-[60%] scale-75 opacity-0' // mulai dari kiri bawah
              : 'translate-x-0 translate-y-0 scale-100 opacity-100'       // sudah di tengah, lalu turun
          }`}
          style={{ left: '50%', top: '50%', translate: '-50% -50%' }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-400 rounded-full blur-[70px] opacity-50 animate-pulse-slow" />
            <div className="relative p-10 bg-gradient-to-br from-indigo-50 to-indigo-200 rounded-full shadow-[0_0_100px_rgba(129,140,248,0.8)] border-4 border-white/30">
              <Moon className="w-28 h-28 text-indigo-700 fill-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stars (lebih kelihatan saat menuju malam) */}
      {(isSunset || (!isAnimating && !isSunset)) && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2.5 + 1}px`,
                height: `${Math.random() * 2.5 + 1}px`,
                animationDelay: `${Math.random() * 4}s`,
                opacity: Math.random() * 0.6 + 0.4,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeTransition;