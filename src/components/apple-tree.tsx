const TREE_H = 74;
const TREE_W = TREE_H * (436 / 520);
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
      <span className="pointer-events-none absolute top-full left-1/2 z-10 mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper-2/95 px-2 py-0.5 text-center text-[11px] leading-tight font-bold text-ink">
        Master data
      </span>
    </button>
  );
}
