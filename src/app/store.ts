import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Oshi {
  id: string;
  nickname: string;
  youtubeChannel: string;
}

export interface Anniversary {
  id: string;
  date: string; // MM-DD
  label: string;
}

export interface StampRecord {
  date: string; // YYYY-MM-DD
  oshiId: string;
}

export interface AppState {
  // Auth
  user: { name: string; email: string; avatar: string } | null;
  isOshi: boolean;
  setUser: (user: AppState['user']) => void;
  setIsOshi: (v: boolean) => void;

  // Fan
  oshiList: Oshi[];
  selectedOshiId: string | null;
  addOshi: (o: Oshi) => void;
  removeOshi: (id: string) => void;
  selectOshi: (id: string) => void;

  // Anniversaries
  anniversaries: Anniversary[];
  addAnniversary: (a: Anniversary) => void;
  removeAnniversary: (id: string) => void;

  // Paper airplane
  hasTodayPaper: boolean;
  todaySent: boolean;
  sendPaper: () => void;
  resetDaily: () => void;

  // Stamps
  stamps: StampRecord[];
  addStamp: (s: StampRecord) => void;
  stampCardImage: string | null;
  setStampCardImage: (url: string | null) => void;
}

const today = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isOshi: false,
      setUser: (user) => set({ user }),
      setIsOshi: (v) => set({ isOshi: v }),

      oshiList: [],
      selectedOshiId: null,
      addOshi: (o) => set((s) => ({ oshiList: [...s.oshiList, o], selectedOshiId: o.id })),
      removeOshi: (id) => set((s) => ({
        oshiList: s.oshiList.filter((o) => o.id !== id),
        selectedOshiId: s.selectedOshiId === id
          ? (s.oshiList.find((o) => o.id !== id)?.id ?? null)
          : s.selectedOshiId,
      })),
      selectOshi: (id) => set({ selectedOshiId: id }),

      anniversaries: [],
      addAnniversary: (a) => set((s) => ({ anniversaries: [...s.anniversaries, a] })),
      removeAnniversary: (id) => set((s) => ({ anniversaries: s.anniversaries.filter((a) => a.id !== id) })),

      hasTodayPaper: true,
      todaySent: false,
      sendPaper: () => {
        const s = get();
        if (!s.selectedOshiId) return;
        s.addStamp({ date: today(), oshiId: s.selectedOshiId });
        set({ todaySent: true });
      },
      resetDaily: () => set({ hasTodayPaper: true, todaySent: false }),

      stamps: [],
      addStamp: (stamp) => set((s) => ({ stamps: [...s.stamps, stamp] })),
      stampCardImage: null,
      setStampCardImage: (url) => set({ stampCardImage: url }),
    }),
    {
      name: 'sokusai-storage',
      partialize: (s) => ({
        oshiList: s.oshiList,
        anniversaries: s.anniversaries,
        stamps: s.stamps,
        stampCardImage: s.stampCardImage,
        selectedOshiId: s.selectedOshiId,
      }),
    }
  )
);