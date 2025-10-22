export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-20 border-t border-border/50 bg-gradient-to-t from-background via-background/80 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 mb-8">
          {/* Brand section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-accent">OceanFin</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Building modern web experiences with cutting-edge technology and design.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "Security", "Roadmap"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              {["Privacy", "Terms", "Cookies", "License"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">© {currentYear} Your Brand. All rights reserved.</p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {[
              { name: "Twitter", icon: "𝕏" },
              { name: "GitHub", icon: "◆" },
              { name: "LinkedIn", icon: "◇" },
              { name: "Discord", icon: "◈" },
            ].map((social) => (
              <a
                key={social.name}
                href="#"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-card/50 border border-border/50 text-accent hover:bg-card hover:border-accent/50 hover:text-highlight transition-all duration-200 glow-teal"
                aria-label={social.name}
              >
                <span className="text-lg">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
    </footer>
  )
}
