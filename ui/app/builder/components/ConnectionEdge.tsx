"use client"

import React from "react"

type ConnectionEdgeProps = {
  from: { x: number; y: number }
  to: { x: number; y: number }
  animated?: boolean
  color?: string
}

export default function ConnectionEdge({
  from,
  to,
  animated = true,
  color = "#6b7280", 
}: ConnectionEdgeProps) {
  const width = Math.abs(to.x - from.x) || 2
  const height = Math.abs(to.y - from.y)

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: Math.min(from.x, to.x),
        top: Math.min(from.y, to.y),
      }}
      width={width + 20}
      height={height + 20}
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L6,3 z" fill={color} />
        </marker>
      </defs>

      <line
        x1={10}
        y1={0}
        x2={10}
        y2={height}
        stroke={color}
        strokeWidth="2"
        strokeDasharray="6 4"
        markerEnd="url(#arrow)"
        className={animated ? "animate-pulse" : ""}
      />
    </svg>
  )
}
