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
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-[0_0_20px_rgba(0,0,0,0.3)]
        text-white
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
              bg-[#1b1b2c]
              border border-neutral-800
              text-sm
              focus:outline-none
              focus:ring-1 focus:ring-indigo-500
              placeholder:text-neutral-500
            "
          />
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {modules
          .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
          .map((module) => {
            const isOpen = openModules.includes(module.id);

            return (
              <div key={module.id}>
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="
                    w-full flex items-center justify-between
                    text-xs uppercase tracking-wider
                    text-neutral-400
                    hover:text-white
                    transition
                  "
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
                            px-3 py-2 rounded-xl
                            bg-white/5
                            border border-white/10
                            backdrop-blur-md
                            text-sm
                            hover:bg-indigo-500/10
                            hover:border-indigo-400/40
                            transition-all duration-200
                          "
                        >
                          {action.name}
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
