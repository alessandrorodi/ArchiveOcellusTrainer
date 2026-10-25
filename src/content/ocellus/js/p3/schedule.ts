import { OCELLUS_P3 } from "../OcellusTimings";
import { tick } from "../../../../sim/brands";
import type { Script, Slot } from "../../../../sim/schedule";
import { Schedule, slotTable } from "../../../../sim/schedule";
import type { BossStance, P3Beat, P3Phase, P3Stage, Quadrant } from "../P3Types";

export type P3Schedule = Schedule<P3Stage, P3Phase, P3Beat, never>;

type Table = readonly [Slot<P3Phase, P3Beat>, ...Slot<P3Phase, P3Beat>[]];

const QUADRANTS: readonly Quadrant[] = [1, 2, 3];
const { chain, specials, spin, untether, insolence, rubble } = OCELLUS_P3;

const slot = (stage: P3Stage, boss: BossStance, beats: readonly P3Beat[]): Slot<P3Phase, P3Beat> => {
  const phase: P3Phase = { stage, boss };
  return { phase: () => phase, beats: beats.map((beat) => () => beat) };
};

/** A table `length` long, whose slot at each offset gets that offset's beats and stance. */
function table(stage: P3Stage, length: number, beatsAt: (offset: number) => readonly P3Beat[], stanceAt: (offset: number) => BossStance): Table {
  if (length < 1) throw new RangeError(`the ${stage} stage needs at least 1 tick, not ${length}`);
  return slotTable(Array.from({ length }, (_, offset) => slot(stage, stanceAt(offset), beatsAt(offset))), stage);
}

const chasing = (): BossStance => "chasing";
const move = (beat: P3Beat) => (offset: number): readonly P3Beat[] => (offset === 0 ? [beat] : []);

function spinTable(): Table {
  const saws = Array.from({ length: spin.saws.value }, (_, saw) => ({ saw, cut: spin.firstCut.value + saw * spin.cutEvery.value }));
  const lastCut = saws[saws.length - 1].cut;
  return table(
    "spin",
    lastCut + spin.nextMoveAfterLastCut.value,
    (offset) => [
      ...(offset === 0 ? [{ kind: "spin-starts" } as const] : []),
      ...(offset === rubble.intoSpin.value ? [{ kind: "rubble-shows" } as const] : []),
      ...saws.flatMap(({ saw, cut }): P3Beat[] => {
        if (offset === cut - 1) return [{ kind: "saw-tell", saw }];
        if (offset === cut) return [{ kind: "saw-cut", saw, last: cut === lastCut }];
        return [];
      }),
    ],
    (offset) => (offset < lastCut ? "standing" : "chasing"),
  );
}

function untetherTable(): Table {
  const { magic, slam, fallsOrStandsAt } = untether;
  const at = (offset: number, ticks: readonly number[]) => ticks.some((t) => t === offset);
  return table(
    "untether",
    fallsOrStandsAt.value,
    (offset) => [
      ...(offset === 0 ? [{ kind: "untether-starts" } as const] : []),
      ...(at(offset, magic.value) ? [{ kind: "untether-magic" } as const] : []),
      ...(offset === slam.value ? [{ kind: "untether-slam" } as const] : []),
      ...(offset === slam.value + 1 ? [{ kind: "untether-aftershock" } as const] : []),
    ],
    () => "levitating",
  );
}

function insolenceTable(): Table {
  const slashes = insolence.slashes.value;
  return table(
    "insolence",
    insolence.swingsAgain.value,
    (offset) => [...(offset === 0 ? [{ kind: "insolence-starts" } as const] : []), ...slashes.flatMap((t, nth): P3Beat[] => (t === offset ? [{ kind: "superior-slash", nth }] : []))],
    chasing,
  );
}

/**
 * Phase 3 as a chain of moves: each stage is one move and lasts until the next. Two swings and a slash make a set; after
 * `setsBeforeSpecial` sets comes the next special in turn. A panic is cut in by the turn when a swing finds nobody in reach.
 */
export function compileP3Schedule(): P3Schedule {
  const { firstAttackAfterStart, thresholds } = OCELLUS_P3;
  const order = specials.value;
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
        then: (_, visits) => {
          if (visits("shadow-slash") % chain.setsBeforeSpecial.value !== 0) return "swing";
          return order[(visits("spin") + visits("untether") + visits("insolence")) % order.length];
        },
      },
      spin: { slots: spinTable(), breakable: true, then: () => "swing" },
      untether: { slots: untetherTable(), breakable: false, then: () => "untether-ends" },
      "untether-ends": { slots: table("untether-ends", untether.swingsAgain.value - untether.fallsOrStandsAt.value, () => [], chasing), breakable: true, then: () => "swing" },
      insolence: { slots: insolenceTable(), breakable: true, then: () => "swing" },
      destroy: { slots: [slot("destroy", "standing", [{ kind: "quadrant-falls" }])], breakable: false, then: () => "destroy" },
    },
    breakpoints: QUADRANTS.map((quadrant) => ({ atOrBelow: thresholds.value[quadrant], enter: "destroy" })),
  };
  return new Schedule<P3Stage, P3Phase, P3Beat, never>(script, () => null, { kind: "full-fight" }, { kind: "cycle-start" }, tick(0));
}
