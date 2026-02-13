"use client"

import { Handle, Position } from "reactflow"
import { Trash2 } from "lucide-react"

export default function DefiNode({ data }: any) {
  return (
    <div className="relative bg-[#151522] border border-[#2a2a3d] rounded-2xl w-[220px] text-white shadow-lg hover:shadow-xl transition-all duration-200">

      {/* Top Handle */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-none"
      />
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a3d]">
        <div>
          <p className="text-xs text-neutral-400">
            {data.module?.name}
          </p>
          <p className="font-semibold text-sm">
            {data.action?.name}
          </p>
        </div>

        {/* Optional delete */}
        {data.onDelete && (
          <button
            onClick={() => data.onDelete(data.id)}
            className="text-neutral-500 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 text-xs text-neutral-400 space-y-1">
        <div className="flex justify-between">
          <span>Module ID</span>
          <span className="text-neutral-300">{data.module?.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Action ID</span>
          <span className="text-neutral-300">{data.action?.id}</span>
        </div>

        {/* Status badge */}
        <div className="pt-2">
          <span className="inline-block px-2 py-1 text-[10px] bg-green-600/20 text-green-400 rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-none"
      />
    </div>
  )
}
