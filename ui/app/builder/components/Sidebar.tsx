"use client"

import { Action, Module } from "@/types/defi"


interface SidebarProps {
  modules: Module[]
  onSelect: (module: Module, action: Action) => void
}

export default function Sidebar({ modules, onSelect }: SidebarProps) {
  return (
    <div className="w-64 border-r border-neutral-800 p-4 space-y-6 overflow-y-auto">
      {modules.map((module) => (
        <div key={module.id}>
          <p className="text-xs uppercase text-neutral-500 mb-3">
            {module.name}
          </p>

          {module.actions && module.actions.length > 0 ? (
            module.actions.map((action) => (
              <button
                key={action.id}
                onClick={() => onSelect(module, action)}
                className="w-full rounded-xl px-3 py-2 hover:bg-neutral-800"
              >
                {action.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-neutral-600">No actions</p>
          )}
        </div>
      ))}
    </div>
  )
}
