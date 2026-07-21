import { Settings2 } from "lucide-react";

type Props = {
  message?: string;
};

export default function DefiNodeDefault({ message = "Not configured" }: Props) {
  return (
    <div className="flex min-h-[110px] items-center justify-center">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 px-6 py-4 text-white/40">
        <Settings2 size={18} className="text-white/30" />
        <span className="text-sm">{message}</span>
        <span className="text-[11px] text-white/25">Click to configure</span>
      </div>
    </div>
  );
}
