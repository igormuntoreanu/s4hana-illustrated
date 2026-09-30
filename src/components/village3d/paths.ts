import { roadEdges, roadNodes, villageBuildings, type Vec2, type VillageBuilding } from "@/data/village-scene";

export function toWorld(b: VillageBuilding, p: Vec2): Vec2 {
  const c = Math.cos(b.facing);
  const s = Math.sin(b.facing);
  return [b.pos[0] + p[0] * c + p[1] * s, b.pos[1] - p[0] * s + p[1] * c];
}

export function doorWorld(b: VillageBuilding): Vec2 {
  return toWorld(b, [b.door[0], b.door[1] + 0.6]);
}

function nodePos(id: string): Vec2 {
  if (id.startsWith("door:")) {
    const b = villageBuildings.find((v) => v.id === id.slice(5));
    if (!b) throw new Error(`Unknown door ${id}`);
    return doorWorld(b);
  }
  const p = roadNodes[id];
  if (!p) throw new Error(`Unknown road node ${id}`);
  return p;
}

const adjacency = new Map<string, Array<{ to: string; d: number }>>();
for (const [a, b] of roadEdges) {
  const pa = nodePos(a);
  const pb = nodePos(b);
  const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]);
  if (!adjacency.has(a)) adjacency.set(a, []);
  if (!adjacency.has(b)) adjacency.set(b, []);
  adjacency.get(a)!.push({ to: b, d });
  adjacency.get(b)!.push({ to: a, d });
}

/** Road segments for drawing. */
export function roadSegments(): Array<[Vec2, Vec2]> {
  return roadEdges.map(([a, b]) => [nodePos(a), nodePos(b)]);
}

export function roadJoints(): Vec2[] {
  return [...adjacency.keys()].map(nodePos);
}

/** Shortest road path between two buildings' doors, computed once at load. */
export function roadPath(fromId: string, toId: string): Vec2[] {
  const start = `door:${fromId}`;
  const goal = `door:${toId}`;
  const dist = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, string>();
  const open = new Set<string>([start]);
  while (open.size) {
    let cur = "";
    let best = Infinity;
    for (const id of open) {
      const d = dist.get(id) ?? Infinity;
      if (d < best) {
        best = d;
        cur = id;
      }
    }
    open.delete(cur);
    if (cur === goal) break;
    for (const { to, d } of adjacency.get(cur) ?? []) {
      const nd = best + d;
      if (nd < (dist.get(to) ?? Infinity)) {
        dist.set(to, nd);
        prev.set(to, cur);
        open.add(to);
      }
    }
  }
  const ids: string[] = [goal];
  while (ids[0] !== start) {
    const p = prev.get(ids[0]);
    if (!p) return [nodePos(start), nodePos(goal)];
    ids.unshift(p);
  }
  return ids.map(nodePos);
}

export class Polyline {
  pts: Vec2[];
  cum: number[];
  length: number;

  constructor(pts: Vec2[]) {
    this.pts = pts;
    this.cum = [0];
    for (let i = 1; i < pts.length; i++) {
      this.cum.push(this.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    this.length = this.cum[this.cum.length - 1];
  }

  /** Position and heading at distance `s` along the line. */
  at(s: number, out: { x: number; z: number; yaw: number }) {
    const d = Math.max(0, Math.min(this.length, s));
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < d) i++;
    const a = this.pts[i - 1];
    const b = this.pts[i];
    const seg = this.cum[i] - this.cum[i - 1] || 1;
    const t = (d - this.cum[i - 1]) / seg;
    out.x = a[0] + (b[0] - a[0]) * t;
    out.z = a[1] + (b[1] - a[1]) * t;
    out.yaw = Math.atan2(b[0] - a[0], b[1] - a[1]);
    return out;
  }

  segmentIndex(s: number) {
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < s) i++;
    return i - 1;
  }
}

/** Route path through buildings in order, door to door along the roads. */
export function routePath(wingIds: string[]): { pts: Vec2[]; stops: number[] } {
  const pts: Vec2[] = [];
  const stops: number[] = [];
  for (let i = 0; i < wingIds.length - 1; i++) {
    const leg = roadPath(wingIds[i], wingIds[i + 1]);
    if (pts.length) leg.shift();
    pts.push(...leg);
  }
  if (wingIds.length === 1) {
    const b = villageBuildings.find((v) => v.id === wingIds[0]);
    if (b) pts.push(doorWorld(b));
  }
  const line = new Polyline(pts);
  for (const id of wingIds) {
    const b = villageBuildings.find((v) => v.id === id);
    if (!b) continue;
    const d = doorWorld(b);
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const dd = Math.hypot(pts[i][0] - d[0], pts[i][1] - d[1]);
      if (dd < bestD && (stops.length === 0 || line.cum[i] >= stops[stops.length - 1])) {
        bestD = dd;
        best = line.cum[i];
      }
    }
    stops.push(best);
  }
  return { pts, stops };
}

export function distToSegment(p: Vec2, a: Vec2, b: Vec2) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2));
  return Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dz * t));
}
