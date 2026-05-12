import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Stage = "wallet" | "onboarding" | "verify" | "app";

type State = {
  stage: Stage;
  wallet: { name: string; address: string } | null;
  nickname: string;
  tags: string[];
  photos: number;
  verified: boolean;
  verifiedAt: number | null;
  blocked: string[];
  setStage: (s: Stage) => void;
  setWallet: (w: { name: string; address: string } | null) => void;
  setNickname: (n: string) => void;
  setTags: (t: string[]) => void;
  setPhotos: (n: number) => void;
  setVerified: (v: boolean) => void;
  toggleBlock: (id: string) => void;
  reset: () => void;
};

const initial = {
  stage: "wallet" as Stage,
  wallet: null,
  nickname: "",
  tags: [] as string[],
  photos: 0,
  verified: false,
  verifiedAt: null as number | null,
  blocked: [] as string[],
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setStage: (stage) => set({ stage }),
      setWallet: (wallet) => set({ wallet }),
      setNickname: (nickname) => set({ nickname }),
      setTags: (tags) => set({ tags }),
      setPhotos: (photos) => set({ photos }),
      setVerified: (verified) =>
        set({ verified, verifiedAt: verified ? Date.now() : null }),
      toggleBlock: (id) => {
        const cur = get().blocked;
        set({ blocked: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
      },
      reset: () => set(initial),
    }),
    {
      name: "purcc-app",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
