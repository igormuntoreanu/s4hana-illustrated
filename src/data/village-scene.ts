/**
 * Outside view of the 3D village: where each building stands, what props sit
 * around it, and which ambient characters loop there. Scene code reads this
 * file only; tune positions, props and loops here.
 *
 * Coordinates are world units on the ground plane: x runs west to east,
 * z runs north (far, negative) to south (near the default camera, positive).
 * Building-local coordinates are relative to the building centre, with the
 * door on local +z; `facing` rotates local +z around the vertical axis
 * (0 = door faces south, PI/2 = east, -PI/2 = west).
 */

export type Vec2 = [number, number];

export type BuildingStyle =
  | "drafting"
  | "counting"
  | "guild"
  | "trading"
  | "shop"
  | "warehouse"
  | "workshop"
  | "yard"
  | "repair"
  | "construction";

export type PropKind =
  | "draftTable"
  | "blueprintBoard"
  | "prototype"
  | "ledgerDesk"
  | "coinChest"
  | "coinCart"
  | "noticeBoard"
  | "desk"
  | "bench"
  | "wagon"
  | "crate"
  | "crateStack"
  | "barrel"
  | "stall"
  | "parcelStack"
  | "shelf"
  | "pallet"
  | "conveyor"
  | "workbench"
  | "bigMachine"
  | "toolbox"
  | "safetyCone"
  | "scaffold"
  | "beamStack"
  | "planTable"
  | "lamp"
  | "fence"
  | "flowerBed"
  | "well"
  | "signpost";

export type Prop = { kind: PropKind; at: Vec2; rot?: number; s?: number };

export type Anim =
  | "idle"
  | "walk"
  | "carry"
  | "hammer"
  | "stamp"
  | "draft"
  | "talk"
  | "point"
  | "inspect"
  | "shake"
  | "cheer"
  | "sweep";

export type Item =
  | "crate"
  | "coinBag"
  | "parcel"
  | "hammer"
  | "clipboard"
  | "toolbox"
  | "gear"
  | "scroll"
  | "wrench";

/** One step of an ambient loop. `go` walks there; `act` plays in place. */
export type Step =
  | { go: Vec2; item?: Item; speed?: number }
  | { act: Anim; dur: Vec2; item?: Item; face?: Vec2 };

export type Look = {
  shirt: string;
  pants: string;
  skin?: string;
  hat?: "none" | "hardhat" | "tophat" | "cap" | "hood" | "bun";
  hatColor?: string;
};

export type Actor = {
  role: string;
  look: Look;
  /** Local start point. */
  at: Vec2;
  loop: Step[];
  /** Dropped first on low-quality devices. */
  extra?: boolean;
};

export type MoverKind = "forklift" | "truck" | "van" | "coinCart" | "product" | "handcart" | "wagon";

export type Mover = {
  kind: MoverKind;
  /** Local to the building unless `space` is "world". */
  path: Vec2[];
  space?: "local" | "world";
  mode: "loop" | "pingpong";
  speed: number;
  /** Seconds to rest at each end (pingpong) or at the path start (loop). */
  pause: Vec2;
  /** Hide the mover while it is on the last segment (vehicles leaving the map). */
  fadeAtEnd?: boolean;
  /** Optional driver walking beside or in front. */
  driver?: Look;
  /** Conveyor products sit on the belt. */
  height?: number;
  color?: string;
};

export type VillageBuilding = {
  id: string;
  style: BuildingStyle;
  pos: Vec2;
  facing: number;
  /** Footprint for hit testing and tree clearing, local width x depth. */
  size: Vec2;
  /** Height of the name label above the ground. */
  labelY: number;
  /** Where the stamp banner pole stands, local. */
  banner: Vec2;
  /** Local door point; the camera glides to it. */
  door: Vec2;
  /** Master-data tree beside the building, world. */
  tree: { id: string; at: Vec2 };
  props: Prop[];
  actors: Actor[];
  movers: Mover[];
};

const SKIN = ["#f1c7a0", "#d9a27a", "#b97c55", "#8a5a3c", "#f5d5b8", "#c68e62"];

const skin = (i: number) => SKIN[i % SKIN.length];

export const villageBuildings: VillageBuilding[] = [
  {
    id: "rnd",
    style: "drafting",
    pos: [-24, -13.5],
    facing: 0,
    size: [7, 6],
    labelY: 7.2,
    banner: [3.9, 1.4],
    door: [0, 3.2],
    tree: { id: "rnd", at: [-19.4, -12.6] },
    props: [
      { kind: "draftTable", at: [-2.2, 4.4], rot: 0.2 },
      { kind: "draftTable", at: [0.6, 5.2], rot: -0.3 },
      { kind: "blueprintBoard", at: [-3.9, 3.2], rot: 0.6 },
      { kind: "prototype", at: [2.8, 4.8] },
      { kind: "crate", at: [4.4, 3.6], rot: 0.4 },
      { kind: "lamp", at: [1.6, 3.4] },
    ],
    actors: [
      {
        role: "Engineer drafting",
        look: { shirt: "#3d4ec4", pants: "#2b2f44", skin: skin(0), hat: "cap", hatColor: "#e8e2d0" },
        at: [-2.2, 5.1],
        loop: [
          { act: "draft", dur: [3, 6], face: [-2.2, 4.4] },
          { act: "idle", dur: [1, 2] },
          { act: "draft", dur: [3, 5], face: [-2.2, 4.4] },
        ],
      },
      {
        role: "Engineer at second table",
        look: { shirt: "#5b6fd6", pants: "#3a3024", skin: skin(3), hat: "bun", hatColor: "#3a2616" },
        at: [0.9, 5.9],
        loop: [
          { act: "draft", dur: [4, 7], face: [0.6, 5.2] },
          { go: [-3.2, 3.9] },
          { act: "point", dur: [2, 3], face: [-3.9, 3.2] },
          { go: [0.9, 5.9] },
        ],
      },
      {
        role: "Engineer carrying a prototype part",
        look: { shirt: "#e8e2d0", pants: "#3d4ec4", skin: skin(1), hat: "none" },
        at: [0, 3.4],
        loop: [
          { go: [2.4, 5.4], item: "gear" },
          { act: "inspect", dur: [2, 3], item: "gear", face: [2.8, 4.8] },
          { go: [0, 3.4], item: "gear" },
          { act: "idle", dur: [1, 3] },
        ],
      },
      {
        role: "Engineer reviewing the blueprint",
        look: { shirt: "#2e8a7a", pants: "#2b2f44", skin: skin(4), hat: "none" },
        at: [-4.4, 4.4],
        extra: true,
        loop: [
          { act: "talk", dur: [2, 4], face: [-3.9, 3.2] },
          { go: [-1.4, 4.9] },
          { act: "talk", dur: [2, 3], face: [-2.2, 4.4] },
          { go: [-4.4, 4.4] },
        ],
      },
    ],
    movers: [],
  },
  {
    id: "finance",
    style: "counting",
    pos: [-10, -13.2],
    facing: 0,
    size: [9, 7.5],
    labelY: 9.6,
    banner: [5.2, 2.2],
    door: [0, 4],
    tree: { id: "finance", at: [-5.6, -8.4] },
    props: [
      { kind: "ledgerDesk", at: [-3.2, 5.0], rot: 0 },
      { kind: "coinChest", at: [-1.8, 4.9] },
      { kind: "flowerBed", at: [3.2, 4.1] },
      { kind: "flowerBed", at: [-3.4, 3.9] },
      { kind: "lamp", at: [1.9, 4.6] },
      { kind: "coinChest", at: [3.6, 5.6], rot: 0.5 },
    ],
    actors: [
      {
        role: "Clerk stamping ledgers",
        look: { shirt: "#7a5a36", pants: "#2b2f44", skin: skin(2), hat: "none" },
        at: [-3.2, 5.7],
        loop: [
          { act: "stamp", dur: [3, 5], face: [-3.2, 5.0] },
          { act: "idle", dur: [0.6, 1.4] },
          { act: "stamp", dur: [2, 4], face: [-3.2, 5.0] },
        ],
      },
      {
        role: "Executive conferring",
        look: { shirt: "#1a2744", pants: "#1a2744", skin: skin(0), hat: "tophat", hatColor: "#141a2c" },
        at: [0.6, 6.2],
        loop: [
          { act: "talk", dur: [3, 5], face: [1.8, 6.6] },
          { go: [3.2, 7.4] },
          { act: "idle", dur: [1, 2] },
          { go: [0.6, 6.2] },
        ],
      },
      {
        role: "Executive listening",
        look: { shirt: "#0f6e56", pants: "#1a2744", skin: skin(5), hat: "none" },
        at: [1.8, 6.6],
        loop: [
          { act: "talk", dur: [3, 5], face: [0.6, 6.2] },
          { act: "point", dur: [1.5, 2.5], face: [0, 4] },
          { act: "talk", dur: [2, 4], face: [0.6, 6.2] },
        ],
      },
      {
        role: "Executive walking a round",
        look: { shirt: "#3e4c63", pants: "#1a2744", skin: skin(3), hat: "none" },
        at: [-4.5, 7.2],
        extra: true,
        loop: [
          { go: [4.5, 7.8], speed: 0.8 },
          { act: "idle", dur: [1, 2] },
          { go: [-4.5, 7.2], speed: 0.8 },
          { act: "idle", dur: [1, 2] },
        ],
      },
    ],
    movers: [
      {
        kind: "coinCart",
        path: [
          [0.8, 14.6],
          [0.2, 11],
          [0, 7.6],
          [1.8, 5.0],
        ],
        mode: "pingpong",
        speed: 1.3,
        pause: [2, 3],
        driver: { shirt: "#8a5a2a", pants: "#3a3024", skin: skin(1), hat: "cap", hatColor: "#c4321a" },
      },
    ],
  },
  {
    id: "hr",
    style: "guild",
    pos: [24, -13.5],
    facing: 0,
    size: [7.5, 7.5],
    labelY: 9.8,
    banner: [-4.6, 1.8],
    door: [0, 3.8],
    tree: { id: "people", at: [18.6, -9.2] },
    props: [
      { kind: "desk", at: [2.6, 5.2], rot: -0.4 },
      { kind: "noticeBoard", at: [-2.8, 4.6], rot: 0.3 },
      { kind: "bench", at: [-3.2, 7.2], rot: 0.1 },
      { kind: "flowerBed", at: [3.8, 3.6] },
      { kind: "lamp", at: [-1.3, 4.3] },
    ],
    actors: [
      {
        role: "Clerk at the desk",
        look: { shirt: "#c65b3a", pants: "#2b2f44", skin: skin(4), hat: "bun", hatColor: "#5a3a1f" },
        at: [3.1, 4.5],
        loop: [
          { act: "stamp", dur: [2, 3], face: [2.6, 5.2] },
          { act: "talk", dur: [2, 3], face: [2.2, 6.2] },
        ],
      },
      {
        role: "Person queuing, first",
        look: { shirt: "#3d6bdb", pants: "#3a3024", skin: skin(2), hat: "none" },
        at: [2.2, 6.2],
        loop: [
          { act: "talk", dur: [3, 5], face: [2.6, 5.2] },
          { go: [0.8, 9.0] },
          { go: [2.4, 8.0] },
          { go: [2.2, 6.2] },
        ],
      },
      {
        role: "Person queuing, second",
        look: { shirt: "#e0a84a", pants: "#2b2f44", skin: skin(5), hat: "cap", hatColor: "#0e7c8a" },
        at: [2.0, 7.2],
        loop: [{ act: "idle", dur: [3, 6], face: [2.6, 5.2] }],
      },
      {
        role: "Trainer with a small group",
        look: { shirt: "#8a5a2a", pants: "#1a2744", skin: skin(0), hat: "none" },
        at: [-2.8, 6.4],
        loop: [
          { act: "point", dur: [2, 3], face: [-2.8, 4.6] },
          { act: "talk", dur: [3, 5], face: [-3.2, 7.6] },
        ],
      },
      {
        role: "Trainee",
        look: { shirt: "#d94b62", pants: "#3a3024", skin: skin(3), hat: "none" },
        at: [-3.6, 7.8],
        extra: true,
        loop: [{ act: "idle", dur: [4, 7], face: [-2.8, 6.4] }],
      },
      {
        role: "Someone pinning notices",
        look: { shirt: "#0f6e56", pants: "#3a3024", skin: skin(1), hat: "hood", hatColor: "#0f6e56" },
        at: [-1.2, 5.6],
        loop: [
          { go: [-2.5, 5.2], item: "scroll" },
          { act: "hammer", dur: [1.5, 2.5], face: [-2.8, 4.6] },
          { go: [0.4, 8.6] },
          { act: "idle", dur: [2, 4] },
        ],
      },
    ],
    movers: [],
  },
  {
    id: "procurement",
    style: "trading",
    pos: [-18.5, -2],
    facing: Math.PI / 2,
    size: [6.5, 6],
    labelY: 6.6,
    banner: [3.6, -2.4],
    door: [0, 3.4],
    tree: { id: "procurement", at: [-13.6, -5.0] },
    props: [
      { kind: "wagon", at: [2.6, 5.6], rot: Math.PI / 2 },
      { kind: "crateStack", at: [-2.4, 4.2] },
      { kind: "crate", at: [-1.0, 4.6], rot: 0.3 },
      { kind: "barrel", at: [-3.0, 5.4] },
      { kind: "barrel", at: [3.4, 3.4] },
      { kind: "signpost", at: [1.2, 3.6] },
    ],
    actors: [
      {
        role: "Merchant unloading the wagon",
        look: { shirt: "#c9841a", pants: "#3a3024", skin: skin(2), hat: "cap", hatColor: "#5a3a1f" },
        at: [1.6, 5.6],
        loop: [
          { act: "idle", dur: [0.6, 1.2], face: [2.6, 5.6] },
          { go: [-1.6, 4.9], item: "crate" },
          { act: "idle", dur: [0.5, 1], face: [-2.4, 4.2] },
          { go: [1.6, 5.6] },
        ],
      },
      {
        role: "Second merchant unloading",
        look: { shirt: "#6d7d2a", pants: "#2b2f44", skin: skin(4), hat: "none" },
        at: [1.8, 6.6],
        extra: true,
        loop: [
          { act: "idle", dur: [1.5, 2.5], face: [2.6, 5.6] },
          { go: [-2.2, 5.4], item: "crate" },
          { act: "idle", dur: [0.5, 1], face: [-2.4, 4.2] },
          { go: [1.8, 6.6] },
        ],
      },
      {
        role: "Buyer negotiating",
        look: { shirt: "#1a2744", pants: "#3a3024", skin: skin(0), hat: "none" },
        at: [-0.5, 7.4],
        loop: [
          { act: "talk", dur: [3, 5], face: [0.5, 7.6] },
          { act: "shake", dur: [1.2, 1.8], face: [0.5, 7.6] },
          { act: "idle", dur: [1, 2], face: [0.5, 7.6] },
        ],
      },
      {
        role: "Supplier negotiating",
        look: { shirt: "#8a5a2a", pants: "#2b2f44", skin: skin(3), hat: "tophat", hatColor: "#3a2616" },
        at: [0.5, 7.6],
        loop: [
          { act: "talk", dur: [3, 5], face: [-0.5, 7.4] },
          { act: "shake", dur: [1.2, 1.8], face: [-0.5, 7.4] },
          { act: "idle", dur: [1, 2], face: [-0.5, 7.4] },
        ],
      },
    ],
    movers: [],
  },
  {
    id: "sales",
    style: "shop",
    pos: [11, 6.6],
    facing: 0,
    size: [6, 6],
    labelY: 6.8,
    banner: [-3.4, -2.2],
    door: [0, 3.2],
    tree: { id: "sales", at: [6.2, 13.6] },
    props: [
      { kind: "stall", at: [-2.3, 5.1], rot: 0 },
      { kind: "stall", at: [2.5, 5.1], rot: 0 },
      { kind: "parcelStack", at: [0.3, 3.8] },
      { kind: "barrel", at: [3.4, 3.2] },
      { kind: "flowerBed", at: [-3.4, 3.2] },
    ],
    actors: [
      {
        role: "Clerk handing over parcels",
        look: { shirt: "#d94b62", pants: "#2b2f44", skin: skin(1), hat: "bun", hatColor: "#3a2616" },
        at: [0.3, 4.6],
        loop: [
          { act: "idle", dur: [1, 2], face: [0.3, 6.0] },
          { act: "talk", dur: [1.5, 2.5], item: "parcel", face: [0.3, 6.0] },
          { go: [0.3, 3.9] },
          { act: "idle", dur: [0.6, 1], face: [0.3, 3.8] },
          { go: [0.3, 4.6] },
        ],
      },
      {
        role: "Customer browsing",
        look: { shirt: "#e0a84a", pants: "#3a3024", skin: skin(3), hat: "none" },
        at: [-2.2, 6.0],
        loop: [
          { act: "inspect", dur: [2, 4], face: [-2.2, 4.6] },
          { go: [2.2, 6.1], speed: 0.7 },
          { act: "inspect", dur: [2, 4], face: [2.4, 4.6] },
          { go: [-2.2, 6.0], speed: 0.7 },
        ],
      },
      {
        role: "Customer collecting a parcel",
        look: { shirt: "#3d4ec4", pants: "#2b2f44", skin: skin(5), hat: "cap", hatColor: "#d94b62" },
        at: [0.3, 6.1],
        extra: true,
        loop: [
          { act: "talk", dur: [2, 3], face: [0.3, 4.6] },
          { go: [-1.2, 8.8], item: "parcel" },
          { act: "idle", dur: [1, 2] },
          { go: [0.3, 6.1] },
        ],
      },
      {
        role: "Courier leaving with a parcel",
        look: { shirt: "#0e7c8a", pants: "#1a2744", skin: skin(2), hat: "cap", hatColor: "#e0a84a" },
        at: [1.4, 5.2],
        loop: [
          { act: "idle", dur: [0.8, 1.4], face: [0.3, 4.6] },
          { go: [3.6, 7.4], item: "parcel" },
          { go: [4.6, 9.8], item: "parcel" },
          { act: "idle", dur: [1.5, 3] },
          { go: [1.4, 5.2] },
        ],
      },
    ],
    movers: [],
  },
  {
    id: "supply",
    style: "warehouse",
    pos: [-15, 8.5],
    facing: Math.PI / 2,
    size: [8, 7],
    labelY: 7.6,
    banner: [-4.3, -3.0],
    door: [0, 3.8],
    tree: { id: "supply", at: [-9.6, 13.8] },
    props: [
      { kind: "shelf", at: [-3.0, 4.6], rot: 0 },
      { kind: "shelf", at: [-1.4, 4.6], rot: 0 },
      { kind: "pallet", at: [1.2, 5.0] },
      { kind: "crateStack", at: [3.0, 4.4] },
      { kind: "crate", at: [1.2, 5.0] },
      { kind: "barrel", at: [-4.4, 5.6] },
    ],
    actors: [
      {
        role: "Worker stacking crates",
        look: { shirt: "#e15a1c", pants: "#2b2f44", skin: skin(3), hat: "hardhat", hatColor: "#f2c230" },
        at: [1.2, 5.8],
        loop: [
          { act: "idle", dur: [0.5, 1], face: [1.2, 5.0] },
          { go: [-2.2, 5.4], item: "crate" },
          { act: "hammer", dur: [1, 1.6], face: [-2.2, 4.6] },
          { go: [1.2, 5.8] },
        ],
      },
      {
        role: "Worker at the shelves",
        look: { shirt: "#0e7c8a", pants: "#3a3024", skin: skin(0), hat: "cap", hatColor: "#0e7c8a" },
        at: [-3.0, 5.4],
        loop: [
          { act: "inspect", dur: [2, 4], item: "clipboard", face: [-3.0, 4.6] },
          { go: [-1.4, 5.4] },
          { act: "inspect", dur: [2, 3], item: "clipboard", face: [-1.4, 4.6] },
          { go: [-3.0, 5.4] },
        ],
      },
      {
        role: "Dock worker",
        look: { shirt: "#e0a84a", pants: "#2b2f44", skin: skin(5), hat: "hardhat", hatColor: "#f2c230" },
        at: [3.6, 5.4],
        extra: true,
        loop: [
          { go: [3.0, 7.8], item: "crate" },
          { act: "idle", dur: [1, 2] },
          { go: [3.6, 5.4] },
          { act: "idle", dur: [1, 2], face: [3.0, 4.4] },
        ],
      },
    ],
    movers: [
      {
        kind: "forklift",
        path: [
          [-3.2, 7.2],
          [2.6, 7.2],
          [2.6, 8.6],
          [-3.2, 8.6],
        ],
        mode: "loop",
        speed: 1.5,
        pause: [1, 2],
      },
      {
        kind: "truck",
        space: "world",
        path: [
          [-10.6, 12.2],
          [-9.6, 17],
          [-8.4, 24],
          [-6.8, 33],
        ],
        mode: "pingpong",
        speed: 2.4,
        pause: [4, 7],
        fadeAtEnd: true,
      },
    ],
  },
  {
    id: "manufacturing",
    style: "workshop",
    pos: [24.5, 1.5],
    facing: -Math.PI / 2,
    size: [8, 7],
    labelY: 8.8,
    banner: [4.4, -2.8],
    door: [0, 3.8],
    tree: { id: "mfg", at: [19.2, 7.2] },
    props: [
      { kind: "conveyor", at: [0, 5.3], rot: 0 },
      { kind: "workbench", at: [-3.2, 6.6], rot: 0 },
      { kind: "workbench", at: [3.2, 6.6], rot: 0 },
      { kind: "crate", at: [-4.4, 4.8], rot: 0.3 },
      { kind: "crateStack", at: [4.6, 4.8] },
    ],
    actors: [
      {
        role: "Worker assembling at the left bench",
        look: { shirt: "#e15a1c", pants: "#2b2f44", skin: skin(0), hat: "hardhat", hatColor: "#f2c230" },
        at: [-3.2, 7.4],
        loop: [
          { act: "hammer", dur: [3, 5], item: "hammer", face: [-3.2, 6.6] },
          { act: "idle", dur: [0.8, 1.6], face: [-3.2, 6.6] },
        ],
      },
      {
        role: "Worker assembling at the right bench",
        look: { shirt: "#c9841a", pants: "#3a3024", skin: skin(4), hat: "hardhat", hatColor: "#f2c230" },
        at: [3.2, 7.4],
        loop: [
          { act: "hammer", dur: [2, 4], item: "wrench", face: [3.2, 6.6] },
          { act: "idle", dur: [1, 2], face: [3.2, 6.6] },
        ],
      },
      {
        role: "Worker feeding the line",
        look: { shirt: "#3e4c63", pants: "#2b2f44", skin: skin(2), hat: "cap", hatColor: "#e15a1c" },
        at: [-1.4, 4.4],
        extra: true,
        loop: [
          { go: [-4.0, 5.6] },
          { act: "idle", dur: [0.5, 1], face: [-4.4, 4.8] },
          { go: [-1.4, 4.4], item: "gear" },
          { act: "hammer", dur: [1, 2], face: [0, 5.2] },
        ],
      },
      {
        role: "Quality inspector with a clipboard",
        look: { shirt: "#fffaf3", pants: "#1a2744", skin: skin(5), hat: "hardhat", hatColor: "#fffaf3" },
        at: [1.8, 4.2],
        loop: [
          { act: "inspect", dur: [2, 3], item: "clipboard", face: [0, 5.2] },
          { go: [1.8, 6.2], item: "clipboard" },
          { act: "inspect", dur: [2, 3], item: "clipboard", face: [0, 6.2] },
          { go: [1.8, 4.2], item: "clipboard" },
        ],
      },
    ],
    movers: [
      {
        kind: "product",
        path: [
          [0, 3.6],
          [0, 7.0],
        ],
        mode: "loop",
        speed: 0.7,
        pause: [0.2, 0.6],
        height: 0.72,
        color: "#e15a1c",
      },
      {
        kind: "product",
        path: [
          [0, 3.6],
          [0, 7.0],
        ],
        mode: "loop",
        speed: 0.7,
        pause: [2.4, 2.8],
        height: 0.72,
        color: "#3d4ec4",
      },
    ],
  },
  {
    id: "asset",
    style: "yard",
    pos: [11, -9.5],
    facing: 0,
    size: [9, 7],
    labelY: 7.8,
    banner: [-4.8, 2.4],
    door: [0, 3.8],
    tree: { id: "maint", at: [17.4, -9] },
    props: [
      { kind: "bigMachine", at: [-0.4, 0.4] },
      { kind: "toolbox", at: [-2.4, 2.4] },
      { kind: "toolbox", at: [2.2, 2.6], rot: 0.6 },
      { kind: "safetyCone", at: [-3.6, 3.4] },
      { kind: "safetyCone", at: [3.6, 3.4] },
      { kind: "barrel", at: [3.8, -2.2] },
    ],
    actors: [
      {
        role: "Technician fixing the machine",
        look: { shirt: "#3e4c63", pants: "#2b2f44", skin: skin(1), hat: "hardhat", hatColor: "#e15a1c" },
        at: [-2.0, 1.6],
        loop: [
          { act: "hammer", dur: [3, 5], item: "wrench", face: [-0.4, 0.4] },
          { act: "idle", dur: [1, 2], face: [-0.4, 0.4] },
          { go: [-2.6, 3.0] },
          { act: "idle", dur: [0.6, 1], face: [-2.4, 2.4] },
          { go: [-2.0, 1.6], item: "toolbox" },
        ],
      },
      {
        role: "Technician with a toolbox",
        look: { shirt: "#0e7c8a", pants: "#3a3024", skin: skin(3), hat: "hardhat", hatColor: "#e15a1c" },
        at: [1.6, 1.8],
        loop: [
          { act: "hammer", dur: [2, 4], item: "hammer", face: [-0.4, 0.4] },
          { go: [2.8, 3.2] },
          { act: "idle", dur: [1, 2], face: [2.2, 2.6] },
          { go: [1.6, 1.8], item: "toolbox" },
        ],
      },
      {
        role: "Safety officer walking a round",
        look: { shirt: "#f2c230", pants: "#1a2744", skin: skin(4), hat: "hardhat", hatColor: "#fffaf3" },
        at: [-4.0, 4.4],
        loop: [
          { go: [4.0, 4.4], item: "clipboard", speed: 0.8 },
          { act: "inspect", dur: [1.5, 2.5], item: "clipboard", face: [3.6, 3.4] },
          { go: [4.4, -3.0], item: "clipboard", speed: 0.8 },
          { go: [-4.4, -3.0], item: "clipboard", speed: 0.8 },
          { go: [-4.0, 4.4], item: "clipboard", speed: 0.8 },
          { act: "inspect", dur: [1.5, 2.5], item: "clipboard", face: [-3.6, 3.4] },
        ],
      },
    ],
    movers: [],
  },
  {
    id: "service",
    style: "repair",
    pos: [22.5, 14],
    facing: -Math.PI / 2,
    size: [7, 6],
    labelY: 6.8,
    banner: [3.8, -2.2],
    door: [0, 3.3],
    tree: { id: "service", at: [19.4, 19.6] },
    props: [
      { kind: "workbench", at: [-2.2, 4.4], rot: 0 },
      { kind: "toolbox", at: [-3.6, 4.2] },
      { kind: "crate", at: [3.8, 3.4], rot: 0.2 },
      { kind: "safetyCone", at: [1.6, 3.6] },
    ],
    actors: [
      {
        role: "Technician repairing at the bench",
        look: { shirt: "#3d6bdb", pants: "#2b2f44", skin: skin(2), hat: "cap", hatColor: "#3d6bdb" },
        at: [-2.2, 5.2],
        loop: [
          { act: "hammer", dur: [3, 5], item: "wrench", face: [-2.2, 4.4] },
          { act: "inspect", dur: [1.5, 2.5], face: [-2.2, 4.4] },
        ],
      },
      {
        role: "Field technician heading out",
        look: { shirt: "#0e7c8a", pants: "#1a2744", skin: skin(5), hat: "cap", hatColor: "#f2c230" },
        at: [0.6, 5.0],
        loop: [
          { act: "idle", dur: [1, 2], face: [-2.2, 4.4] },
          { go: [2.2, 6.0], item: "toolbox" },
          { act: "idle", dur: [0.8, 1.2] },
          { go: [0.6, 5.0] },
        ],
      },
      {
        role: "Customer dropping off an item",
        look: { shirt: "#c65b3a", pants: "#3a3024", skin: skin(0), hat: "none" },
        at: [-0.6, 8.8],
        extra: true,
        loop: [
          { go: [-1.6, 5.8], item: "parcel" },
          { act: "talk", dur: [2, 3], face: [-2.2, 5.2] },
          { go: [-0.6, 8.8] },
          { act: "idle", dur: [4, 7] },
        ],
      },
    ],
    movers: [
      {
        kind: "van",
        path: [
          [2.8, 6.4],
          [3.2, 9.4],
          [7.0, 12.0],
          [14, 13],
        ],
        mode: "pingpong",
        speed: 2.2,
        pause: [5, 8],
        fadeAtEnd: true,
      },
    ],
  },
  {
    id: "project",
    style: "construction",
    pos: [-25, 14.5],
    facing: Math.PI / 2,
    size: [7.5, 7],
    labelY: 8.2,
    banner: [-4.2, -3.0],
    door: [0, 3.9],
    tree: { id: "project", at: [-20.2, 18.8] },
    props: [
      { kind: "planTable", at: [2.2, 5.0], rot: 0.2 },
      { kind: "beamStack", at: [-2.6, 5.2], rot: 0.1 },
      { kind: "safetyCone", at: [3.8, 3.6] },
      { kind: "crate", at: [-4.2, 4.4], rot: 0.5 },
      { kind: "barrel", at: [-4.0, 5.8] },
    ],
    actors: [
      {
        role: "Builder hammering the frame",
        look: { shirt: "#e15a1c", pants: "#2b2f44", skin: skin(3), hat: "hardhat", hatColor: "#f2c230" },
        at: [-1.4, 3.4],
        loop: [
          { act: "hammer", dur: [3, 5], item: "hammer", face: [-1.4, 2.2] },
          { act: "idle", dur: [0.6, 1.2] },
          { act: "hammer", dur: [2, 4], item: "hammer", face: [-1.4, 2.2] },
        ],
      },
      {
        role: "Builder carrying beams",
        look: { shirt: "#c9841a", pants: "#3a3024", skin: skin(1), hat: "hardhat", hatColor: "#f2c230" },
        at: [-2.6, 6.0],
        loop: [
          { act: "idle", dur: [0.5, 1], face: [-2.6, 5.2] },
          { go: [0.8, 3.4], item: "crate" },
          { act: "hammer", dur: [1, 2], face: [0.8, 2.2] },
          { go: [-2.6, 6.0] },
        ],
      },
      {
        role: "Project lead pointing at the plan",
        look: { shirt: "#1a2744", pants: "#2b2f44", skin: skin(0), hat: "hardhat", hatColor: "#fffaf3" },
        at: [2.2, 5.8],
        loop: [
          { act: "point", dur: [2, 3], face: [2.2, 5.0] },
          { act: "talk", dur: [2, 4], face: [3.2, 6.2] },
          { act: "point", dur: [1.5, 2.5], face: [0, 2.0] },
        ],
      },
      {
        role: "Foreman listening",
        look: { shirt: "#e0a84a", pants: "#1a2744", skin: skin(4), hat: "hardhat", hatColor: "#f2c230" },
        at: [3.2, 6.2],
        extra: true,
        loop: [
          { act: "idle", dur: [2, 3], face: [2.2, 5.8] },
          { act: "talk", dur: [2, 3], face: [2.2, 5.8] },
        ],
      },
    ],
    movers: [],
  },
];

/**
 * Road network. Doors are nodes named `door:<buildingId>`; the scene computes
 * travel and route paths along these edges once at load.
 */
export const roadNodes: Record<string, Vec2> = {
  bw: [-5.4, 1],
  be: [5.4, 1],
  w1: [-9.2, 1.4],
  w6: [-9.8, -2.2],
  w2: [-10, -5.6],
  w3: [-17.5, -7.4],
  w4: [-8.8, 8.8],
  w5: [-13, 16.2],
  e1: [8.8, 1.4],
  e2: [11, -2.6],
  e3: [19, -5.4],
  e4: [15.6, 1.4],
  e8: [15.7, 9.6],
  e6: [15.8, 11.2],
};

export const roadEdges: Array<[string, string]> = [
  ["bw", "be"],
  ["w1", "bw"],
  ["w1", "w6"],
  ["w6", "w2"],
  ["w6", "door:procurement"],
  ["w2", "door:finance"],
  ["w2", "w3"],
  ["w3", "door:rnd"],
  ["w1", "w4"],
  ["w4", "door:supply"],
  ["w4", "w5"],
  ["w5", "door:project"],
  ["be", "e1"],
  ["e1", "e2"],
  ["e2", "door:asset"],
  ["e2", "e3"],
  ["e3", "door:hr"],
  ["e1", "e4"],
  ["e4", "door:manufacturing"],
  ["e4", "e8"],
  ["e8", "door:sales"],
  ["e8", "e6"],
  ["e6", "door:service"],
];

/** Villagers and carts travelling between buildings along the roads. */
export type Traveler = {
  from: string;
  to: string;
  item?: Item;
  vehicle?: "handcart" | "wagon";
  look: Look;
  extra?: boolean;
};

export const travelers: Traveler[] = [
  {
    from: "procurement",
    to: "supply",
    vehicle: "handcart",
    look: { shirt: "#c9841a", pants: "#3a3024", skin: skin(2), hat: "cap", hatColor: "#5a3a1f" },
  },
  {
    from: "supply",
    to: "manufacturing",
    vehicle: "wagon",
    look: { shirt: "#0e7c8a", pants: "#2b2f44", skin: skin(0), hat: "hardhat", hatColor: "#f2c230" },
  },
  {
    from: "manufacturing",
    to: "sales",
    item: "parcel",
    look: { shirt: "#e15a1c", pants: "#2b2f44", skin: skin(4), hat: "hardhat", hatColor: "#f2c230" },
  },
  {
    from: "sales",
    to: "finance",
    item: "coinBag",
    look: { shirt: "#d94b62", pants: "#1a2744", skin: skin(1), hat: "none" },
  },
  {
    from: "hr",
    to: "project",
    item: "scroll",
    look: { shirt: "#c65b3a", pants: "#3a3024", skin: skin(3), hat: "bun", hatColor: "#3a2616" },
    extra: true,
  },
  {
    from: "rnd",
    to: "manufacturing",
    item: "scroll",
    look: { shirt: "#3d4ec4", pants: "#2b2f44", skin: skin(5), hat: "cap", hatColor: "#e8e2d0" },
    extra: true,
  },
  {
    from: "service",
    to: "asset",
    item: "toolbox",
    look: { shirt: "#3d6bdb", pants: "#1a2744", skin: skin(2), hat: "cap", hatColor: "#3d6bdb" },
    extra: true,
  },
];

/** The river runs north to south through the middle; the bridge crosses at z = 1. */
export const RIVER = {
  width: 6.4,
  bridgeZ: 1,
  centerX: (z: number) => 1.1 * Math.sin(z * 0.16 + 0.4),
} as const;

export const GROUND = { halfW: 46, halfD: 34 } as const;

export function villageBuildingById(id: string): VillageBuilding | undefined {
  return villageBuildings.find((b) => b.id === id);
}
