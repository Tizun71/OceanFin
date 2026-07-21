'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { usePreloader } from '@/providers/preloader-provider';

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);

  const { visible, hide } = usePreloader();

  useEffect(() => {
    if (!visible) return;
    const container = containerRef.current;
    const logo = logoRef.current;
    const progressBar = progressBarRef.current;
    const percentage = percentageRef.current;

    if (!container || !logo || !progressBar || !percentage) return;

    // Honour reduced-motion: skip the animation and hand off immediately.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      percentage.textContent = '100%';
      const t = window.setTimeout(hide, 400);
      return () => window.clearTimeout(t);
    }

    let hasHidden = false;
    const tl = gsap.timeline();

    // Logo entrance with spring-like overshoot.
    tl.from(logo, { scale: 0.6, opacity: 0, rotation: -12, duration: 0.9, ease: 'back.out(1.7)' });

    // Ambient float + breathing glow (GPU transform/opacity only).
    const logoY = gsap.to(logo, { y: -8, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true });
    const glow = gsap.to('.logo-glow', { opacity: 0.6, scale: 1.25, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // Progress: scaleX transform instead of width for GPU compositing.
    tl.fromTo(
      progressBar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: function () {
          // @ts-ignore gsap tween `this`
          const p = Math.round(this.progress() * 100);
          percentage.textContent = `${p}%`;
          if (p >= 100 && !hasHidden) {
            hasHidden = true;
            gsap.to(container, { opacity: 0, scale: 1.04, duration: 0.6, ease: 'power2.in', onComplete: hide });
          }
        },
      },
      '-=0.4'
    );

    return () => {
      tl.kill();
      logoY.kill();
      glow.kill();
    };
  }, [visible, hide]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      role="status"
      aria-live="polite"
      aria-label="Loading Ocean Fin"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#001922]"
    >
      {/* Mesh gradient: two off-center radial pools instead of a flat fill. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 30% 25%, rgba(0,194,203,0.18), transparent 60%), radial-gradient(70% 60% at 78% 82%, rgba(0,120,150,0.20), transparent 62%)',
        }}
      />
      {/* Grain overlay to break digital flatness. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Logo */}
      <div className="relative flex h-40 w-40 items-center justify-center">
        <div ref={logoRef} className="relative h-28 w-28">
          <Image src="/logo-ocean-fin.svg" alt="" fill className="object-contain drop-shadow-2xl" priority />
        </div>
        <div className="logo-glow absolute inset-0 -z-10 rounded-full bg-accent/25 blur-3xl opacity-40" />
      </div>

      {/* Progress */}
      <div className="mt-10 flex w-64 flex-col gap-2">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            ref={progressBarRef}
            className="h-full origin-left rounded-full bg-gradient-to-r from-accent via-accent-light to-secondary shadow-[0_0_16px_rgba(0,194,203,0.6)]"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium tracking-wide text-white/70">
          <span>Diving into the ocean</span>
          <span ref={percentageRef} className="tabular-nums text-white/90">0%</span>
        </div>
      </div>
    </div>
  );
}
