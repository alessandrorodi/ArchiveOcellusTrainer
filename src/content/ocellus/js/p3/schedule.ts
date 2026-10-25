import { OCELLUS_P3 } from "../OcellusTimings";
import type { QuadrantKind } from "../OcellusTimings";
import { tick } from "../../../../sim/brands";
import type { Script, Slot } from "../../../../sim/schedule";
import { Schedule, slotTable } from "../../../../sim/schedule";
import type { BossStance, P3Beat, P3Phase, P3Special, P3Stage, Quadrant } from "../P3Types";

export type P3Schedule = Schedule<P3Stage, P3Phase, P3Beat, never>;

/** What one quadrant's schedule needs from the ones before it: which quadrant it is, and whether its first special is the spin. */
export type QuadrantPlan = Readonly<{ quadrant: Quadrant; spinFirst: boolean }>;

type Table = readonly [Slot<P3Phase, P3Beat>, ...Slot<P3Phase, P3Beat>[]];

const { chain, specials, spin, untether, insolence, rubble, quadrants } = OCELLUS_P3;
const SPECIAL_STAGES: readonly P3Special[] = ["spin", "untether", "insolence"];

export const kindOf = (quadrant: Quadrant): QuadrantKind => (quadrant === 1 ? "first" : "later");

/** The ticks from a quadrant's fall to his landing in the next one. */
export const COLLAPSE_LENGTH = quadrants.nextJumpAt.value;

export function isSpecial(stage: P3Stage): stage is P3Special {
  return SPECIAL_STAGES.some((special) => special === stage);
}

/**
 * One quadrant of phase 3 as a chain of moves: each stage is one move and lasts until the next. Two swings and a slash make a
 * set; after `setsBeforeSpecial` sets comes the next special. The spin is every other special through the whole phase, so
 * `spinFirst` carries its turn over from the quadrant before; between spins, Untether and Insolence take turns within the
 * quadrant. A panic is cut in by the turn when a swing finds nobody in reach. Its HP breakpoint starts the quadrant's fall.
 */
export function compileP3Schedule({ quadrant, spinFirst }: QuadrantPlan): P3Schedule {
  const { firstAttackAfterStart, thresholds } = OCELLUS_P3;
  const kind = kindOf(quadrant);
  const slot = (stage: P3Stage, boss: BossStance, beats: readonly P3Beat[]): Slot<P3Phase, P3Beat> => {
    const phase: P3Phase = { stage, boss, quadrant };
    return { phase: () => phase, beats: beats.map((beat) => () => beat) };
  };
  /** A table `length` long, whose slot at each offset gets that offset's beats and stance. */
  const table = (stage: P3Stage, length: number, beatsAt: (offset: number) => readonly P3Beat[], stanceAt: (offset: number) => BossStance): Table => {
    if (length < 1) throw new RangeError(`the ${stage} stage needs at least 1 tick, not ${length}`);
    return slotTable(Array.from({ length }, (_, offset) => slot(stage, stanceAt(offset), beatsAt(offset))), stage);
  };
  const chasing = (): BossStance => "chasing";
  const move = (beat: P3Beat) => (offset: number): readonly P3Beat[] => (offset === 0 ? [beat] : []);

  const saws = Array.from({ length: spin.saws.value[quadrant] }, (_, saw) => ({ saw, cut: spin.firstCut.value + saw * spin.cutEvery.value }));
  const lastCut = saws[saws.length - 1].cut;
  const spinTable = table(
    "spin",
    lastCut + spin.nextMoveAfterLastCut.value,
    (offset) => [
      ...(offset === 0 ? [{ kind: "spin-starts" } as const] : []),
      ...(offset === rubble.intoSpin.value[kind] ? [{ kind: "rubble-shows" } as const] : []),
      ...saws.flatMap(({ saw, cut }): P3Beat[] => {
        if (offset === cut - 1) return [{ kind: "saw-tell", saw }];
        if (offset === cut) return [{ kind: "saw-cut", saw, last: cut === lastCut }];
        return [];
      }),
    ],
    (offset) => (offset < lastCut ? "standing" : "chasing"),
  );

  const { magic, slam, fallsOrStandsAt } = untether;
  const untetherTable = table(
    "untether",
    fallsOrStandsAt.value,
    (offset) => [
      ...(offset === 0 ? [{ kind: "untether-starts" } as const] : []),
      ...(magic.value.some((t) => t === offset) ? [{ kind: "untether-magic" } as const] : []),
      ...(offset === slam.value ? [{ kind: "untether-slam" } as const] : []),
      ...(offset === slam.value + 1 ? [{ kind: "untether-aftershock" } as const] : []),
    ],
    () => "levitating",
  );

  const insolenceTable = table(
    "insolence",
    insolence.swingsAgain.value,
    (offset) => [...(offset === 0 ? [{ kind: "insolence-starts" } as const] : []), ...insolence.slashes.value.flatMap((t, nth): P3Beat[] => (t === offset ? [{ kind: "superior-slash", nth }] : []))],
    chasing,
  );

  const destroyTable = table(
    "destroy",
    COLLAPSE_LENGTH,
    (offset) => [
      ...(offset === 0 ? [{ kind: "quadrant-falls" } as const] : []),
      ...(offset === quadrants.escapeShoutAt.value ? [{ kind: "escape-shout" } as const] : []),
      ...(offset === quadrants.goneAt.value ? [{ kind: "quadrant-gone" } as const] : []),
    ],
    (offset) => (offset < quadrants.fadesAt.value ? "standing" : "hidden"),
  );

  const others = kind === "first" ? specials.value.firstQuadrant : specials.value.laterQuadrants;
  const nextSpecial = (visits: (stage: P3Stage) => number): P3Stage => {
    const spinsHere = visits("spin");
    const othersHere = visits("untether") + visits("insolence");
    const spinTurn = (spinsHere + othersHere) % 2 === (spinFirst ? 0 : 1);
    return spinTurn ? "spin" : others[othersHere % others.length];
  };
  const afterSwingOrPanic = (visits: (stage: P3Stage) => number): P3Stage => ((visits("swing") + visits("panic")) % 2 === 1 ? "swing" : "shadow-slash");
  const script: Script<P3Stage, P3Phase, P3Beat> = {
    first: "arrive",
    stages: {
      arrive: { slots: table("arrive", firstAttackAfterStart.value, () => [], chasing), breakable: true, then: () => "swing" },
      swing: { slots: table("swing", chain.afterSwing.value, move({ kind: "swing" }), chasing), breakable: true, then: (_, visits) => afterSwingOrPanic(visits) },
      panic: { slots: table("panic", chain.afterPanic.value, move({ kind: "panic" }), chasing), breakable: true, then: (_, visits) => afterSwingOrPanic(visits) },
      "shadow-slash": {
        slots: table("shadow-slash", chain.afterSlash.value, move({ kind: "shadow-slash" }), chasing),
        breakable: true,
        then: (_, visits) => (visits("shadow-slash") % chain.setsBeforeSpecial.value !== 0 ? "swing" : nextSpecial(visits)),
      },
      spin: { slots: spinTable, breakable: true, then: () => "swing" },
      untether: { slots: untetherTable, breakable: false, then: () => "untether-ends" },
      "untether-ends": { slots: table("untether-ends", untether.swingsAgain.value - fallsOrStandsAt.value, () => [], chasing), breakable: true, then: () => "swing" },
      insolence: { slots: insolenceTable, breakable: true, then: () => "swing" },
      destroy: { slots: destroyTable, breakable: false, then: () => "destroy" },
    },
    breakpoints: [{ atOrBelow: thresholds.value[quadrant], enter: "destroy" }],
  };
  return new Schedule<P3Stage, P3Phase, P3Beat, never>(script, () => null, { kind: "full-fight" }, { kind: "cycle-start" }, tick(0));
}
