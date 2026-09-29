const TREE_H = 74;
const TREE_W = TREE_H * (436 / 520);
/** Painted bulbs, tucked in the leaves, the same size as the apples. */
const BULBS: Array<[number, number, string]> = [
  [190, 90, "#ff5a3c"],
  [280, 170, "#ffd24a"],
  [330, 160, "#fff6c8"],
  [100, 170, "#ff5a3c"],
  [210, 200, "#ffd24a"],
  [340, 200, "#e07048"],
  [175, 245, "#fff6c8"],
  [250, 240, "#ff5a3c"],
  [250, 150, "#e07048"],
];
const BEACON_H = 78;
const BEACON_W = BEACON_H * (70 / 140);

type AppleTreeProps = {
  left: number;
  top: number;
  scale: number;
  sign: string;
  hot: boolean;
  variant?: "tree" | "lamp" | "gas" | "beacon";
  onOpen: () => void;
  onHover: () => void;
  onLeave: () => void;
};

export function AppleTree({ left, top, scale, sign, hot, variant = "tree", onOpen, onHover, onLeave }: AppleTreeProps) {
  const width = (variant === "tree" ? TREE_W : BEACON_W) * scale;
  const height = (variant === "tree" ? TREE_H : BEACON_H) * scale;
  const src =
    variant === "gas"
      ? "/art/gotham-lamp.svg"
      : variant === "lamp" || variant === "beacon"
        ? "/art/city-lamp.svg"
        : hot
          ? "/art/apple-tree-hot.png"
          : "/art/apple-tree.png";
  return (
    <button
      type="button"
      className="absolute z-[12] overflow-visible"
      style={{
        left,
        top,
        width,
        height,
        transform: "translate(-50%, -100%)",
      }}
      aria-label={`${sign}. Master data.`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
    >
      <img src={src} alt="" draggable={false} className="h-full w-full object-contain" />
      {variant === "tree" ? (
        <svg viewBox="0 0 436 520" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M100 170 C150 120 180 100 190 90 C230 78 260 140 280 170 C310 150 330 160 340 200 C300 230 260 250 250 240 C210 250 175 245 175 245"
            fill="none"
            stroke="#5c4632"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {BULBS.map(([x, y, color]) => (
            <g key={`${x}-${y}`} style={{ opacity: "calc(0.35 + 0.65 * var(--twinkle, 1))" }}>
              <circle cx={x} cy={y} r="34" fill={color} opacity="0.55" />
              <circle cx={x} cy={y} r="20" fill={color} stroke="#3d2914" strokeWidth="3" />
              <circle cx={x - 4} cy={y - 4} r="6" fill="#fffaf3" />
            </g>
          ))}
        </svg>
      ) : (
        <svg viewBox="0 0 70 140" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M18 62h34l-4 16H22l-4-16z" fill="#3d2914" style={{ opacity: "calc(1 - var(--twinkle, 1))" }} />
          <path d="M24 64h22l-2 7H26l-2-7z" fill="#fffaf3" style={{ opacity: "var(--twinkle, 1)" }} />
        </svg>
      )}
      <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper-2/95 px-2 py-0.5 text-center text-[11px] leading-tight font-bold text-ink">
        Master data
      </span>
    </button>
  );
}