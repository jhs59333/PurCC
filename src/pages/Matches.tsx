import { Link } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { TabBar } from "@/components/TabBar";
import { AppHeader } from "@/components/AppHeader";
import { PEOPLE } from "@/lib/mock";
import { WarmthRing } from "@/components/WarmthRing";
import { Clock } from "lucide-react";

export default function Matches() {
  const newMatches = PEOPLE.slice(0, 6);
  const chats = PEOPLE.slice(0, 8);
  const previews = ["哈囉～你也喜歡爬山！", "你今天有空嗎？", "❤️", "看到你的照片，超有質感", "明天一起去咖啡廳？", "晚安 🌙", "...", "謝謝你的 Super Like！"];
  const times = ["剛剛", "5 分鐘前", "1 小時前", "今天", "昨天", "週一", "12/3", "11/29"];
  const unread = [2, 0, 1, 0, 5, 0, 0, 0];

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <AppHeader title="朋友" />

        <section className="px-5 pt-2 animate-slide-up">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">最新配對</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
            {newMatches.map((p, i) => (
              <Link key={p.id} to={`/chat/${p.id}`} style={{ animationDelay: `${i * 60}ms` }}
                className="shrink-0 w-20 text-center animate-tag-bounce press">
                <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${p.color} grid place-items-center text-3xl shadow-soft hover-lift`}>
                  {p.avatar}
                  <div className="absolute -bottom-1 -right-1"><WarmthRing value={p.warmth} size={28} stroke={3} /></div>
                </div>
                <p className="mt-2 text-xs truncate">{p.name}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex-1 overflow-y-auto px-5 mt-4 pb-[88px]">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">訊息</h2>
          <ul className="space-y-1">
            {chats.map((p, i) => (
              <li key={p.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-slide-up">
                <Link to={`/chat/${p.id}`} className="press flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 transition">
                  <div className={`relative h-12 w-12 rounded-full bg-gradient-to-br ${p.color} grid place-items-center text-xl`}>
                    {p.avatar}
                    {i % 3 === 0 && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background animate-pulse-dot" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{p.name}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{times[i]}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">{previews[i]}</p>
                      {i < 3 && <span className="shrink-0 text-[10px] text-warning flex items-center gap-0.5"><Clock className="h-3 w-3" /> {23 - i}h</span>}
                    </div>
                  </div>
                  {unread[i] > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground grid place-items-center animate-pop-in">{unread[i]}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <TabBar />
      </div>
    </PhoneShell>
  );
}
