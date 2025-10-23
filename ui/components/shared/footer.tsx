import { Twitter, Github, MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-black/90 backdrop-blur-md border-t border-cyan-500/10 py-2 shadow-[0_0_20px_rgba(0,255,255,0.08)]">
      {/* Top Glow Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      <div className="max-w-[1920px] mx-auto px-6 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-extrabold text-cyan-400 tracking-wide drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]">
            OceanFin
          </h2>
          <span className="text-sm px-3 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300/80 font-medium">
            v1.0.0
          </span>
          <span className="text-sm text-gray-400 ml-3">
            © {new Date().getFullYear()} — All rights reserved
          </span>
        </div>

        {/* RIGHT (icons) */}
        <div className="flex items-center gap-6 text-gray-400">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-all duration-300"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-all duration-300"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* Bottom Glow Line */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
    </footer>
  )
}
