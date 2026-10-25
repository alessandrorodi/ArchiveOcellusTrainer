import { InvisibleMovementBlocker, Region, Sound, SoundCache, cacheSound } from "osrs-sdk";
import type { Player } from "osrs-sdk";
import type { DrillConfig, Loadout } from "./OcellusTimings";
import { OCELLUS_P4 } from "./OcellusTimings";
import { dress, loadoutSnapshot } from "./OcellusLoadout";
import { OcellusPlayer } from "./OcellusPlayer";
import type { SoundId, Tile } from "../../../sim/brands";
import type { FightEvent, FightLog, FightSnapshot, PlayerHitSource, VoidKind } from "./P4Types";
import { ExplosionViews } from "./entities/ExplosionViews";
import { BossLook, FloorHole, FragmentFlash, OrbView, PlayerLook, VoidField } from "./entities/P4Views";
import { Brazier, Walkway } from "./entities/Scenery";
import { BossFootprint, Ocellus } from "./mobs/Ocellus";
import { BRAZIERS, CURB, PLATFORM, voidUnder } from "./p4/floor";

const GRID = PLATFORM.extent();

type Views = Readonly<{
  field: VoidField;
  holes: readonly FloorHole[];
  orbs: Readonly<Record<VoidKind, OrbView>>;
  fragment: FragmentFlash;
  explosions: ExplosionViews;
  boss: BossLook;
  player: PlayerLook;
  chat: string[];
}>;

const { sounds, soundPlayback } = OCELLUS_P4.presentation;

const LETHAL_HIT: Readonly<Record<PlayerHitSource, string>> = {
  "deflect-reflected": "a deflected hit's reflection",
  "floor-hit": "the void floor",
  "hole-hit": "a floor hole",
  "lifeforce-drained": "the lifeforce steal",
  "explosion-resolved": "an explosion",
  "special-hit": "a transition attack",
  "rift-burst": "a void rift burst",
};

function playCue(id: SoundId, at: Tile, delayMs = 0): void {
  const { volume, range, retain } = soundPlayback.value;
  SoundCache.play(new Sound(cacheSound(id), volume, delayMs, { location: at, range, retain }));
}

type Mounted =
  | Readonly<{ kind: "unmounted" }>
  | Readonly<{ kind: "mounted"; ocellus: Ocellus; player: OcellusPlayer; views: Views }>;

function present(event: FightEvent, views: Views, player: Tile): void {
  switch (event.kind) {
    case "lifeforce-told":
      views.fragment.tell(player);
      views.chat.push(OCELLUS_P4.lifeforce.tellChat.value);
      return;
    case "orb-spawned":
      views.orbs[event.void].spawn(event.void, event.tile);
      return;
    case "orb-matured":
      views.orbs[event.void].mature();
      return;
    case "orb-returned":
      views.orbs[event.void].leave();
      views.fragment.regain(player);
      return;
    case "orb-expired":
      views.orbs[event.void].leave();
      return;
    case "explosion-series-started":
      playCue(sounds.explosionSeriesStart.value, player);
      return;
    case "explosion-marked":
      views.explosions.mark(event.void, event.pulse, event.tile);
      playCue(sounds.explosionMark.value, player);
      return;
    case "explosion-resolved":
      views.explosions.detonate(event.void, event.pulse);
      return;
    case "stage-entered":
      views.boss.enter(event.stage);
      if (event.stage === "outer-void") playCue(sounds.flood.value, player);
      return;
    case "special-told":
      views.boss.tell(event.variant);
      return;
    case "special-sounded":
      playCue(sounds[event.cue.sound].value, player, event.cue.delayMs);
      return;
    case "boss-shouted":
      playCue(sounds.endShout.value, player);
      return;
    case "boss-landing-started":
      views.boss.land();
      return;
    case "rift-destroyed":
      views.chat.push(OCELLUS_P4.rifts.killChat.value);
      return;
    case "rift-burst":
      views.player.riftBurst();
      return;
    case "death-prevented":
      views.chat.push(`Invincible: ${LETHAL_HIT[event.source]} would have killed you on tick ${event.at}.`);
      return;
    case "run-ended":
      views.explosions.retire();
      return;
    case "overhead-switched":
    case "boss-state-changed":
    case "player-hit-judged":
    case "deflect-reflected":
    case "floor-hit":
    case "hole-hit":
    case "lifeforce-drained":
    case "boss-healed":
    case "special-hit":
    case "rift-spawned":
    case "rift-hit":
      return;
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}

export class OcellusRegion extends Region {
  private mounted: Mounted = { kind: "unmounted" };
  invincible = false;

  constructor(private readonly config: DrillConfig, private readonly loadout: Loadout) {
    super();
  }

  override getName(): string {
    return "Ocellus";
  }

  override get width(): number {
    return GRID.width;
  }

  override get height(): number {
    return GRID.height;
  }

  override drawWorldBackground(context: OffscreenCanvasRenderingContext2D, scale: number): void {
    const floor = ({ x, y }: Tile) => ((x + y) % 2 === 0 ? "#4a4339" : "#3f392f");
    const { top } = OCELLUS_P4.geometry.walkway.value;
    for (const at of PLATFORM.tiles()) {
      context.fillStyle = floor(at);
      context.fillRect(at.x * scale, at.y * scale, scale, scale);
    }
    for (const curb of CURB) {
      const { x, y } = curb.at;
      switch (curb.shape) {
        case "square":
          context.fillStyle = top;
          context.fillRect(x * scale, y * scale, scale, scale);
          break;
        case "diagonal": {
          context.fillStyle = floor(curb.at);
          context.fillRect(x * scale, y * scale, scale, scale);
          const [from, to] = curb.cut;
          context.fillStyle = top;
          context.beginPath();
          context.moveTo(from.x * scale, from.y * scale);
          context.lineTo(curb.wallCorner.x * scale, curb.wallCorner.y * scale);
          context.lineTo(to.x * scale, to.y * scale);
          context.closePath();
          context.fill();
          break;
        }
        default: {
          const unhandled: never = curb;
          return unhandled;
        }
      }
    }
  }

  initialiseRegion(): { player: Player } {
    const player: OcellusPlayer = new OcellusPlayer(
      this,
      { ...OCELLUS_P4.geometry.playerSpawn.value },
      () => ocellus.binding,
      (target) => target instanceof Ocellus && target.outOfMeleeReach(),
    );
    const ocellus: Ocellus = new Ocellus(this, this.config, player, () => this.invincible);
    dress(player, this.loadout);
    Object.values(sounds).forEach((sound) => SoundCache.preload(cacheSound(sound.value)));
    const views: Views = {
      field: new VoidField(this),
      holes: ocellus.holes.tiles().map((at) => new FloorHole(this, at)),
      orbs: { "inner-void": new OrbView(this), "outer-void": new OrbView(this) },
      fragment: new FragmentFlash(this),
      explosions: new ExplosionViews(this),
      boss: new BossLook(ocellus),
      player: new PlayerLook(player),
      chat: [],
    };
    [views.field, ...views.holes, views.orbs["inner-void"], views.orbs["outer-void"], views.fragment].forEach((view) => this.addEntity(view));
    [new Walkway(this), ...BRAZIERS.tiles().map((at) => new Brazier(this, at))].forEach((scenery) => this.addEntity(scenery));
    for (const edge of PLATFORM.surround().tiles()) this.addEntity(new InvisibleMovementBlocker(this, { ...edge }));
    this.addEntity(new BossFootprint(this, ocellus));
    this.addPlayer(player);
    this.addMob(ocellus);
    this.setBoss(ocellus);
    this.mounted = { kind: "mounted", ocellus, player, views };
    return { player };
  }

  /** Unit constructors and Region.reset's setStats pass write SDK default stats, so P4 entry is applied after both. */
  override reset(startWorld = true): { player: Player } {
    const result = super.reset(false);
    if (this.mounted.kind === "mounted") this.mounted.ocellus.enterP4();
    if (startWorld) this.world.startTicking();
    return result;
  }

  override beforeNpcTurns(): void {
    if (this.mounted.kind === "mounted") this.mounted.ocellus.binding.openTick();
  }

  override postTick(): void {
    if (this.mounted.kind === "unmounted") return;
    const row = this.mounted.ocellus.binding.finishTick();
    if (!row) return;
    const { views } = this.mounted;
    const floor = voidUnder(row.phase);
    views.field.show(floor);
    views.holes.forEach((hole) => hole.cover(floor));
    row.events.forEach((event) => present(event, views, row.playerAtPostTick.tile));
  }

  snapshot(): FightSnapshot | null {
    if (this.mounted.kind === "unmounted") return null;
    const { ocellus, player } = this.mounted;
    return {
      run: ocellus.runState(),
      boss: { npcId: OCELLUS_P4.boss.npcId.value, hp: ocellus.currentStats.hitpoint, maxHp: ocellus.stats.hitpoint, visible: ocellus.visible(), defence: ocellus.currentStats.defence },
      player: loadoutSnapshot(player),
    };
  }

  chat(): readonly string[] {
    return this.mounted.kind === "mounted" ? [...this.mounted.views.chat] : [];
  }

  fightLog(): FightLog {
    const rows = this.mounted.kind === "mounted" ? [...this.mounted.ocellus.binding.rows] : [];
    return { header: { seed: this.config.seed, choices: this.config.choices }, rows };
  }
}
