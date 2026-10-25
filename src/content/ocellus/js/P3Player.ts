import type { Location, MovePace, Region } from "osrs-sdk";
import type { MeleeGuard, PlayerHost } from "./OcellusPlayer";
import { OcellusPlayer } from "./OcellusPlayer";
import type { Tile } from "../../../sim/brands";
import { tile } from "../../../sim/brands";
import type { Wedge } from "./P3Types";
import { VoidVine } from "./mobs/VoidVine";
import type { Crossing } from "./p3/arena";
import { STONES, crossing, wedgeOf } from "./p3/arena";

type Hops = Readonly<{ bank: Tile; hops: readonly Tile[]; hopping: boolean }>;

const same = (a: Readonly<{ x: number; y: number }>, b: Readonly<{ x: number; y: number }>) => a.x === b.x && a.y === b.y;

/**
 * The player in phase 3. A click on a neighbouring standing wedge, or on a stone of the arm to it, walks to the bank beside the
 * near stone and then hops a tile a tick over the stones to the far bank; a click mid-hop is ignored. The vine roots the player
 * on its own tile, and the SDK, like the game, sees nothing on the tile it stands on, so solo they cut it from there.
 */
export class P3Player extends OcellusPlayer {
  private crossing: Hops | null = null;

  constructor(region: Region, location: Location, host: () => PlayerHost, meleeBlocked: MeleeGuard, private readonly standing: () => readonly Wedge[]) {
    super(region, location, host, meleeBlocked);
  }

  override moveTo(x: number, y: number, pace: MovePace = "run-setting"): void {
    if (this.crossing?.hopping) return;
    const plan = this.plan(tile(x, y));
    this.crossing = plan === null ? null : { ...plan, hopping: false };
    if (plan === null) super.moveTo(x, y, pace);
    else super.moveTo(plan.bank.x, plan.bank.y, pace);
  }

  override movementStep(): void {
    const crossing = this.crossing;
    if (crossing !== null && (crossing.hopping || same(this.location, crossing.bank))) {
      const [next, ...rest] = crossing.hops;
      this.crossing = rest.length === 0 ? null : { ...crossing, hops: rest, hopping: true };
      this.setLocation({ x: next.x, y: next.y });
      this.destinationLocation = { x: next.x, y: next.y };
    }
    super.movementStep();
  }

  override setHasLOS(): void {
    super.setHasLOS();
    const target = this.aggro;
    if (!this.hasLOS && target instanceof VoidVine && same(target.location, this.location)) this.hasLOS = true;
  }

  private plan(to: Tile): Crossing | null {
    const from = wedgeOf(tile(this.location.x, this.location.y));
    if (from === null) return null;
    const standing = this.standing();
    const onStone = STONES.some((stone) => same(stone, to));
    const target = onStone ? (standing.find((wedge) => wedge !== from && crossing(from, wedge)?.hops.some((hop) => same(hop, to))) ?? null) : wedgeOf(to);
    if (target === null || target === from || !standing.includes(target)) return null;
    return crossing(from, target);
  }
}
