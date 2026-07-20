import { resolveAgentIcon } from "@/lib/iconMap";

/**
 * Logo for the protocol a builder node runs on. The icon used to be hardcoded
 * to Hydration, so Aave/Benqi/Trader Joe nodes all showed the wrong brand.
 */
export default function ProtocolIcon({ name }: { name?: string }) {
  const src = resolveAgentIcon(name);

  return (
    <div className="w-6 h-6 relative rounded-full border border-white/10 bg-neutral-900 overflow-hidden shrink-0 flex items-center justify-center">
      {src ? (
        <img
          src={src}
          alt={name || "Protocol"}
          className="w-full h-full object-cover scale-110"
        />
      ) : (
        <span className="text-[10px] font-bold text-primary">
          {(name || "?").charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
