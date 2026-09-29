/** Drawn height on the campus map, in map pixels. */
const TREE_H = 74;
const TREE_W = TREE_H * (436 / 520);
const BEACON_H = 78;
const BEACON_W = BEACON_H * (80 / 150);

type AppleTreeProps = {
  left: number;
  top: number;
  scale: number;
  sign: string;
  hot: boolean;
  variant?: "tree" | "beacon";
  onOpen: () => void;
  onHover: () => void;
  onLeave: () => void;
};

export function AppleTree({ left, top, scale, sign, hot, variant = "tree", onOpen, onHover, onLeave }: AppleTreeProps) {
  const width = (variant === "beacon" ? BEACON_W : TREE_W) * scale;
  const height = (variant === "beacon" ? BEACON_H : TREE_H) * scale;
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
      {variant === "beacon" ? (
        <img src="/art/neon-beacon.svg" alt="" draggable={false} className={`h-full w-full object-contain ${hot ? "brightness-125" : ""}`} />
      ) : (
        <img
          src={hot ? "/art/apple-tree-hot.png" : "/art/apple-tree.png"}
          alt=""
          draggable={false}
          className="h-full w-full object-contain"
        />
      )}
      <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-0.5 flex -translate-x-1/2 flex-col items-center">
        <span
          className={`max-w-36 rounded-full px-2 py-0.5 text-center text-[11px] leading-tight font-bold ${
            variant === "beacon" ? "bg-[#1b1224]/90 text-[#f6e7ff]" : "bg-paper-2/95 text-ink"
          }`}
        >
          {sign}
        </span>
        {hot && (
          <span className="mt-0.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-paper">
            Master data
          </span>
        )}
      </span>
    </button>
  );
}
