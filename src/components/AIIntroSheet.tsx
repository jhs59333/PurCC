import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";

const TONES = [["溫暖真誠", "Warm & sincere"], ["幽默風趣", "Playful"], ["文藝知性", "Thoughtful"], ["活潑陽光", "Sunny"]];
type Result = { oneLiner: string; bio: string; topics: string[] };

export function AIIntroSheet({ open, onClose, nickname, tags, onApply }: {
  open: boolean; onClose: () => void; nickname: string; tags: string[]; onApply: (bio: string) => void;
}) {
  const lang = useLang((s) => s.lang);
  const t = (zh: string, en: string) => (lang === "en" ? en : zh);
  const [tone, setTone] = useState(0);
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
      body: { nickname, tags, tone: TONES[tone][1], lang, activities, lookingFor, about },
    });
    setLoading(false);
    if (error || data?.error) {
      let msg = data?.error;
      try { msg ??= (await (error as any)?.context?.json())?.error; } catch { /* ignore */ }
      setError(msg || t("產生失敗，請稍後再試", "Generation failed, please try again"));
      return;
    }
    setRes(data);
  };

  const shareText = res ? `✨ ${res.oneLiner}\n\n${res.bio}\n\n#${tags.join(" #")}\n${t("— 在 PurCC 找到我 💜", "— Find me on PurCC 💜")}` : "";
  const copy = async () => { await navigator.clipboard.writeText(shareText); toast({ title: t("已複製分享名片", "Share card copied") }); };

  const field = "w-full bg-input rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="absolute inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-h-[90%] overflow-y-auto rounded-t-3xl bg-card border-t border-border p-5 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <p className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {t("AI 自我介紹生成器", "AI intro writer")}</p>
          <button onClick={onClose} className="press"><X className="h-5 w-5" /></button>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5">{t("興趣（來自你的喜好）", "Interests (from your profile)")}</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((g) => <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary-glow border border-primary/30">{g}</span>)}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">{t("語氣", "Tone")}</p>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((x, i) => (
              <button key={x[0]} onClick={() => setTone(i)} className={`press text-xs px-3 py-1 rounded-full border ${tone === i ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{t(x[0], x[1])}</button>
            ))}
          </div>
        </div>
        <input className={field} placeholder={t("喜歡的活動（例：週末爬山、手沖咖啡）", "Favorite activities (e.g. weekend hikes, pour-over coffee)")} value={activities} onChange={(e) => setActivities(e.target.value)} maxLength={200} />
        <input className={field} placeholder={t("想認識什麼樣的人？", "Who would you like to meet?")} value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} maxLength={200} />
        <textarea className={field} rows={2} placeholder={t("關於我（工作、個性、小怪癖…選填）", "About me (work, personality, quirks… optional)")} value={about} onChange={(e) => setAbout(e.target.value)} maxLength={300} />

        <button disabled={loading || !tags.length} onClick={generate} className="press w-full py-3 rounded-2xl bg-gradient-warm text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("撰寫中…", "Writing…")}</> : res ? <><RefreshCw className="h-4 w-4" /> {t("重新產生", "Regenerate")}</> : <><Sparkles className="h-4 w-4" /> {t("產生我的自介", "Write my intro")}</>}
        </button>
        {error && <p className="text-xs text-rose text-center">{error}</p>}

        {res && (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 space-y-3 animate-slide-up">
            <p className="font-bold text-primary-glow">✨ {res.oneLiner}</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{res.bio}</p>
            {res.topics.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("聊得來的話題", "Conversation starters")}</p>
                <ul className="text-xs space-y-1">{res.topics.map((x) => <li key={x}>💬 {x}</li>)}</ul>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => { onApply(res.bio); onClose(); toast({ title: t("已套用到個人檔案", "Applied to your profile") }); }} className="press py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">{t("套用到檔案", "Apply to profile")}</button>
              <button onClick={copy} className="press py-2 rounded-xl border border-border text-sm flex items-center justify-center gap-1"><Copy className="h-3.5 w-3.5" /> {t("複製分享", "Copy to share")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
