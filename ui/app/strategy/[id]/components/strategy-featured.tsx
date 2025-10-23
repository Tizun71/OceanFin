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

  return (
    <div className="h-full p-6 flex items-center justify-center">
      <div className="relative w-[800px] aspect-square perspective-[2000px] [transform-style:preserve-3d] [transform:rotateX(12deg)_rotateY(-12deg)]">
        <div className="grid grid-cols-2 gap-6 h-full">
          {featured.map((item, idx) => (
            <div key={idx} 
              className={`relative [transform-style:preserve-3d] aspect-square ${
                idx === 0 ? '[transform:translateZ(0px)]' : 
                idx === 1 ? '[transform:translateZ(-20px)_translateX(-20px)]' :
                idx === 2 ? '[transform:translateZ(-20px)_translateY(-20px)]' :
                '[transform:translateZ(-40px)_translate(-20px,-20px)]'
              }`}
            >
              <TiltGlowCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TiltGlowCard({ item }: { item: any }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6

    setRotate({ x: rotateX, y: rotateY })
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 })
    setGlowPos({ x: 50, y: 50 })
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
      }}
      transition={{ type: "spring", stiffness: 180, damping: 25 }}
      className="relative rounded-xl overflow-hidden border border-accent/20 transition-all duration-300 will-change-transform backdrop-blur-sm"
      style={{
        transformStyle: "preserve-3d",
        background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(56,189,248,0.2), rgba(15,23,42,0.8) 70%), linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(56,189,248,0.1))`
      }}
    >
      {/* Image background */}
      <div className="absolute inset-0">
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Plasma border (animated gradient line) */}
      <div className="absolute inset-0 rounded-xl pointer-events-none">
        <div
          className="absolute inset-0 rounded-xl border-[1px] border-transparent"
          style={{
            background: `conic-gradient(from 180deg at ${glowPos.x}% ${glowPos.y}%, rgba(56,189,248,0.3), rgba(56,189,248,0.05), rgba(56,189,248,0.3))`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 p-6 aspect-square flex flex-col justify-end"
        style={{
          transform: "translateZ(30px)",
        }}
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-accent/10 text-accent/90 px-2.5 py-1 rounded-full mb-2 w-fit backdrop-blur-sm">
          {item.label}
        </span>
        <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          {item.title}
        </h3>
        <p className="text-sm text-gray-300 line-clamp-2">{item.desc}</p>
      </div>
    </motion.div>
  )
}
