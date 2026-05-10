import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Stage = "wallet" | "onboarding" | "app";

type State = {
  stage: Stage;
  wallet: { name: string; address: string } | null;
  nickname: string;
  tags: string[];
  photos: number;
  setStage: (s: Stage) => void;
  setWallet: (w: { name: string; address: string } | null) => void;
  setNickname: (n: string) => void;
  setTags: (t: string[]) => void;
  setPhotos: (n: number) => void;
  reset: () => void;
};

const initial = {
  stage: "wallet" as Stage,
  wallet: null,
  nickname: "",
  tags: [] as string[],
  photos: 0,
};

export const useApp = create<State>()(
  persist(
    (set) => ({
      ...initial,
      setStage: (stage) => set({ stage }),
      setWallet: (wallet) => set({ wallet }),
      setNickname: (nickname) => set({ nickname }),
      setTags: (tags) => set({ tags }),
      setPhotos: (photos) => set({ photos }),
      reset: () => set(initial),
    }),
    {
      name: "purcc-app",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
