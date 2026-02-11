export default function ConfigPanel() {
  return (
    <div className="border-l border-neutral-800 p-6 space-y-6 bg-neutral-950">
      
      <div>
        <p className="text-xs uppercase text-neutral-500 mb-2">
          Token In
        </p>

        <select className="w-full bg-neutral-800 p-3 rounded-xl">
          <option>USDC</option>
          <option>DOT</option>
        </select>

        <input
          type="number"
          placeholder="Enter amount"
          className="w-full mt-3 bg-neutral-800 p-3 rounded-xl"
        />
      </div>

      <div>
        <p className="text-xs uppercase text-neutral-500 mb-2">
          Token Out
        </p>

        <select className="w-full bg-neutral-800 p-3 rounded-xl">
          <option>USDC</option>
          <option>DOT</option>
        </select>

        <input
          disabled
          value="2"
          className="w-full mt-3 bg-neutral-800 p-3 rounded-xl opacity-60"
        />
      </div>

      <button className="w-full bg-indigo-600 hover:bg-indigo-500 transition rounded-2xl py-3 font-semibold">
        Create Strategy
      </button>

    </div>
  )
}
