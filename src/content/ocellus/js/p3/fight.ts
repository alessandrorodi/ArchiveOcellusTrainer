import { OCELLUS_P3 } from "../OcellusTimings";
import type { DamageRange } from "../OcellusTimings";
import type { Seed, Tick, TickSpan, Tile } from "../../../../sim/brands";
import { after, tick } from "../../../../sim/brands";
import type { Style } from "../../../../sim/combat";
import type { BossHp } from "../../../../sim/schedule";
import type { AttackDelayCut, HitRequest, Logged } from "../../../../sim/sdk/EncounterBinding";
import { TileSet } from "../../../../sim/tiles";
import type { BandAttack, BossMove, Hazard, P3Beat, P3End, P3Event, P3Hit, Quadrant, Wedge } from "../P3Types";
import type { PlayerObservation, RiftId } from "../P4Types";
import { roll, rollInt } from "../roll";
import type { Adds, AddsOutput } from "./adds";
import { DRAW, NO_ADDS, formVoid, landInQuadrant, loseFloor, stepAdds } from "./adds";
import { WEDGES, footprint, shadowSlashBand, superiorSlashBand, turnInto, wedgeOf } from "./arena";
import type { P3Schedule } from "./schedule";
import { COLLAPSE_LENGTH, compileP3Schedule, isSpecial, kindOf } from "./schedule";

/** An attack already under way: it lands on its tick whatever he does by then, a quadrant's fall included. */
type Landing =
  | Readonly<{ kind: "panic"; at: Tick }>
  | Readonly<{ kind: "band"; at: Tick; attack: BandAttack; nth: number; band: TileSet }>
  | Readonly<{ kind: "hazard"; at: Tick; hazard: Hazard; tile: Tile }>
  | Readonly<{ kind: "vine"; at: Tick }>;

/**
 * The phase so far. Each quadrant runs its own schedule, counted from the tick he landed in it; `specials` counts the
 * phase's specials for the spin's turn, `fellAt` is the tick the quadrant started to fall, and `gone` the quadrants whose
 * floor is gone.
 */
export type P3Fight = Readonly<{
  quadrant: Quadrant;
  landedAt: Tick;
  schedule: P3Schedule;
  specials: number;
  fellAt: Tick | null;
  gone: readonly Quadrant[];
  landings: readonly Landing[];
  adds: Adds;
}>;
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
type Reaction = Readonly<{ outputs: readonly TurnOutput[]; landings: readonly Landing[] }>;
/** What a turn reacts in: the tick, the tick within the quadrant, and the quadrant's floor. */
type Here = Readonly<{ at: Tick; local: Tick; quadrant: Quadrant; floor: TileSet; standing: readonly Wedge[] }>;

const { swing, panic, shadowSlash, spin, untether, insolence, fallShouts, bombs, rubble, vine, quadrants } = OCELLUS_P3;
const HAZARD: Readonly<Record<Hazard, Readonly<{ fallsAfter: TickSpan }>>> = {
  bomb: { fallsAfter: bombs.dropsAfter.value },
  rubble: { fallsAfter: rubble.fallsAfter.value },
};
const WEDGE_LIST: readonly Wedge[] = [1, 2, 3, 4];

const logged = (event: P3Event): Logged<P3Event> => ({ kind: "event", event });
const moved = (at: Tick, move: BossMove): Logged<P3Event> => logged({ kind: "boss-moved", at, move });
const shouted = (at: Tick, text: string): Logged<P3Event> => logged({ kind: "boss-shouted", at, text });
const only = (...outputs: readonly TurnOutput[]): Reaction => ({ outputs, landings: [] });
const pick = <T>(seed: Seed, at: Tick, draw: number, from: readonly T[]): T => from[Math.floor(roll(seed, "p3Shout", at, draw) * from.length)];

export function startFight(): P3Fight {
  return { quadrant: 1, landedAt: tick(0), schedule: compileP3Schedule({ quadrant: 1, spinFirst: true }), specials: 0, fellAt: null, gone: [], landings: [], adds: NO_ADDS };
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
  return { outputs: [logged({ kind: "band-aimed", at, attack, tiles, landsAt })], landings: [{ kind: "band", at: landsAt, attack, nth, band: TileSet.at(tiles) }] };
}

/** A bomb or rubble shown over each tile, falling on it. */
function show(at: Tick, hazard: Hazard, tiles: readonly Tile[]): Reaction {
  const landsAt = after(at, HAZARD[hazard].fallsAfter);
  return {
    outputs: tiles.map((tile) => logged({ kind: "hazard-shown", at, hazard, tile, landsAt })),
    landings: tiles.map((tile): Landing => ({ kind: "hazard", at: landsAt, hazard, tile })),
  };
}

function react(seed: Seed, beat: P3Beat, facts: TurnFacts, here: Here): Reaction {
  const { player, boss } = facts;
  const { at, floor } = here;
  const under = footprint(boss.anchor).contains(player.tile);
  switch (beat.kind) {
    case "swing":
      return only(moved(at, "swing"), swingHit(seed, at));
    case "panic":
      return { outputs: [moved(at, "panic"), shouted(at, panic.shout.value)], landings: [{ kind: "panic", at: after(at, panic.landsAfter.value) }] };
    case "shadow-slash": {
      const aimed = aimBand(at, "shadow-slash", 0, shadowSlashBand(floor, boss.anchor, player.tile, shadowSlash.width.value), shadowSlash.landsAfter.value);
      return { ...aimed, outputs: [moved(at, "shadow-slash"), ...aimed.outputs] };
    }
    case "spin-starts":
      return only(moved(at, "spin"));
    case "saw-tell":
      return only(...(player.prayer === null ? [] : [logged({ kind: "prayer-severed", at, lockedFor: spin.severedFor.value })]));
    case "saw-cut":
      return only(moved(at, beat.last ? "last-saw" : "saw"), prayable(seed, { kind: "saw", at, saw: beat.saw }, "melee", spin.damage.value));
    case "rubble-shows":
      return show(at, "rubble", [player.tile]);
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
      const aimed = aimBand(at, "superior-slash", beat.nth, superiorSlashBand(floor, boss.anchor, player.tile, insolence.width.value), insolence.landsAfter.value);
      return { ...aimed, outputs: [moved(at, "superior-slash"), ...aimed.outputs] };
    }
    case "quadrant-falls":
      return only(moved(at, "quadrant-falls"), shouted(at, pick(seed, at, 0, fallShouts.value)), logged({ kind: "quadrant-crumbling", at, quadrant: here.quadrant }));
    case "escape-shout":
      return only(moved(at, "escape"), shouted(at, pick(seed, at, 2, quadrants.escapeShouts.value)));
    case "quadrant-gone":
      return only(
        logged({ kind: "quadrant-gone", at, quadrant: here.quadrant }),
        ...(floor.contains(player.tile) ? [typeless(seed, { kind: "quadrant-gone", at }, quadrants.leftOnIt.value)] : []),
      );
    default: {
      const unhandled: never = beat;
      return unhandled;
    }
  }
}

type Landed = Readonly<{ outputs: readonly AddsOutput[]; adds: Adds }>;

/** Judged on where the player stood at the end of the tick before, as every attack of his is. */
function land(seed: Seed, landing: Landing, player: PlayerObservation, adds: Adds, standing: readonly Wedge[]): Landed {
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
      const wedge = wedgeOf(landing.tile);
      if (landing.hazard === "rubble" || wedge === null || !standing.includes(wedge)) return { outputs: hit, adds };
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
function vineShout(seed: Seed, schedule: P3Schedule, here: Here): Reaction | null {
  const { at, local } = here;
  const visit = schedule.visitAt(local);
  if (visit.start !== local || local === 0 || (visit.stage !== "swing" && visit.stage !== "panic")) return null;
  const before = schedule.visitAt(tick(local - 1));
  if (before.stage !== "spin" || !vine.afterSpins.value.some((nth) => nth === before.number)) return null;
  return { outputs: [shouted(at, pick(seed, at, 1, vine.shouts.value))], landings: [{ kind: "vine", at: after(at, vine.rootsAfter.value) }] };
}

/**
 * The void bombs fall on the quadrant's own clock, so a panic does not move them: one over the player, and one on the same
 * tile turned into each other standing wedge, clear of his body.
 */
function bombShown(here: Here, player: Tile, anchor: Tile): Reaction | null {
  if (!bombs.shows.value[kindOf(here.quadrant)].some((t) => after(tick(0), t) === here.local)) return null;
  const from = wedgeOf(player);
  const body = footprint(anchor);
  const copies = from === null ? [] : here.standing.filter((wedge) => wedge !== from).map((wedge) => turnInto(player, from, wedge));
  return show(here.at, "bomb", [player, ...copies.filter((at) => wedgeOf(at) !== null && !body.contains(at))]);
}

/** 17 ticks after a quadrant starts to fall he lands in the next one, or after the third, phase 4 starts. */
function nextQuadrant(fight: P3Fight, at: Tick): Readonly<{ fight: P3Fight; outputs: readonly TurnOutput[]; ending: P3End | null }> {
  if (fight.fellAt === null || at !== after(fight.fellAt, COLLAPSE_LENGTH)) return { fight, outputs: [], ending: null };
  if (fight.quadrant === 3) {
    const reason: P3End = { kind: "phase-cleared" };
    return { fight, outputs: [logged({ kind: "run-ended", at, reason })], ending: reason };
  }
  const quadrant: Quadrant = fight.quadrant === 1 ? 2 : 3;
  const corner = quadrants.corners.value[quadrant];
  return {
    fight: { ...fight, quadrant, landedAt: at, schedule: compileP3Schedule({ quadrant, spinFirst: fight.specials % 2 === 0 }), fellAt: null, adds: landInQuadrant(fight.adds, at) },
    outputs: [logged({ kind: "boss-landed", at, quadrant, corner })],
    ending: null,
  };
}

export function turn(seed: Seed, before: P3Fight, facts: TurnFacts): TurnStep {
  const { at } = facts;
  const next = nextQuadrant(before, at);
  if (next.ending !== null) return next;
  const fight = next.fight;
  const local = tick(at - fight.landedAt);
  const advanced = fight.schedule.advance(local, facts.boss);
  const panics = facts.boss.reach === "out-of-reach" && advanced.at(local).beats.some((beat) => beat.kind === "swing");
  const schedule = panics ? advanced.cut(local, "panic") : advanced;
  const visit = schedule.visitAt(local);
  const enters = visit.start === local;
  const standing = WEDGE_LIST.filter((wedge) => !fight.gone.some((gone) => gone === wedge));
  const here: Here = { at, local, quadrant: fight.quadrant, floor: WEDGES[fight.quadrant], standing };
  const entered = enters ? [logged({ kind: "stage-entered", at, stage: visit.stage })] : [];
  const landed = fight.landings
    .filter((landing) => landing.at === at)
    .reduce<Landed>((sofar, landing) => {
      const outcome = land(seed, landing, facts.player, sofar.adds, standing);
      return { outputs: [...sofar.outputs, ...outcome.outputs], adds: outcome.adds };
    }, { outputs: [], adds: fight.adds });
  const added = stepAdds(seed, landed.adds, {
    at,
    player: facts.player.tile,
    anchor: facts.boss.anchor,
    floor: here.floor,
    stage: visit.stage,
    untetherStarted: visit.stage === "untether" && enters,
    riftsAlive: facts.riftsAlive,
    attackDelay: facts.attackDelay,
  });
  const beats = schedule.at(local).beats;
  const reactions = [vineShout(seed, schedule, here), bombShown(here, facts.player.tile, facts.boss.anchor), ...beats.map((beat) => react(seed, beat, facts, here))].flatMap((reaction) => (reaction === null ? [] : [reaction]));
  const goes = beats.some((beat) => beat.kind === "quadrant-gone");
  const lost = goes ? loseFloor(added.adds, at, here.floor) : { adds: added.adds, outputs: [] };
  return {
    fight: {
      ...fight,
      schedule,
      specials: fight.specials + (enters && isSpecial(visit.stage) ? 1 : 0),
      fellAt: visit.stage === "destroy" && enters && fight.fellAt === null ? at : fight.fellAt,
      gone: goes ? [...fight.gone, fight.quadrant] : fight.gone,
      landings: [...fight.landings.filter((landing) => landing.at > at), ...reactions.flatMap((reaction) => reaction.landings)],
      adds: lost.adds,
    },
    outputs: [...next.outputs, ...entered, ...landed.outputs, ...added.outputs, ...reactions.flatMap((reaction) => reaction.outputs), ...lost.outputs],
    ending: null,
  };
}
