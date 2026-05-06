import { useEffect, useState } from "react";

export type DiscoverTuning = {
  swipeThreshold: number;   // 觸發門檻 px
  stampFull: number;        // 戳記完全顯示距離 px
  maxRotate: number;        // 最大旋轉角度
  perspective: number;      // 3D 透視強度（rotateY 分母越小越強）
  parallax: number;         // 視差強度 0~0.3
  liftMax: number;          // 上拖最大距離
};

export const DEFAULT_TUNING: DiscoverTuning = {
  swipeThreshold: 120,
  stampFull: 90,
  maxRotate: 18,
  perspective: 40,
  parallax: 0.08,
  liftMax: 120,
};

const KEY = "purcc:discover-tuning";

export function useDiscoverTuning() {
  const [tuning, setTuning] = useState<DiscoverTuning>(() => {
    if (typeof window === "undefined") return DEFAULT_TUNING;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT_TUNING;
      return { ...DEFAULT_TUNING, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_TUNING;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(tuning)); } catch {}
  }, [tuning]);

  const update = <K extends keyof DiscoverTuning>(k: K, v: DiscoverTuning[K]) =>
    setTuning((t) => ({ ...t, [k]: v }));

  const reset = () => setTuning(DEFAULT_TUNING);

  return { tuning, update, reset, setTuning };
}
