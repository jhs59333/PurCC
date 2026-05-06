import { create } from "zustand";

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
};

export const useApp = create<State>((set) => ({
  stage: "wallet",
  wallet: null,
  nickname: "",
  tags: [],
  photos: 0,
  setStage: (stage) => set({ stage }),
  setWallet: (wallet) => set({ wallet }),
  setNickname: (nickname) => set({ nickname }),
  setTags: (tags) => set({ tags }),
  setPhotos: (photos) => set({ photos }),
}));
