import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { TabBar } from "@/components/TabBar";
import { AppHeader } from "@/components/AppHeader";
import { PEOPLE } from "@/lib/mock";
import { ChevronDown, Play, Sparkles } from "lucide-react";

export default function Agent() {
  const [on, setOn] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [openSoul, setOpenSoul] = useState(true);
  const [openRec, setOpenRec] = useState<string | null>(null);

  const run = () => {
    setRunning(true); setLogs([]);
    const steps = [
      "🔍 掃描全平台 1,287 位使用者…",
      "💜 計算 Vibe Score（Cosine + Jaccard）…",
      "🧠 套用 Bayesian 偏好權重…",
      "🛡 過濾 17 維度 Trust Score…",
      "✨ 找到 3 位高契合度朋友！",
    ];
    steps.forEach((s, i) => setTimeout(() => setLogs((l) => [...l, `[${new Date().toLocaleTimeString()}] ${s}`]), (i + 1) * 600));
    setTimeout(() => setRunning(false), steps.length * 600 + 300);
  };

  useEffect(() => { if (on) run(); }, []); // eslint-disable-line

  const recs = PEOPLE.slice(0, 3);
  const dims = ["地區", "年齡", "學歷", "性格", "興趣", "理想型", "貼文"];

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <AppHeader title="AI 助手" />
        <div className="flex-1 overflow-y-auto px-5 pb-[88px] space-y-5">

          {/* Agent 開關 */}
          <div className={`rounded-3xl p-5 glass-strong border ${on ? "border-primary/50 animate-glow" : "border-border"} animate-slide-up`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-float-up">🤖</div>
              <div className="flex-1">
                <p className="font-bold flex items-center gap-1.5">DELULU Agent <Sparkles className="h-3.5 w-3.5 text-primary" /></p>
                <p className="text-xs text-muted-foreground">自動配對 / 訊息回覆 / 自動發帖</p>
              </div>
              <button onClick={() => setOn(!on)} className={`relative w-12 h-7 rounded-full transition press ${on ? "bg-gradient-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
              {[{ k: "配對", v: 12 }, { k: "回覆", v: 47 }, { k: "發帖", v: 3 }].map((s) => (
                <div key={s.k} className="rounded-xl bg-primary/10 py-2">
                  <p className="text-lg font-bold text-primary-glow">{s.v}</p>
                  <p className="text-muted-foreground">{s.k}</p>
                </div>
              ))}
            </div>
            <button onClick={run} disabled={running} className="ripple press mt-4 w-full py-2.5 rounded-2xl bg-primary/20 border border-primary/40 text-sm flex items-center justify-center gap-2">
              <Play className="h-4 w-4" /> {running ? "執行中…" : "立即執行"}
            </button>
          </div>

          {/* 執行日誌 */}
          {logs.length > 0 && (
            <div className="rounded-2xl bg-black/40 border border-border p-3 font-mono text-[11px] space-y-1 max-h-40 overflow-y-auto">
              {logs.map((l, i) => <p key={i} className="text-success animate-slide-right">{l}</p>)}
            </div>
          )}

          {/* Soul 畫像 */}
          <div className="rounded-3xl glass border border-border overflow-hidden animate-slide-up">
            <button onClick={() => setOpenSoul(!openSoul)} className="press w-full p-4 flex items-center gap-2">
              <span className="text-xl">🪞</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">Soul 靈魂畫像</p>
                <p className="text-[11px] text-muted-foreground">5 個維度</p>
              </div>
              <ChevronDown className={`h-4 w-4 transition ${openSoul ? "rotate-180" : ""}`} />
            </button>
            {openSoul && (
              <div className="px-4 pb-4 space-y-2 animate-slide-down">
                {[
                  ["個性", "溫柔內斂、慢熱"],
                  ["理想相處", "輕鬆無壓、可獨處"],
                  ["最愛話題", "電影、攝影、旅行"],
                  ["生活節奏", "夜貓、慢步調"],
                  ["對另一半期待", "誠實、有共鳴"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground w-20 shrink-0">{k}</span>
                    <span className="text-foreground/90">{v}</span>
                  </div>
                ))}
                <button className="ripple press w-full mt-2 py-2 rounded-xl bg-primary/15 text-primary-glow text-xs">更新 Soul 畫像</button>
              </div>
            )}
          </div>

          {/* 配對偏好 */}
          <div className="rounded-3xl glass border border-border p-4 animate-slide-up">
            <p className="font-bold text-sm mb-2">配對偏好（自動學習）</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[["城市", "台北 · 東京"], ["年齡", "23–32"], ["MBTI", "NF / NT"], ["學歷", "大學以上"]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted/50 p-2">
                  <p className="text-muted-foreground">{k}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">最後 AI 學習：今天 14:23</p>
          </div>

          {/* 今日推薦 */}
          <div>
            <p className="font-bold text-sm mb-2">✨ 今日為你推薦</p>
            <div className="space-y-2">
              {recs.map((p) => {
                const open = openRec === p.id;
                return (
                  <div key={p.id} className="rounded-2xl glass border border-border overflow-hidden">
                    <button onClick={() => setOpenRec(open ? null : p.id)} className="press w-full p-3 flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${p.color} grid place-items-center text-xl`}>{p.avatar}</div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{p.name} · {p.age} · {p.city}</p>
                        <p className="text-[11px] text-muted-foreground">{p.mbti} · {p.tags.slice(0, 2).join(" / ")}</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="px-4 pb-4 space-y-2 animate-slide-down">
                        {dims.map((d, i) => {
                          const v = 60 + ((p.warmth + i * 7) % 40);
                          return (
                            <div key={d}>
                              <div className="flex justify-between text-[11px] mb-0.5"><span className="text-muted-foreground">{d}</span><span className="text-primary-glow">{v}</span></div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-gradient-primary" style={{ width: `${v}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex gap-2 pt-2">
                          <button className="ripple press flex-1 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-xs font-bold">AI 已問候</button>
                          <button className="ripple press flex-1 py-2 rounded-xl border border-border text-xs">查看對話</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <TabBar />
      </div>
    </PhoneShell>
  );
}
