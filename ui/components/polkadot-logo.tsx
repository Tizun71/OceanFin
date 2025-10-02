export function PolkadotLogo() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary animate-pulse-slow"
    >
      <defs>
        <radialGradient id="polkadot-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e6007a" />
          <stop offset="100%" stopColor="#552bbf" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="8" r="4" fill="url(#polkadot-gradient)" className="drop-shadow-lg" />
      <circle cx="20" cy="32" r="4" fill="url(#polkadot-gradient)" className="drop-shadow-lg" />
      <circle cx="8" cy="14" r="4" fill="url(#polkadot-gradient)" className="drop-shadow-lg" />
      <circle cx="32" cy="14" r="4" fill="url(#polkadot-gradient)" className="drop-shadow-lg" />
      <circle cx="8" cy="26" r="4" fill="url(#polkadot-gradient)" className="drop-shadow-lg" />
      <circle cx="32" cy="26" r="4" fill="url(#polkadot-gradient)" className="drop-shadow-lg" />
      {/* Connection lines */}
      <line x1="20" y1="8" x2="8" y2="14" stroke="#e6007a" strokeWidth="1" opacity="0.3" />
      <line x1="20" y1="8" x2="32" y2="14" stroke="#e6007a" strokeWidth="1" opacity="0.3" />
      <line x1="8" y1="14" x2="8" y2="26" stroke="#552bbf" strokeWidth="1" opacity="0.3" />
      <line x1="32" y1="14" x2="32" y2="26" stroke="#552bbf" strokeWidth="1" opacity="0.3" />
      <line x1="8" y1="26" x2="20" y2="32" stroke="#e6007a" strokeWidth="1" opacity="0.3" />
      <line x1="32" y1="26" x2="20" y2="32" stroke="#e6007a" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}
