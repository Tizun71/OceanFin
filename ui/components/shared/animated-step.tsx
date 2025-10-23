"use client"

import { motion, AnimatePresence } from "framer-motion"
import { StepItem } from "./step-item"
import type { ExecutionStep } from "./types"

interface AnimatedStepProps {
  steps: ExecutionStep[]
  currentIndex: number
  explorerBase?: string
}

export function AnimatedStep({ steps, currentIndex, explorerBase }: AnimatedStepProps) {
  return (
    <div className="w-full min-h-[200px] flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {steps.map((step, index) => {
          if (index > currentIndex) return null

          const isCompleted = step.status === "completed"
          const isCurrent = index === currentIndex

          return (
            <motion.div
              key={step.id}
              initial={{
                y: 60,
                opacity: 0,
                scale: 0.9,
                rotateX: -10,
              }}
              animate={{
                y: isCurrent ? 0 : -index * 40,
                opacity: 1,
                scale: isCurrent ? 1 : 0.94,
                rotateX: isCurrent ? 0 : -5,
                zIndex: isCurrent ? steps.length + 1 : steps.length - index,
                filter: isCurrent ? "brightness(1) blur(0px)" : "brightness(0.8) blur(0.5px)",
              }}
              exit={{
                y: -60,
                opacity: 0,
                scale: 0.85,
                rotateX: 10,
                filter: "blur(2px)",
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 220,
                mass: 0.7,
              }}
              className={`absolute w-full transform-gpu ${
                isCompleted ? "cursor-pointer hover:-translate-y-3 hover:scale-[1.02] transition-transform" : ""
              }`}
              style={{
                transformOrigin: "center bottom",
                perspective: 1000,
              }}
            >
              <div className="drop-shadow-lg">
                <StepItem step={step} index={index} explorerBase={explorerBase} />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
