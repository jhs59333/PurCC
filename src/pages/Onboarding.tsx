import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { PhoneShell } from "@/components/PhoneShell";
import { ALL_TAGS } from "@/lib/mock";
import { ArrowRight, Camera, Plus } from "lucide-react";

export default function Onboarding() {
  const nav = useNavigate();
  const { nickname, setNickname, tags, setTags, photos, setPhotos, setStage } = useApp();
  const [step, setStep] = useState(0); // 0=welcome,1,2,3
  const [error, setError] = useState("");

  const next = () => {
    if (step === 1 && nickname.trim().length < 1) { setError("請輸入暱稱"); return; }
    if (step === 2 && (tags.length < 3 || tags.length > 8)) { setError("請選 3 ~ 8 個標籤"); return; }
    setError("");
    if (step === 3) { setStage("app"); nav("/discover"); return; }
    setStep(step + 1);
  };

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : tags.length < 8 ? [...tags, t] : tags);
  };

  const progress = step === 0 ? 0 : (step / 3) * 100;

  return (
    <PhoneShell>
      <div className="h-full flex flex-col p-7">
        {step > 0 && (
          <div className="mb-6 animate-slide-down">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>步驟 {step} / 3</span>
              <button onClick={() => { setStage("app"); nav("/discover"); }} className="story-link">略過</button>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto" key={step}>
          {step === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-pop-in">
              <div className="text-7xl mb-4 animate-float-up">💜</div>
              <h2 className="text-3xl font-black text-gradient">歡迎來到 PurCC</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                一個讓每個人<br />都能開心分享生活的地方
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="animate-slide-right space-y-6 pt-4">
              <div>
                <h2 className="text-2xl font-bold">怎麼稱呼你？</h2>
                <p className="text-sm text-muted-foreground mt-1">這會出現在你的個人檔案上</p>
              </div>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="輸入你的暱稱"
                className="w-full bg-input border border-border rounded-2xl px-5 py-4 text-lg outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition"
                maxLength={20}
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-right space-y-4 pt-4">
              <div>
                <h2 className="text-2xl font-bold">你喜歡什麼？</h2>
                <p className="text-sm text-muted-foreground mt-1">選 3–8 個 · 已選 {tags.length}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((t, i) => {
                  const on = tags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      style={{ animationDelay: `${i * 30}ms` }}
                      className={`animate-tag-bounce press rounded-full px-4 py-2 text-sm border transition-all ${
                        on ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow scale-105" : "border-border text-foreground/80 hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-right space-y-4 pt-4">
              <div>
                <h2 className="text-2xl font-bold">加幾張照片吧</h2>
                <p className="text-sm text-muted-foreground mt-1">最多 4 張 · 可略過</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => {
                  const filled = i < photos;
                  return (
                    <button
                      key={i}
                      onClick={() => setPhotos(Math.min(4, photos + 1))}
                      className={`aspect-[3/4] rounded-2xl border-2 border-dashed grid place-items-center transition-all hover-lift ${
                        filled ? "bg-gradient-to-br from-primary/30 to-accent/30 border-primary/40" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {filled ? <Camera className="h-7 w-7 text-primary-glow" /> : <Plus className="h-6 w-6 text-muted-foreground" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-rose animate-pop-in">{error}</p>}
        </div>

        <button
          onClick={next}
          className="ripple press mt-6 w-full rounded-2xl bg-gradient-primary text-primary-foreground font-bold py-4 flex items-center justify-center gap-2 shadow-glow hover-lift"
        >
          {step === 0 ? "加入 PurCC" : step === 3 ? "開始探索" : "下一步"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </PhoneShell>
  );
}
