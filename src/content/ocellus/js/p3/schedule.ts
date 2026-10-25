import { OCELLUS_P3 } from "../OcellusTimings";
import { tick } from "../../../../sim/brands";
import type { TickSpan } from "../../../../sim/brands";
import type { Script, Slot } from "../../../../sim/schedule";
import { Schedule, slotTable } from "../../../../sim/schedule";
import type { P3Beat, P3Phase, P3Stage, Quadrant, Spin, SpinCount } from "../P3Types";

export type P3Schedule = Schedule<P3Stage, P3Phase, P3Beat, never>;

const QUADRANTS: readonly Quadrant[] = [1, 2, 3];
const SMITE_STAGE: Readonly<Record<SpinCount, P3Stage>> = { 1: "smite-1", 2: "smite-2", 3: "smite-3" };
const SPINS: Readonly<Record<SpinCount, readonly Spin[]>> = {
  1: [{ nth: 1, of: 1 }],
  2: [{ nth: 1, of: 2 }, { nth: 2, of: 2 }],
  3: [{ nth: 1, of: 3 }, { nth: 2, of: 3 }, { nth: 3, of: 3 }],
};

const slot = (stage: P3Stage, ...beats: readonly P3Beat[]): Slot<P3Phase, P3Beat> => {
  const phase: P3Phase = { stage };
  return { phase: () => phase, beats: beats.map((beat) => () => beat) };
};

function atLeastOne(name: string, gap: TickSpan): TickSpan {
  if (gap < 1) throw new RangeError(`${name} needs at least 1 tick, not ${gap}`);
  return gap;
}

function autosTable(): readonly Slot<P3Phase, P3Beat>[] {
  return OCELLUS_P3.autos.value.flatMap(({ attack, next }) => {
    const beat: P3Beat = attack === "melee" ? { kind: "reach-attack" } : { kind: "wave-cast" };
    return [slot("autos", beat), ...Array.from({ length: atLeastOne("the gap after an auto-attack", next) - 1 }, () => slot("autos"))];
  });
}

function smiteTable(count: SpinCount): readonly Slot<P3Phase, P3Beat>[] {
  const stage = SMITE_STAGE[count];
  const first = atLeastOne("the smite's first spin", OCELLUS_P3.smite.firstLandsAfterStart.value);
  const gap = atLeastOne("the gap between spins", OCELLUS_P3.smite.spinGap.value);
  const resume = atLeastOne("the autos after the last spin", OCELLUS_P3.smite.autosResumeAfterLastSpin.value);
  const landings = new Map(SPINS[count].map((spin, k) => [first + k * gap, spin]));
  return Array.from({ length: first + (count - 1) * gap + resume }, (_, at) => {
    const spin = landings.get(at);
    if (at === 0) return slot(stage, { kind: "smite-opens" });
    return spin ? slot(stage, { kind: "spin-lands", spin }) : slot(stage);
  });
}

export function compileP3Schedule(start: Quadrant): P3Schedule {
  const { firstAttackAfterStart, thresholds, smite } = OCELLUS_P3;
  const arrive = Array.from({ length: firstAttackAfterStart.value }, () => slot("arrive"));
  const smiteStage = (count: SpinCount) => ({ slots: slotTable(smiteTable(count), SMITE_STAGE[count]), breakable: true, then: (): P3Stage => "autos" });
  const script: Script<P3Stage, P3Phase, P3Beat> = {
    first: "arrive",
    stages: {
      arrive: { slots: slotTable(arrive, "arrive"), breakable: true, then: () => "autos" },
      autos: { slots: slotTable(autosTable(), "autos"), breakable: true, then: () => SMITE_STAGE[smite.spinsByQuadrant.value[start]] },
      "smite-1": smiteStage(1),
      "smite-2": smiteStage(2),
      "smite-3": smiteStage(3),
      destroy: { slots: [slot("destroy", { kind: "quadrant-cleared" })], breakable: false, then: () => "destroy" },
    },
    breakpoints: QUADRANTS.filter((quadrant) => quadrant >= start).map((quadrant) => ({ atOrBelow: thresholds.value[quadrant], enter: "destroy" })),
  };
  return new Schedule<P3Stage, P3Phase, P3Beat, never>(script, () => null, { kind: "full-fight" }, { kind: "cycle-start" }, tick(0));
}
