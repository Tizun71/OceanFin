"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ExternalLinkIcon,
  Loader2Icon,
} from "lucide-react";
import Image from "next/image";
import { ExecutionStep } from "./types";

interface StepStackProps {
  steps: ExecutionStep[];
  currentStep: number;
  allStepsCompleted: boolean;
}

export const CARD_HEIGHT = 50;
export const CARD_OFFSET = 100;

export default function StepStack({ steps, currentStep, allStepsCompleted }: StepStackProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardRefs.current[currentStep];
    const container = containerRef.current;
    if (!element || !container) return;

    const elRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const currentScroll = container.scrollTop;
    const relativeTop = elRect.top - containerRect.top;
    const deltaToCenter =
      relativeTop - (container.clientHeight / 2 - elRect.height / 2);
    const targetScroll = currentScroll + deltaToCenter;

    const duration = 800;
    let startTime: number | null = null;

    const easing = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);

      container.scrollTop =
        currentScroll + (targetScroll - currentScroll) * eased;

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [currentStep]);

  return (
    <div
      ref={containerRef}
      className="
        custom-scroll
        relative flex items-center justify-center pb-2 h-full overflow-y-auto
        px-4 -mx-4 py-2 -my-2
      "
    >
      <div className="relative w-full max-w-md h-[30vh]">
        <div
          className="relative"
          style={{
            height: `${steps.length * CARD_OFFSET + CARD_HEIGHT}px`,
          }}
        >
          <AnimatePresence>
            {steps.map((step, index) => {
              const isActive = index === currentStep && !allStepsCompleted;
              const isCompleted = index < currentStep;
              const isPending = index > currentStep;

              let yPosition = index * CARD_OFFSET;

              // Add extra spacing after active step
              if (index > currentStep) {
                yPosition += 50;
              }

              if (hoveredCard !== null) {
                if (index < hoveredCard) {
                  // Cards above hovered card move up
                  yPosition -= 50;
                } else if (index > hoveredCard) {
                  // Cards below hovered card move down
                  yPosition += 50;
                }
              }

              return (
                <motion.div
                  key={index}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  initial={{ y: yPosition, opacity: 1 }}
                  animate={{ y: yPosition, opacity: 1 }}
                  exit={{ y: yPosition - 400, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="absolute top-0 left-0 right-0 will-change-transform"
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    className={`rounded-xl border-2 p-4 transition-all duration-300 flex flex-col cursor-pointer backdrop-blur-sm relative overflow-hidden ${
                      hoveredCard === index ? "shadow-xl scale-105" : ""
                    }`}
                    style={{
                      background: isActive
                        ? "linear-gradient(to bottom, var(--accent) 0%, var(--accent) 50%, rgba(0, 166, 166, 0.15) 100%)"
                        : isCompleted
                        ? "linear-gradient(to bottom, var(--secondary) 0%, var(--secondary) 50%, rgba(0, 127, 140, 0.15) 100%)"
                        : "linear-gradient(to bottom, var(--card) 0%, var(--card) 50%, rgba(255, 255, 255, 0.02) 100%)",
                      borderColor: isActive
                        ? "var(--accent)"
                        : isCompleted
                        ? "var(--secondary-light)"
                        : "var(--border)",
                      boxShadow: isActive
                        ? "0 10px 15px -3px rgba(0, 166, 166, 0.3)"
                        : isCompleted
                        ? "0 4px 6px -1px rgba(0, 127, 140, 0.2)"
                        : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          </motion.div>
                        ) : isActive ? (
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{
                              duration: 1.5,
                            }}
                          >
                            <Loader2Icon className="h-6 w-6 text-white animate-spin" />
                          </motion.div>
                        ) : (
                          <Circle className="h-6 w-6 text-foreground/40" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h3
                            className={`font-semibold text-sm transition-colors ${
                              isActive
                                ? "text-white"
                                : isCompleted
                                ? "text-white"
                                : "text-foreground/80"
                            }`}
                          >
                            {step.title}
                          </h3>
                          {isCompleted && step.txHash && (
                            <a
                              href={`https://hydration.subscan.io/extrinsic/${step.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:scale-110 transition-transform"
                            >
                              <ExternalLinkIcon className="h-4 w-4 text-white/70 hover:text-white" />
                            </a>
                          )}
                        </div>
                        <div
                          className={`text-xs flex flex-row items-center gap-2 mt-2 transition-colors ${
                            isActive
                              ? "text-white/95"
                              : isCompleted
                              ? "text-white/95"
                              : "text-foreground/60"
                          }`}
                        >
                          {step.fromToken && step.fromAmount && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Image
                                  src={step.fromToken.icon}
                                  alt={step.fromToken.symbol}
                                  width={16}
                                  height={16}
                                  className="rounded-full"
                                />
                                <span className="font-medium text-sm">
                                  {step.fromAmount} {step.fromToken.symbol}
                                </span>
                              </div>
                              <span className="text-lg">→</span>
                            </>
                          )}

                          {step.toToken && step.toAmount && (
                            <div className="flex items-center gap-1.5">
                              <Image
                                src={step.toToken.icon}
                                alt={step.toToken.symbol}
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                              <span className="font-medium text-sm">
                                {step.toAmount} {step.toToken.symbol}
                              </span>
                            </div>
                          )}

                          {!step.fromToken && !step.toToken && (
                            <span className="text-xs">{step.description}</span>
                          )}
                        </div>

                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 text-xs font-medium text-white"
                          >
                            <motion.span
                              animate={{ opacity: [1, 0.7, 1] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                            >
                              Executing...
                            </motion.span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
