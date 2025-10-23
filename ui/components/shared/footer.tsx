export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-cyan-500/10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 h-[30px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-semibold tracking-wide">OceanFin</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300/70">
              v1.0.0
            </span>
          </div>
          <span className="text-[11px] text-gray-500">
            © {new Date().getFullYear()} — All rights reserved
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5 text-gray-400 text-sm">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            Twitter
          </a>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            Discord
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Bottom subtle cyan glow */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
    </footer>
  )
}
