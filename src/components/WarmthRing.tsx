/** 暖度分數環 SVG */
export function WarmthRing({ value, size = 48, stroke = 4 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" opacity={0.3} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#warmth)" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out", filter: "drop-shadow(0 0 4px hsl(var(--primary)))" }}
        />
        <defs>
          <linearGradient id="warmth" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-primary-glow">{value}</span>
    </div>
  );
}
