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
  const completedSteps = steps.slice(0, currentIndex)
  const currentStep = steps[currentIndex]

  return (
    <div className="relative w-full flex flex-col items-center justify-start min-h-[300px]">
      <div className="relative w-full flex flex-col items-center justify-start">
        <AnimatePresence>
          {completedSteps.map((step, index) => {
            const offsetY = index * 40 
            const scale = 1 - index * 0.02
            const brightness = 1 - index * 0.08

            return (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: offsetY,
                  scale,
                  zIndex: completedSteps.length - index,
                  filter: `brightness(${brightness}) blur(${index * 0.3}px)`,
                }}
                exit={{ opacity: 0, y: 60, scale: 0.9 }}
                transition={{
                  type: "spring",
                  damping: 22,
                  stiffness: 250,
                  mass: 0.7,
                }}
                className="absolute w-full transform-gpu"
                style={{
                  transformOrigin: "center top",
                  perspective: 1000,
                }}
              >
                <StepItem
                  step={step}
                  index={index}
                  explorerBase={explorerBase}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {currentStep && (
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: (completedSteps.length * 40) + 100, 
            scale: 1,
            zIndex: 999,
            filter: "brightness(1) blur(0px)",
          }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 200,
          }}
          className="absolute w-full transform-gpu"
          style={{
            transformOrigin: "center top",
            perspective: 1000,
          }}
        >
          <StepItem
            step={currentStep}
            index={currentIndex}
            explorerBase={explorerBase}
          />
        </motion.div>
      )}
    </div>
  )
}