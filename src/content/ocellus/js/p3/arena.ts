import { OCELLUS_P3, OCELLUS_P4 } from "../OcellusTimings";
import type { Tile } from "../../../../sim/brands";
import { tile } from "../../../../sim/brands";
import { TileSet } from "../../../../sim/tiles";

const GLYPHS = ["1", "2", "3", "4", "+", "b", "B", "."] as const;
const { grid } = OCELLUS_P3.arena;
const BOSS_SIZE = OCELLUS_P4.boss.size.value;

export const ARENA_SIZE = { width: Math.max(...grid.value.map((row) => row.length)), height: grid.value.length };
export const FLOOR = TileSet.grid(grid.value, GLYPHS, "1", "2", "3", "4", "+");
export const RIM = TileSet.grid(grid.value, GLYPHS, "b", "B");
export const QUADRANT_1_FLOOR = TileSet.grid(grid.value, GLYPHS, "1");

/** The boss's 3x3 from its south-west tile; y runs south, so it covers anchor.y - 2 to anchor.y. */
export function footprint(anchor: Tile): TileSet {
  const { x, y }: Readonly<{ x: number; y: number }> = anchor;
  return TileSet.area(tile(x, y - BOSS_SIZE + 1), tile(x + BOSS_SIZE - 1, y));
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
export function shadowSlashBand(anchor: Tile, target: Tile, width: number): readonly Tile[] {
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
  return QUADRANT_1_FLOOR.tiles().filter(inBand).sort(byDistanceFrom(mid));
}

/** A superior slash: `width` wide toward `target` at any angle, from just outside his body to the wedge's edge. */
export function superiorSlashBand(anchor: Tile, target: Tile, width: number): readonly Tile[] {
  const mid = middle(anchor);
  const [dx, dy] = [target.x - mid.x, target.y - mid.y];
  const length = Math.hypot(dx, dy);
  const [ux, uy] = length === 0 ? [0, -1] : [dx / length, dy / length];
  const clear = BOSS_SIZE / 2;
  const inBand = ({ x, y }: Tile): boolean => {
    const [rx, ry] = [x - mid.x, y - mid.y];
    return rx * ux + ry * uy >= clear && Math.abs(ry * ux - rx * uy) <= width / 2;
  };
  return QUADRANT_1_FLOOR.tiles().filter(inBand).sort(byDistanceFrom(mid));
}
