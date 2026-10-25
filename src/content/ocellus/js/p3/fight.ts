import { OCELLUS_P3 } from "../OcellusTimings";
import type { DamageRange } from "../OcellusTimings";
import type { Seed, Tick, TickSpan, Tile } from "../../../../sim/brands";
import { after } from "../../../../sim/brands";
import type { Style } from "../../../../sim/combat";
import type { BossHp } from "../../../../sim/schedule";
import type { HitRequest, Logged } from "../../../../sim/sdk/EncounterBinding";
import { TileSet } from "../../../../sim/tiles";
import type { BandAttack, BossMove, P3Beat, P3End, P3Event, P3Hit } from "../P3Types";
import type { PlayerObservation } from "../P4Types";
import { roll, rollInt } from "../roll";
import { footprint, shadowSlashBand, superiorSlashBand } from "./arena";
import type { P3Schedule } from "./schedule";
import { compileP3Schedule } from "./schedule";

/** An attack already under way: it lands on its tick whatever he does by then, a quadrant's fall included. */
type Landing =
  | Readonly<{ kind: "panic"; at: Tick }>
  | Readonly<{ kind: "band"; at: Tick; attack: BandAttack; nth: number; band: TileSet }>;

export type P3Fight = Readonly<{ schedule: P3Schedule; landings: readonly Landing[] }>;
export type Reach = "in-reach" | "out-of-reach";

/**
 * `hp` is his HP before this tick's hits land, so a quadrant falls on the tick after the one his HP reaches its floor.
 * `anchor` is the south-west tile of his 3x3 after his step.
 */
export type BossFacts = BossHp & Readonly<{ reach: Reach; anchor: Tile }>;
export type TurnFacts = Readonly<{ at: Tick; player: PlayerObservation; boss: BossFacts }>;

export type TurnOutput = Logged<P3Event> | HitRequest<P3Hit>;
export type TurnStep = Readonly<{ fight: P3Fight; outputs: readonly TurnOutput[]; ending: P3End | null }>;
type Reaction = Readonly<{ outputs: readonly TurnOutput[]; landings: readonly Landing[]; ending: P3End | null }>;

const { swing, panic, shadowSlash, spin, untether, insolence, fallShouts } = OCELLUS_P3;
/** One draw a source, so two of his hits landing on one tick roll apart. */
const DRAW: Readonly<Record<Exclude<P3Hit["kind"], "swing">, number>> = {
  panic: 0,
  "shadow-slash": 1,
  saw: 2,
  "untether-magic": 3,
  "untether-slam": 4,
  "untether-aftershock": 5,
  "superior-slash": 6,
};

const logged = (event: P3Event): Logged<P3Event> => ({ kind: "event", event });
const moved = (at: Tick, move: BossMove): Logged<P3Event> => logged({ kind: "boss-moved", at, move });
const shouted = (at: Tick, text: string): Logged<P3Event> => logged({ kind: "boss-shouted", at, text });
const only = (...outputs: readonly TurnOutput[]): Reaction => ({ outputs, landings: [], ending: null });

export function startFight(): P3Fight {
  return { schedule: compileP3Schedule(), landings: [] };
}

function typeless(seed: Seed, cause: Exclude<P3Hit, { kind: "swing" }>, range: DamageRange): HitRequest<P3Hit> {
  return { kind: "hit", damage: { kind: "fixed", amount: rollInt(seed, "p3Damage", cause.at, range, DRAW[cause.kind]) }, cause };
}

/** Blocked outright by the matching protection prayer. */
function prayable(seed: Seed, cause: Exclude<P3Hit, { kind: "swing" }>, style: Style, range: DamageRange): HitRequest<P3Hit> {
  return { kind: "hit", damage: { kind: "by-prayer", style, protectedAmount: 0, unprotectedAmount: rollInt(seed, "p3Damage", cause.at, range, DRAW[cause.kind]) }, cause };
}

function swingHit(seed: Seed, at: Tick): HitRequest<P3Hit> {
  const { protectedDamage, unprotectedDamage } = swing;
  return {
    kind: "hit",
    damage: { kind: "by-prayer", style: "melee", protectedAmount: rollInt(seed, "swingDamage", at, protectedDamage.value, 0), unprotectedAmount: rollInt(seed, "swingDamage", at, unprotectedDamage.value, 0) },
    cause: { kind: "swing", at },
  };
}

function aimBand(at: Tick, attack: BandAttack, nth: number, tiles: readonly Tile[], landsAfter: TickSpan): Reaction {
  const landsAt = after(at, landsAfter);
  return { outputs: [logged({ kind: "band-aimed", at, attack, tiles, landsAt })], landings: [{ kind: "band", at: landsAt, attack, nth, band: TileSet.at(tiles) }], ending: null };
}

function react(seed: Seed, beat: P3Beat, facts: TurnFacts): Reaction {
  const { at, player, boss } = facts;
  const under = footprint(boss.anchor).contains(player.tile);
  switch (beat.kind) {
    case "swing":
      return only(moved(at, "swing"), swingHit(seed, at));
    case "panic":
      return { outputs: [moved(at, "panic"), shouted(at, panic.shout.value)], landings: [{ kind: "panic", at: after(at, panic.landsAfter.value) }], ending: null };
    case "shadow-slash": {
      const aimed = aimBand(at, "shadow-slash", 0, shadowSlashBand(boss.anchor, player.tile, shadowSlash.width.value), shadowSlash.landsAfter.value);
      return { ...aimed, outputs: [moved(at, "shadow-slash"), ...aimed.outputs] };
    }
    case "spin-starts":
      return only(moved(at, "spin"));
    case "saw-tell":
      return only(...(player.prayer === null ? [] : [logged({ kind: "prayer-severed", at, lockedFor: spin.severedFor.value })]));
    case "saw-cut":
      return only(moved(at, beat.last ? "last-saw" : "saw"), prayable(seed, { kind: "saw", at, saw: beat.saw }, "melee", spin.damage.value));
    case "untether-starts":
      return only(moved(at, "untether"), shouted(at, untether.shout.value));
    case "untether-magic":
      return only(prayable(seed, { kind: "untether-magic", at }, "magic", untether.magicDamage.value));
    case "untether-slam":
      return only(moved(at, "slam"), ...(under ? [] : [typeless(seed, { kind: "untether-slam", at }, untether.slamDamage.value)]));
    case "untether-aftershock":
      return only(...(under ? [typeless(seed, { kind: "untether-aftershock", at }, untether.aftershockDamage.value)] : []));
    case "insolence-starts":
      return only(shouted(at, insolence.shout.value));
    case "superior-slash": {
      const aimed = aimBand(at, "superior-slash", beat.nth, superiorSlashBand(boss.anchor, player.tile, insolence.width.value), insolence.landsAfter.value);
      return { ...aimed, outputs: [moved(at, "superior-slash"), ...aimed.outputs] };
    }
    case "quadrant-falls": {
      const reason: P3End = { kind: "quadrant-cleared" };
      const shouts = fallShouts.value;
      const shout = shouts[Math.floor(roll(seed, "p3Shout", at, 0) * shouts.length)];
      return { outputs: [moved(at, "quadrant-falls"), shouted(at, shout), logged({ kind: "run-ended", at, reason })], landings: [], ending: reason };
    }
    default: {
      const unhandled: never = beat;
      return unhandled;
    }
  }
}

/** Judged on where the player stood at the end of the tick before, as every attack of his is. */
function land(seed: Seed, landing: Landing, player: PlayerObservation): readonly TurnOutput[] {
  switch (landing.kind) {
    case "panic":
      return [prayable(seed, { kind: "panic", at: landing.at }, "magic", panic.damage.value)];
    case "band": {
      if (!landing.band.contains(player.tile)) return [];
      const cause: P3Hit = landing.attack === "shadow-slash" ? { kind: "shadow-slash", at: landing.at } : { kind: "superior-slash", at: landing.at, nth: landing.nth };
      return [typeless(seed, cause, landing.attack === "shadow-slash" ? shadowSlash.damage.value : insolence.damage.value)];
    }
    default: {
      const unhandled: never = landing;
      return unhandled;
    }
  }
}

export function turn(seed: Seed, fight: P3Fight, facts: TurnFacts): TurnStep {
  const { at } = facts;
  const advanced = fight.schedule.advance(at, facts.boss);
  const panics = facts.boss.reach === "out-of-reach" && advanced.at(at).beats.some((beat) => beat.kind === "swing");
  const schedule = panics ? advanced.cut(at, "panic") : advanced;
  const visit = schedule.visitAt(at);
  const entered = visit.start === at ? [logged({ kind: "stage-entered", at, stage: visit.stage })] : [];
  const landed = fight.landings.filter((landing) => landing.at === at).flatMap((landing) => land(seed, landing, facts.player));
  const reactions = schedule.at(at).beats.map((beat) => react(seed, beat, facts));
  return {
    fight: { schedule, landings: [...fight.landings.filter((landing) => landing.at > at), ...reactions.flatMap((reaction) => reaction.landings)] },
    outputs: [...entered, ...landed, ...reactions.flatMap((reaction) => reaction.outputs)],
    ending: reactions.find((reaction) => reaction.ending !== null)?.ending ?? null,
  };
}
