"use client"

import { Layers } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [{ icon: Layers, label: "Strategy", href: "/" }]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-20 border-r border-border bg-card flex flex-col items-center py-6 gap-8">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-2 text-xs transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </aside>
  )
}
