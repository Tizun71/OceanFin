type TokenIconProps = {
  symbol?: string;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
};

export default function TokenIcon({
  symbol,
  className = "",
  textClassName = "",
  iconClassName = "",
}: TokenIconProps) {
  if (!symbol) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/chain-icon/hydration.png"
        alt={symbol}
        className={`w-5 h-5 rounded-full object-cover shrink-0 ${iconClassName}`}
      />
      <span className={`text-[18px] text-white font-medium leading-none ${textClassName}`}>
        {symbol}
      </span>
    </div>
  );
}