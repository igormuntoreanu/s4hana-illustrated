/** Drawn height on the campus map, in map pixels. Sprite is 436×520. */
const TREE_H = 118;
const TREE_W = TREE_H * (436 / 520);

type AppleTreeProps = {
  left: number;
  top: number;
  scale: number;
  sign: string;
  hot: boolean;
  onOpen: () => void;
  onHover: () => void;
  onLeave: () => void;
};

export function AppleTree({ left, top, scale, sign, hot, onOpen, onHover, onLeave }: AppleTreeProps) {
  const width = TREE_W * scale;
  const height = TREE_H * scale;
  return (
    <button
      type="button"
      className="absolute z-[15] overflow-visible"
      style={{
        left,
        top,
        width,
        height,
        transform: "translate(-50%, -92%)",
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
      <img
        src={hot ? "/art/apple-tree-hot.png" : "/art/apple-tree.png"}
        alt=""
        draggable={false}
        className="h-full w-full object-contain drop-shadow-[0_1px_0_rgba(70,55,30,0.15)]"
      />
      {hot && (
        <span className="pointer-events-none absolute top-0 left-1/2 z-10 flex -translate-x-1/2 -translate-y-[70%] flex-col items-center">
          <span className="rounded-full bg-paper-2/95 px-2 py-0.5 text-center text-[11px] leading-tight font-bold whitespace-nowrap text-ink shadow-sm">
            Master data
          </span>
          <span className="mt-0.5 max-w-40 rounded-full bg-ink/90 px-2 py-0.5 text-center text-[10px] leading-tight font-semibold text-paper">
            {sign}
          </span>
        </span>
      )}
    </button>
  );
}
