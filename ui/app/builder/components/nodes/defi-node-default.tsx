type Props = {
  message?: string;
};

export default function DefiNodeDefault({ message = "Not configured" }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[110px]">
      <span className="text-sm text-white/35">{message}</span>
    </div>
  );
}