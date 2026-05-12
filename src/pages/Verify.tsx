import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneShell } from "@/components/PhoneShell";
import { useApp } from "@/lib/store";
import { ShieldCheck, Camera, MoveRight, Check, Sparkles, RefreshCcw } from "lucide-react";

type Step = "intro" | "captcha" | "liveness" | "done";

export default function Verify() {
  const nav = useNavigate();
  const { setVerified, setStage } = useApp();
  const [step, setStep] = useState<Step>("intro");

  // ---- 行為驗證碼（滑塊拼圖）----
  const trackRef = useRef<HTMLDivElement>(null);
  const [slideX, setSlideX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [target] = useState(() => 60 + Math.floor(Math.random() * 30)); // 60~90% 位置
  const [trail, setTrail] = useState<number[]>([]); // 紀錄移動間隔，偵測機器人
  const lastT = useRef<number>(0);
  const [captchaErr, setCaptchaErr] = useState("");

  const onSlideStart = () => { setDragging(true); setTrail([]); lastT.current = performance.now(); };
  const onSlideMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    setSlideX(pct);
    const now = performance.now();
    setTrail((t) => [...t, now - lastT.current].slice(-40));
    lastT.current = now;
  };
  const onSlideEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const diff = Math.abs(slideX - target);
    // 機器人偵測：移動樣本太少或時間間隔過於均勻
    const samples = trail.length;
    const uniform = samples > 4 && new Set(trail.map((t) => Math.round(t))).size <= 2;
    if (diff > 6) { setCaptchaErr("位置不對，請對準缺口再試一次"); resetCaptcha(); return; }
    if (samples < 6) { setCaptchaErr("偵測到非人類行為，請手動拖曳"); resetCaptcha(); return; }
    if (uniform) { setCaptchaErr("移動軌跡過於規律，請重試"); resetCaptcha(); return; }
    setCaptchaErr("");
    setTimeout(() => setStep("liveness"), 300);
  };
  const resetCaptcha = () => setTimeout(() => setSlideX(0), 400);

  // ---- 活體偵測模擬 ----
  const [livePhase, setLivePhase] = useState<"idle" | "scan" | "blink" | "smile" | "ok">("idle");
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (livePhase === "idle" || livePhase === "ok") return;
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          if (livePhase === "scan") setLivePhase("blink");
          else if (livePhase === "blink") setLivePhase("smile");
          else if (livePhase === "smile") setLivePhase("ok");
          return 0;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(t);
  }, [livePhase]);
  useEffect(() => {
    if (livePhase === "ok") setTimeout(() => setStep("done"), 800);
  }, [livePhase]);

  // ---- 完成 ----
  const finish = () => {
    setVerified(true);
    setStage("app");
    nav("/discover", { replace: true });
  };

  return (
    <PhoneShell>
      <div className="h-full flex flex-col p-7">
        <div className="mb-4">
          <p className="text-xs text-muted-foreground">PurCC 安全中心</p>
          <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
            <ShieldCheck className="h-6 w-6 text-primary-glow" /> 真人驗證
          </h1>
        </div>

        {step === "intro" && (
          <div className="flex-1 space-y-4 animate-pop-in">
            <div className="rounded-3xl glass border border-primary/30 p-5">
              <p className="text-sm leading-relaxed">
                為了讓每位用戶都能安心交友，PurCC 需要驗證你是真人。
                完成後將獲得 <span className="text-success font-bold">已驗證</span> 徽章，
                並提升你的信任分數。
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              {[
                ["行為驗證碼", "用滑塊拼圖確認你不是機器人"],
                ["活體偵測", "模擬掃臉、眨眼、微笑"],
                ["保護隱私", "不會分享你的影像給其他用戶"],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3 rounded-2xl glass border border-border p-3">
                  <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setStep("captcha")}
              className="ripple press w-full rounded-2xl bg-gradient-primary text-primary-foreground font-bold py-4 shadow-glow"
            >
              開始驗證
            </button>
          </div>
        )}

        {step === "captcha" && (
          <div className="flex-1 space-y-5 animate-slide-right">
            <div>
              <h2 className="text-lg font-bold">第 1 步 · 滑動拼圖</h2>
              <p className="text-xs text-muted-foreground mt-1">將拼圖滑到對應的缺口位置</p>
            </div>

            {/* 拼圖區 */}
            <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-rose/20 border border-border">
              {/* 缺口 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-16 w-16 rounded-xl bg-background/80 border-2 border-dashed border-primary/60"
                style={{ left: `calc(${target}% - 32px)` }}
              />
              {/* 拼圖塊 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-16 w-16 rounded-xl bg-gradient-primary shadow-glow grid place-items-center text-2xl"
                style={{ left: `calc(${slideX}% - 32px)`, transition: dragging ? "none" : "left .3s" }}
              >
                💜
              </div>
            </div>

            {/* 滑桿 */}
            <div
              ref={trackRef}
              onPointerDown={onSlideStart}
              onPointerMove={onSlideMove}
              onPointerUp={onSlideEnd}
              onPointerCancel={onSlideEnd}
              className="relative h-12 rounded-full bg-input border border-border touch-none select-none"
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gradient-primary grid place-items-center shadow-glow cursor-grab active:cursor-grabbing"
                style={{ left: `calc(${slideX}% - 20px)`, transition: dragging ? "none" : "left .3s" }}
              >
                <MoveRight className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="absolute inset-0 grid place-items-center text-xs text-muted-foreground pointer-events-none">
                {dragging ? "對準缺口後鬆開" : "按住向右滑動"}
              </span>
            </div>

            {captchaErr && (
              <p className="text-sm text-rose flex items-center gap-1 animate-pop-in">
                <RefreshCcw className="h-3 w-3" /> {captchaErr}
              </p>
            )}
          </div>
        )}

        {step === "liveness" && (
          <div className="flex-1 space-y-5 animate-slide-right">
            <div>
              <h2 className="text-lg font-bold">第 2 步 · 活體偵測</h2>
              <p className="text-xs text-muted-foreground mt-1">依指示完成動作即可</p>
            </div>

            <div className="relative aspect-square mx-auto w-full max-w-[280px] rounded-full overflow-hidden border-4 border-primary/40 bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center">
              <Camera className="h-16 w-16 text-primary-glow/60" />
              {/* 掃描線 */}
              {livePhase !== "idle" && livePhase !== "ok" && (
                <div
                  className="absolute left-0 right-0 h-1 bg-primary-glow shadow-glow"
                  style={{ top: `${progress}%`, transition: "top .06s linear" }}
                />
              )}
              {livePhase === "ok" && (
                <div className="absolute inset-0 grid place-items-center bg-success/20 animate-pop-in">
                  <Check className="h-20 w-20 text-success" strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="rounded-2xl glass border border-primary/30 p-4 text-center">
              <p className="text-sm font-medium">
                {livePhase === "idle" && "請面對鏡頭，按下開始"}
                {livePhase === "scan" && "正在掃描臉部…"}
                {livePhase === "blink" && "請眨眼 👁️"}
                {livePhase === "smile" && "請微笑 😊"}
                {livePhase === "ok" && "驗證成功！"}
              </p>
              {livePhase !== "idle" && livePhase !== "ok" && (
                <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>

            {livePhase === "idle" && (
              <button
                onClick={() => setLivePhase("scan")}
                className="ripple press w-full rounded-2xl bg-gradient-primary text-primary-foreground font-bold py-4 shadow-glow"
              >
                開始活體偵測
              </button>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-pop-in">
            <div className="relative mb-6">
              <ShieldCheck className="h-24 w-24 text-success animate-heart-beat" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary-glow" />
            </div>
            <h2 className="text-2xl font-black text-gradient">驗證通過！</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              你已獲得「已驗證」徽章<br />信任分數 +10，配對更容易被看見
            </p>
            <button
              onClick={finish}
              className="ripple press mt-6 w-full rounded-2xl bg-gradient-primary text-primary-foreground font-bold py-4 shadow-glow"
            >
              開始探索
            </button>
          </div>
        )}
      </div>
    </PhoneShell>
  );
}
