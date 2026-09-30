import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { villageBuildings } from "@/data/village-scene";
import { toWorld } from "./paths";
import { useVillage } from "./store";

type View = { az: number; pol: number; dist: number; tx: number; tz: number };

const FOV = 34;
const TARGET_Y = 0.6;

/** Points that must stay on screen at the zoomed-out view: every footprint and label. */
function fitPoints() {
  const pts: THREE.Vector3[] = [];
  for (const b of villageBuildings) {
    // Roof overhangs, scaffolds and yard props reach past the nominal footprint.
    const w = b.size[0] / 2 + 2.2;
    const d = b.size[1] / 2 + 1.5;
    for (const [lx, lz, y] of [
      [-w, -d, 3],
      [w, -d, 3],
      [-w, d + 2.5, 0],
      [w, d + 2.5, 0],
      [-w, 0, 3],
      [w, 0, 3],
    ]) {
      const [x, z] = toWorld(b, [lx, lz]);
      pts.push(new THREE.Vector3(x, y, z));
    }
    pts.push(new THREE.Vector3(b.pos[0], b.labelY + 1.2, b.pos[1]));
  }
  return pts;
}

function place(cam: THREE.PerspectiveCamera, v: View) {
  const s = Math.sin(v.pol);
  cam.position.set(v.tx + v.dist * s * Math.sin(v.az), TARGET_Y + v.dist * Math.cos(v.pol), v.tz + v.dist * s * Math.cos(v.az));
  cam.lookAt(v.tx, TARGET_Y, v.tz);
  cam.updateMatrixWorld();
}

const _p = new THREE.Vector3();

/**
 * Distance and target at which every fit point lands inside the viewport,
 * leaving room for the HUD at the top and bottom.
 */
function computeFit(aspect: number, az: number, pol: number, pads: { top: number; bottom: number; side: number }, pts: THREE.Vector3[]) {
  const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.5, 400);
  const v: View = { az, pol, dist: 70, tx: 0, tz: 0 };
  const tanH = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const top = 1 - pads.top * 2;
  const bot = -1 + pads.bottom * 2;
  const side = 1 - pads.side * 2;
  const right = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
  const fwd = new THREE.Vector3(-Math.sin(az), 0, -Math.cos(az));
  for (let i = 0; i < 48; i++) {
    place(cam, v);
    cam.updateProjectionMatrix();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      _p.copy(p).project(cam);
      minX = Math.min(minX, _p.x);
      maxX = Math.max(maxX, _p.x);
      minY = Math.min(minY, _p.y);
      maxY = Math.max(maxY, _p.y);
    }
    const need = Math.max((maxX - minX) / (2 * side), (maxY - minY) / (top - bot));
    const dx = (maxX + minX) / 2;
    const dy = (maxY + minY) / 2 - (top + bot) / 2;
    const unit = v.dist * tanH;
    v.tx += right.x * dx * unit * aspect * 0.8 + fwd.x * (dy * unit * 0.8) / Math.max(0.3, Math.cos(pol));
    v.tz += right.z * dx * unit * aspect * 0.8 + fwd.z * (dy * unit * 0.8) / Math.max(0.3, Math.cos(pol));
    v.dist *= Math.pow(need, 0.85);
    if (Math.abs(need - 1) < 0.002 && Math.abs(dx) < 0.002 && Math.abs(dy) < 0.002) break;
  }
  return v;
}

export let lastPointerType = "mouse";

/** Current distance over the zoomed-out distance: 1 at the overview, smaller when zoomed in. */
export const zoomState = { ratio: 1 };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Glide = {
  fromPos: THREE.Vector3;
  fromLook: THREE.Vector3;
  toPos: THREE.Vector3;
  toLook: THREE.Vector3;
  t0: number;
  ms: number;
  done: () => void;
  after?: View;
};

export function CameraRig({ insets, onInteract }: { insets: { top: number; bottom: number }; onInteract: () => void }) {
  const { camera, gl, size, invalidate } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const pts = useMemo(fitPoints, []);
  const home = useRef<View | null>(null);
  const cur = useRef<View>({ az: 0, pol: 0.9, dist: 80, tx: 0, tz: 0 });
  const goal = useRef<View>({ ...cur.current });
  const fitCache = useRef<{ key: string; dist: number }>({ key: "", dist: 80 });
  const lastInput = useRef(0);
  const driftAmp = useRef(0);
  const glide = useRef<Glide | null>(null);
  const saved = useRef<View | null>(null);
  const setGliding = useVillage((s) => s.setGliding);
  const setCamera = useVillage((s) => s.setCamera);

  const portrait = size.width / size.height < 0.95;
  const baseAz = portrait ? Math.PI / 2 : 0;
  const basePol = portrait ? 0.62 : 0.86;

  const pads = useMemo(
    () => ({
      top: Math.min(0.3, (insets.top + 8) / size.height / 2),
      bottom: Math.min(0.25, (insets.bottom + 8) / size.height / 2),
      side: 0.03,
    }),
    [insets.top, insets.bottom, size.height],
  );

  const fitDist = (az: number, pol: number) => {
    const key = `${az.toFixed(3)}:${pol.toFixed(3)}:${size.width}x${size.height}:${pads.top.toFixed(3)}:${pads.bottom.toFixed(3)}`;
    if (fitCache.current.key !== key) {
      fitCache.current = { key, dist: computeFit(size.width / size.height, az, pol, pads, pts).dist };
    }
    return fitCache.current.dist;
  };

  const clampView = (v: View) => {
    const h = home.current;
    if (!h) return v;
    v.az = THREE.MathUtils.clamp(v.az, baseAz - 0.4, baseAz + 0.4);
    v.pol = THREE.MathUtils.clamp(v.pol, basePol - 0.24, basePol + 0.12);
    const max = fitDist(v.az, v.pol) * 1.0;
    v.dist = THREE.MathUtils.clamp(v.dist, max * 0.3, max);
    const room = 1 - v.dist / max;
    v.tx = THREE.MathUtils.clamp(v.tx, h.tx - room * 30, h.tx + room * 30);
    v.tz = THREE.MathUtils.clamp(v.tz, h.tz - room * 20, h.tz + room * 20);
    return v;
  };

  // Home view: re-fit when the viewport or HUD changes.
  useEffect(() => {
    cam.fov = FOV;
    cam.near = 0.5;
    cam.far = 400;
    cam.updateProjectionMatrix();
    const v = computeFit(size.width / size.height, baseAz, basePol, pads, pts);
    const first = !home.current;
    const flipped = home.current && Math.abs(home.current.az - v.az) > 0.5;
    home.current = v;
    fitCache.current = { key: "", dist: v.dist };
    if (first || flipped || lastInput.current === 0) {
      cur.current = { ...v };
      goal.current = { ...v };
    } else {
      clampView(goal.current);
    }
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, pads.top, pads.bottom, baseAz, basePol]);

  const touched = () => {
    lastInput.current = performance.now();
    onInteract();
    invalidate();
  };

  const groundAt = (clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, cam);
    const hit = new THREE.Vector3();
    return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -TARGET_Y), hit) ? hit : null;
  };

  const zoomAt = (factor: number, clientX?: number, clientY?: number) => {
    const g = goal.current;
    const before = g.dist;
    const max = fitDist(g.az, g.pol);
    const next = THREE.MathUtils.clamp(before * factor, max * 0.3, max);
    if (clientX !== undefined && clientY !== undefined && next < before) {
      const hit = groundAt(clientX, clientY);
      if (hit) {
        const k = 1 - next / before;
        g.tx += (hit.x - g.tx) * k;
        g.tz += (hit.z - g.tz) * k;
      }
    }
    g.dist = next;
    clampView(g);
    touched();
  };

  // Pointer input on the canvas: drag orbits, right-drag or two fingers pan, wheel and pinch zoom.
  useEffect(() => {
    const el = gl.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    let drag: { x: number; y: number; button: number } | null = null;
    let pinch: { d: number; mx: number; my: number } | null = null;
    const pan = (dx: number, dy: number) => {
      const g = goal.current;
      const unit = (g.dist * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * 2) / el.clientHeight;
      const rx = Math.cos(g.az);
      const rz = -Math.sin(g.az);
      const fx = -Math.sin(g.az);
      const fz = -Math.cos(g.az);
      g.tx -= rx * dx * unit - (fx * dy * unit) / Math.max(0.4, Math.cos(g.pol));
      g.tz -= rz * dx * unit - (fz * dy * unit) / Math.max(0.4, Math.cos(g.pol));
      clampView(g);
    };
    const down = (e: PointerEvent) => {
      lastPointerType = e.pointerType;
      if (useVillage.getState().gliding) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
        drag = null;
      } else {
        drag = { x: e.clientX, y: e.clientY, button: e.button };
      }
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        if (pinch.d > 0 && d > 0) zoomAt(pinch.d / d, mx, my);
        pan(mx - pinch.mx, my - pinch.my);
        pinch = { d, mx, my };
        touched();
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (drag.button === 2 || e.shiftKey) pan(dx, dy);
      else {
        const g = goal.current;
        g.az -= dx * 0.004;
        g.pol -= dy * 0.003;
        clampView(g);
      }
      touched();
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) drag = null;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (useVillage.getState().gliding) return;
      zoomAt(e.deltaY < 0 ? 1 / 1.12 : 1.12, e.clientX, e.clientY);
    };
    const menu = (e: Event) => e.preventDefault();
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("contextmenu", menu);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("contextmenu", menu);
    };
  });

  const doorView = (id: string) => {
    const b = villageBuildings.find((v) => v.id === id)!;
    const [dx, dz] = toWorld(b, b.door);
    const fx = Math.sin(b.facing);
    const fz = Math.cos(b.facing);
    return {
      pos: new THREE.Vector3(dx + fx * 7.2, 3.6, dz + fz * 7.2),
      look: new THREE.Vector3(dx - fx * 0.8, 1.5, dz - fz * 0.8),
    };
  };

  const currentLook = () => {
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const d = Math.max(1, (cam.position.y - TARGET_Y) / Math.max(0.05, -dir.y));
    return cam.position.clone().add(dir.multiplyScalar(d));
  };

  useEffect(() => {
    const api = {
      zoom: (factor: number) => zoomAt(factor),
      home: () => {
        if (!home.current) return;
        goal.current = { ...home.current };
        touched();
      },
      focus: (id: string) => {
        const b = villageBuildings.find((v) => v.id === id);
        if (!b) return;
        const g = goal.current;
        g.dist = fitDist(g.az, g.pol) * 0.5;
        g.tx = b.pos[0];
        g.tz = b.pos[1];
        clampView(g);
        touched();
      },
      glideIn: (id: string) =>
        new Promise<void>((resolve) => {
          saved.current = { ...goal.current };
          const to = doorView(id);
          const reduced = useVillage.getState().reduced;
          setGliding(true);
          glide.current = {
            fromPos: cam.position.clone(),
            fromLook: currentLook(),
            toPos: to.pos,
            toLook: to.look,
            t0: performance.now(),
            ms: reduced ? 0 : 1000,
            done: resolve,
          };
          invalidate();
        }),
      glideOut: () =>
        new Promise<void>((resolve) => {
          const back = saved.current ?? home.current;
          if (!back) return resolve();
          const probe = new THREE.PerspectiveCamera(FOV, size.width / size.height, 0.5, 400);
          place(probe, back);
          const reduced = useVillage.getState().reduced;
          setGliding(true);
          glide.current = {
            fromPos: cam.position.clone(),
            fromLook: currentLook(),
            toPos: probe.position.clone(),
            toLook: new THREE.Vector3(back.tx, TARGET_Y, back.tz),
            t0: performance.now(),
            ms: reduced ? 0 : 900,
            done: resolve,
            after: { ...back },
          };
          invalidate();
        }),
    };
    setCamera(api);
    return () => setCamera(null);
  });

  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const g = glide.current;
    if (g) {
      const t = g.ms <= 0 ? 1 : Math.min(1, (performance.now() - g.t0) / g.ms);
      const e = ease(t);
      cam.position.lerpVectors(g.fromPos, g.toPos, e);
      look.lerpVectors(g.fromLook, g.toLook, e);
      cam.lookAt(look);
      if (t >= 1) {
        glide.current = null;
        if (g.after) {
          cur.current = { ...g.after };
          goal.current = { ...g.after };
        }
        setGliding(false);
        lastInput.current = performance.now();
        g.done();
      } else invalidate();
      return;
    }
    if (!home.current) return;
    const reduced = useVillage.getState().reduced;
    const k = reduced ? 1 : 1 - Math.exp(-Math.min(dt, 0.05) * 5);
    const c = cur.current;
    const gl2 = goal.current;
    c.az += (gl2.az - c.az) * k;
    c.pol += (gl2.pol - c.pol) * k;
    c.dist += (gl2.dist - c.dist) * k;
    c.tx += (gl2.tx - c.tx) * k;
    c.tz += (gl2.tz - c.tz) * k;
    const idle = !reduced && performance.now() - lastInput.current > 4000;
    driftAmp.current += ((idle ? 1 : 0) - driftAmp.current) * Math.min(1, dt * 0.6);
    const t = state.clock.elapsedTime;
    const drift = reduced ? 0 : driftAmp.current;
    place(cam, {
      az: c.az + Math.sin((t * Math.PI * 2) / 80) * 0.03 * drift,
      pol: c.pol + Math.sin((t * Math.PI * 2) / 57) * 0.01 * drift,
      dist: c.dist * (1 - 0.012 * drift * (0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 65))),
      tx: c.tx,
      tz: c.tz,
    });
    zoomState.ratio = c.dist / fitDist(c.az, c.pol);
    const settling = Math.abs(gl2.dist - c.dist) > 0.01 || Math.abs(gl2.az - c.az) > 0.0005 || Math.abs(gl2.tx - c.tx) > 0.005 || Math.abs(gl2.tz - c.tz) > 0.005;
    if (settling) invalidate();
  });

  return null;
}
