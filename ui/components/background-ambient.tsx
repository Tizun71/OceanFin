"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// The shader touches window/WebGL on mount, so it is client-only. Loading it
// lazily also keeps the GLSL out of the initial bundle — the CSS layer below
// paints immediately and the canvas fades in over it once ready.
const ShaderBackground = dynamic(
  () => import("@/components/ui/oceanic-depths").then((m) => m.ShaderBackground),
  { ssr: false },
)

/**
 * Ambient background.
 *
 * Layer 1 (CSS): a static ocean gradient. Always painted. This was the whole
 * background before the shader landed, and it now doubles as the fallback — if
 * WebGL is missing, blocked by policy, or the browser refuses a new context,
 * the page still has a finished background rather than a flat fill.
 *
 * Layer 2 (WebGL): the shader, fading in on top once its context is live.
 *
 * Both replaced the original 2.2MB looping <video>, which blocked first paint,
 * requested a .webm that does not exist in /public/videos, decoded on the GPU
 * continuously behind two opaque scrims, and ignored prefers-reduced-motion.
 * The shader ships no bytes over the network, pauses when the tab is hidden or
 * the canvas leaves the viewport, and draws a single static frame when the
 * user has asked for reduced motion.
 */
export function BackgroundAmbient() {
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  // The canvas mounts before its first draw. Waiting two frames before fading
  // it in avoids a flash of undrawn (black) canvas over the gradient.
  useEffect(() => {
    if (failed) return
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    )
    return () => cancelAnimationFrame(id)
  }, [failed])

  return (
    <div aria-hidden className="fixed inset-0 -z-0 pointer-events-none overflow-hidden">
      {/* CSS layer — paints on the first frame and stays as the fallback. */}
      <div className="absolute inset-0 bg-ocean-depth" />
      <div className="absolute inset-0 bg-ocean-caustics" />

      {!failed && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          <ShaderBackground
            className="h-full w-full"
            // Field units of drift per viewport scrolled. Small on purpose:
            // the background should read as ambient depth, not as a second
            // scrolling surface competing with the content.
            parallax={0.16}
            onContextFail={() => setFailed(true)}
          />
        </div>
      )}

      {/* Grain sits above both layers so the shader gets the same surface
          treatment as the CSS fallback and the two match in texture. */}
      <div className="absolute inset-0 bg-grain opacity-[0.045]" />
    </div>
  )
}
