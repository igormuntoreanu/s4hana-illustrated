/** Drawn height on the campus map, in map pixels. The picture is 2128×912. */
const TREE_H = 128;
const TREE_W = TREE_H * (545 / 676);

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
      {hot && (
        <span className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-[80%] rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-paper shadow-md">
          Master data
        </span>
      )}
      <img
        src={hot ? "/art/apple-tree-hot.png" : "/art/apple-tree.png"}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
      />
      <span className="pointer-events-none absolute bottom-[2%] left-1/2 w-max max-w-[8.5rem] -translate-x-1/2 rounded-sm border border-[#6b4423] bg-[#f4e6c8]/95 px-1 py-0.5 text-center text-[10px] leading-tight font-bold text-[#3d2914] shadow-sm">
        {sign}
      </span>
    </button>
  );
}
