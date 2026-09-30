import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { bridges, isWingComplete, wingById } from "@/data/guide";
import { villageBuildings } from "@/data/village-scene";
import { masterTrees } from "@/data/master-trees";
import { buildAssets, BUILD_STEPS, VillageScene, type Assets } from "./scene";
import { labelEls, treeLabelEls, useVillage, type Quality } from "./store";
import { lastPointerType } from "./camera-rig";

export const SHORT: Record<string, string> = {
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

const DPR: Record<Quality, [number, number]> = {
  high: [1, 2],
  medium: [1, 1.5],
  low: [1, 1],
};

function initialQuality(): Quality {
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced === "high" || forced === "medium" || forced === "low") return forced;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (cores <= 2 || mem <= 2) return "low";
  if (coarse || cores <= 4 || mem <= 4) return "medium";
  return "high";
}

export type VillageCanvasProps = {
  active: boolean;
  read: string[];
  celebrate: string | null;
  insets: { top: number; bottom: number };
  onSelect: (id: string) => void;
  onTree: (id: string) => void;
  onInteract: () => void;
  onProgress: (done: number, total: number, label: string) => void;
  onReady: () => void;
};

export default function VillageCanvas(props: VillageCanvasProps) {
  const { active, read, celebrate, insets, onSelect, onTree, onInteract, onProgress, onReady } = props;
  const [assets, setAssets] = useState<Assets | null>(null);
  const [hidden, setHidden] = useState(false);
  const [showFps] = useState(() => new URLSearchParams(window.location.search).has("fps"));
  const quality = useVillage((s) => s.quality);
  const setQuality = useVillage((s) => s.setQuality);
  const reduced = useVillage((s) => s.reduced);
  const hover = useVillage((s) => s.hover);
  const treeHover = useVillage((s) => s.treeHover);
  const setHover = useVillage((s) => s.setHover);
  const setTreeHover = useVillage((s) => s.setTreeHover);
  const routeId = useVillage((s) => s.routeId);
  const gliding = useVillage((s) => s.gliding);
  const total = BUILD_STEPS + 2;

  useEffect(() => {
    setQuality(initialQuality());
  }, [setQuality]);

  useEffect(() => {
    let alive = true;
    let done = 1;
    onProgress(done, total, "Loading the engine");
    buildAssets((label) => {
      done += 1;
      if (alive) onProgress(done, total, label);
    }).then((a) => {
      if (!alive) return;
      onProgress(total - 1, total, "Waking the villagers");
      setAssets(a);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const stamped = villageBuildings.filter((b) => {
    const w = wingById(b.id);
    return w ? isWingComplete(w, read) : false;
  }).map((b) => b.id);
  const route = bridges.find((b) => b.id === routeId);
  const running = active && !hidden;
  const frameloop = !running ? "never" : reduced ? "demand" : "always";

  return (
    <div className="absolute inset-0">
      {assets && (
        <Canvas
          className="village-canvas"
          aria-hidden="true"
          frameloop={frameloop}
          dpr={DPR[quality]}
          shadows={quality === "high"}
          flat
          gl={{ antialias: quality !== "low", powerPreference: "high-performance" }}
          camera={{ fov: 34, near: 0.5, far: 400, position: [0, 60, 60] }}
          style={{ touchAction: "none" }}
        >
          <PerformanceMonitor
            onDecline={() => {
              const q = useVillage.getState().quality;
              setQuality(q === "high" ? "medium" : "low");
            }}
            flipflops={2}
            onFallback={() => setQuality("low")}
          />
          <VillageScene
            assets={assets}
            stamped={stamped}
            celebrate={celebrate}
            insets={insets}
            onSelect={onSelect}
            onTree={onTree}
            onInteract={onInteract}
            onFirstFrame={() => {
              onProgress(total, total, "Ready");
              onReady();
            }}
          />
          {showFps && <FpsProbe />}
        </Canvas>
      )}
      <div className="village-paper pointer-events-none absolute inset-0" aria-hidden="true" />
      {assets && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" data-gliding={gliding || undefined} hidden={!active}>
          {masterTrees.map((tree) => (
            <button
              key={tree.id}
              type="button"
              ref={(el) => {
                if (el) treeLabelEls.set(tree.id, el);
                else treeLabelEls.delete(tree.id);
              }}
              className={`village-tree-label pointer-events-auto absolute top-0 left-0 grid min-h-11 place-items-center px-1 ${treeHover === tree.id ? "is-hot" : ""}`}
              aria-label={`${tree.sign}. Master data.`}
              onPointerEnter={() => setTreeHover(tree.id)}
              onPointerLeave={() => setTreeHover(null)}
              onFocus={() => setTreeHover(tree.id)}
              onBlur={() => setTreeHover(null)}
              onClick={() => onTree(tree.id)}
            >
              <span className="rounded-full bg-paper-2/95 px-2 py-0.5 text-[11px] leading-tight font-bold whitespace-nowrap text-ink shadow-sm">
                Master data
              </span>
            </button>
          ))}
          {villageBuildings.map((b) => {
            const w = wingById(b.id);
            if (!w) return null;
            const done = w.stations.filter((s) => read.includes(s.id)).length;
            const complete = done === w.stations.length;
            const hot = hover === b.id;
            const order = route ? route.wingIds.map((id, i) => (id === b.id ? i + 1 : 0)).filter(Boolean) : [];
            const dim = route && !order.length;
            const touch = lastPointerType === "touch" || lastPointerType === "pen";
            return (
              <button
                key={b.id}
                type="button"
                data-building={b.id}
                ref={(el) => {
                  if (el) labelEls.set(b.id, el);
                  else labelEls.delete(b.id);
                }}
                className={`village-label pointer-events-auto absolute top-0 left-0 flex min-h-11 flex-col items-center justify-end pb-1 ${hot ? "z-20" : "z-10"} ${dim ? "is-dim" : ""}`}
                aria-label={`${w.name}. ${w.place}. ${complete ? "Stamped" : `${done} of ${w.stations.length} plates read`}. Step inside.`}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHover(b.id);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse" && useVillage.getState().hover === b.id) setHover(null);
                }}
                onFocus={() => setHover(b.id)}
                onBlur={() => {
                  if (useVillage.getState().hover === b.id) setHover(null);
                }}
                onClick={() => onSelect(b.id)}
              >
                <span
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-center leading-tight font-bold shadow-sm transition-[padding,transform] ${
                    order.length ? "border-stamp bg-stamp text-paper-2" : "border-line bg-paper-2/95 text-ink"
                  } ${hot ? "scale-105 px-3 text-sm" : "text-xs"}`}
                >
                  {order.length > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-paper-2 px-1 text-[11px] text-stamp tabular-nums">
                      {order.join("·")}
                    </span>
                  )}
                  {complete && (
                    <span className={`grid size-4 place-items-center rounded-full ${order.length ? "bg-paper-2 text-stamp" : "bg-stamp text-paper-2"}`} aria-hidden="true">
                      <svg viewBox="0 0 12 12" className="size-2.5">
                        <path d="M2.5 6.5l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  <span className="max-w-44">{SHORT[b.id] ?? w.name}</span>
                </span>
                {hot && (
                  <span className="mt-1 rounded-xl border border-line bg-paper-2 px-2.5 py-1 text-[11px] leading-snug font-semibold whitespace-nowrap text-muted shadow-sm">
                    <span className={complete ? "text-stamp" : "text-ink"}>{complete ? "Stamped" : `${done}/${w.stations.length} plates read`}</span>
                    {" · "}
                    {touch ? "Tap again to enter" : "Click to enter"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FpsProbe() {
  const el = useRef<HTMLDivElement | null>(null);
  const frames = useRef<number[]>([]);
  useEffect(() => {
    const div = document.createElement("div");
    div.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99;background:#1a2744;color:#fffaf3;font:600 12px ui-monospace,monospace;padding:4px 8px;border-radius:8px";
    div.setAttribute("data-fps", "");
    document.body.appendChild(div);
    el.current = div;
    let raf = 0;
    const tick = (t: number) => {
      frames.current.push(t);
      while (frames.current.length && t - frames.current[0] > 1000) frames.current.shift();
      div.textContent = `${frames.current.length} fps`;
      div.dataset.fps = String(frames.current.length);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      div.remove();
    };
  }, []);
  return null;
}
