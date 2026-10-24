import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TONES = ["溫暖真誠", "幽默風趣", "文藝知性", "活潑陽光"];
type Result = { oneLiner: string; bio: string; topics: string[] };

export function AIIntroSheet({ open, onClose, nickname, tags, onApply }: {
  open: boolean; onClose: () => void; nickname: string; tags: string[]; onApply: (bio: string) => void;
}) {
  const [tone, setTone] = useState(TONES[0]);
  const [activities, setActivities] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<Result | null>(null);

  if (!open) return null;

  const generate = async () => {
    setLoading(true); setError("");
    const { data, error } = await supabase.functions.invoke("generate-intro", {
      body: { nickname, tags, tone, activities, lookingFor, about },
    });
    setLoading(false);
    if (error || data?.error) {
      let msg = data?.error;
      try { msg ??= (await (error as any)?.context?.json())?.error; } catch { /* ignore */ }
      setError(msg || "產生失敗，請稍後再試");
      return;
    }
    setRes(data);
  };

  const shareText = res ? `✨ ${res.oneLiner}\n\n${res.bio}\n\n#${tags.join(" #")}\n— 在 PurCC 找到我 💜` : "";
  const copy = async () => { await navigator.clipboard.writeText(shareText); toast({ title: "已複製分享名片" }); };

  const field = "w-full bg-input rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="absolute inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-h-[90%] overflow-y-auto rounded-t-3xl bg-card border-t border-border p-5 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <p className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI 自我介紹生成器</p>
          <button onClick={onClose} className="press"><X className="h-5 w-5" /></button>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5">興趣（來自你的喜好）</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary-glow border border-primary/30">{t}</span>)}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">語氣</p>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button key={t} onClick={() => setTone(t)} className={`press text-xs px-3 py-1 rounded-full border ${tone === t ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{t}</button>
            ))}
          </div>
        </div>
        <input className={field} placeholder="喜歡的活動（例：週末爬山、手沖咖啡）" value={activities} onChange={(e) => setActivities(e.target.value)} maxLength={200} />
        <input className={field} placeholder="想認識什麼樣的人？" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} maxLength={200} />
        <textarea className={field} rows={2} placeholder="關於我（工作、個性、小怪癖…選填）" value={about} onChange={(e) => setAbout(e.target.value)} maxLength={300} />

        <button disabled={loading || !tags.length} onClick={generate} className="press w-full py-3 rounded-2xl bg-gradient-warm text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> 撰寫中…</> : res ? <><RefreshCw className="h-4 w-4" /> 重新產生</> : <><Sparkles className="h-4 w-4" /> 產生我的自介</>}
        </button>
        {error && <p className="text-xs text-rose text-center">{error}</p>}

        {res && (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 space-y-3 animate-slide-up">
            <p className="font-bold text-primary-glow">✨ {res.oneLiner}</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{res.bio}</p>
            {res.topics.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">聊得來的話題</p>
                <ul className="text-xs space-y-1">{res.topics.map((t) => <li key={t}>💬 {t}</li>)}</ul>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => { onApply(res.bio); onClose(); toast({ title: "已套用到個人檔案" }); }} className="press py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">套用到檔案</button>
              <button onClick={copy} className="press py-2 rounded-xl border border-border text-sm flex items-center justify-center gap-1"><Copy className="h-3.5 w-3.5" /> 複製分享</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
