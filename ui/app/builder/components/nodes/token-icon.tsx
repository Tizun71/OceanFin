import { assetIcons } from "@/lib/iconMap";
import Image from "next/image";


type TokenIconProps = {
  symbol?: string;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  size?: number; 
};

export default function TokenIcon({
  symbol,
  className = "",
  textClassName = "",
  iconClassName = "",
  size = 24, 
}: TokenIconProps) {
  if (!symbol) return null;

  const s = symbol.toUpperCase();
  const iconSrc = assetIcons[s];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className={`relative rounded-full overflow-hidden border border-white/10 bg-neutral-900 shrink-0 ${iconClassName}`}
        style={{ width: size, height: size }}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={s}
            fill
            sizes={`${size}px`}
            className="object-cover scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/20">
            <span className="text-[10px] font-bold text-primary">{s.charAt(0)}</span>
          </div>
        )}
      </div>

      <span className={`text-[18px] text-white font-semibold leading-none ${textClassName}`}>
        {s}
      </span>
    </div>
  );
}