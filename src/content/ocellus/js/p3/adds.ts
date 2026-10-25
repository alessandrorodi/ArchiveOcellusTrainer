import { OCELLUS_P3 } from "../OcellusTimings";
import type { Seed, Tick, Tile } from "../../../../sim/brands";
import { after, span } from "../../../../sim/brands";
import type { AttackDelayCut, HitRequest, Logged } from "../../../../sim/sdk/EncounterBinding";
import type { P3Event, P3Hit, P3Stage } from "../P3Types";
import type { RiftId } from "../P4Types";
import { riftId } from "../P4Types";
import { roll, rollInt } from "../roll";
import { QUADRANT_1_FLOOR, distanceFromBody } from "./arena";

const { voids, rifts } = OCELLUS_P3;

/** One draw a source, so two of his hits landing on one tick roll apart. */
export const DRAW: Readonly<Record<Exclude<P3Hit["kind"], "swing">, number>> = {
  panic: 0,
  "shadow-slash": 1,
  saw: 2,
  "untether-magic": 3,
  "untether-slam": 4,
  "untether-aftershock": 5,
  "superior-slash": 6,
  bomb: 7,
  void: 8,
  rubble: 9,
  "rift-detonation": 10,
};

type FormedVoid = Readonly<{ tile: Tile; formed: Tick }>;
type Rift = Readonly<{ id: RiftId; tile: Tile; spawnedAt: Tick }>;

/** What his adds leave behind: bomb voids that stay for the quadrant, rifts until killed or detonated, and the rift clock. */
export type Adds = Readonly<{ voids: readonly FormedVoid[]; rifts: readonly Rift[]; riftDue: Tick | null }>;
export const NO_ADDS: Adds = { voids: [], rifts: [], riftDue: null };

export type AddsFacts = Readonly<{ at: Tick; player: Tile; anchor: Tile; stage: P3Stage; untetherStarted: boolean; riftsAlive: readonly RiftId[]; attackDelay: number }>;
export type AddsOutput = Logged<P3Event> | HitRequest<P3Hit> | AttackDelayCut;
export type AddsStep = Readonly<{ adds: Adds; outputs: readonly AddsOutput[] }>;

const logged = (event: P3Event): Logged<P3Event> => ({ kind: "event", event });
const sameTile = (a: Tile, b: Tile) => a.x === b.x && a.y === b.y;

export function formVoid(adds: Adds, at: Tick, tile: Tile): AddsStep {
  if (adds.voids.some((formed) => sameTile(formed.tile, tile))) return { adds, outputs: [] };
  return { adds: { ...adds, voids: [...adds.voids, { tile, formed: at }] }, outputs: [logged({ kind: "void-formed", at, tile })] };
}

/** A void hits the player on it every `voids.every` ticks from the tick it formed. */
function voidHit(seed: Seed, adds: Adds, at: Tick, player: Tile): readonly AddsOutput[] {
  const under = adds.voids.find((formed) => sameTile(formed.tile, player));
  if (!under || at <= under.formed || (at - under.formed) % voids.every.value !== 0) return [];
  return [{ kind: "hit", damage: { kind: "fixed", amount: rollInt(seed, "p3Damage", at, voids.damage.value, DRAW.void) }, cause: { kind: "void", at } }];
}

/** A rift the player killed: the kill resets their attack cooldown. One left alive detonates on its own clock. */
function settleRifts(seed: Seed, adds: Adds, facts: AddsFacts): AddsStep {
  const { at, riftsAlive, attackDelay } = facts;
  const killed = adds.rifts.filter((rift) => !riftsAlive.includes(rift.id));
  const due = adds.rifts.filter((rift) => riftsAlive.includes(rift.id) && after(rift.spawnedAt, rifts.detonatesAfter.value) === at);
  const reset: readonly AddsOutput[] = killed.length > 0 && attackDelay > 0 ? [{ kind: "cut-attack-delay", by: span(attackDelay) }] : [];
  return {
    adds: { ...adds, rifts: adds.rifts.filter((rift) => !killed.includes(rift) && !due.includes(rift)) },
    outputs: [
      ...killed.map((rift) => logged({ kind: "rift-destroyed", at, rift: rift.id, tile: rift.tile })),
      ...reset,
      ...due.flatMap((rift, draw): readonly AddsOutput[] => [
        logged({ kind: "rift-detonated", at, rift: rift.id, tile: rift.tile }),
        { kind: "hit", damage: { kind: "fixed", amount: rollInt(seed, "p3Damage", at, rifts.detonationDamage.value, DRAW["rift-detonation"] + draw) }, cause: { kind: "rift-detonation", at, rift: rift.id } },
      ]),
    ],
  };
}

/**
 * Rifts come after an Untether the quadrant stands through, at U+32 and every 48 ticks after, until the next Untether. One due
 * while he spins waits for his first move after the spin.
 */
function spawnRifts(seed: Seed, adds: Adds, facts: AddsFacts): AddsStep {
  const { at, anchor, stage, untetherStarted, player } = facts;
  if (untetherStarted) return { adds: { ...adds, riftDue: after(at, rifts.afterUntether.value) }, outputs: [] };
  if (adds.riftDue === null || at < adds.riftDue || stage === "spin" || stage === "untether") return { adds, outputs: [] };
  const open = QUADRANT_1_FLOOR.tiles().filter((tile) => distanceFromBody(anchor, tile) >= rifts.clearOfBoss.value && !sameTile(tile, player));
  const spawned = Array.from({ length: open.length === 0 ? 0 : rifts.perSpawn.value }, (_, slot): Rift => ({ id: riftId(at, slot), tile: open[Math.floor(roll(seed, "p3Tile", at, slot) * open.length)], spawnedAt: at }));
  return {
    adds: { ...adds, rifts: [...adds.rifts, ...spawned], riftDue: after(adds.riftDue, rifts.every.value) },
    outputs: spawned.map((rift) => logged({ kind: "rift-spawned", at, rift: rift.id, tile: rift.tile })),
  };
}

export function stepAdds(seed: Seed, adds: Adds, facts: AddsFacts): AddsStep {
  const hits = voidHit(seed, adds, facts.at, facts.player);
  const settled = settleRifts(seed, adds, facts);
  const spawned = spawnRifts(seed, settled.adds, facts);
  return { adds: spawned.adds, outputs: [...hits, ...settled.outputs, ...spawned.outputs] };
}
