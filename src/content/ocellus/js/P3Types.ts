import type { Seed, Tick, TickSpan, Tile, WorldTick } from "../../../sim/brands";
import type { HitReceipt } from "../../../sim/combat";
import type { P3Choices } from "./OcellusTimings";
import type { InputObservation, LoadoutSnapshot, PlayerObservation } from "./P4Types";

export type Quadrant = 1 | 2 | 3;
export type ReachRule = "melee-range" | "within-two";
export type P3Special = "spin" | "untether" | "insolence";

/** A set is two swings and a shadow slash; a panic shot takes a swing's place. Each move's stage lasts until his next move. */
export type P3Stage = "arrive" | "swing" | "panic" | "shadow-slash" | "spin" | "untether" | "untether-ends" | "insolence" | "destroy";
/** What he does on the tick after this one: walk after the player, stand through the spin's cuts, or hover in his corner through Untether. */
export type BossStance = "chasing" | "standing" | "levitating";
export type P3Phase = Readonly<{ stage: P3Stage; boss: BossStance }>;

export type P3Beat =
  | Readonly<{ kind: "swing" }>
  | Readonly<{ kind: "panic" }>
  | Readonly<{ kind: "shadow-slash" }>
  | Readonly<{ kind: "spin-starts" }>
  | Readonly<{ kind: "saw-tell"; saw: number }>
  | Readonly<{ kind: "saw-cut"; saw: number; last: boolean }>
  | Readonly<{ kind: "untether-starts" }>
  | Readonly<{ kind: "untether-magic" }>
  | Readonly<{ kind: "untether-slam" }>
  | Readonly<{ kind: "untether-aftershock" }>
  | Readonly<{ kind: "insolence-starts" }>
  | Readonly<{ kind: "superior-slash"; nth: number }>
  | Readonly<{ kind: "quadrant-falls" }>;

export type P3Hit =
  | Readonly<{ kind: "swing"; at: Tick }>
  | Readonly<{ kind: "panic"; at: Tick }>
  | Readonly<{ kind: "shadow-slash"; at: Tick }>
  | Readonly<{ kind: "saw"; at: Tick; saw: number }>
  | Readonly<{ kind: "untether-magic"; at: Tick }>
  | Readonly<{ kind: "untether-slam"; at: Tick }>
  | Readonly<{ kind: "untether-aftershock"; at: Tick }>
  | Readonly<{ kind: "superior-slash"; at: Tick; nth: number }>;
export type P3HitSource = P3Hit["kind"];

export type BossMove = "swing" | "panic" | "shadow-slash" | "spin" | "saw" | "last-saw" | "untether" | "slam" | "superior-slash" | "quadrant-falls";
export type BandAttack = "shadow-slash" | "superior-slash";

export type P3End = Readonly<{ kind: "quadrant-cleared" }> | Readonly<{ kind: "death" }>;

export type P3Event =
  | Readonly<{ kind: "stage-entered"; at: Tick; stage: P3Stage }>
  | Readonly<{ kind: "boss-moved"; at: Tick; move: BossMove }>
  | Readonly<{ kind: "boss-shouted"; at: Tick; text: string }>
  | Readonly<{ kind: "band-aimed"; at: Tick; attack: BandAttack; tiles: readonly Tile[]; landsAt: Tick }>
  | Readonly<{ kind: "prayer-severed"; at: Tick; lockedFor: TickSpan }>
  | Readonly<{ kind: "player-hit"; at: Tick; hit: P3Hit; receipt: HitReceipt }>
  | Readonly<{ kind: "death-prevented"; at: Tick; source: P3HitSource }>
  | Readonly<{ kind: "run-ended"; at: Tick; reason: P3End }>;

export type P3Row = Readonly<{
  tick: Tick;
  worldTick: WorldTick;
  phase: P3Phase;
  beats: readonly P3Beat[];
  playerAtBossStep: PlayerObservation;
  playerAtPostTick: PlayerObservation;
  bossHp: Readonly<{ atBossStep: number; atPostTick: number }>;
  combatDraws: number;
  inputs: readonly InputObservation[];
  events: readonly P3Event[];
}>;

export type P3RunState =
  | Readonly<{ kind: "waiting" }>
  | Readonly<{ kind: "running"; tick: Tick; phase: P3Phase }>
  | Readonly<{ kind: "ended"; at: Tick; reason: P3End }>;

export type P3Snapshot = Readonly<{
  run: P3RunState;
  boss: Readonly<{ npcId: number; hp: number; maxHp: number; visible: boolean; defence: number }>;
  player: LoadoutSnapshot;
}>;

export type P3Log = Readonly<{ header: Readonly<{ phase: "p3"; seed: Seed; choices: P3Choices }>; rows: readonly P3Row[] }>;
