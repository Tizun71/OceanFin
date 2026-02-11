export default function Sidebar() {
  return (
    <div className="border-r border-neutral-800 p-4 space-y-6">
      
      <div>
        <p className="text-xs uppercase text-neutral-500 mb-3">
          Hydration
        </p>

        <button className="w-full rounded-xl px-3 py-2 hover:bg-neutral-800">
          Swap
        </button>

        <button className="w-full rounded-xl px-3 py-2 hover:bg-neutral-800">
          Borrow
        </button>
      </div>

      <div>
        <p className="text-xs uppercase text-neutral-500 mb-3">
          Bifrost
        </p>

        <button className="w-full rounded-xl px-3 py-2 bg-neutral-800">
          Lend
        </button>
      </div>

    </div>
  )
}
