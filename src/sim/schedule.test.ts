import { dirname, resolve } from "node:path";
import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import type { Tick } from "./brands";
import { hpFraction, tick } from "./brands";
import type { Breakpoint, Script, Slot, Stage, Visit } from "./schedule";
import { Schedule, slotTable } from "./schedule";

const named = (name: string): Slot<string, string> => ({ phase: (visit) => `${name} #${visit}`, beats: [(visit, start) => `${name} of visit ${visit} from ${start}`] });
const stage = <S extends string>(name: string, length: number, breakable: boolean, then: Stage<S, string, string>["then"]): Stage<S, string, string> => ({
  slots: slotTable(Array.from({ length }, (_, offset) => named(`${name}-${offset}`)), name),
  breakable,
  then,
});
const schedule = <S extends string>(script: Script<S, string, string>) => new Schedule(script, () => null, { kind: "full-fight" }, { kind: "cycle-start" }, tick(0));
const ticks = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, offset) => tick(from + offset));

describe("a schedule of named stages", () => {
  test("a two-stage script reads each table from the tick its stage is entered, across the table's end", () => {
    type LeadAndCycle = "lead-in" | "cycle";
    const leadAndCycle = schedule<LeadAndCycle>({
      first: "lead-in",
      stages: { "lead-in": stage<LeadAndCycle>("lead-in", 2, false, () => "cycle"), cycle: stage<LeadAndCycle>("cycle", 3, false, () => "cycle") },
      breakpoints: [],
    });

    expect(ticks(0, 7).map((t) => leadAndCycle.at(t))).toEqual([
      { tick: 0, phase: "lead-in-0 #1", beats: ["lead-in-0 of visit 1 from 0"] },
      { tick: 1, phase: "lead-in-1 #1", beats: ["lead-in-1 of visit 1 from 0"] },
      { tick: 2, phase: "cycle-0 #1", beats: ["cycle-0 of visit 1 from 2"] },
      { tick: 3, phase: "cycle-1 #1", beats: ["cycle-1 of visit 1 from 2"] },
      { tick: 4, phase: "cycle-2 #1", beats: ["cycle-2 of visit 1 from 2"] },
      { tick: 5, phase: "cycle-0 #2", beats: ["cycle-0 of visit 2 from 5"] },
      { tick: 6, phase: "cycle-1 #2", beats: ["cycle-1 of visit 2 from 5"] },
      { tick: 7, phase: "cycle-2 #2", beats: ["cycle-2 of visit 2 from 5"] },
    ]);
  });

  test("a stage's successor reads how often each stage has been entered", () => {
    type Rotation = "autos" | "smite" | "untether";
    const alternating = schedule<Rotation>({
      first: "autos",
      stages: {
        autos: stage<Rotation>("autos", 2, true, (_, visits) => (visits("autos") > 1 ? "untether" : "smite")),
        smite: stage<Rotation>("smite", 1, true, () => "autos"),
        untether: stage<Rotation>("untether", 1, true, () => "autos"),
      },
      breakpoints: [],
    });

    expect(ticks(0, 8).map((t) => alternating.visitAt(t))).toEqual([
      { stage: "autos", start: 0, number: 1, entered: "first" },
      { stage: "autos", start: 0, number: 1, entered: "first" },
      { stage: "smite", start: 2, number: 1, entered: "table-ended" },
      { stage: "autos", start: 3, number: 2, entered: "table-ended" },
      { stage: "autos", start: 3, number: 2, entered: "table-ended" },
      { stage: "untether", start: 5, number: 1, entered: "table-ended" },
      { stage: "autos", start: 6, number: 3, entered: "table-ended" },
      { stage: "autos", start: 6, number: 3, entered: "table-ended" },
      { stage: "untether", start: 8, number: 2, entered: "table-ended" },
    ]);
  });
});

describe("HP breakpoints", () => {
  type Quadrant = "fight" | "destroy" | "q2" | "q3";
  const stages = (): Script<Quadrant, string, string>["stages"] => ({
    fight: stage<Quadrant>("fight", 4, true, () => "fight"),
    destroy: stage<Quadrant>("destroy", 2, false, () => "fight"),
    q2: stage<Quadrant>("q2", 4, true, () => "q2"),
    q3: stage<Quadrant>("q3", 4, true, () => "q3"),
  });
  const run = (breakpoints: readonly Breakpoint<Quadrant>[], first: Quadrant, hpByTick: readonly number[]) =>
    hpByTick.reduce((advanced, hp, t) => advanced.advance(tick(t), { hp, maxHp: 101 }), schedule({ first, stages: stages(), breakpoints }));

  test("a 0.5 breakpoint fires on the tick HP reaches ⌊101 × 0.5⌋ = 50, and not at 51", () => {
    const at51 = run([{ atOrBelow: hpFraction(0.5), enter: "destroy" }], "fight", [101, 51]);
    const at50 = at51.advance(tick(2), { hp: 50, maxHp: 101 });

    expect(at51.visitAt(tick(2))).toEqual({ stage: "fight", start: 0, number: 1, entered: "first" });
    expect(ticks(1, 4).map((t) => at50.visitAt(t))).toEqual([
      { stage: "fight", start: 0, number: 1, entered: "first" },
      { stage: "destroy", start: 2, number: 1, entered: "breakpoint" },
      { stage: "destroy", start: 2, number: 1, entered: "breakpoint" },
      { stage: "fight", start: 4, number: 2, entered: "table-ended" },
    ]);
    expect(at50.at(tick(2))).toEqual({ tick: 2, phase: "destroy-0 #1", beats: ["destroy-0 of visit 1 from 2"] });
    expect(ticks(1, 2).map((t) => at50.breakpointsFiredBy(t))).toEqual([0, 1]);
  });

  test("guard: a tick read after later ticks gets the visit a forward read gets", () => {
    const repeat = <T>(count: number, value: T): T[] => Array.from({ length: count }, () => value);
    const expected = [
      ...repeat(2, { stage: "fight", start: 0, number: 1, entered: "first" }),
      ...repeat(2, { stage: "destroy", start: 2, number: 1, entered: "breakpoint" }),
      ...repeat(4, { stage: "fight", start: 4, number: 2, entered: "table-ended" }),
      ...repeat(4, { stage: "fight", start: 8, number: 3, entered: "table-ended" }),
      { stage: "fight", start: 12, number: 4, entered: "table-ended" },
    ];
    const cut = () => run([{ atOrBelow: hpFraction(0.5), enter: "destroy" }], "fight", [101, 101, 50]);
    const [forward, backward] = [cut(), cut()];

    expect({
      forward: ticks(0, 12).map((t) => forward.visitAt(t)),
      backward: ticks(0, 12)
        .reverse()
        .map((t) => backward.visitAt(t))
        .reverse(),
    }).toEqual({ forward: expected, backward: expected });
  });

  test("a breakpoint reached during an unbreakable stage fires on the first breakable tick", () => {
    const fired = run(
      [
        { atOrBelow: hpFraction(0.75), enter: "destroy" },
        { atOrBelow: hpFraction(0.5), enter: "destroy" },
      ],
      "fight",
      [101, 40, 40, 40, 40],
    );

    expect(ticks(1, 4).map((t) => fired.visitAt(t))).toEqual([
      { stage: "destroy", start: 1, number: 1, entered: "breakpoint" },
      { stage: "destroy", start: 1, number: 1, entered: "breakpoint" },
      { stage: "destroy", start: 3, number: 2, entered: "breakpoint" },
      { stage: "destroy", start: 3, number: 2, entered: "breakpoint" },
    ]);
    expect(ticks(1, 4).map((t) => fired.breakpointsFiredBy(t))).toEqual([1, 1, 2, 2]);
  });

  test("each breakpoint fires once, in order, one a tick", () => {
    const fired = run(
      [
        { atOrBelow: hpFraction(0.75), enter: "q2" },
        { atOrBelow: hpFraction(0.5), enter: "q3" },
      ],
      "fight",
      [101, 40, 40, 40, 40, 40],
    );

    expect(ticks(0, 5).map((t) => fired.visitAt(t).stage)).toEqual(["fight", "q2", "q3", "q3", "q3", "q3"]);
    expect(fired.visitAt(tick(5))).toEqual({ stage: "q3", start: 2, number: 1, entered: "breakpoint" });
    expect(ticks(0, 5).map((t) => fired.breakpointsFiredBy(t))).toEqual([0, 1, 2, 2, 2, 2]);
  });
});

describe("cuts", () => {
  type Chain = "swing" | "panic" | "destroy";
  const chain = (): Script<Chain, string, string> => ({
    first: "swing",
    stages: {
      swing: stage<Chain>("swing", 3, true, () => "swing"),
      panic: stage<Chain>("panic", 6, true, () => "swing"),
      destroy: stage<Chain>("destroy", 2, false, () => "destroy"),
    },
    breakpoints: [{ atOrBelow: hpFraction(0.5), enter: "destroy" }],
  });

  test("a cut enters its stage on its tick, so the table after it runs from there", () => {
    const cut = schedule(chain()).cut(tick(3), "panic");

    expect(ticks(2, 9).map((t) => cut.visitAt(t))).toEqual([
      { stage: "swing", start: 0, number: 1, entered: "first" },
      { stage: "panic", start: 3, number: 1, entered: "cut" },
      { stage: "panic", start: 3, number: 1, entered: "cut" },
      { stage: "panic", start: 3, number: 1, entered: "cut" },
      { stage: "panic", start: 3, number: 1, entered: "cut" },
      { stage: "panic", start: 3, number: 1, entered: "cut" },
      { stage: "panic", start: 3, number: 1, entered: "cut" },
      { stage: "swing", start: 9, number: 2, entered: "table-ended" },
    ]);
    expect(cut.at(tick(3))).toEqual({ tick: 3, phase: "panic-0 #1", beats: ["panic-0 of visit 1 from 3"] });
  });

  test("a cut is not a breakpoint, so the first breakpoint still fires after it", () => {
    const cut = schedule(chain()).cut(tick(3), "panic").advance(tick(5), { hp: 50, maxHp: 100 });

    expect([cut.visitAt(tick(5)), cut.breakpointsFiredBy(tick(5))]).toEqual([{ stage: "destroy", start: 5, number: 1, entered: "breakpoint" }, 1]);
  });
});

describe("the stage contract", () => {
  const header = [
    'import { Schedule, slotTable, type Script, type Slot, type Stage, type Visit } from "./schedule";',
    'import { hpFraction, tick } from "./brands";',
    'const slot: Slot<string, string> = { phase: () => "fight", beats: [] };',
  ];
  const rest = '() => null, { kind: "full-fight" }, { kind: "cycle-start" }, tick(0)';
  const compileErrors = (probes: Readonly<Record<string, readonly string[]>>): Readonly<Record<string, readonly string[]>> => {
    const config = ts.findConfigFile(__dirname, ts.sys.fileExists);
    if (config === undefined) throw new Error("no tsconfig.json above src/sim");
    const options = { ...ts.parseJsonConfigFileContent(ts.readConfigFile(config, ts.sys.readFile).config, ts.sys, dirname(config)).options, noEmit: true, types: [] };
    const files = new Map(Object.entries(probes).map(([name, lines]) => [resolve(__dirname, `stage-contract-${name}.ts`), [...header, ...lines].join("\n")]));
    const host = ts.createCompilerHost(options);
    const getSourceFile = host.getSourceFile;
    host.getSourceFile = (file, language, ...more) => {
      const text = files.get(file);
      return text === undefined ? getSourceFile(file, language, ...more) : ts.createSourceFile(file, text, language);
    };
    const program = ts.createProgram([...files.keys()], options, host);
    const errorsIn = (file: string) =>
      ts.getPreEmitDiagnostics(program, program.getSourceFile(file)).map((diagnostic) => {
        const line = diagnostic.file === undefined || diagnostic.start === undefined ? 0 : diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1;
        const chain = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n").split("\n");
        return `${line}: ${chain[chain.length - 1].trim()}`;
      });
    return Object.fromEntries(Object.keys(probes).map((name) => [name, errorsIn(resolve(__dirname, `stage-contract-${name}.ts`))]));
  };

  test("stage names come from the stage table's keys alone and must each be a literal, so no position can widen them to string", () => {
    expect(
      compileErrors({
        valid: [
          'const annotated: Script<"fight", string, string> = { first: "fight", stages: { fight: { slots: [slot], breakable: true, then: () => "fight" } }, breakpoints: [{ atOrBelow: hpFraction(0.5), enter: "fight" }] };',
          `export const fromAnnotation = new Schedule(annotated, ${rest});`,
          'const builtFirst = { fight: { slots: slotTable([slot], "fight"), breakable: true, then: (_ended: Visit<string>): "fight" => "fight" } };',
          `export const fromTableBuiltFirst = new Schedule({ first: "fight", stages: builtFirst, breakpoints: [] }, ${rest});`,
          "export const inferred = new Schedule(",
          '  { first: "fight", stages: { fight: { slots: [slot], breakable: true, then: (_ended: Visit<string>) => "destroy" }, destroy: { slots: [slot], breakable: false, then: () => "fight" } }, breakpoints: [{ atOrBelow: hpFraction(0.5), enter: "destroy" }] },',
          `  ${rest},`,
          ");",
          'export const stage: "fight" | "destroy" = inferred.visitAt(tick(0)).stage;',
        ],
        "table-built-first": [
          'const stages = { fight: { slots: slotTable([slot], "fight"), breakable: true, then: () => "fight" } };',
          `export const schedule = new Schedule({ first: "fight", stages, breakpoints: [{ atOrBelow: hpFraction(0.5), enter: "unknown" }] }, ${rest});`,
        ],
        "table-built-first-successor-parameter-visit-string": [
          'const stages = { fight: { slots: slotTable([slot], "fight"), breakable: true, then: (_ended: Visit<string>) => "unknown" } };',
          `export const schedule = new Schedule({ first: "fight", stages, breakpoints: [] }, ${rest});`,
        ],
        "successor-parameter-visit-string": [
          `export const schedule = new Schedule({ first: "fight", stages: { fight: { slots: [slot], breakable: true, then: (_ended: Visit<string>) => "unknown" } }, breakpoints: [] }, ${rest});`,
        ],
        "successor-method-string-parameters": [
          `export const schedule = new Schedule({ first: "fight", stages: { fight: { slots: [slot], breakable: true, then(_ended: Visit<string>, _visits: (stage: string) => number) { return "unknown"; } } }, breakpoints: [] }, ${rest});`,
        ],
        "unknown-breakpoint": [
          `export const schedule = new Schedule({ first: "fight", stages: { fight: { slots: [slot], breakable: true, then: () => "fight" } }, breakpoints: [{ atOrBelow: hpFraction(0.5), enter: "unknown" }] }, ${rest});`,
        ],
        "unknown-first": [`export const schedule = new Schedule({ first: "unknown", stages: { fight: { slots: [slot], breakable: true, then: () => "fight" } }, breakpoints: [] }, ${rest});`],
        "stage-typed-string": [
          'const fight: Stage<string, string, string> = { slots: [slot], breakable: true, then: () => "unknown" };',
          `export const schedule = new Schedule({ first: "fight", stages: { fight }, breakpoints: [] }, ${rest});`,
        ],
        "table-typed-record-string": [
          'const stages: Record<string, Stage<string, string, string>> = { fight: { slots: [slot], breakable: true, then: () => "fight" } };',
          `export const schedule = new Schedule({ first: "unknown", stages, breakpoints: [] }, ${rest});`,
        ],
        "explicit-string-type-argument": [
          `export const schedule = new Schedule<string, string, string, string>({ first: "unknown", stages: { fight: { slots: [slot], breakable: true, then: () => "fight" } }, breakpoints: [] }, ${rest});`,
        ],
        "empty-table": [`export const schedule = new Schedule({ first: "fight", stages: {}, breakpoints: [] }, ${rest});`],
        "table-typed-literal-or-open-string": [
          'type Names = "fight" | (string & {});',
          'const stages: Record<Names, Stage<Names, string, string>> = { fight: { slots: [slot], breakable: true, then: () => "unknown" } };',
          `export const schedule = new Schedule({ first: "fight", stages, breakpoints: [] }, ${rest});`,
        ],
        "table-typed-literal-or-pattern": [
          "type Names = \"fight\" | `stage-${string}`;",
          'const stages: Record<Names, Stage<Names, string, string>> = { fight: { slots: [slot], breakable: true, then: () => "fight" } };',
          `export const schedule = new Schedule({ first: "fight", stages, breakpoints: [{ atOrBelow: hpFraction(0.5), enter: "stage-unknown" }] }, ${rest});`,
        ],
      }),
    ).toEqual({
      valid: [],
      "table-built-first": ["5: Type 'string' is not assignable to type '\"fight\"'.", "5: Type '\"unknown\"' is not assignable to type '\"fight\"'."],
      "table-built-first-successor-parameter-visit-string": ["5: Type 'string' is not assignable to type '\"fight\"'."],
      "successor-parameter-visit-string": ["4: Type '\"unknown\"' is not assignable to type '\"fight\"'."],
      "successor-method-string-parameters": ["4: Type 'string' is not assignable to type '\"fight\"'."],
      "unknown-breakpoint": ["4: Type '\"unknown\"' is not assignable to type '\"fight\"'."],
      "unknown-first": ["4: Type '\"unknown\"' is not assignable to type '\"fight\"'."],
      "stage-typed-string": [
        "5: Type '(ended: Readonly<{ stage: string; start: Tick; number: Cycle; entered: \"first\" | \"table-ended\" | \"breakpoint\" | \"cut\"; }>, visits: (stage: string) => number) => string' is not assignable to type '(ended: Readonly<{ stage: \"fight\"; start: Tick; number: Cycle; entered: \"first\" | \"table-ended\" | \"breakpoint\" | \"cut\"; }>, visits: (stage: \"fight\") => number) => \"fight\"'.",
      ],
      "table-typed-record-string": ["5: Type 'string' is not assignable to type 'Readonly<{ \"stage names must be string literals\": string; }>'."],
      "explicit-string-type-argument": ["4: Type 'string' is not assignable to type 'Readonly<{ \"stage names must be string literals\": string; }>'."],
      "empty-table": ["4: Type 'string' is not assignable to type 'never'."],
      "table-typed-literal-or-open-string": ["6: Type 'string' is not assignable to type 'Readonly<{ \"stage names must be string literals\": Names; }>'."],
      "table-typed-literal-or-pattern": ["6: Type 'string' is not assignable to type 'Readonly<{ \"stage names must be string literals\": Names; }>'."],
    });
  });

  test("a stage name the types cannot vouch for is refused by name, at construction for the first stage and breakpoint targets and on the transition for a successor", () => {
    type Rotation = "autos" | "smite";
    const rotation: readonly Rotation[] = ["autos", "smite"];
    const build = (first: Rotation, enter: Rotation) =>
      schedule<Rotation>({
        first,
        stages: { autos: stage<Rotation>("autos", 2, true, (_, visits) => rotation[visits("autos")]), smite: stage<Rotation>("smite", 1, true, () => "autos") },
        breakpoints: [{ atOrBelow: hpFraction(0.5), enter }],
      });
    const refusal = (run: () => unknown) => {
      try {
        run();
      } catch (error) {
        return error instanceof Error ? `${error.name}: ${error.message}` : error;
      }
      return "no error";
    };
    const valid = build(rotation[0], rotation[1]);

    expect(ticks(0, 4).map((t) => valid.visitAt(t).stage)).toEqual(["autos", "autos", "smite", "autos", "autos"]);
    expect({
      first: refusal(() => build(rotation[2], "smite")),
      breakpoint: refusal(() => build("autos", rotation[2])),
      successor: refusal(() => valid.visitAt(tick(5))),
    }).toEqual({
      first: "UnknownStage: the script names undefined, a stage it does not define",
      breakpoint: "UnknownStage: the script names undefined, a stage it does not define",
      successor: "UnknownStage: the script names undefined, a stage it does not define",
    });
  });
});

declare const WeakRef: new <T extends object>(target: T) => Readonly<{ deref: () => T | undefined }>;
setFlagsFromString("--expose-gc");
const collectGarbage: () => void = runInNewContext("gc");

describe("a long run", () => {
  type Fight = "lead-in" | "cycle" | "destroy";

  test("after 1000 cycles a schedule keeps as many visits, and calls its script as often in the next cycle, as after 10", async () => {
    let calls = 0;
    const counted = (length: number, breakable: boolean, next: Fight): Stage<Fight, string, string> => ({
      slots: slotTable(Array.from({ length }, (): Slot<string, string> => ({ phase: () => `${calls++}`, beats: [] })), next),
      breakable,
      then: () => (calls++, next),
    });
    const script: Script<Fight, string, string> = {
      first: "lead-in",
      stages: { "lead-in": counted(2, false, "cycle"), cycle: counted(5, true, "cycle"), destroy: counted(1, false, "cycle") },
      breakpoints: [{ atOrBelow: hpFraction(0.5), enter: "destroy" }],
    };
    const ticksOfCycle = (n: number) => ticks(2 + 5 * (n - 1), 1 + 5 * n);
    const afterCycles = async (cycles: number) => {
      let fight = schedule(script);
      const turn = (t: Tick) => {
        fight = fight.advance(t, { hp: 100, maxHp: 100 });
        fight.at(t);
        fight.at(tick(t - 1));
      };
      const passed: Readonly<{ deref: () => Visit<Fight> | undefined }>[] = [];
      for (let n = 1; n <= cycles; n++) {
        ticksOfCycle(n).forEach(turn);
        passed.push(new WeakRef(fight.visitAt(ticksOfCycle(n)[0])));
      }
      calls = 0;
      ticksOfCycle(cycles + 1).forEach(turn);
      const callsInNextCycle = calls;
      await new Promise((resolve) => setTimeout(resolve, 0));
      collectGarbage();
      return { callsInNextCycle, visitsKept: passed.filter((visit) => visit.deref() !== undefined).length };
    };

    expect([await afterCycles(10), await afterCycles(1000)]).toEqual([
      { callsInNextCycle: 11, visitsKept: 1 },
      { callsInNextCycle: 11, visitsKept: 1 },
    ]);
  });
});
