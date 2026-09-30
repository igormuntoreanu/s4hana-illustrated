import * as THREE from "three";
import { GROUND, RIVER, villageBuildings, type Vec2 } from "@/data/village-scene";
import { Builder, rng } from "./geo";
import { PAL } from "./buildings";
import { distToSegment, doorWorld, roadJoints, roadSegments } from "./paths";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function noise(x: number, z: number) {
  return (
    Math.sin(x * 0.21 + Math.sin(z * 0.13) * 1.7) * 0.5 +
    Math.sin(z * 0.27 + x * 0.07) * 0.3 +
    Math.sin((x + z) * 0.61) * 0.2
  );
}

export function riverDepth(x: number, z: number) {
  const d = Math.abs(x - RIVER.centerX(z));
  return smooth(RIVER.width / 2 + 0.8, RIVER.width / 2 - 0.6, d);
}

export function groundHeight(x: number, z: number) {
  const edge = Math.max(smooth(34, 46, Math.abs(x)), smooth(22, 34, Math.abs(z)));
  const hills = edge * (2.2 + noise(x * 0.6, z * 0.6) * 1.6);
  return hills - riverDepth(x, z) * 0.55;
}

export function buildGround(): THREE.BufferGeometry {
  const w = GROUND.halfW * 2;
  const d = GROUND.halfD * 2;
  const g = new THREE.PlaneGeometry(w, d, 184, 136);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const west = new THREE.Color("#93b35c");
  const east = new THREE.Color("#b7ad58");
  const sand = new THREE.Color("#d8c393");
  const far = new THREE.Color("#a7b27a");
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, groundHeight(x, z));
    const side = smooth(-4, 4, x - RIVER.centerX(z));
    c.copy(west).lerp(east, side);
    const n = noise(x * 1.3, z * 1.3);
    c.offsetHSL(n * 0.015, n * 0.03, n * 0.035);
    const bank = smooth(RIVER.width / 2 + 1.8, RIVER.width / 2 + 0.2, Math.abs(x - RIVER.centerX(z)));
    c.lerp(sand, bank);
    const edge = Math.max(smooth(32, 46, Math.abs(x)), smooth(22, 34, Math.abs(z)));
    c.lerp(far, edge * 0.5);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

/** River ribbon: uv.x across (0..1), uv.y along the flow in world units. */
export function buildRiver(): THREE.BufferGeometry {
  const segs = 160;
  const half = RIVER.width / 2 + 0.3;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const z = -GROUND.halfD + (i / segs) * GROUND.halfD * 2;
    const cx = RIVER.centerX(z);
    for (let j = 0; j <= 4; j++) {
      const t = j / 4;
      positions.push(cx - half + t * half * 2, -0.2, z);
      uvs.push(t, z);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < 4; j++) {
      const a = i * 5 + j;
      const b = a + 5;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

export function riverMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color("#efe4cc") },
      uFogNear: { value: 70 },
      uFogFar: { value: 150 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uFogColor;
      uniform float uFogNear;
      uniform float uFogFar;
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        float across = abs(vUv.x - 0.5) * 2.0;
        vec3 deep = vec3(0.16, 0.36, 0.52);
        vec3 shallow = vec3(0.42, 0.66, 0.74);
        vec3 col = mix(deep, shallow, smoothstep(0.2, 1.0, across));
        float flow = vUv.y * 0.9 - uTime * 0.9;
        float wob = sin(vUv.x * 17.0 + vUv.y * 0.7) * 0.6;
        float streak = smoothstep(0.93, 0.99, sin(flow * 2.2 + wob + sin(vUv.x * 41.0) * 0.5));
        float streak2 = smoothstep(0.95, 1.0, sin(flow * 3.1 - wob * 1.3 + vUv.x * 23.0));
        col = mix(col, vec3(0.93, 0.96, 0.94), (streak * 0.55 + streak2 * 0.35) * (1.0 - across * 0.4));
        col = mix(col, vec3(0.94, 0.9, 0.8), smoothstep(0.86, 1.0, across) * 0.6);
        float fog = smoothstep(uFogNear, uFogFar, vDepth);
        gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

function ribbon(b: Builder, a: Vec2, c: Vec2, width: number, color: string, y: number) {
  const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
  const ry = Math.atan2(c[0] - a[0], c[1] - a[1]);
  b.cbox(width, 0.04, len, color, { x: (a[0] + c[0]) / 2, y, z: (a[1] + c[1]) / 2, ry });
}

export function buildRoads(): THREE.BufferGeometry {
  const b = new Builder(31, 0.06);
  const segs = roadSegments();
  for (const [a, c] of segs) {
    if (Math.abs(a[0]) < 6 && Math.abs(c[0]) < 6 && Math.abs(a[1] - RIVER.bridgeZ) < 0.1) continue;
    ribbon(b, a, c, 1.9, "#b48d5c", 0.02);
  }
  for (const p of roadJoints()) b.cyl(0.95, 0.95, 0.04, 12, "#b48d5c", { x: p[0], y: 0.0, z: p[1] });
  for (const [a, c] of segs) {
    if (Math.abs(a[0]) < 6 && Math.abs(c[0]) < 6 && Math.abs(a[1] - RIVER.bridgeZ) < 0.1) continue;
    ribbon(b, a, c, 1.45, "#dcc08c", 0.045);
  }
  for (const p of roadJoints()) b.cyl(0.72, 0.72, 0.05, 12, "#dcc08c", { x: p[0], y: 0.02, z: p[1] });
  return b.build();
}

export const BRIDGE_HALF = 5.6;

export function bridgeHeight(x: number) {
  const t = (x + BRIDGE_HALF) / (BRIDGE_HALF * 2);
  if (t <= 0 || t >= 1) return 0;
  return Math.sin(Math.PI * t) * 1.05;
}

export function buildBridge(): THREE.BufferGeometry {
  const b = new Builder(41, 0.1);
  const z = RIVER.bridgeZ;
  const n = 22;
  for (let i = 0; i < n; i++) {
    const x0 = -BRIDGE_HALF + (i / n) * BRIDGE_HALF * 2;
    const x1 = -BRIDGE_HALF + ((i + 1) / n) * BRIDGE_HALF * 2;
    const y0 = bridgeHeight(x0);
    const y1 = bridgeHeight(x1);
    const len = Math.hypot(x1 - x0, y1 - y0);
    b.cbox(len + 0.02, 0.16, 2.2, i % 2 ? "#9a6b3e" : "#8a5d34", {
      x: (x0 + x1) / 2,
      y: (y0 + y1) / 2 + 0.05,
      z,
      rz: Math.atan2(y1 - y0, x1 - x0),
    });
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i <= 8; i++) {
      const x = -BRIDGE_HALF + 0.3 + (i / 8) * (BRIDGE_HALF * 2 - 0.6);
      b.box(0.14, 0.8, 0.14, "#6b4a2e", { x, y: bridgeHeight(x), z: z + side * 1.05 });
    }
    for (let i = 0; i < 12; i++) {
      const x0 = -BRIDGE_HALF + 0.3 + (i / 12) * (BRIDGE_HALF * 2 - 0.6);
      const x1 = -BRIDGE_HALF + 0.3 + ((i + 1) / 12) * (BRIDGE_HALF * 2 - 0.6);
      const y0 = bridgeHeight(x0) + 0.78;
      const y1 = bridgeHeight(x1) + 0.78;
      b.cbox(Math.hypot(x1 - x0, y1 - y0) + 0.04, 0.1, 0.12, "#7a5234", {
        x: (x0 + x1) / 2,
        y: (y0 + y1) / 2,
        z: z + side * 1.05,
        rz: Math.atan2(y1 - y0, x1 - x0),
      });
    }
  }
  for (const sx of [-1, 1]) {
    b.box(1.4, 0.7, 2.8, PAL.stoneDark, { x: sx * (BRIDGE_HALF - 0.2), y: -0.55, z });
    b.box(0.9, 1.1, 0.9, PAL.stone, { x: sx * 3.1, y: -0.8, z: z - 0.8 });
    b.box(0.9, 1.1, 0.9, PAL.stone, { x: sx * 3.1, y: -0.8, z: z + 0.8 });
  }
  return b.build();
}

export type Scatter = { x: number; z: number; s: number; ry: number; color: THREE.Color };

export type Scatters = {
  pines: Scatter[];
  rounds: Scatter[];
  bushes: Scatter[];
  rocks: Scatter[];
};

export function buildScatters(): Scatters {
  const r = rng(2025);
  const segs = roadSegments();
  const out: Scatters = { pines: [], rounds: [], bushes: [], rocks: [] };
  const blocked = (x: number, z: number, pad: number) => {
    if (Math.abs(x - RIVER.centerX(z)) < RIVER.width / 2 + 0.9 + pad * 0.5) return true;
    if (Math.abs(x) < BRIDGE_HALF + 1 && Math.abs(z - RIVER.bridgeZ) < 2.5) return true;
    for (const b of villageBuildings) {
      const rad = Math.hypot(b.size[0], b.size[1]) / 2 + 1.2 + pad;
      if (Math.hypot(x - b.pos[0], z - b.pos[1]) < rad) return true;
      const d = doorWorld(b);
      if (Math.hypot(x - d[0], z - d[1]) < 5 + pad) return true;
      if (Math.hypot(x - b.tree.at[0], z - b.tree.at[1]) < 1.8 + pad) return true;
    }
    for (const [a, c] of segs) if (distToSegment([x, z], a, c) < 1.4 + pad) return true;
    return false;
  };
  const westGreens = ["#4f8a4a", "#5f9448", "#3f7a4f", "#6f9a3e"];
  const eastLeaves = ["#d98a3a", "#c4632c", "#e3b341", "#b9a33c", "#8fae5a", "#d0752f"];
  const kept: Array<[number, number, number]> = [];
  for (let i = 0; i < 900 && out.pines.length + out.rounds.length < 190; i++) {
    const x = (r() * 2 - 1) * (GROUND.halfW - 2);
    const z = (r() * 2 - 1) * (GROUND.halfD - 2);
    const edge = Math.max(Math.abs(x) / 40, Math.abs(z) / 28);
    if (r() > 0.25 + edge * 0.9) continue;
    if (blocked(x, z, 0.6)) continue;
    if (kept.some(([kx, kz, kr]) => Math.hypot(kx - x, kz - z) < kr)) continue;
    const s = 0.85 + r() * 0.65 + edge * 0.3;
    kept.push([x, z, 1.6 * s]);
    const west = x < RIVER.centerX(z);
    const pine = west ? r() < 0.7 : r() < 0.25;
    const color = new THREE.Color(
      pine ? (west ? "#3f6f4a" : "#4f7a47") : west ? westGreens[Math.floor(r() * westGreens.length)] : eastLeaves[Math.floor(r() * eastLeaves.length)],
    );
    color.offsetHSL(0, 0, (r() - 0.5) * 0.06);
    (pine ? out.pines : out.rounds).push({ x, z, s, ry: r() * Math.PI * 2, color });
  }
  for (let i = 0; i < 400 && out.bushes.length < 70; i++) {
    const x = (r() * 2 - 1) * 36;
    const z = (r() * 2 - 1) * 24;
    if (blocked(x, z, 0)) continue;
    if (kept.some(([kx, kz, kr]) => Math.hypot(kx - x, kz - z) < kr * 0.7)) continue;
    const west = x < RIVER.centerX(z);
    const color = new THREE.Color(west ? "#5f9448" : r() < 0.5 ? "#9aa845" : "#c98a3a");
    color.offsetHSL(0, 0, (r() - 0.5) * 0.08);
    out.bushes.push({ x, z, s: 0.7 + r() * 0.6, ry: r() * 6.28, color });
  }
  for (let i = 0; i < 90; i++) {
    const z = (r() * 2 - 1) * (GROUND.halfD - 1);
    if (Math.abs(z - RIVER.bridgeZ) < 2.2) continue;
    const side = r() < 0.5 ? -1 : 1;
    const x = RIVER.centerX(z) + side * (RIVER.width / 2 + (r() - 0.3) * 1.2);
    const color = new THREE.Color(r() < 0.5 ? "#b9ae98" : "#9d9483");
    out.rocks.push({ x, z, s: 0.5 + r() * 0.9, ry: r() * 6.28, color });
  }
  return out;
}
