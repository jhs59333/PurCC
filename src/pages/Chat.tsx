import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { PEOPLE } from "@/lib/mock";
import { WarmthRing } from "@/components/WarmthRing";
import { ArrowLeft, Mic, Send, Smile, Sparkles, X } from "lucide-react";

type Msg = { id: string; text: string; mine: boolean; loved?: boolean };

export default function Chat() {
  const { id } = useParams();
  const person = PEOPLE.find((p) => p.id === id) ?? PEOPLE[0];
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiSugs = ["哈哈，我也是！", "週末有空一起拍照嗎？", "你都用什麼相機？"];

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const send = (t: string) => {
    if (!t.trim()) return;
    setMsgs((m) => [...m, { id: Math.random().toString(), text: t, mine: true }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: Math.random().toString(), text: ["真的嗎！", "我也這樣覺得 😊", "好哦！週末約？", "嘿嘿，被你發現了"][Math.floor(Math.random() * 4)], mine: false }]);
    }, 1500);
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
          <div className="flex-1">
            <p className="font-medium text-sm">{person.name}</p>
            <p className="text-[11px] text-muted-foreground">線上 · 24h 倒數中</p>
          </div>
          <WarmthRing value={person.warmth} size={36} stroke={3} />
        </header>
        <div className="h-1 bg-warning/30 relative shrink-0">
          <div className="h-full bg-gradient-to-r from-warning to-rose w-1/3" />
        </div>

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
                }`}>
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
          {recording ? (
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
      </div>
    </PhoneShell>
  );
}
