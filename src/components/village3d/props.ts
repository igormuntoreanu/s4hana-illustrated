import { DodecahedronGeometry } from "three";
import type * as THREE from "three";
import type { Item, MoverKind, PropKind } from "@/data/village-scene";
import { Builder, shade } from "./geo";
import { PAL } from "./buildings";

type B = Builder;

const WOOD = "#9a6b3e";
const WOOD_LIGHT = "#c49a5c";
const CRATE = "#c89a5a";

function crate(b: B, x = 0, y = 0, z = 0, s = 0.7, ry = 0) {
  b.group({ x, y, z, ry }, () => {
    b.box(s, s, s, CRATE);
    b.cbox(s + 0.02, 0.08, s + 0.02, shade(CRATE, 0.75), { y: s * 0.5 });
    b.cbox(0.08, s + 0.02, s + 0.02, shade(CRATE, 0.75), { y: s / 2 });
  });
}

function barrel(b: B, x = 0, z = 0) {
  b.cyl(0.32, 0.28, 0.9, 8, "#8a5a32", { x, z });
  for (const y of [0.15, 0.7]) b.cyl(0.34, 0.34, 0.06, 8, PAL.darkMetal, { x, y, z });
}

function table(b: B, w: number, d: number, h: number, top: string) {
  for (const [x, z] of [
    [-w / 2 + 0.08, -d / 2 + 0.08],
    [w / 2 - 0.08, -d / 2 + 0.08],
    [-w / 2 + 0.08, d / 2 - 0.08],
    [w / 2 - 0.08, d / 2 - 0.08],
  ]) {
    b.box(0.1, h, 0.1, WOOD, { x, z });
  }
  b.box(w, 0.1, d, top, { y: h });
}

function wheel(b: B, x: number, y: number, z: number, r = 0.35, color = PAL.timberDark) {
  b.cyl(r, r, 0.1, 10, color, { x, y: y - 0.05, z, rz: Math.PI / 2, sy: 1 });
  b.cyl(r * 0.3, r * 0.3, 0.14, 6, PAL.darkMetal, { x, y: y - 0.07, z, rz: Math.PI / 2 });
}

const PROPS: Record<PropKind, (b: B) => void> = {
  draftTable(b) {
    for (const x of [-0.5, 0.5]) b.box(0.08, 0.9, 0.08, WOOD, { x });
    b.cbox(1.3, 0.06, 0.9, WOOD_LIGHT, { y: 0.95, rx: -0.35 });
    b.cbox(1.0, 0.02, 0.7, "#3f6fb8", { y: 0.99, z: 0.01, rx: -0.35 });
    b.cbox(0.7, 0.02, 0.02, "#fffaf3", { y: 1.02, z: 0.05, rx: -0.35 });
  },
  blueprintBoard(b) {
    for (const x of [-0.6, 0.6]) b.box(0.08, 1.9, 0.08, WOOD, { x });
    b.cbox(1.5, 1.0, 0.06, "#2f5d9a", { y: 1.35 });
    b.cbox(1.1, 0.04, 0.08, "#fffaf3", { y: 1.5 });
    b.cbox(0.04, 0.6, 0.08, "#fffaf3", { x: -0.2, y: 1.3 });
    b.cbox(0.5, 0.3, 0.08, "#a9d3e6", { x: 0.3, y: 1.15 });
  },
  prototype(b) {
    b.cyl(0.4, 0.45, 0.7, 8, PAL.stone);
    b.group({ y: 1.05 }, () => {
      b.cyl(0.3, 0.3, 0.1, 10, PAL.gold, { rx: Math.PI / 2, y: -0.05 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.cbox(0.12, 0.12, 0.1, PAL.gold, { x: Math.cos(a) * 0.34, y: Math.sin(a) * 0.34 });
      }
    });
  },
  ledgerDesk(b) {
    table(b, 1.4, 0.8, 0.8, "#7a5234");
    b.box(0.6, 0.12, 0.45, PAL.cream, { x: -0.25, y: 0.9 });
    b.box(0.08, 0.14, 0.4, PAL.red, { x: -0.25, y: 0.9 });
    b.box(0.3, 0.2, 0.3, "#2a2a2a", { x: 0.4, y: 0.9 });
  },
  coinChest(b) {
    b.box(0.9, 0.55, 0.6, "#7a4a2a");
    b.cbox(0.94, 0.08, 0.64, PAL.gold, { y: 0.3 });
    for (let i = 0; i < 5; i++) b.cyl(0.13, 0.13, 0.05, 8, PAL.gold, { x: -0.25 + i * 0.12, y: 0.55 + (i % 2) * 0.05, z: (i % 3) * 0.08 - 0.08 });
  },
  coinCart(b) {
    b.box(1.2, 0.5, 0.8, WOOD, { y: 0.35 });
    b.box(1.0, 0.2, 0.6, PAL.gold, { y: 0.8 });
    wheel(b, -0.66, 0.35, 0, 0.35);
    wheel(b, 0.66, 0.35, 0, 0.35);
  },
  noticeBoard(b) {
    for (const x of [-0.7, 0.7]) b.box(0.1, 1.9, 0.1, WOOD, { x });
    b.cbox(1.6, 1.0, 0.08, "#b98b58", { y: 1.35 });
    const notes = ["#fffaf3", "#f6cf7c", "#fffaf3", "#e8b9a6", "#fffaf3"];
    notes.forEach((c, i) => b.cbox(0.3, 0.36, 0.04, c, { x: -0.55 + i * 0.28, y: 1.35 + ((i % 2) - 0.5) * 0.3, z: 0.06 }));
    b.prism(1.8, 0.4, 0.25, PAL.terracotta, { y: 1.88 });
  },
  desk(b) {
    table(b, 1.3, 0.7, 0.8, "#8a5a32");
    b.box(0.5, 0.06, 0.35, PAL.cream, { y: 0.9 });
    b.box(0.12, 0.2, 0.12, PAL.red, { x: 0.4, y: 0.9 });
  },
  bench(b) {
    for (const x of [-0.7, 0.7]) b.box(0.1, 0.4, 0.4, WOOD, { x });
    b.box(1.7, 0.08, 0.45, WOOD_LIGHT, { y: 0.4 });
  },
  wagon(b) {
    b.box(2.2, 0.15, 1.2, WOOD, { y: 0.55 });
    for (const s of [-1, 1]) b.box(2.2, 0.35, 0.08, WOOD_LIGHT, { y: 0.7, z: s * 0.56 });
    b.box(0.08, 0.35, 1.2, WOOD_LIGHT, { x: -1.06, y: 0.7 });
    crate(b, -0.5, 0.7, 0, 0.55, 0.2);
    crate(b, 0.3, 0.7, -0.2, 0.55, -0.1);
    crate(b, 0.2, 1.25, 0.1, 0.45, 0.4);
    for (const x of [-0.7, 0.7]) for (const z of [-0.65, 0.65]) wheel(b, x, 0.4, z, 0.4);
    b.cbox(1.2, 0.06, 0.06, WOOD, { x: 1.7, y: 0.5, z: 0.3 });
    b.cbox(1.2, 0.06, 0.06, WOOD, { x: 1.7, y: 0.5, z: -0.3 });
  },
  crate(b) {
    crate(b);
  },
  crateStack(b) {
    crate(b, -0.4, 0, 0, 0.7, 0.1);
    crate(b, 0.4, 0, 0.05, 0.7, -0.1);
    crate(b, 0, 0.7, 0, 0.7, 0.25);
    crate(b, 0.1, 0, -0.75, 0.6, 0.4);
  },
  barrel(b) {
    barrel(b);
  },
  stall(b) {
    for (const [x, z] of [
      [-0.8, -0.5],
      [0.8, -0.5],
      [-0.8, 0.5],
      [0.8, 0.5],
    ]) {
      b.box(0.08, 1.9, 0.08, WOOD, { x, z });
    }
    b.box(1.8, 0.8, 1.1, "#9a6b3e");
    const goods = ["#e15a1c", "#e3b341", "#8fae5a", "#d94b62", "#f1e3c3"];
    goods.forEach((c, i) => b.ball(0.16, 0, c, { x: -0.6 + i * 0.3, y: 0.95, z: 0.15 * ((i % 2) * 2 - 1) }));
    for (let i = 0; i < 6; i++) {
      b.cbox(2.0 / 6, 0.06, 1.4, i % 2 ? PAL.cream : "#2f8a7a", { x: -1.0 + 1 / 6 + (i * 2) / 6, y: 2.0, rx: 0.12 });
    }
  },
  parcelStack(b) {
    const cols = ["#c89a5a", "#b88a4e", "#d9b07a"];
    for (let i = 0; i < 5; i++) {
      b.box(0.45, 0.35, 0.4, cols[i % 3], { x: (i % 3) * 0.48 - 0.48, y: i >= 3 ? 0.35 : 0, z: i >= 3 ? 0.05 : 0, ry: i * 0.3 });
      b.cbox(0.47, 0.04, 0.06, PAL.red, { x: (i % 3) * 0.48 - 0.48, y: (i >= 3 ? 0.35 : 0) + 0.36, ry: i * 0.3 });
    }
  },
  shelf(b) {
    for (const x of [-0.7, 0.7]) b.box(0.08, 2, 0.6, PAL.darkMetal, { x });
    for (const y of [0.2, 0.9, 1.6]) {
      b.box(1.5, 0.06, 0.6, "#e0a84a", { y });
      crate(b, -0.35, y + 0.06, 0, 0.45, 0.1);
      crate(b, 0.3, y + 0.06, 0, 0.45, -0.2);
    }
  },
  pallet(b) {
    for (const z of [-0.4, 0, 0.4]) b.box(1.1, 0.12, 0.14, WOOD_LIGHT, { z });
    b.box(1.1, 0.04, 1.0, WOOD, { y: 0.12 });
  },
  conveyor(b) {
    for (const z of [-1.6, 0, 1.6]) for (const x of [-0.45, 0.45]) b.box(0.1, 0.6, 0.1, PAL.darkMetal, { x, z });
    b.box(0.9, 0.1, 3.8, "#3a3f47", { y: 0.6 });
    for (const x of [-0.5, 0.5]) b.box(0.08, 0.16, 3.8, "#e0a84a", { x, y: 0.62 });
    for (let i = 0; i < 9; i++) b.cyl(0.07, 0.07, 0.85, 6, "#6b7078", { y: 0.62, z: -1.8 + i * 0.45, rz: Math.PI / 2, x: 0.42 });
  },
  workbench(b) {
    table(b, 1.6, 0.8, 0.85, "#8a5a32");
    b.box(1.5, 0.06, 0.06, PAL.darkMetal, { y: 0.4, z: -0.3 });
    b.box(0.3, 0.2, 0.3, PAL.metal, { x: -0.5, y: 0.95 });
    b.cyl(0.18, 0.18, 0.12, 8, PAL.gold, { x: 0.3, y: 0.95 });
    b.box(0.5, 0.05, 0.1, PAL.darkMetal, { x: 0.1, y: 0.95, z: 0.2, ry: 0.4 });
  },
  bigMachine(b) {
    b.box(3.2, 0.3, 2.2, PAL.stoneDark);
    b.cyl(0.8, 0.8, 2.6, 10, "#3e6f8a", { x: -0.4, y: 1.2, rz: Math.PI / 2, z: 0 });
    for (const x of [-1.4, -0.4, 0.6]) b.cyl(0.84, 0.84, 0.1, 10, PAL.darkMetal, { x, y: 1.15, rz: Math.PI / 2 });
    b.box(1.0, 1.8, 1.2, "#e15a1c", { x: 1.2, y: 0.3 });
    b.cbox(0.5, 0.3, 0.05, "#f6cf7c", { x: 1.2, y: 1.6, z: 0.62 });
    b.cyl(0.18, 0.18, 1.6, 6, PAL.darkMetal, { x: -1.2, y: 2.0 });
    b.cyl(0.25, 0.25, 0.2, 6, PAL.darkMetal, { x: -1.2, y: 3.6 });
    b.cyl(0.5, 0.5, 0.16, 10, PAL.gold, { x: 1.2, y: 1.2, z: -0.66, rx: Math.PI / 2 });
    b.cbox(1.6, 0.14, 0.14, PAL.darkMetal, { x: 0.3, y: 2.25, z: 0.5 });
  },
  toolbox(b) {
    b.box(0.6, 0.3, 0.32, PAL.red);
    b.cbox(0.4, 0.06, 0.06, PAL.darkMetal, { y: 0.38 });
    for (const x of [-0.18, 0.18]) b.box(0.04, 0.12, 0.04, PAL.darkMetal, { x, y: 0.28 });
  },
  safetyCone(b) {
    b.box(0.45, 0.06, 0.45, "#2a2a2a");
    b.cone(0.2, 0.62, 8, "#e8641c", { y: 0.06 });
    b.cyl(0.14, 0.17, 0.1, 8, "#fffaf3", { y: 0.3 });
  },
  scaffold(b) {
    for (const x of [-0.8, 0.8]) for (const z of [-0.4, 0.4]) b.box(0.08, 3, 0.08, PAL.metal, { x, z });
    for (const y of [1.2, 2.4]) b.box(1.8, 0.08, 0.9, WOOD_LIGHT, { y });
  },
  beamStack(b) {
    for (let i = 0; i < 6; i++) {
      b.box(2.6, 0.2, 0.2, i % 2 ? "#c9a06a" : "#b88f58", { x: 0, y: Math.floor(i / 3) * 0.2, z: ((i % 3) - 1) * 0.22 });
    }
    b.box(0.2, 0.4, 0.8, WOOD, { x: -0.9, y: -0.02 });
  },
  planTable(b) {
    for (const [x, z] of [
      [-0.6, 0],
      [0.6, 0],
    ]) {
      b.box(0.1, 0.9, 0.5, WOOD, { x, z });
    }
    b.box(1.5, 0.08, 0.9, WOOD_LIGHT, { y: 0.9 });
    b.box(1.1, 0.02, 0.7, "#fffaf3", { y: 0.98 });
    b.box(0.5, 0.025, 0.4, "#3f6fb8", { x: -0.2, y: 1.0 });
    b.box(0.3, 0.025, 0.2, PAL.red, { x: 0.3, y: 1.0, z: 0.1 });
  },
  lamp(b) {
    b.box(0.3, 0.12, 0.3, PAL.darkMetal);
    b.cyl(0.05, 0.06, 2.2, 5, PAL.darkMetal, { y: 0.1 });
    b.box(0.34, 0.4, 0.34, PAL.glow, { y: 2.3 });
    b.cone(0.3, 0.25, 4, PAL.darkMetal, { y: 2.7, ry: Math.PI / 4 });
  },
  fence(b) {
    for (const x of [-1, 0, 1]) b.box(0.1, 0.8, 0.1, WOOD, { x });
    for (const y of [0.3, 0.65]) b.cbox(2.1, 0.08, 0.05, WOOD_LIGHT, { y });
  },
  flowerBed(b) {
    b.box(1.4, 0.2, 0.7, "#8a5a32");
    b.box(1.3, 0.08, 0.6, "#5a3a22", { y: 0.2 });
    const cols = ["#d94b62", "#f6cf7c", "#fffaf3", "#e15a1c", "#c46bd0", "#d94b62"];
    cols.forEach((c, i) => {
      b.box(0.06, 0.18, 0.06, "#4f7a3a", { x: -0.5 + i * 0.2, y: 0.26, z: (i % 2) * 0.2 - 0.1 });
      b.ball(0.1, 0, c, { x: -0.5 + i * 0.2, y: 0.5, z: (i % 2) * 0.2 - 0.1 });
    });
  },
  well(b) {
    b.cyl(0.7, 0.75, 0.7, 10, PAL.stone);
    for (const x of [-0.6, 0.6]) b.box(0.1, 1.5, 0.1, WOOD, { x, y: 0.7 });
    b.prism(1.5, 1.2, 0.5, PAL.terracotta, { y: 2.1 });
  },
  signpost(b) {
    b.box(0.12, 1.8, 0.12, WOOD);
    b.cbox(1.0, 0.25, 0.06, WOOD_LIGHT, { x: 0.35, y: 1.5, ry: 0.2 });
    b.cbox(0.9, 0.25, 0.06, WOOD_LIGHT, { x: -0.3, y: 1.15, ry: -0.3 });
  },
};

export function buildProp(kind: PropKind, b: B) {
  PROPS[kind](b);
}

const ITEMS: Record<Item, (b: B) => void> = {
  crate(b) {
    crate(b, 0, -0.2, 0, 0.42);
  },
  coinBag(b) {
    b.ball(0.18, 0, "#c9a86a", { y: 0.02, sy: 0.9 });
    b.cyl(0.05, 0.08, 0.1, 6, "#8a6a3a", { y: 0.18 });
    b.cyl(0.06, 0.06, 0.02, 8, PAL.gold, { x: 0.1, y: 0.02, z: 0.16, rx: Math.PI / 2 });
  },
  parcel(b) {
    b.cbox(0.34, 0.26, 0.3, "#c89a5a");
    b.cbox(0.36, 0.04, 0.06, PAL.red, { y: 0.13 });
  },
  hammer(b) {
    b.cbox(0.04, 0.34, 0.04, PAL.timber, { y: -0.14 });
    b.cbox(0.18, 0.08, 0.08, PAL.darkMetal, { y: -0.3 });
  },
  clipboard(b) {
    b.cbox(0.24, 0.3, 0.03, "#8a5a32");
    b.cbox(0.2, 0.24, 0.035, "#fffaf3", { y: -0.02 });
    b.cbox(0.08, 0.04, 0.05, PAL.metal, { y: 0.14 });
  },
  toolbox(b) {
    b.cbox(0.34, 0.2, 0.18, PAL.red, { y: -0.25 });
    b.cbox(0.2, 0.04, 0.04, PAL.darkMetal, { y: -0.13 });
  },
  gear(b) {
    b.cyl(0.14, 0.14, 0.06, 8, PAL.gold, { rx: Math.PI / 2, y: -0.03 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.cbox(0.06, 0.06, 0.06, PAL.gold, { x: Math.cos(a) * 0.17, y: Math.sin(a) * 0.17 });
    }
  },
  scroll(b) {
    b.cyl(0.05, 0.05, 0.3, 6, PAL.cream, { rz: Math.PI / 2, y: -0.05 });
    b.cyl(0.02, 0.02, 0.06, 6, PAL.red, { y: -0.05 });
  },
  wrench(b) {
    b.cbox(0.04, 0.3, 0.03, PAL.metal, { y: -0.14 });
    b.cbox(0.12, 0.06, 0.03, PAL.metal, { y: -0.3 });
  },
};

export function buildItem(item: Item): THREE.BufferGeometry {
  const b = new Builder(7, 0.04);
  ITEMS[item](b);
  return b.build();
}

/** Vehicles face local +z. */
const MOVERS: Record<MoverKind, (b: B) => void> = {
  forklift(b) {
    b.box(0.9, 0.5, 1.3, "#e0a84a", { y: 0.2 });
    b.box(0.8, 0.4, 0.5, "#3a3f47", { y: 0.7, z: -0.3 });
    for (const x of [-0.4, 0.4]) b.box(0.06, 1.6, 0.06, PAL.darkMetal, { x, y: 0.2, z: -0.5 });
    b.cbox(0.9, 0.06, 0.06, PAL.darkMetal, { y: 1.8, z: -0.5 });
    for (const x of [-0.35, 0.35]) b.box(0.06, 1.3, 0.06, PAL.darkMetal, { x, y: 0.7, z: 0.1 });
    for (const x of [-0.3, 0.3]) b.box(0.1, 0.05, 0.7, PAL.darkMetal, { x, y: 0.12, z: 0.95 });
    b.box(0.3, 0.1, 0.1, PAL.darkMetal, { y: 0.1, z: 0.6 });
    for (const x of [-0.46, 0.46]) for (const z of [-0.4, 0.4]) wheel(b, x, 0.2, z, 0.2, "#2a2a2a");
    crate(b, 0, 0.18, 0.95, 0.55);
    b.ball(0.13, 0, "#f1c7a0", { y: 1.25, z: -0.1 });
    b.dome(0.14, 6, "#f2c230", { y: 1.3, z: -0.1 });
    b.box(0.3, 0.35, 0.22, "#e15a1c", { y: 0.85, z: -0.1 });
  },
  truck(b) {
    b.box(1.6, 0.35, 3.8, "#3a3f47", { y: 0.4 });
    b.box(1.6, 1.5, 2.5, "#4f8a70", { y: 0.75, z: -0.6 });
    b.cbox(1.62, 0.1, 2.52, shade("#4f8a70", 0.8), { y: 2.2, z: -0.6 });
    b.box(1.5, 1.1, 1.1, "#c2583a", { y: 0.75, z: 1.25 });
    b.cbox(1.3, 0.5, 0.06, "#a9d3e6", { y: 1.5, z: 1.8 });
    b.cbox(0.06, 0.4, 0.6, "#a9d3e6", { x: 0.76, y: 1.5, z: 1.25 });
    b.cbox(0.06, 0.4, 0.6, "#a9d3e6", { x: -0.76, y: 1.5, z: 1.25 });
    for (const x of [-0.82, 0.82]) for (const z of [-1.4, -0.4, 1.3]) wheel(b, x, 0.36, z, 0.36, "#2a2a2a");
    b.cbox(1.0, 0.3, 0.05, PAL.cream, { x: 0.81, y: 1.4, z: -0.6, ry: Math.PI / 2 });
    b.cbox(1.0, 0.3, 0.05, PAL.cream, { x: -0.81, y: 1.4, z: -0.6, ry: Math.PI / 2 });
  },
  van(b) {
    b.box(1.4, 1.2, 2.8, "#8fbfb0", { y: 0.3 });
    b.cbox(1.42, 0.2, 2.82, "#fffaf3", { y: 0.9 });
    b.cbox(1.2, 0.5, 0.06, "#a9d3e6", { y: 1.2, z: 1.41, rx: -0.2 });
    for (const x of [-0.71, 0.71]) b.cbox(0.05, 0.4, 0.7, "#a9d3e6", { x, y: 1.2, z: 0.9 });
    for (const x of [-0.72, 0.72]) for (const z of [-0.9, 0.9]) wheel(b, x, 0.32, z, 0.3, "#2a2a2a");
    b.cbox(0.05, 0.3, 0.9, PAL.navy, { x: 0.72, y: 0.8, z: -0.4 });
    b.cbox(0.05, 0.3, 0.9, PAL.navy, { x: -0.72, y: 0.8, z: -0.4 });
  },
  coinCart(b) {
    b.box(0.9, 0.4, 1.2, WOOD, { y: 0.35 });
    b.box(0.7, 0.18, 1.0, PAL.gold, { y: 0.75 });
    for (let i = 0; i < 4; i++) b.cyl(0.14, 0.14, 0.05, 8, PAL.gold, { x: -0.2 + (i % 2) * 0.35, y: 0.95, z: -0.3 + i * 0.2 });
    for (const x of [-0.5, 0.5]) wheel(b, x, 0.35, -0.15, 0.35);
    for (const x of [-0.25, 0.25]) b.cbox(0.05, 0.05, 0.9, WOOD, { x, y: 0.55, z: 1.0 });
  },
  product(b) {
    b.cbox(0.42, 0.34, 0.42, "#ffffff", { y: 0.17 });
    b.cbox(0.44, 0.06, 0.44, "#fffaf3", { y: 0.3 });
  },
  handcart(b) {
    b.box(0.9, 0.35, 1.2, WOOD_LIGHT, { y: 0.35 });
    for (const x of [-0.5, 0.5]) wheel(b, x, 0.35, -0.1, 0.35);
    for (const x of [-0.25, 0.25]) b.cbox(0.05, 0.05, 0.9, WOOD, { x, y: 0.55, z: 1.0 });
  },
  wagon(b) {
    b.box(1.2, 0.15, 2.0, WOOD, { y: 0.5 });
    for (const s of [-1, 1]) b.box(0.08, 0.35, 2.0, WOOD_LIGHT, { x: s * 0.56, y: 0.65 });
    for (const x of [-0.65, 0.65]) for (const z of [-0.6, 0.6]) wheel(b, x, 0.38, z, 0.38);
    for (const x of [-0.25, 0.25]) b.cbox(0.05, 0.05, 1.1, WOOD, { x, y: 0.5, z: 1.5 });
  },
};

export function buildMover(kind: MoverKind): THREE.BufferGeometry {
  const b = new Builder(kind.length * 13, 0.05);
  MOVERS[kind](b);
  return b.build();
}

/** Cargo that rides on carts on the outbound trip only. */
export function buildCargo(kind: "handcart" | "wagon" | "route"): THREE.BufferGeometry {
  const b = new Builder(5, 0.05);
  if (kind === "handcart") {
    crate(b, -0.15, 0.7, -0.2, 0.42, 0.2);
    crate(b, 0.18, 0.7, 0.15, 0.4, -0.2);
  } else if (kind === "wagon") {
    for (const z of [-0.5, 0.2]) crate(b, 0, 0.65, z, 0.6, z);
    barrel(b, 0.25, 0.8);
  } else {
    crate(b, -0.2, 0.75, -0.3, 0.5, 0.2);
    crate(b, 0.2, 0.75, 0.3, 0.45, -0.2);
    b.cyl(0.14, 0.14, 0.06, 8, PAL.gold, { x: 0.25, y: 1.25, z: -0.2 });
  }
  return b.build();
}

export function buildPine(): THREE.BufferGeometry {
  const b = new Builder(3, 0.1);
  b.cyl(0.14, 0.2, 0.8, 5, "#6b4a2e");
  b.cone(1.1, 1.5, 7, "#ffffff", { y: 0.6 });
  b.cone(0.85, 1.3, 7, "#ffffff", { y: 1.4 });
  b.cone(0.55, 1.1, 7, "#ffffff", { y: 2.2 });
  return b.build();
}

export function buildRoundTree(): THREE.BufferGeometry {
  const b = new Builder(4, 0.12);
  b.cyl(0.14, 0.2, 1.1, 5, "#6b4a2e");
  b.ball(1.0, 0, "#ffffff", { y: 1.8, sy: 0.95 });
  b.ball(0.7, 0, "#ffffff", { x: 0.55, y: 1.5, z: 0.2 });
  b.ball(0.6, 0, "#ffffff", { x: -0.5, y: 1.6, z: -0.2 });
  return b.build();
}

export function buildBush(): THREE.BufferGeometry {
  const b = new Builder(8, 0.12);
  b.ball(0.5, 0, "#ffffff", { y: 0.3, sy: 0.7 });
  b.ball(0.35, 0, "#ffffff", { x: 0.4, y: 0.25, sy: 0.7 });
  return b.build();
}

export function buildRock(): THREE.BufferGeometry {
  const b = new Builder(9, 0.15);
  b.add(new DodecahedronGeometry(0.5, 0), "#ffffff", { sy: 0.6, sz: 0.9 });
  return b.build();
}

/** Master-data apple tree with red apples; marks each building's master data. */
export function buildAppleTree(): THREE.BufferGeometry {
  const b = new Builder(12, 0.1);
  b.cyl(0.16, 0.24, 1.2, 6, "#6b4a2e");
  b.ball(1.05, 1, "#6f9a3e", { y: 2.0 });
  b.ball(0.7, 0, "#7ea94a", { x: 0.6, y: 1.7, z: 0.3 });
  b.ball(0.6, 0, "#628b36", { x: -0.6, y: 1.8, z: -0.1 });
  const apples: Array<[number, number, number]> = [
    [0.5, 2.5, 0.8],
    [-0.7, 2.0, 0.7],
    [0.9, 1.7, 0.6],
    [0.1, 2.9, 0.4],
    [-0.4, 1.5, 0.95],
    [1.0, 2.3, -0.2],
    [-0.9, 2.5, -0.1],
  ];
  for (const [x, y, z] of apples) b.ball(0.16, 0, "#d8331f", { x, y, z });
  b.box(0.8, 0.12, 0.8, "#8a5a32", {});
  return b.build();
}

export function buildBanner(): THREE.BufferGeometry {
  const b = new Builder(21, 0.05);
  b.box(0.3, 0.2, 0.3, PAL.stoneDark);
  b.cyl(0.06, 0.07, 3.4, 6, PAL.darkMetal, { y: 0.2 });
  b.ball(0.12, 0, PAL.gold, { y: 3.65 });
  return b.build();
}

/** Flag cloth with a cream stamp and a check mark. Hangs from x = 0 toward +x. */
export function buildFlag(): THREE.BufferGeometry {
  const b = new Builder(22, 0.04);
  b.cbox(1.3, 0.9, 0.04, PAL.red, { x: 0.65 });
  b.cyl(0.3, 0.3, 0.06, 12, PAL.cream, { x: 0.65, rx: Math.PI / 2 });
  b.cbox(0.1, 0.24, 0.08, PAL.red, { x: 0.58, y: -0.04, rz: 0.7 });
  b.cbox(0.1, 0.4, 0.08, PAL.red, { x: 0.72, y: 0.02, rz: -0.6 });
  return b.build();
}
