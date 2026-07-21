"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Action, Module } from "@/types/defi";
import { resolveAgentIcon } from "@/lib/iconMap";

/** Circular protocol/agent logo shown beside each module in the library. */
function AgentIcon({ name }: { name?: string }) {
  const src = resolveAgentIcon(name);
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "Protocol"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[11px] font-bold text-accent-light">
          {(name || "?").charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}

interface SidebarProps {
  modules: Module[];
  onSelect: (module: Module, action: Action) => void;
}

export default function Sidebar({ modules, onSelect }: SidebarProps) {
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (modules && modules.length > 0) {
      setOpenModules(modules.map((m) => m.id));
    }
  }, [modules]);

  const toggleModule = (id: string) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  // Search used to match module names only, so typing an action name ("borrow")
  // hid every module that offered it.
  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return modules;

    return modules.filter(
      (module) =>
        module.name.toLowerCase().includes(query) ||
        module.actions?.some((action) => action.name.toLowerCase().includes(query)),
    );
  }, [modules, search]);

  return (
    <nav
      aria-label="Module library"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-1"
    >
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Module library</h2>
          <span className="text-xs tabular-nums text-muted-foreground-subtle">
            {modules.length}
          </span>
        </div>

        <div className="relative">
          <Search
            size={14}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground-subtle"
          />
          <input
            type="search"
            aria-label="Search modules and actions"
            placeholder="Search modules or actions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-1 py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground-subtle/70 hover:border-border-strong focus:border-accent-light/60"
          />
        </div>
      </div>

      <div className="custom-scroll flex-1 space-y-5 overflow-y-auto p-4">
        {modules.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No modules available on this chain yet. Switch chains from the header
            to see what can be built.
          </p>
        ) : filteredModules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing matches &ldquo;{search}&rdquo;.
          </p>
        ) : (
          filteredModules.map((module) => {
            const isOpen = openModules.includes(module.id);
            const panelId = `module-panel-${module.id}`;

            return (
              <section key={module.id}>
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors duration-200 hover:bg-surface-2 ${
                    isOpen ? "text-accent-light" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AgentIcon name={module.name} />
                  <span className="flex-1 truncate text-left text-[13px] font-semibold tracking-tight">
                    {module.name}
                  </span>
                  <ChevronDown
                    size={14}
                    aria-hidden
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <ul id={panelId} className="mt-3 space-y-1.5">
                    {module.actions && module.actions.length > 0 ? (
                      module.actions.map((action) => (
                        <li key={action.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(module, action)}
                            className="group flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-accent/30 hover:bg-surface-2 hover:text-foreground active:translate-y-px"
                          >
                            {action.name}
                            <Plus
                              size={14}
                              aria-hidden
                              className="shrink-0 text-accent-light opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            />
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 text-sm text-muted-foreground-subtle">
                        No actions
                      </li>
                    )}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </nav>
  );
}
