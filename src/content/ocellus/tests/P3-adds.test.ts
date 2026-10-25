import type { At } from "./drill";
import { startP3Drill } from "./p3drill";

/**
 * Quadrant 1's adds and hazards against RuneLite fight logs recorded on 2026-10-23, solo. P3 tick 0 is the tick he lands in
 * his corner. With nothing in the way, the first spin starts at 24, Untether at 53, the second spin at 110 and the third at 179.
 */
const SPAWN: At = { x: 19, y: 9 };
const P = 24;
const U = 53;

type Drill = Awaited<ReturnType<typeof startP3Drill>>;
const hitsOf = (drill: Drill, ...kinds: readonly string[]) => drill.events("player-hit").filter((event) => kinds.includes(event.hit.kind)).map((event) => [event.at, event.hit.kind] as const);
const shown = (drill: Drill) => drill.events("hazard-shown").map((event) => [event.at, event.hazard, event.tile, event.landsAt]);
const unitAt = (drill: Drill, name: string) => drill.region.mobs.filter((mob) => mob.mobName() === name).map((mob) => ({ x: mob.location.x, y: mob.location.y }));

describe("P3 adds and hazards", () => {
  test("void bombs show over the player 4 and 7 ticks after he lands and drop 2 later; each leaves a void that hits every 2 ticks", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(13);
    const observed = { shown: shown(drill), voids: drill.events("void-formed").map((event) => [event.at, event.tile]), hits: hitsOf(drill, "bomb", "void") };
    drill.dispose();
    expect(observed).toEqual({
      shown: [[4, "bomb", SPAWN, 6], [7, "bomb", SPAWN, 9]],
      voids: [[6, SPAWN]],
      hits: [[6, "bomb"], [8, "void"], [9, "bomb"], [10, "void"], [12, "void"]],
    });
  });

  test("a bomb misses a player who steps off its tile before it drops, and its void stays where it fell", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(4);
    drill.place({ x: SPAWN.x, y: SPAWN.y + 1 });
    drill.tickTo(7);
    drill.place({ x: SPAWN.x, y: SPAWN.y + 2 });
    drill.tickTo(12);
    const observed = { voids: drill.events("void-formed").map((event) => [event.at, event.tile]), hits: hitsOf(drill, "bomb", "void") };
    drill.dispose();
    expect(observed).toEqual({ voids: [[6, SPAWN], [9, { x: SPAWN.x, y: SPAWN.y + 1 }]], hits: [] });
  });

  test("rubble shows over the player 3 ticks into the spin and falls 5 later, missing a player who stepped off", async () => {
    const stayed = await startP3Drill({ seed: 1, invincible: true });
    stayed.tickTo(P + 9);
    const [shownStayed, hitStayed] = [shown(stayed).filter(([, hazard]) => hazard === "rubble"), hitsOf(stayed, "rubble")];
    stayed.dispose();
    const stepped = await startP3Drill({ seed: 1, invincible: true });
    stepped.tickTo(P + 7);
    stepped.place({ x: SPAWN.x - 1, y: SPAWN.y });
    stepped.tickTo(P + 9);
    const hitStepped = hitsOf(stepped, "rubble");
    stepped.dispose();
    expect({ shownStayed, hitStayed, hitStepped }).toEqual({ shownStayed: [[P + 3, "rubble", SPAWN, P + 8]], hitStayed: [[P + 8, "rubble"]], hitStepped: [] });
  });

  test("the vine: shouted with his first move after the first and third spins, it roots the player 3 ticks later and outlives Untether until they cut it", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(37);
    const rooted = { vines: unitAt(drill, "Void Vine"), frozen: drill.player().frozen > 0, target: drill.player().aggro?.mobName() ?? null };
    drill.tickTo(192);
    const vineShouts = drill.events("boss-shouted").filter((event) => event.text === "The void... will take you..." || event.text === "Await... the void...").map((event) => event.at);
    const observed = {
      vineShouts,
      rooted: drill.events("vine-rooted").map((event) => [event.at, event.tile]),
      cut: drill.events("vine-cut").map((event) => event.at),
      untether: drill.events("boss-shouted").filter((event) => event.text === "Untether...").map((event) => event.at),
    };
    drill.dispose();
    expect({ rooted, observed }).toEqual({
      rooted: { vines: [SPAWN], frozen: true, target: "Void Vine" },
      observed: { vineShouts: [33, 188], rooted: [[36, SPAWN], [191, SPAWN]], cut: [63], untether: [U] },
    });
  });

  test("a rooted player cannot walk until the vine dies", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(37);
    await drill.click({ x: SPAWN.x - 2, y: SPAWN.y });
    drill.tickTo(40);
    const where = { x: drill.player().location.x, y: drill.player().location.y };
    drill.dispose();
    expect(where).toEqual(SPAWN);
  });

  test("rifts: none before the first Untether, then one at U+32 and 48 later, one due in the third spin with his next move; a rift left alive detonates 30 ticks after it appears", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(232);
    const observed = {
      spawned: drill.events("rift-spawned").map((event) => event.at),
      detonated: drill.events("rift-detonated").map((event) => event.at),
      hits: drill.events("player-hit").filter((event) => event.hit.kind === "rift-detonation").map((event) => [event.at, event.receipt.requested >= 39 && event.receipt.requested <= 41]),
    };
    drill.dispose();
    expect(observed).toEqual({ spawned: [U + 32, U + 80, 188], detonated: [U + 62, U + 110, 218], hits: [[U + 62, true], [U + 110, true], [218, true]] });
  });

  test("a standard ranged attack kills a rift in one shot, and the kill resets the player's attack cooldown with the empower line", async () => {
    const drill = await startP3Drill({ seed: 1, invincible: true });
    drill.tickTo(U + 33);
    const [rift] = drill.events("rift-spawned");
    await drill.click(rift.tile);
    let delayOnKill: number | null = null;
    for (let t = U + 34; t <= U + 44 && delayOnKill === null; t++) {
      drill.tickTo(t);
      if (drill.events("rift-destroyed").length > 0) delayOnKill = drill.player().attackDelay;
    }
    const observed = {
      shots: drill.events("player-hit").length >= 0 ? drill.rows().flatMap((row) => row.inputs).length : 0,
      destroyed: drill.events("rift-destroyed").length,
      chat: drill.region.chat().filter((line) => line.startsWith("Destroying")),
      reset: delayOnKill !== null && delayOnKill <= 0,
    };
    drill.dispose();
    expect({ destroyed: observed.destroyed, chat: observed.chat, reset: observed.reset }).toEqual({ destroyed: 1, chat: ["Destroying the void rift empowers you!"], reset: true });
  });
});
