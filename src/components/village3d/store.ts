import { create } from "zustand";

export type Quality = "high" | "medium" | "low";

/** Imperative camera commands, registered by the camera rig inside the canvas. */
export type CameraApi = {
  zoom: (factor: number) => void;
  home: () => void;
  focus: (id: string) => void;
  glideIn: (id: string) => Promise<void>;
  glideOut: () => Promise<void>;
};

type VillageState = {
  hover: string | null;
  treeHover: string | null;
  routeId: string | null;
  reduced: boolean;
  quality: Quality;
  gliding: boolean;
  active: boolean;
  celebrate: string | null;
  camera: CameraApi | null;
  setHover: (id: string | null) => void;
  setTreeHover: (id: string | null) => void;
  setRoute: (id: string | null) => void;
  setReduced: (v: boolean) => void;
  setQuality: (q: Quality) => void;
  setGliding: (v: boolean) => void;
  setActive: (v: boolean) => void;
  setCelebrate: (id: string | null) => void;
  setCamera: (api: CameraApi | null) => void;
};

export const useVillage = create<VillageState>()((set) => ({
  hover: null,
  treeHover: null,
  routeId: null,
  reduced: false,
  quality: "high",
  gliding: false,
  active: true,
  celebrate: null,
  camera: null,
  setHover: (hover) => set({ hover }),
  setTreeHover: (treeHover) => set({ treeHover }),
  setRoute: (routeId) => set({ routeId }),
  setReduced: (reduced) => set({ reduced }),
  setQuality: (quality) => set({ quality }),
  setGliding: (gliding) => set({ gliding }),
  setActive: (active) => set({ active }),
  setCelebrate: (celebrate) => set({ celebrate }),
  setCamera: (camera) => set({ camera }),
}));

/** DOM label elements, positioned every frame by the scene. */
export const labelEls = new Map<string, HTMLElement>();
export const treeLabelEls = new Map<string, HTMLElement>();
