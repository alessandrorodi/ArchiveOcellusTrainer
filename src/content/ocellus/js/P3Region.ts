import { InvisibleMovementBlocker, Region } from "osrs-sdk";
import type { Player } from "osrs-sdk";
import type { P3Config } from "./OcellusTimings";
import { OCELLUS_P3, OCELLUS_P4 } from "./OcellusTimings";
import { dress, loadoutSnapshot } from "./OcellusLoadout";
import { OcellusPlayer } from "./OcellusPlayer";
import type { Tile } from "../../../sim/brands";
import { tile } from "../../../sim/brands";
import type { BossMove, P3Event, P3HitSource, P3Log, P3Snapshot } from "./P3Types";
import { P3Marks } from "./entities/P3Marks";
import { OcellusP3 } from "./mobs/OcellusP3";
import { ARENA_SIZE, FLOOR, QUADRANT_1_FLOOR, RIM, footprint } from "./p3/arena";

const LETHAL_HIT: Readonly<Record<P3HitSource, string>> = {
  swing: "a swing",
  panic: "a panic shot",
  "shadow-slash": "a shadow slash",
  saw: "a saw of the spin",
  "untether-magic": "Untether's magic",
  "untether-slam": "Untether's slam",
  "untether-aftershock": "Untether's aftershock",
  "superior-slash": "a superior slash",
};

const { bossPoses, spin, shoutLasts } = OCELLUS_P3;
const MOVE_POSE: Readonly<Record<BossMove, number>> = {
  swing: bossPoses.swing.value,
  panic: bossPoses.panic.value,
  "shadow-slash": bossPoses.shadowSlash.value,
  spin: bossPoses.spinStarts.value,
  saw: bossPoses.spinLoops.value,
  "last-saw": bossPoses.spinEnds.value,
  untether: bossPoses.untetherStarts.value,
  slam: bossPoses.slam.value,
  "superior-slash": bossPoses.superiorSlash.value,
  "quadrant-falls": bossPoses.quadrantFalls.value,
};
const OPEN_FLOOR = ["#4a4339", "#3f392f"] as const;
const CLOSED_FLOOR = ["#2c2822", "#25221d"] as const;

type Views = Readonly<{ boss: OcellusP3; marks: P3Marks; chat: string[] }>;
type Mounted = Readonly<{ kind: "unmounted" }> | (Readonly<{ kind: "mounted"; player: OcellusPlayer }> & Views);

function present(event: P3Event, { boss, marks, chat }: Views): void {
  switch (event.kind) {
    case "boss-moved":
      boss.playAnimation(MOVE_POSE[event.move]);
      return;
    case "boss-shouted":
      boss.setOverheadText(event.text);
      boss.overheadTextTimer = shoutLasts.value;
      return;
    case "band-aimed":
      marks.aim(event.attack, event.tiles, event.landsAt);
      return;
    case "prayer-severed":
      chat.push(...spin.severChat.value);
      return;
    case "death-prevented":
      chat.push(`Invincible: ${LETHAL_HIT[event.source]} would have killed you on tick ${event.at}.`);
      return;
    case "run-ended":
      marks.clear();
      return;
    case "stage-entered":
    case "player-hit":
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

  constructor(private readonly config: P3Config) {
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
    const player: OcellusPlayer = new OcellusPlayer(this, { ...OCELLUS_P3.arena.playerSpawn.value }, () => boss.binding, (target) => target === boss && boss.levitating());
    const boss: OcellusP3 = new OcellusP3(this, this.config, player, () => this.invincible);
    const marks = new P3Marks(this);
    dress(player, this.config.choices.setup.option.value);
    for (const edge of QUADRANT_1_FLOOR.surround().tiles()) this.addEntity(new InvisibleMovementBlocker(this, { ...edge }));
    this.addEntity(marks);
    this.addPlayer(player);
    this.addMob(boss);
    this.setBoss(boss);
    this.mounted = { kind: "mounted", boss, player, marks, chat: [] };
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
    const views = this.mounted;
    if (views.kind === "unmounted") return;
    const row = views.boss.binding.finishTick();
    if (!row) return;
    const zone: readonly Tile[] = row.phase.boss === "levitating" ? footprint(tile(views.boss.location.x, views.boss.location.y)).tiles() : [];
    views.marks.settle(row.tick, zone);
    row.events.forEach((event) => present(event, views));
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
