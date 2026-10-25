import type { HitReceipt } from "../../../sim/combat";
import type { SpinVerdict } from "../js/P3Types";
import type { At } from "./drill";
import { startP3Drill } from "./p3drill";

const S = 27;
const LANDINGS = { 1: [31], 2: [31, 34], 3: [31, 34, 37] } as const;
const MISSED_SPIN: Readonly<Record<number, number>> = { 31: 43, 34: 43, 37: 45 };
const SPAWN: At = { x: 19, y: 9 };
const RULES = ["on-off-on", "off-then-on", "held-blocks"] as const;

type Rule = (typeof RULES)[number];
type Said = "blocked" | "struck held" | "struck late" | "struck early";
type Prayer = "melee" | null;
type FlickCase = Readonly<{ quadrant: 1 | 2 | 3; name: string; toggles: readonly number[]; prayerAtLandings: readonly Prayer[]; verdicts: Readonly<Record<Rule, readonly Said[]>> }>;

const all = (...said: readonly Said[]): Readonly<Record<Rule, readonly Said[]>> => ({ "on-off-on": said, "off-then-on": said, "held-blocks": said });

const CASES: readonly FlickCase[] = [
  { quadrant: 1, name: "flick: off after S, on after S+3", toggles: [S, S + 3], prayerAtLandings: ["melee"], verdicts: all("blocked") },
  { quadrant: 1, name: "earliest off and back on at once: off after S, on after S+1", toggles: [S, S + 1], prayerAtLandings: ["melee"], verdicts: all("blocked") },
  { quadrant: 1, name: "tightest: off after S+2, on after S+3", toggles: [S + 2, S + 3], prayerAtLandings: ["melee"], verdicts: all("blocked") },
  {
    quadrant: 1,
    name: "off too early: off after S-1, on after S+1",
    toggles: [S - 1, S + 1],
    prayerAtLandings: ["melee"],
    verdicts: { "on-off-on": ["struck early"], "off-then-on": ["blocked"], "held-blocks": ["blocked"] },
  },
  { quadrant: 1, name: "on one tick too late: off after S, on after S+4", toggles: [S, S + 4], prayerAtLandings: [null], verdicts: all("struck late") },
  { quadrant: 1, name: "off on the landing tick: off after S+3", toggles: [S + 3], prayerAtLandings: [null], verdicts: all("struck late") },
  { quadrant: 1, name: "held through", toggles: [], prayerAtLandings: ["melee"], verdicts: { "on-off-on": ["struck held"], "off-then-on": ["struck held"], "held-blocks": ["blocked"] } },
  {
    quadrant: 1,
    name: "off and on inside one interval: both after S+1",
    toggles: [S + 1, S + 1],
    prayerAtLandings: ["melee"],
    verdicts: { "on-off-on": ["struck held"], "off-then-on": ["struck held"], "held-blocks": ["blocked"] },
  },
  { quadrant: 2, name: "flick both: off after S and S+4, on after S+3 and S+6", toggles: [S, S + 3, S + 4, S + 6], prayerAtLandings: ["melee", "melee"], verdicts: all("blocked", "blocked") },
  { quadrant: 2, name: "second spin timed like the first: on after S+7", toggles: [S, S + 3, S + 4, S + 7], prayerAtLandings: ["melee", null], verdicts: all("blocked", "struck late") },
  {
    quadrant: 2,
    name: "held between the spins: off after S, on after S+3",
    toggles: [S, S + 3],
    prayerAtLandings: ["melee", "melee"],
    verdicts: { "on-off-on": ["blocked", "struck held"], "off-then-on": ["blocked", "struck held"], "held-blocks": ["blocked", "blocked"] },
  },
  { quadrant: 2, name: "tightest second spin: second off after S+5", toggles: [S, S + 3, S + 5, S + 6], prayerAtLandings: ["melee", "melee"], verdicts: all("blocked", "blocked") },
  {
    quadrant: 3,
    name: "flick all three: off after S, S+4 and S+7, on after S+3, S+6 and S+9",
    toggles: [S, S + 3, S + 4, S + 6, S + 7, S + 9],
    prayerAtLandings: ["melee", "melee", "melee"],
    verdicts: all("blocked", "blocked", "blocked"),
  },
  {
    quadrant: 3,
    name: "third held: the third pair left out",
    toggles: [S, S + 3, S + 4, S + 6],
    prayerAtLandings: ["melee", "melee", "melee"],
    verdicts: { "on-off-on": ["blocked", "blocked", "struck held"], "off-then-on": ["blocked", "blocked", "struck held"], "held-blocks": ["blocked", "blocked", "blocked"] },
  },
  {
    quadrant: 3,
    name: "third one tick late: third on after S+10",
    toggles: [S, S + 3, S + 4, S + 6, S + 7, S + 10],
    prayerAtLandings: ["melee", "melee", null],
    verdicts: all("blocked", "blocked", "struck late"),
  },
];

const said = (verdict: SpinVerdict): Said => (verdict.kind === "blocked" ? "blocked" : `struck ${verdict.why}`);

async function flickRun(quadrant: 1 | 2 | 3, toggles: readonly number[], flick?: Rule) {
  const drill = await startP3Drill({ seed: 1, invincible: true, start: quadrant === 1 ? undefined : quadrant, flick });
  drill.pray("Protect from Melee");
  for (const after of toggles) {
    drill.tickTo(after);
    drill.pray("Protect from Melee");
  }
  drill.tickTo(LANDINGS[quadrant][LANDINGS[quadrant].length - 1]);
  const spins = drill.events("player-hit").flatMap(({ at, hit, receipt }) => (hit.kind === "spin" ? [[at, hit.spin.nth, hit.spin.of, said(hit.verdict), receipt.requested, receipt.applied, receipt.prayer]] : []));
  drill.dispose();
  return spins;
}

const expectedSpins = ({ quadrant, prayerAtLandings, verdicts }: FlickCase, rule: Rule) =>
  LANDINGS[quadrant].map((at, k) => {
    const verdict = verdicts[rule][k];
    const requested = verdict === "blocked" ? 0 : MISSED_SPIN[at];
    return [at, k + 1, quadrant, verdict, requested, requested, prayerAtLandings[k]];
  });

describe("P3 smite flick", () => {
  test.each(CASES)("under the default on-off-on rule, quadrant $quadrant, $name", async (flickCase) => {
    expect(await flickRun(flickCase.quadrant, flickCase.toggles)).toEqual(expectedSpins(flickCase, "on-off-on"));
  });

  test.each(CASES.flatMap((flickCase) => (["off-then-on", "held-blocks"] as const).map((rule) => ({ rule, ...flickCase }))))(
    "under flick=$rule, quadrant $quadrant, $name",
    async ({ rule, ...flickCase }) => {
      expect(await flickRun(flickCase.quadrant, flickCase.toggles, rule)).toEqual(expectedSpins(flickCase, rule));
    },
  );

  test.each<Readonly<{ prayer: boolean; blow: HitReceipt }>>([
    { prayer: true, blow: { requested: 2, applied: 2, beforeHp: 89, afterHp: 87, prayer: "melee" } },
    { prayer: false, blow: { requested: 9, applied: 9, beforeHp: 58, afterHp: 49, prayer: null } },
  ])("the smite opens at 27 with a swing-like blow that Protect from Melee takes down to chip: prayer on $prayer", async ({ prayer, blow }) => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    if (prayer) drill.pray("Protect from Melee");
    drill.tickTo(S);
    const observed = {
      stages: drill.events("stage-entered").map((event) => [event.at, event.stage]),
      blows: drill.events("player-hit").flatMap(({ at, hit, receipt }) => (hit.kind === "smite-blow" ? [[at, receipt]] : [])),
    };
    drill.dispose();
    expect(observed).toEqual({ stages: [[0, "arrive"], [7, "autos"], [S, "smite-1"]], blows: [[S, blow]] });
  });

  test("the autos start again 3 ticks after the last spin: swings at 34, 37, 44 and 47 after quadrant 1's spin at 31", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(48);
    const observed = {
      stages: drill.events("stage-entered").map((event) => [event.at, event.stage]),
      swings: drill.events("player-hit").flatMap(({ at, hit }) => (hit.kind === "swing" && at > S ? [at] : [])),
    };
    drill.dispose();
    expect(observed).toEqual({ stages: [[0, "arrive"], [7, "autos"], [S, "smite-1"], [34, "autos"]], swings: [34, 37, 44, 47] });
  });

  test.each([
    {
      move: false,
      expected: {
        aimed: [[31, SPAWN, 36, 45]],
        avoided: [],
        rubble: [[36, 6], [37, 6], [38, 5], [39, 6], [40, 5], [41, 7], [42, 6], [43, 5], [44, 6], [45, 5]],
      },
    },
    { move: true, expected: { aimed: [[31, SPAWN, 36, 45]], avoided: [[36, SPAWN]], rubble: [] } },
  ])("rubble aimed at the player's tile on the first spin lands at 36 and hits 5 to 7 a tick through 45 unless the player moves off: moves after 31 $move", async ({ move, expected }) => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(31);
    if (move) await drill.click({ x: SPAWN.x - 1, y: SPAWN.y + 1 });
    drill.tickTo(47);
    const observed = {
      aimed: drill.events("rubble-aimed").map((event) => [event.at, event.tile, event.landsAt, event.until]),
      avoided: drill.events("hazard-avoided").map((event) => [event.at, event.tile]),
      rubble: drill.events("player-hit").flatMap(({ at, hit, receipt }) => (hit.kind === "rubble" ? [[at, receipt.requested]] : [])),
    };
    drill.dispose();
    expect(observed).toEqual(expected);
  });

  test.each([
    { start: 2, hp: 3937 },
    { start: 3, hp: 2625 },
  ])("start=$start opens the boss at ⌊5250 × the previous threshold⌋ = $hp", async ({ start, hp }) => {
    const drill = await startP3Drill({ seed: 1, start });
    drill.tickTo(0);
    const observed = drill.region.snapshot()?.boss.hp;
    drill.dispose();
    expect(observed).toBe(hp);
  });
});
