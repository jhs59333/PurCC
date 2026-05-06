import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { TabBar } from "@/components/TabBar";
import { AppHeader } from "@/components/AppHeader";
import { PEOPLE, CITIES, type Person } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { WarmthRing } from "@/components/WarmthRing";
import { Heart, RotateCcw, Star, UserPlus, X, Zap, EyeOff, Globe2, MessageCircleQuestion } from "lucide-react";
import { useDiscoverTuning } from "@/lib/tuning";
import { TuningPanel } from "@/components/TuningPanel";

type Mode = "normal" | "blind" | "passport" | "quiz";

export default function Discover() {
  const nav = useNavigate();
  const myTags = useApp((s) => s.tags);
  const [stack, setStack] = useState<Person[]>(PEOPLE);
  const [history, setHistory] = useState<Person[]>([]);
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [match, setMatch] = useState<Person | null>(null);
  const [mode, setMode] = useState<Mode>("normal");
  const [city, setCity] = useState("台北");
  const [quizStep, setQuizStep] = useState(0);
  const startRef = useRef({ x: 0, y: 0 });

  const { tuning, update, reset } = useDiscoverTuning();
  const SWIPE_THRESHOLD = tuning.swipeThreshold;
  const STAMP_FULL = tuning.stampFull;
  const [flying, setFlying] = useState<{ dir: 1 | -1 | 0; up?: boolean } | null>(null);

  const top = stack[0];
  const next2 = stack.slice(1, 3);

  const absX = Math.abs(drag.x);
  const intensity = Math.min(1, absX / SWIPE_THRESHOLD);
  const eased = 1 - Math.pow(1 - intensity, 2.2);

  const rotate = (drag.x / SWIPE_THRESHOLD) * tuning.maxRotate * (1 - intensity * 0.25);
  const liftY = drag.y < 0 ? Math.max(drag.y, -tuning.liftMax) : drag.y * 0.35;
  const scale = 1 + eased * 0.02;

  const likeOpacity = Math.max(0, Math.min(1, drag.x / STAMP_FULL));
  const passOpacity = Math.max(0, Math.min(1, -drag.x / STAMP_FULL));
  const superOpacity = Math.max(0, Math.min(1, -liftY / 90)) * (Math.abs(drag.x) < 60 ? 1 : 0);
  const stampActive = intensity >= 1;

  const handleAction = (kind: "like" | "pass" | "super") => {
    if (!top) return;
    // 飛出動畫
    setFlying({ dir: kind === "pass" ? -1 : 1, up: kind === "super" });
    window.setTimeout(() => {
      if (kind === "like" || kind === "super") {
        if (Math.random() < 0.5) setMatch(top);
      }
      setHistory((h) => [top, ...h].slice(0, 5));
      setStack((s) => s.slice(1));
      setDrag({ x: 0, y: 0, dragging: false });
      setFlying(null);
    }, 280);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (flying) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, dragging: true });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setDrag({ x: dx, y: dy, dragging: true });
  };
  const onPointerUp = () => {
    if (!drag.dragging) return;
    if (drag.y < -90 && Math.abs(drag.x) < 80) handleAction("super");
    else if (Math.abs(drag.x) > SWIPE_THRESHOLD) handleAction(drag.x > 0 ? "like" : "pass");
    else setDrag({ x: 0, y: 0, dragging: false });
  };

  const undo = () => {
    if (!history.length) return;
    setStack((s) => [history[0], ...s]);
    setHistory((h) => h.slice(1));
  };

  const commonTags = useMemo(() => top ? top.tags.filter((t) => myTags.includes(t)) : [], [top, myTags]);

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <AppHeader title="探索" />

        {/* 模式切換 */}
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { k: "normal", label: "一般", icon: Heart },
            { k: "blind", label: "Blind Date", icon: EyeOff },
            { k: "passport", label: "Passport", icon: Globe2 },
            { k: "quiz", label: "今日話題", icon: MessageCircleQuestion },
          ].map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setMode(k as Mode)}
              className={`ripple press shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition ${
                mode === k ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "border-border text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {mode === "passport" && (
          <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar animate-slide-down">
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(c)} className={`shrink-0 px-3 py-1 rounded-full text-xs border ${city === c ? "bg-primary/20 border-primary text-primary-glow" : "border-border text-muted-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* 卡片堆 */}
        <div className="relative flex-1 mx-5 mt-2 mb-2" style={{ perspective: "1200px" }}>
          {!top && (
            <div className="h-full grid place-items-center text-center animate-pop-in">
              <div>
                <div className="text-5xl mb-3">🌙</div>
                <p className="text-muted-foreground">今天先到這裡<br />明天再為你帶來新朋友</p>
              </div>
            </div>
          )}
          {next2.map((p, i) => (
            <div
              key={p.id + i}
              className="absolute inset-0 rounded-3xl glass shadow-card"
              style={{
                transform: `translateY(${(i + 1) * 10 - eased * (i === 0 ? 8 : 4)}px) scale(${1 - (i + 1) * 0.05 + eased * (i === 0 ? 0.04 : 0.02)}) rotateX(${4 - eased * 3}deg)`,
                opacity: 0.55 - i * 0.18 + eased * 0.2,
                transition: drag.dragging ? "none" : "transform .35s cubic-bezier(.2,.9,.3,1.2), opacity .35s",
                transformOrigin: "center bottom",
                zIndex: 1,
              }}
            />
          ))}

          {mode === "quiz" ? (
            <QuizCard step={quizStep} onAnswer={() => setQuizStep((s) => Math.min(3, s + 1))} done={quizStep >= 3} />
          ) : top && (
            <div
              key={top.id}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing animate-card-entry shadow-card touch-none select-none"
              style={{
                transform: flying
                  ? `translate(${flying.dir * 600}px, ${flying.up ? -800 : 200}px) rotate(${flying.dir * 35}deg) scale(0.9)`
                  : `translate3d(${drag.x}px, ${liftY}px, 0) rotate(${rotate}deg) rotateY(${drag.x / tuning.perspective}deg) rotateX(${-liftY / tuning.perspective}deg) scale(${scale})`,
                transition: drag.dragging
                  ? "none"
                  : flying
                    ? "transform .28s cubic-bezier(.4,0,.7,.3), opacity .28s"
                    : "transform .4s cubic-bezier(.2,.9,.3,1.2)",
                opacity: flying ? 0 : 1,
                zIndex: 10,
                transformStyle: "preserve-3d",
                willChange: "transform",
                boxShadow: `0 ${20 + eased * 30}px ${50 + eased * 40}px -15px hsl(258 60% 4% / ${0.6 + eased * 0.2})`,
              }}
            >
              {/* 背景漸層 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${top.color} opacity-90`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* 拖拽方向色暈 */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: eased * 0.55,
                  background: drag.x > 0
                    ? "radial-gradient(circle at 25% 50%, hsl(var(--success) / .55), transparent 60%)"
                    : drag.x < 0
                      ? "radial-gradient(circle at 75% 50%, hsl(var(--rose) / .55), transparent 60%)"
                      : "radial-gradient(circle at 50% 25%, hsl(200 90% 60% / .55), transparent 60%)",
                }}
              />

              {/* 頭像 / Blind — 微視差 */}
              <div
                className="absolute inset-0 flex items-center justify-center text-[140px] drop-shadow-2xl pointer-events-none"
                style={{ transform: `translate(${drag.x * tuning.parallax}px, ${liftY * tuning.parallax}px)` }}
              >
                {mode === "blind" ? "🎭" : top.avatar}
              </div>

              {/* LIKE / PASS / SUPER 戳記 — 隨強度縮放 + 觸發時發光 */}
              <div
                className="absolute top-12 left-6 px-4 py-1.5 border-4 border-success rounded-xl text-success font-black text-3xl tracking-widest pointer-events-none"
                style={{
                  opacity: likeOpacity,
                  transform: `rotate(-15deg) scale(${0.7 + likeOpacity * 0.4})`,
                  textShadow: `0 0 ${likeOpacity * 20}px hsl(var(--success) / .8)`,
                  filter: stampActive && drag.x > 0 ? "drop-shadow(0 0 14px hsl(var(--success)))" : "none",
                }}
              >LIKE</div>
              <div
                className="absolute top-12 right-6 px-4 py-1.5 border-4 border-rose rounded-xl text-rose font-black text-3xl tracking-widest pointer-events-none"
                style={{
                  opacity: passOpacity,
                  transform: `rotate(15deg) scale(${0.7 + passOpacity * 0.4})`,
                  textShadow: `0 0 ${passOpacity * 20}px hsl(var(--rose) / .8)`,
                  filter: stampActive && drag.x < 0 ? "drop-shadow(0 0 14px hsl(var(--rose)))" : "none",
                }}
              >PASS</div>
              <div
                className="absolute top-1/4 left-1/2 px-4 py-1.5 border-4 border-sky-400 rounded-xl text-sky-300 font-black text-3xl tracking-widest pointer-events-none"
                style={{
                  opacity: superOpacity,
                  transform: `translateX(-50%) scale(${0.7 + superOpacity * 0.4})`,
                  textShadow: `0 0 ${superOpacity * 20}px hsl(200 90% 60% / .9)`,
                }}
              >SUPER</div>

              {/* 暖度 */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur rounded-full p-1">
                <WarmthRing value={top.warmth} size={44} />
              </div>

              {/* 內容 */}
              <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-3">
                <div className="flex items-end gap-2">
                  <h2 className="text-3xl font-black">{mode === "blind" ? "神秘人" : top.name}</h2>
                  <span className="text-xl mb-0.5">{top.age}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur">{top.mbti}</span>
                </div>
                <p className="text-sm text-white/90">{mode === "blind" ? "傳 5 則訊息後解鎖真實樣貌" : top.bio}</p>
                {mode !== "blind" && (
                  <div className="rounded-xl bg-white/15 backdrop-blur p-3">
                    <p className="text-[11px] text-white/70">{top.prompt.q}</p>
                    <p className="text-sm font-medium mt-0.5">「{top.prompt.a}」</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {top.tags.slice(0, 4).map((t) => (
                    <span key={t} className={`text-[11px] px-2 py-0.5 rounded-full ${commonTags.includes(t) ? "bg-primary/80 text-white" : "bg-white/20"}`}>{t}</span>
                  ))}
                  {commonTags.length > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary text-white font-bold">共同 {commonTags.length}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5 個操作鈕 */}
        <div className="px-5 pb-[88px] flex items-center justify-between">
          {[
            { kind: "undo", icon: RotateCcw, color: "text-amber-400", onClick: undo },
            { kind: "pass", icon: X, color: "text-rose", onClick: () => handleAction("pass") },
            { kind: "super", icon: Star, color: "text-sky-400", onClick: () => handleAction("super"), big: true },
            { kind: "like", icon: Heart, color: "text-success", onClick: () => handleAction("like") },
            { kind: "boost", icon: Zap, color: "text-purple-300", onClick: () => {} },
          ].map(({ kind, icon: Icon, color, onClick, big }) => (
            <button
              key={kind}
              onClick={onClick}
              className={`ripple press grid place-items-center rounded-full glass-strong border border-primary/20 hover:border-primary/60 transition group ${
                big ? "h-16 w-16" : "h-14 w-14"
              }`}
            >
              <Icon className={`${color} ${big ? "h-7 w-7" : "h-6 w-6"} transition-transform group-hover:scale-125 group-hover:rotate-12`} />
            </button>
          ))}
        </div>

        {match && <MatchModal person={match} onClose={() => setMatch(null)} onChat={() => { setMatch(null); nav(`/chat/${match.id}`); }} />}
        <TabBar />
      </div>
    </PhoneShell>
  );
}

function QuizCard({ step, onAnswer, done }: { step: number; onAnswer: () => void; done: boolean }) {
  const questions = [
    { q: "你週末最想做的事？", opts: ["睡到自然醒", "出門探險", "在家看劇", "找朋友吃飯"] },
    { q: "理想的約會場景？", opts: ["咖啡廳聊天", "看一場電影", "市集散步", "開車兜風"] },
    { q: "你是？", opts: ["夜貓子", "晨型人", "看心情", "永遠很累"] },
  ];
  if (done) return (
    <div className="absolute inset-0 rounded-3xl glass-strong p-8 flex flex-col items-center justify-center text-center animate-pop-in">
      <div className="text-6xl mb-4 animate-heart-beat">✨</div>
      <h3 className="text-xl font-bold text-gradient">為你找到 5 位有共鳴的朋友</h3>
      <p className="text-sm text-muted-foreground mt-2">已加入今日推薦</p>
    </div>
  );
  const cur = questions[step];
  return (
    <div className="absolute inset-0 rounded-3xl glass-strong p-6 flex flex-col animate-card-entry">
      <p className="text-xs text-muted-foreground">今日話題 {step + 1} / 3</p>
      <h3 className="mt-2 text-2xl font-bold leading-snug">{cur.q}</h3>
      <div className="mt-6 space-y-3 flex-1">
        {cur.opts.map((o, i) => (
          <button key={o} onClick={onAnswer}
            style={{ animationDelay: `${i * 60}ms` }}
            className="ripple press w-full text-left rounded-2xl border border-border p-4 hover:border-primary hover:bg-primary/10 transition animate-slide-right">
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchModal({ person, onClose, onChat }: { person: Person; onClose: () => void; onChat: () => void }) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 backdrop-blur-sm animate-pop-in" onClick={onClose}>
      {/* 彩屑 */}
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            ["--tx" as any]: `${(Math.random() - 0.5) * 200}px`,
            background: ["#a78bfa","#f0abfc","#fbbf24","#34d399","#fb7185"][i % 5],
            animationDelay: `${(i * 0.05).toFixed(2)}s`,
          }}
        />
      ))}
      <div className="relative w-[85%] glass-strong rounded-3xl p-7 text-center shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="text-6xl animate-heart-beat">💜</div>
        <h2 className="mt-3 text-2xl font-black text-gradient">配對成功！</h2>
        <p className="text-sm text-muted-foreground mt-1">你和 {person.name} 互相喜歡了</p>
        <div className="mt-4 flex justify-center gap-3 text-4xl">
          <span>{person.avatar}</span><span className="self-center text-primary">💞</span><span>🫶</span>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {person.tags.slice(0, 3).map((t) => <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/20 text-primary-glow">{t}</span>)}
        </div>
        <div className="mt-6 space-y-2">
          <button onClick={onChat} className="ripple press w-full py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-glow">直接開聊</button>
          <button onClick={onClose} className="ripple press w-full py-3 rounded-2xl border border-border text-muted-foreground">稍後再說</button>
        </div>
      </div>
    </div>
  );
}
