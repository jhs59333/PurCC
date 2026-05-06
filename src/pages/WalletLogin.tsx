import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { PhoneShell } from "@/components/PhoneShell";
import { AlertTriangle, Download, Loader2, Mail, RefreshCw, Sparkles, Wallet, X } from "lucide-react";

type Step = 0 | 1 | 2 | 3;
type WalletKind = "meta" | "trust";

type FailKind = "not_installed" | "wrong_network" | "user_rejected" | "sign_failed" | "timeout";

interface FailInfo {
  kind: FailKind;
  title: string;
  message: string;
  primaryLabel: string;
  primaryAction: "retry" | "install" | "switch";
  helpUrl?: string;
}

const FAIL_TEMPLATES: Record<FailKind, Omit<FailInfo, "kind">> = {
  not_installed: {
    title: "找不到錢包擴充功能",
    message: "請先安裝錢包，然後重新整理頁面再試一次。",
    primaryLabel: "前往安裝",
    primaryAction: "install",
  },
  wrong_network: {
    title: "目前不在 Ethereum 主網",
    message: "請在錢包中切換到 Ethereum Mainnet（Chain ID: 1）後重試。",
    primaryLabel: "切換網路並重試",
    primaryAction: "switch",
  },
  user_rejected: {
    title: "你取消了簽名請求",
    message: "我們僅使用簽名驗證身份，不會動到任何資產。",
    primaryLabel: "再試一次",
    primaryAction: "retry",
  },
  sign_failed: {
    title: "簽名驗證失敗",
    message: "可能是網路不穩或錢包回應異常，請再試一次。",
    primaryLabel: "再試一次",
    primaryAction: "retry",
  },
  timeout: {
    title: "錢包未回應",
    message: "等候錢包回應逾時，請確認錢包視窗已開啟後重試。",
    primaryLabel: "再試一次",
    primaryAction: "retry",
  },
};

// Simulate weighted random failures so each error path is reachable in the demo.
function pickFailure(): FailKind | null {
  const r = Math.random();
  if (r < 0.04) return "not_installed";
  if (r < 0.08) return "wrong_network";
  if (r < 0.12) return "user_rejected";
  if (r < 0.15) return "sign_failed";
  if (r < 0.17) return "timeout";
  return null;
}

const INSTALL_URL: Record<WalletKind, string> = {
  meta: "https://metamask.io/download/",
  trust: "https://trustwallet.com/download",
};

export default function WalletLogin() {
  const nav = useNavigate();
  const setWallet = useApp((s) => s.setWallet);
  const setStage = useApp((s) => s.setStage);
  const [step, setStep] = useState<Step>(0);
  const [chosen, setChosen] = useState<WalletKind | null>(null);
  const [fail, setFail] = useState<FailInfo | null>(null);

  const reset = () => {
    setStep(0);
    setChosen(null);
  };

  const triggerFail = (kind: FailKind) => {
    setFail({ kind, ...FAIL_TEMPLATES[kind] });
    reset();
  };

  const connect = async (kind: WalletKind) => {
    setChosen(kind);
    setFail(null);
    setStep(1);

    // Step 1 — connect wallet (could fail with not_installed / user_rejected / timeout)
    await new Promise((r) => setTimeout(r, 1100));
    const earlyFail = pickFailure();
    if (earlyFail === "not_installed" || earlyFail === "timeout") {
      triggerFail(earlyFail);
      return;
    }

    setStep(2);
    // Step 2 — sign (could fail with wrong_network / user_rejected / sign_failed)
    await new Promise((r) => setTimeout(r, 1100));
    const lateFail = earlyFail ?? pickFailure();
    if (lateFail && lateFail !== "not_installed" && lateFail !== "timeout") {
      triggerFail(lateFail);
      return;
    }

    setStep(3);
    await new Promise((r) => setTimeout(r, 900));
    setWallet({ name: kind === "meta" ? "MetaMask" : "Trust Wallet", address: "0x1a2b···c3d4" });
    setStage("onboarding");
    nav("/onboarding");
  };

  const handleFailPrimary = () => {
    if (!fail || !chosen) {
      // Default: just dismiss
      setFail(null);
      return;
    }
    if (fail.primaryAction === "install") {
      window.open(INSTALL_URL[chosen], "_blank", "noopener,noreferrer");
      return;
    }
    // retry / switch — kick off connect again with same wallet
    setFail(null);
    connect(chosen);
  };

  const emailLogin = () => {
    setStage("onboarding");
    nav("/onboarding");
  };

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
            {fail && (
              <div
                role="alert"
                className="relative rounded-2xl border border-rose/30 bg-rose/10 p-4 pr-10 animate-pop-in"
              >
                <button
                  onClick={() => setFail(null)}
                  aria-label="關閉錯誤訊息"
                  className="absolute top-2 right-2 p-1 rounded-md text-rose/80 hover:bg-rose/10"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-rose shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-rose">{fail.title}</p>
                    <p className="text-xs text-foreground/75 mt-1 leading-relaxed">{fail.message}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={handleFailPrimary}
                        className="press inline-flex items-center gap-1.5 rounded-lg bg-rose px-3 py-1.5 text-xs font-medium text-white"
                      >
                        {fail.primaryAction === "install" ? (
                          <Download className="h-3.5 w-3.5" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        {fail.primaryLabel}
                      </button>
                      <button
                        onClick={emailLogin}
                        className="press inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground/80"
                      >
                        改用 Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            <button
              onClick={reset}
              className="mx-auto block text-[11px] text-muted-foreground/80 underline-offset-2 hover:underline"
            >
              取消並返回
            </button>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/70">繼續即同意服務條款 · v1.0</p>
      </div>
    </PhoneShell>
  );
}
