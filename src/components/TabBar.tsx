import { NavLink, useLocation } from "react-router-dom";
import { Compass, Heart, Sparkles, MessageSquareHeart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const tabs = [
  { to: "/discover", label: "探索", en: "Discover", icon: Compass },
  { to: "/matches", label: "朋友", en: "Friends", icon: Heart },
  { to: "/agent", label: "AI", en: "AI", icon: Sparkles },
  { to: "/community", label: "廣場", en: "Feed", icon: MessageSquareHeart },
  { to: "/profile", label: "我的", en: "Me", icon: User },
];

export function TabBar() {
  const { pathname } = useLocation();
  const t = useT();
  const activeIdx = tabs.findIndex((t) => pathname.startsWith(t.to));
  return (
    <nav className="absolute bottom-0 inset-x-0 h-[78px] glass-strong border-t border-primary/15 px-2 pt-2 pb-4 z-30">
      <div className="relative grid grid-cols-5 h-full">
        {/* spring indicator */}
        <span
          className="absolute -top-0.5 h-1 w-8 rounded-full bg-gradient-primary shadow-glow transition-all duration-500"
          style={{ left: `calc(${activeIdx * 20}% + 10%)`, transform: "translateX(-50%)" }}
        />
        {tabs.map(({ to, label, en, icon: Icon }) => (
          <NavLink key={to} to={to} className="ripple press flex flex-col items-center justify-center gap-1 rounded-2xl">
            {({ isActive }) => (
              <>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-primary scale-125 drop-shadow-[0_0_8px_hsl(var(--primary))]" : "text-muted-foreground"
                )} />
                <span className={cn("text-[10px]", isActive ? "text-primary font-medium" : "text-muted-foreground")}>{t(label, en)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
