import type { Cycle, HpFraction, Tick, TickSpan } from "./brands";
import { cycle, tick } from "./brands";

export type Moment<P, B> = Readonly<{ tick: Tick; phase: P; beats: readonly B[] }>;
export type BeatAt<B> = (visitNumber: Cycle, visitStart: Tick) => B | null;
export type Slot<P, B> = Readonly<{ phase: (visitNumber: Cycle) => P; beats: readonly BeatAt<B>[] }>;

export type Focus<M extends string> = Readonly<{ kind: "full-fight" }> | Readonly<{ kind: "drill"; mechanics: readonly [M, ...M[]] }>;
export type DrillStart = Readonly<{ kind: "before-first-beat"; lead: TickSpan }> | Readonly<{ kind: "cycle-start" }>;

export type Visit<S extends string> = Readonly<{ stage: S; start: Tick; number: Cycle; entered: "first" | "table-ended" | "breakpoint" | "cut" }>;

type NoInfer<S> = [S][S extends unknown ? 0 : never];

export type Stage<S extends string, P, B> = Readonly<{
  slots: readonly [Slot<P, B>, ...Slot<P, B>[]];
  breakable: boolean;
  /** `visits(stage)` counts that stage's visits so far, the one that ended included. */
  then: (ended: Visit<S>, visits: (stage: S) => number) => S;
}>;

export type Breakpoint<S extends string> = Readonly<{ atOrBelow: HpFraction; enter: S }>;

type IsWideStageName<S extends string> = true extends (S extends unknown ? ({} extends Record<S, unknown> ? true : false) : never) ? true : false;
type StageName<S extends string> = IsWideStageName<S> extends true ? Readonly<{ "stage names must be string literals": S }> : NoInfer<S>;

export type Script<S extends string, P, B> = Readonly<{
  first: StageName<S>;
  stages: Readonly<Record<S, Stage<NoInfer<S>, P, B>>>;
  breakpoints: readonly Breakpoint<NoInfer<S>>[];
}>;

export type BossHp = Readonly<{ hp: number; maxHp: number }>;

export function slotTable<P, B>(slots: readonly Slot<P, B>[], stage: string): readonly [Slot<P, B>, ...Slot<P, B>[]] {
  if (slots.length === 0) throw new RangeError(`the ${stage} stage has an empty table`);
  return [slots[0], ...slots.slice(1)];
}

class UnknownStage extends RangeError {
  override readonly name = "UnknownStage";

  constructor(stage: unknown) {
    super(`the script names ${stage}, a stage it does not define`);
  }
}

function assertStage<S extends string>(stages: Readonly<Record<S, unknown>>, stage: unknown): asserts stage is S {
  if (typeof stage !== "string" || !Object.prototype.hasOwnProperty.call(stages, stage)) throw new UnknownStage(stage);
}

type Entry<S extends string> = Readonly<{ visit: Visit<S>; visits: ReadonlyMap<S, number> }>;

function enter<S extends string>(stage: S, start: Tick, entered: Visit<S>["entered"], before: ReadonlyMap<S, number>): Entry<S> {
  const number = (before.get(stage) ?? 0) + 1;
  return { visit: { stage, start, number: cycle(number), entered }, visits: new Map(before).set(stage, number) };
}

class Visits<S extends string, P, B> {
  private latest: Entry<S>;

  static of<S extends string, P, B>(script: Script<S, P, B>): Visits<S, P, B> {
    const { first, stages, breakpoints } = script;
    assertStage(stages, first);
    for (const breakpoint of breakpoints) assertStage(stages, breakpoint.enter);
    return new Visits(script, [enter<S>(first, tick(0), "first", new Map())]);
  }

  private constructor(
    private readonly script: Script<S, P, B>,
    private readonly runStarts: readonly Entry<S>[],
    private previous: Entry<S> | null = null,
  ) {
    this.latest = runStarts[runStarts.length - 1];
  }

  at(t: Tick): Visit<S> {
    return this.entryAt(t).visit;
  }

  firedBefore(t: Tick): number {
    return this.runStarts.filter(({ visit }) => visit.entered === "breakpoint" && visit.start < t).length;
  }

  cutAt(t: Tick, stage: S, entered: "breakpoint" | "cut"): Visits<S, P, B> {
    const before = t === 0 ? null : this.entryAt(tick(t - 1));
    const kept = this.runStarts.filter(({ visit }) => visit.start < t);
    return new Visits(this.script, [...kept, enter(stage, t, entered, before?.visits ?? new Map())], before);
  }

  private entryAt(t: Tick): Entry<S> {
    if (t >= this.latest.visit.start) {
      while (t >= this.end(this.latest)) {
        this.previous = this.latest;
        this.latest = this.successor(this.previous);
      }
      return this.latest;
    }
    if (this.previous !== null && t >= this.previous.visit.start) return this.previous;
    let entry = this.runStarts[0];
    for (const start of this.runStarts) if (start.visit.start <= t) entry = start;
    while (t >= this.end(entry)) entry = this.successor(entry);
    return entry;
  }

  private end({ visit }: Entry<S>): Tick {
    return tick(visit.start + this.script.stages[visit.stage].slots.length);
  }

  private successor(entry: Entry<S>): Entry<S> {
    const { visit, visits } = entry;
    const next = this.script.stages[visit.stage].then(visit, (stage) => visits.get(stage) ?? 0);
    assertStage(this.script.stages, next);
    return enter<S>(next, this.end(entry), "table-ended", visits);
  }
}

export class Schedule<S extends string, P, B, M extends string> {
  readonly start: Tick;

  constructor(
    private readonly script: Script<S, P, B>,
    private readonly mechanicOf: (beat: B) => M | null,
    private readonly focus: Focus<M>,
    private readonly drillStart: DrillStart,
    private readonly horizon: Tick,
    private readonly visits: Visits<S, P, B> = Visits.of(script),
  ) {
    this.start = this.startTick(Visits.of(script));
  }

  private startTick(unadvanced: Visits<S, P, B>): Tick {
    if (this.focus.kind === "full-fight") return tick(0);
    switch (this.drillStart.kind) {
      case "cycle-start":
        return tick(0);
      case "before-first-beat": {
        for (let t = 0; t < this.horizon; t++) {
          if (this.momentIn(unadvanced, tick(t)).beats.some((beat) => this.mechanicOf(beat) !== null)) return tick(Math.max(0, t - this.drillStart.lead));
        }
        return tick(0);
      }
      default: {
        const unhandled: never = this.drillStart;
        return unhandled;
      }
    }
  }

  acts(mechanic: M): boolean {
    return this.focus.kind === "full-fight" || this.focus.mechanics.includes(mechanic);
  }

  at(t: Tick): Moment<P, B> {
    return this.momentIn(this.visits, t);
  }

  visitAt(t: Tick): Visit<S> {
    return this.visits.at(t);
  }

  breakpointsFiredBy(t: Tick): number {
    return this.visits.firedBefore(tick(t + 1));
  }

  advance(t: Tick, boss: BossHp): Schedule<S, P, B, M> {
    const next = this.script.breakpoints[this.visits.firedBefore(t)];
    if (next === undefined || !this.script.stages[this.visitAt(t).stage].breakable || boss.hp > Math.floor(boss.maxHp * next.atOrBelow)) return this;
    return new Schedule(this.script, this.mechanicOf, this.focus, this.drillStart, this.horizon, this.visits.cutAt(t, next.enter, "breakpoint"));
  }

  /** Enters `stage` at `t` in place of the visit running there, for a turn that branches on a fact other than HP. Breakpoints still fire in order. */
  cut(t: Tick, stage: S): Schedule<S, P, B, M> {
    return new Schedule(this.script, this.mechanicOf, this.focus, this.drillStart, this.horizon, this.visits.cutAt(t, stage, "cut"));
  }

  private momentIn(visits: Visits<S, P, B>, t: Tick): Moment<P, B> {
    const visit = visits.at(t);
    const slot = this.script.stages[visit.stage].slots[t - visit.start];
    const beats = slot.beats.flatMap((beat) => beat(visit.number, visit.start) ?? []).filter((beat) => {
      const mechanic = this.mechanicOf(beat);
      return mechanic === null || this.acts(mechanic);
    });
    return { tick: t, phase: slot.phase(visit.number), beats };
  }
}
