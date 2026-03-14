"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Show loader for 1.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    // Remove from DOM after fade out animation
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`loader-overlay ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative flex items-center justify-center">
            {/* Myanmar-inspired geometric pattern ring */}
            <div className="absolute h-24 w-24 rounded-full border-2 border-slate-100 border-t-primary-600 animate-spin transition-all duration-1000" />
            <div className="absolute h-20 w-20 rounded-full border-2 border-slate-50 border-b-secondary-500 animate-[spin_2s_linear_infinite]" />
            
            <div className="h-14 w-14 flex items-center justify-center z-10 transition-transform duration-500 hover:scale-110">
                <svg className="h-12 w-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#loader-globe-clip)">
                    <path d="M50 50L20 20H50V50Z" fill="#3182CE"/>
                    <path d="M50 50L80 20H50V50Z" fill="#ECC94B"/>
                    <path d="M50 50L20 80H50V50Z" fill="#48BB78"/>
                    <path d="M50 50L80 80H50V50Z" fill="#E53E3E"/>
                  </g>
                  <clipPath id="loader-globe-clip"><circle cx="50" cy="50" r="32"/></clipPath>
                  <circle cx="50" cy="35" r="8" fill="#ECC94B"/>
                  <circle cx="65" cy="50" r="8" fill="#E53E3E"/>
                  <circle cx="50" cy="65" r="8" fill="#48BB78"/>
                  <circle cx="35" cy="50" r="8" fill="#3182CE"/>
                </svg>
            </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
            <h2 className="text-lg font-black tracking-tight text-slate-900">
                Together <span className="text-[#D69E2E]">Myanmar</span>
            </h2>
            <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-primary-600 animate-pulse" />
                <div className="h-1 w-1 rounded-full bg-primary-600 animate-pulse [animation-delay:0.2s]" />
                <div className="h-1 w-1 rounded-full bg-primary-600 animate-pulse [animation-delay:0.4s]" />
            </div>
        </div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern opacity-[0.05] pointer-events-none" />
    </div>
  );
}
