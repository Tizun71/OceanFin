'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      repeat: 0,
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => setIsLoading(false)
        });
      }
    });

    // Animate logo entrance
    tl.from(logoRef.current, {
      scale: 0.5,
      opacity: 0,
      rotation: -15,
      duration: 1,
      ease: "back.out(1.7)",
    });

    // Floating animation for logo
    gsap.to(logoRef.current, {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    // Animate progress bar
    tl.fromTo(
      progressBarRef.current,
      { width: "0%" },
      {
        width: "100%",
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: function () {
          if (percentageRef.current) {
            const progress = Math.round(this.progress() * 100);
            percentageRef.current.textContent = `${progress}%`;
          }
        },
      },
      "-=0.5"
    );

    return () => {
      tl.kill();
      gsap.killTweensOf('*');
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#001F2D]">
      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative w-48 h-48 flex items-center justify-center"
      >

        <div className="relative w-32 h-32">
          <Image
            src="/logo-ocean-fin.svg"
            alt="Ocean Fin"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full -z-10"></div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 w-64 space-y-3">
        <div className="h-1.5 bg-border/30 rounded-full overflow-hidden backdrop-blur-sm">
          <div className="h-full bg-gradient-to-r from-accent via-accent-light to-secondary rounded-full shadow-[0_0_20px_rgba(0,194,203,0.5)]"
            style={{ width: '0%' }}
            ref={progressBarRef}></div>
        </div>

      </div>

      {/* Loading Text */}
      <p className="mt-8 text-white text-center text-lg font-light tracking-wide drop-shadow-lg">
        Diving into the Ocean...
      </p>

      {/* Animated dots */}
      <div className="mt-6 flex gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-cyan-300 opacity-60"
            style={{
              animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
