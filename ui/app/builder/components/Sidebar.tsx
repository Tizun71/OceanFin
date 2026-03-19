"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Action, Module } from "@/types/defi";

interface SidebarProps {
  modules: Module[];
  onSelect: (module: Module, action: Action) => void;
}

export default function Sidebar({ modules, onSelect }: SidebarProps) {
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const toggleModule = (id: string) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  return (
    <div
      className="
        h-full flex flex-col
        glass
        rounded-2xl
        text-white
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold tracking-wide">Module Library</h2>

        {/* Search */}
        <div className="mt-3 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Search module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-9 pr-3 py-2 rounded-xl
              bg-white/5 
              border border-white/10
              text-sm text-cyan-50
              focus:outline-none
              focus:ring-2 focus:ring-primary/50
              focus:border-primary/50
              placeholder:text-muted/60
              transition-all
            "
          />
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
        {modules
          .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
          .map((module) => {
            const isOpen = openModules.includes(module.id);

            return (
              <div key={module.id}>
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className={`
                      w-full flex items-center justify-between
                      text-[11px] font-bold uppercase tracking-[0.15em]
                      transition-colors duration-300
                      ${isOpen ? "text-primary" : "text-muted hover:text-cyan-200"}
                  `}
                >
                  {module.name}

                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Actions */}
                {isOpen && (
                  <div className="mt-3 space-y-2">
                    {module.actions && module.actions.length > 0 ? (
                      module.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => onSelect(module, action)}
                          className="
                            w-full text-left
                            px-4 py-3 rounded-xl
                            ocean-card
                            bg-white/[0.03]
                            text-sm font-medium
                            text-cyan-50/80
                            hover:text-white
                            hover:bg-primary/10
                            group
                            flex items-center justify-between
                          "
                        >
                          {action.name}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary text-xs">
                             Add
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-600">No actions</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
