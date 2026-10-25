import { CacheRenderModel, CacheRenderReferences, Collision, InvisibleMovementBlocker, Mob } from "osrs-sdk";
import type { Model, Projectile, Region, UnitBonuses } from "osrs-sdk";
import type { P3Config } from "../OcellusTimings";
import { OCELLUS_P3, OCELLUS_P4 } from "../OcellusTimings";
import type { OcellusPlayer } from "../OcellusPlayer";
import { bossBonuses, withDefenceFloor } from "../bossStats";
import type { Tick } from "../../../../sim/brands";
import { span, tick, tile } from "../../../../sim/brands";
import type { FrameOf, Heal, Hooks, Landed, Logged } from "../../../../sim/sdk/EncounterBinding";
import { EncounterBinding } from "../../../../sim/sdk/EncounterBinding";
import type { BossStance, P3End, P3Event, P3Hit, P3Phase, P3Row, P3RunState, Wedge } from "../P3Types";
import type { InputObservation, PlayerObservation, RiftId } from "../P4Types";
import type { P3Fight, Reach, TurnOutput, TurnStep } from "../p3/fight";
import { startFight, turn } from "../p3/fight";
import { WEDGES } from "../p3/arena";
import { VoidRift } from "./VoidRift";
import { VoidVine } from "./VoidVine";

type BossStep = Readonly<{ player: PlayerObservation; bossHp: number }>;
type P3Run = Readonly<{ input: InputObservation; event: P3Event; cause: P3Hit; snapshot: BossStep; row: P3Row; end: P3End }>;

const { boss, presentation } = OCELLUS_P4;
const WEDGE_LIST: readonly Wedge[] = [1, 2, 3, 4];
/** VoidRift draws its charge against phase 4's charge time; a phase 3 rift's bar fills over its own. */
const chargeBar = (charged: number) => span(Math.min(OCELLUS_P4.rifts.chargeAfterSpawn.value, Math.floor((charged * OCELLUS_P4.rifts.chargeAfterSpawn.value) / OCELLUS_P3.rifts.detonatesAfter.value)));

export class OcellusP3 extends Mob {
  readonly binding: EncounterBinding<P3Run>;
  private fight: P3Fight = startFight();
  /** What the last turn's phase has him do on this tick's step. */
  private stance: BossStance = "chasing";
  private readonly rifts = new Map<RiftId, Readonly<{ mob: VoidRift; spawnedAt: Tick }>>();
  private vine: VoidVine | null = null;

  private readonly hooks: Hooks<P3Run> = {
    "tick-opened": () => undefined,
    "before-npc-hits": () => ({ snapshot: { player: this.target.observe(), bossHp: this.currentStats.hitpoint }, outputs: [] }),
    "npc-turn": ({ time, snapshot, player }) => this.turn(time.encounter, snapshot, player.attackDelay),
    "hit-applied": ({ hit: { cause, receipt } }) => [{ kind: "player-hit", at: cause.at, hit: cause, receipt }],
    "player-hits-settled": ({ time, landed, player }) => this.settlePlayerHits(time.encounter, landed, player.maxHp),
    "player-moved": () => undefined,
    "tick-ended": (frame) => this.closeRow(frame),
  };

  constructor(region: Region, private readonly config: P3Config, private readonly target: OcellusPlayer, private readonly invincible: () => boolean) {
    super(region, OCELLUS_P3.arena.bossAnchor.value);
    this.setAggro(target);
    this.binding = new EncounterBinding(config.seed, tick(0), target, this.hooks);
  }

  enterP3(): void {
    const maxHp = this.config.choices.bossMaxHp.option.value;
    this.stats = { ...boss.stats.value, hitpoint: maxHp };
    const lowestDefence = Math.ceil((this.stats.defence * boss.lowestDefencePercent.value) / 100);
    this.currentStats = withDefenceFloor({ ...this.stats, hitpoint: this.config.bossEntryHp ?? maxHp }, lowestDefence);
  }

  /** The phase on `at`, read from the schedule of the quadrant he is in, which counts from his landing. */
  private phaseAt(at: Tick): P3Phase {
    return this.fight.schedule.at(tick(at - this.fight.landedAt)).phase;
  }

  private stanceNow(): BossStance | null {
    const run = this.binding.view();
    return run.kind === "running" ? this.phaseAt(run.at).boss : null;
  }

  /** He hovers out of melee reach through Untether. */
  levitating(): boolean {
    return this.stanceNow() === "levitating";
  }

  /** The wedges whose floor still stands, for the player's crossings. */
  standingWedges(): readonly Wedge[] {
    return WEDGE_LIST.filter((wedge) => !this.fight.gone.some((gone) => gone === wedge));
  }

  /** He is gone from 12 ticks into a quadrant's fall until he lands in the next. */
  override visible(): boolean {
    return this.stanceNow() !== "hidden" && super.visible();
  }

  override canBeAttacked(): boolean {
    return this.stanceNow() !== "hidden" && super.canBeAttacked();
  }

  override mobName(): string {
    return "Ocellus";
  }

  override get combatLevel(): number {
    return boss.combatLevel.value;
  }

  override get size(): number {
    return boss.size.value;
  }

  override get bonuses(): UnitBonuses {
    return bossBonuses();
  }

  /** The SDK stops a chasing mob once it has line of sight within its attack range. */
  override get attackRange(): number {
    return 1;
  }

  override get idlePoseId(): number {
    const run = this.binding.view();
    const stage = run.kind === "running" ? this.phaseAt(run.at).stage : null;
    if (stage === "destroy") return OCELLUS_P3.bossPoses.quadrantFallsLoop.value;
    return this.levitating() ? OCELLUS_P3.bossPoses.untetherLoops.value : presentation.bossPoses.idle.value;
  }

  override get walkingPoseId(): number {
    return presentation.bossPoses.walk.value;
  }

  override create3dModel(): Model {
    return CacheRenderModel.forRenderable(this, CacheRenderReferences.npc(boss.npcId.value));
  }

  override addProjectile(projectile: Projectile): void {
    super.addProjectile(projectile);
    this.binding.received(projectile);
  }

  override queueStep(): void {
    this.binding.npcTurn(this, () => this.stepBeforeDeciding());
  }

  private stepBeforeDeciding(): void {
    super.queueStep();
    if (this.binding.view().kind !== "ended" && this.stance === "chasing") super.movementStep();
  }

  override movementStep(): void {}

  override attackIfPossible(): void {}

  /** The SDK steps a mob at random off a player under it; Ocellus holds still instead. */
  override getNextMovementStep(): { dx: number; dy: number } {
    const under = this.aggro !== undefined && Collision.collisionMath(this.location.x, this.location.y, this.size, this.aggro.location.x, this.aggro.location.y, 1);
    return under ? { dx: this.location.x, dy: this.location.y } : super.getNextMovementStep();
  }

  runState(): P3RunState {
    const run = this.binding.view();
    switch (run.kind) {
      case "waiting":
        return { kind: "waiting" };
      case "running":
        return { kind: "running", tick: run.at, phase: this.phaseAt(run.at) };
      case "ended":
        return { kind: "ended", at: run.at, reason: run.reason };
      default: {
        const unhandled: never = run;
        return unhandled;
      }
    }
  }

  private reach(): Reach {
    const rule = this.config.choices.reach.option.value;
    switch (rule) {
      case "melee-range":
        return this.isWithinMeleeRange() ? "in-reach" : "out-of-reach";
      case "within-two": {
        const { x, y } = this.target.observe().tile;
        const across = Math.max(this.location.x - x, 0, x - (this.location.x + this.size - 1));
        const along = Math.max(this.location.y - this.size + 1 - y, 0, y - this.location.y);
        const gap = Math.max(across, along);
        return gap >= 1 && gap <= 2 ? "in-reach" : "out-of-reach";
      }
      default: {
        const unhandled: never = rule;
        return unhandled;
      }
    }
  }

  private turn(at: Tick, snapshot: BossStep, attackDelay: number): Pick<TurnStep, "outputs" | "ending"> {
    const cut = this.vineCut(at);
    const riftsAlive = [...this.rifts].filter(([, { mob }]) => mob.currentStats.hitpoint > 0 && !mob.isDying()).map(([id]) => id);
    const step = turn(this.config.seed, this.fight, {
      at,
      player: snapshot.player,
      boss: { hp: snapshot.bossHp, maxHp: this.stats.hitpoint, reach: this.reach(), anchor: tile(this.location.x, this.location.y) },
      riftsAlive,
      attackDelay,
    });
    this.fight = step.fight;
    this.stance = this.phaseAt(at).boss;
    step.outputs.forEach((output) => this.enact(output));
    this.rifts.forEach(({ mob, spawnedAt }) => mob.charge(chargeBar(at - spawnedAt)));
    if (this.vine !== null) this.target.freeze(2);
    return { outputs: [...cut, ...step.outputs], ending: step.ending };
  }

  /** A vine the player cut lets them go. */
  private vineCut(at: Tick): readonly Logged<P3Event>[] {
    if (this.vine === null || this.vine.standing()) return [];
    this.vine = null;
    this.target.frozen = 0;
    return [{ kind: "event", event: { kind: "vine-cut", at } }];
  }

  /** The SDK side of his moves: he rises from his corner for Untether, a severed prayer stays off, and the vine and rifts are units. */
  private enact(output: TurnOutput): void {
    if (output.kind !== "event") return;
    const { event } = output;
    switch (event.kind) {
      case "boss-moved":
        if (event.move === "untether") this.setLocation({ ...OCELLUS_P3.quadrants.corners.value[this.fight.quadrant] });
        return;
      case "boss-landed":
        this.setLocation({ ...event.corner });
        return;
      case "quadrant-gone":
        for (const at of WEDGES[event.quadrant].tiles()) this.region.addEntity(new InvisibleMovementBlocker(this.region, { ...at }));
        return;
      case "rift-removed":
        this.rifts.get(event.rift)?.mob.detonate();
        this.rifts.delete(event.rift);
        return;
      case "prayer-severed":
        this.target.prayerController.disableProtectionPrayersForTicks(event.lockedFor);
        return;
      case "vine-rooted": {
        const vine = new VoidVine(this.region, event.tile);
        this.region.addMob(vine);
        this.vine = vine;
        this.target.setAggro(vine);
        return;
      }
      case "rift-spawned": {
        const mob = new VoidRift(this.region, event.tile);
        this.region.addMob(mob);
        this.rifts.set(event.rift, { mob, spawnedAt: event.at });
        return;
      }
      case "rift-destroyed":
        this.rifts.delete(event.rift);
        return;
      case "rift-detonated":
        this.rifts.get(event.rift)?.mob.detonate();
        this.rifts.delete(event.rift);
        return;
      case "stage-entered":
      case "boss-shouted":
      case "band-aimed":
      case "hazard-shown":
      case "void-formed":
      case "vine-cut":
      case "quadrant-crumbling":
      case "player-hit":
      case "death-prevented":
      case "run-ended":
        return;
      default: {
        const unhandled: never = event;
        return unhandled;
      }
    }
  }

  private settlePlayerHits(at: Tick, landed: readonly Landed<P3Hit>[], maxHp: number): readonly (Logged<P3Event> | Heal)[] {
    const lethal = this.invincible() ? landed.find(({ receipt }) => receipt.beforeHp > 0 && receipt.afterHp === 0) : undefined;
    if (!lethal) return [];
    return [{ kind: "heal", amount: maxHp, limit: "max-hp" }, { kind: "event", event: { kind: "death-prevented", at, source: lethal.cause.kind } }];
  }

  private closeRow({ time, inputs, snapshot, events, combatDraws, ending }: FrameOf<P3Run, "tick-ended">): Readonly<{ row: P3Row; ending: P3End | null }> {
    const playerAtPostTick = this.target.observe();
    const died = ending === null && playerAtPostTick.hp <= 0;
    const death: P3End = { kind: "death" };
    const { phase, beats } = this.fight.schedule.at(tick(time.encounter - this.fight.landedAt));
    const row: P3Row = {
      tick: time.encounter,
      worldTick: time.world,
      phase,
      beats,
      playerAtBossStep: snapshot.player,
      playerAtPostTick,
      bossHp: { atBossStep: snapshot.bossHp, atPostTick: this.currentStats.hitpoint },
      combatDraws,
      inputs,
      events: died ? [...events, { kind: "run-ended", at: time.encounter, reason: death }] : events,
    };
    return { row, ending: ending ?? (died ? death : null) };
  }
}
