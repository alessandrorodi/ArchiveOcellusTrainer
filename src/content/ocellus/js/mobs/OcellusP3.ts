import { CacheRenderModel, CacheRenderReferences, Collision, Mob } from "osrs-sdk";
import type { Model, Projectile, Region, UnitBonuses } from "osrs-sdk";
import type { P3Config } from "../OcellusTimings";
import { OCELLUS_P3, OCELLUS_P4 } from "../OcellusTimings";
import type { OcellusPlayer } from "../OcellusPlayer";
import { bossBonuses, withDefenceFloor } from "../bossStats";
import type { Tick } from "../../../../sim/brands";
import { tick } from "../../../../sim/brands";
import type { FrameOf, Heal, Hooks, Landed, Logged } from "../../../../sim/sdk/EncounterBinding";
import { EncounterBinding } from "../../../../sim/sdk/EncounterBinding";
import type { P3End, P3Event, P3Hit, P3Row, P3RunState } from "../P3Types";
import type { InputObservation, PlayerObservation } from "../P4Types";
import type { P3Fight, P3Rules, Reach, TurnStep } from "../p3/fight";
import { startFight, turn } from "../p3/fight";

type BossStep = Readonly<{ player: PlayerObservation; bossHp: number }>;
type P3Run = Readonly<{ input: InputObservation; event: P3Event; cause: P3Hit; snapshot: BossStep; row: P3Row; end: P3End }>;

const { boss, presentation } = OCELLUS_P4;

export class OcellusP3 extends Mob {
  readonly binding: EncounterBinding<P3Run>;
  private readonly rules: P3Rules;
  private fight: P3Fight;

  private readonly hooks: Hooks<P3Run> = {
    "tick-opened": () => undefined,
    "before-npc-hits": () => ({ snapshot: { player: this.target.observe(), bossHp: this.currentStats.hitpoint }, outputs: [] }),
    "npc-turn": ({ time }) => this.turn(time.encounter),
    "hit-applied": ({ hit: { cause, receipt } }) => [{ kind: "player-hit", at: cause.at, hit: cause, receipt }],
    "player-hits-settled": ({ time, landed, player }) => this.settlePlayerHits(time.encounter, landed, player.maxHp),
    "player-moved": () => undefined,
    "tick-ended": (frame) => this.closeRow(frame),
  };

  constructor(region: Region, private readonly config: P3Config, private readonly target: OcellusPlayer, private readonly invincible: () => boolean) {
    super(region, OCELLUS_P3.arena.bossAnchor.value);
    this.setAggro(target);
    const { choices } = config;
    this.rules = { seed: config.seed, start: choices.start.option.value, flick: choices.flick.option.value, missedFlickDamage: choices.missedFlickDamage.option.value };
    this.fight = startFight(this.rules);
    this.binding = new EncounterBinding(config.seed, tick(0), target, this.hooks);
  }

  enterP3(): void {
    const maxHp = this.config.choices.bossMaxHp.option.value;
    this.stats = { ...boss.stats.value, hitpoint: maxHp };
    const lowestDefence = Math.ceil((this.stats.defence * boss.lowestDefencePercent.value) / 100);
    this.currentStats = withDefenceFloor({ ...this.stats, hitpoint: this.config.bossEntryHp ?? maxHp }, lowestDefence);
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
    return presentation.bossPoses.idle.value;
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
    if (this.binding.view().kind !== "ended") super.movementStep();
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
        return { kind: "running", tick: run.at, phase: this.fight.schedule.at(run.at).phase };
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

  private turn(at: Tick): Pick<TurnStep, "outputs" | "ending"> {
    const step = turn(this.rules, this.fight, {
      at,
      player: this.target.observe(),
      boss: { hp: this.currentStats.hitpoint, maxHp: this.stats.hitpoint, reach: this.reach() },
    });
    this.fight = step.fight;
    return { outputs: step.outputs, ending: step.ending };
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
    const { phase, beats } = this.fight.schedule.at(time.encounter);
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
