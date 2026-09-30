import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Check, Minus, Plus, X } from "lucide-react";
import {
  EDITION,
  bridges,
  isWingComplete,
  stampedCount,
  wingById,
  wings,
  type Station,
  type Wing,
} from "@/data/guide";
import { studyObjects } from "@/data/study-objects";
import { technicalModels } from "@/data/technical-model";
import { StudyObjectPage } from "@/components/study-object";
import { TechnicalModelCard } from "@/components/technical-model";
import { AppleTree } from "@/components/apple-tree";
import { MasterDataPanel } from "@/components/master-data-panel";
import { masterTrees } from "@/data/master-trees";
import { shelfForWing } from "@/data/books";
import { useProgress } from "@/state/progress";

const MAP_W = 2128;
const MAP_H = 912;
const ROOM_W = 1792;
const ROOM_H = 1008;

type LayoutId = "village" | "city";

const BOOT_BUBBLES: Array<[string, string, string, string]> = [
  ["IF", "0%", "6px", "0s"],
  ["DATA:", "34%", "24px", "0.35s"],
  ["{", "68%", "0px", "0.7s"],
  ["LOOP", "14%", "58px", "0.15s"],
  ["01", "52%", "48px", "0.95s"],
  ["=>", "4%", "86px", "0.55s"],
  ["END", "46%", "78px", "1.15s"],
];

type Cam = { x: number; y: number; s: number };

type Plot = { id: string; cx: number; cy: number; w: number; h: number };

type Spot = { id: string; x: number; y: number };

const SHORT: Record<string, string> = {
  finance: "Finance",
  rnd: "Research and development (R&D)",
  procurement: "Procurement",
  supply: "Supply chain",
  manufacturing: "Manufacturing",
  sales: "Sales",
  service: "Service",
  asset: "Maintenance",
  hr: "People",
  project: "Projects",
};
const VILLAGE_PLOTS: Plot[] = [
  { id: "rnd", cx: 12, cy: 20, w: 12, h: 16 },
  { id: "finance", cx: 33, cy: 24, w: 14, h: 18 },
  { id: "hr", cx: 84, cy: 20, w: 12, h: 16 },
  { id: "procurement", cx: 25, cy: 42, w: 12, h: 12 },
  { id: "sales", cx: 67, cy: 56, w: 10, h: 12 },
  { id: "supply", cx: 28, cy: 60, w: 12, h: 14 },
  { id: "manufacturing", cx: 76, cy: 50, w: 12, h: 14 },
  { id: "asset", cx: 68, cy: 36, w: 12, h: 14 },
  { id: "service", cx: 84, cy: 72, w: 12, h: 14 },
  { id: "project", cx: 10, cy: 76, w: 12, h: 14 },
];

/** Same stations, on the daylight industrial city. */
const CITY_PLOTS: Plot[] = [
  { id: "rnd", cx: 18, cy: 18, w: 16, h: 14 },
  { id: "finance", cx: 50, cy: 16, w: 16, h: 16 },
  { id: "hr", cx: 80, cy: 20, w: 12, h: 14 },
  { id: "procurement", cx: 18, cy: 42, w: 16, h: 14 },
  { id: "sales", cx: 66, cy: 42, w: 12, h: 14 },
  { id: "supply", cx: 30, cy: 70, w: 16, h: 14 },
  { id: "manufacturing", cx: 84, cy: 52, w: 14, h: 16 },
  { id: "asset", cx: 46, cy: 46, w: 16, h: 14 },
  { id: "service", cx: 78, cy: 74, w: 14, h: 14 },
  { id: "project", cx: 10, cy: 68, w: 12, h: 14 },
];

const GOTHAM_PLOTS: Plot[] = [
  { id: "rnd", cx: 22, cy: 20, w: 16, h: 14 },
  { id: "finance", cx: 50, cy: 18, w: 14, h: 16 },
  { id: "hr", cx: 72, cy: 18, w: 14, h: 16 },
  { id: "procurement", cx: 24, cy: 42, w: 16, h: 14 },
  { id: "sales", cx: 64, cy: 46, w: 10, h: 12 },
  { id: "supply", cx: 36, cy: 62, w: 12, h: 12 },
  { id: "manufacturing", cx: 80, cy: 52, w: 14, h: 16 },
  { id: "asset", cx: 46, cy: 48, w: 14, h: 14 },
  { id: "service", cx: 84, cy: 68, w: 12, h: 12 },
  { id: "project", cx: 16, cy: 64, w: 10, h: 14 },
];

/** Bases of the markers, on open ground, not on the roofs. */
const VILLAGE_TREES: Record<string, { cx: number; cy: number }> = {
  rnd: { cx: 20, cy: 30 },
  finance: { cx: 30, cy: 34 },
  people: { cx: 76, cy: 28 },
  procurement: { cx: 33, cy: 48 },
  sales: { cx: 62, cy: 64 },
  supply: { cx: 36, cy: 76 },
  mfg: { cx: 82, cy: 62 },
  maint: { cx: 60, cy: 44 },
  service: { cx: 76, cy: 80 },
  project: { cx: 20, cy: 84 },
};

const CITY_MARKS: Record<string, { cx: number; cy: number }> = {
  rnd: { cx: 28, cy: 26 },
  finance: { cx: 40, cy: 28 },
  people: { cx: 72, cy: 28 },
  procurement: { cx: 28, cy: 50 },
  sales: { cx: 74, cy: 50 },
  supply: { cx: 40, cy: 78 },
  mfg: { cx: 74, cy: 60 },
  maint: { cx: 56, cy: 54 },
  service: { cx: 70, cy: 80 },
  project: { cx: 18, cy: 78 },
};

const GOTHAM_MARKS: Record<string, { cx: number; cy: number }> = {
  rnd: { cx: 32, cy: 28 },
  finance: { cx: 42, cy: 30 },
  people: { cx: 64, cy: 28 },
  procurement: { cx: 34, cy: 50 },
  sales: { cx: 70, cy: 52 },
  supply: { cx: 30, cy: 70 },
  mfg: { cx: 72, cy: 60 },
  maint: { cx: 54, cy: 56 },
  service: { cx: 76, cy: 74 },
  project: { cx: 22, cy: 74 },
};

const ROOMS: Record<string, { src: string; city: string; spots: Spot[] }> = {
  finance: {
    src: "/art/room-finance.jpg",
    city: "/art/city-room-finance.jpg",
    spots: [
      { id: "fin-uj", x: 16, y: 52 },
      { id: "fin-gl", x: 34, y: 64 },
      { id: "fin-aa", x: 28, y: 30 },
      { id: "fin-ap", x: 48, y: 42 },
      { id: "fin-fpa", x: 52, y: 20 },
      { id: "fin-ar", x: 66, y: 62 },
      { id: "fin-tr", x: 84, y: 40 },
      { id: "fin-grc", x: 78, y: 76 },
    ],
  },
  rnd: {
    src: "/art/room-rnd.jpg",
    city: "/art/city-room-rnd.jpg",
    spots: [
      { id: "rd-mat", x: 9, y: 48 },
      { id: "rd-plm", x: 20, y: 42 },
      { id: "rd-bom", x: 50, y: 58 },
      { id: "rd-comp", x: 82, y: 40 },
    ],
  },
  procurement: {
    src: "/art/room-procurement.jpg",
    city: "/art/city-room-procurement.jpg",
    spots: [
      { id: "pr-op", x: 16, y: 52 },
      { id: "pr-src", x: 46, y: 46 },
      { id: "pr-sup", x: 80, y: 42 },
      { id: "pr-iv", x: 38, y: 76 },
      { id: "pr-ext", x: 52, y: 18 },
    ],
  },
  supply: {
    src: "/art/room-supply.jpg",
    city: "/art/city-room-supply.jpg",
    spots: [
      { id: "sc-im", x: 18, y: 46 },
      { id: "sc-ewm", x: 48, y: 48 },
      { id: "sc-tm", x: 82, y: 44 },
      { id: "sc-batch", x: 28, y: 78 },
      { id: "sc-atp", x: 70, y: 76 },
    ],
  },
  manufacturing: {
    src: "/art/room-manufacturing.jpg",
    city: "/art/city-room-manufacturing.jpg",
    spots: [
      { id: "pp-eng", x: 16, y: 34 },
      { id: "pp-mrp", x: 22, y: 64 },
      { id: "pp-op", x: 48, y: 50 },
      { id: "pp-jit", x: 80, y: 38 },
      { id: "pp-qm", x: 44, y: 78 },
      { id: "pp-sub", x: 84, y: 74 },
    ],
  },
  sales: {
    src: "/art/room-sales.jpg",
    city: "/art/city-room-sales.jpg",
    spots: [
      { id: "sd-so", x: 16, y: 50 },
      { id: "sd-pr", x: 48, y: 40 },
      { id: "sd-bil", x: 82, y: 52 },
      { id: "sd-con", x: 36, y: 78 },
      { id: "sd-ebrr", x: 56, y: 18 },
    ],
  },
  service: {
    src: "/art/room-service.jpg",
    city: "/art/city-room-service.jpg",
    spots: [
      { id: "sv-ord", x: 18, y: 55 },
      { id: "sv-ih", x: 48, y: 50 },
      { id: "sv-fsm", x: 82, y: 52 },
    ],
  },
  asset: {
    src: "/art/room-asset.jpg",
    city: "/art/city-room-asset.jpg",
    spots: [
      { id: "am-req", x: 16, y: 46 },
      { id: "am-pm", x: 50, y: 55 },
      { id: "am-ehs", x: 82, y: 44 },
    ],
  },
  hr: {
    src: "/art/room-hr.jpg",
    city: "/art/city-room-hr.jpg",
    spots: [
      { id: "hr-core", x: 16, y: 50 },
      { id: "hr-time", x: 46, y: 52 },
      { id: "hr-pay", x: 68, y: 56 },
      { id: "hr-talent", x: 88, y: 40 },
    ],
  },
  project: {
    src: "/art/room-project.jpg",
    city: "/art/city-room-project.jpg",
    spots: [
      { id: "ps-plan", x: 18, y: 46 },
      { id: "ps-fin", x: 50, y: 50 },
      { id: "ps-log", x: 82, y: 54 },
    ],
  },
};

function fitScale(vw: number, vh: number, w: number, h: number) {
  return Math.min(vw / w, vh / h);
}

function clampCam(c: Cam, vw: number, vh: number, w: number, h: number, minS: number, maxS: number): Cam {
  const s = Math.min(maxS, Math.max(minS, c.s));
  let x = c.x;
  let y = c.y;
  if (w * s <= vw) x = w / 2;
  else x = Math.min(w - vw / (2 * s), Math.max(vw / (2 * s), x));
  if (h * s <= vh) y = h / 2;
  else y = Math.min(h - vh / (2 * s), Math.max(vh / (2 * s), y));
  return { x, y, s };
}

export function CityMap() {
  const read = useProgress((s) => s.read);
  const mark = useProgress((s) => s.mark);
  const [layout, setLayout] = useState<LayoutId>("village");
  const plots = layout === "city" ? CITY_PLOTS : VILLAGE_PLOTS;
  const frame = useRef<HTMLDivElement>(null);
  const camRef = useRef<Cam>({ x: MAP_W / 2, y: MAP_H / 2, s: 0.4 });
  const [cam, setCam] = useState<Cam>(camRef.current);
  const [vw, setVw] = useState(390);
  const [vh, setVh] = useState(700);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [bootHold, setBootHold] = useState(true);
  const [inside, setInside] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [masterId, setMasterId] = useState<string | null>(null);
  const [treeHover, setTreeHover] = useState<string | null>(null);
  const [bridgeId, setBridgeId] = useState<string | null>(null);
  const [directory, setDirectory] = useState(false);
  const [sources, setSources] = useState(false);
  const [help, setHelp] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const raf = useRef(0);
  const anim = useRef(0);
  const holdEnter = useRef(false);
  const booted = useRef(false);
  const entering = useRef(false);

  const worldW = inside ? ROOM_W : MAP_W;
  const worldH = inside ? ROOM_H : MAP_H;
  const minS = fitScale(vw, vh, worldW, worldH) * 0.96;
  const maxS = inside ? 2.4 : 2.2;

  const publish = (next: Cam) => {
    const clamped = clampCam(next, vw, vh, worldW, worldH, minS, maxS);
    camRef.current = clamped;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      setCam(camRef.current);
    });
  };

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setVw(r.width);
      setVh(r.height);
      if (!booted.current && r.width > 0 && r.height > 0) {
        booted.current = true;
        const fit = fitScale(r.width, r.height, MAP_W, MAP_H);
        const readable = Math.max(fit, Math.min(r.width < 700 ? 0.38 : fit, 0.75));
        const start = clampCam(
          { x: MAP_W / 2, y: MAP_H / 2, s: readable },
          r.width,
          r.height,
          MAP_W,
          MAP_H,
          fit * 0.96,
          2.2,
        );
        camRef.current = start;
        setCam(start);
      }
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  function zoomAt(px: number, py: number, factor: number) {
    const c = camRef.current;
    const mx = c.x + (px - vw / 2) / c.s;
    const my = c.y + (py - vh / 2) / c.s;
    const s = c.s * factor;
    publish({ x: mx - (px - vw / 2) / s, y: my - (py - vh / 2) / s, s });
  }

  function animateTo(target: Cam, ms: number, done?: () => void) {
    cancelAnimationFrame(anim.current);
    const from = camRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || ms <= 0) {
      publish(target);
      done?.();
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = 1 - (1 - t) ** 3;
      publish({
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        s: from.s + (target.s - from.s) * e,
      });
      if (t < 1) anim.current = requestAnimationFrame(step);
      else done?.();
    };
    anim.current = requestAnimationFrame(step);
  }

  function plotCenter(plot: Plot) {
    return { x: (plot.cx / 100) * MAP_W, y: (plot.cy / 100) * MAP_H };
  }

  function hitPlot(mx: number, my: number): Plot | null {
    const px = (mx / MAP_W) * 100;
    const py = (my / MAP_H) * 100;
    return (
      plots.find(
        (p) => Math.abs(px - p.cx) <= p.w / 2 && Math.abs(py - p.cy) <= p.h / 2,
      ) ?? null
    );
  }

  function enter(id: string) {
    if (!ROOMS[id]) return;
    setHover(null);
    setStation(null);
    setInside(id);
    const fit = fitScale(vw, vh, ROOM_W, ROOM_H);
    const start = Math.max(fit, Math.min(vw < 700 ? 0.72 : fit, 1));
    const next = clampCam({ x: ROOM_W / 2, y: ROOM_H / 2, s: start }, vw, vh, ROOM_W, ROOM_H, fit * 0.96, 2.4);
    camRef.current = next;
    setCam(next);
  }

  function leave() {
    setInside(null);
    setHover(null);
    setStation(null);
    setHelp(false);
    const fit = fitScale(vw, vh, MAP_W, MAP_H);
    const next = clampCam({ x: MAP_W / 2, y: MAP_H / 2, s: Math.max(fit, 0.36) }, vw, vh, MAP_W, MAP_H, fit * 0.96, 2.2);
    camRef.current = next;
    setCam(next);
  }

  function clientToWorld(cx: number, cy: number) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const c = camRef.current;
    return {
      x: c.x + (cx - rect.left - rect.width / 2) / c.s,
      y: c.y + (cy - rect.top - rect.height / 2) / c.s,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: camRef.current.s };
      drag.current = null;
      return;
    }
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: camRef.current.x, cy: camRef.current.y, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.d > 0) {
        const rect = frame.current?.getBoundingClientRect();
        if (!rect) return;
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        const factor = d / pinch.current.d;
        const c = camRef.current;
        const target = pinch.current.s * factor;
        zoomAt(midX, midY, target / c.s);
      }
      return;
    }
    const d = drag.current;
    if (!d || d.id !== e.pointerId) {
      if (!inside) {
        const w = clientToWorld(e.clientX, e.clientY);
        setHover(hitPlot(w.x, w.y)?.id ?? null);
      }
      return;
    }
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) > 6) d.moved = true;
    publish({ x: d.cx - dx / camRef.current.s, y: d.cy - dy / camRef.current.s, s: camRef.current.s });
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const wpt = clientToWorld(e.clientX, e.clientY);
    if (!inside) {
      const plot = hitPlot(wpt.x, wpt.y);
      if (!plot) return;
      enter(plot.id);
      return;
    }
    const room = ROOMS[inside];
    const hit = nearestSpot(room.spots, wpt.x, wpt.y, camRef.current.s);
    if (hit) {
      const stationHit = wingById(inside)?.stations.find((s) => s.id === hit.id) ?? null;
      setStation(stationHit);
    }
  }

  const room = inside ? ROOMS[inside] : null;
  const wing = inside ? wingById(inside) : null;
  const bridge = bridges.find((b) => b.id === bridgeId) ?? null;
  const sceneSrc = room
    ? layout === "city"
      ? `${room.city}?v=7`
      : `${room.src}?v=7`
    : layout === "city"
      ? "/art/city-map.jpg"
      : "/art/campus-map.jpg?v=4";
  const sceneReady = loadedSrc === sceneSrc;
  const mapReady = sceneReady && !bootHold;

  useEffect(() => {
    if (inside) return;
    setBootHold(true);
    const timer = window.setTimeout(() => setBootHold(false), 900);
    return () => window.clearTimeout(timer);
  }, [sceneSrc, inside]);

  useEffect(() => {
    const urls = [
      "/art/campus-map.jpg?v=4",
      "/art/city-map.jpg",
      ...Object.values(ROOMS).flatMap((r) => [`${r.src}?v=7`, `${r.city}?v=7`]),
    ];
    for (const url of urls) {
      const img = new Image();
      img.src = url;
    }
  }, []);

  function toScreen(x: number, y: number) {
    return {
      left: vw / 2 + (x - cam.x) * cam.s,
      top: vh / 2 + (y - cam.y) * cam.s,
    };
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-paper text-ink">
      <div
        ref={frame}
        className="absolute inset-0 touch-none select-none campus-lights"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          key={sceneSrc}
          src={sceneSrc}
          alt={wing ? `${wing.name} interior` : "Illustrated neighborhood of the S/4HANA campus"}
          draggable={false}
          width={worldW}
          height={worldH}
          ref={(el) => {
            if (!el || !el.complete || el.naturalWidth === 0) return;
            const path = el.currentSrc ? new URL(el.currentSrc).pathname : "";
            if (path.endsWith(sceneSrc.split("?")[0])) setLoadedSrc(sceneSrc);
          }}
          onLoad={(event) => {
            const path = event.currentTarget.currentSrc ? new URL(event.currentTarget.currentSrc).pathname : "";
            if (path.endsWith(sceneSrc.split("?")[0])) setLoadedSrc(sceneSrc);
          }}
          className={`absolute top-0 left-0 max-w-none ${(inside ? sceneReady : mapReady) ? "" : "opacity-0"}`}
          style={{
            width: worldW,
            height: worldH,
            transform: `translate(${vw / 2 - cam.x * cam.s}px, ${vh / 2 - cam.y * cam.s}px) scale(${cam.s})`,
            transformOrigin: "0 0",
          }}
        />
        {!inside && !mapReady && (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center" role="status" aria-live="polite">
            <div className="map-boot">
              {BOOT_BUBBLES.map(([token, left, bottom, delay]) => (
                <span key={token} className="map-bubble" style={{ left, bottom, animationDelay: delay }}>
                  {token}
                </span>
              ))}
              <p className="map-boot-line">
                <span className="map-boot-prompt">{">"}</span> loading {layout}
                <span className="map-boot-cursor">_</span>
              </p>
            </div>
          </div>
        )}
        {mapReady && !inside && bridge && (
          <svg
            className="pointer-events-none absolute top-0 left-0"
            width={MAP_W}
            height={MAP_H}
            style={{
              transform: `translate(${vw / 2 - cam.x * cam.s}px, ${vh / 2 - cam.y * cam.s}px) scale(${cam.s})`,
              transformOrigin: "0 0",
            }}
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke="#c4321a"
              strokeWidth={10}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={bridge.wingIds
                .map((id) => {
                  const plot = plots.find((p) => p.id === id);
                  if (!plot) return "";
                  const c = plotCenter(plot);
                  return `${c.x},${c.y}`;
                })
                .join(" ")}
            />
          </svg>
        )}

        {mapReady && !inside &&
          masterTrees.map((tree) => {
            const marks = layout === "city" ? CITY_MARKS : VILLAGE_TREES;
            const spot = marks[tree.id];
            const pos = toScreen(((spot?.cx ?? tree.cx) / 100) * MAP_W, ((spot?.cy ?? tree.cy) / 100) * MAP_H);
            const hot = treeHover === tree.id || masterId === tree.id;
            return (
              <AppleTree
                key={tree.id}
                left={pos.left}
                top={pos.top}
                scale={cam.s}
                sign={tree.sign}
                hot={hot}
                variant={layout === "city" ? "lamp" : "tree"}
                onOpen={() => {
                  setTreeHover(null);
                  setHover(null);
                  setMasterId(tree.id);
                }}
                onHover={() => setTreeHover(tree.id)}
                onLeave={() => setTreeHover((cur) => (cur === tree.id ? null : cur))}
              />
            );
          })}

        {mapReady && !inside &&
          plots.map((plot) => {
            const c = plotCenter(plot);
            const pos = toScreen(c.x, c.y);
            const w = wingById(plot.id);
            if (!w) return null;
            const hot = hover === plot.id;
            const done = isWingComplete(w, read);
            const onBridge = bridge?.wingIds.includes(plot.id);
            return (
              <button
                key={plot.id}
                type="button"
                className="absolute z-20"
                style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -50%)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  enter(plot.id);
                }}
                aria-label={`${w.name}. ${w.place}. Step inside.`}
              >
                <span className="flex flex-col items-center gap-1">
                  <span
                    className={`size-3 rounded-full ring-2 ring-paper ${onBridge || hot ? "bg-stamp" : "bg-ink"}`}
                  />
                  <span
                    className={`max-w-40 rounded-full px-2 py-0.5 text-center text-xs leading-tight font-bold ${
                      onBridge ? "bg-stamp text-paper" : "bg-paper-2/95 text-ink"
                    }`}
                  >
                    {done ? "Stamped · " : ""}
                    {SHORT[plot.id] ?? w.name}
                  </span>
                </span>
              </button>
            );
          })}

        {sceneReady && inside &&
          room?.spots.map((spot, index) => {
            const pos = toScreen((spot.x / 100) * ROOM_W, (spot.y / 100) * ROOM_H);
            const st = wing?.stations.find((s) => s.id === spot.id);
            if (!st) return null;
            const seen = read.includes(st.id);
            const hot = hover === st.id;
            return (
              <button
                key={st.id}
                type="button"
                className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: pos.left, top: pos.top }}
                onPointerEnter={() => setHover(st.id)}
                onPointerLeave={() => setHover((h) => (h === st.id ? null : h))}
                onClick={(e) => {
                  e.stopPropagation();
                  setHover(null);
                  setStation(st);
                }}
                aria-label={st.title}
              >
                <span
                  className={`grid size-9 place-items-center rounded-full text-sm font-bold shadow-sm ${
                    seen ? "bg-stamp text-paper" : "bg-ink text-paper"
                  }`}
                >
                  {seen ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                {hot && (
                  <span className="mt-1 w-44 rounded-2xl border border-line bg-paper-2 p-2 text-left shadow-sm">
                    <span className="block text-sm font-bold">{st.title}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted">{st.body.split(". ")[0]}.</span>
                    <span className="mt-1 block text-xs font-semibold">{st.tcode}</span>
                  </span>
                )}
              </button>
            );
          })}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto flex max-w-[78%] items-start gap-2">
          {inside && (
            <button
              type="button"
              onClick={leave}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-sm font-bold text-paper"
              aria-label="Back to the map"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
          )}
          <div className="min-w-0 rounded-2xl border border-line bg-paper-2/95 px-3 py-2">
            <p className="text-xs font-bold tracking-widest text-stamp uppercase">
              {inside ? wing?.place : layout === "city" ? "City" : "Neighborhood"}
            </p>
            <h1 className="text-lg leading-tight font-semibold">{inside ? wing?.name : "S/4HANA Illustrated"}</h1>
            {!inside && (
              <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Map layout">
                {(
                  [
                    ["village", "Village"],
                    ["city", "City"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={layout === id}
                    className={`min-h-11 rounded-full px-3 text-sm font-bold ${layout === id ? "bg-ink text-paper" : "border border-line bg-paper text-ink"}`}
                    onClick={() => {
                      setLayout(id);
                      setHover(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted tabular-nums">
              {inside ? "Tap a numbered station" : `${stampedCount(read)}/${wings.length} stamped`}
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {inside && (
            <button
              type="button"
              aria-label="Help. Open the SAP PRESS book list."
              className="grid size-14 place-items-center rounded-full bg-stamp text-sm font-bold text-paper shadow-sm"
              onClick={() => setHelp(true)}
            >
              Help
            </button>
          )}
          <button type="button" aria-label="Zoom in" className="grid size-11 place-items-center rounded-full border border-line bg-paper-2" onClick={() => zoomAt(vw / 2, vh / 2, 1.2)}>
            <Plus className="size-5" />
          </button>
          <button type="button" aria-label="Zoom out" className="grid size-11 place-items-center rounded-full border border-line bg-paper-2" onClick={() => zoomAt(vw / 2, vh / 2, 1 / 1.2)}>
            <Minus className="size-5" />
          </button>
          {!inside && (
            <button
              type="button"
              className="min-h-11 rounded-full bg-ink px-3 text-sm font-bold text-paper"
              onClick={() => {
                const fit = fitScale(vw, vh, MAP_W, MAP_H);
                animateTo({ x: MAP_W / 2, y: MAP_H / 2, s: fit }, 400);
              }}
            >
              All
            </button>
          )}
        </div>
      </header>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 space-y-2 p-3">
        {!inside && hover && (
          <div className="pointer-events-none mx-auto max-w-md rounded-2xl border border-line bg-paper-2/95 px-3 py-2">
            <p className="text-sm font-bold">{wingById(hover)?.name}</p>
            <p className="text-xs leading-snug text-muted">{wingById(hover)?.blurb}</p>
          </div>
        )}
        {inside ? (
          <button
            type="button"
            onClick={leave}
            className="pointer-events-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-base font-bold text-paper"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            Back to map
          </button>
        ) : (
          <div className="pointer-events-auto flex gap-2 overflow-x-auto">
            <button type="button" className="shrink-0 rounded-full border border-line bg-paper-2 px-3 py-2 text-sm font-bold" onClick={() => setDirectory(true)}>
              Directory
            </button>
            <button type="button" className="shrink-0 rounded-full border border-line bg-paper-2 px-3 py-2 text-sm font-bold" onClick={() => setSources(true)}>
              Edition
            </button>
            {bridges.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBridgeId((cur) => (cur === b.id ? null : b.id))}
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold ${
                  bridgeId === b.id ? "bg-stamp text-paper" : "border border-line bg-paper-2"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}
      </footer>

      <Directory
        open={directory}
        onClose={() => setDirectory(false)}
        onPick={(id) => {
          setDirectory(false);
          if (inside) leave();
          const plot = plots.find((p) => p.id === id);
          if (!plot) return;
          const c = plotCenter(plot);
          const fit = fitScale(vw, vh, MAP_W, MAP_H);
          animateTo({ x: c.x, y: c.y, s: Math.max(fit, 0.55) }, 420);
        }}
      />
      <Sources open={sources} onClose={() => setSources(false)} />
      <Books open={help} wingId={inside} onClose={() => setHelp(false)} />
      <StationSheet
        station={station}
        wing={wing}
        read={read}
        onClose={() => setStation(null)}
        onMark={(id) => mark(id)}
        onHelp={() => setHelp(true)}
      />
      <MasterDataPanel key={masterId ?? "closed"} treeId={masterId} onClose={() => setMasterId(null)} />
    </div>
  );
}

function nearestSpot(spots: Spot[], x: number, y: number, scale: number): Spot | null {
  let best: Spot | null = null;
  let bestD = 36 / scale;
  for (const spot of spots) {
    const sx = (spot.x / 100) * ROOM_W;
    const sy = (spot.y / 100) * ROOM_H;
    const d = Math.hypot(sx - x, sy - y);
    if (d < bestD) {
      best = spot;
      bestD = d;
    }
  }
  return best;
}

function Directory({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-ink/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-40 max-h-dvh overflow-y-auto rounded-t-3xl bg-paper-2 px-4 pt-4 pb-8">
          <Dialog.Title className="text-2xl font-semibold">Directory</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">
            Fly the camera to a building, then zoom in to step inside.
          </Dialog.Description>
          <ul className="mt-3 space-y-2">
            {wings.map((w) => (
              <li key={w.id}>
                <button type="button" className="flex w-full min-h-12 items-center gap-3 rounded-2xl border border-line bg-paper px-3 py-2 text-left" onClick={() => onPick(w.id)}>
                  <span className="text-sm font-bold">{w.name}</span>
                  <span className="text-xs text-muted">{w.place}</span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StationSheet({
  station,
  wing,
  read,
  onClose,
  onMark,
  onHelp,
}: {
  station: Station | null;
  wing: Wing | null | undefined;
  read: string[];
  onClose: () => void;
  onMark: (id: string) => void;
  onHelp: () => void;
}) {
  const seen = station ? read.includes(station.id) : false;
  const sample = station ? studyObjects[station.id] : undefined;
  const technical = station ? technicalModels[station.id] : undefined;
  return (
    <Dialog.Root open={Boolean(station)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-ink/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-40 max-h-dvh overflow-y-auto rounded-t-3xl bg-paper-2 px-5 pt-4 pb-8 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          {station && (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Description className="text-xs font-bold tracking-widest text-muted uppercase">
                    {wing?.name} · {station.area}
                  </Dialog.Description>
                  <Dialog.Title className="mt-1 text-3xl font-semibold">{station.title}</Dialog.Title>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Help. Open the SAP PRESS book list."
                    className="grid size-14 place-items-center rounded-full bg-stamp text-sm font-bold text-paper shadow-sm"
                    onClick={onHelp}
                  >
                    Help
                  </button>
                  <Dialog.Close className="grid size-11 place-items-center rounded-full border border-line" aria-label="Close">
                    <X className="size-5" />
                  </Dialog.Close>
                </div>
              </div>
              <p className="mt-4 text-base leading-relaxed">{station.body}</p>
              <ul className="mt-4 space-y-2">
                {station.system.map((line) => (
                  <li key={line} className="flex gap-2 text-sm leading-relaxed">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-stamp" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-paper p-3">
                  <dt className="text-xs font-bold tracking-widest text-muted uppercase">Fiori app</dt>
                  <dd className="mt-1 text-sm font-semibold">{station.fiori}</dd>
                  <dd className="mt-1 text-sm text-muted">{station.appId ? `App ID ${station.appId}` : "Confirm the app ID for 2025 FPS01"}</dd>
                </div>
                <div className="rounded-2xl border border-line bg-paper p-3">
                  <dt className="text-xs font-bold tracking-widest text-muted uppercase">Transaction</dt>
                  <dd className="mt-1 text-sm font-semibold break-words">{station.tcode}</dd>
                </div>
              </dl>
              {station.versusEcc && (
                <aside className="mt-3 rounded-2xl border border-line bg-paper p-3">
                  <h3 className="text-xs font-bold tracking-widest text-stamp uppercase">Compared with ECC</h3>
                  <p className="mt-1 text-sm leading-relaxed">{station.versusEcc}</p>
                </aside>
              )}
              {sample && <StudyObjectPage page={sample} />}
              {technical && <TechnicalModelCard model={technical} />}
              {station.fps && (
                <aside className="mt-3 rounded-2xl border border-line bg-paper p-3">
                  <h3 className="text-xs font-bold tracking-widest text-stamp uppercase">2025 FPS01</h3>
                  <p className="mt-1 text-sm leading-relaxed">{station.fps}</p>
                </aside>
              )}
              <button
                type="button"
                onClick={() => onMark(station.id)}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-4 text-base font-bold text-paper"
              >
                {seen ? "Read" : "Mark this plate as read"}
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Books({ open, wingId, onClose }: { open: boolean; wingId: string | null; onClose: () => void }) {
  const shelf = wingId ? shelfForWing(wingId) : null;
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-dvh overflow-y-auto rounded-t-3xl bg-paper-2 px-5 pt-5 pb-8 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <Dialog.Title className="text-2xl font-semibold">Help</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted">
            {shelf
              ? `${shelf.area}. These SAP PRESS books match this building. A title may cover more than on-premise 2025 FPS01.`
              : "Open a building, then Help shows the books for that area."}
          </Dialog.Description>
          <ul className="mt-4 space-y-2">
            {shelf?.books.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="noreferrer" className="block rounded-2xl border border-line bg-paper px-3 py-2">
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{item.authors}</span>
                  <span className="mt-1 block text-sm leading-relaxed">{item.note}</span>
                </a>
              </li>
            ))}
          </ul>
          <Dialog.Close className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink font-bold text-paper">
            Close
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Sources({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-ink/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-40 max-h-dvh overflow-y-auto rounded-t-3xl bg-paper-2 px-5 pt-5 pb-8 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <Dialog.Title className="text-2xl font-semibold">About this edition</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted">
            {EDITION.product} {EDITION.release}. Feature Scope Description {EDITION.version}, {EDITION.date}. A study guide, not SAP documentation. On-premise only.
          </Dialog.Description>
          <a href={EDITION.help} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center font-semibold text-stamp underline decoration-line underline-offset-4">
            SAP Help Portal for S/4HANA on-premise 2025
          </a>
          <Dialog.Close className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink font-bold text-paper">
            Close
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
