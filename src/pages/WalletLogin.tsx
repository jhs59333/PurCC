import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { PhoneShell } from "@/components/PhoneShell";
import { Loader2, Mail, Sparkles, Wallet } from "lucide-react";

type Step = 0 | 1 | 2 | 3;

export default function WalletLogin() {
  const nav = useNavigate();
  const setWallet = useApp((s) => s.setWallet);
  const setStage = useApp((s) => s.setStage);
  const [step, setStep] = useState<Step>(0);
  const [chosen, setChosen] = useState<"meta" | "trust" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = async (kind: "meta" | "trust") => {
    setChosen(kind); setError(null); setStep(1);
    await new Promise((r) => setTimeout(r, 1100));
    setStep(2);
    await new Promise((r) => setTimeout(r, 1100));
    if (Math.random() < 0.1) { setError("簽名驗證失敗，請再試一次"); setStep(0); setChosen(null); return; }
    setStep(3);
    await new Promise((r) => setTimeout(r, 900));
    setWallet({ name: kind === "meta" ? "MetaMask" : "Trust Wallet", address: "0x1a2b···c3d4" });
    setStage("onboarding");
    nav("/onboarding");
  };

  const emailLogin = () => { setStage("onboarding"); nav("/onboarding"); };

  return (
    <PhoneShell>
      <div className="h-full flex flex-col items-center justify-between px-7 py-12">
        <div className="text-center animate-slide-down">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-primary grid place-items-center text-3xl shadow-glow animate-logo-pulse">
            💜
          </div>
          <h1 className="mt-5 text-4xl font-black text-gradient">PurCC</h1>
          <p className="mt-2 text-sm text-muted-foreground">溫暖的地方，等你來分享</p>
        </div>

        {step === 0 && (
          <div className="w-full space-y-3 animate-slide-up">
            {error && <p className="text-center text-sm text-rose animate-pop-in">{error}</p>}
            <button
              onClick={() => connect("meta")}
              className="ripple press w-full rounded-2xl p-4 flex items-center gap-3 bg-gradient-to-r from-orange-500/90 to-amber-400/90 text-white font-medium shadow-soft hover-lift"
            >
              <Wallet className="h-5 w-5" /> 使用 MetaMask 連接
              <span className="ml-auto text-xs opacity-80">Ethereum</span>
            </button>
            <button
              onClick={() => connect("trust")}
              className="ripple press w-full rounded-2xl p-4 flex items-center gap-3 bg-gradient-to-r from-blue-500/90 to-cyan-400/90 text-white font-medium shadow-soft hover-lift"
            >
              <Wallet className="h-5 w-5" /> 使用 Trust Wallet 連接
              <span className="ml-auto text-xs opacity-80">Multi-Chain</span>
            </button>
            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">或</span>
              <span className="flex-1 h-px bg-border" />
            </div>
            <button onClick={emailLogin} className="ripple press w-full rounded-2xl p-4 flex items-center gap-3 glass border border-primary/20 text-foreground/90">
              <Mail className="h-5 w-5 text-primary" /> 使用 Email 登入
            </button>
            <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
              🔒 我們僅使用簽名驗證身份<br />不會存取或轉移你的資產
            </p>
          </div>
        )}

        {step > 0 && (
          <div className="w-full space-y-6 animate-pop-in">
            {[
              { n: 1, label: "連接錢包" },
              { n: 2, label: "簽名驗證" },
              { n: 3, label: "載入身份" },
            ].map((s) => {
              const done = step > s.n;
              const active = step === s.n;
              return (
                <div key={s.n} className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full grid place-items-center font-bold transition-all ${
                    done ? "bg-success text-white scale-100" :
                    active ? "bg-gradient-primary text-white animate-glow scale-110" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {active ? <Loader2 className="h-5 w-5 animate-spin" /> : done ? "✓" : s.n}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${active ? "text-primary-glow" : done ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </p>
                    <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full bg-gradient-primary transition-all duration-700 ${done ? "w-full" : active ? "w-2/3" : "w-0"}`} />
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" /> 正在以 {chosen === "meta" ? "MetaMask" : "Trust Wallet"} 安全登入…
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/70">繼續即同意服務條款 · v1.0</p>
      </div>
    </PhoneShell>
  );
}
