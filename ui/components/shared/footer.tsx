import Link from "next/link";
import { Github } from "lucide-react";

/** X (formerly Twitter) has no lucide brand glyph, so it ships as inline SVG. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

const navLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Docs", href: "/docs" },
  { label: "FAQs", href: "/faqs" },
];

const socials = [
  { label: "OceanFin on X", href: "https://x.com/oceanfin_", Icon: XIcon },
  { label: "OceanFin on GitHub", href: "https://github.com/Tizun71", Icon: Github },
];

export default function Footer() {
  return (
    <footer className="mt-20 w-full border-t border-white/10 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
        <p className="text-xs text-muted-foreground truncate">
          © {new Date().getFullYear()} Ocean Fin
        </p>

        <div className="flex items-center gap-4 shrink-0">
          <nav aria-label="Footer">
            <ul className="flex items-center gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:text-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
