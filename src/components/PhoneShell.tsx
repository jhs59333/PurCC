import { cn } from "@/lib/utils";

/** 手機外殼 + 浮動粒子背景 */
export function PhoneShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-gradient-bg p-0 md:p-6 relative overflow-hidden">
      {/* 背景呼吸光球 */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl animate-breathe" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl animate-breathe" style={{ animationDelay: "1.5s" }} />
      {/* 浮動粒子 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className="pointer-events-none absolute w-1.5 h-1.5 rounded-full bg-primary-glow/60 animate-particle-float"
          style={{ left: `${10 + i * 15}%`, animationDelay: `${i * 1.3}s`, animationDuration: `${7 + i}s` }}
        />
      ))}
      <div className={cn(
        "relative w-full max-w-[430px] h-dvh md:h-[860px] md:rounded-[36px] overflow-hidden glass-strong shadow-card md:border md:border-primary/20",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

export function StatusBar({ title }: { title?: string }) {
  return (
    <div className="h-11 px-5 flex items-center justify-between text-xs text-foreground/70 shrink-0">
      <span>9:41</span>
      <span className="font-medium">{title}</span>
      <span className="flex items-center gap-1">
        <span className="i">●●●</span>
      </span>
    </div>
  );
}
