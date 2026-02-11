export default function Canvas() {
  return (
    <div className="w-[650px] h-[520px] bg-neutral-900 border border-neutral-800 rounded-2xl relative">
      
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#1f2937_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Node 1 */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
        <p className="text-sm text-neutral-400">Hydration</p>
        <p className="text-lg font-semibold mt-1">Swap</p>
      </div>

      {/* Node 2 */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
        <p className="text-sm text-neutral-400">Bifrost</p>
        <p className="text-lg font-semibold mt-1">Lend</p>
      </div>

    </div>
  )
}
