import { useState } from "react";
import { Sliders, X, RotateCcw } from "lucide-react";
import type { DiscoverTuning } from "@/lib/tuning";
import { DEFAULT_TUNING } from "@/lib/tuning";

type Props = {
  tuning: DiscoverTuning;
  onChange: <K extends keyof DiscoverTuning>(k: K, v: DiscoverTuning[K]) => void;
  onReset: () => void;
};

const FIELDS: {
  key: keyof DiscoverTuning;
  label: string;
  min: number;
  max: number;
  step: number;
  hint: string;
}[] = [
  { key: "swipeThreshold", label: "觸發門檻", min: 60, max: 240, step: 5, hint: "拖多遠會送出" },
  { key: "stampFull", label: "戳記滿格距離", min: 30, max: 200, step: 5, hint: "LIKE/PASS 完全顯示" },
  { key: "maxRotate", label: "最大旋轉", min: 0, max: 35, step: 1, hint: "卡片傾斜角度" },
  { key: "perspective", label: "3D 透視強度", min: 15, max: 90, step: 1, hint: "數字越小越立體（反向）" },
  { key: "parallax", label: "視差強度", min: 0, max: 0.3, step: 0.01, hint: "頭像跟隨偏移" },
  { key: "liftMax", label: "上拖距離", min: 40, max: 200, step: 5, hint: "Super Like 最大上拉" },
];

export function TuningPanel({ tuning, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 浮動觸發鈕 */}
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-[156px] right-4 z-30 grid place-items-center h-11 w-11 rounded-full glass-strong border border-primary/40 shadow-glow press"
        aria-label="調參面板"
      >
        <Sliders className="h-5 w-5 text-primary-glow" />
      </button>

      {open && (
        <div className="absolute inset-0 z-40 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full glass-strong rounded-t-3xl p-5 max-h-[80%] overflow-y-auto border-t border-primary/30"
            style={{ animation: "sheetUp .3s cubic-bezier(.2,.9,.3,1.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-lg font-bold text-gradient">滑卡調參</h3>
                <p className="text-[11px] text-muted-foreground">即時生效・自動保存</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onReset} className="press flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary/60 hover:text-primary-glow">
                  <RotateCcw className="h-3.5 w-3.5" /> 重設
                </button>
                <button onClick={() => setOpen(false)} className="press grid place-items-center h-8 w-8 rounded-full bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {FIELDS.map((f) => {
                const val = tuning[f.key] as number;
                const isDefault = val === (DEFAULT_TUNING[f.key] as number);
                return (
                  <div key={f.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{f.label}</span>
                      <span className={`tabular-nums font-mono ${isDefault ? "text-muted-foreground" : "text-primary-glow"}`}>
                        {f.step < 1 ? val.toFixed(2) : Math.round(val)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={val}
                      onChange={(e) => onChange(f.key, Number(e.target.value) as never)}
                      className="w-full mt-1 accent-primary"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.hint}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-muted-foreground leading-relaxed">
              💡 試試在卡片上拖拽，所有變化都會即時反映。設定保存於本機，不影響其他裝置。
            </div>
          </div>
        </div>
      )}
    </>
  );
}
