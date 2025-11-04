"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function FeaturedStrategies() {
  const featured = [
    {
      title: "Plasma Strategy",
      desc: "Explore trading strategies on Plasma chain with advanced AI optimization and auto-balancing yield execution.",
      image: "https://images.unsplash.com/photo-1643000867361-cd545336249b?auto=format&fit=crop&w=1920&q=80",
      label: "Plasma",
    },
    {
      title: "Point Farming",
      desc: "Collect ecosystem points seamlessly across top DeFi protocols, all simplified into one unified dashboard.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
      label: "Point",
    },
    {
      title: "HyperEVM Point Farming",
      desc: "Farm HyperEVM ecosystem points effortlessly with INFINIT protocol and adaptive AI task routing.",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1920&q=80",
      label: "HyperEVM",
    },
    {
      title: "Cross-Chain Yield Optimizer",
      desc: "Maximize returns with AI-driven cross-chain yield optimization and automated rebalancing strategies.",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1920&q=80",
      label: "Yield",
    },
  ];

  const wrapperTransforms = [
    "translateZ(0px)",
    "translateZ(-20px) translateX(-15px)",
    "translateZ(-20px) translateY(-15px)",
    "translateZ(-25px) translate(-10px,-10px)" 
  ];

  return (
    <div className="h-full p-2 flex items-center justify-center">
      <div className="relative w-full max-w-[500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] aspect-square perspective-[1200px] [transform-style:preserve-3d] [transform:rotateX(8deg)_rotateY(-8deg)] scale-[0.8] max-h-[80vh]">
        <div className="grid grid-cols-2 gap-2 h-full"> 
          {featured.map((item, idx) => (
            <MotionCardWrapper
              key={idx}
              transform={wrapperTransforms[idx]}
              item={item}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function MotionCardWrapper({ item, transform }: { item: any; transform: string }) {
  const [hovered, setHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotate({
      x: ((y - centerY) / centerY) * -6,
      y: ((x - centerX) / centerX) * 6,
    });
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 });
    setHovered(false);
    setGlowPos({ x: 50, y: 50 });
  }

  return (
    <motion.div
      className="relative w-full h-full [transform-style:preserve-3d] cursor-pointer"
      style={{ transform: transform }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
        scale: hovered ? 1.15 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <TiltGlowCard item={item} glowPos={glowPos} hovered={hovered} />
    </motion.div>
  )
}

function TiltGlowCard({ item, glowPos, hovered }: { item: any; glowPos: { x: number; y: number }; hovered: boolean }) {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-accent/20 transition-all duration-200 backdrop-blur-sm w-full h-full"
      style={{
        transformStyle: "preserve-3d",
        background: hovered
          ? `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(56,189,248,0.4), rgba(15,23,42,0.6) 70%), linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(56,189,248,0.15))`
          : `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(56,189,248,0.2), rgba(15,23,42,0.8) 70%), linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(56,189,248,0.1))`
      }}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col justify-end h-full" style={{ transform: "translateZ(30px)" }}>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-accent/10 text-accent/90 px-2.5 py-1 rounded-full mb-2 w-fit backdrop-blur-sm">{item.label}</span>
        <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{item.title}</h3>
        <p className="text-sm text-gray-300 line-clamp-2">{item.desc}</p>
      </div>
    </div>
  )
}
