import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import * as THREE from "three";
import { bridges, wingById } from "@/data/guide";
import { villageBuildings, type VillageBuilding } from "@/data/village-scene";
import { Builder } from "./geo";
import { buildBuilding, buildCraneJib } from "./buildings";
import {
  buildAppleTree,
  buildBanner,
  buildBush,
  buildFlag,
  buildPine,
  buildProp,
  buildRock,
  buildRoundTree,
} from "./props";
import {
  bridgeHeight,
  BRIDGE_HALF,
  buildBridge,
  buildGround,
  buildRiver,
  buildRoads,
  buildScatters,
  riverMaterial,
  type Scatter,
  type Scatters,
} from "./terrain";
import { Polyline, routePath, toWorld } from "./paths";
import { RIVER } from "@/data/village-scene";
import { CameraRig, lastPointerType, zoomState } from "./camera-rig";
import { Characters } from "./characters";
import { labelEls, treeLabelEls, useVillage } from "./store";

export type Assets = {
  ground: THREE.BufferGeometry;
  river: THREE.BufferGeometry;
  roads: THREE.BufferGeometry;
  bridge: THREE.BufferGeometry;
  scatters: Scatters;
  buildings: Record<string, { shell: THREE.BufferGeometry; props: THREE.BufferGeometry }>;
  pine: THREE.BufferGeometry;
  round: THREE.BufferGeometry;
  bush: THREE.BufferGeometry;
  rock: THREE.BufferGeometry;
  apple: THREE.BufferGeometry;
  banner: THREE.BufferGeometry;
  flag: THREE.BufferGeometry;
  jib: THREE.BufferGeometry;
};

let cached: Assets | null = null;

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Builds the village step by step so the loader can show real progress. */
export async function buildAssets(onStep: (label: string) => void): Promise<Assets> {
  if (cached) return cached;
  const a: Partial<Assets> = {};
  onStep("Shaping the ground");
  await frame();
  a.ground = buildGround();
  onStep("Filling the river");
  await frame();
  a.river = buildRiver();
  a.bridge = buildBridge();
  onStep("Laying the roads");
  await frame();
  a.roads = buildRoads();
  onStep("Planting trees");
  await frame();
  a.scatters = buildScatters();
  a.pine = buildPine();
  a.round = buildRoundTree();
  a.bush = buildBush();
  a.rock = buildRock();
  a.apple = buildAppleTree();
  a.banner = buildBanner();
  a.flag = buildFlag();
  a.jib = buildCraneJib();
  a.buildings = {};
  for (const [i, b] of villageBuildings.entries()) {
    onStep(`Raising ${(wingById(b.id)?.place ?? b.id).replace(/^The /, "the ")}`);
    await frame();
    const props = new Builder(100 + i, 0.08);
    for (const p of b.props) {
      props.group({ x: p.at[0], z: p.at[1], ry: p.rot ?? 0, sx: p.s ?? 1, sy: p.s ?? 1, sz: p.s ?? 1 }, () => buildProp(p.kind, props));
    }
    a.buildings[b.id] = { shell: buildBuilding(b.style, 10 + i), props: props.build() };
  }
  cached = a as Assets;
  return cached;
}

export const BUILD_STEPS = 4 + villageBuildings.length;

function Lights({ shadows }: { shadows: boolean }) {
  const light = useRef<THREE.DirectionalLight>(null);
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    const c = l.shadow.camera;
    c.left = -48;
    c.right = 48;
    c.top = 36;
    c.bottom = -36;
    c.near = 1;
    c.far = 160;
    c.updateProjectionMatrix();
    l.shadow.bias = -0.0006;
    l.shadow.normalBias = 0.04;
  }, []);
  return (
    <>
      <hemisphereLight args={["#fff1d8", "#8f7c55", 1.25]} />
      <directionalLight
        ref={light}
        position={[-34, 52, 30]}
        intensity={1.9}
        color="#ffe2b4"
        castShadow={shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[30, 20, -30]} intensity={0.35} color="#b9d0ff" />
    </>
  );
}

function ScatterMesh({ geo, items, material, castShadow, fraction }: { geo: THREE.BufferGeometry; items: Scatter[]; material: THREE.Material; castShadow: boolean; fraction: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    items.forEach((it, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.ry);
      m.compose(new THREE.Vector3(it.x, 0, it.z), q, new THREE.Vector3(it.s, it.s, it.s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, it.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  useEffect(() => {
    if (ref.current) ref.current.count = Math.round(items.length * fraction);
  }, [fraction, items.length]);
  return <instancedMesh ref={ref} args={[geo, material, items.length]} castShadow={castShadow} receiveShadow />;
}

function Terrain({ assets, shadows, fraction }: { assets: Assets; shadows: boolean; fraction: number }) {
  const lambert = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), []);
  const river = useMemo(riverMaterial, []);
  useFrame(({ scene }, dt) => {
    if (!useVillage.getState().reduced) river.uniforms.uTime.value += Math.min(dt, 0.05);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      river.uniforms.uFogNear.value = fog.near - 20;
      river.uniforms.uFogFar.value = fog.far - 20;
    }
  });
  return (
    <group>
      <mesh geometry={assets.ground} material={lambert} receiveShadow />
      <mesh geometry={assets.river} material={river} />
      <mesh geometry={assets.roads} material={lambert} receiveShadow />
      <mesh geometry={assets.bridge} material={lambert} castShadow={shadows} receiveShadow />
      <ScatterMesh geo={assets.pine} items={assets.scatters.pines} material={lambert} castShadow={shadows} fraction={fraction} />
      <ScatterMesh geo={assets.round} items={assets.scatters.rounds} material={lambert} castShadow={shadows} fraction={fraction} />
      <ScatterMesh geo={assets.bush} items={assets.scatters.bushes} material={lambert} castShadow={false} fraction={fraction} />
      <ScatterMesh geo={assets.rock} items={assets.scatters.rocks} material={lambert} castShadow={false} fraction={1} />
    </group>
  );
}

const DIM = new THREE.Color("#8a8479");
const WHITE = new THREE.Color("#ffffff");
const HOVER_GLOW = new THREE.Color("#3a2408");
const BLACK = new THREE.Color(0, 0, 0);

type BuildingProps = {
  b: VillageBuilding;
  assets: Assets;
  shadows: boolean;
  stamped: boolean;
  celebrating: boolean;
  onSelect: (id: string) => void;
};

function Building({ b, assets, shadows, stamped, celebrating, onSelect }: BuildingProps) {
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), []);
  const hovered = useVillage((s) => s.hover === b.id);
  const routeId = useVillage((s) => s.routeId);
  const setHover = useVillage((s) => s.setHover);
  const route = bridges.find((r) => r.id === routeId);
  const dimmed = Boolean(route && !route.wingIds.includes(b.id));
  const group = useRef<THREE.Group>(null);
  const bannerRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const jibRef = useRef<THREE.Mesh>(null);
  const bounce = useRef(0);
  const bannerRise = useRef(stamped ? 1 : 0);
  const { invalidate } = useThree();
  const geo = assets.buildings[b.id];
  const [w, d] = b.size;
  const height = (geo.shell.boundingBox?.max.y ?? 5) + 0.2;

  useEffect(() => {
    if (celebrating) {
      bounce.current = 1;
      bannerRise.current = 0;
    }
  }, [celebrating]);

  useEffect(() => {
    invalidate();
  }, [hovered, dimmed, stamped, invalidate]);

  useFrame((state, rawDt) => {
    const reduced = useVillage.getState().reduced;
    const dt = Math.min(rawDt, 0.05);
    const k = reduced ? 1 : 1 - Math.exp(-dt * 6);
    mat.color.lerp(dimmed ? DIM : WHITE, k);
    mat.emissive.lerp(hovered ? HOVER_GLOW : BLACK, k);
    const t = state.clock.elapsedTime;
    if (group.current) {
      let sy = 1;
      if (bounce.current > 0) {
        bounce.current = Math.max(0, bounce.current - dt * 0.9);
        const p = 1 - bounce.current;
        sy = 1 + Math.sin(p * Math.PI * 4) * 0.06 * bounce.current;
      }
      group.current.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy));
    }
    if (bannerRef.current) {
      if (stamped) bannerRise.current = Math.min(1, bannerRise.current + (reduced ? 1 : dt * 0.8));
      const r = bannerRise.current;
      const s = stamped ? (r >= 1 ? 1 : 1 - Math.pow(1 - r, 3) + Math.sin(r * Math.PI) * 0.25) : 0;
      bannerRef.current.visible = s > 0.01;
      bannerRef.current.scale.setScalar(Math.max(0.001, s));
    }
    if (flagRef.current && !reduced) flagRef.current.rotation.y = Math.sin(t * 2.2 + b.pos[0]) * 0.25;
    if (jibRef.current && !reduced) jibRef.current.rotation.y = Math.sin(t * 0.18) * 0.9;
    if (useVillage.getState().hover === b.id || bounce.current > 0) invalidate();
  });

  const pick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 8 || useVillage.getState().gliding) return;
    const touch = lastPointerType === "touch" || lastPointerType === "pen";
    if (touch && useVillage.getState().hover !== b.id) {
      setHover(b.id);
      return;
    }
    onSelect(b.id);
  };

  return (
    <group position={[b.pos[0], 0, b.pos[1]]} rotation={[0, b.facing, 0]}>
      <group ref={group}>
        <mesh geometry={geo.shell} material={mat} castShadow={shadows} receiveShadow>
          <Outlines thickness={hovered ? 0.11 : 0.035} color={hovered ? "#fff1c4" : "#3b2a18"} angle={Math.PI} />
        </mesh>
        <mesh geometry={geo.props} material={mat} castShadow={shadows} receiveShadow />
        {b.style === "construction" && (
          <mesh ref={jibRef} geometry={assets.jib} material={mat} position={[w / 2 + 0.7, 8.1, -1.2]} castShadow={shadows} />
        )}
      </group>
      <group ref={bannerRef} position={[b.banner[0], 0, b.banner[1]]} visible={stamped}>
        <mesh geometry={assets.banner} material={mat} castShadow={shadows} />
        <mesh ref={flagRef} geometry={assets.flag} material={mat} position={[0.06, 3.05, 0]} />
      </group>
      <mesh
        position={[0, height / 2, 0.6]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (lastPointerType === "mouse" && !useVillage.getState().gliding) setHover(b.id);
        }}
        onPointerOut={() => {
          if (lastPointerType === "mouse" && useVillage.getState().hover === b.id) setHover(null);
        }}
        onClick={pick}
      >
        <boxGeometry args={[w + 1.2, height, d + 2.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

function MasterTrees({ assets, shadows, onTree }: { assets: Assets; shadows: boolean; onTree: (id: string) => void }) {
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), []);
  const hot = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color("#4a1d08") }), []);
  const treeHover = useVillage((s) => s.treeHover);
  const setTreeHover = useVillage((s) => s.setTreeHover);
  return (
    <group>
      {villageBuildings.map((b) => (
        <mesh
          key={b.tree.id}
          geometry={assets.apple}
          material={treeHover === b.tree.id ? hot : mat}
          position={[b.tree.at[0], 0, b.tree.at[1]]}
          scale={treeHover === b.tree.id ? 0.98 : 0.86}
          castShadow={shadows}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (lastPointerType === "mouse") setTreeHover(b.tree.id);
          }}
          onPointerOut={() => setTreeHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            if (e.delta > 8 || useVillage.getState().gliding) return;
            onTree(b.tree.id);
          }}
        />
      ))}
    </group>
  );
}

function routeGeometry(pts: [number, number][], width: number) {
  const line = new Polyline(pts);
  const samples = Math.max(2, Math.ceil(line.length / 0.35));
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const p = { x: 0, z: 0, yaw: 0 };
  const q = { x: 0, z: 0, yaw: 0 };
  for (let i = 0; i <= samples; i++) {
    const s = (i / samples) * line.length;
    line.at(s, p);
    line.at(Math.min(line.length, s + 0.3), q);
    const yaw = i === samples ? p.yaw : Math.atan2(q.x - p.x, q.z - p.z);
    const nx = Math.cos(yaw);
    const nz = -Math.sin(yaw);
    const onBridge = Math.abs(p.z - RIVER.bridgeZ) < 1.3 && Math.abs(p.x) < BRIDGE_HALF;
    const y = (onBridge ? bridgeHeight(p.x) + 0.24 : 0.09) + 0;
    pos.push(p.x - (nx * width) / 2, y, p.z - (nz * width) / 2, p.x + (nx * width) / 2, y, p.z + (nz * width) / 2);
    uv.push(0, s, 1, s);
    if (i < samples) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

function RouteLayer() {
  const routeId = useVillage((s) => s.routeId);
  const route = bridges.find((r) => r.id === routeId);
  const data = useMemo(() => {
    if (!route) return null;
    const { pts } = routePath(route.wingIds);
    return { band: routeGeometry(pts, 1.25), glow: routeGeometry(pts, 2.4), stops: route.wingIds };
  }, [route]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#c4321a") } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
          void main(){
            float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
            float dash = smoothstep(0.35, 0.5, fract(vUv.y * 0.55 - uTime * 0.6));
            vec3 col = mix(uColor, vec3(1.0, 0.86, 0.6), dash * 0.55);
            gl_FragColor = vec4(col, edge * 0.95);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd9a0", transparent: true, opacity: 0.45, depthWrite: false }), []);
  useFrame((_, dt) => {
    if (!useVillage.getState().reduced) mat.uniforms.uTime.value += Math.min(dt, 0.05);
  });
  if (!data) return null;
  return (
    <group>
      <mesh geometry={data.glow} material={glowMat} renderOrder={2} position={[0, -0.01, 0]} />
      <mesh geometry={data.band} material={mat} renderOrder={3} />
      {data.stops.map((id, i) => {
        const b = villageBuildings.find((v) => v.id === id)!;
        const [x, z] = toWorld(b, [b.door[0], b.door[1] + 0.6]);
        return (
          <mesh key={`${id}-${i}`} position={[x, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
            <ringGeometry args={[0.9, 1.3, 24]} />
            <meshBasicMaterial color="#c4321a" transparent opacity={0.85} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function Confetti({ id }: { id: string | null }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 90;
  const parts = useMemo(
    () => Array.from({ length: count }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), spin: new THREE.Vector3() })),
    [],
  );
  const life = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => {
    const mesh = ref.current;
    const b = villageBuildings.find((v) => v.id === id);
    if (!mesh || !b) return;
    const [bx, bz] = toWorld(b, b.banner);
    const colors = ["#c4321a", "#e3b341", "#fffaf3", "#3d6bdb", "#0f6e56", "#d94b62"];
    const c = new THREE.Color();
    parts.forEach((pt, i) => {
      pt.p.set(bx, 3.6, bz);
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 3.5;
      pt.v.set(Math.cos(a) * sp, 5 + Math.random() * 5, Math.sin(a) * sp);
      pt.spin.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);
      mesh.setColorAt(i, c.set(colors[i % colors.length]));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    life.current = 3.2;
    invalidate();
  }, [id, parts, invalidate]);
  useFrame((_, rawDt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const dt = Math.min(rawDt, 0.05);
    if (life.current <= 0) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    life.current -= dt;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3().setScalar(Math.min(1, life.current));
    parts.forEach((pt, i) => {
      pt.v.y -= 9 * dt;
      pt.v.multiplyScalar(1 - dt * 0.9);
      pt.p.addScaledVector(pt.v, dt);
      if (pt.p.y < 0.05) {
        pt.p.y = 0.05;
        pt.v.set(0, 0, 0);
      }
      pt.r.x += pt.spin.x * dt;
      pt.r.y += pt.spin.y * dt;
      q.setFromEuler(pt.r);
      m.compose(pt.p, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    invalidate();
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} visible={false}>
      <planeGeometry args={[0.22, 0.14]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function Smoke() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const sources = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const tops: Record<string, [number, number, number]> = {
      manufacturing: [-2.6, 7.4, -1.6],
      rnd: [-1.8, 6.1, -0.8],
      sales: [1.6, 5.6, -0.9],
    };
    for (const [id, [lx, y, lz]] of Object.entries(tops)) {
      const b = villageBuildings.find((v) => v.id === id)!;
      const [x, z] = toWorld(b, [lx, lz]);
      out.push(new THREE.Vector3(x, y, z));
    }
    return out;
  }, []);
  const per = 6;
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: "#f3ece0", transparent: true, opacity: 0.75, depthWrite: false }), []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.35, 0), []);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = useVillage.getState().reduced ? 0 : state.clock.elapsedTime;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3();
    sources.forEach((src, si) => {
      for (let i = 0; i < per; i++) {
        const f = (t * 0.22 + i / per + si * 0.37) % 1;
        v.set(src.x + Math.sin(f * 3 + si) * 0.5 + f * 1.4, src.y + f * 3.6, src.z + f * 0.6);
        s.setScalar(0.5 + f * 1.6);
        q.setFromEuler(new THREE.Euler(f * 2, f * 3, 0));
        m.compose(v, q, f > 0.85 ? s.multiplyScalar((1 - f) / 0.15) : s);
        mesh.setMatrixAt(si * per + i, m);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, sources.length * per]} frustumCulled={false} />;
}

const _proj = new THREE.Vector3();

/** Positions the DOM labels over their buildings every frame. */
function LabelProjector({ assets }: { assets: Assets }) {
  const { camera, size } = useThree();
  const anchors = useMemo(
    () =>
      villageBuildings.map((b) => ({
        id: b.id,
        tree: b.tree.id,
        top: new THREE.Vector3(b.pos[0], Math.min(b.labelY, (assets.buildings[b.id].shell.boundingBox?.max.y ?? 6) + 1.2), b.pos[1]),
        base: new THREE.Vector3(b.tree.at[0], -0.2, b.tree.at[1]),
      })),
    [assets],
  );
  useFrame(() => {
    const { gliding, treeHover } = useVillage.getState();
    const showTrees = zoomState.ratio < 0.72;
    for (const a of anchors) {
      const el = labelEls.get(a.id);
      if (el) {
        _proj.copy(a.top).project(camera);
        const off = _proj.z > 1 || Math.abs(_proj.x) > 1.1 || Math.abs(_proj.y) > 1.1;
        const half = el.offsetWidth / 2 + 6;
        const x = THREE.MathUtils.clamp(((_proj.x + 1) / 2) * size.width, half, Math.max(half, size.width - half));
        const y = ((1 - _proj.y) / 2) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
        el.style.opacity = gliding || off ? "0" : "1";
        el.style.visibility = off ? "hidden" : "visible";
      }
      const tel = treeLabelEls.get(a.tree);
      if (tel) {
        _proj.copy(a.base).project(camera);
        const off = _proj.z > 1 || Math.abs(_proj.x) > 1.1 || Math.abs(_proj.y) > 1.1;
        const x = ((_proj.x + 1) / 2) * size.width;
        const y = ((1 - _proj.y) / 2) * size.height;
        tel.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, 0)`;
        const shown = !off && !gliding && (showTrees || treeHover === a.tree || document.activeElement === tel);
        tel.style.opacity = shown ? "1" : "0";
        tel.style.visibility = off || gliding ? "hidden" : "visible";
      }
    }
  });
  return null;
}

export type SceneProps = {
  assets: Assets;
  stamped: string[];
  celebrate: string | null;
  insets: { top: number; bottom: number };
  onSelect: (id: string) => void;
  onTree: (id: string) => void;
  onInteract: () => void;
  onFirstFrame: () => void;
};

export function VillageScene({ assets, stamped, celebrate, insets, onSelect, onTree, onInteract, onFirstFrame }: SceneProps) {
  const quality = useVillage((s) => s.quality);
  const shadows = quality === "high";
  const charMat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), []);
  const first = useRef(false);
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color("#efe4cc");
    scene.fog = new THREE.Fog("#efe4cc", 90, 170);
  }, [scene]);
  useFrame(({ camera }) => {
    // Portrait fits sit much farther back, so the haze follows the camera instead of fixed distances.
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      const d = camera.position.length();
      fog.near = Math.max(90, d + 18);
      fog.far = Math.max(170, d + 98);
    }
    if (!first.current) {
      first.current = true;
      requestAnimationFrame(onFirstFrame);
    }
  });
  return (
    <>
      <Lights shadows={shadows} />
      <Terrain assets={assets} shadows={shadows} fraction={quality === "low" ? 0.6 : 1} />
      {villageBuildings.map((b) => (
        <Building
          key={b.id}
          b={b}
          assets={assets}
          shadows={shadows}
          stamped={stamped.includes(b.id)}
          celebrating={celebrate === b.id}
          onSelect={onSelect}
        />
      ))}
      <MasterTrees assets={assets} shadows={shadows} onTree={onTree} />
      <Characters material={charMat} />
      <RouteLayer />
      <Smoke />
      <Confetti id={celebrate} />
      <CameraRig insets={insets} onInteract={onInteract} />
      <LabelProjector assets={assets} />
    </>
  );
}
