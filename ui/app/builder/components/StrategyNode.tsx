type Props = {
  protocol: string
  type: string
}

export default function StrategyNode({ protocol, type }: Props) {
  return (
    <div className="bg-neutral-800 rounded-2xl p-6 w-72 shadow-xl border border-neutral-700">
      
      <p className="text-sm text-neutral-400">
        {protocol}
      </p>

      <h3 className="text-lg font-semibold mt-1">
        {type}
      </h3>

      <div className="mt-4 flex justify-between text-sm">
        <span>4</span>
        <span>→</span>
        <span>5</span>
      </div>

    </div>
  )
}
