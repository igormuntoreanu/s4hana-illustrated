import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bridges } from "@/data/guide";
import {
  travelers,
  villageBuildings,
  type Anim,
  type Item,
  type Look,
  type Mover,
  type MoverKind,
  type Step,
  type Vec2,
} from "@/data/village-scene";
import { Builder, rng } from "./geo";
import { buildCargo, buildItem, buildMover } from "./props";
import { Polyline, roadPath, routePath, toWorld } from "./paths";
import { bridgeHeight, BRIDGE_HALF, groundHeight } from "./terrain";
import { RIVER } from "@/data/village-scene";
import { useVillage } from "./store";

const HATS = ["hardhat", "tophat", "cap", "hood", "bun", "hair"] as const;
type HatKind = (typeof HATS)[number];
const ITEMS: Item[] = ["crate", "coinBag", "parcel", "hammer", "clipboard", "toolbox", "gear", "scroll", "wrench"];
const HAND_ITEMS = new Set<Item>(["hammer", "wrench", "toolbox", "scroll"]);
const LEFT_ITEMS = new Set<Item>(["clipboard"]);
const HAIR = ["#3a2616", "#5a3a1f", "#1f1a17", "#8a5a2a", "#c9a06a", "#6b4a2e"];

type WorldStep =
  | { go: Vec2; item?: Item; speed: number }
  | { act: Anim; dur: Vec2; item?: Item; face?: Vec2 };

type Pose = { legL: number; legR: number; armL: number; armR: number; armLz: number; armRz: number; lean: number; bob: number; pitch: number; turn: number };

type Agent = {
  x: number;
  z: number;
  yaw: number;
  goalYaw: number;
  anim: Anim;
  t: number;
  item: Item | null;
  speed: number;
  scale: number;
  hat: HatKind;
  hatIndex: number;
  extra: boolean;
  building: string | null;
  steps: WorldStep[];
  step: number;
  timer: number;
  pose: Pose;
  visible: number;
  cheer: number;
  external: boolean;
};

type PathMover = {
  kind: MoverKind;
  line: Polyline;
  mode: "loop" | "pingpong" | "restart";
  speed: number;
  pause: Vec2;
  fadeAtEnd: boolean;
  s: number;
  dir: 1 | -1;
  wait: number;
  height: number;
  obj: THREE.Object3D | null;
  cargo: THREE.Object3D | null;
  driver: Agent | null;
  extra: boolean;
  traveler: boolean;
  stops?: number[];
  nextStop?: number;
  route?: boolean;
  item?: Item;
  color?: string;
};

const zeroPose = (): Pose => ({ legL: 0, legR: 0, armL: 0, armR: 0, armLz: 0, armRz: 0, lean: 0, bob: 0, pitch: 0, turn: 0 });

function targetPose(anim: Anim, t: number, out: Pose) {
  const s = Math.sin;
  out.legL = out.legR = out.armL = out.armR = out.armLz = out.armRz = out.lean = out.bob = out.pitch = out.turn = 0;
  switch (anim) {
    case "walk":
      out.legL = s(t) * 0.6;
      out.legR = -out.legL;
      out.armL = -s(t) * 0.5;
      out.armR = s(t) * 0.5;
      out.bob = Math.abs(s(t)) * 0.05;
      out.lean = 0.06;
      break;
    case "carry":
      out.legL = s(t) * 0.5;
      out.legR = -out.legL;
      out.armL = -1.25;
      out.armR = -1.25;
      out.armLz = -0.12;
      out.armRz = 0.12;
      out.bob = Math.abs(s(t)) * 0.04;
      out.lean = -0.04;
      break;
    case "idle":
      out.armL = 0.04 + s(t * 0.6) * 0.03;
      out.armR = 0.04 - s(t * 0.6) * 0.03;
      out.armLz = -0.06;
      out.armRz = 0.06;
      out.bob = s(t * 1.2) * 0.008;
      out.turn = s(t * 0.35) * 0.35;
      break;
    case "hammer": {
      const k = Math.max(0, s(t * 6.5));
      out.armR = -1.3 - k * 1.1;
      out.armL = -0.7;
      out.lean = 0.16 + k * 0.05;
      out.pitch = 0.3;
      break;
    }
    case "stamp": {
      const k = Math.max(0, s(t * 7.5));
      out.armR = -0.8 - k * 0.7;
      out.armL = -0.55;
      out.lean = 0.22;
      out.pitch = 0.35;
      break;
    }
    case "draft":
      out.armL = -0.95 + s(t * 2.1) * 0.08;
      out.armR = -1.0 + s(t * 3.3 + 1) * 0.12;
      out.lean = 0.28;
      out.pitch = 0.35;
      out.turn = s(t * 0.4) * 0.15;
      break;
    case "talk":
      out.armR = -0.45 - (0.5 + 0.5 * s(t * 3.1)) * 0.4;
      out.armRz = 0.2;
      out.armL = -0.15 - (0.5 + 0.5 * s(t * 2.3 + 1)) * 0.25;
      out.armLz = -0.15;
      out.pitch = s(t * 4) * 0.08;
      out.turn = s(t * 0.7) * 0.12;
      out.bob = s(t * 2) * 0.008;
      break;
    case "point":
      out.armR = -1.55 + s(t * 2) * 0.05;
      out.armRz = -0.05;
      out.armL = 0.05;
      out.pitch = -0.05;
      break;
    case "inspect":
      out.armL = -1.05;
      out.armLz = 0.1;
      out.armR = -0.85 + s(t * 9) * 0.08;
      out.pitch = 0.32;
      out.lean = 0.08;
      break;
    case "shake":
      out.armR = -1.05 + s(t * 11) * 0.16;
      out.armL = 0.04;
      out.lean = 0.06;
      break;
    case "cheer":
      out.armL = -2.8 + s(t * 8) * 0.2;
      out.armR = -2.8 - s(t * 8) * 0.2;
      out.armLz = -0.35;
      out.armRz = 0.35;
      out.bob = Math.abs(s(t * 6)) * 0.18;
      out.pitch = -0.2;
      break;
    case "sweep":
      out.armL = -0.6 + s(t * 3) * 0.3;
      out.armR = -0.6 + s(t * 3) * 0.3;
      out.lean = 0.2;
      break;
  }
}

function surfaceY(x: number, z: number) {
  if (Math.abs(z - RIVER.bridgeZ) < 1.3 && Math.abs(x) < BRIDGE_HALF) return bridgeHeight(x) + 0.13;
  return Math.max(0, groundHeight(x, z));
}

function partGeometries() {
  const white = "#ffffff";
  const leg = new Builder(1, 0.05).cbox(0.14, 0.4, 0.16, white, { y: -0.2 }).cbox(0.16, 0.08, 0.22, "#5a4a3a", { y: -0.38, z: 0.03 }).build();
  const torso = new Builder(2, 0.05).box(0.36, 0.44, 0.24, white).build();
  const head = new Builder(3, 0.03).ball(0.17, 1, white, { y: 0.17 }).build();
  const arm = new Builder(4, 0.05).cbox(0.11, 0.34, 0.12, white, { y: -0.16 }).build();
  const hand = new Builder(5, 0.03).ball(0.065, 0, white, { y: -0.37 }).build();
  const hats: Record<HatKind, THREE.BufferGeometry> = {
    hardhat: new Builder(6, 0.04).dome(0.2, 8, white, { y: 0.24 }).cyl(0.25, 0.25, 0.04, 10, white, { y: 0.22 }).build(),
    tophat: new Builder(7, 0.04).cyl(0.13, 0.13, 0.28, 8, white, { y: 0.3 }).cyl(0.22, 0.22, 0.03, 10, white, { y: 0.29 }).build(),
    cap: new Builder(8, 0.04).dome(0.18, 8, white, { y: 0.24 }).cbox(0.2, 0.03, 0.16, white, { y: 0.25, z: 0.18 }).build(),
    hood: new Builder(9, 0.04).dome(0.2, 8, white, { y: 0.19, z: -0.02, sy: 1.25 }).build(),
    bun: new Builder(10, 0.04).dome(0.18, 8, white, { y: 0.21, z: -0.02 }).ball(0.09, 0, white, { y: 0.38, z: -0.1 }).build(),
    hair: new Builder(11, 0.04).dome(0.182, 8, white, { y: 0.2, z: -0.02, sy: 0.9 }).build(),
  };
  const shadow = new THREE.CircleGeometry(0.34, 12);
  shadow.rotateX(-Math.PI / 2);
  return { leg, torso, head, arm, hand, hats, shadow };
}

function lookHat(look: Look): HatKind {
  if (!look.hat || look.hat === "none") return "hair";
  return look.hat;
}

function worldSteps(buildingId: string, steps: Step[]): WorldStep[] {
  const b = villageBuildings.find((v) => v.id === buildingId)!;
  return steps.map((s) =>
    "go" in s
      ? { go: toWorld(b, s.go), item: s.item, speed: s.speed ?? 1 }
      : { act: s.act, dur: s.dur, item: s.item, face: s.face ? toWorld(b, s.face) : undefined },
  );
}

const _m = new THREE.Matrix4();
const _root = new THREE.Matrix4();
const _torso = new THREE.Matrix4();
const _headM = new THREE.Matrix4();
const _armL = new THREE.Matrix4();
const _armR = new THREE.Matrix4();
const _out = new THREE.Matrix4();
const _e = new THREE.Euler();
const _zero = new THREE.Matrix4().makeScale(0, 0, 0);
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _pt = { x: 0, z: 0, yaw: 0 };
const _drv = { x: 0, z: 0, yaw: 0 };
const _s = new THREE.Vector3();

function child(out: THREE.Matrix4, parent: THREE.Matrix4, px: number, py: number, pz: number, rx: number, ry: number, rz: number) {
  _e.set(rx, ry, rz, "YXZ");
  _m.makeRotationFromEuler(_e);
  _m.setPosition(px, py, pz);
  return out.multiplyMatrices(parent, _m);
}

function angleLerp(a: number, b: number, k: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

export function Characters({ material }: { material: THREE.Material }) {
  const quality = useVillage((s) => s.quality);
  const routeId = useVillage((s) => s.routeId);
  const geos = useMemo(partGeometries, []);
  const itemGeos = useMemo(() => Object.fromEntries(ITEMS.map((i) => [i, buildItem(i)])) as Record<Item, THREE.BufferGeometry>, []);
  const moverGeos = useMemo(() => {
    const kinds: MoverKind[] = ["forklift", "truck", "van", "coinCart", "product", "handcart", "wagon"];
    return Object.fromEntries(kinds.map((k) => [k, buildMover(k)])) as Record<MoverKind, THREE.BufferGeometry>;
  }, []);
  const cargoGeos = useMemo(() => ({ handcart: buildCargo("handcart"), wagon: buildCargo("wagon"), route: buildCargo("route") }), []);

  const world = useMemo(() => {
    const r = rng(77);
    const agents: Agent[] = [];
    const hatCounts: Record<HatKind, number> = { hardhat: 0, tophat: 0, cap: 0, hood: 0, bun: 0, hair: 0 };
    const looks: Look[] = [];
    const make = (look: Look, at: Vec2, extra: boolean, building: string | null, steps: WorldStep[], external: boolean): Agent => {
      const hat = lookHat(look);
      const a: Agent = {
        x: at[0],
        z: at[1],
        yaw: r() * Math.PI * 2,
        goalYaw: 0,
        anim: "idle",
        t: r() * 10,
        item: null,
        speed: 1.05 + (r() - 0.5) * 0.3,
        scale: 0.94 + r() * 0.14,
        hat,
        hatIndex: hatCounts[hat]++,
        extra,
        building,
        steps,
        step: steps.length ? Math.floor(r() * steps.length) : 0,
        timer: 0,
        pose: zeroPose(),
        visible: 1,
        cheer: 0,
        external,
      };
      a.goalYaw = a.yaw;
      const cur = steps[a.step];
      if (cur && "act" in cur) a.timer = cur.dur[0] + r() * (cur.dur[1] - cur.dur[0]);
      agents.push(a);
      looks.push(look);
      return a;
    };
    for (const b of villageBuildings) {
      for (const actor of b.actors) make(actor.look, toWorld(b, actor.at), Boolean(actor.extra), b.id, worldSteps(b.id, actor.loop), false);
    }
    const movers: PathMover[] = [];
    for (const b of villageBuildings) {
      for (const m of b.movers as Mover[]) {
        const pts = m.space === "world" ? m.path : m.path.map((p) => toWorld(b, p));
        const closed = m.mode === "loop" ? [...pts, pts[0]] : pts;
        const line = new Polyline(closed);
        const mode = m.kind === "product" ? "restart" : m.mode;
        movers.push({
          kind: m.kind,
          line,
          mode,
          speed: m.speed * (0.9 + r() * 0.2),
          pause: m.pause,
          fadeAtEnd: Boolean(m.fadeAtEnd),
          s: mode === "restart" ? 0 : r() * line.length,
          dir: 1,
          wait: m.kind === "product" ? m.pause[0] : r() * 2,
          height: m.height ?? 0,
          obj: null,
          cargo: null,
          driver: m.driver ? make(m.driver, pts[0], false, b.id, [], true) : null,
          extra: false,
          traveler: false,
          color: m.color,
        });
      }
    }
    for (const t of travelers) {
      const line = new Polyline(roadPath(t.from, t.to));
      const walker = make(t.look, line.pts[0], Boolean(t.extra), null, [], true);
      movers.push({
        kind: t.vehicle ?? "handcart",
        line,
        mode: "pingpong",
        speed: 1.15 * (0.9 + r() * 0.2),
        pause: [2, 4],
        fadeAtEnd: false,
        s: r() * line.length,
        dir: r() < 0.5 ? 1 : -1,
        wait: 0,
        height: 0,
        obj: null,
        cargo: null,
        driver: walker,
        extra: Boolean(t.extra),
        traveler: !t.vehicle,
        item: t.item,
      });
    }
    const routeDriver = make({ shirt: "#c4321a", pants: "#1a2744", skin: "#f1c7a0", hat: "cap", hatColor: "#fffaf3" }, [0, 0], false, null, [], true);
    routeDriver.visible = 0;
    const route: PathMover = {
      kind: "wagon",
      line: new Polyline([
        [0, 0],
        [0, 1],
      ]),
      mode: "restart",
      speed: 2.1,
      pause: [1.6, 1.6],
      fadeAtEnd: false,
      s: 0,
      dir: 1,
      wait: 0,
      height: 0,
      obj: null,
      cargo: null,
      driver: routeDriver,
      extra: false,
      traveler: false,
      route: true,
      stops: [],
      nextStop: 0,
    };
    return { agents, looks, movers, route, hatCounts };
  }, []);

  const torsoRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const legRef = useRef<THREE.InstancedMesh>(null);
  const armRef = useRef<THREE.InstancedMesh>(null);
  const handRef = useRef<THREE.InstancedMesh>(null);
  const shadowRef = useRef<THREE.InstancedMesh>(null);
  const hatRefs = useRef<Partial<Record<HatKind, THREE.InstancedMesh | null>>>({});
  const itemRefs = useRef<Partial<Record<Item, THREE.InstancedMesh | null>>>({});
  const moverRefs = useRef<Array<THREE.Object3D | null>>([]);
  const cargoRefs = useRef<Array<THREE.Object3D | null>>([]);
  const routeRef = useRef<THREE.Group>(null);
  const routeCargoRef = useRef<THREE.Mesh>(null);

  const n = world.agents.length;
  const nShadows = n + world.movers.length + 1;

  useEffect(() => {
    const c = new THREE.Color();
    world.agents.forEach((a, i) => {
      const look = world.looks[i];
      torsoRef.current?.setColorAt(i, c.set(look.shirt));
      armRef.current?.setColorAt(i * 2, c.set(look.shirt));
      armRef.current?.setColorAt(i * 2 + 1, c.set(look.shirt));
      headRef.current?.setColorAt(i, c.set(look.skin ?? "#f1c7a0"));
      handRef.current?.setColorAt(i * 2, c.set(look.skin ?? "#f1c7a0"));
      handRef.current?.setColorAt(i * 2 + 1, c.set(look.skin ?? "#f1c7a0"));
      legRef.current?.setColorAt(i * 2, c.set(look.pants));
      legRef.current?.setColorAt(i * 2 + 1, c.set(look.pants));
      const hat = hatRefs.current[a.hat];
      hat?.setColorAt(a.hatIndex, c.set(a.hat === "hair" ? HAIR[i % HAIR.length] : (look.hatColor ?? "#5a3a1f")));
    });
    for (const m of [torsoRef, armRef, headRef, handRef, legRef]) if (m.current?.instanceColor) m.current.instanceColor.needsUpdate = true;
    for (const h of HATS) {
      const mesh = hatRefs.current[h];
      if (mesh?.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [world]);

  useEffect(() => {
    const route = world.route;
    const bridge = bridges.find((b) => b.id === routeId);
    if (!bridge) {
      route.driver!.visible = 0;
      return;
    }
    const { pts, stops } = routePath(bridge.wingIds);
    route.line = new Polyline(pts);
    route.stops = stops;
    route.nextStop = 0;
    route.s = 0;
    route.wait = 0.4;
    route.driver!.visible = 1;
  }, [routeId, world]);

  const celebrate = useVillage((s) => s.celebrate);
  useEffect(() => {
    if (!celebrate) return;
    for (const a of world.agents) if (a.building === celebrate) a.cheer = 3.2;
  }, [celebrate, world]);

  useFrame((state, rawDt) => {
    const reduced = useVillage.getState().reduced;
    const dt = reduced ? 0 : Math.min(rawDt, 0.05);
    const low = quality === "low";
    const r = Math.random;

    // Building loops
    for (const a of world.agents) {
      if (a.external) continue;
      a.visible = low && a.extra ? 0 : 1;
      if (!a.steps.length || dt === 0) continue;
      if (a.cheer > 0) {
        a.cheer -= dt;
        a.anim = "cheer";
        a.item = null;
        continue;
      }
      const st = a.steps[a.step];
      if ("go" in st && a.timer < 0) {
        a.timer += dt;
        a.anim = "idle";
        continue;
      }
      if ("go" in st) {
        const dx = st.go[0] - a.x;
        const dz = st.go[1] - a.z;
        const d = Math.hypot(dx, dz);
        const v = a.speed * st.speed * 1.15;
        a.item = st.item ?? null;
        a.anim = a.item && !HAND_ITEMS.has(a.item) && !LEFT_ITEMS.has(a.item) ? "carry" : "walk";
        if (d < 0.05) {
          a.step = (a.step + 1) % a.steps.length;
          const next = a.steps[a.step];
          a.timer = "act" in next ? next.dur[0] + r() * (next.dur[1] - next.dur[0]) : r() < 0.25 ? -(0.3 + r() * 0.9) : 0;
        } else {
          const k = Math.min(1, (v * dt) / d);
          a.x += dx * k;
          a.z += dz * k;
          a.goalYaw = Math.atan2(dx, dz);
        }
      } else {
        a.anim = st.act;
        a.item = st.item ?? null;
        if (st.face) a.goalYaw = Math.atan2(st.face[0] - a.x, st.face[1] - a.z);
        a.timer -= dt;
        if (a.timer <= 0) {
          a.step = (a.step + 1) % a.steps.length;
          const next = a.steps[a.step];
          if ("act" in next) a.timer = next.dur[0] + r() * (next.dur[1] - next.dur[0]);
        }
      }
    }

    // Movers, travellers, drivers
    const all = [...world.movers, world.route];
    all.forEach((m, mi) => {
      const obj = m.route ? routeRef.current : moverRefs.current[mi];
      const cargo = m.route ? routeCargoRef.current : cargoRefs.current[mi];
      const hidden = (low && m.extra) || (m.route && !routeId);
      if (m.driver) m.driver.visible = hidden ? 0 : 1;
      if (hidden) {
        if (obj) obj.visible = false;
        return;
      }
      if (dt > 0) {
        if (m.wait > 0) {
          m.wait -= dt;
        } else if (m.route) {
          m.s += m.speed * dt;
          const stop = m.stops![m.nextStop!];
          if (stop !== undefined && m.s >= stop) {
            m.s = stop;
            m.wait = m.pause[0];
            m.nextStop! += 1;
          } else if (m.s >= m.line.length) {
            m.s = 0;
            m.nextStop = 0;
            m.wait = 1.2;
          }
        } else if (m.mode === "loop") {
          m.s += m.speed * dt;
          if (m.s >= m.line.length) {
            m.s -= m.line.length;
            m.wait = m.pause[0] + r() * (m.pause[1] - m.pause[0]);
          }
        } else if (m.mode === "restart") {
          m.s += m.speed * dt;
          if (m.s >= m.line.length) {
            m.s = 0;
            m.wait = m.pause[0] + r() * (m.pause[1] - m.pause[0]);
          }
        } else {
          m.s += m.speed * dt * m.dir;
          if (m.s >= m.line.length || m.s <= 0) {
            m.s = Math.max(0, Math.min(m.line.length, m.s));
            m.dir = m.dir === 1 ? -1 : 1;
            m.wait = m.pause[0] + r() * (m.pause[1] - m.pause[0]);
          }
        }
      }
      const moving = m.wait <= 0;
      const forward = m.mode === "pingpong" ? m.dir : 1;
      m.line.at(m.s, _pt);
      const yaw = _pt.yaw + (forward === -1 ? Math.PI : 0);
      let scale = 1;
      if (m.fadeAtEnd) {
        const seg = m.line.segmentIndex(m.s);
        if (seg === m.line.pts.length - 2) {
          const a0 = m.line.cum[seg];
          const f = (m.s - a0) / (m.line.length - a0 || 1);
          scale = 1 - Math.min(1, Math.max(0, (f - 0.3) / 0.6));
        }
      }
      if (m.mode === "restart" || m.route) {
        const fin = Math.min(1, m.s / 0.5, (m.line.length - m.s) / 0.5 + (m.route ? 1 : 0));
        scale = Math.max(0, Math.min(scale, fin));
        if (m.route && m.s === 0 && m.wait > 0) scale = 0;
      }
      if (m.traveler) {
        // Walkers without a cart carry their item out and return empty-handed.
        const a = m.driver!;
        a.x = _pt.x;
        a.z = _pt.z;
        a.goalYaw = yaw;
        a.item = forward === 1 ? (m.item ?? null) : null;
        a.anim = moving ? (a.item && !HAND_ITEMS.has(a.item) ? "carry" : "walk") : "idle";
        if (obj) obj.visible = false;
        return;
      }
      const lead = m.kind === "product" ? 0 : m.kind === "forklift" || m.kind === "truck" || m.kind === "van" ? 0 : 1.25;
      if (m.driver) {
        const ds = m.s + lead * forward;
        const clamped = Math.max(0, Math.min(m.line.length, ds));
        m.line.at(clamped, _drv);
        const over = Math.abs(ds - clamped);
        const a = m.driver;
        const tx = _drv.x + Math.sin(yaw) * over;
        const tz = _drv.z + Math.cos(yaw) * over;
        const k = dt === 0 ? 1 : Math.min(1, dt * 6);
        const far = Math.hypot(tx - a.x, tz - a.z) > 0.25;
        a.x += (tx - a.x) * k;
        a.z += (tz - a.z) * k;
        a.goalYaw = far && !moving ? Math.atan2(tx - a.x, tz - a.z) : yaw;
        a.item = null;
        a.anim = moving || far ? "carry" : "idle";
        a.scale = scale || 0.0001;
      }
      if (obj) {
        obj.visible = scale > 0.01;
        const y = m.kind === "product" ? m.height : surfaceY(_pt.x, _pt.z);
        obj.position.set(_pt.x, y, _pt.z);
        obj.rotation.set(0, angleLerp(obj.rotation.y, yaw, moving ? 0.2 : 0.05), 0);
        if (m.kind === "product") obj.rotation.y = yaw;
        if (moving && m.kind !== "product" && (m.kind === "handcart" || m.kind === "wagon" || m.kind === "coinCart")) {
          obj.rotation.z = Math.sin(state.clock.elapsedTime * 9 + mi) * 0.012;
        }
        obj.scale.setScalar(scale);
      }
      if (cargo) cargo.visible = m.route ? true : forward === 1;
    });

    // Pose + matrices
    const torso = torsoRef.current;
    const head = headRef.current;
    const legs = legRef.current;
    const arms = armRef.current;
    const hands = handRef.current;
    const shadows = shadowRef.current;
    if (!torso || !head || !legs || !arms || !hands || !shadows) return;
    const itemCounts: Partial<Record<Item, number>> = {};
    const blend = dt === 0 ? 1 : 1 - Math.exp(-dt * 10);
    const target = zeroPose();
    world.agents.forEach((a, i) => {
      const hatMesh = hatRefs.current[a.hat];
      if (!a.visible) {
        torso.setMatrixAt(i, _zero);
        head.setMatrixAt(i, _zero);
        legs.setMatrixAt(i * 2, _zero);
        legs.setMatrixAt(i * 2 + 1, _zero);
        arms.setMatrixAt(i * 2, _zero);
        arms.setMatrixAt(i * 2 + 1, _zero);
        hands.setMatrixAt(i * 2, _zero);
        hands.setMatrixAt(i * 2 + 1, _zero);
        hatMesh?.setMatrixAt(a.hatIndex, _zero);
        shadows.setMatrixAt(i, _zero);
        return;
      }
      const moving = a.anim === "walk" || a.anim === "carry";
      a.t += dt * (moving ? a.speed * 7.5 : 1);
      a.yaw = angleLerp(a.yaw, a.goalYaw, dt === 0 ? 1 : 1 - Math.exp(-dt * 8));
      targetPose(a.anim, a.t, target);
      const p = a.pose;
      for (const k of Object.keys(p) as Array<keyof Pose>) p[k] += (target[k] - p[k]) * blend;
      const y = surfaceY(a.x, a.z);
      _e.set(0, a.yaw, 0);
      _q.setFromEuler(_e);
      _root.compose(_v.set(a.x, y + p.bob, a.z), _q, _s.set(a.scale, a.scale, a.scale));
      child(_torso, _root, 0, 0.4, 0, p.lean, 0, 0);
      torso.setMatrixAt(i, _torso);
      child(_headM, _torso, 0, 0.44, 0, p.pitch, p.turn, 0);
      head.setMatrixAt(i, _headM);
      hatMesh?.setMatrixAt(a.hatIndex, _headM);
      legs.setMatrixAt(i * 2, child(_out, _root, -0.09, 0.42, 0, p.legL, 0, 0));
      legs.setMatrixAt(i * 2 + 1, child(_out, _root, 0.09, 0.42, 0, p.legR, 0, 0));
      child(_armL, _torso, -0.245, 0.4, 0, p.armL, 0, -p.armLz - 0.05);
      child(_armR, _torso, 0.245, 0.4, 0, p.armR, 0, -p.armRz + 0.05);
      arms.setMatrixAt(i * 2, _armL);
      arms.setMatrixAt(i * 2 + 1, _armR);
      hands.setMatrixAt(i * 2, _armL);
      hands.setMatrixAt(i * 2 + 1, _armR);
      _out.makeTranslation(0, 0.012, 0).multiply(_m.makeScale(a.scale * 1.1, 1, a.scale * 1.1));
      _out.setPosition(a.x, y + 0.012, a.z);
      shadows.setMatrixAt(i, _out);
      if (a.item) {
        const mesh = itemRefs.current[a.item];
        if (mesh) {
          const idx = itemCounts[a.item] ?? 0;
          itemCounts[a.item] = idx + 1;
          if (HAND_ITEMS.has(a.item)) child(_out, _armR, 0, -0.38, 0.03, 0, 0, 0);
          else if (LEFT_ITEMS.has(a.item)) child(_out, _armL, 0, -0.36, 0.06, 1.1, 0, 0);
          else child(_out, _torso, 0, 0.26, 0.34, -p.lean, 0, 0);
          mesh.setMatrixAt(idx, _out);
        }
      }
    });
    world.movers.forEach((m, mi) => {
      const obj = moverRefs.current[mi];
      const idx = n + mi;
      if (!obj || !obj.visible || m.kind === "product") {
        shadows.setMatrixAt(idx, _zero);
        return;
      }
      const s = m.kind === "truck" ? 3.4 : m.kind === "van" ? 2.8 : m.kind === "forklift" ? 2 : 1.8;
      _out.makeScale(s * obj.scale.x * 0.8, 1, s * obj.scale.x * 1.2);
      _out.premultiply(_m.makeRotationY(obj.rotation.y));
      _out.setPosition(obj.position.x, obj.position.y + 0.012, obj.position.z);
      shadows.setMatrixAt(idx, _out);
    });
    const ro = routeRef.current;
    if (ro && ro.visible) {
      _out.makeScale(2.2 * ro.scale.x, 1, 2.8 * ro.scale.x);
      _out.premultiply(_m.makeRotationY(ro.rotation.y));
      _out.setPosition(ro.position.x, ro.position.y + 0.015, ro.position.z);
      shadows.setMatrixAt(n + world.movers.length, _out);
    } else shadows.setMatrixAt(n + world.movers.length, _zero);
    for (const it of ITEMS) {
      const mesh = itemRefs.current[it];
      if (!mesh) continue;
      mesh.count = itemCounts[it] ?? 0;
      mesh.instanceMatrix.needsUpdate = true;
    }
    for (const m of [torso, head, legs, arms, hands, shadows]) m.instanceMatrix.needsUpdate = true;
    for (const h of HATS) {
      const mesh = hatRefs.current[h];
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    }
  });

  const shadowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#3a2a14", transparent: true, opacity: 0.22, depthWrite: false }), []);

  return (
    <group>
      <instancedMesh ref={torsoRef} args={[geos.torso, material, n]} frustumCulled={false} />
      <instancedMesh ref={headRef} args={[geos.head, material, n]} frustumCulled={false} />
      <instancedMesh ref={legRef} args={[geos.leg, material, n * 2]} frustumCulled={false} />
      <instancedMesh ref={armRef} args={[geos.arm, material, n * 2]} frustumCulled={false} />
      <instancedMesh ref={handRef} args={[geos.hand, material, n * 2]} frustumCulled={false} />
      <instancedMesh ref={shadowRef} args={[geos.shadow, shadowMat, nShadows]} frustumCulled={false} renderOrder={1} />
      {HATS.map((h) => (
        <instancedMesh
          key={h}
          ref={(el) => {
            hatRefs.current[h] = el;
          }}
          args={[geos.hats[h], material, Math.max(1, world.hatCounts[h])]}
          frustumCulled={false}
        />
      ))}
      {ITEMS.map((it) => (
        <instancedMesh
          key={it}
          ref={(el) => {
            itemRefs.current[it] = el;
          }}
          args={[itemGeos[it], material, n]}
          frustumCulled={false}
        />
      ))}
      {world.movers.map((m, i) => (
        <group
          key={i}
          ref={(el) => {
            moverRefs.current[i] = el;
          }}
        >
          <mesh geometry={moverGeos[m.kind]} material={m.color ? tinted(m.color) : material} />
          {(m.kind === "handcart" || m.kind === "wagon") && (
            <mesh
              ref={(el) => {
                cargoRefs.current[i] = el;
              }}
              geometry={cargoGeos[m.kind]}
              material={material}
            />
          )}
        </group>
      ))}
      <group ref={routeRef} visible={false}>
        <mesh geometry={moverGeos.wagon} material={material} />
        <mesh ref={routeCargoRef} geometry={cargoGeos.route} material={material} />
      </group>
    </group>
  );
}

const tintCache = new Map<string, THREE.Material>();
function tinted(color: string) {
  let mat = tintCache.get(color);
  if (!mat) {
    mat = new THREE.MeshLambertMaterial({ vertexColors: true, color });
    tintCache.set(color, mat);
  }
  return mat;
}

export function useCharacterCount() {
  return useMemo(() => {
    let local = 0;
    for (const b of villageBuildings) local += b.actors.length;
    return local + travelers.length;
  }, []);
}
