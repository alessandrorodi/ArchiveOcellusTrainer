import { CacheRenderModel, CacheRenderReferences, Mob } from "osrs-sdk";
import type { Model, Region, UnitBonuses } from "osrs-sdk";
import { OCELLUS_P3 } from "../OcellusTimings";
import type { Tile } from "../../../../sim/brands";

const VINE = OCELLUS_P3.vine;

/** The vine that roots the player on their own tile. It never attacks; solo, the player cuts it. */
export class VoidVine extends Mob {
  constructor(region: Region, at: Tile) {
    super(region, { x: at.x, y: at.y });
  }

  /** Unit's constructor calls setStats before subclass fields exist, so the stats come from module data. */
  override setStats(): void {
    this.stats = { ...VINE.stats.value };
    this.currentStats = { ...VINE.stats.value };
  }

  override mobName(): string {
    return VINE.name.value;
  }

  override get combatLevel(): number {
    return VINE.combatLevel.value;
  }

  override get size(): number {
    return 1;
  }

  override get bonuses(): UnitBonuses {
    return {
      attack: { stab: 0, slash: 0, crush: 0, magic: 0, range: 0 },
      defence: { stab: 0, slash: 0, crush: 0, magic: 0, range: 0 },
      other: { meleeStrength: 0, rangedStrength: 0, magicDamage: 0, prayer: 0 },
    };
  }

  /** Still standing: not yet brought to 0 by the player's hits. */
  standing(): boolean {
    return this.currentStats.hitpoint > 0 && !this.isDying();
  }

  override movementStep(): void {}

  override attackIfPossible(): void {}

  override create3dModel(): Model {
    return CacheRenderModel.forRenderable(this, CacheRenderReferences.npc(VINE.npcId.value));
  }
}
