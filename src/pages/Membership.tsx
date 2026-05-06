import { useState } from "react";
import { Link } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";

const plans = [
  {
    key: "free", name: "Free", price: 0, color: "from-muted to-muted",
    feats: ["每日滑動 10 次", "基本配對", "聊天限配對"],
  },
  {
    key: "basic", name: "Basic", price: 8, color: "from-sky-400 to-primary",
    feats: ["每日滑動 50 次", "Super Like 3/天", "Boost 1/月", "查看 5 個喜歡你"],
  },
  {
    key: "premium", name: "Premium", price: 20, color: "from-amber-300 via-primary to-accent",
    feats: ["無限滑動 + 已讀回執", "Super Like 10/天 · Boost 1/週", "查看全部喜歡你", "語音破冰 · MBTI 篩選 · Passport"],
  },
];

type Step = "select" | "checkout" | "paying" | "done";

export default function Membership() {
  const [step, setStep] = useState<Step>("select");
  const [plan, setPlan] = useState("premium");
  const [yearly, setYearly] = useState(false);
  const [coin, setCoin] = useState<"USDT" | "USDC">("USDT");
  const [progress, setProgress] = useState(0);

  const sel = plans.find((p) => p.key === plan)!;
  const monthly = sel.price;
  const total = yearly ? Math.round(monthly * 12 * 0.7) : monthly;

  const pay = () => {
    setStep("paying"); setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); setStep("done"); return 100; }
        return p + 5;
      });
    }, 80);
  };

  return (
    <PhoneShell>
      <div className="h-full flex flex-col">
        <header className="h-14 px-3 flex items-center gap-3 shrink-0">
          <Link to="/profile" className="press p-2 rounded-full hover:bg-primary/10"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-bold">會員方案</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
          {step === "select" && (
            <>
              <div className="text-center pt-2 animate-slide-up">
                <Crown className="h-10 w-10 text-amber-300 mx-auto animate-float-up drop-shadow-[0_0_12px_hsl(var(--warning))]" />
                <h2 className="mt-2 text-2xl font-black text-gradient">解鎖完整體驗</h2>
                <p className="text-sm text-muted-foreground mt-1">使用 USDT / USDC 付款</p>
              </div>

              {/* 週期切換 */}
              <div className="mx-auto inline-flex p-1 rounded-full bg-muted self-center">
                <button onClick={() => setYearly(false)} className={`px-4 py-1.5 rounded-full text-xs ${!yearly ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>月付</button>
                <button onClick={() => setYearly(true)} className={`px-4 py-1.5 rounded-full text-xs flex items-center gap-1 ${yearly ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  年付 <span className="text-[10px] bg-success/30 text-success px-1.5 rounded-full">省 30%</span>
                </button>
              </div>

              {plans.map((p, i) => (
                <button key={p.key} onClick={() => setPlan(p.key)} style={{ animationDelay: `${i * 80}ms` }}
                  className={`animate-slide-up press w-full text-left rounded-3xl p-5 border-2 transition ${
                    plan === p.key ? "border-primary bg-gradient-to-br " + p.color + " bg-opacity-20 shadow-glow" : "border-border glass"
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{p.name}</p>
                    <p className="font-mono">{p.price === 0 ? "免費" : `$${p.price}/月`}</p>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {p.feats.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-foreground/80"><Check className="h-3 w-3 text-success" /> {f}</li>
                    ))}
                  </ul>
                </button>
              ))}

              {plan !== "free" && (
                <button onClick={() => setStep("checkout")} className="ripple press w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-glow">
                  繼續結帳 · ${total}
                </button>
              )}
            </>
          )}

          {step === "checkout" && (
            <div className="space-y-4 animate-slide-up">
              <div className="rounded-2xl glass border border-border p-4">
                <p className="text-xs text-muted-foreground">方案</p>
                <p className="font-bold">{sel.name} · {yearly ? "年付" : "月付"}</p>
                <p className="text-2xl font-black text-gradient mt-2">${total} {coin}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">付款幣種</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["USDT", "USDC"] as const).map((c) => (
                    <button key={c} onClick={() => setCoin(c)}
                      className={`press py-3 rounded-2xl border-2 ${coin === c ? "border-primary bg-primary/15" : "border-border"}`}>
                      <p className="font-bold">{c}</p>
                      <p className="text-[10px] text-muted-foreground">ERC-20</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-warning/10 border border-warning/30 p-3 text-[11px] text-warning leading-relaxed">
                ⚠️ 合約地址：0x1f9840…a584<br />
                請確認金額與合約地址，鏈上交易無法撤銷
              </div>

              <button onClick={pay} className="ripple press w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-bold shadow-glow">
                確認付款 ${total} {coin}
              </button>
              <button onClick={() => setStep("select")} className="press w-full py-2 text-sm text-muted-foreground">返回</button>
            </div>
          )}

          {step === "paying" && (
            <div className="text-center py-12 animate-pop-in">
              <div className="text-5xl mb-6 animate-spin-slow">⛓</div>
              <p className="font-bold mb-4">上鏈中…</p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">{progress}%</p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-8 animate-pop-in space-y-4">
              <div className="text-6xl animate-heart-beat">🎉</div>
              <h2 className="text-2xl font-black text-gradient">付款成功</h2>
              <p className="text-sm text-muted-foreground">已升級到 {sel.name}</p>
              <div className="rounded-2xl glass p-4 text-left text-sm space-y-2">
                <p className="text-xs text-muted-foreground">解鎖功能</p>
                {sel.feats.map((f) => (
                  <p key={f} className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-primary" /> {f}</p>
                ))}
              </div>
              <Link to="/profile" className="ripple press inline-block w-full py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold">回到我的</Link>
            </div>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
