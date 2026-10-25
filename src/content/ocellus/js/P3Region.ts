import { InvisibleMovementBlocker, Region } from "osrs-sdk";
import type { Player } from "osrs-sdk";
import type { P3Config, Loadout } from "./OcellusTimings";
import { OCELLUS_P3, OCELLUS_P4 } from "./OcellusTimings";
import { dress, loadoutSnapshot } from "./OcellusLoadout";
import { OcellusPlayer } from "./OcellusPlayer";
import type { Tile } from "../../../sim/brands";
import type { P3Event, P3HitSource, P3Log, P3Snapshot } from "./P3Types";
import { OcellusP3 } from "./mobs/OcellusP3";
import { ARENA_SIZE, FLOOR, QUADRANT_1_FLOOR, RIM } from "./p3/arena";

const LETHAL_HIT: Readonly<Record<P3HitSource, string>> = {
  swing: "a swing",
  "void-shot": "a void shot",
};

const { bossPoses } = OCELLUS_P3;
const OPEN_FLOOR = ["#4a4339", "#3f392f"] as const;
const CLOSED_FLOOR = ["#2c2822", "#25221d"] as const;

type Mounted = Readonly<{ kind: "unmounted" }> | Readonly<{ kind: "mounted"; boss: OcellusP3; player: OcellusPlayer; chat: string[] }>;

function present(event: P3Event, boss: OcellusP3, chat: string[]): void {
  switch (event.kind) {
    case "player-hit":
      boss.playAnimation((event.hit.kind === "swing" ? bossPoses.swing : bossPoses.voidShot).value);
      return;
    case "wave-cast":
      boss.playAnimation(bossPoses.wave.value);
      return;
    case "death-prevented":
      chat.push(`Invincible: ${LETHAL_HIT[event.source]} would have killed you on tick ${event.at}.`);
      return;
    case "stage-entered":
    case "run-ended":
      return;
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}

export class P3Region extends Region {
  private mounted: Mounted = { kind: "unmounted" };
  invincible = false;

  constructor(private readonly config: P3Config, private readonly loadout: Loadout) {
    super();
  }

  override getName(): string {
    return "Ocellus";
  }

  override get width(): number {
    return ARENA_SIZE.width;
  }

  override get height(): number {
    return ARENA_SIZE.height;
  }

  override drawWorldBackground(context: OffscreenCanvasRenderingContext2D, scale: number): void {
    const paint = (at: Tile, colour: string) => {
      context.fillStyle = colour;
      context.fillRect(at.x * scale, at.y * scale, scale, scale);
    };
    const checker = (at: Tile) => (at.x + at.y) % 2 === 0;
    FLOOR.tiles().forEach((at) => paint(at, QUADRANT_1_FLOOR.contains(at) ? (checker(at) ? OPEN_FLOOR[0] : OPEN_FLOOR[1]) : checker(at) ? CLOSED_FLOOR[0] : CLOSED_FLOOR[1]));
    RIM.tiles().forEach((at) => paint(at, OCELLUS_P4.geometry.walkway.value.top));
  }

  initialiseRegion(): { player: Player } {
    const player: OcellusPlayer = new OcellusPlayer(this, { ...OCELLUS_P3.arena.playerSpawn.value }, () => boss.binding, () => false);
    const boss: OcellusP3 = new OcellusP3(this, this.config, player, () => this.invincible);
    dress(player, this.loadout);
    for (const edge of QUADRANT_1_FLOOR.surround().tiles()) this.addEntity(new InvisibleMovementBlocker(this, { ...edge }));
    this.addPlayer(player);
    this.addMob(boss);
    this.setBoss(boss);
    this.mounted = { kind: "mounted", boss, player, chat: [] };
    return { player };
  }

  /** Unit constructors and Region.reset's setStats pass write SDK default stats, so P3 entry is applied after both. */
  override reset(startWorld = true): { player: Player } {
    const result = super.reset(false);
    if (this.mounted.kind === "mounted") this.mounted.boss.enterP3();
    if (startWorld) this.world.startTicking();
    return result;
  }

  override beforeNpcTurns(): void {
    if (this.mounted.kind === "mounted") this.mounted.boss.binding.openTick();
  }

  override postTick(): void {
    if (this.mounted.kind === "unmounted") return;
    const { boss, chat } = this.mounted;
    boss.binding.finishTick()?.events.forEach((event) => present(event, boss, chat));
  }

  snapshot(): P3Snapshot | null {
    if (this.mounted.kind === "unmounted") return null;
    const { boss, player } = this.mounted;
    return {
      run: boss.runState(),
      boss: { npcId: OCELLUS_P4.boss.npcId.value, hp: boss.currentStats.hitpoint, maxHp: boss.stats.hitpoint, visible: boss.visible(), defence: boss.currentStats.defence },
      player: loadoutSnapshot(player),
    };
  }

  chat(): readonly string[] {
    return this.mounted.kind === "mounted" ? [...this.mounted.chat] : [];
  }

  fightLog(): P3Log {
    const rows = this.mounted.kind === "mounted" ? [...this.mounted.boss.binding.rows] : [];
    return { header: { phase: "p3", seed: this.config.seed, choices: this.config.choices }, rows };
  }
}
