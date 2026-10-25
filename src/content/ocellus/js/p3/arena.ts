import { OCELLUS_P3, OCELLUS_P4 } from "../OcellusTimings";
import type { Tile } from "../../../../sim/brands";
import { tile } from "../../../../sim/brands";
import { TileSet } from "../../../../sim/tiles";
import type { Wedge } from "../P3Types";

const GLYPHS = ["1", "2", "3", "4", "+", "b", "B", "."] as const;
const { grid } = OCELLUS_P3.arena;
const BOSS_SIZE = OCELLUS_P4.boss.size.value;

export const ARENA_SIZE = { width: Math.max(...grid.value.map((row) => row.length)), height: grid.value.length };
export const FLOOR = TileSet.grid(grid.value, GLYPHS, "1", "2", "3", "4", "+");
export const RIM = TileSet.grid(grid.value, GLYPHS, "b", "B");
const CROSS = TileSet.grid(grid.value, GLYPHS, "+");
const WEDGE_LIST: readonly Wedge[] = [1, 2, 3, 4];
const GLYPH: Readonly<Record<Wedge, (typeof GLYPHS)[number]>> = { 1: "1", 2: "2", 3: "3", 4: "4" };

/** The Blade's tile, the middle of the cross: a quarter turn about it maps each wedge onto the next. */
const MIDDLE = tile(
  Math.round(CROSS.tiles().reduce((sum, { x }) => sum + x, 0) / CROSS.tiles().length),
  Math.round(CROSS.tiles().reduce((sum, { y }) => sum + y, 0) / CROSS.tiles().length),
);

const reachOf = (a: Tile, b: Tile) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

/** Each wedge's floor in phase 3: the grid's wedge less its inner corner, which the cross's chasm takes. */
function wedgeFloor(wedge: Wedge): TileSet {
  const all = TileSet.grid(grid.value, GLYPHS, GLYPH[wedge]);
  const nearest = Math.min(...all.tiles().map((at) => reachOf(at, MIDDLE)));
  return all.minus(TileSet.at(all.tiles().filter((at) => reachOf(at, MIDDLE) === nearest)));
}

export const WEDGES: Readonly<Record<Wedge, TileSet>> = { 1: wedgeFloor(1), 2: wedgeFloor(2), 3: wedgeFloor(3), 4: wedgeFloor(4) };
/** The cross and the wedges' inner corners: no floor in phase 3 but the stepping stones. */
export const CHASM = WEDGE_LIST.reduce((chasm, wedge) => chasm.minus(WEDGES[wedge]), FLOOR);

export function wedgeOf(at: Tile): Wedge | null {
  return WEDGE_LIST.find((wedge) => WEDGES[wedge].contains(at)) ?? null;
}

/** A tile turned a quarter at a time about the middle, counter-clockwise, from one wedge into the same spot of another. */
export function turnInto(at: Tile, from: Wedge, to: Wedge): Tile {
  const turns = (((to - from) % 4) + 4) % 4;
  let [dx, dy] = [at.x - MIDDLE.x, at.y - MIDDLE.y];
  for (let turn = 0; turn < turns; turn++) [dx, dy] = [dy, -dx];
  return tile(MIDDLE.x + dx, MIDDLE.y + dy);
}

type Arm = Readonly<{ between: readonly [Wedge, Wedge]; dx: number; dy: number }>;
/** The arm between each pair of neighbouring wedges, as a step out from the middle along it. */
const ARMS: readonly Arm[] = [
  { between: [1, 2], dx: 0, dy: -1 },
  { between: [2, 3], dx: -1, dy: 0 },
  { between: [3, 4], dx: 0, dy: 1 },
  { between: [4, 1], dx: 1, dy: 0 },
];

export const STONES: readonly Tile[] = ARMS.flatMap(({ dx, dy }) => OCELLUS_P3.quadrants.stones.value.map((out) => tile(MIDDLE.x + dx * out, MIDDLE.y + dy * out)));

/** The way over the arm between two neighbouring wedges: the bank beside the near stone, then a hop to each stone and to the far bank. */
export type Crossing = Readonly<{ bank: Tile; hops: readonly [Tile, ...Tile[]] }>;

export function crossing(from: Wedge, to: Wedge): Crossing | null {
  const arm = ARMS.find(({ between: [a, b] }) => (a === from && b === to) || (a === to && b === from));
  if (!arm) return null;
  const stones = OCELLUS_P3.quadrants.stones.value.map((out) => tile(MIDDLE.x + arm.dx * out, MIDDLE.y + arm.dy * out));
  const beside = (stone: Tile, wedge: Wedge): Tile => {
    const side = WEDGES[wedge].tiles()[0];
    const { x, y }: Readonly<{ x: number; y: number }> = stone;
    return arm.dx === 0 ? tile(x + 2 * Math.sign(side.x - MIDDLE.x), y) : tile(x, y + 2 * Math.sign(side.y - MIDDLE.y));
  };
  return { bank: beside(stones[0], from), hops: [stones[0], ...stones.slice(1), beside(stones[stones.length - 1], to)] };
}

/** The boss's 3x3 from its south-west tile; y runs south, so it covers anchor.y - 2 to anchor.y. */
export function footprint(anchor: Tile): TileSet {
  const { x, y }: Readonly<{ x: number; y: number }> = anchor;
  return TileSet.area(tile(x, y - BOSS_SIZE + 1), tile(x + BOSS_SIZE - 1, y));
}

/** Tiles from his 3x3 to `at`, counting diagonal steps as one; 0 under him. */
export function distanceFromBody(anchor: Tile, at: Tile): number {
  const across = Math.max(anchor.x - at.x, 0, at.x - (anchor.x + BOSS_SIZE - 1));
  const along = Math.max(anchor.y - BOSS_SIZE + 1 - at.y, 0, at.y - anchor.y);
  return Math.max(across, along);
}

function middle(anchor: Tile): Tile {
  const half = Math.floor(BOSS_SIZE / 2);
  return tile(anchor.x + half, anchor.y - half);
}

const byDistanceFrom = (from: Tile) => (a: Tile, b: Tile) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y);

/**
 * The shadow slash: `width` wide toward `target`, snapped to the nearest of the 8 directions from his middle tile, from the ring
 * touching his body to the wedge's edge. Straight, the tiles in line with his body; diagonal, the tiles out from his corner.
 * A target on his middle tile draws it north.
 */
export function shadowSlashBand(floor: TileSet, anchor: Tile, target: Tile, width: number): readonly Tile[] {
  const mid = middle(anchor);
  const body = footprint(anchor);
  const half = (width - 1) / 2;
  const reachOut = Math.floor(BOSS_SIZE / 2) + 1;
  const [tx, ty] = [target.x - mid.x, target.y - mid.y];
  const octant = tx === 0 && ty === 0 ? -2 : Math.round(Math.atan2(ty, tx) / (Math.PI / 4));
  const ux = Math.round(Math.cos((octant * Math.PI) / 4));
  const uy = Math.round(Math.sin((octant * Math.PI) / 4));
  const inBand = (at: Tile): boolean => {
    const [dx, dy] = [at.x - mid.x, at.y - mid.y];
    if (ux === 0) return Math.abs(dx) <= half && dy * uy >= reachOut;
    if (uy === 0) return Math.abs(dy) <= half && dx * ux >= reachOut;
    return dx * ux >= 1 && dy * uy >= 1 && Math.abs(dx * ux - dy * uy) <= half && !body.contains(at);
  };
  return floor.tiles().filter(inBand).sort(byDistanceFrom(mid));
}

/** A superior slash: `width` wide toward `target` at any angle, from just outside his body to the wedge's edge. */
export function superiorSlashBand(floor: TileSet, anchor: Tile, target: Tile, width: number): readonly Tile[] {
  const mid = middle(anchor);
  const [dx, dy] = [target.x - mid.x, target.y - mid.y];
  const length = Math.hypot(dx, dy);
  const [ux, uy] = length === 0 ? [0, -1] : [dx / length, dy / length];
  const clear = BOSS_SIZE / 2;
  const inBand = ({ x, y }: Tile): boolean => {
    const [rx, ry] = [x - mid.x, y - mid.y];
    return rx * ux + ry * uy >= clear && Math.abs(ry * ux - rx * uy) <= width / 2;
  };
  return floor.tiles().filter(inBand).sort(byDistanceFrom(mid));
}
