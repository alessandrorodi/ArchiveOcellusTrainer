import type { Seed, Tick, Tile, WorldTick } from "../../../sim/brands";
import type { HitReceipt } from "../../../sim/combat";
import type { P3Choices } from "./OcellusTimings";
import type { InputObservation, LoadoutSnapshot, PlayerObservation } from "./P4Types";

export type Quadrant = 1 | 2 | 3;
export type AutoAttack = "melee" | "wave";
export type ReachRule = "melee-range" | "within-two";

export type SpinCount = 1 | 2 | 3;
export type Spin = Readonly<{ nth: 1; of: SpinCount }> | Readonly<{ nth: 2; of: 2 | 3 }> | Readonly<{ nth: 3; of: 3 }>;
export type FlickRule = "on-off-on" | "off-then-on" | "held-blocks";
export type FlickMiss = "held" | "late" | "early";
export type SpinVerdict = Readonly<{ kind: "blocked" }> | Readonly<{ kind: "struck"; why: FlickMiss }>;

export type P3Stage = "arrive" | "autos" | "smite-1" | "smite-2" | "smite-3" | "destroy";
export type P3Phase = Readonly<{ stage: P3Stage }>;

export type P3Beat =
  | Readonly<{ kind: "reach-attack" }>
  | Readonly<{ kind: "wave-cast" }>
  | Readonly<{ kind: "smite-opens" }>
  | Readonly<{ kind: "spin-lands"; spin: Spin }>
  | Readonly<{ kind: "quadrant-cleared" }>;

export type P3Hit =
  | Readonly<{ kind: "swing"; at: Tick }>
  | Readonly<{ kind: "void-shot"; at: Tick }>
  | Readonly<{ kind: "smite-blow"; at: Tick }>
  | Readonly<{ kind: "spin"; at: Tick; spin: Spin; verdict: SpinVerdict }>
  | Readonly<{ kind: "rubble"; at: Tick; tile: Tile }>;
export type P3HitSource = P3Hit["kind"];

export type P3End = Readonly<{ kind: "quadrant-cleared"; quadrant: Quadrant }> | Readonly<{ kind: "death" }>;

export type P3Event =
  | Readonly<{ kind: "stage-entered"; at: Tick; stage: P3Stage }>
  | Readonly<{ kind: "wave-cast"; at: Tick; toward: Tile }>
  | Readonly<{ kind: "rubble-aimed"; at: Tick; tile: Tile; landsAt: Tick; until: Tick }>
  | Readonly<{ kind: "hazard-avoided"; at: Tick; hazard: "rubble"; tile: Tile }>
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
