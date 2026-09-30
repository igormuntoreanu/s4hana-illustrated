import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tmpColor = new THREE.Color();

type Placement = {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sy?: number;
  sz?: number;
};

/**
 * Collects coloured primitives into one flat-shaded, vertex-coloured geometry.
 * Every face gets a small random lightness shift so surfaces read as painted.
 */
export class Builder {
  private parts: THREE.BufferGeometry[] = [];
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()];
  private rand: () => number;
  jitter: number;

  constructor(seed = 1, jitter = 0.07) {
    this.rand = rng(seed);
    this.jitter = jitter;
  }

  private get top() {
    return this.stack[this.stack.length - 1];
  }

  /** Runs `fn` with a nested transform, like a group. */
  group(p: Placement, fn: () => void) {
    const m = this.top.clone().multiply(placement(p));
    this.stack.push(m);
    fn();
    this.stack.pop();
  }

  add(geo: THREE.BufferGeometry, color: string, p: Placement = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo;
    if (g === geo) g = geo.clone();
    g.deleteAttribute("uv");
    g.deleteAttribute("normal");
    g.applyMatrix4(this.top.clone().multiply(placement(p)));
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    tmpColor.set(color);
    for (let i = 0; i < count; i += 3) {
      const k = 1 + (this.rand() - 0.5) * this.jitter;
      for (let v = 0; v < 3; v++) {
        colors[(i + v) * 3] = tmpColor.r * k;
        colors[(i + v) * 3 + 1] = tmpColor.g * k;
        colors[(i + v) * 3 + 2] = tmpColor.b * k;
      }
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.parts.push(g);
    geo.dispose();
    return this;
  }

  box(w: number, h: number, d: number, color: string, p: Placement = {}) {
    return this.add(new THREE.BoxGeometry(w, h, d), color, { ...p, y: (p.y ?? 0) + h / 2 });
  }

  /** Box centred on its placement point instead of resting on it. */
  cbox(w: number, h: number, d: number, color: string, p: Placement = {}) {
    return this.add(new THREE.BoxGeometry(w, h, d), color, p);
  }

  cyl(rTop: number, rBottom: number, h: number, seg: number, color: string, p: Placement = {}) {
    return this.add(new THREE.CylinderGeometry(rTop, rBottom, h, seg), color, { ...p, y: (p.y ?? 0) + h / 2 });
  }

  cone(r: number, h: number, seg: number, color: string, p: Placement = {}) {
    return this.add(new THREE.ConeGeometry(r, h, seg), color, { ...p, y: (p.y ?? 0) + h / 2 });
  }

  ball(r: number, detail: number, color: string, p: Placement = {}) {
    return this.add(new THREE.IcosahedronGeometry(r, detail), color, p);
  }

  dome(r: number, seg: number, color: string, p: Placement = {}) {
    return this.add(new THREE.SphereGeometry(r, seg, Math.max(3, Math.round(seg / 2)), 0, Math.PI * 2, 0, Math.PI / 2), color, p);
  }

  /** Triangular prism: gable roofs. Ridge runs along x. */
  prism(len: number, width: number, height: number, color: string, p: Placement = {}, peak = 0.5) {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(-width / 2 + width * peak, height);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false });
    g.translate(0, 0, -len / 2);
    g.rotateY(Math.PI / 2);
    return this.add(g, color, p);
  }

  /** Gable roof with overhang, as two slanted slabs over a gable fill. */
  gableRoof(len: number, width: number, height: number, color: string, gable: string, p: Placement = {}, over = 0.35) {
    this.group(p, () => {
      this.prism(len - 0.02, width - 0.02, height - 0.02, gable);
      const slope = Math.hypot(width / 2 + over, height + over * (height / (width / 2)));
      const angle = Math.atan2(height, width / 2);
      for (const side of [-1, 1]) {
        this.cbox(len + over * 2, 0.18, slope, color, {
          x: 0,
          y: height / 2 + 0.05,
          z: (side * (width / 2)) / 2,
          rx: side * angle,
        });
      }
      this.cbox(len + over * 2 + 0.05, 0.2, 0.26, shade(color, 0.8), { y: height + 0.08 });
    });
    return this;
  }

  build(): THREE.BufferGeometry {
    const merged = this.parts.length ? mergeGeometries(this.parts, false) : new THREE.BufferGeometry();
    for (const part of this.parts) part.dispose();
    this.parts = [];
    merged.computeVertexNormals();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  }
}

function placement(p: Placement) {
  const m = new THREE.Matrix4();
  m.compose(
    new THREE.Vector3(p.x ?? 0, p.y ?? 0, p.z ?? 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(p.rx ?? 0, p.ry ?? 0, p.rz ?? 0, "YXZ")),
    new THREE.Vector3(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1),
  );
  return m;
}

export function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l * k)));
  return `#${c.getHexString()}`;
}
