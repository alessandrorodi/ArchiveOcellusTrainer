import type { At } from "./drill";
import { footprintCentre, startP3Drill } from "./p3drill";

const loadTimings = () => vi.importActual<typeof import("../js/OcellusTimings")>("../js/OcellusTimings");

/**
 * Phase 3's first quadrant against RuneLite fight logs recorded on 2026-10-23. P3 tick 0 is the tick he lands in his corner
 * (S in the logs), so his moves sit on the logs' S-relative ticks.
 */
const FAR_EAST: At = { x: 27, y: 9 };
const CORNER = { x: 21, y: 7 };
const U = 53;
const P = 24;
const I = 139;

type Drill = Awaited<ReturnType<typeof startP3Drill>>;
const hitsOf = (drill: Drill, kind: string) => drill.events("player-hit").filter((event) => event.hit.kind === kind).map((event) => [event.at, event.receipt.prayer] as const);
/** The band he aimed on `at`, each tile as [east, south] of his middle tile. */
function bandFrom(drill: Drill, at: number): (readonly [number, number])[] {
  const aimed = drill.events("band-aimed").find((event) => event.at === at);
  if (!aimed) throw new Error(`no band aimed on P3 tick ${at}`);
  const { x, y } = drill.boss().location;
  return aimed.tiles.map((tile) => [tile.x - (x + 1), tile.y - (y - 1)] as const);
}
const has = (tiles: readonly (readonly [number, number])[], east: number, south: number) => tiles.some(([x, y]) => x === east && y === south);

describe("P3 drill", () => {
  test.each([
    { bossHp: 3991, expected: { ended: [[4, "quadrant-cleared"]], hpAfterShot: 3937, stageOnShot: "arrive", runAt6: "ended" } },
    { bossHp: 3992, expected: { ended: [], hpAfterShot: 3938, stageOnShot: "arrive", runAt6: "running" } },
  ])("the quadrant falls the tick after his HP reaches ⌊5250 × 0.75⌋ = 3937, which ends the run: bosshp=$bossHp, seed 100's first shot of 54 lands on P3 tick 3", async ({ bossHp, expected }) => {
    const drill = await startP3Drill({ seed: 100, bossHp });
    drill.tickTo(0);
    await drill.click(footprintCentre(drill.boss()));
    drill.tickTo(6);
    const shot = drill.row(3);
    const observed = {
      ended: drill.events("run-ended").map((event) => [event.at, event.reason.kind]),
      hpAfterShot: shot.bossHp.atPostTick,
      stageOnShot: shot.phase.stage,
      runAt6: drill.region.snapshot()?.run.kind,
    };
    drill.dispose();
    expect(observed).toEqual(expected);
  });

  test("quadrant 1 runs as the logs do: swings 4 and 7 after he lands, the slash at 10, the spin at 24, Untether at 53 and with the quadrant standing a swing at U+37", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(U + 38);
    const moves = drill.moves();
    drill.dispose();
    expect(moves).toEqual([
      [4, "swing"], [7, "swing"], [10, "shadow-slash"],
      [14, "swing"], [17, "swing"], [20, "shadow-slash"],
      [24, "spin"], [29, "last-saw"],
      [33, "swing"], [36, "swing"], [39, "shadow-slash"],
      [43, "swing"], [46, "swing"], [49, "shadow-slash"],
      [53, "untether"], [82, "slam"],
      [90, "swing"],
    ]);
  });

  test("the specials take turns as in every recorded quadrant 1: spin, Untether, spin, Insolence, spin, Untether", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(209);
    const specials = drill.moves().filter(([, move]) => move === "spin" || move === "untether");
    const insolence = drill.events("boss-shouted").filter((event) => event.text === "Insolence...").map((event) => event.at);
    drill.dispose();
    expect({ specials, insolence }).toEqual({ specials: [[24, "spin"], [53, "untether"], [110, "spin"], [179, "spin"], [208, "untether"]], insolence: [I] });
  });

  test.each([
    { prayer: "Protect from Melee" as const, hits: [[4, 2, "melee"], [7, 5, "melee"], [14, 4, "melee"], [17, 1, "melee"]] },
    { prayer: null, hits: [[4, 8, null], [7, 19, null], [14, 17, null], [17, 7, null]] },
  ])("a swing in reach is chip of 0 to 6 through Protect from Melee and up to 26 without it: $prayer", async ({ prayer, hits }) => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    if (prayer !== null) drill.pray(prayer);
    drill.tickTo(18);
    const swings = drill.events("player-hit").filter((event) => event.hit.kind === "swing").map((event) => [event.at, event.receipt.requested, event.receipt.prayer]);
    drill.dispose();
    expect(swings).toEqual(hits);
  });

  test("with nobody in reach as a swing comes, a panic shot takes its place, lands 2 ticks on as magic, and his next move comes 6 ticks after it", async () => {
    const drill = await startP3Drill({ seed: 1 });
    drill.pray("Protect from Magic");
    drill.tickTo(3);
    await drill.click(FAR_EAST);
    drill.tickTo(14);
    const observed = {
      moves: drill.moves(),
      shout: drill.events("boss-shouted").map((event) => [event.at, event.text]),
      panic: drill.events("player-hit").filter((event) => event.hit.kind === "panic").map((event) => [event.at, event.receipt.requested, event.receipt.prayer]),
      stage: drill.row(7).phase.stage,
    };
    drill.dispose();
    expect(observed).toEqual({ moves: [[4, "swing"], [7, "panic"], [13, "shadow-slash"]], shout: [[7, "Your panic... is futile..."]], panic: [[9, 0, "magic"]], stage: "panic" });
  });

  test("the shadow slash lands the tick after his animation, typeless, through Protect from Melee", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.pray("Protect from Melee");
    drill.tickTo(12);
    const slashes = hitsOf(drill, "shadow-slash");
    const aimed = drill.events("band-aimed").map((event) => [event.at, event.attack, event.landsAt]);
    drill.dispose();
    expect({ slashes, aimed }).toEqual({ slashes: [[11, "melee"]], aimed: [[10, "shadow-slash", 11]] });
  });

  describe("the shadow slash is 3 wide from the ring around his body, snapped to the nearest of 8 directions from his middle tile", () => {
    async function slashAt(east: number, south: number) {
      const drill = await startP3Drill({ seed: 1, invincible: true });
      drill.tickTo(9);
      const { x, y } = drill.boss().location;
      drill.place({ x: x + 1 + east, y: y - 1 + south });
      drill.tickTo(10);
      const band = bandFrom(drill, 10);
      drill.dispose();
      return band;
    }

    test("straight: the 3 tiles in line with his body, out to the wedge's edge", async () => {
      const south = await slashAt(0, 2);
      expect({ inLine: south.every(([east, s]) => Math.abs(east) <= 1 && s >= 2), first: [-1, 0, 1].every((east) => has(south, east, 2)) }).toEqual({ inLine: true, first: true });
    });

    test("diagonal: 2 east and 1 south of his middle snaps to south-east, 3 wide from his corner and outside his 3x3", async () => {
      const se = await slashAt(2, 1);
      expect({
        diagonal: se.every(([east, south]) => east >= 1 && south >= 1 && Math.abs(east - south) <= 1),
        fromCorner: has(se, 2, 2) && has(se, 2, 1) && has(se, 1, 2),
        outside: has(se, 1, 1) || has(se, 3, 1),
      }).toEqual({ diagonal: true, fromCorner: true, outside: false });
    });
  });

  describe("the spin: its saw cuts 5 ticks in, and an overhead up the tick before is severed", () => {
    test("Protect from Melee kept up: severed on P+4 with the game's chat, so the cut on P+5 hits", async () => {
      const drill = await startP3Drill({ seed: 1, invincible: true });
      drill.pray("Protect from Melee");
      drill.tickTo(P + 6);
      const observed = {
        severed: drill.events("prayer-severed").map((event) => [event.at, event.lockedFor]),
        saw: hitsOf(drill, "saw"),
        chat: drill.region.chat().filter((line) => !line.startsWith("Invincible")),
      };
      drill.dispose();
      expect(observed).toEqual({
        severed: [[P + 4, 3]],
        saw: [[P + 5, null]],
        chat: ["Ocellus disrupts your concentration, severing your prayer!", "You've been injured and can't use protection prayers!"],
      });
    });

    test("flicked, off for P+4 and back on for the cut: nothing severed and the cut is blocked", async () => {
      const drill = await startP3Drill({ seed: 1, invincible: true });
      drill.pray("Protect from Melee");
      drill.tickTo(P + 3);
      drill.pray("Protect from Melee");
      drill.tickTo(P + 4);
      drill.pray("Protect from Melee");
      drill.tickTo(P + 6);
      const observed = { severed: drill.events("prayer-severed").length, saw: drill.events("player-hit").filter((event) => event.hit.kind === "saw").map((event) => [event.at, event.receipt.applied, event.receipt.prayer]) };
      drill.dispose();
      expect(observed).toEqual({ severed: 0, saw: [[P + 5, 0, "melee"]] });
    });

    test("he stands through the spin and walks again after its last cut", async () => {
      const drill = await startP3Drill({ seed: 1, invincible: true });
      drill.tickTo(P + 6);
      const stances = [P - 1, P, P + 4, P + 5].map((t) => drill.row(t).phase.boss);
      drill.dispose();
      expect(stances).toEqual(["chasing", "standing", "standing", "chasing"]);
    });
  });

  describe("Untether: he rises in his corner; be under his 3x3 by U+28 and one tile out on U+29", () => {
    async function untether(plan: Readonly<Record<27 | 28 | 29, "under" | "out">>) {
      const drill = await startP3Drill({ seed: 1, invincible: true });
      drill.tickTo(U - 2);
      drill.pray("Protect from Magic");
      drill.tickTo(U + 26);
      const tiles = { under: { x: CORNER.x + 1, y: CORNER.y }, out: { x: CORNER.x + 1, y: CORNER.y + 1 } };
      for (const t of [27, 28, 29] as const) {
        drill.tickTo(U + t);
        drill.place(tiles[plan[t]]);
      }
      drill.tickTo(U + 31);
      const typeless = drill.events("player-hit").filter((event) => event.hit.kind === "untether-slam" || event.hit.kind === "untether-aftershock").map((event) => [event.at - U, event.hit.kind]);
      const magic = hitsOf(drill, "untether-magic").map(([at, prayer]) => [at - U, prayer]);
      const corner = { x: drill.boss().location.x, y: drill.boss().location.y };
      drill.dispose();
      return { typeless, magic, corner };
    }

    test("the magic lands 10, 14, 18 and 22 ticks in, blocked by Protect from Magic, and he hovers in the corner the logs put him in", async () => {
      const { magic, corner } = await untether({ 27: "under", 28: "under", 29: "out" });
      expect({ magic, corner }).toEqual({ magic: [[10, "magic"], [14, "magic"], [18, "magic"], [22, "magic"]], corner: CORNER });
    });

    test.each([
      { plan: { 27: "under", 28: "under", 29: "out" } as const, typeless: [] },
      { plan: { 27: "under", 28: "out", 29: "out" } as const, typeless: [[29, "untether-slam"]] },
      { plan: { 27: "under", 28: "under", 29: "under" } as const, typeless: [[30, "untether-aftershock"]] },
      { plan: { 27: "out", 28: "out", 29: "out" } as const, typeless: [[29, "untether-slam"]] },
    ])("ending U+27, U+28 and U+29 $plan.27, $plan.28 and $plan.29 takes $typeless", async ({ plan, typeless }) => {
      expect((await untether(plan)).typeless).toEqual(typeless);
    });
  });

  test("Insolence: superior slashes animate 2, 7 and 12 ticks after the shout and land 3 later, and his swings resume 20 after it", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(I + 21);
    const observed = {
      slashes: drill.moves().filter(([at, move]) => at >= I && move === "superior-slash").map(([at]) => at - I),
      landings: hitsOf(drill, "superior-slash").map(([at]) => at - I),
      next: drill.moves().find(([at, move]) => at > I && move === "swing")?.[0],
    };
    drill.dispose();
    expect(observed).toEqual({ slashes: [2, 7, 12], landings: [5, 10, 15], next: I + 20 });
  });

  describe("a quadrant falls the tick after his HP reaches its floor, whatever he is doing, except through Untether", () => {
    async function fallAfter(floorAt: number, until: number) {
      const drill = await startP3Drill({ seed: 1, invincible: true });
      drill.tickTo(floorAt);
      drill.bossHp(3937);
      drill.tickTo(until);
      const observed = { moves: drill.moves().filter(([at]) => at > floorAt - 4), ended: drill.events("run-ended").map((event) => [event.at, event.reason.kind]) };
      drill.dispose();
      return observed;
    }

    test("between the second swing and the slash: the slash never comes", async () => {
      expect(await fallAfter(8, 12)).toEqual({ moves: [[7, "swing"], [9, "quadrant-falls"]], ended: [[9, "quadrant-cleared"]] });
    });

    test("mid-spin: the rest of the spin goes with the quadrant", async () => {
      expect(await fallAfter(P + 2, P + 6)).toEqual({ moves: [[P, "spin"], [P + 3, "quadrant-falls"]], ended: [[P + 3, "quadrant-cleared"]] });
    });

    test("through Untether: it waits for U+31", async () => {
      expect(await fallAfter(U + 11, U + 32)).toEqual({ moves: [[U + 29, "slam"], [U + 31, "quadrant-falls"]], ended: [[U + 31, "quadrant-cleared"]] });
    });

    test("an attack already under way still lands", async () => {
      const drill = await startP3Drill({ seed: 1, invincible: true });
      drill.tickTo(10);
      drill.bossHp(3937);
      drill.tickTo(12);
      const observed = { slash: hitsOf(drill, "shadow-slash").map(([at]) => at), ended: drill.events("run-ended").map((event) => event.at) };
      drill.dispose();
      expect(observed).toEqual({ slash: [11], ended: [11] });
    });
  });

  test.each([
    { link: "?phase=p5&seed=1", expected: { phase: "p4", rejected: ["phase=p5"] } },
    { link: "?phase=p4&seed=1", expected: { phase: "p4", rejected: [] } },
    { link: "?phase=p3&seed=1&focus=void-floor", expected: { phase: "p3", rejected: ["focus=void-floor"] } },
  ])("with the P3 flag on, parseRequest opens $expected.phase for $link and rejects $expected.rejected", async ({ link, expected }) => {
    const { parseRequest } = await loadTimings();
    const request = parseRequest(new URL(`http://127.0.0.1:8002/${link}`), () => 99, { p3: true });
    expect({ phase: request.phase, rejected: request.rejected }).toEqual(expected);
  });
});
