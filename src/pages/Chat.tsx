import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { PEOPLE } from "@/lib/mock";
import { WarmthRing } from "@/components/WarmthRing";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ReportSheet } from "@/components/ReportSheet";
import { detectScam, rateLimit, isRepeating } from "@/lib/antifraud";
import { useApp } from "@/lib/store";
import { ArrowLeft, Mic, MoreVertical, Send, ShieldAlert, Smile, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

type Msg = { id: string; text: string; mine: boolean; loved?: boolean; flagged?: boolean };

export default function Chat() {
  const { id } = useParams();
  const person = PEOPLE.find((p) => p.id === id) ?? PEOPLE[0];
  const { blocked } = useApp();
  const isBlocked = blocked.includes(person.id);

  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m1", text: `嗨！很高興認識你 👋`, mine: false },
    { id: "m2", text: "你好～看到你也喜歡攝影！", mine: true },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [showAi, setShowAi] = useState(true);
  const [voice, setVoice] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [floats, setFloats] = useState<{ id: number; x: number; y: number }[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [pendingScam, setPendingScam] = useState<{ text: string; reasons: string[] } | null>(null);
  const sendHistory = useRef<number[]>([]);
  const textHistory = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiSugs = ["哈哈，我也是！", "週末有空一起拍照嗎？", "你都用什麼相機？"];

  // 偵測對方是否傳出可疑內容
  const incomingRiskCount = useMemo(
    () => msgs.filter((m) => !m.mine && m.flagged).length,
    [msgs]
  );

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const doSend = (t: string, force = false) => {
    if (!t.trim()) return;
    if (isBlocked) { toast.error("你已封鎖此用戶，無法發送訊息"); return; }

    // 速率限制（反機器人）
    const wait = rateLimit(sendHistory.current);
    if (wait > 0) { toast.error(`發送過於頻繁，請等 ${wait} 秒`); return; }

    // 重複訊息偵測
    if (isRepeating(textHistory.current, t)) {
      toast.error("偵測到重複訊息，請勿洗版");
      return;
    }

    // 詐騙關鍵字偵測
    if (!force) {
      const hits = detectScam(t);
      if (hits.length) {
        setPendingScam({ text: t, reasons: [...new Set(hits.map((h) => h.reason))] });
        return;
      }
    }

    sendHistory.current = [...sendHistory.current, Date.now()].slice(-12);
    textHistory.current = [...textHistory.current, t].slice(-5);

    setMsgs((m) => [...m, { id: Math.random().toString(), text: t, mine: true }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = ["真的嗎！", "我也這樣覺得 😊", "好哦！週末約？", "嘿嘿，被你發現了"][Math.floor(Math.random() * 4)];
      setMsgs((m) => [...m, { id: Math.random().toString(), text: reply, mine: false }]);
    }, 1500);
  };

  const send = (t: string) => doSend(t, false);
  const confirmSendScam = () => {
    if (!pendingScam) return;
    doSend(pendingScam.text, true);
    setPendingScam(null);
  };

  const doubleTap = (e: React.MouseEvent, m: Msg) => {
    if (e.detail !== 2) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = Date.now();
    setFloats((f) => [...f, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setMsgs((arr) => arr.map((x) => x.id === m.id ? { ...x, loved: true } : x));
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 900);
  };

  const stopRec = () => {
    if (recSec > 0) send(`🎤 語音 ${recSec}s`);
    setRecording(false); setRecSec(0);
  };

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="h-16 px-3 flex items-center gap-3 border-b border-border/50 glass-strong shrink-0">
          <Link to="/matches" className="press p-2 rounded-full hover:bg-primary/10"><ArrowLeft className="h-5 w-5" /></Link>
          <Link to={`/people/${person.id}`} className={`relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br ${person.color} press`}>
            <img src={person.photo} alt={person.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-background animate-pulse-dot" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm flex items-center gap-1">
              <span className="truncate">{person.name}</span>
              <VerifiedBadge verified={person.verified} size="xs" />
            </p>
            <p className="text-[11px] text-muted-foreground">線上 · 24h 倒數中</p>
          </div>
          <WarmthRing value={person.warmth} size={36} stroke={3} />
          <button onClick={() => setReportOpen(true)} className="press p-2 rounded-full hover:bg-primary/10" aria-label="安全選項">
            <MoreVertical className="h-5 w-5" />
          </button>
        </header>
        <div className="h-1 bg-warning/30 relative shrink-0">
          <div className="h-full bg-gradient-to-r from-warning to-rose w-1/3" />
        </div>

        {/* 未驗證 / 高風險警告 */}
        {(!person.verified || incomingRiskCount > 0) && (
          <div className="mx-3 mt-2 rounded-xl border border-warning/50 bg-warning/10 p-2.5 flex gap-2 items-start animate-slide-down">
            <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-medium text-warning">
                {!person.verified ? "對方尚未通過真人驗證" : "偵測到可疑內容"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                請勿透露個資、轉帳或加入任何外部群組。
              </p>
            </div>
          </div>
        )}

        {/* AI 建議 */}
        {showAi && (
          <div className="px-3 pt-2 animate-slide-down">
            <div className="rounded-2xl glass border border-primary/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] flex items-center gap-1 text-primary-glow"><Sparkles className="h-3 w-3" /> DELULU AI 建議</p>
                <button onClick={() => setShowAi(false)} className="press p-0.5 rounded-full"><X className="h-3 w-3 text-muted-foreground" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aiSugs.map((s) => (
                  <button key={s} onClick={() => setText(s)} className="ripple press text-xs px-3 py-1 rounded-full bg-primary/15 border border-primary/30 hover:bg-primary/30">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 訊息列表 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
              <div onClick={(e) => doubleTap(e, m)}
                className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-soft ${
                  m.mine
                    ? "bg-gradient-primary text-primary-foreground rounded-br-md animate-bubble-in-me"
                    : "glass border border-border rounded-bl-md animate-bubble-in"
                } ${m.flagged ? "ring-2 ring-warning/60" : ""}`}>
                {m.flagged && (
                  <span className="absolute -top-2 -left-1 text-[10px] px-1.5 py-0.5 rounded bg-warning text-background font-bold">⚠ 可疑</span>
                )}
                {m.text}
                {m.loved && <span className="absolute -top-2 -right-1 text-sm">💜</span>}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="glass border border-border rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 animate-bubble-in">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-typing" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          {floats.map((f) => (
            <span key={f.id} className="absolute pointer-events-none text-2xl animate-like-float" style={{ left: f.x, top: f.y }}>💜</span>
          ))}
        </div>

        {/* 輸入區 */}
        <div className="p-3 border-t border-border/50 glass-strong shrink-0">
          {isBlocked ? (
            <div className="text-center text-xs text-muted-foreground py-3">
              你已封鎖此用戶 · <button onClick={() => setReportOpen(true)} className="text-primary-glow underline">管理</button>
            </div>
          ) : recording ? (
            <div className="flex items-center gap-3 h-12">
              <button onClick={stopRec} className="ripple press h-10 w-10 rounded-full bg-rose grid place-items-center text-white">●</button>
              <div className="flex-1 flex items-end gap-0.5 h-8">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="flex-1 bg-primary rounded-full animate-wave-bar origin-bottom"
                    style={{ height: `${20 + ((i * 7) % 70)}%`, animationDelay: `${i * 0.04}s` }} />
                ))}
              </div>
              <span className="text-xs text-rose font-mono">{String(Math.floor(recSec / 60)).padStart(2, "0")}:{String(recSec % 60).padStart(2, "0")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setVoice(!voice)} className={`press p-2 rounded-full ${voice ? "bg-primary/20 text-primary-glow" : "text-muted-foreground"}`}>
                <Mic className="h-5 w-5" />
              </button>
              {voice ? (
                <button
                  onPointerDown={() => setRecording(true)}
                  className="flex-1 h-11 rounded-full bg-primary/15 border border-primary/30 text-sm text-primary-glow press"
                >
                  按住說話 🎤
                </button>
              ) : (
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(text)}
                  placeholder="說點什麼…"
                  className="flex-1 h-11 px-4 rounded-full bg-input border border-border text-sm outline-none focus:border-primary"
                />
              )}
              <button className="press p-2 rounded-full text-muted-foreground"><Smile className="h-5 w-5" /></button>
              <button onClick={() => send(text)} className="ripple press h-10 w-10 rounded-full bg-gradient-primary grid place-items-center shadow-glow">
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* 詐騙關鍵字攔截確認 */}
        {pendingScam && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-6 animate-pop-in" onClick={() => setPendingScam(null)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl glass-strong border border-warning/50 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-warning" />
                <p className="font-bold">這則訊息可能含有風險</p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {pendingScam.reasons.map((r) => <li key={r}>· {r}</li>)}
              </ul>
              <p className="text-xs text-muted-foreground">
                提醒你：絕對不要透露個資、轉帳或加入外部群組。詐騙者常以投資、感情為由誘騙。
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPendingScam(null)} className="press flex-1 py-3 rounded-xl border border-border text-sm">
                  取消
                </button>
                <button onClick={confirmSendScam} className="press flex-1 py-3 rounded-xl bg-warning/20 border border-warning text-warning text-sm font-medium">
                  仍要發送
                </button>
              </div>
            </div>
          </div>
        )}

        <ReportSheet
          personId={person.id}
          personName={person.name}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      </div>
    </PhoneShell>
  );
}
