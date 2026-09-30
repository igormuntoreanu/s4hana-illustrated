import type * as THREE from "three";
import type { BuildingStyle } from "@/data/village-scene";
import { Builder, shade } from "./geo";

export const PAL = {
  plaster: "#f1e3c3",
  plasterWarm: "#ecd3a6",
  timber: "#7a5234",
  timberDark: "#553722",
  stone: "#cfc2a6",
  stoneDark: "#a6977a",
  brick: "#b3593b",
  slate: "#4f6ea6",
  terracotta: "#c2583a",
  roofGreen: "#4d8b72",
  roofTeal: "#3e7e88",
  window: "#34435f",
  glow: "#f6cf7c",
  door: "#6b4428",
  gold: "#e3b341",
  cream: "#fff6e2",
  metal: "#7d8794",
  darkMetal: "#4a5361",
  grass: "#8fae5a",
  gravel: "#cdbb98",
  red: "#c4321a",
  navy: "#1a2744",
};

type B = Builder;

function windowPane(b: B, x: number, y: number, z: number, w = 0.7, h = 0.8, ry = 0) {
  b.group({ x, y, z, ry }, () => {
    b.cbox(w + 0.16, h + 0.16, 0.08, PAL.timberDark);
    b.cbox(w, h, 0.1, PAL.glow, { z: 0.02 });
    b.cbox(0.06, h, 0.12, PAL.timberDark, { z: 0.03 });
    b.cbox(w, 0.06, 0.12, PAL.timberDark, { z: 0.03 });
  });
}

function door(b: B, x: number, z: number, w = 0.9, h = 1.5, color = PAL.door) {
  b.box(w + 0.18, h + 0.12, 0.1, PAL.timberDark, { x, z });
  b.box(w, h, 0.14, color, { x, z: z + 0.02 });
  b.cbox(0.08, 0.08, 0.08, PAL.gold, { x: x + w * 0.3, y: h * 0.5, z: z + 0.1 });
}

function chimney(b: B, x: number, y: number, z: number, h = 1.3, color = PAL.brick) {
  b.box(0.55, h, 0.55, color, { x, y, z });
  b.box(0.7, 0.14, 0.7, shade(color, 0.75), { x, y: y + h, z });
}

function drafting(b: B) {
  const w = 6.2;
  const d = 5;
  b.box(w + 0.3, 0.3, d + 0.3, PAL.stoneDark);
  b.box(w, 3.4, d, PAL.plaster, { y: 0.3 });
  for (const x of [-w / 2, -w / 6, w / 6, w / 2]) b.box(0.18, 3.4, 0.18, PAL.timber, { x, y: 0.3, z: d / 2 });
  b.box(w + 0.1, 0.18, 0.2, PAL.timber, { y: 1.9, z: d / 2 });
  for (const x of [-w / 3, 0, w / 3]) {
    windowPane(b, x, 1.1, d / 2 + 0.05, 1.1, 0.9);
    windowPane(b, x, 2.7, d / 2 + 0.05, 0.9, 0.7);
  }
  for (const z of [-1.2, 1.2]) {
    windowPane(b, w / 2 + 0.05, 2.6, z, 0.8, 0.7, Math.PI / 2);
    windowPane(b, -w / 2 - 0.05, 2.6, z, 0.8, 0.7, -Math.PI / 2);
  }
  door(b, 0, d / 2 + 0.02, 1, 1.5);
  b.gableRoof(w + 0.2, d + 0.2, 2.2, PAL.slate, PAL.plaster, { y: 3.7 });
  b.group({ x: 1.2, y: 4.3, z: 1.2 }, () => {
    b.box(1.2, 0.8, 1, PAL.plaster);
    b.cbox(0.8, 0.5, 0.06, "#a9d3e6", { y: 0.45, z: 0.52 });
    b.prism(1.4, 1.2, 0.6, PAL.slate, { y: 0.8 });
  });
  chimney(b, -1.8, 4.6, -0.8);
  // Glass drafting annex
  b.group({ x: -w / 2 - 1.3, z: 0.4 }, () => {
    b.box(2.4, 0.25, 3.2, PAL.stoneDark);
    b.box(2.2, 2.2, 3, "#b9dbe6", { y: 0.25 });
    for (const x of [-1.1, 0, 1.1]) b.box(0.1, 2.2, 0.1, PAL.timberDark, { x, y: 0.25, z: 1.5 });
    b.box(2.3, 0.1, 3.1, PAL.timberDark, { y: 1.35 });
    b.prism(3.2, 2.4, 0.8, "#9ec8d8", { y: 2.45, ry: Math.PI / 2 });
  });
  // Weather vane with a gear
  b.cyl(0.04, 0.04, 1.1, 4, PAL.darkMetal, { y: 5.9 });
  b.cyl(0.35, 0.35, 0.08, 8, PAL.gold, { y: 6.8, rx: Math.PI / 2 });
}

function counting(b: B) {
  const w = 8;
  const d = 6;
  b.box(w + 1.2, 0.35, d + 1.4, PAL.stoneDark);
  b.box(w + 0.8, 0.25, d + 1.0, PAL.stone, { y: 0.35 });
  b.box(w, 4, d, PAL.stone, { y: 0.6 });
  for (let i = 0; i < 6; i++) b.box(w + 0.02, 0.06, d + 0.02, PAL.stoneDark, { y: 1.2 + i * 0.6 });
  // Portico
  for (const x of [-2.4, -0.8, 0.8, 2.4]) {
    b.cyl(0.28, 0.32, 3.6, 8, PAL.cream, { x, y: 0.6, z: d / 2 + 0.9 });
    b.box(0.7, 0.2, 0.7, PAL.stone, { x, y: 4.1, z: d / 2 + 0.9 });
  }
  b.box(6.2, 0.4, 1.9, PAL.stone, { y: 4.3, z: d / 2 + 0.55 });
  b.prism(1.9, 6.6, 1.2, PAL.stone, { y: 4.7, z: d / 2 + 0.55, ry: Math.PI / 2 });
  b.cyl(0.4, 0.4, 0.1, 10, PAL.gold, { y: 5.15, z: d / 2 + 1.52, rx: Math.PI / 2 });
  for (const x of [-2.9, 2.9]) windowPane(b, x, 2.6, d / 2 + 0.05, 0.8, 1.4);
  door(b, 0, d / 2 + 0.02, 1.4, 2.2, "#5a3a1f");
  for (const z of [-1.5, 1.5]) {
    windowPane(b, w / 2 + 0.05, 2.6, z, 0.8, 1.3, Math.PI / 2);
    windowPane(b, -w / 2 - 0.05, 2.6, z, 0.8, 1.3, -Math.PI / 2);
  }
  b.box(w + 0.4, 0.45, d + 0.4, PAL.stoneDark, { y: 4.6 });
  // Drum and dome
  b.cyl(2.3, 2.3, 1.2, 12, PAL.stone, { y: 5.05, z: -0.4 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.cbox(0.35, 0.6, 0.1, PAL.window, { x: Math.sin(a) * 2.31, y: 5.65, z: -0.4 + Math.cos(a) * 2.31, ry: a });
  }
  b.dome(2.5, 14, PAL.roofGreen, { y: 6.25, z: -0.4 });
  b.cyl(0.35, 0.45, 0.7, 8, PAL.stone, { y: 8.6, z: -0.4 });
  b.cone(0.45, 0.6, 8, PAL.roofGreen, { y: 9.3, z: -0.4 });
  b.ball(0.14, 0, PAL.gold, { y: 10.0, z: -0.4 });
}

function guild(b: B) {
  b.cyl(3.3, 3.4, 0.3, 12, PAL.stoneDark);
  b.cyl(3, 3, 4, 12, PAL.plasterWarm, { y: 0.3 });
  b.cyl(3.04, 3.04, 0.2, 12, PAL.timber, { y: 1.9 });
  b.cyl(3.04, 3.04, 0.2, 12, PAL.timber, { y: 4.1 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.cbox(0.16, 4, 0.16, PAL.timber, { x: Math.sin(a) * 3, y: 2.3, z: Math.cos(a) * 3 });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    if (Math.abs(Math.sin(a)) < 0.3 && Math.cos(a) > 0) continue;
    windowPane(b, Math.sin(a) * 3.02, 3.0, Math.cos(a) * 3.02, 0.6, 0.8, a);
  }
  b.cone(3.8, 3.4, 12, PAL.terracotta, { y: 4.3 });
  b.cyl(0.5, 0.5, 0.2, 10, PAL.cream, { y: 5.0, z: 2.95, rx: Math.PI / 2 - 0.47 });
  b.cbox(0.05, 0.36, 0.05, PAL.navy, { y: 5.1, z: 3.1, rx: -0.47 });
  b.cyl(0.05, 0.05, 1.4, 4, PAL.darkMetal, { y: 7.6 });
  b.cbox(0.8, 0.5, 0.04, PAL.red, { x: 0.42, y: 8.7 });
  // Porch
  b.group({ z: 3.1 }, () => {
    b.box(2.2, 0.25, 1.4, PAL.stoneDark);
    for (const x of [-0.9, 0.9]) b.box(0.18, 2.3, 0.18, PAL.timber, { x, y: 0.25, z: 0.5 });
    b.prism(1.6, 2.6, 0.9, PAL.terracotta, { y: 2.55, z: 0.1, ry: Math.PI / 2 });
    door(b, 0, -0.15, 1, 1.8);
  });
}

function trading(b: B) {
  const w = 6;
  const d = 5;
  b.box(w + 0.4, 0.25, d + 0.4, PAL.timberDark);
  b.box(w, 0.1, d, "#b98b58", { y: 0.25 });
  b.box(w, 2.8, 0.25, PAL.timber, { y: 0.35, z: -d / 2 });
  for (const x of [-w / 2, w / 2]) b.box(0.25, 1.4, d, PAL.timber, { x, y: 0.35 });
  for (const [x, z] of [
    [-w / 2, d / 2],
    [w / 2, d / 2],
    [-w / 2, -d / 2],
    [w / 2, -d / 2],
    [0, d / 2],
  ]) {
    b.box(0.3, 3.1, 0.3, PAL.timberDark, { x, y: 0.35, z });
  }
  b.box(w + 0.3, 0.25, 0.3, PAL.timberDark, { y: 3.3, z: d / 2 });
  // Counter
  b.box(4, 1, 0.6, "#9a6b3e", { y: 0.35, z: d / 2 - 0.6 });
  b.box(4.2, 0.1, 0.8, PAL.timber, { y: 1.35, z: d / 2 - 0.6 });
  for (const [x, z] of [
    [-2.2, -1.4],
    [-1.3, -1.6],
    [1.8, -1.4],
  ]) {
    b.box(0.8, 0.8, 0.8, "#c49a5c", { x, y: 0.35, z });
  }
  b.box(0.8, 0.8, 0.8, "#b88a4e", { x: -1.8, y: 1.15, z: -1.5 });
  b.gableRoof(w + 0.6, d + 0.8, 1.6, PAL.slate, PAL.timber, { y: 3.45 });
  // Hanging sign
  b.box(0.08, 0.5, 0.08, PAL.timberDark, { x: 1.8, y: 2.8, z: d / 2 + 0.25 });
  b.cbox(1.6, 0.6, 0.1, PAL.cream, { x: 1.8, y: 2.6, z: d / 2 + 0.25 });
  b.cbox(1.2, 0.18, 0.12, "#c9841a", { x: 1.8, y: 2.6, z: d / 2 + 0.26 });
}

function shop(b: B) {
  const w = 5.6;
  const d = 4.6;
  b.box(w + 0.3, 0.3, d + 0.3, PAL.stoneDark);
  b.box(w, 3, d, PAL.cream, { y: 0.3 });
  b.box(w + 0.05, 0.9, d + 0.05, "#d9b58a", { y: 0.3 });
  b.cbox(3, 1.4, 0.1, PAL.glow, { x: -0.9, y: 1.7, z: d / 2 + 0.03 });
  b.cbox(3.2, 0.12, 0.2, PAL.timberDark, { x: -0.9, y: 1.0, z: d / 2 + 0.05 });
  for (const x of [-2.4, -0.9, 0.6]) b.cbox(0.08, 1.4, 0.14, PAL.timberDark, { x, y: 1.7, z: d / 2 + 0.05 });
  door(b, 1.9, d / 2 + 0.02, 0.9, 1.9, "#2f5d8a");
  windowPane(b, -1.2, 2.9, d / 2 + 0.05, 0.7, 0.6);
  windowPane(b, 1.2, 2.9, d / 2 + 0.05, 0.7, 0.6);
  // Striped awning
  for (let i = 0; i < 8; i++) {
    b.cbox(w / 8, 0.08, 1.4, i % 2 ? PAL.cream : "#d9443a", {
      x: -w / 2 + w / 16 + (i * w) / 8,
      y: 2.55,
      z: d / 2 + 0.6,
      rx: 0.4,
    });
  }
  b.cbox(w, 0.25, 0.06, "#d9443a", { y: 2.2, z: d / 2 + 1.25 });
  b.gableRoof(w + 0.2, d + 0.2, 1.9, PAL.terracotta, PAL.cream, { y: 3.3 });
  chimney(b, 1.6, 4.1, -0.9, 1.3);
  b.cbox(2.2, 0.55, 0.1, PAL.navy, { y: 3.65, z: d / 2 + 0.2 });
  b.cbox(1.6, 0.16, 0.12, "#d94b62", { y: 3.65, z: d / 2 + 0.22 });
}

function warehouse(b: B) {
  const w = 7.6;
  const d = 6;
  b.box(w + 0.3, 0.3, d + 0.3, PAL.stoneDark);
  b.box(w, 3.4, d, "#c9a878", { y: 0.3 });
  for (let i = 0; i < 12; i++) b.box(0.06, 3.4, d + 0.04, shade("#c9a878", 0.85), { x: -w / 2 + 0.3 + i * 0.64, y: 0.3 });
  b.box(3, 2.6, 0.12, "#6d8a5a", { x: 1.2, y: 0.3, z: d / 2 });
  b.cbox(0.1, 2.6, 0.16, PAL.cream, { x: 1.2, y: 1.6, z: d / 2 + 0.03 });
  for (const s of [-1, 1]) {
    b.cbox(0.1, 3.3, 0.16, PAL.cream, { x: 1.2 + s * 1.3, y: 1.6, z: d / 2 + 0.04, rz: s * 0.62 });
  }
  windowPane(b, -2.6, 2.6, d / 2 + 0.05, 0.9, 0.5);
  b.gableRoof(w + 0.3, d + 0.3, 1.8, "#5b8f5f", "#c9a878", { y: 3.7 });
  b.cyl(0.35, 0.45, 0.6, 6, PAL.metal, { x: -1.5, y: 5.2 });
  // Loading dock
  b.box(3.2, 0.95, 1.4, PAL.stone, { x: -2.2, z: d / 2 + 0.7 });
  b.box(3.2, 0.08, 1.4, PAL.timber, { x: -2.2, y: 0.95, z: d / 2 + 0.7 });
  for (const x of [-3.7, -0.7]) b.box(0.14, 2.4, 0.14, PAL.timberDark, { x, y: 0.95, z: d / 2 + 1.3 });
  b.cbox(3.4, 0.12, 1.8, "#5b8f5f", { x: -2.2, y: 3.4, z: d / 2 + 0.8, rx: 0.12 });
  b.box(2, 1.9, 0.12, "#6d8a5a", { x: -2.2, y: 0.95, z: d / 2 });
}

function workshop(b: B) {
  const w = 7.4;
  const d = 5.8;
  b.box(w + 0.3, 0.3, d + 0.3, PAL.stoneDark);
  b.box(w, 3.3, d, PAL.brick, { y: 0.3 });
  for (let i = 0; i < 5; i++) b.box(w + 0.02, 0.05, d + 0.02, shade(PAL.brick, 0.82), { y: 0.8 + i * 0.6 });
  b.box(2.6, 2.4, 0.12, "#4a3a2c", { y: 0.3, z: d / 2 });
  b.box(2.9, 0.25, 0.2, PAL.stone, { y: 2.7, z: d / 2 + 0.02 });
  for (const x of [-2.6, 2.6]) windowPane(b, x, 2.0, d / 2 + 0.05, 1.2, 1.0);
  // Sawtooth roof, glazed faces toward the back
  for (let i = 0; i < 3; i++) {
    const z = -d / 2 + d / 6 + (i * d) / 3;
    b.prism(w + 0.2, d / 3, 1.3, "#6e7a8a", { y: 3.6, z, ry: 0 }, 0.08);
    b.cbox(w, 1.1, 0.06, "#a9d3e6", { y: 4.2, z: z - d / 6 + 0.16, rx: -0.12 });
  }
  b.box(w + 0.4, 0.2, d + 0.4, PAL.stoneDark, { y: 3.55 });
  b.cyl(0.45, 0.6, 3.6, 8, shade(PAL.brick, 0.8), { x: -2.6, y: 3.6, z: -1.6 });
  b.cyl(0.55, 0.55, 0.25, 8, PAL.darkMetal, { x: -2.6, y: 7.2, z: -1.6 });
  // Gear emblem
  b.group({ y: 3.2, z: d / 2 + 0.1 }, () => {
    b.cyl(0.55, 0.55, 0.12, 12, PAL.gold, { rx: Math.PI / 2, y: -0.06 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.cbox(0.22, 0.22, 0.12, PAL.gold, { x: Math.cos(a) * 0.62, y: Math.sin(a) * 0.62, rz: a });
    }
    b.cyl(0.18, 0.18, 0.16, 8, PAL.darkMetal, { rx: Math.PI / 2, y: -0.08 });
  });
}

function yard(b: B) {
  const w = 9;
  const d = 7;
  b.box(w, 0.08, d, PAL.gravel);
  const posts = (x0: number, z0: number, x1: number, z1: number, n: number) => {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      b.box(0.14, 1, 0.14, PAL.timber, { x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t });
    }
    const len = Math.hypot(x1 - x0, z1 - z0);
    const ry = Math.atan2(x1 - x0, z1 - z0);
    for (const y of [0.45, 0.85]) {
      b.cbox(0.06, 0.1, len, PAL.timberDark, { x: (x0 + x1) / 2, y, z: (z0 + z1) / 2, ry });
    }
  };
  posts(-w / 2, -d / 2, w / 2, -d / 2, 9);
  posts(-w / 2, -d / 2, -w / 2, d / 2, 7);
  posts(w / 2, -d / 2, w / 2, d / 2, 7);
  posts(-w / 2, d / 2, -1.4, d / 2, 3);
  posts(1.4, d / 2, w / 2, d / 2, 3);
  // Shed
  b.group({ x: 2.6, z: -2.2 }, () => {
    b.box(3, 2.4, 2.2, "#8c9aa8");
    b.box(1.2, 1.8, 0.1, PAL.darkMetal, { z: 1.1 });
    b.prism(3.3, 2.5, 0.7, "#3e4c63", { y: 2.4 });
  });
  // Gantry crane over the machine
  for (const x of [-3.3, 2.6]) {
    b.box(0.25, 4.2, 0.25, "#e0a84a", { x, z: -0.9 });
    b.box(0.25, 4.2, 0.25, "#e0a84a", { x, z: 1.6 });
  }
  b.cbox(6.2, 0.3, 0.3, "#e0a84a", { x: -0.35, y: 4.3, z: -0.9 });
  b.cbox(6.2, 0.3, 0.3, "#e0a84a", { x: -0.35, y: 4.3, z: 1.6 });
  b.cbox(0.4, 0.4, 2.8, PAL.darkMetal, { x: -0.6, y: 4.5, z: 0.35 });
  b.box(0.04, 1.6, 0.04, PAL.darkMetal, { x: -0.6, y: 2.7, z: 0.35 });
  b.cbox(0.3, 0.2, 0.3, PAL.darkMetal, { x: -0.6, y: 2.7, z: 0.35 });
  b.cbox(1.2, 0.4, 0.08, "#fffaf3", { x: 3.5, y: 0.75, z: d / 2 + 0.06 });
  b.cbox(0.9, 0.1, 0.1, "#3e4c63", { x: 3.5, y: 0.75, z: d / 2 + 0.09 });
}

function repair(b: B) {
  const w = 6;
  const d = 5;
  b.box(w + 0.3, 0.25, d + 0.3, PAL.stoneDark);
  b.box(w, 3, d, "#6d86b8", { y: 0.25 });
  b.box(3.2, 2.3, 0.1, "#9aa4b0", { x: 0.7, y: 0.25, z: d / 2 });
  for (let i = 0; i < 7; i++) b.cbox(3.2, 0.04, 0.14, "#7d8794", { x: 0.7, y: 0.5 + i * 0.3, z: d / 2 + 0.03 });
  door(b, -2.1, d / 2 + 0.02, 0.8, 1.7, PAL.cream);
  windowPane(b, -2.1, 2.5, d / 2 + 0.05, 0.6, 0.4);
  windowPane(b, w / 2 + 0.05, 1.6, 0, 1.2, 0.8, Math.PI / 2);
  b.gableRoof(w + 0.2, d + 0.2, 1.3, "#2f4f86", "#6d86b8", { y: 3.25 });
  // Wrench sign
  b.group({ x: 0.7, y: 3.05, z: d / 2 + 0.12 }, () => {
    b.cbox(1.8, 0.6, 0.1, PAL.cream);
    b.cbox(1.1, 0.14, 0.12, PAL.darkMetal, { rz: 0.4 });
    b.cyl(0.16, 0.16, 0.12, 6, PAL.darkMetal, { x: 0.5, y: 0.2 - 0.06, rx: Math.PI / 2 });
  });
}

function construction(b: B) {
  const w = 6.6;
  const d = 5.4;
  b.box(w + 0.6, 0.3, d + 0.6, PAL.stone);
  // Half-built brick walls
  b.box(w, 1.2, 0.35, PAL.brick, { y: 0.3, z: -d / 2 });
  b.box(0.35, 1.6, d, PAL.brick, { x: -w / 2, y: 0.3 });
  b.box(0.35, 0.8, d, PAL.brick, { x: w / 2, y: 0.3 });
  b.box(2.2, 0.6, 0.35, PAL.brick, { x: -2.2, y: 0.3, z: d / 2 });
  // Timber frame
  for (const x of [-w / 2, 0, w / 2]) {
    for (const z of [-d / 2, d / 2]) b.box(0.22, 3.6, 0.22, "#c9a06a", { x, y: 0.3, z });
  }
  for (const z of [-d / 2, d / 2]) b.cbox(w + 0.2, 0.22, 0.22, "#c9a06a", { y: 3.9, z });
  for (const x of [-w / 2, 0, w / 2]) b.cbox(0.22, 0.22, d + 0.2, "#c9a06a", { x, y: 3.9 });
  for (const x of [-w / 2, 0]) {
    for (const s of [-1, 1]) {
      b.cbox(0.16, 0.16, d / 2 + 0.6, "#b88f58", { x, y: 4.65, z: (s * d) / 4, rx: s * 0.55 });
    }
  }
  // Scaffolding along the back and side
  const scaf = "#8a8f96";
  for (const x of [-w / 2 - 0.9, -w / 4, w / 4]) {
    for (const z of [-d / 2 - 0.9, -d / 2 - 0.2]) b.box(0.08, 4.4, 0.08, scaf, { x, y: 0.3, z });
  }
  for (const y of [1.6, 3.1]) {
    b.cbox(w / 2 + 1.4, 0.1, 0.9, "#caa46e", { x: -w / 4 - 0.4, y, z: -d / 2 - 0.55 });
    b.cbox(w / 2 + 1.4, 0.06, 0.06, scaf, { x: -w / 4 - 0.4, y: y + 0.6, z: -d / 2 - 0.9 });
  }
  // Small tower crane
  b.group({ x: w / 2 + 1.0, z: -1.2 }, () => {
    b.box(0.9, 0.4, 0.9, PAL.stoneDark);
    b.box(0.35, 7.2, 0.35, "#e0a84a", { y: 0.4 });
    for (let i = 0; i < 7; i++) b.cbox(0.4, 0.05, 0.4, PAL.darkMetal, { y: 0.9 + i });
    b.cbox(0.6, 0.6, 0.6, "#e0a84a", { y: 7.8 });
  });
}

const BUILDERS: Record<BuildingStyle, (b: B) => void> = {
  drafting,
  counting,
  guild,
  trading,
  shop,
  warehouse,
  workshop,
  yard,
  repair,
  construction,
};

export function buildBuilding(style: BuildingStyle, seed: number): THREE.BufferGeometry {
  const b = new Builder(seed);
  BUILDERS[style](b);
  return b.build();
}

/** Tower crane jib, animated separately. Pivot at the mast top. */
export function buildCraneJib(): THREE.BufferGeometry {
  const b = new Builder(91);
  b.cbox(6.4, 0.3, 0.3, "#e0a84a", { x: -1.8 });
  b.cbox(1.2, 0.8, 0.8, PAL.stoneDark, { x: 1.2, y: -0.1 });
  b.box(0.03, 2.6, 0.03, PAL.darkMetal, { x: -4, y: -2.7 });
  b.cbox(0.7, 0.3, 0.7, "#c9a06a", { x: -4, y: -2.9 });
  b.cbox(0.4, 0.3, 0.4, PAL.darkMetal, { x: -4, y: -0.1 });
  return b.build();
}
