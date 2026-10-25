import { act } from "react";
import { clickTile } from "./drill";
import { captureNavigation, loadPage } from "./page";
import { footprintCentre } from "./p3drill";

const RESULT_POLL_WAIT_MS = 400;

const probe = () => {
  if (!window.__archiveOcellusProbe) throw new Error("the page exposed no probe");
  return window.__archiveOcellusProbe;
};

async function loadP3Page(url: string) {
  const { P3Region } = await vi.importActual<typeof import("../js/P3Region")>("../js/P3Region");
  const built = vi.spyOn(P3Region.prototype, "initialiseRegion");
  const page = loadPage(url);
  const region = built.mock.contexts.at(-1);
  built.mockRestore();
  if (!(region instanceof P3Region)) throw new Error("the page built no P3 region");
  return { page, region };
}

const clickIfShown = (id: string) => act(() => document.getElementById(id)?.click());

async function openP3Fight(url: string) {
  const { page, region } = await loadP3Page(url);
  await act(() => Promise.resolve());
  const tickTo = (t: number) => {
    for (let guard = 0; guard < 400; guard++) {
      const run = region.snapshot()?.run;
      if (run?.kind === "ended" || (run?.kind === "running" && run.tick >= t)) return;
      region.world.tickWorld();
    }
    throw new Error(`the run never reached P3 tick ${t}`);
  };
  const result = async () => {
    await act(() => new Promise((resolve) => setTimeout(resolve, RESULT_POLL_WAIT_MS)));
    const panel = document.querySelector("#run_result");
    if (!panel) return null;
    return {
      lines: [...panel.querySelectorAll("h2, p")].map((line) => line.textContent),
      buttons: [...panel.querySelectorAll("button")].map((button) => button.textContent),
    };
  };
  return { page, region, tickTo, clickBoss: () => {
      if (!region.primaryBoss) throw new Error("the region has no boss");
      return clickTile(region.world, footprintCentre(region.primaryBoss));
    }, result };
}

describe("P3 behind the ARCHIVE_P3 build flag", () => {
  beforeEach(() => localStorage.setItem("osrs-sdk:settings", JSON.stringify({ version: 1, values: { use3dView: false } })));
  afterEach(() => vi.unstubAllEnvs());

  test("guard: with the flag off, ?phase=p3 opens P4 at its entry HP, lists phase=p3 as rejected and draws no Phase box", () => {
    const page = loadPage("/?phase=p3&seed=1");
    const { fight, rejected } = probe().snapshot();
    const phaseBox = document.querySelector("#phase");
    page.close();
    expect({ bossHp: fight?.boss.hp, rejected, phaseBox }).toEqual({ bossHp: 1312, rejected: ["phase=p3"], phaseBox: null });
  });

  test("with the flag on, the quadrant falling at 75% shows the interim panel with the P3 time, and Repeat P3, Retry seed and Start P4 carry the setup", async () => {
    vi.stubEnv("ARCHIVE_P3", "on");
    const navigation = captureNavigation();
    const fight = await openP3Fight("/?phase=p3&seed=100&bosshp=3991");
    fight.tickTo(0);
    const whileRunning = await fight.result();
    await fight.clickBoss();
    fight.tickTo(6);
    const shown = await fight.result();
    ["result_restart", "result_retry", "result_start_p4"].forEach(clickIfShown);
    fight.page.close();
    navigation.restore();

    expect({ whileRunning, shown, navigation: navigation.assigned }).toEqual({
      whileRunning: null,
      shown: { lines: ["Quadrant 1 cleared (interim end)", "P3 time: 4 ticks (0:02.4)"], buttons: ["Repeat P3", "Retry seed", "Start P4"] },
      navigation: [
        "http://localhost/?phase=p3&bosshp=3991&setup=ranged",
        "http://localhost/?phase=p3&seed=100&bosshp=3991&setup=ranged",
        "http://localhost/?phase=p4&setup=ranged",
      ],
    });
  });

  test("with the flag on, Start P4's link opens P4 at its entry HP, and the Phase box shows the phase and reloads the other one with its defaults", () => {
    vi.stubEnv("ARCHIVE_P3", "on");
    const navigation = captureNavigation();
    const page = loadPage("/?phase=p4&setup=ranged&invincible=on");
    const { fight, rejected } = probe().snapshot();
    const phaseBox = page.element("phase");
    const shown = phaseBox instanceof HTMLSelectElement ? { value: phaseBox.value, options: [...phaseBox.options].map((option) => option.text) } : null;
    act(() => {
      if (phaseBox instanceof HTMLSelectElement) phaseBox.value = "p3";
      phaseBox.dispatchEvent(new Event("change", { bubbles: true }));
    });
    page.close();
    navigation.restore();

    expect({ bossHp: fight?.boss.hp, rejected, shown, navigation: navigation.assigned }).toEqual({
      bossHp: 1312,
      rejected: [],
      shown: { value: "p4", options: ["Phase 4", "Phase 3"] },
      navigation: ["http://localhost/?phase=p3&setup=ranged&invincible=on"],
    });
  });
});
