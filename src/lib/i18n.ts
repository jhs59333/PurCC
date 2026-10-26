import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "zh" | "en";

export const useLang = create<{ lang: Lang; toggle: () => void }>()(
  persist((set, get) => ({ lang: "zh", toggle: () => set({ lang: get().lang === "zh" ? "en" : "zh" }) }), { name: "purcc-lang" }),
);

/** t("中文", "English") */
export function useT() {
  const lang = useLang((s) => s.lang);
  return (zh: string, en: string) => (lang === "en" ? en : zh);
}
