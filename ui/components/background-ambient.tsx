/**
 * Ambient background — replaces the 2.2MB looping <video>.
 *
 * Why the video went:
 *  - 2.2MB mp4 on every visit, before any content painted.
 *  - The <source> pointed at a .webm that does not exist in /public/videos,
 *    so every load also fired a 404.
 *  - It decoded continuously on the GPU (and drained battery on laptops and
 *    phones) while sitting behind two stacked overlays that hid ~70% of it.
 *  - autoPlay video ignores prefers-reduced-motion.
 *
 * What replaces it: layered radial gradients in the existing ocean palette plus
 * a grain overlay. Costs zero network requests, paints on the first frame, and
 * the drift stops entirely under prefers-reduced-motion.
 */
export function BackgroundAmbient() {
  return (
    <div aria-hidden className="fixed inset-0 -z-0 pointer-events-none overflow-hidden">
      {/* Base wash. A flat fill would read as dead space; the deep-teal
          vignette at the bottom keeps the "underwater" depth cue the video
          was carrying. */}
      <div className="absolute inset-0 bg-ocean-depth" />

      {/* Two slow-drifting light sources. Offset and different sizes so the
          composition never resolves into a symmetric centred glow. */}
      <div className="absolute inset-0 bg-ocean-caustics" />

      {/* Grain breaks up the gradient banding that large smooth ramps show on
          8-bit displays, and keeps the surface from feeling like flat vector. */}
      <div className="absolute inset-0 bg-grain opacity-[0.045]" />
    </div>
  )
}
