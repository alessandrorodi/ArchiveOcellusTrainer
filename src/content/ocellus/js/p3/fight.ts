import type { DamageRange } from "../OcellusTimings";
import { OCELLUS_P3 } from "../OcellusTimings";
import type { Seed, Tick, Tile } from "../../../../sim/brands";
import { after, tick } from "../../../../sim/brands";
import type { BossHp } from "../../../../sim/schedule";
import type { HitRequest, Logged } from "../../../../sim/sdk/EncounterBinding";
import type { FlickRule, P3Beat, P3End, P3Event, P3Hit, Quadrant, Spin } from "../P3Types";
import type { PlayerObservation } from "../P4Types";
import { rollInt } from "../roll";
import type { Flick } from "./flick";
import { armFlick, judgeSpin, stepFlick } from "./flick";
import type { P3Schedule } from "./schedule";
import { compileP3Schedule } from "./schedule";

export type P3Rules = Readonly<{ seed: Seed; start: Quadrant; flick: FlickRule; missedFlickDamage: DamageRange }>;
export type Hazard = Readonly<{ kind: "rubble"; tile: Tile; landsAt: Tick; until: Tick }>;
export type P3Fight = Readonly<{ schedule: P3Schedule; flick: Flick; hazards: readonly Hazard[] }>;
export type Reach = "in-reach" | "out-of-reach";

export type TurnFacts = Readonly<{ at: Tick; player: PlayerObservation; boss: BossHp & Readonly<{ reach: Reach }> }>;

export type TurnOutput = Logged<P3Event> | HitRequest<P3Hit>;
export type TurnStep = Readonly<{ fight: P3Fight; outputs: readonly TurnOutput[]; ending: P3End | null }>;
type Reaction = Readonly<{ outputs: readonly TurnOutput[]; ending: P3End | null; flick: Flick; hazards: readonly Hazard[] }>;

const logged = (event: P3Event): Logged<P3Event> => ({ kind: "event", event });
const sameTile = (a: Tile, b: Tile) => a.x === b.x && a.y === b.y;

export function startFight(rules: P3Rules): P3Fight {
  return { schedule: compileP3Schedule(rules.start), flick: "unarmed", hazards: [] };
}

function meleeHit(seed: Seed, at: Tick, { protectedDamage, unprotectedDamage }: Readonly<{ protectedDamage: DamageRange; unprotectedDamage: DamageRange }>, cause: P3Hit): HitRequest<P3Hit> {
  return {
    kind: "hit",
    damage: { kind: "by-prayer", style: "melee", protectedAmount: rollInt(seed, "swingDamage", at, protectedDamage, 0), unprotectedAmount: rollInt(seed, "swingDamage", at, unprotectedDamage, 0) },
    cause,
  };
}

function autoAttack(seed: Seed, at: Tick, reach: Reach): HitRequest<P3Hit> {
  switch (reach) {
    case "in-reach":
      return meleeHit(seed, at, { protectedDamage: OCELLUS_P3.swing.protectedDamage.value, unprotectedDamage: OCELLUS_P3.swing.unprotectedDamage.value }, { kind: "swing", at });
    case "out-of-reach":
      return { kind: "hit", damage: { kind: "fixed", amount: rollInt(seed, "swingDamage", at, OCELLUS_P3.voidShot.value, 0) }, cause: { kind: "void-shot", at } };
    default: {
      const unhandled: never = reach;
      return unhandled;
    }
  }
}

function spinLands(rules: P3Rules, spin: Spin, flick: Flick, facts: TurnFacts): Reaction {
  const { at, player } = facts;
  const verdict = judgeSpin(rules.flick, flick);
  const amount = verdict.kind === "blocked" ? 0 : rollInt(rules.seed, "spinDamage", at, rules.missedFlickDamage, 0);
  const hit: HitRequest<P3Hit> = { kind: "hit", damage: { kind: "fixed", amount }, cause: { kind: "spin", at, spin, verdict } };
  const rearmed = armFlick(rules.flick, player.prayer === "melee");
  if (spin.nth !== 1) return { outputs: [hit], ending: null, flick: rearmed, hazards: [] };
  const { landsAfterFirstSpin, lasts } = OCELLUS_P3.smite.rubble;
  const landsAt = after(at, landsAfterFirstSpin.value);
  const rubble: Hazard = { kind: "rubble", tile: player.tile, landsAt, until: tick(landsAt + lasts.value - 1) };
  return { outputs: [hit, logged({ kind: "rubble-aimed", at, tile: rubble.tile, landsAt: rubble.landsAt, until: rubble.until })], ending: null, flick: rearmed, hazards: [rubble] };
}

function react(rules: P3Rules, beat: P3Beat, flick: Flick, facts: TurnFacts): Reaction {
  const { at } = facts;
  const quiet = (outputs: readonly TurnOutput[]): Reaction => ({ outputs, ending: null, flick, hazards: [] });
  switch (beat.kind) {
    case "reach-attack":
      return quiet([autoAttack(rules.seed, at, facts.boss.reach)]);
    case "wave-cast":
      return quiet([logged({ kind: "wave-cast", at, toward: facts.player.tile })]);
    case "smite-opens":
      return { outputs: [meleeHit(rules.seed, at, OCELLUS_P3.smite.openingBlow.value, { kind: "smite-blow", at })], ending: null, flick: armFlick(rules.flick, facts.player.prayer === "melee"), hazards: [] };
    case "spin-lands":
      return spinLands(rules, beat.spin, flick, facts);
    case "quadrant-cleared": {
      const reason: P3End = { kind: "quadrant-cleared", quadrant: rules.start };
      return { outputs: [logged({ kind: "run-ended", at, reason })], ending: reason, flick, hazards: [] };
    }
    default: {
      const unhandled: never = beat;
      return unhandled;
    }
  }
}

function resolveHazard(seed: Seed, hazard: Hazard, facts: TurnFacts): readonly TurnOutput[] {
  const { at, player } = facts;
  switch (hazard.kind) {
    case "rubble": {
      if (at < hazard.landsAt || at > hazard.until) return [];
      if (sameTile(player.tile, hazard.tile)) {
        return [{ kind: "hit", damage: { kind: "fixed", amount: rollInt(seed, "rubbleDamage", at, OCELLUS_P3.smite.rubble.damagePerTick.value, 0) }, cause: { kind: "rubble", at, tile: hazard.tile } }];
      }
      return at === hazard.landsAt ? [logged({ kind: "hazard-avoided", at, hazard: "rubble", tile: hazard.tile })] : [];
    }
    default: {
      const unhandled: never = hazard.kind;
      return unhandled;
    }
  }
}

export function turn(rules: P3Rules, fight: P3Fight, facts: TurnFacts): TurnStep {
  const schedule = fight.schedule.advance(facts.at, facts.boss);
  const visit = schedule.visitAt(facts.at);
  const entered = visit.start === facts.at ? [logged({ kind: "stage-entered", at: facts.at, stage: visit.stage })] : [];
  const fromHazards = fight.hazards.flatMap((hazard) => resolveHazard(rules.seed, hazard, facts));
  const stepped: Reaction = { outputs: [], ending: null, flick: stepFlick(fight.flick, facts.player.prayer === "melee"), hazards: [] };
  const reacted = schedule.at(facts.at).beats.reduce<Reaction>((so, beat) => {
    const next = react(rules, beat, so.flick, facts);
    return { outputs: [...so.outputs, ...next.outputs], ending: so.ending ?? next.ending, flick: next.flick, hazards: [...so.hazards, ...next.hazards] };
  }, stepped);
  return {
    fight: { schedule, flick: reacted.flick, hazards: [...fight.hazards.filter((hazard) => hazard.until > facts.at), ...reacted.hazards] },
    outputs: [...entered, ...reacted.outputs, ...fromHazards],
    ending: reacted.ending,
  };
}
