import { OCELLUS_P3 } from "../OcellusTimings";
import type { DamageRange } from "../OcellusTimings";
import type { Seed, Tick, TickSpan, Tile } from "../../../../sim/brands";
import { after, tick } from "../../../../sim/brands";
import type { Style } from "../../../../sim/combat";
import type { BossHp } from "../../../../sim/schedule";
import type { AttackDelayCut, HitRequest, Logged } from "../../../../sim/sdk/EncounterBinding";
import { TileSet } from "../../../../sim/tiles";
import type { BandAttack, BossMove, Hazard, P3Beat, P3End, P3Event, P3Hit } from "../P3Types";
import type { PlayerObservation, RiftId } from "../P4Types";
import { roll, rollInt } from "../roll";
import type { Adds } from "./adds";
import { DRAW, NO_ADDS, formVoid, stepAdds } from "./adds";
import { footprint, shadowSlashBand, superiorSlashBand } from "./arena";
import type { P3Schedule } from "./schedule";
import { compileP3Schedule } from "./schedule";

/** An attack already under way: it lands on its tick whatever he does by then, a quadrant's fall included. */
type Landing =
  | Readonly<{ kind: "panic"; at: Tick }>
  | Readonly<{ kind: "band"; at: Tick; attack: BandAttack; nth: number; band: TileSet }>
  | Readonly<{ kind: "hazard"; at: Tick; hazard: Hazard; tile: Tile }>
  | Readonly<{ kind: "vine"; at: Tick }>;

export type P3Fight = Readonly<{ schedule: P3Schedule; landings: readonly Landing[]; adds: Adds }>;
export type Reach = "in-reach" | "out-of-reach";

/**
 * `hp` is his HP before this tick's hits land, so a quadrant falls on the tick after the one his HP reaches its floor.
 * `anchor` is the south-west tile of his 3x3 after his step.
 */
export type BossFacts = BossHp & Readonly<{ reach: Reach; anchor: Tile }>;
/** `riftsAlive` are the rifts still standing as his turn starts; `attackDelay` is the player's attack clock then. */
export type TurnFacts = Readonly<{ at: Tick; player: PlayerObservation; boss: BossFacts; riftsAlive: readonly RiftId[]; attackDelay: number }>;

export type TurnOutput = Logged<P3Event> | HitRequest<P3Hit> | AttackDelayCut;
export type TurnStep = Readonly<{ fight: P3Fight; outputs: readonly TurnOutput[]; ending: P3End | null }>;
type Reaction = Readonly<{ outputs: readonly TurnOutput[]; landings: readonly Landing[]; ending: P3End | null }>;

const { swing, panic, shadowSlash, spin, untether, insolence, fallShouts, bombs, rubble, vine } = OCELLUS_P3;
const HAZARD: Readonly<Record<Hazard, Readonly<{ fallsAfter: TickSpan }>>> = {
  bomb: { fallsAfter: bombs.dropsAfter.value },
  rubble: { fallsAfter: rubble.fallsAfter.value },
};

const logged = (event: P3Event): Logged<P3Event> => ({ kind: "event", event });
const moved = (at: Tick, move: BossMove): Logged<P3Event> => logged({ kind: "boss-moved", at, move });
const shouted = (at: Tick, text: string): Logged<P3Event> => logged({ kind: "boss-shouted", at, text });
const only = (...outputs: readonly TurnOutput[]): Reaction => ({ outputs, landings: [], ending: null });

export function startFight(): P3Fight {
  return { schedule: compileP3Schedule(), landings: [], adds: NO_ADDS };
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

/** A bomb or rubble shown over the player, falling on that tile. */
function show(at: Tick, hazard: Hazard, tile: Tile): Reaction {
  const landsAt = after(at, HAZARD[hazard].fallsAfter);
  return { outputs: [logged({ kind: "hazard-shown", at, hazard, tile, landsAt })], landings: [{ kind: "hazard", at: landsAt, hazard, tile }], ending: null };
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
    case "rubble-shows":
      return show(at, "rubble", player.tile);
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

type Landed = Readonly<{ outputs: readonly TurnOutput[]; adds: Adds }>;

/** Judged on where the player stood at the end of the tick before, as every attack of his is. */
function land(seed: Seed, landing: Landing, player: PlayerObservation, adds: Adds): Landed {
  const { at } = landing;
  switch (landing.kind) {
    case "panic":
      return { outputs: [prayable(seed, { kind: "panic", at }, "magic", panic.damage.value)], adds };
    case "band": {
      if (!landing.band.contains(player.tile)) return { outputs: [], adds };
      const cause: P3Hit = landing.attack === "shadow-slash" ? { kind: "shadow-slash", at } : { kind: "superior-slash", at, nth: landing.nth };
      return { outputs: [typeless(seed, cause, landing.attack === "shadow-slash" ? shadowSlash.damage.value : insolence.damage.value)], adds };
    }
    case "hazard": {
      const onIt = landing.tile.x === player.tile.x && landing.tile.y === player.tile.y;
      const hit = onIt ? [typeless(seed, { kind: landing.hazard, at }, landing.hazard === "bomb" ? bombs.damage.value : rubble.damage.value)] : [];
      if (landing.hazard === "rubble") return { outputs: hit, adds };
      const formed = formVoid(adds, at, landing.tile);
      return { outputs: [...hit, ...formed.outputs], adds: formed.adds };
    }
    case "vine":
      return { outputs: [logged({ kind: "vine-rooted", at, tile: player.tile })], adds };
    default: {
      const unhandled: never = landing;
      return unhandled;
    }
  }
}

/** His first move after a quadrant's first and third spins brings the vine's shout; it roots the player a few ticks later. */
function vineShout(seed: Seed, schedule: P3Schedule, at: Tick): Reaction | null {
  const visit = schedule.visitAt(at);
  if (visit.start !== at || at === 0 || (visit.stage !== "swing" && visit.stage !== "panic")) return null;
  const before = schedule.visitAt(tick(at - 1));
  if (before.stage !== "spin" || !vine.afterSpins.value.some((nth) => nth === before.number)) return null;
  const shouts = vine.shouts.value;
  const shout = shouts[Math.floor(roll(seed, "p3Shout", at, 1) * shouts.length)];
  return { outputs: [shouted(at, shout)], landings: [{ kind: "vine", at: after(at, vine.rootsAfter.value) }], ending: null };
}

/** The void bombs fall on the quadrant's own clock, so a panic does not move them. */
function bombShown(at: Tick, player: Tile): Reaction | null {
  return bombs.shows.value.some((t) => after(tick(0), t) === at) ? show(at, "bomb", player) : null;
}

export function turn(seed: Seed, fight: P3Fight, facts: TurnFacts): TurnStep {
  const { at } = facts;
  const advanced = fight.schedule.advance(at, facts.boss);
  const panics = facts.boss.reach === "out-of-reach" && advanced.at(at).beats.some((beat) => beat.kind === "swing");
  const schedule = panics ? advanced.cut(at, "panic") : advanced;
  const visit = schedule.visitAt(at);
  const entered = visit.start === at ? [logged({ kind: "stage-entered", at, stage: visit.stage })] : [];
  const landed = fight.landings
    .filter((landing) => landing.at === at)
    .reduce<Landed>((sofar, landing) => {
      const next = land(seed, landing, facts.player, sofar.adds);
      return { outputs: [...sofar.outputs, ...next.outputs], adds: next.adds };
    }, { outputs: [], adds: fight.adds });
  const added = stepAdds(seed, landed.adds, {
    at,
    player: facts.player.tile,
    anchor: facts.boss.anchor,
    stage: visit.stage,
    untetherStarted: visit.stage === "untether" && visit.start === at,
    riftsAlive: facts.riftsAlive,
    attackDelay: facts.attackDelay,
  });
  const reactions = [vineShout(seed, schedule, at), bombShown(at, facts.player.tile), ...schedule.at(at).beats.map((beat) => react(seed, beat, facts))].flatMap((reaction) => (reaction === null ? [] : [reaction]));
  return {
    fight: { schedule, landings: [...fight.landings.filter((landing) => landing.at > at), ...reactions.flatMap((reaction) => reaction.landings)], adds: added.adds },
    outputs: [...entered, ...landed.outputs, ...added.outputs, ...reactions.flatMap((reaction) => reaction.outputs)],
    ending: reactions.find((reaction) => reaction.ending !== null)?.ending ?? null,
  };
}
