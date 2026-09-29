import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  read: string[];
  mark: (id: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      read: [],
      mark: (id) =>
        set((state) =>
          state.read.includes(id) ? state : { read: [...state.read, id] },
        ),
      reset: () => set({ read: [] }),
    }),
    { name: "s4-illustrated-progress" },
  ),
);
