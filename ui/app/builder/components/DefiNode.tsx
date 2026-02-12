import { Handle, Position } from "reactflow"

export default function DefiNode({ data }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 w-[180px] text-white">
      
      <p className="text-xs text-neutral-400">
        {data.module.name}
      </p>

      <p className="font-semibold">
        {data.action.name}
      </p>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

    </div>
  )
}
