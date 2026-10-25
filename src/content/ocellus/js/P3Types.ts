import type { Seed, Tick, TickSpan, Tile, WorldTick } from "../../../sim/brands";
import type { HitReceipt } from "../../../sim/combat";
import type { P3Choices } from "./OcellusTimings";
import type { InputObservation, LoadoutSnapshot, PlayerObservation, RiftId } from "./P4Types";

/** The quadrants he fights phase 3 in, in the order he takes them; each is the wedge of the same number. */
export type Quadrant = 1 | 2 | 3;
/** The arena's four wedges, counter-clockwise from the north-east; phase 4 is fought on wedge 4. */
export type Wedge = Quadrant | 4;
export type ReachRule = "melee-range" | "within-two";
export type P3Special = "spin" | "untether" | "insolence";

/** A set is two swings and a shadow slash; a panic shot takes a swing's place. Each move's stage lasts until his next move. */
export type P3Stage = "arrive" | "swing" | "panic" | "shadow-slash" | "spin" | "untether" | "untether-ends" | "insolence" | "destroy";
/** What he does on the tick after this one: walk after the player, stand through the spin's cuts, hover in his corner through Untether, or be gone between quadrants. */
export type BossStance = "chasing" | "standing" | "levitating" | "hidden";
export type P3Phase = Readonly<{ stage: P3Stage; boss: BossStance; quadrant: Quadrant }>;

export type P3Beat =
  | Readonly<{ kind: "swing" }>
  | Readonly<{ kind: "panic" }>
  | Readonly<{ kind: "shadow-slash" }>
  | Readonly<{ kind: "spin-starts" }>
  | Readonly<{ kind: "saw-tell"; saw: number }>
  | Readonly<{ kind: "saw-cut"; saw: number; last: boolean }>
  | Readonly<{ kind: "rubble-shows" }>
  | Readonly<{ kind: "untether-starts" }>
  | Readonly<{ kind: "untether-magic" }>
  | Readonly<{ kind: "untether-slam" }>
  | Readonly<{ kind: "untether-aftershock" }>
  | Readonly<{ kind: "insolence-starts" }>
  | Readonly<{ kind: "superior-slash"; nth: number }>
  | Readonly<{ kind: "quadrant-falls" }>
  | Readonly<{ kind: "escape-shout" }>
  | Readonly<{ kind: "quadrant-gone" }>;

export type P3Hit =
  | Readonly<{ kind: "swing"; at: Tick }>
  | Readonly<{ kind: "panic"; at: Tick }>
  | Readonly<{ kind: "shadow-slash"; at: Tick }>
  | Readonly<{ kind: "saw"; at: Tick; saw: number }>
  | Readonly<{ kind: "untether-magic"; at: Tick }>
  | Readonly<{ kind: "untether-slam"; at: Tick }>
  | Readonly<{ kind: "untether-aftershock"; at: Tick }>
  | Readonly<{ kind: "superior-slash"; at: Tick; nth: number }>
  | Readonly<{ kind: "bomb"; at: Tick }>
  | Readonly<{ kind: "void"; at: Tick }>
  | Readonly<{ kind: "rubble"; at: Tick }>
  | Readonly<{ kind: "rift-detonation"; at: Tick; rift: RiftId }>
  | Readonly<{ kind: "quadrant-gone"; at: Tick }>;
export type P3HitSource = P3Hit["kind"];

export type BossMove = "swing" | "panic" | "shadow-slash" | "spin" | "saw" | "last-saw" | "untether" | "slam" | "superior-slash" | "quadrant-falls" | "escape";
export type BandAttack = "shadow-slash" | "superior-slash";
/** Falls on the tile it shows over, a fixed time later. */
export type Hazard = "bomb" | "rubble";

export type P3End = Readonly<{ kind: "phase-cleared" }> | Readonly<{ kind: "death" }>;

export type P3Event =
  | Readonly<{ kind: "stage-entered"; at: Tick; stage: P3Stage }>
  | Readonly<{ kind: "boss-moved"; at: Tick; move: BossMove }>
  | Readonly<{ kind: "boss-shouted"; at: Tick; text: string }>
  | Readonly<{ kind: "band-aimed"; at: Tick; attack: BandAttack; tiles: readonly Tile[]; landsAt: Tick }>
  | Readonly<{ kind: "prayer-severed"; at: Tick; lockedFor: TickSpan }>
  | Readonly<{ kind: "hazard-shown"; at: Tick; hazard: Hazard; tile: Tile; landsAt: Tick }>
  | Readonly<{ kind: "void-formed"; at: Tick; tile: Tile }>
  | Readonly<{ kind: "vine-rooted"; at: Tick; tile: Tile }>
  | Readonly<{ kind: "vine-cut"; at: Tick }>
  | Readonly<{ kind: "rift-spawned"; at: Tick; rift: RiftId; tile: Tile }>
  | Readonly<{ kind: "rift-destroyed"; at: Tick; rift: RiftId; tile: Tile }>
  | Readonly<{ kind: "rift-detonated"; at: Tick; rift: RiftId; tile: Tile }>
  | Readonly<{ kind: "rift-removed"; at: Tick; rift: RiftId }>
  | Readonly<{ kind: "quadrant-crumbling"; at: Tick; quadrant: Quadrant }>
  | Readonly<{ kind: "quadrant-gone"; at: Tick; quadrant: Quadrant }>
  | Readonly<{ kind: "boss-landed"; at: Tick; quadrant: Quadrant; corner: Tile }>
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
