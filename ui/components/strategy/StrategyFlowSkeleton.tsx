"use client";

import { motion } from "framer-motion";
import { Workflow, Sparkles } from "lucide-react";

export function StrategyFlowSkeleton() {
  return (
    <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/40 text-card-foreground rounded-xl border border-border p-5 shadow-lg shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <Workflow className="h-4 w-4" />
          <span className="text-sm font-semibold">Generating Strategy...</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-4 w-4 text-accent" />
          </motion.div>
        </div>
      </div>

      {/* Strategy Steps Skeleton */}
      <div className="space-y-3 mb-4">
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/10"
          >
            {/* Step Number */}
            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                className="w-2 h-2 bg-accent/50 rounded-full"
              />
            </div>

            {/* Step Content */}
            <div className="flex-1 space-y-2">
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
                className="h-3 bg-white/10 rounded w-3/4"
              />
              <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.15 }}
                className="h-2 bg-white/5 rounded w-1/2"
              />
            </div>

            {/* Token Icon Skeleton */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full"
            />
          </motion.div>
        ))}
      </div>

      {/* Estimated Gas Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg border border-white/10 mb-4"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-3 h-3 bg-white/10 rounded"
          />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-3 w-20 bg-white/10 rounded"
          />
        </div>
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-3 w-12 bg-white/10 rounded"
        />
      </motion.div>

      {/* Action Button Skeleton */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <motion.div
          animate={{ 
            background: [
              "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
              "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
              "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-10 w-32 rounded-lg border border-white/10"
        />
      </motion.div>

      {/* Animated Shimmer Effect */}
      <motion.div
        animate={{ x: [-100, 400] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-20 pointer-events-none"
        style={{ transform: "skewX(-20deg)" }}
      />

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-2 left-5 text-xs text-white/40"
      >
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Analyzing optimal strategy...
        </motion.span>
      </motion.div>
    </div>
  );
}