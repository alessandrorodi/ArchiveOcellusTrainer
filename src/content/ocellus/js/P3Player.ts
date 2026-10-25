import { OcellusPlayer } from "./OcellusPlayer";
import { VoidVine } from "./mobs/VoidVine";

/** The vine roots the player on its own tile, and the SDK, like the game, sees nothing on the tile it stands on; solo, the player cuts their own vine from there. */
export class P3Player extends OcellusPlayer {
  override setHasLOS(): void {
    super.setHasLOS();
    const target = this.aggro;
    if (!this.hasLOS && target instanceof VoidVine && target.location.x === this.location.x && target.location.y === this.location.y) this.hasLOS = true;
  }
}
