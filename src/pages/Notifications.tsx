import { useState } from "react";
import { Link } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { NOTIFICATIONS } from "@/lib/mock";
import { ArrowLeft, Heart, MessageCircle, Sparkles, Star } from "lucide-react";

const ICONS: Record<string, any> = { match: Heart, message: MessageCircle, super: Star, topic: Sparkles };

export default function Notifications() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const markAll = () => setItems((xs) => xs.map((x) => ({ ...x, read: true })));
  const markOne = (id: string) => setItems((xs) => xs.map((x) => x.id === id ? { ...x, read: true } : x));

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <header className="h-14 px-3 flex items-center gap-3 shrink-0">
          <Link to="/discover" className="press p-2 rounded-full hover:bg-primary/10"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-bold flex-1">通知</h1>
          <button onClick={markAll} className="press text-xs text-primary px-3 py-1.5 rounded-full hover:bg-primary/10">全部已讀</button>
        </header>
        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2">
          {items.map((n, i) => {
            const Icon = ICONS[n.type] ?? Sparkles;
            return (
              <button key={n.id} onClick={() => markOne(n.id)} style={{ animationDelay: `${i * 60}ms` }}
                className={`animate-slide-up press w-full text-left rounded-2xl p-4 flex items-center gap-3 ${
                  n.read ? "glass border border-border" : "glass-strong border border-primary/40"
                }`}>
                <div className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center"><Icon className="h-5 w-5 text-primary-foreground" /></div>
                <div className="flex-1">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-rose animate-pulse-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    </PhoneShell>
  );
}
