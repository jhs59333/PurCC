import { useTx } from "@/lib/i18n";
import { useT } from "@/lib/i18n";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { TabBar } from "@/components/TabBar";
import { AppHeader } from "@/components/AppHeader";
import { POSTS } from "@/lib/mock";
import { Heart, MessageCircle, Plus, Send } from "lucide-react";

export default function Community() {
  const tx = useTx();
  const t = useT();
  const [posts, setPosts] = useState(POSTS);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");

  const toggleLike = (id: string) => {
    setPosts((ps) => ps.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const publish = () => {
    if (!draft.trim()) return;
    setPosts([{ id: Math.random().toString(), author: "我", avatar: "💜", time: "剛剛", text: draft, likes: 0, comments: 0, liked: false }, ...posts]);
    setDraft(""); setComposing(false);
  };

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <AppHeader title={t("廣場", "Feed")} />

        <div className="px-5 pb-2">
          {composing ? (
            <div className="rounded-2xl glass-strong p-3 animate-slide-down border border-primary/40">
              <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={tx("今天有什麼想分享？")}
                className="w-full bg-transparent outline-none resize-none text-sm min-h-[80px]" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setComposing(false)} className="press text-xs px-3 py-1.5 rounded-full text-muted-foreground">{tx("取消")}</button>
                <button onClick={publish} className="ripple press text-xs px-4 py-1.5 rounded-full bg-gradient-primary text-primary-foreground font-medium flex items-center gap-1">
                  <Send className="h-3 w-3" /> {tx("發布")}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setComposing(true)} className="ripple press w-full rounded-full glass border border-primary/30 px-4 py-3 text-sm text-muted-foreground text-left flex items-center gap-2 hover-lift">
              <Plus className="h-4 w-4 text-primary" /> {tx("分享你的此刻…")}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-[88px] space-y-3">
          {posts.map((p, i) => (
            <article key={p.id} style={{ animationDelay: `${i * 70}ms` }}
              className="animate-slide-up rounded-3xl glass border border-border p-4 hover:border-primary/40 transition">
              <header className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-warm grid place-items-center text-lg">{p.avatar}</div>
                <div>
                  <p className="text-sm font-medium">{tx(p.author)}</p>
                  <p className="text-[11px] text-muted-foreground">{tx(p.time)}</p>
                </div>
              </header>
              <p className="mt-3 text-sm leading-relaxed">{tx(p.text)}</p>
              {i % 2 === 0 && (
                <div className="mt-3 aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/30 via-accent/30 to-pink-300/20 grid place-items-center text-4xl">
                  {["🌅", "☕️", "🎨", "🌙"][i % 4]}
                </div>
              )}
              <footer className="mt-3 flex items-center gap-5 text-xs text-muted-foreground">
                <button onClick={() => toggleLike(p.id)} className="press flex items-center gap-1.5 group">
                  <Heart className={`h-4 w-4 transition ${p.liked ? "fill-rose text-rose scale-125 animate-pop-in" : "group-hover:text-rose"}`} />
                  <span className={p.liked ? "text-rose" : ""}>{p.likes}</span>
                </button>
                <button className="press flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" /> {p.comments}
                </button>
              </footer>
            </article>
          ))}
        </div>
        <TabBar />
      </div>
    </PhoneShell>
  );
}
